import mongoose from 'mongoose';
import { BalanceHistory } from '../models/BalanceHistory.js';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';

const WITHDRAWABLE_BET_RATIO = 0.7;

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getWithdrawableInfo(userId: string, balance: number) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [matchBetAgg, withdrawnAgg, pendingWithdrawal] = await Promise.all([
    BalanceHistory.aggregate<{ total: number }>([
      {
        $match: {
          userId: userObjectId,
          type: 'withdraw',
          'detail.reason': 'match_entry_fee',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    WithdrawalHistory.aggregate<{ total: number }>([
      {
        $match: {
          userId: userObjectId,
          status: { $in: ['processing', 'completed'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$coin_amount' } } },
    ]),
    WithdrawalHistory.findOne({
      userId,
      status: { $in: ['pending', 'processing'] },
    }).select('_id status coin_amount'),
  ]);

  const totalMatchBets = matchBetAgg[0]?.total ?? 0;
  const alreadyWithdrawn = withdrawnAgg[0]?.total ?? 0;
  const maxFromBetRule = totalMatchBets * WITHDRAWABLE_BET_RATIO - alreadyWithdrawn;
  const currentBalance = balance ?? 0;
  const withdrawableAmount = roundAmount(Math.max(0, Math.min(maxFromBetRule, currentBalance)));

  return {
    withdrawableAmount,
    hasPendingWithdrawal: !!pendingWithdrawal,
    totalMatchBets: roundAmount(totalMatchBets),
    alreadyWithdrawn: roundAmount(alreadyWithdrawn),
    balance: roundAmount(currentBalance),
    pendingWithdrawalId: pendingWithdrawal?._id.toString() || null,
  };
}
