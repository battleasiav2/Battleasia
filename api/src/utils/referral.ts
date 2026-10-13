import mongoose, { type Types } from 'mongoose';
import { User, type IUser } from '../models/User.js';
import { ReferralHistory } from '../models/ReferralHistory.js';
import { getAppSettings } from '../models/AppSettings.js';
import { notifyBalanceChange } from './balance-notify.js';
import { notifyReferralCommission } from './payment-notifications.js';
import { moveWallet, roundMoney } from './money.js';

export type ReferralDepositSource = 'manual' | 'admin' | 'coingo';

export async function resolveReferrerId(referredBy: string): Promise<Types.ObjectId | null> {
  const trimmed = referredBy.trim();
  if (!trimmed) return null;

  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    const byId = await User.findById(trimmed);
    if (byId) return byId._id;
  }

  const byCode = await User.findOne({
    referralCode: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (byCode) return byCode._id;

  const byUsername = await User.findOne({
    username: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    status: true,
  });
  return byUsername?._id ?? null;
}

function duplicateKey(error: unknown) {
  return Boolean(error && typeof error === 'object' && (error as { code?: number }).code === 11000);
}

export async function processReferralCommission(input: {
  depositor: IUser;
  depositAmount: number;
  depositId?: Types.ObjectId | string;
  depositSource: ReferralDepositSource;
}) {
  const { depositor, depositAmount, depositId, depositSource } = input;
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) return null;
  if (!depositor.referredBy) return null;

  const referrer = await User.findById(depositor.referredBy);
  if (!referrer || !referrer.status) return null;
  if (referrer._id.toString() === depositor._id.toString()) return null;

  const settings = await getAppSettings();
  const commissionRate = settings.commissionRate ?? 10;
  const commissionAmount = roundMoney((depositAmount * commissionRate) / 100);
  if (commissionAmount <= 0) return null;

  const historyId = new mongoose.Types.ObjectId();
  const eventId = depositId ? String(depositId) : historyId.toString();
  const idempotencyKey = depositId ? `referral:${depositSource}:${eventId}` : undefined;
  let moved;
  try {
    moved = await moveWallet({
      userId: referrer._id.toString(),
      amount: commissionAmount,
      direction: 'credit',
      otherAccount: 'platform:reserve',
      refType: 'referral_commission',
      refId: eventId,
      reason: 'referral_commission',
      idempotencyKey,
      detail: {
        referralHistoryId: historyId.toString(),
        referredUserId: depositor._id.toString(),
        referredUsername: depositor.username,
        depositAmount,
        commissionRate,
        depositSource,
        depositId: depositId ? String(depositId) : undefined,
      },
      alongside: async (session) => {
        await ReferralHistory.create(
          [
            {
              _id: historyId,
              referrerId: referrer._id,
              referredUserId: depositor._id,
              depositAmount,
              commissionRate,
              commissionAmount,
              depositId: depositId ? new mongoose.Types.ObjectId(String(depositId)) : undefined,
              depositSource,
              referredUsername: depositor.username,
              referredEmail: depositor.email,
              status: 'paid',
            },
          ],
          { session },
        );
      },
    });
  } catch (error) {
    if (idempotencyKey && duplicateKey(error)) {
      return { commissionAmount, commissionRate, historyId: '', replayed: true as const };
    }
    throw error;
  }

  if (moved.replayed) {
    return { commissionAmount, commissionRate, historyId: '', replayed: true as const };
  }

  await notifyBalanceChange(referrer._id.toString(), moved.balance, moved.before);
  await notifyReferralCommission({
    userId: referrer._id.toString(),
    amount: commissionAmount,
    fromUsername: depositor.username,
  });

  return { commissionAmount, commissionRate, historyId: historyId.toString(), replayed: false as const };
}
