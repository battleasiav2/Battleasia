import { Router } from 'express';
import mongoose from 'mongoose';
import { DepositHistory } from '../../../models/DepositHistory.js';
import { PaymentChannel } from '../../../models/PaymentChannel.js';
import { ShopItem } from '../../../models/ShopItem.js';
import { User } from '../../../models/User.js';
import { CoinRate } from '../../../models/CoinRate.js';
import { DEFAULT_COIN_RATES } from '../../../utils/coin-rates.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { requireAdmin, requirePermission } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { approveDepositMoney, MoneyError, rejectDepositMoney, roundMoney } from '../../../utils/money.js';
import { assertHighValuePassword, HighValueError } from '../../../utils/high-value.js';
import { writeAudit } from '../../../models/AuditLog.js';
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
import { discountedPay, releaseCoupon, reserveCoupon, CouponError } from '../../../utils/shop-coupon.js';
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
  coupon_code?: string;
  shop_item_id?: string;
};

function duplicateField(error: unknown) {
  if (!error || typeof error !== 'object' || (error as { code?: number }).code !== 11000) return '';
  const pattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
  return Object.keys(pattern || {})[0] || '';
}

async function rateFor(currency: string) {
  const code = currency.toUpperCase();
  const row = await CoinRate.findOne({ currency: code, isActive: true }).sort({ updatedAt: -1 });
  if (row && row.rate > 0) return row.rate;
  if (code === 'BDT') return 1;
  const fallback = DEFAULT_COIN_RATES.find((entry) => entry.currency === code);
  return fallback && fallback.rate > 0 ? fallback.rate : null;
}

/** Fiat due for a catalog pack. USD/USDT use the pack price; other currencies use server coin rates. */
async function packPaymentAmount(priceUsd: number, currency: string) {
  const code = currency.trim().toUpperCase();
  const price = roundMoney(priceUsd);
  if (!code || !(price > 0)) return null;
  if (code === 'USD' || code === 'USDT') return price;
  const local = await rateFor(code);
  const usd = (await rateFor('USDT')) ?? (await rateFor('USD'));
  if (local == null || usd == null || usd <= 0) return null;
  return roundMoney(price * (local / usd));
}

async function loadDeposits(filter: Record<string, unknown>, limit?: number) {
  const query = DepositHistory.find(filter).sort({ createdAt: -1 });
  if (limit) query.limit(limit);

  const deposits = await query;
  const channelIds = deposits.map((d) => d.payment_channel);
  const channels = await PaymentChannel.find({ _id: { $in: channelIds } });
  const channelMap = new Map(channels.map((c) => [c._id.toString(), c]));

  return deposits.map((d) => serializeDeposit(d, channelMap.get(d.payment_channel.toString())));
}

router.get('/statistics', requireAdmin, requirePermission('payments.manage'), async (_req, res) => {
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

router.get('/pending', requireAdmin, requirePermission('payments.manage'), async (_req, res) => {
  try {
    const results = await loadDeposits({ status: 'pending' }, 1000);
    return res.json({ status: true, data: { results, count: results.length } });
  } catch (error) {
    console.error('pending deposits error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch pending deposits' });
  }
});

router.get('/', requireAdmin, requirePermission('payments.manage'), async (req, res) => {
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

/**
 * shop_item_id and Idempotency-Key are required.
 * An older APK that omits either one receives HTTP 400 and cannot submit a deposit.
 * The update path is an app build that sends the catalog pack id as shop_item_id
 * and an Idempotency-Key header, which the current shop buy flow already does.
 * Client coin_amount is not accepted as a substitute.
 */
router.post('/submit', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = req.body as DepositSubmitBody;
    const transactionId = body.transaction_id?.trim();
    const paymentChannelId = body.payment_channel?.trim();
    const shopItemId = body.shop_item_id?.trim();
    const idempotencyKey = String(req.header('Idempotency-Key') || '').trim();
    const paymentCurrency = body.payment_currency?.trim().toUpperCase() || '';

    if (!idempotencyKey) {
      return res.status(400).json({ status: false, message: 'Idempotency-Key is required' });
    }
    if (!transactionId) {
      return res.status(400).json({ status: false, message: 'Transaction ID is required' });
    }
    if (!paymentChannelId || !mongoose.Types.ObjectId.isValid(paymentChannelId)) {
      return res.status(400).json({ status: false, message: 'Valid payment channel is required' });
    }
    if (!shopItemId || !mongoose.Types.ObjectId.isValid(shopItemId)) {
      return res.status(400).json({ status: false, message: 'Valid coin pack is required' });
    }
    if (!paymentCurrency) {
      return res.status(400).json({ status: false, message: 'Payment currency is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const prior = await DepositHistory.findOne({ idempotencyKey });
    if (prior) {
      if (prior.userId.toString() !== user._id.toString()) {
        return res.status(409).json({ status: false, message: 'Idempotency key already used' });
      }
      const priorChannel = await PaymentChannel.findById(prior.payment_channel);
      return res.status(200).json({
        status: true,
        message: 'Deposit submitted successfully. Waiting for admin approval.',
        data: serializeDeposit(prior, priorChannel),
      });
    }

    const channel = await PaymentChannel.findById(paymentChannelId);
    if (!channel) {
      return res.status(404).json({ status: false, message: 'Payment channel not found' });
    }

    const pack = await ShopItem.findById(shopItemId);
    if (!pack || !pack.isActive || pack.status !== 'available') {
      return res.status(400).json({ status: false, message: 'Coin pack is not available' });
    }
    const coinAmount = roundMoney(pack.amount);
    if (!(coinAmount > 0)) {
      return res.status(400).json({ status: false, message: 'Coin pack is not available' });
    }

    const listPrice = await packPaymentAmount(pack.price, paymentCurrency);
    if (listPrice == null) {
      return res.status(400).json({ status: false, message: 'Payment currency is not available' });
    }

    const duplicate = await DepositHistory.findOne({ transaction_id: transactionId });
    if (duplicate) {
      return res.status(409).json({ status: false, message: 'Transaction ID already submitted' });
    }

    const couponCode = body.coupon_code?.trim() || '';
    let quote: Awaited<ReturnType<typeof reserveCoupon>> | null = null;
    if (couponCode) {
      try {
        quote = await reserveCoupon(couponCode, coinAmount);
      } catch (error) {
        if (error instanceof CouponError) {
          return res.status(error.status).json({ status: false, message: error.message });
        }
        throw error;
      }
    }

    const paymentAmount = discountedPay(listPrice, quote);

    let deposit;
    try {
      deposit = await DepositHistory.create({
        userId: user._id,
        user_email: body.user_email?.trim() || user.email,
        username: body.username?.trim() || user.username,
        transaction_id: transactionId,
        coin_amount: coinAmount,
        payment_currency: paymentCurrency,
        payment_amount: paymentAmount,
        from_address: body.from_address?.trim() || '',
        payment_channel: channel._id,
        to_wallet_address: body.to_wallet_address?.trim() || '',
        status: 'pending',
        coupon_code: quote?.code || '',
        coupon_kind: quote?.kind || '',
        coupon_value: quote?.value || 0,
        bonus_coins: quote?.bonusCoins || 0,
        shop_item_id: pack._id,
        idempotencyKey,
      });
    } catch (error) {
      if (quote) await releaseCoupon(quote.code);
      if (duplicateField(error)) {
        const saved = await DepositHistory.findOne({ idempotencyKey, userId: user._id });
        if (saved) {
          const savedChannel = await PaymentChannel.findById(saved.payment_channel);
          return res.status(200).json({
            status: true,
            message: 'Deposit submitted successfully. Waiting for admin approval.',
            data: serializeDeposit(saved, savedChannel),
          });
        }
        return res.status(409).json({ status: false, message: 'Transaction ID already submitted' });
      }
      throw error;
    }

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

router.patch('/:id/approve', requireAdmin, requirePermission('payments.manage'), async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid deposit id' });
    }
    const key = String(req.header('Idempotency-Key') || '').trim() || undefined;
    const pending = await DepositHistory.findById(id);
    if (!pending) return res.status(404).json({ status: false, message: 'Deposit not found' });
    await assertHighValuePassword(req, roundMoney(pending.coin_amount + (pending.bonus_coins || 0)));
    await approveDepositMoney({ depositId: id, adminId: req.userId, idempotencyKey: key });
    const deposit = await DepositHistory.findById(id);
    if (!deposit) return res.status(404).json({ status: false, message: 'Deposit not found' });
    const user = await User.findById(deposit.userId);
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    const credited = deposit.coin_amount + (deposit.bonus_coins || 0);
    const balanceAfter = user.balance ?? 0;
    const balanceBefore = balanceAfter - credited;

    try {
      await emitPendingPaymentCounts();
      await notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);
      await notifyDepositApproved({
        userId: user._id.toString(),
        amount: credited,
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
      await applyDepositBonusOnApproval({
        user,
        depositAmount: deposit.coin_amount,
        depositId: deposit._id.toString(),
        performedBy: req.userId,
      });
      await writeAudit({
        actorId: req.userId,
        action: 'deposit.approve',
        target: deposit._id.toString(),
        detail: `${deposit.coin_amount} BAC`,
      });
    } catch (error) {
      console.error('deposit approve side-effects failed:', error);
    }

    const channel = await PaymentChannel.findById(deposit.payment_channel);
    return res.json({ status: true, data: serializeDeposit(deposit, channel) });
  } catch (error) {
    if (error instanceof HighValueError || error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('approve deposit error:', error);
    return res.status(500).json({ status: false, message: 'Failed to approve deposit' });
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

router.patch('/:id/reject', requireAdmin, requirePermission('payments.manage'), async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid deposit id' });
    }
    await rejectDepositMoney(id);
    const deposit = await DepositHistory.findById(req.params.id);
    if (!deposit) return res.status(404).json({ status: false, message: 'Deposit not found' });
    if (deposit.coupon_code) await releaseCoupon(deposit.coupon_code);
    deposit.rejection_reason = req.body.rejection_reason || '';
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
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('reject deposit error:', error);
    return res.status(500).json({ status: false, message: 'Failed to reject deposit' });
  }
});

export default router;
