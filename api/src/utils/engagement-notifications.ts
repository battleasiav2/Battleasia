import type { Types } from 'mongoose';
import { Notification } from '../models/Notification.js';
import { UserEngagementStreak } from '../models/UserEngagementStreak.js';
import { getAppSettings, normalizeEngagementSettings } from '../models/AppSettings.js';
import { getBdDateKey, getBdYesterdayKey, getHoursUntilBdReset } from './engagement-period.js';
import { createSystemNotification } from './payment-notifications.js';

const ENGAGEMENT_CATEGORY = 'Engagement';
const DEDUP_HOURS = 24;

async function isSmartNotificationsEnabled() {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  return settings.enabled && settings.smartNotificationsEnabled !== false;
}

async function hasRecentNotification(userId: string, type: string, entityId: string) {
  const since = new Date(Date.now() - DEDUP_HOURS * 60 * 60 * 1000);
  const count = await Notification.countDocuments({
    recipientId: userId,
    type,
    entityId,
    createdAt: { $gte: since },
  });
  return count > 0;
}

async function sendEngagementNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  entityId: string;
}) {
  if (!(await isSmartNotificationsEnabled())) return null;
  if (await hasRecentNotification(params.userId, params.type, params.entityId)) return null;

  return createSystemNotification({
    recipientId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    category: ENGAGEMENT_CATEGORY,
    entityType: 'engagement',
    entityId: params.entityId,
  });
}

export async function notifyMissionComplete(params: {
  userId: Types.ObjectId | string;
  missionTitle: string;
  progressId: string;
  rewardAmount: number;
  periodKey: string;
}) {
  const userId = String(params.userId);
  return sendEngagementNotification({
    userId,
    type: 'engagement_mission_complete',
    entityId: `mission:${params.progressId}`,
    title: 'Mission complete',
    message: `<p><strong>${params.missionTitle}</strong> is ready to claim. Earn <strong>${params.rewardAmount} BAC</strong> in Wallet → Earn.</p>`,
  });
}

export async function notifyClaimReady(params: {
  userId: Types.ObjectId | string;
  kind: 'streak' | 'weekly' | 'welcome' | 'referral' | 'mission' | 'squad';
  title: string;
  rewardAmount: number;
  entityId: string;
}) {
  const userId = String(params.userId);
  const kindLabel =
    params.kind === 'streak'
      ? 'Daily streak'
      : params.kind === 'weekly'
        ? 'Weekly arena'
        : params.kind === 'welcome'
          ? 'Welcome bonus'
          : params.kind === 'referral'
            ? 'Referral milestone'
            : params.kind === 'squad'
              ? 'Squad challenge'
              : 'Mission reward';

  return sendEngagementNotification({
    userId,
    type: 'engagement_claim_ready',
    entityId: `${params.kind}:${params.entityId}`,
    title: `${kindLabel} ready`,
    message: `<p><strong>${params.title}</strong> is ready to claim. Collect <strong>${params.rewardAmount} BAC</strong> in Wallet → Earn.</p>`,
  });
}

export async function notifyBadgeUnlocked(params: {
  userId: Types.ObjectId | string;
  badgeTitle: string;
  badgeKey: string;
}) {
  const userId = String(params.userId);
  return sendEngagementNotification({
    userId,
    type: 'engagement_badge_unlocked',
    entityId: `badge:${params.badgeKey}`,
    title: 'Badge unlocked',
    message: `<p>You unlocked the <strong>${params.badgeTitle}</strong> badge. View it on your profile.</p>`,
  });
}

export async function notifyStreakAtRisk(params: {
  userId: Types.ObjectId | string;
  currentStreak: number;
  hoursLeft: number;
  dateKey: string;
}) {
  const userId = String(params.userId);
  const hoursLabel = Math.max(1, Math.ceil(params.hoursLeft));

  return sendEngagementNotification({
    userId,
    type: 'engagement_streak_at_risk',
    entityId: `streak-risk:${params.dateKey}`,
    title: 'Streak at risk',
    message: `<p>Your <strong>${params.currentStreak}-day streak</strong> resets in about <strong>${hoursLabel} hour${hoursLabel === 1 ? '' : 's'}</strong>. Open Wallet → Earn to keep it alive.</p>`,
  });
}

export async function maybeNotifyStreakClaimReady(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  if (!settings.enabled || !settings.streakEnabled) return null;

  const todayKey = getBdDateKey(new Date(), settings.dailyMissionsResetHour);
  const streak = await UserEngagementStreak.findOne({ userId });
  if (!streak || streak.lastCheckInDate !== todayKey || streak.lastClaimDate === todayKey) {
    return null;
  }

  const base = Math.max(settings.dailyLoginReward, 0);
  const bonusSteps = Math.max(streak.currentStreak - 1, 0);
  const streakBonus = Math.min(
    bonusSteps * Math.max(settings.streakBonusPerDay, 0),
    Math.max(settings.maxStreakBonus, 0)
  );
  const totalReward = base + streakBonus;
  if (totalReward <= 0) return null;

  return notifyClaimReady({
    userId,
    kind: 'streak',
    title: `${streak.currentStreak}-day streak reward`,
    rewardAmount: totalReward,
    entityId: todayKey,
  });
}

export async function scanEngagementAlerts(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || settings.smartNotificationsEnabled === false) {
    return { sent: 0 };
  }

  let sent = 0;
  const now = new Date();
  const todayKey = getBdDateKey(now, settings.dailyMissionsResetHour);
  const yesterdayKey = getBdYesterdayKey(now, settings.dailyMissionsResetHour);

  if (settings.streakEnabled) {
    const streak = await UserEngagementStreak.findOne({ userId });
    if (
      streak &&
      streak.currentStreak >= 2 &&
      streak.lastCheckInDate === yesterdayKey &&
      streak.lastCheckInDate !== todayKey
    ) {
      const hoursLeft = getHoursUntilBdReset(now, settings.dailyMissionsResetHour);
      const threshold = Math.min(Math.max(settings.streakAtRiskHoursBeforeReset, 1), 12);

      if (hoursLeft <= threshold) {
        const result = await notifyStreakAtRisk({
          userId,
          currentStreak: streak.currentStreak,
          hoursLeft,
          dateKey: todayKey,
        });
        if (result) sent += 1;
      }
    }
  }

  return { sent };
}
