import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

/** Atomic wallet credit. Amount is chosen by the caller from server config, never from the client. */
export async function creditUserBac(
  userId: Types.ObjectId | string,
  amount: number,
  detail: Record<string, unknown>
) {
  const reward = Math.max(Number(amount) || 0, 0);
  if (!Number.isFinite(reward) || reward <= 0) return null;

  const updated = await User.findByIdAndUpdate(userId, { $inc: { balance: reward } }, { new: true });
  if (!updated) return null;

  const balanceAfter = Number(updated.balance) || 0;
  const balanceBefore = balanceAfter - reward;
  await recordBalanceHistory({
    user: updated,
    amount: reward,
    type: 'deposit',
    balanceBefore,
    balanceAfter,
    detail,
  });
  notifyBalanceChange(updated._id.toString(), balanceAfter, balanceBefore);
  return { balanceBefore, balanceAfter };
}
