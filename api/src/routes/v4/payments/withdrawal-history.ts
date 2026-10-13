import { Router } from 'express';
import mongoose from 'mongoose';
import { WithdrawalHistory } from '../../../models/WithdrawalHistory.js';
import { CoinRate } from '../../../models/CoinRate.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { requireAdmin, requirePermission } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { recordBalanceHistory } from '../../../utils/balance-history.js';
import {
  approveWithdrawMoney,
  cancelWithdrawByUser,
  completeWithdrawMoney,
  refundWithdrawMoney,
  submitWithdrawalAndHold,
  MoneyError,
  roundMoney,
} from '../../../utils/money.js';
import { assertHighValuePassword, HighValueError } from '../../../utils/high-value.js';
import { writeAudit } from '../../../models/AuditLog.js';
import { serializeWithdrawal } from '../../../utils/payment-serialize.js';
import { emitNewWithdrawal, emitPendingPaymentCounts } from '../../../utils/socket.js';
import { getWithdrawableInfo } from '../../../utils/withdrawable-amount.js';
import { notifyBalanceChange } from '../../../utils/balance-notify.js';
import {
  notifyWithdrawalApproved,
  notifyWithdrawalCompleted,
  notifyWithdrawalRejected,
  notifyWithdrawalSubmitted,
} from '../../../utils/payment-notifications.js';
import { safeQueryStatus, WITHDRAWAL_STATUSES } from '../../../utils/query-filter.js';

const router = Router();

/** Active CoinRate rows are fiat units per 1 BAC. Conflicting rates are not guessed. */
async function authoritativeCoinRate(currency: string) {
  const rows = await CoinRate.find({ currency, isActive: true, rate: { $gt: 0 } }).select('rate');
  if (rows.length === 0) return null;
  const rate = rows[0].rate;
  if (rows.some((row) => row.rate !== rate)) return null;
  return rate;
}

function duplicateWithdrawalField(error: unknown) {
  if (!error || typeof error !== 'object' || (error as { code?: number }).code !== 11000) return '';
  const pattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern || {};
  if (pattern.idempotencyKey) return 'idempotencyKey';
  if (pattern.openSlot) return 'openSlot';
  return Object.keys(pattern)[0] || 'openSlot';
}

type WithdrawalSubmitBody = {
  user_email?: string;
  username?: string;
  coin_amount?: number;
  wallet_type?: string;
  wallet_address?: string;
  currency_type?: string;
  currency_amount?: number;
  description?: string;
  notes?: string;
};

router.get('/stats', requireAdmin, requirePermission('payments.manage'), async (_req, res) => {
  try {
    const [pending, approved, completed, rejected] = await Promise.all([
      WithdrawalHistory.countDocuments({ status: 'pending' }),
      WithdrawalHistory.countDocuments({ status: 'processing' }),
      WithdrawalHistory.countDocuments({ status: 'completed' }),
      WithdrawalHistory.countDocuments({ status: 'rejected' }),
    ]);
    return res.json({ status: true, data: { pending, approved, completed, rejected } });
  } catch (error) {
    console.error('withdrawal stats error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal stats' });
  }
});

router.get('/', requireAdmin, requirePermission('payments.manage'), async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = {};
    const status = safeQueryStatus(req.query.status, WITHDRAWAL_STATUSES);
    if (status) filter.status = status;

    const [withdrawals, count] = await Promise.all([
      WithdrawalHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WithdrawalHistory.countDocuments(filter),
    ]);

    const results = withdrawals.map(serializeWithdrawal);
    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('withdrawal history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal history' });
  }
});

router.post('/submit', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = req.body as WithdrawalSubmitBody;
    const rawCoinAmount = Number(body.coin_amount);
    const walletAddress = body.wallet_address?.trim();
    const walletType = body.wallet_type?.trim();

    if (!walletAddress) {
      return res.status(400).json({ status: false, message: 'Wallet address is required' });
    }
    if (!walletType) {
      return res.status(400).json({ status: false, message: 'Wallet type is required' });
    }
    if (!Number.isFinite(rawCoinAmount) || rawCoinAmount <= 0) {
      return res.status(400).json({ status: false, message: 'Coin amount must be greater than zero' });
    }
    const coinAmount = roundMoney(rawCoinAmount);
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      return res.status(400).json({ status: false, message: 'Coin amount must be greater than zero' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const { getAppSettings } = await import('../../../models/AppSettings.js');
    const { normalizeP1Flags } = await import('../../../utils/p1-flags.js');
    const flags = normalizeP1Flags((await getAppSettings()).p1);
    if (flags.kycBeforeWithdraw) {
      if (user.kycStatus !== 'approved') {
        return res.status(403).json({ status: false, message: 'Complete KYC and wait for approval before withdrawing' });
      }
      if (user.dateOfBirth) {
        const age = (Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000);
        if (age < 18) {
          return res.status(403).json({ status: false, message: 'You must be 18 or older to withdraw' });
        }
      } else {
        return res.status(403).json({ status: false, message: 'Add your date of birth to complete KYC' });
      }
    }

    const { assertClearOfVelocity } = await import('../../../utils/velocity.js');
    await assertClearOfVelocity(user._id.toString(), 'withdraw');

    const idemKey = String(req.header('Idempotency-Key') || '').trim();
    const prior = idemKey ? await WithdrawalHistory.findOne({ idempotencyKey: idemKey, userId: user._id }) : null;
    if (prior && (prior.status === 'pending' || prior.status === 'processing')) {
      return res.status(400).json({
        status: false,
        message: 'You already have a pending withdrawal request',
      });
    }
    if (prior && prior.status !== 'pending' && prior.status !== 'processing') {
      return res.status(200).json({
        status: true,
        message: 'Withdrawal request submitted successfully',
        data: serializeWithdrawal(prior),
      });
    }

    const withdrawableInfo = await getWithdrawableInfo(user._id.toString(), user.balance ?? 0);
    if (withdrawableInfo.hasPendingWithdrawal) {
      return res.status(400).json({
        status: false,
        message: 'You already have a pending withdrawal request',
      });
    }
    if (coinAmount > withdrawableInfo.withdrawableAmount) {
      return res.status(400).json({
        status: false,
        message: `Exceeds withdrawable amount. Maximum: ${withdrawableInfo.withdrawableAmount.toFixed(2)} BAC`,
      });
    }

    const currencyType = body.currency_type?.trim().toUpperCase() || 'USDT';
    const rate = await authoritativeCoinRate(currencyType);
    if (rate == null) {
      return res.status(400).json({ status: false, message: 'Unsupported currency' });
    }
    const currencyAmount = roundMoney(coinAmount * rate);
    if (!Number.isFinite(currencyAmount) || currencyAmount < 0) {
      return res.status(400).json({ status: false, message: 'Unsupported currency' });
    }

    const { recordFingerprint } = await import('../../../utils/fingerprint.js');
    void recordFingerprint(req, user._id.toString());

    const submitted = await submitWithdrawalAndHold({
      userId: user._id.toString(),
      userEmail: user.email,
      username: user.username,
      coinAmount,
      walletType,
      walletAddress,
      currencyType,
      currencyAmount,
      description: body.description?.trim() || '',
      notes: body.notes?.trim() || '',
      idempotencyKey: idemKey || undefined,
    });

    if (!submitted.replayed) {
      try {
        await notifyBalanceChange(user._id.toString(), submitted.balance, user.balance ?? 0);
        await emitPendingPaymentCounts();
        emitNewWithdrawal(serializeWithdrawal(submitted.withdrawal));
        await notifyWithdrawalSubmitted({
          userId: user._id.toString(),
          amount: coinAmount,
          withdrawalId: submitted.withdrawal._id.toString(),
        });
      } catch (sideError) {
        const label = sideError instanceof Error ? sideError.name : 'Error';
        console.error('withdrawal submit side-effect failed:', label);
      }
    }

    return res.status(200).json({
      status: true,
      message: 'Withdrawal request submitted successfully',
      data: serializeWithdrawal(submitted.withdrawal),
    });
  } catch (error) {
    const duplicate = duplicateWithdrawalField(error);
    if (duplicate === 'idempotencyKey') {
      const saved = await WithdrawalHistory.findOne({
        idempotencyKey: String(req.header('Idempotency-Key') || '').trim(),
        userId: req.userId,
      });
      if (saved) {
        return res.status(saved.status === 'pending' || saved.status === 'processing' ? 400 : 200).json({
          status: saved.status !== 'pending' && saved.status !== 'processing',
          message: saved.status === 'pending' || saved.status === 'processing'
            ? 'You already have a pending withdrawal request'
            : 'Withdrawal request submitted successfully',
          ...(saved.status === 'pending' || saved.status === 'processing' ? {} : { data: serializeWithdrawal(saved) }),
        });
      }
    }
    if (duplicate) {
      return res.status(400).json({
        status: false,
        message: 'You already have a pending withdrawal request',
      });
    }
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('submit withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to submit withdrawal' });
  }
});

router.get('/my-history', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = { userId: req.userId };
    const status = safeQueryStatus(req.query.status, WITHDRAWAL_STATUSES);
    if (status) filter.status = status;

    const [withdrawals, count] = await Promise.all([
      WithdrawalHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WithdrawalHistory.countDocuments(filter),
    ]);

    const results = withdrawals.map(serializeWithdrawal);
    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('my withdrawal history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal history' });
  }
});

router.patch('/:id/cancel', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid withdrawal id' });
    }
    const userBefore = await User.findById(req.userId);
    const balanceBefore = userBefore?.balance ?? 0;
    const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
    const result = await cancelWithdrawByUser({
      withdrawalId: id,
      userId: String(req.userId),
      idempotencyKey: key,
    });
    await emitPendingPaymentCounts();
    await notifyBalanceChange(String(req.userId), result.balance, balanceBefore);
    const withdrawal = await WithdrawalHistory.findById(id);
    return res.json({
      status: true,
      message: 'Withdrawal cancelled and balance restored',
      data: withdrawal ? serializeWithdrawal(withdrawal) : null,
      balance: result.balance,
    });
  } catch (error) {
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('cancel withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to cancel withdrawal' });
  }
});

router.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid withdrawal id' });
    }

    const withdrawal = await WithdrawalHistory.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    }
    if (withdrawal.userId.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Forbidden' });
    }

    return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
  } catch (error) {
    console.error('get withdrawal by id error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal' });
  }
});

router.patch('/:id/approve', requireAdmin, requirePermission('payments.manage'), async (req: AuthedRequest, res) => {
  try {
    const existing = await WithdrawalHistory.findById(req.params.id);
    if (!existing) return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    await assertHighValuePassword(req, Number(existing.coin_amount));
    const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
    const approved = await approveWithdrawMoney({ withdrawalId: String(req.params.id), idempotencyKey: key });
    const withdrawal = await WithdrawalHistory.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ status: false, message: 'Withdrawal not found' });

    try {
      await emitPendingPaymentCounts();
      await notifyWithdrawalApproved({
        userId: withdrawal.userId.toString(),
        amount: withdrawal.coin_amount,
        withdrawalId: withdrawal._id.toString(),
      });
      await writeAudit({
        actorId: req.userId,
        action: 'withdraw.approve',
        target: withdrawal._id.toString(),
        detail: `${withdrawal.coin_amount} BAC`,
      });
    } catch (sideError) {
      console.error('withdraw approve side-effects failed:', sideError);
    }

    return res.json({
      status: true,
      data: serializeWithdrawal(withdrawal),
      balance: approved.balance,
    });
  } catch (error) {
    if (error instanceof HighValueError || error instanceof MoneyError) {
      return res.status((error as { status: number }).status).json({ status: false, message: error.message });
    }
    console.error('approve withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to approve withdrawal' });
  }
});

router.patch('/:id/complete', requireAdmin, requirePermission('payments.manage'), async (req: AuthedRequest, res) => {
  try {
    const existing = await WithdrawalHistory.findById(req.params.id);
    if (!existing) return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    await assertHighValuePassword(req, Number(existing.coin_amount));
    const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
    await completeWithdrawMoney({
      withdrawalId: String(req.params.id),
      transactionHash: req.body.transaction_hash || '',
      idempotencyKey: key,
    });
    const withdrawal = await WithdrawalHistory.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    await notifyWithdrawalCompleted({
      userId: withdrawal.userId.toString(),
      amount: withdrawal.coin_amount,
      withdrawalId: withdrawal._id.toString(),
    });
    await writeAudit({
      actorId: req.userId,
      action: 'withdraw.complete',
      target: withdrawal._id.toString(),
      detail: `${withdrawal.coin_amount} BAC`,
    });
    return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
  } catch (error) {
    if (error instanceof HighValueError || error instanceof MoneyError) {
      return res.status((error as { status: number }).status).json({ status: false, message: error.message });
    }
    console.error('complete withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to complete withdrawal' });
  }
});

router.patch('/:id/reject', requireAdmin, requirePermission('payments.manage'), async (req: AuthedRequest, res) => {
  try {
    const withdrawal = await WithdrawalHistory.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    }
    if (!['pending', 'processing'].includes(withdrawal.status)) {
      return res.status(400).json({ status: false, message: 'Withdrawal cannot be rejected' });
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const balanceBefore = user.balance ?? 0;
    const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
    const refunded = await refundWithdrawMoney({ withdrawalId: String(withdrawal._id), idempotencyKey: key });
    const fresh = await WithdrawalHistory.findById(withdrawal._id);
    if (fresh) {
      fresh.rejection_reason = req.body.rejection_reason || '';
      fresh.processed_by = req.userId as unknown as import('mongoose').Types.ObjectId;
      await fresh.save();
    }

    await emitPendingPaymentCounts();
    await notifyBalanceChange(user._id.toString(), refunded.balance, balanceBefore);
    await notifyWithdrawalRejected({
      userId: user._id.toString(),
      amount: withdrawal.coin_amount,
      withdrawalId: withdrawal._id.toString(),
      reason: req.body.rejection_reason || '',
      refunded: refunded.balance !== balanceBefore,
    });
    return res.json({ status: true, data: serializeWithdrawal(fresh || withdrawal) });
  } catch (error) {
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('reject withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to reject withdrawal' });
  }
});

export default router;
