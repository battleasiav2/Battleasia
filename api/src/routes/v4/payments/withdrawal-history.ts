import { Router } from 'express';
import mongoose from 'mongoose';
import { WithdrawalHistory } from '../../../models/WithdrawalHistory.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { recordBalanceHistory } from '../../../utils/balance-history.js';
import { approveWithdrawMoney, completeWithdrawMoney, refundWithdrawMoney, MoneyError } from '../../../utils/money.js';
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

router.get('/stats', requireAdmin, async (_req, res) => {
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

router.get('/', requireAdmin, async (req, res) => {
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
    const coinAmount = Number(body.coin_amount);
    const walletAddress = body.wallet_address?.trim();
    const walletType = body.wallet_type?.trim();

    if (!walletAddress) {
      return res.status(400).json({ status: false, message: 'Wallet address is required' });
    }
    if (!walletType) {
      return res.status(400).json({ status: false, message: 'Wallet type is required' });
    }
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

    const { recordFingerprint } = await import('../../../utils/fingerprint.js');
    void recordFingerprint(req, user._id.toString());

    const withdrawal = await WithdrawalHistory.create({
      userId: user._id,
      user_email: body.user_email?.trim() || user.email,
      username: body.username?.trim() || user.username,
      coin_amount: coinAmount,
      wallet_type: walletType,
      wallet_address: walletAddress,
      currency_type: body.currency_type?.trim().toUpperCase() || 'USDT',
      currency_amount: Number(body.currency_amount) || 0,
      description: body.description?.trim() || '',
      notes: body.notes?.trim() || '',
      status: 'pending',
    });

    await emitPendingPaymentCounts();
    emitNewWithdrawal(serializeWithdrawal(withdrawal));
    await notifyWithdrawalSubmitted({
      userId: user._id.toString(),
      amount: coinAmount,
      withdrawalId: withdrawal._id.toString(),
    });

    return res.status(201).json({
      status: true,
      message: 'Withdrawal request submitted successfully',
      data: serializeWithdrawal(withdrawal),
    });
  } catch (error) {
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

router.patch('/:id/approve', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const existing = await WithdrawalHistory.findById(req.params.id);
    if (!existing) return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    await assertHighValuePassword(req, Number(existing.coin_amount));
    const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
    await approveWithdrawMoney({ withdrawalId: String(req.params.id), idempotencyKey: key });
    const withdrawal = await WithdrawalHistory.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ status: false, message: 'Withdrawal not found' });
    const user = await User.findById(withdrawal.userId);
    await emitPendingPaymentCounts();
    if (user) {
      await notifyBalanceChange(user._id.toString(), user.balance ?? 0, (user.balance ?? 0) + withdrawal.coin_amount);
    }
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
    return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
  } catch (error) {
    if (error instanceof HighValueError || error instanceof MoneyError) {
      return res.status((error as { status: number }).status).json({ status: false, message: error.message });
    }
    console.error('approve withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to approve withdrawal' });
  }
});

router.patch('/:id/complete', requireAdmin, async (req: AuthedRequest, res) => {
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

router.patch('/:id/reject', requireAdmin, async (req: AuthedRequest, res) => {
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

    const admin = req.userId ? await User.findById(req.userId) : null;
    const wasProcessing = withdrawal.status === 'processing';

    if (wasProcessing) {
      const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
      await refundWithdrawMoney({ withdrawalId: String(withdrawal._id), idempotencyKey: key });
    } else {
      withdrawal.status = 'rejected';
      withdrawal.rejection_reason = req.body.rejection_reason || '';
      withdrawal.processed_at = new Date();
      withdrawal.processed_by = req.userId as unknown as import('mongoose').Types.ObjectId;
      await withdrawal.save();
    }

    withdrawal.status = 'rejected';
    withdrawal.rejection_reason = req.body.rejection_reason || '';
    withdrawal.processed_at = new Date();
    withdrawal.processed_by = req.userId as unknown as import('mongoose').Types.ObjectId;
    await withdrawal.save();

    await emitPendingPaymentCounts();
    await notifyWithdrawalRejected({
      userId: user._id.toString(),
      amount: withdrawal.coin_amount,
      withdrawalId: withdrawal._id.toString(),
      reason: withdrawal.rejection_reason,
      refunded: wasProcessing,
    });
    return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
  } catch (error) {
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('reject withdrawal error:', error);
    return res.status(500).json({ status: false, message: 'Failed to reject withdrawal' });
  }
});

export default router;
