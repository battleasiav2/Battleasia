import type { Request } from 'express';
import crypto from 'crypto';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';
import { CoingoTransaction, type ICoingoTransaction } from '../models/CoingoTransaction.js';
import { User } from '../models/User.js';
import { holdWithdrawOnSubmit, approveWithdrawMoney, completeWithdrawMoney, refundWithdrawMoney, MoneyError } from './money.js';
import { getWithdrawableInfo } from './withdrawable-amount.js';
import { notifyBalanceChange } from './balance-notify.js';
import { emitNewWithdrawal, emitPendingPaymentCounts } from './socket.js';
import { serializeWithdrawal } from './payment-serialize.js';
import { notifyWithdrawalSubmitted } from './payment-notifications.js';

function createMerchantSerialNo(prefix: string) {
  return `${prefix}${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export type CoingoPayoutInput = {
  userId: string;
  coinAmount: number;
  walletNumber: string;
  walletType: string;
  email?: string;
  username?: string;
  currency_type?: string;
  currency_amount?: number;
  description?: string;
  idempotencyKey?: string;
  req?: Request;
};

export async function submitCoingoPayoutWithHold(input: CoingoPayoutInput) {
  const walletAddress = input.walletNumber.trim();
  const walletType = input.walletType.trim() || 'bKash';
  const coinAmount = input.coinAmount;

  if (!walletAddress) throw new MoneyError('Wallet number is required', 400);
  if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
    throw new MoneyError('Valid amount is required', 400);
  }

  const user = await User.findById(input.userId);
  if (!user) throw new MoneyError('Unauthorized', 401);

  const { getAppSettings } = await import('../models/AppSettings.js');
  const { normalizeP1Flags } = await import('./p1-flags.js');
  const flags = normalizeP1Flags((await getAppSettings()).p1);
  if (flags.kycBeforeWithdraw) {
    if (user.kycStatus !== 'approved') {
      throw new MoneyError('Complete KYC and wait for approval before withdrawing', 403);
    }
    if (user.dateOfBirth) {
      const age = (Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) throw new MoneyError('You must be 18 or older to withdraw', 403);
    } else {
      throw new MoneyError('Add your date of birth to complete KYC', 403);
    }
  }

  const { assertClearOfVelocity } = await import('./velocity.js');
  await assertClearOfVelocity(user._id.toString(), 'withdraw');

  const withdrawableInfo = await getWithdrawableInfo(user._id.toString(), user.balance ?? 0);
  if (withdrawableInfo.hasPendingWithdrawal) {
    throw new MoneyError('You already have a pending withdrawal request', 400);
  }
  if (coinAmount > withdrawableInfo.withdrawableAmount) {
    throw new MoneyError(
      `Exceeds withdrawable amount. Maximum: ${withdrawableInfo.withdrawableAmount.toFixed(2)} BAC`,
      400,
    );
  }

  if (input.req) {
    const { recordFingerprint } = await import('./fingerprint.js');
    void recordFingerprint(input.req, user._id.toString());
  }

  const merchantSerialNo = createMerchantSerialNo('POUT');
  const withdrawal = await WithdrawalHistory.create({
    userId: user._id,
    user_email: input.email?.trim() || user.email,
    username: input.username?.trim() || user.username,
    coin_amount: coinAmount,
    wallet_type: walletType,
    wallet_address: walletAddress,
    currency_type: input.currency_type?.trim().toUpperCase() || 'BDT',
    currency_amount: Number(input.currency_amount) || 0,
    description: input.description?.trim() || '',
    notes: `coingo:${merchantSerialNo}`,
    status: 'pending',
  });

  try {
    const held = await holdWithdrawOnSubmit({
      withdrawalId: withdrawal._id.toString(),
      userId: user._id.toString(),
      idempotencyKey: input.idempotencyKey,
    });
    await notifyBalanceChange(user._id.toString(), held.balance, user.balance ?? 0);
  } catch (holdError) {
    await WithdrawalHistory.findByIdAndDelete(withdrawal._id);
    throw holdError;
  }

  const tx = await CoingoTransaction.create({
    merchantSerialNo,
    userId: user._id,
    type: 'payout',
    amount: coinAmount,
    walletNumber: walletAddress,
    walletType,
    email: input.email?.trim() || user.email,
    username: input.username?.trim() || user.username,
    currency_type: input.currency_type?.trim() || 'BDT',
    currency_amount: Number(input.currency_amount) || 0,
    description: input.description?.trim() || '',
    status: 'pending',
    withdrawalId: withdrawal._id,
  });

  await emitPendingPaymentCounts();
  emitNewWithdrawal(serializeWithdrawal(withdrawal));
  await notifyWithdrawalSubmitted({
    userId: user._id.toString(),
    amount: coinAmount,
    withdrawalId: withdrawal._id.toString(),
  });

  return {
    merchantSerialNo: tx.merchantSerialNo,
    status: tx.status,
    amount: tx.amount,
    withdrawalId: withdrawal._id.toString(),
  };
}

/** After Coingo payout status settles, mirror ledger state on the linked withdrawal. */
export async function syncCoingoPayoutWithdrawal(tx: ICoingoTransaction) {
  if (tx.type !== 'payout' || !tx.withdrawalId) return;
  const withdrawalId = tx.withdrawalId.toString();

  if (tx.status === 'success') {
    const pending = await WithdrawalHistory.findById(withdrawalId);
    if (pending?.status === 'pending') {
      await approveWithdrawMoney({ withdrawalId });
    }
    const processing = await WithdrawalHistory.findById(withdrawalId);
    if (processing?.status === 'processing') {
      await completeWithdrawMoney({ withdrawalId, transactionHash: tx.merchantSerialNo });
    }
    return;
  }

  if (tx.status === 'failed' || tx.status === 'cancelled') {
    const w = await WithdrawalHistory.findById(withdrawalId);
    if (w && (w.status === 'pending' || w.status === 'processing')) {
      await refundWithdrawMoney({ withdrawalId });
    }
  }
}
