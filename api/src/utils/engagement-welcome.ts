import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { DepositHistory } from '../models/DepositHistory.js';
import {
  UserEngagementWelcome,
  type WelcomeMilestoneKey,
  WELCOME_MILESTONE_KEYS,
} from '../models/UserEngagementWelcome.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type WelcomeMilestoneConfig,
} from '../models/AppSettings.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';
import { notifyClaimReady } from './engagement-notifications.js';

const MILESTONE_FIELD: Record<
  WelcomeMilestoneKey,
  'signup' | 'firstMatch' | 'completeProfile' | 'firstDeposit'
> = {
  signup: 'signup',
  first_match: 'firstMatch',
  complete_profile: 'completeProfile',
  first_deposit: 'firstDeposit',
};

function getMilestoneConfig(settings: ReturnType<typeof normalizeEngagementSettings>, key: WelcomeMilestoneKey) {
  return settings.welcomeBonuses.milestones[key];
}

export function serializeWelcomeMilestone(
  key: WelcomeMilestoneKey,
  config: WelcomeMilestoneConfig,
  state: { status: string; eligibleAt?: Date | null; claimedAt?: Date | null }
) {
  return {
    key,
    enabled: config.enabled !== false,
    title: config.title,
    description: config.description,
    icon: config.icon,
    bacAmount: config.bacAmount,
    status: state.status,
    eligibleAt: state.eligibleAt ?? null,
    claimedAt: state.claimedAt ?? null,
    canClaim: config.enabled !== false && state.status === 'ready',
  };
}

async function evaluateProfileComplete(userId: Types.ObjectId | string) {
  const user = await User.findById(userId).select('avatar pubgId gameServer').lean();
  if (!user) return false;
  return Boolean(user.avatar && user.pubgId && user.gameServer);
}

async function evaluateSignupEligible(userId: Types.ObjectId | string) {
  const user = await User.findById(userId).select('emailVerified').lean();
  return Boolean(user?.emailVerified);
}

async function evaluateFirstMatchEligible(userId: Types.ObjectId | string) {
  const count = await MatchParticipant.countDocuments({ userId });
  return count >= 1;
}

async function evaluateFirstDepositEligible(userId: Types.ObjectId | string) {
  const count = await DepositHistory.countDocuments({ userId, status: 'completed' });
  return count >= 1;
}

async function ensureWelcomeDoc(userId: Types.ObjectId | string) {
  let doc = await UserEngagementWelcome.findOne({ userId });
  if (!doc) {
    doc = await UserEngagementWelcome.create({ userId });
  }
  return doc;
}

function markMilestoneReady(
  doc: InstanceType<typeof UserEngagementWelcome>,
  key: WelcomeMilestoneKey,
  now = new Date()
): boolean {
  const field = MILESTONE_FIELD[key];
  const current = doc[field];
  if (current.status === 'claimed') return false;
  if (current.status === 'ready') return false;
  current.status = 'ready';
  current.eligibleAt = now;
  doc.markModified(field);
  return true;
}

export async function syncUserWelcomeBonuses(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.welcomeBonuses.enabled) {
    return { enabled: false, milestones: [] as ReturnType<typeof serializeWelcomeMilestone>[] };
  }

  const doc = await ensureWelcomeDoc(userId);
  const now = new Date();

  const [signupOk, firstMatchOk, profileOk, depositOk] = await Promise.all([
    evaluateSignupEligible(userId),
    evaluateFirstMatchEligible(userId),
    evaluateProfileComplete(userId),
    evaluateFirstDepositEligible(userId),
  ]);

  const newlyReady: WelcomeMilestoneKey[] = [];

  if (signupOk && markMilestoneReady(doc, 'signup', now)) newlyReady.push('signup');
  if (firstMatchOk && markMilestoneReady(doc, 'first_match', now)) newlyReady.push('first_match');
  if (profileOk && markMilestoneReady(doc, 'complete_profile', now)) newlyReady.push('complete_profile');
  if (depositOk && markMilestoneReady(doc, 'first_deposit', now)) newlyReady.push('first_deposit');

  await doc.save();

  for (const key of newlyReady) {
    const config = getMilestoneConfig(settings, key);
    notifyClaimReady({
      userId,
      kind: 'welcome',
      title: config.title,
      rewardAmount: config.bacAmount,
      entityId: key,
    }).catch((error) => {
      console.error('engagement welcome notification failed:', error);
    });
  }

  const milestones = WELCOME_MILESTONE_KEYS.map((key) => {
    const config = getMilestoneConfig(settings, key);
    const field = MILESTONE_FIELD[key];
    return serializeWelcomeMilestone(key, config, doc[field]);
  }).filter((item) => item.enabled);

  return {
    enabled: true,
    milestones,
  };
}

export async function claimWelcomeBonus(userId: Types.ObjectId | string, rawKey: string) {
  if (!WELCOME_MILESTONE_KEYS.includes(rawKey as WelcomeMilestoneKey)) {
    return { ok: false as const, message: 'Invalid welcome milestone' };
  }

  const key = rawKey as WelcomeMilestoneKey;
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.welcomeBonuses.enabled) {
    return { ok: false as const, message: 'Welcome bonuses are disabled' };
  }

  const config = getMilestoneConfig(settings, key);
  if (!config.enabled) {
    return { ok: false as const, message: 'This welcome bonus is disabled' };
  }

  const rewardAmount = Math.max(Number(config.bacAmount) || 0, 0);
  if (rewardAmount <= 0) {
    return { ok: false as const, message: 'No reward configured' };
  }

  const doc = await ensureWelcomeDoc(userId);
  await syncUserWelcomeBonuses(userId);

  const refreshed = await UserEngagementWelcome.findOne({ userId });
  if (!refreshed) {
    return { ok: false as const, message: 'Welcome progress not found' };
  }

  const field = MILESTONE_FIELD[key];
  const state = refreshed[field];

  if (state.status === 'claimed') {
    return { ok: false as const, message: 'Already claimed' };
  }

  if (state.status !== 'ready') {
    return { ok: false as const, message: 'Milestone is not ready to claim yet' };
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
      reason: 'engagement_welcome_reward',
      welcomeKey: key,
      welcomeTitle: config.title,
    },
  });

  state.status = 'claimed';
  state.claimedAt = new Date();
  refreshed.markModified(field);
  await refreshed.save();

  notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);

  const welcome = await syncUserWelcomeBonuses(userId);

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter,
      welcome,
    },
  };
}

export async function touchWelcomeEligibility(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  if (!settings.enabled || !settings.welcomeBonuses.enabled) return;
  await syncUserWelcomeBonuses(userId);
}
