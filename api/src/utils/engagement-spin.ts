import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import { UserEngagementSpin } from '../models/UserEngagementSpin.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type LuckySpinPrize,
  type LuckySpinSettings,
} from '../models/AppSettings.js';
import { getBdDateKey } from './engagement-period.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

export type LuckySpinPrizePublic = LuckySpinPrize & {
  probability: number;
};

function sumWeights(prizes: LuckySpinPrize[]) {
  return prizes.reduce((sum, prize) => sum + Math.max(Number(prize.weight) || 0, 0), 0);
}

export function withPrizeProbabilities(prizes: LuckySpinPrize[]): LuckySpinPrizePublic[] {
  const total = sumWeights(prizes) || 1;
  return prizes.map((prize) => ({
    ...prize,
    probability: Math.round(((Math.max(prize.weight, 0) / total) * 10000)) / 100,
  }));
}

export function pickWeightedPrize(prizes: LuckySpinPrize[]): { prize: LuckySpinPrize; index: number } {
  const total = sumWeights(prizes);
  if (total <= 0 || !prizes.length) {
    return { prize: prizes[0], index: 0 };
  }

  let roll = Math.random() * total;
  for (let i = 0; i < prizes.length; i += 1) {
    roll -= Math.max(prizes[i].weight, 0);
    if (roll <= 0) {
      return { prize: prizes[i], index: i };
    }
  }

  const last = prizes.length - 1;
  return { prize: prizes[last], index: last };
}

export async function syncUserLuckySpin(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.luckySpin;

  if (!settings.enabled || !config.enabled) {
    return {
      enabled: false,
      title: '',
      description: '',
      dailyFreeSpins: 0,
      spinsUsed: 0,
      remaining: 0,
      periodKey: '',
      prizes: [] as LuckySpinPrizePublic[],
      recent: [] as ReturnType<typeof serializeSpinResult>[],
    };
  }

  const periodKey = getBdDateKey(new Date(), settings.dailyMissionsResetHour);
  const spinsUsed = await UserEngagementSpin.countDocuments({ userId, periodKey });
  const remaining = Math.max(config.dailyFreeSpins - spinsUsed, 0);
  const recentRows = await UserEngagementSpin.find({ userId })
    .sort({ spunAt: -1 })
    .limit(5)
    .lean();

  return {
    enabled: true,
    title: config.title,
    description: config.description,
    dailyFreeSpins: config.dailyFreeSpins,
    spinsUsed,
    remaining,
    periodKey,
    prizes: withPrizeProbabilities(config.prizes),
    recent: recentRows.map(serializeSpinResult),
  };
}

function serializeSpinResult(row: {
  prizeId: string;
  prizeLabel: string;
  bacAmount: number;
  weight: number;
  probability: number;
  spunAt: Date;
  periodKey: string;
}) {
  return {
    prizeId: row.prizeId,
    prizeLabel: row.prizeLabel,
    bacAmount: row.bacAmount,
    weight: row.weight,
    probability: row.probability,
    spunAt: row.spunAt,
    periodKey: row.periodKey,
  };
}

export async function performLuckySpin(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.luckySpin;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Lucky spin is disabled' };
  }

  if (!config.prizes.length) {
    return { ok: false as const, message: 'No prizes configured' };
  }

  const periodKey = getBdDateKey(new Date(), settings.dailyMissionsResetHour);
  const spinsUsed = await UserEngagementSpin.countDocuments({ userId, periodKey });
  if (spinsUsed >= config.dailyFreeSpins) {
    return { ok: false as const, message: 'No free spins remaining today' };
  }

  const prizesWithOdds = withPrizeProbabilities(config.prizes);
  const { prize, index } = pickWeightedPrize(config.prizes);
  const publicPrize = prizesWithOdds[index] || prizesWithOdds[0];
  const now = new Date();

  const spinDoc = await UserEngagementSpin.create({
    userId,
    periodKey,
    prizeId: prize.id,
    prizeLabel: prize.label,
    bacAmount: prize.bacAmount,
    weight: prize.weight,
    probability: publicPrize.probability,
    spunAt: now,
  });

  let balanceAfter: number | undefined;
  const rewardAmount = Math.max(Number(prize.bacAmount) || 0, 0);

  if (rewardAmount > 0) {
    const user = await User.findById(userId);
    if (!user) {
      await UserEngagementSpin.deleteOne({ _id: spinDoc._id });
      return { ok: false as const, message: 'User not found' };
    }

    const balanceBefore = user.balance ?? 0;
    balanceAfter = balanceBefore + rewardAmount;
    user.balance = balanceAfter;
    await user.save();

    await recordBalanceHistory({
      user,
      amount: rewardAmount,
      type: 'deposit',
      balanceBefore,
      balanceAfter,
      detail: {
        reason: 'engagement_spin_reward',
        prizeId: prize.id,
        prizeLabel: prize.label,
        probability: publicPrize.probability,
        periodKey,
      },
    });

    notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);
  }

  const luckySpin = await syncUserLuckySpin(userId);

  return {
    ok: true as const,
    data: {
      prize: publicPrize,
      prizeIndex: index,
      rewardAmount,
      balanceAfter,
      luckySpin,
    },
  };
}

export function serializeLuckySpinSettings(config: LuckySpinSettings) {
  return {
    ...config,
    prizes: withPrizeProbabilities(config.prizes),
  };
}
