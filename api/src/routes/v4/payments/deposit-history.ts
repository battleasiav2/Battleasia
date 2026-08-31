import { Router } from 'express';
import mongoose from 'mongoose';
import { DepositHistory } from '../../../models/DepositHistory.js';
import { PaymentChannel } from '../../../models/PaymentChannel.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { recordBalanceHistory } from '../../../utils/balance-history.js';
import { serializeDeposit } from '../../../utils/payment-serialize.js';
import { emitNewDeposit, emitPendingPaymentCounts } from '../../../utils/socket.js';
import { notifyBalanceChange } from '../../../utils/balance-notify.js';
import {
  notifyDepositApproved,
  notifyDepositRejected,
  notifyDepositSubmitted,
} from '../../../utils/payment-notifications.js';
import { processReferralCommission } from '../../../utils/referral.js';
import { touchWelcomeEligibility } from '../../../utils/engagement-welcome.js';
import { applyDepositBonusOnApproval } from '../../../utils/engagement-deposit-bonus.js';
import { safeQueryStatus, DEPOSIT_STATUSES } from '../../../utils/query-filter.js';

const router = Router();

type DepositSubmitBody = {
  user_email?: string;
  username?: string;
  transaction_id?: string;
  coin_amount?: number;
  payment_currency?: string;
  payment_amount?: number;
  from_address?: string;
  payment_channel?: string;
  to_wallet_address?: string;
};

async function loadDeposits(filter: Record<string, unknown>, limit?: number) {
  const query = DepositHistory.find(filter).sort({ createdAt: -1 });
  if (limit) query.limit(limit);

  const deposits = await query;
  const channelIds = deposits.map((d) => d.payment_channel);
  const channels = await PaymentChannel.find({ _id: { $in: channelIds } });
  const channelMap = new Map(channels.map((c) => [c._id.toString(), c]));

  return deposits.map((d) => serializeDeposit(d, channelMap.get(d.payment_channel.toString())));
}

router.get('/statistics', requireAdmin, async (_req, res) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      DepositHistory.countDocuments({ status: 'pending' }),
      DepositHistory.countDocuments({ status: 'completed' }),
      DepositHistory.countDocuments({ status: 'rejected' }),
    ]);
    return res.json({ status: true, data: { pending, approved, rejected } });
  } catch (error) {
    console.error('deposit statistics error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch deposit statistics' });
  }
});

router.get('/pending', requireAdmin, async (_req, res) => {
  try {
    const results = await loadDeposits({ status: 'pending' }, 1000);
    return res.json({ status: true, data: { results, count: results.length } });
  } catch (error) {
    console.error('pending deposits error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch pending deposits' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = {};
    const status = safeQueryStatus(req.query.status, DEPOSIT_STATUSES);
    if (status) filter.status = status;

    const [deposits, count] = await Promise.all([
      DepositHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      DepositHistory.countDocuments(filter),
    ]);

    const channelIds = deposits.map((d) => d.payment_channel);
    const channels = await PaymentChannel.find({ _id: { $in: channelIds } });
    const channelMap = new Map(channels.map((c) => [c._id.toString(), c]));
    const results = deposits.map((d) => serializeDeposit(d, channelMap.get(d.payment_channel.toString())));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('deposit history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch deposit history' });
  }
});

router.post('/submit', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = req.body as DepositSubmitBody;
    const transactionId = body.transaction_id?.trim();
    const paymentChannelId = body.payment_channel?.trim();
    const coinAmount = Number(body.coin_amount);

    if (!transactionId) {
      return res.status(400).json({ status: false, message: 'Transaction ID is required' });
    }
    if (!paymentChannelId || !mongoose.Types.ObjectId.isValid(paymentChannelId)) {
      return res.status(400).json({ status: false, message: 'Valid payment channel is required' });
    }
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      return res.status(400).json({ status: false, message: 'Coin amount must be greater than zero' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const channel = await PaymentChannel.findById(paymentChannelId);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }

    const duplicate = await DepositHistory.findOne({ transaction_id: transactionId });
    if (duplicate) {
      return res.status(409).json({ status: false, message: 'Transaction ID already submitted' });
    }

    const deposit = await DepositHistory.create({
      userId: user._id,
      user_email: body.user_email?.trim() || user.email,
      username: body.username?.trim() || user.username,
      transaction_id: transactionId,
      coin_amount: coinAmount,
      payment_currency: body.payment_currency?.trim().toUpperCase() || 'USD',
      payment_amount: Number(body.payment_amount) || 0,
      from_address: body.from_address?.trim() || '',
      payment_channel: channel._id,
      to_wallet_address: body.to_wallet_address?.trim() || '',
      status: 'pending',
    });

    await emitPendingPaymentCounts();
    emitNewDeposit(serializeDeposit(deposit, channel));
    await notifyDepositSubmitted({
      userId: user._id.toString(),
      amount: coinAmount,
      depositId: deposit._id.toString(),
    });

    return res.status(201).json({
      status: true,
      message: 'Deposit submitted successfully. Waiting for admin approval.',
      data: serializeDeposit(deposit, channel),
    });
  } catch (error) {
    console.error('submit deposit error:', error);
    return res.status(500).json({ status: false, message: 'Failed to submit deposit' });
  }
});

router.get('/my-history', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = { userId: req.userId };
    const status = safeQueryStatus(req.query.status, DEPOSIT_STATUSES);
    if (status) filter.status = status;

    const [deposits, count] = await Promise.all([
      DepositHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      DepositHistory.countDocuments(filter),
    ]);

    const channelIds = deposits.map((d) => d.payment_channel);
    const channels = await PaymentChannel.find({ _id: { $in: channelIds } });
    const channelMap = new Map(channels.map((c) => [c._id.toString(), c]));
    const results = deposits.map((d) => serializeDeposit(d, channelMap.get(d.payment_channel.toString())));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('my deposit history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch deposit history' });
  }
});

router.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid deposit id' });
    }

    const deposit = await DepositHistory.findById(id);
    if (!deposit) {
      return res.status(404).json({ status: false, message: 'Deposit not found' });
    }
    if (deposit.userId.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Forbidden' });
    }

    const channel = await PaymentChannel.findById(deposit.payment_channel);
    return res.json({ status: true, data: serializeDeposit(deposit, channel) });
  } catch (error) {
    console.error('get deposit by id error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch deposit' });
  }
});

router.patch('/:id/approve', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const deposit = await DepositHistory.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ status: false, message: 'Deposit not found' });
    }
    if (deposit.status !== 'pending') {
      return res.status(400).json({ status: false, message: 'Deposit is not pending' });
    }

    const user = await User.findById(deposit.userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const admin = req.userId ? await User.findById(req.userId) : null;
    const balanceBefore = user.balance ?? 0;
    user.balance = balanceBefore + deposit.coin_amount;
    await user.save();

    deposit.status = 'completed';
    deposit.processed_at = new Date();
    deposit.processed_by = req.userId as unknown as import('mongoose').Types.ObjectId;
    await deposit.save();

    await recordBalanceHistory({
      user,
      amount: deposit.coin_amount,
      type: 'deposit',
      balanceBefore,
      balanceAfter: user.balance,
      performedBy: req.userId,
      detail: {
        reason: 'deposit_approved',
        deposit_id: deposit._id.toString(),
        adminName: admin?.username || 'Admin',
      },
    });

    await emitPendingPaymentCounts();
    await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
    await notifyDepositApproved({
      userId: user._id.toString(),
      amount: deposit.coin_amount,
      depositId: deposit._id.toString(),
    });

    await processReferralCommission({
      depositor: user,
      depositAmount: deposit.coin_amount,
      depositId: deposit._id,
      depositSource: 'manual',
    });

    touchWelcomeEligibility(user._id.toString()).catch((error) => {
      console.error('engagement welcome touch failed:', error);
    });

    try {
      await applyDepositBonusOnApproval({
        user,
        depositAmount: deposit.coin_amount,
        depositId: deposit._id.toString(),
        performedBy: req.userId,
      });
    } catch (error) {
      console.error('engagement deposit bonus failed:', error);
    }

    const channel = await PaymentChannel.findById(deposit.payment_channel);
    return res.json({ status: true, data: serializeDeposit(deposit, channel) });
  } catch (error) {
    console.error('approve deposit error:', error);
    return res.status(500).json({ status: false, message: 'Failed to approve deposit' });
  }
});

router.patch('/:id/reject', requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const deposit = await DepositHistory.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ status: false, message: 'Deposit not found' });
    }
    if (deposit.status !== 'pending') {
      return res.status(400).json({ status: false, message: 'Deposit is not pending' });
    }

    deposit.status = 'rejected';
    deposit.rejection_reason = req.body.rejection_reason || '';
    deposit.processed_at = new Date();
    deposit.processed_by = req.userId as unknown as import('mongoose').Types.ObjectId;
    await deposit.save();

    await emitPendingPaymentCounts();
    await notifyDepositRejected({
      userId: deposit.userId.toString(),
      amount: deposit.coin_amount,
      depositId: deposit._id.toString(),
      reason: deposit.rejection_reason,
    });
    const channel = await PaymentChannel.findById(deposit.payment_channel);
    return res.json({ status: true, data: serializeDeposit(deposit, channel) });
  } catch (error) {
    console.error('reject deposit error:', error);
    return res.status(500).json({ status: false, message: 'Failed to reject deposit' });
  }
});

export default router;
