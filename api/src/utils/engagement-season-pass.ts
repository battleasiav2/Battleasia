import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import { UserEngagementSeason } from '../models/UserEngagementSeason.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type SeasonPassSettings,
  type SeasonPassTier,
} from '../models/AppSettings.js';
import { isUserPremium } from './serialize.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

type TierTrackStatus = 'locked' | 'ready' | 'claimed' | 'plus_locked';

function isSeasonScheduleActive(config: SeasonPassSettings, now = new Date()) {
  if (config.startAt && new Date(config.startAt).getTime() > now.getTime()) return false;
  if (config.endAt && new Date(config.endAt).getTime() < now.getTime()) return false;
  return true;
}

async function ensureSeasonDoc(userId: Types.ObjectId | string, seasonKey: string) {
  let doc = await UserEngagementSeason.findOne({ userId, seasonKey });
  if (!doc) {
    doc = await UserEngagementSeason.create({
      userId,
      seasonKey,
      xp: 0,
      claimedFreeLevels: [],
      claimedPlusLevels: [],
    });
  }
  return doc;
}

function resolveTierStatus(
  tier: SeasonPassTier,
  xp: number,
  claimedLevels: number[],
  isPlus: boolean,
  track: 'free' | 'plus'
): TierTrackStatus {
  if (claimedLevels.includes(tier.level)) return 'claimed';
  if (xp < tier.xpRequired) return 'locked';
  if (track === 'plus' && !isPlus) return 'plus_locked';
  return 'ready';
}

function serializeTierRow(
  tier: SeasonPassTier,
  xp: number,
  claimedFreeLevels: number[],
  claimedPlusLevels: number[],
  isPlus: boolean
) {
  return {
    level: tier.level,
    xpRequired: tier.xpRequired,
    freeReward: tier.freeReward,
    plusReward: tier.plusReward,
    freeStatus: resolveTierStatus(tier, xp, claimedFreeLevels, isPlus, 'free'),
    plusStatus: resolveTierStatus(tier, xp, claimedPlusLevels, isPlus, 'plus'),
    canClaimFree: resolveTierStatus(tier, xp, claimedFreeLevels, isPlus, 'free') === 'ready',
    canClaimPlus: resolveTierStatus(tier, xp, claimedPlusLevels, isPlus, 'plus') === 'ready',
  };
}

function getNextTierXp(config: SeasonPassSettings, xp: number) {
  const next = config.tiers.find((tier) => xp < tier.xpRequired);
  return next?.xpRequired ?? config.tiers[config.tiers.length - 1]?.xpRequired ?? 0;
}

function getCurrentTierLevel(config: SeasonPassSettings, xp: number) {
  let current = 0;
  for (const tier of config.tiers) {
    if (xp >= tier.xpRequired) current = tier.level;
  }
  return current;
}

export async function bumpSeasonPassXp(
  userId: Types.ObjectId | string,
  payload: { join?: boolean; win?: boolean; missionClaim?: boolean }
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.seasonPass;

  if (!settings.enabled || !config.enabled || !isSeasonScheduleActive(config)) return;

  let amount = 0;
  if (payload.join) amount += Math.max(config.xpPerJoinMatch, 0);
  if (payload.win) amount += Math.max(config.xpPerWin, 0);
  if (payload.missionClaim) amount += Math.max(config.xpPerMissionClaim, 0);
  if (amount <= 0) return;

  const doc = await ensureSeasonDoc(userId, config.seasonKey);
  doc.xp += amount;
  await doc.save();
}

export async function syncUserSeasonPass(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.seasonPass;
  const now = new Date();
  const scheduleActive = isSeasonScheduleActive(config, now);

  if (!settings.enabled || !config.enabled) {
    return {
      enabled: false,
      seasonKey: config.seasonKey,
      active: false,
      tiers: [],
      xp: 0,
      isPlus: false,
      claimableCount: 0,
    };
  }

  const user = await User.findById(userId).select('isPremium premiumExpiresAt').lean();
  const isPlus = user ? isUserPremium(user as InstanceType<typeof User>) : false;
  const doc = await ensureSeasonDoc(userId, config.seasonKey);
  const tiers = config.tiers.map((tier) =>
    serializeTierRow(tier, doc.xp, doc.claimedFreeLevels, doc.claimedPlusLevels, isPlus)
  );
  const claimableCount = tiers.reduce(
    (sum, tier) => sum + (tier.canClaimFree ? 1 : 0) + (tier.canClaimPlus ? 1 : 0),
    0
  );
  const nextTierXp = getNextTierXp(config, doc.xp);
  const currentTier = getCurrentTierLevel(config, doc.xp);
  const maxTierXp = config.tiers[config.tiers.length - 1]?.xpRequired ?? 0;
  const progressTarget = nextTierXp > doc.xp ? nextTierXp : maxTierXp;
  const progressPct =
    progressTarget > 0 ? Math.min(Math.round((doc.xp / progressTarget) * 100), 100) : 100;

  return {
    enabled: true,
    seasonKey: config.seasonKey,
    title: config.title,
    description: config.description,
    icon: config.icon,
    active: scheduleActive,
    startAt: config.startAt,
    endAt: config.endAt,
    xp: doc.xp,
    currentTier,
    nextTierXp,
    progressPct,
    isPlus,
    tiers,
    claimableCount,
    xpPerJoinMatch: config.xpPerJoinMatch,
    xpPerWin: config.xpPerWin,
    xpPerMissionClaim: config.xpPerMissionClaim,
  };
}

export async function claimSeasonPassReward(
  userId: Types.ObjectId | string,
  level: number,
  track: 'free' | 'plus'
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.seasonPass;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Season pass is disabled' };
  }

  if (!isSeasonScheduleActive(config)) {
    return { ok: false as const, message: 'Season pass is not active right now' };
  }

  const tier = config.tiers.find((entry) => entry.level === level);
  if (!tier) {
    return { ok: false as const, message: 'Season tier not found' };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { ok: false as const, message: 'User not found' };
  }

  const isPlus = isUserPremium(user);
  if (track === 'plus' && !isPlus) {
    return { ok: false as const, message: 'Premium membership required for Plus rewards' };
  }

  const doc = await ensureSeasonDoc(userId, config.seasonKey);
  const claimedLevels = track === 'free' ? doc.claimedFreeLevels : doc.claimedPlusLevels;

  if (claimedLevels.includes(level)) {
    return { ok: false as const, message: 'Reward already claimed' };
  }

  if (doc.xp < tier.xpRequired) {
    return { ok: false as const, message: 'Not enough season XP yet' };
  }

  const reward = track === 'free' ? tier.freeReward : tier.plusReward;
  const rewardAmount = Math.max(Number(reward.bacAmount) || 0, 0);

  if (rewardAmount > 0) {
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
        reason: 'engagement_season_pass_reward',
        seasonKey: config.seasonKey,
        seasonTitle: config.title,
        seasonLevel: level,
        seasonTrack: track,
        seasonRewardLabel: reward.label,
      },
    });

    notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);
  }

  if (track === 'free') {
    doc.claimedFreeLevels = [...doc.claimedFreeLevels, level].sort((a, b) => a - b);
  } else {
    doc.claimedPlusLevels = [...doc.claimedPlusLevels, level].sort((a, b) => a - b);
  }
  await doc.save();

  const seasonPass = await syncUserSeasonPass(userId);

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter: user.balance ?? 0,
      seasonPass,
    },
  };
}
