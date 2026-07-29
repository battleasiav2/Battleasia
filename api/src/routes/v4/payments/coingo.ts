import { Router } from 'express';
import crypto from 'crypto';
import { CoingoTransaction } from '../../../models/CoingoTransaction.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { env } from '../../../config/env.js';

const router = Router();

function createMerchantSerialNo(prefix: string) {
  return `${prefix}${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function resolveStatus(tx: InstanceType<typeof CoingoTransaction>) {
  if (tx.status !== 'pending') return tx;

  if (!env.coingoMock) {
    return tx;
  }

  tx.pollCount += 1;
  if (tx.pollCount >= 2) {
    tx.status = 'success';
  }
  await tx.save();
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

    const coinAmount = Number(body.amount);
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      return res.status(400).json({ status: false, message: 'Valid amount is required' });
    }
    if (!body.walletNumber?.trim()) {
      return res.status(400).json({ status: false, message: 'Wallet number is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const merchantSerialNo = createMerchantSerialNo('POUT');
    const tx = await CoingoTransaction.create({
      merchantSerialNo,
      userId: user._id,
      type: 'payout',
      amount: coinAmount,
      walletNumber: body.walletNumber.trim(),
      walletType: body.walletType?.trim() || 'bKash',
      email: body.email?.trim() || user.email,
      username: body.username?.trim() || user.username,
      currency_type: body.currency_type?.trim() || 'BDT',
      currency_amount: Number(body.currency_amount) || 0,
      description: body.description?.trim() || '',
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
