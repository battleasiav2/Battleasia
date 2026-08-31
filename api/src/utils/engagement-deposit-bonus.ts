import type { Types } from 'mongoose';
import type { IUser } from '../models/User.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type DepositBonusDaysSettings,
} from '../models/AppSettings.js';
import { isMissionInSchedule } from './engagement-period.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isDepositBonusWindowActive(
  config: DepositBonusDaysSettings,
  now = new Date()
): boolean {
  if (!config.enabled || config.percent <= 0) return false;
  return isMissionInSchedule(parseDate(config.startAt), parseDate(config.endAt), now);
}

export function calculateDepositBonusAmount(coinAmount: number, config: DepositBonusDaysSettings) {
  const base = Math.max(Number(coinAmount) || 0, 0);
  if (base < Math.max(config.minDeposit, 0)) return 0;
  return Math.floor((base * Math.max(config.percent, 0)) / 100);
}

export function serializeDepositBonusDaysState(config: DepositBonusDaysSettings, now = new Date()) {
  const active = isDepositBonusWindowActive(config, now);
  if (!config.enabled || !active) {
    return {
      enabled: false,
      active: false,
      percent: config.percent,
      title: '',
      description: '',
      icon: '',
      minDeposit: config.minDeposit,
      startAt: config.startAt,
      endAt: config.endAt,
    };
  }

  return {
    enabled: true,
    active: true,
    percent: config.percent,
    title: config.title,
    description: config.description,
    icon: config.icon,
    minDeposit: config.minDeposit,
    startAt: config.startAt,
    endAt: config.endAt,
  };
}

export async function syncDepositBonusDays() {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  if (!settings.enabled) {
    return serializeDepositBonusDaysState({ ...settings.depositBonusDays, enabled: false });
  }
  return serializeDepositBonusDaysState(settings.depositBonusDays);
}

export async function applyDepositBonusOnApproval(params: {
  user: IUser;
  depositAmount: number;
  depositId: string;
  performedBy?: Types.ObjectId | string | null;
}) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.depositBonusDays;

  if (!settings.enabled || !isDepositBonusWindowActive(config)) {
    return { applied: false as const, bonusAmount: 0 };
  }

  const bonusAmount = calculateDepositBonusAmount(params.depositAmount, config);
  if (bonusAmount <= 0) {
    return { applied: false as const, bonusAmount: 0 };
  }

  const balanceBefore = params.user.balance ?? 0;
  const balanceAfter = balanceBefore + bonusAmount;
  params.user.balance = balanceAfter;
  await params.user.save();

  await recordBalanceHistory({
    user: params.user,
    amount: bonusAmount,
    type: 'deposit',
    balanceBefore,
    balanceAfter,
    performedBy: params.performedBy || undefined,
    detail: {
      reason: 'engagement_deposit_bonus',
      deposit_id: params.depositId,
      percent: config.percent,
      baseAmount: params.depositAmount,
      bonusTitle: config.title,
    },
  });

  notifyBalanceChange(params.user._id.toString(), balanceAfter, balanceBefore);

  return { applied: true as const, bonusAmount, balanceAfter };
}
