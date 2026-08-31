import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import {
  UserEngagementReferral,
  type ReferralTierKey,
  REFERRAL_TIER_KEYS,
} from '../models/UserEngagementReferral.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type ReferralTierConfig,
} from '../models/AppSettings.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';
import { notifyClaimReady } from './engagement-notifications.js';

const TIER_FIELD: Record<ReferralTierKey, 'tier5' | 'tier10' | 'tier25'> = {
  tier_5: 'tier5',
  tier_10: 'tier10',
  tier_25: 'tier25',
};

function getTierConfig(settings: ReturnType<typeof normalizeEngagementSettings>, key: ReferralTierKey) {
  return settings.referralMilestones.tiers[key];
}

export function serializeReferralTier(
  key: ReferralTierKey,
  config: ReferralTierConfig,
  state: { status: string; eligibleAt?: Date | null; claimedAt?: Date | null },
  referralCount: number
) {
  return {
    key,
    enabled: config.enabled !== false,
    title: config.title,
    description: config.description,
    icon: config.icon,
    threshold: config.threshold,
    bacAmount: config.bacAmount,
    status: state.status,
    eligibleAt: state.eligibleAt ?? null,
    claimedAt: state.claimedAt ?? null,
    canClaim: config.enabled !== false && state.status === 'ready',
    progress: Math.min(referralCount, config.threshold),
    current: referralCount,
  };
}

async function getReferralCount(userId: Types.ObjectId | string) {
  return User.countDocuments({ referredBy: userId });
}

async function ensureReferralDoc(userId: Types.ObjectId | string) {
  let doc = await UserEngagementReferral.findOne({ userId });
  if (!doc) {
    doc = await UserEngagementReferral.create({ userId });
  }
  return doc;
}

function markTierReady(
  doc: InstanceType<typeof UserEngagementReferral>,
  key: ReferralTierKey,
  now = new Date()
): boolean {
  const field = TIER_FIELD[key];
  const current = doc[field];
  if (current.status === 'claimed') return false;
  if (current.status === 'ready') return false;
  current.status = 'ready';
  current.eligibleAt = now;
  doc.markModified(field);
  return true;
}

export async function syncUserReferralMilestones(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.referralMilestones.enabled) {
    return { enabled: false, referralCount: 0, tiers: [] as ReturnType<typeof serializeReferralTier>[] };
  }

  const referralCount = await getReferralCount(userId);
  const doc = await ensureReferralDoc(userId);
  const now = new Date();

  const newlyReady: ReferralTierKey[] = [];

  for (const key of REFERRAL_TIER_KEYS) {
    const config = getTierConfig(settings, key);
    if (!config.enabled) continue;
    if (referralCount >= config.threshold && markTierReady(doc, key, now)) {
      newlyReady.push(key);
    }
  }

  await doc.save();

  for (const key of newlyReady) {
    const config = getTierConfig(settings, key);
    notifyClaimReady({
      userId,
      kind: 'referral',
      title: config.title,
      rewardAmount: config.bacAmount,
      entityId: key,
    }).catch((error) => {
      console.error('engagement referral notification failed:', error);
    });
  }

  const tiers = REFERRAL_TIER_KEYS.map((key) => {
    const config = getTierConfig(settings, key);
    const field = TIER_FIELD[key];
    return serializeReferralTier(key, config, doc[field], referralCount);
  }).filter((item) => item.enabled);

  return {
    enabled: true,
    referralCount,
    tiers,
  };
}

export async function claimReferralMilestone(userId: Types.ObjectId | string, rawKey: string) {
  if (!REFERRAL_TIER_KEYS.includes(rawKey as ReferralTierKey)) {
    return { ok: false as const, message: 'Invalid referral tier' };
  }

  const key = rawKey as ReferralTierKey;
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.referralMilestones.enabled) {
    return { ok: false as const, message: 'Referral milestones are disabled' };
  }

  const config = getTierConfig(settings, key);
  if (!config.enabled) {
    return { ok: false as const, message: 'This referral tier is disabled' };
  }

  const rewardAmount = Math.max(Number(config.bacAmount) || 0, 0);
  if (rewardAmount <= 0) {
    return { ok: false as const, message: 'No reward configured' };
  }

  await syncUserReferralMilestones(userId);

  const refreshed = await UserEngagementReferral.findOne({ userId });
  if (!refreshed) {
    return { ok: false as const, message: 'Referral progress not found' };
  }

  const field = TIER_FIELD[key];
  const state = refreshed[field];

  if (state.status === 'claimed') {
    return { ok: false as const, message: 'Already claimed' };
  }

  if (state.status !== 'ready') {
    return { ok: false as const, message: 'Tier is not ready to claim yet' };
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
      reason: 'engagement_referral_reward',
      referralTierKey: key,
      referralTierTitle: config.title,
      referralThreshold: config.threshold,
    },
  });

  state.status = 'claimed';
  state.claimedAt = new Date();
  refreshed.markModified(field);
  await refreshed.save();

  notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);

  const referral = await syncUserReferralMilestones(userId);

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter,
      referral,
    },
  };
}

export async function touchReferrerMilestones(referrerId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  if (!settings.enabled || !settings.referralMilestones.enabled) return;
  await syncUserReferralMilestones(referrerId);
}
