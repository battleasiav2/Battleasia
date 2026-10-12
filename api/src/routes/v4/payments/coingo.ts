import { Router } from 'express';
import crypto from 'crypto';
import { CoingoTransaction } from '../../../models/CoingoTransaction.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { env } from '../../../config/env.js';
import { submitCoingoPayoutWithHold, syncCoingoPayoutWithdrawal } from '../../../utils/coingo-payout.js';
import { MoneyError } from '../../../utils/money.js';

const router = Router();

/** Player/shop UI: whether automated Coingo is active (no secrets). */
router.get('/capabilities', (_req, res) => {
  const mockMode = env.coingoMock;
  return res.json({
    status: true,
    data: {
      mockMode,
      automatedPayout: !mockMode,
      automatedCollection: !mockMode,
      checklist: mockMode
        ? ['Set COINGO_MOCK=false on the API server before production', 'Add live Coingo gateway credentials in server env', 'Run one test payout on staging']
        : ['Coingo gateway enabled — failed payouts fall back to manual admin review', 'Keep business wallet numbers updated in Admin → Wallets'],
    },
  });
});

function createMerchantSerialNo(prefix: string) {
  return `${prefix}${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function resolveStatus(tx: InstanceType<typeof CoingoTransaction>) {
  if (tx.status !== 'pending') return tx;

  if (!env.coingoMock) {
    return tx;
  }

  const prev = tx.status;
  tx.pollCount += 1;
  if (tx.pollCount >= 2) {
    tx.status = 'success';
  }
  await tx.save();
  if (tx.status !== prev) {
    try {
      await syncCoingoPayoutWithdrawal(tx);
    } catch (err) {
      console.error('coingo payout ledger sync error:', err);
    }
  }
  return tx;
}

router.post('/collection/start', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { amount, walletNumber, walletType } = req.body as {
      amount?: number;
      walletNumber?: string;
      walletType?: string;
    };

    const coinAmount = Number(amount);
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      return res.status(400).json({ status: false, message: 'Valid amount is required' });
    }
    if (!walletNumber?.trim()) {
      return res.status(400).json({ status: false, message: 'Wallet number is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const merchantSerialNo = createMerchantSerialNo('CIN');
    const tx = await CoingoTransaction.create({
      merchantSerialNo,
      userId: user._id,
      type: 'collection',
      amount: coinAmount,
      walletNumber: walletNumber.trim(),
      walletType: walletType?.trim() || 'bKash',
      email: user.email,
      username: user.username,
      status: 'pending',
    });

    return res.status(201).json({
      status: true,
      data: {
        merchantSerialNo: tx.merchantSerialNo,
        status: tx.status,
        amount: tx.amount,
      },
    });
  } catch (error) {
    console.error('coingo collection start error:', error);
    return res.status(500).json({ status: false, message: 'Failed to start collection' });
  }
});

router.get('/collection/:merchantSerialNo/status', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const tx = await CoingoTransaction.findOne({
      merchantSerialNo: req.params.merchantSerialNo,
      userId: req.userId,
      type: 'collection',
    });
    if (!tx) {
      return res.status(404).json({ status: false, message: 'Transaction not found' });
    }

    const updated = await resolveStatus(tx);
    return res.json({
      status: true,
      data: {
        merchantSerialNo: updated.merchantSerialNo,
        status: updated.status,
        amount: updated.amount,
      },
    });
  } catch (error) {
    console.error('coingo collection status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch collection status' });
  }
});

router.post('/payout', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = req.body as {
      amount?: number;
      walletNumber?: string;
      walletType?: string;
      description?: string;
      email?: string;
      username?: string;
      currency_type?: string;
      currency_amount?: number;
    };

    const idemKey = String(req.header('Idempotency-Key') || '').trim() || undefined;
    const data = await submitCoingoPayoutWithHold({
      userId: req.userId!,
      coinAmount: Number(body.amount),
      walletNumber: body.walletNumber ?? '',
      walletType: body.walletType ?? 'bKash',
      email: body.email,
      username: body.username,
      currency_type: body.currency_type,
      currency_amount: body.currency_amount,
      description: body.description,
      idempotencyKey: idemKey,
      req,
    });

    return res.status(201).json({ status: true, data });
  } catch (error) {
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('coingo payout error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create payout' });
  }
});

router.get('/payout/:merchantSerialNo/status', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const tx = await CoingoTransaction.findOne({
      merchantSerialNo: req.params.merchantSerialNo,
      userId: req.userId,
      type: 'payout',
    });
    if (!tx) {
      return res.status(404).json({ status: false, message: 'Transaction not found' });
    }

    const updated = await resolveStatus(tx);
    return res.json({
      status: true,
      data: {
        merchantSerialNo: updated.merchantSerialNo,
        status: updated.status,
        amount: updated.amount,
      },
    });
  } catch (error) {
    console.error('coingo payout status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payout status' });
  }
});

export default router;
