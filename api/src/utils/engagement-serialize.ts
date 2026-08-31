import type { IEngagementMission } from '../models/EngagementMission.js';
import type { IUserEngagementProgress } from '../models/UserEngagementProgress.js';
import type { IEngagementBadge } from '../models/EngagementBadge.js';
import type { EngagementSettings } from '../models/AppSettings.js';

export function serializeEngagementMission(mission: IEngagementMission) {
  const reward = mission.reward && typeof mission.reward === 'object' ? mission.reward : { bacAmount: 0 };

  return {
    _id: mission._id.toString(),
    id: mission._id.toString(),
    key: mission.key,
    title: mission.title,
    description: mission.description || '',
    icon: mission.icon || 'solar:gift-bold',
    type: mission.type,
    action: mission.action,
    targetCount: mission.targetCount,
    reward: {
      bacAmount: Number(reward.bacAmount) || 0,
      label: reward.label || '',
    },
    active: mission.active !== false,
    inDailyPool: mission.inDailyPool !== false,
    sortOrder: mission.sortOrder ?? 0,
    startsAt: mission.startsAt ?? null,
    endsAt: mission.endsAt ?? null,
    gameId: mission.gameId?.toString() || null,
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
  };
}

export function serializeEngagementBadge(badge: IEngagementBadge) {
  return {
    _id: badge._id.toString(),
    id: badge._id.toString(),
    key: badge.key,
    title: badge.title,
    description: badge.description || '',
    icon: badge.icon || 'solar:medal-ribbons-star-bold',
    criteria: badge.criteria,
    threshold: badge.threshold,
    tier: badge.tier ?? 1,
    active: badge.active !== false,
    sortOrder: badge.sortOrder ?? 0,
    gameId: badge.gameId?.toString() || null,
    createdAt: badge.createdAt,
    updatedAt: badge.updatedAt,
  };
}

export function serializeUserEngagementProgress(
  progress: IUserEngagementProgress,
  mission?: ReturnType<typeof serializeEngagementMission>
) {
  return {
    _id: progress._id.toString(),
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    missionId: progress.missionId.toString(),
    missionKey: progress.missionKey,
    status: progress.status,
    progress: progress.progress,
    target: progress.target,
    periodKey: progress.periodKey,
    completedAt: progress.completedAt ?? null,
    claimedAt: progress.claimedAt ?? null,
    mission: mission || null,
    createdAt: progress.createdAt,
    updatedAt: progress.updatedAt,
  };
}

export function serializeEngagementSettings(settings: EngagementSettings) {
  return {
    enabled: settings.enabled !== false,
    streakEnabled: settings.streakEnabled !== false,
    dailyMissionsEnabled: settings.dailyMissionsEnabled !== false,
    dailyMissionsCount: settings.dailyMissionsCount,
    dailyMissionsResetHour: settings.dailyMissionsResetHour,
    dailyLoginReward: settings.dailyLoginReward,
    streakBonusPerDay: settings.streakBonusPerDay,
    maxStreakBonus: settings.maxStreakBonus,
    welcomeBonus: settings.welcomeBonus,
    firstMatchBonus: settings.firstMatchBonus,
    welcomeBonuses: settings.welcomeBonuses,
    badgesEnabled: settings.badgesEnabled !== false,
    referralMilestones: settings.referralMilestones,
    weeklyArenaChallenge: settings.weeklyArenaChallenge,
    squadChallenge: settings.squadChallenge,
    levelSystem: settings.levelSystem,
    shareToEarn: settings.shareToEarn,
    depositBonusDays: settings.depositBonusDays,
    luckySpin: settings.luckySpin,
    seasonPass: settings.seasonPass,
    smartNotificationsEnabled: settings.smartNotificationsEnabled !== false,
    streakAtRiskHoursBeforeReset: settings.streakAtRiskHoursBeforeReset,
    earnTabTitle: settings.earnTabTitle,
    earnTabSubtitle: settings.earnTabSubtitle,
  };
}
