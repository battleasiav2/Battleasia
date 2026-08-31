import type { Types } from 'mongoose';
import type { IEngagementMission } from '../models/EngagementMission.js';
import { User } from '../models/User.js';
import { EngagementMission } from '../models/EngagementMission.js';
import { UserEngagementProgress } from '../models/UserEngagementProgress.js';
import { getAppSettings, normalizeEngagementSettings } from '../models/AppSettings.js';
import { getEngagementPeriodKey, isMissionInSchedule } from './engagement-period.js';
import { getVisibleMissionIds } from './engagement-daily-pool.js';
import {
  serializeEngagementMission,
  serializeEngagementSettings,
  serializeUserEngagementProgress,
} from './engagement-serialize.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';
import { syncDailyStreak, serializeStreakState } from './engagement-streak.js';
import { syncUserWelcomeBonuses } from './engagement-welcome.js';
import { checkAndUnlockBadges } from './engagement-badges.js';
import { syncUserReferralMilestones } from './engagement-referral.js';
import { bumpWeeklyArenaWin, syncUserWeeklyArena } from './engagement-weekly.js';
import { bumpSquadChallengeWin, syncUserSquadChallenge } from './engagement-squad.js';
import {
  notifyMissionComplete,
  maybeNotifyStreakClaimReady,
} from './engagement-notifications.js';
import { awardMatchXp, awardMissionClaimXp, syncUserLevel } from './engagement-level.js';
import { syncUserShareToEarn } from './engagement-share.js';
import { syncDepositBonusDays } from './engagement-deposit-bonus.js';
import { syncUserLuckySpin } from './engagement-spin.js';
import { bumpSeasonPassXp, syncUserSeasonPass } from './engagement-season-pass.js';

type BumpOptions = {
  gameId?: string;
};

export async function ensureDefaultEngagementMissions() {
  const defaults = [
    {
      key: 'daily-login',
      title: 'Daily Login',
      description: 'Open BattleAsia today and claim your daily reward.',
      icon: 'solar:calendar-bold',
      type: 'daily' as const,
      action: 'daily_login' as const,
      targetCount: 1,
      reward: { bacAmount: 5, label: 'Daily login bonus' },
      inDailyPool: false,
      sortOrder: 1,
    },
    {
      key: 'join-one-match',
      title: 'Join a Match',
      description: 'Register for any tournament match today.',
      icon: 'solar:gamepad-bold',
      type: 'daily' as const,
      action: 'join_match' as const,
      targetCount: 1,
      reward: { bacAmount: 10, label: 'Match participation' },
      inDailyPool: true,
      sortOrder: 10,
    },
    {
      key: 'win-one-match',
      title: 'Win a Match',
      description: 'Finish in the winning placement in any match today.',
      icon: 'solar:cup-star-bold',
      type: 'daily' as const,
      action: 'win_match' as const,
      targetCount: 1,
      reward: { bacAmount: 20, label: 'Match victory' },
      inDailyPool: true,
      sortOrder: 11,
    },
    {
      key: 'get-3-kills',
      title: 'Get 3 Kills',
      description: 'Score at least 3 kills across your matches today.',
      icon: 'solar:target-bold',
      type: 'daily' as const,
      action: 'get_kills' as const,
      targetCount: 3,
      reward: { bacAmount: 15, label: 'Kill milestone' },
      inDailyPool: true,
      sortOrder: 12,
    },
    {
      key: 'join-two-matches',
      title: 'Play 2 Matches',
      description: 'Join two different tournament matches today.',
      icon: 'solar:users-group-rounded-bold',
      type: 'daily' as const,
      action: 'join_match' as const,
      targetCount: 2,
      reward: { bacAmount: 18, label: 'Active player bonus' },
      inDailyPool: true,
      sortOrder: 13,
    },
    {
      key: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add avatar, PUBG ID, and game server to your profile.',
      icon: 'solar:user-id-bold',
      type: 'one_time' as const,
      action: 'complete_profile' as const,
      targetCount: 1,
      reward: { bacAmount: 25, label: 'Profile completion' },
      inDailyPool: false,
      sortOrder: 20,
    },
  ];

  for (const item of defaults) {
    const existing = await EngagementMission.findOne({ key: item.key });
    if (!existing) {
      await EngagementMission.create(item);
    }
  }
}

async function evaluateProfileComplete(userId: Types.ObjectId | string) {
  const user = await User.findById(userId).select('avatar pubgId gameServer').lean();
  if (!user) return false;
  return Boolean(user.avatar && user.pubgId && user.gameServer);
}

function missionMatchesGame(mission: IEngagementMission, gameId?: string) {
  if (!mission.gameId) return true;
  if (!gameId) return true;
  return mission.gameId.toString() === gameId;
}

async function upsertMissionProgress(
  userId: Types.ObjectId | string,
  mission: IEngagementMission,
  increment: number,
  now: Date,
  resetHour: number
) {
  const periodKey = getEngagementPeriodKey(mission.type, now, resetHour);
  let progressDoc = await UserEngagementProgress.findOne({
    userId,
    missionId: mission._id,
    periodKey,
  });

  if (!progressDoc) {
    progressDoc = await UserEngagementProgress.create({
      userId,
      missionId: mission._id,
      missionKey: mission.key,
      status: 'active',
      progress: 0,
      target: mission.targetCount,
      periodKey,
    });
  }

  if (progressDoc.status !== 'active') return progressDoc;

  const previousProgress = progressDoc.progress;
  const nextProgress = Math.min(progressDoc.progress + increment, progressDoc.target);
  progressDoc.progress = nextProgress;

  const justCompleted = nextProgress >= progressDoc.target && previousProgress < progressDoc.target;

  if (nextProgress >= progressDoc.target) {
    progressDoc.status = 'completed';
    progressDoc.completedAt = now;
  }

  await progressDoc.save();

  if (justCompleted) {
    const rewardAmount = Math.max(Number(mission.reward?.bacAmount) || 0, 0);
    notifyMissionComplete({
      userId,
      missionTitle: mission.title,
      progressId: progressDoc._id.toString(),
      rewardAmount,
      periodKey,
    }).catch((error) => {
      console.error('engagement mission notification failed:', error);
    });
  }

  return progressDoc;
}

export async function bumpProgressForAction(
  userId: Types.ObjectId | string,
  action: string,
  increment = 1,
  options?: BumpOptions
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  if (!settings.enabled || increment <= 0) return;

  const now = new Date();
  const missions = await EngagementMission.find({ active: true, action }).sort({ sortOrder: 1 });
  if (!missions.length) return;

  const visibleDailyIds = getVisibleMissionIds(missions, settings, now);

  for (const mission of missions) {
    if (!isMissionInSchedule(mission.startsAt, mission.endsAt, now)) continue;
    if (!missionMatchesGame(mission, options?.gameId)) continue;

    if (mission.type === 'daily') {
      if (mission.action === 'daily_login') continue;
      if (!visibleDailyIds.has(mission._id.toString())) continue;
    }

    await upsertMissionProgress(userId, mission, increment, now, settings.dailyMissionsResetHour);
  }
}

export async function recordMatchEngagementProgress(
  userId: Types.ObjectId | string,
  payload: { kills?: number; won?: boolean; gameId?: string; teamType?: string | null; matchId?: string | null }
) {
  const tasks: Promise<void>[] = [];

  if (payload.kills && payload.kills > 0) {
    tasks.push(bumpProgressForAction(userId, 'get_kills', payload.kills, { gameId: payload.gameId }));
  }
  if (payload.won) {
    tasks.push(bumpProgressForAction(userId, 'win_match', 1, { gameId: payload.gameId }));
    tasks.push(
      bumpWeeklyArenaWin(userId, { won: payload.won, teamType: payload.teamType }).then(() => undefined)
    );
    tasks.push(
      bumpSquadChallengeWin(userId, {
        won: payload.won,
        teamType: payload.teamType,
        matchId: payload.matchId,
      }).then(() => undefined)
    );
    tasks.push(bumpSeasonPassXp(userId, { win: true }).then(() => undefined));
  }

  tasks.push(
    checkAndUnlockBadges(userId).then(() => undefined).catch((error) => {
      console.error('engagement badge unlock failed:', error);
    })
  );

  tasks.push(
    awardMatchXp(userId, { kills: payload.kills, won: payload.won })
      .then(() => undefined)
      .catch((error) => {
        console.error('engagement match xp failed:', error);
      })
  );

  await Promise.all(tasks);
}

export async function syncUserEngagement(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const resetHour = settings.dailyMissionsResetHour;

  if (!settings.enabled) {
    return {
      settings: serializeEngagementSettings(settings),
      streak: serializeStreakState(null, settings),
      welcome: { enabled: false, milestones: [] },
      referral: { enabled: false, referralCount: 0, tiers: [] },
      weeklyArena: { enabled: false, periodKey: getEngagementPeriodKey('weekly'), leaderboard: [], viewerRank: null },
      squadChallenge: { enabled: false, periodKey: getEngagementPeriodKey('weekly'), leaderboard: [], viewerRank: null, squad: null },
      level: { enabled: false, xp: 0, level: 1, xpIntoLevel: 0, xpToNext: 0, progressPct: 0, title: { level: 1, title: '', icon: '' }, nextTitle: null },
      shareToEarn: { enabled: false, bacAmount: 0, title: '', description: '', icon: '', cooldownHours: 0, claimedForMatch: false, claimedCount: 0 },
      depositBonusDays: { enabled: false, active: false, percent: 0, title: '', description: '', icon: '', minDeposit: 0, startAt: null, endAt: null },
      luckySpin: { enabled: false, title: '', description: '', dailyFreeSpins: 0, spinsUsed: 0, remaining: 0, periodKey: '', prizes: [], recent: [] },
      seasonPass: { enabled: false, seasonKey: '', active: false, tiers: [], xp: 0, isPlus: false, claimableCount: 0 },
      dailyMissions: { count: settings.dailyMissionsCount, resetHour, dateKey: getEngagementPeriodKey('daily', new Date(), resetHour) },
      missions: [],
    };
  }

  await ensureDefaultEngagementMissions();

  const now = new Date();
  const streak = await syncDailyStreak(userId, now);
  maybeNotifyStreakClaimReady(userId).catch((error) => {
    console.error('engagement streak notification failed:', error);
  });
  const welcome = await syncUserWelcomeBonuses(userId);
  const referral = await syncUserReferralMilestones(userId);
  const weeklyArena = await syncUserWeeklyArena(userId);
  const squadChallenge = await syncUserSquadChallenge(userId);
  const level = await syncUserLevel(userId);
  const shareToEarn = await syncUserShareToEarn(userId);
  const depositBonusDays = await syncDepositBonusDays();
  const luckySpin = await syncUserLuckySpin(userId);
  const seasonPass = await syncUserSeasonPass(userId);
  const missions = await EngagementMission.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 });
  const visibleMissionIds = getVisibleMissionIds(missions, settings, now);

  for (const mission of missions) {
    if (!visibleMissionIds.has(mission._id.toString())) continue;
    if (!isMissionInSchedule(mission.startsAt, mission.endsAt, now)) continue;

    const periodKey = getEngagementPeriodKey(mission.type, now, resetHour);
    let progressDoc = await UserEngagementProgress.findOne({
      userId,
      missionId: mission._id,
      periodKey,
    });

    if (!progressDoc) {
      progressDoc = await UserEngagementProgress.create({
        userId,
        missionId: mission._id,
        missionKey: mission.key,
        status: 'active',
        progress: 0,
        target: mission.targetCount,
        periodKey,
      });
    }

    if (mission.action === 'daily_login') {
      if (settings.streakEnabled) continue;
      if (progressDoc.status === 'active' && progressDoc.progress < 1) {
        progressDoc.progress = 1;
        if (progressDoc.progress >= progressDoc.target) {
          progressDoc.status = 'completed';
          progressDoc.completedAt = now;
          await progressDoc.save();
          notifyMissionComplete({
            userId,
            missionTitle: mission.title,
            progressId: progressDoc._id.toString(),
            rewardAmount: Math.max(Number(mission.reward?.bacAmount) || 0, 0),
            periodKey,
          }).catch((error) => {
            console.error('engagement daily login notification failed:', error);
          });
        } else {
          await progressDoc.save();
        }
      }
      continue;
    }

    if (mission.action === 'complete_profile') {
      if (settings.welcomeBonuses.enabled) continue;
      if (progressDoc.status === 'active') {
        const complete = await evaluateProfileComplete(userId);
        if (complete) {
          progressDoc.progress = progressDoc.target;
          progressDoc.status = 'completed';
          progressDoc.completedAt = now;
          await progressDoc.save();
          notifyMissionComplete({
            userId,
            missionTitle: mission.title,
            progressId: progressDoc._id.toString(),
            rewardAmount: Math.max(Number(mission.reward?.bacAmount) || 0, 0),
            periodKey,
          }).catch((error) => {
            console.error('engagement profile mission notification failed:', error);
          });
        }
      }
      continue;
    }
  }

  const progressRows = await UserEngagementProgress.find({
    userId,
    missionId: { $in: missions.map((mission) => mission._id) },
  }).sort({ updatedAt: -1 });

  const missionMap = new Map(missions.map((m) => [m._id.toString(), m]));

  const results = progressRows
    .map((row) => {
      const mission = missionMap.get(row.missionId.toString());
      if (!mission) return null;
      if (!visibleMissionIds.has(mission._id.toString())) return null;
      if (settings.streakEnabled && mission.action === 'daily_login') return null;
      if (settings.welcomeBonuses.enabled && mission.key === 'complete-profile') return null;
      const currentPeriod = getEngagementPeriodKey(mission.type, now, resetHour);
      if (row.periodKey !== currentPeriod && mission.type !== 'one_time') return null;
      if (row.status === 'claimed' && mission.type === 'daily') return null;
      return serializeUserEngagementProgress(row, serializeEngagementMission(mission));
    })
    .filter(Boolean)
    .sort((a, b) => (a!.mission?.sortOrder ?? 0) - (b!.mission?.sortOrder ?? 0));

  return {
    settings: serializeEngagementSettings(settings),
    streak,
    welcome,
    referral,
    weeklyArena,
    squadChallenge,
    level,
    shareToEarn,
    depositBonusDays,
    luckySpin,
    seasonPass,
    dailyMissions: {
      count: settings.dailyMissionsCount,
      resetHour,
      dateKey: getEngagementPeriodKey('daily', now, resetHour),
    },
    missions: results,
  };
}

export async function claimEngagementReward(userId: Types.ObjectId | string, progressId: string) {
  const progress = await UserEngagementProgress.findOne({ _id: progressId, userId });
  if (!progress) {
    return { ok: false as const, message: 'Mission progress not found' };
  }

  if (progress.status !== 'completed') {
    return { ok: false as const, message: 'Mission is not ready to claim' };
  }

  const mission = await EngagementMission.findById(progress.missionId);
  if (!mission || !mission.active) {
    return { ok: false as const, message: 'Mission is no longer active' };
  }

  const rewardAmount = Math.max(Number(mission.reward?.bacAmount) || 0, 0);
  if (rewardAmount <= 0) {
    return { ok: false as const, message: 'No reward configured for this mission' };
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
      reason: 'engagement_reward',
      missionId: mission._id.toString(),
      missionKey: mission.key,
      missionTitle: mission.title,
      progressId: progress._id.toString(),
    },
  });

  progress.status = 'claimed';
  progress.claimedAt = new Date();
  await progress.save();

  notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);

  awardMissionClaimXp(userId).catch((error) => {
    console.error('engagement mission claim xp failed:', error);
  });
  bumpSeasonPassXp(userId, { missionClaim: true }).catch((error) => {
    console.error('engagement season pass mission xp failed:', error);
  });

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter,
      progress: serializeUserEngagementProgress(progress, serializeEngagementMission(mission)),
    },
  };
}
