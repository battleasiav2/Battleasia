import type { Types } from 'mongoose';
import { BalanceHistory } from '../models/BalanceHistory.js';
import type { IUser } from '../models/User.js';

type RecordBalanceInput = {
  user: IUser;
  amount: number;
  type: 'deposit' | 'withdraw';
  balanceBefore: number;
  balanceAfter: number;
  performedBy?: Types.ObjectId | string;
  detail?: Record<string, unknown>;
};

export async function recordBalanceHistory(input: RecordBalanceInput) {
  const { user, amount, type, balanceBefore, balanceAfter, performedBy, detail } = input;

  return BalanceHistory.create({
    userId: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
    performedBy: performedBy || null,
    amount,
    type,
    balanceBefore,
    balanceAfter,
    detail: detail || {},
  });
}

export function serializeBalanceHistory(history: InstanceType<typeof BalanceHistory>) {
  return {
    _id: history._id.toString(),
    id: history._id.toString(),
    userId: history.userId.toString(),
    username: history.username,
    email: history.email,
    avatar: history.avatar,
    performedBy: history.performedBy?.toString(),
    amount: history.amount,
    type: history.type,
    balanceBefore: history.balanceBefore,
    balanceAfter: history.balanceAfter,
    detail: history.detail || {},
    createdAt: history.createdAt,
  };
}
