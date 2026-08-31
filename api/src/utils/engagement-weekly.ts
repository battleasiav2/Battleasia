import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import { UserEngagementWeekly } from '../models/UserEngagementWeekly.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type WeeklyArenaChallengeSettings,
} from '../models/AppSettings.js';
import { getEngagementPeriodKey } from './engagement-period.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';
import { notifyClaimReady } from './engagement-notifications.js';

function normalizeTeamType(value?: string | null) {
  const raw = String(value || 'solo').trim().toLowerCase();
  if (raw === 'duo' || raw === 'squad') return raw;
  return 'solo';
}

function teamTypeMatches(configTeamType: string, matchTeamType?: string | null) {
  if (configTeamType === 'any') return true;
  return normalizeTeamType(matchTeamType) === configTeamType;
}

async function ensureWeeklyDoc(userId: Types.ObjectId | string, periodKey: string) {
  let doc = await UserEngagementWeekly.findOne({ userId, periodKey });
  if (!doc) {
    doc = await UserEngagementWeekly.create({
      userId,
      periodKey,
      winCount: 0,
      status: 'active',
    });
  }
  return doc;
}

async function getWeeklyLeaderboard(
  periodKey: string,
  limit: number,
  viewerId?: string
) {
  const rows = await UserEngagementWeekly.find({ periodKey, winCount: { $gt: 0 } })
    .sort({ winCount: -1, updatedAt: 1 })
    .limit(limit)
    .lean();

  const userIds = rows.map((row) => row.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select('username avatar')
    .lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const leaderboard = rows.map((row, index) => {
    const user = userMap.get(row.userId.toString());
    return {
      rank: index + 1,
      userId: row.userId.toString(),
      username: user?.username || 'Player',
      avatar: user?.avatar || '',
      winCount: row.winCount,
      isViewer: viewerId ? row.userId.toString() === viewerId : false,
    };
  });

  const viewerRank =
    viewerId && rows.some((row) => row.userId.toString() === viewerId)
      ? leaderboard.find((entry) => entry.userId === viewerId)?.rank ?? null
      : null;

  return { leaderboard, viewerRank };
}

function serializeWeeklyState(
  config: WeeklyArenaChallengeSettings,
  doc: InstanceType<typeof UserEngagementWeekly> | null,
  periodKey: string,
  leaderboardData: Awaited<ReturnType<typeof getWeeklyLeaderboard>>
) {
  const winCount = doc?.winCount ?? 0;
  const targetWins = config.targetWins;
  const status = doc?.status ?? 'active';

  return {
    enabled: true,
    periodKey,
    title: config.title,
    description: config.description,
    icon: config.icon,
    teamType: config.teamType,
    targetWins,
    bacAmount: config.bacAmount,
    winCount,
    progress: Math.min(winCount, targetWins),
    status,
    canClaim: status === 'completed',
    completedAt: doc?.completedAt ?? null,
    claimedAt: doc?.claimedAt ?? null,
    leaderboard: leaderboardData.leaderboard,
    viewerRank: leaderboardData.viewerRank,
  };
}

export async function bumpWeeklyArenaWin(
  userId: Types.ObjectId | string,
  payload: { won?: boolean; teamType?: string | null }
) {
  if (!payload.won) return;

  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.weeklyArenaChallenge;

  if (!settings.enabled || !config.enabled) return;
  if (!teamTypeMatches(config.teamType, payload.teamType)) return;

  const periodKey = getEngagementPeriodKey('weekly');
  const doc = await ensureWeeklyDoc(userId, periodKey);

  if (doc.status === 'claimed') return;

  const wasActive = doc.status === 'active';
  doc.winCount += 1;

  if (wasActive && doc.winCount >= config.targetWins) {
    doc.status = 'completed';
    doc.completedAt = new Date();
    notifyClaimReady({
      userId,
      kind: 'weekly',
      title: config.title,
      rewardAmount: config.bacAmount,
      entityId: periodKey,
    }).catch((error) => {
      console.error('engagement weekly notification failed:', error);
    });
  }

  await doc.save();
}

export async function syncUserWeeklyArena(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.weeklyArenaChallenge;

  if (!settings.enabled || !config.enabled) {
    return {
      enabled: false,
      periodKey: getEngagementPeriodKey('weekly'),
      leaderboard: [],
      viewerRank: null,
    };
  }

  const periodKey = getEngagementPeriodKey('weekly');
  const doc = await ensureWeeklyDoc(userId, periodKey);

  if (doc.status === 'active' && doc.winCount >= config.targetWins) {
    const wasActive = doc.status === 'active';
    doc.status = 'completed';
    doc.completedAt = doc.completedAt ?? new Date();
    await doc.save();

    if (wasActive) {
      notifyClaimReady({
        userId,
        kind: 'weekly',
        title: config.title,
        rewardAmount: config.bacAmount,
        entityId: periodKey,
      }).catch((error) => {
        console.error('engagement weekly sync notification failed:', error);
      });
    }
  }

  const leaderboardData = await getWeeklyLeaderboard(
    periodKey,
    config.leaderboardLimit,
    String(userId)
  );

  return serializeWeeklyState(config, doc, periodKey, leaderboardData);
}

export async function claimWeeklyArenaReward(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.weeklyArenaChallenge;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Weekly arena challenge is disabled' };
  }

  const rewardAmount = Math.max(Number(config.bacAmount) || 0, 0);
  if (rewardAmount <= 0) {
    return { ok: false as const, message: 'No reward configured' };
  }

  await syncUserWeeklyArena(userId);
  const periodKey = getEngagementPeriodKey('weekly');
  const doc = await UserEngagementWeekly.findOne({ userId, periodKey });

  if (!doc) {
    return { ok: false as const, message: 'Weekly progress not found' };
  }

  if (doc.status === 'claimed') {
    return { ok: false as const, message: 'Already claimed this week' };
  }

  if (doc.status !== 'completed') {
    return { ok: false as const, message: 'Weekly challenge is not complete yet' };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { ok: false as const, message: 'User not found' };
  }

  const balanceBefore = user.balance ?? 0;
  const balanceAfter = balanceBefore + rewardAmount;
  user.balance = balanceAfter;
  await user.save();

  await recordBalanceHistory({
    user,
    amount: rewardAmount,
    type: 'deposit',
    balanceBefore,
    balanceAfter,
    detail: {
      reason: 'engagement_weekly_reward',
      weeklyPeriodKey: periodKey,
      weeklyTitle: config.title,
      weeklyWinCount: doc.winCount,
    },
  });

  doc.status = 'claimed';
  doc.claimedAt = new Date();
  await doc.save();

  notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);

  const refreshed = await syncUserWeeklyArena(userId);

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter,
      weeklyArena: refreshed,
    },
  };
}
