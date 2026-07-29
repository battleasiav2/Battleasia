import { DepositHistory } from '../models/DepositHistory.js';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

async function sumDepositsSince(since?: Date) {
  const filter: Record<string, unknown> = { status: 'completed' };
  if (since) filter.updatedAt = { $gte: since };

  const result = await DepositHistory.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$coin_amount' } } },
  ]);
  return result[0]?.total ?? 0;
}

async function sumWithdrawalsSince(since?: Date) {
  const filter: Record<string, unknown> = { status: 'completed' };
  if (since) filter.updatedAt = { $gte: since };

  const result = await WithdrawalHistory.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$coin_amount' } } },
  ]);
  return result[0]?.total ?? 0;
}

export async function getReceivedPaymentStats() {
  const now = new Date();
  const [total, today, last7Days, currentMonth, currentYear] = await Promise.all([
    sumDepositsSince(),
    sumDepositsSince(startOfDay(now)),
    sumDepositsSince(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
    sumDepositsSince(startOfMonth(now)),
    sumDepositsSince(startOfYear(now)),
  ]);

  return { total, today, last7Days, currentMonth, currentYear };
}

export async function getWithdrawalStats() {
  const total = await sumWithdrawalsSince();
  return { total };
}
