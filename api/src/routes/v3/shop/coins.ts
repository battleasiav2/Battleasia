import { Router } from 'express';
import { CoinRate } from '../../../models/CoinRate.js';
import { CoingoTransaction } from '../../../models/CoingoTransaction.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { serializeCoinRate } from '../../../utils/payment-serialize.js';
import { submitCoingoPayoutWithHold, syncCoingoPayoutWithdrawal } from '../../../utils/coingo-payout.js';
import { MoneyError } from '../../../utils/money.js';

const router = Router();

async function resolveStatus(tx: InstanceType<typeof CoingoTransaction>) {
  if (tx.status !== 'pending') return tx;
  const prev = tx.status;
  tx.pollCount += 1;
  if (tx.pollCount >= 2) tx.status = 'success';
  await tx.save();
  if (tx.status !== prev) {
    try {
      await syncCoingoPayoutWithdrawal(tx);
    } catch (err) {
      console.error('v3 coingo payout ledger sync error:', err);
    }
  }
  return tx;
}

router.get('/public', requireAuth, async (_req, res) => {
  try {
    const rates = await CoinRate.find({ isActive: true }).sort({ region: 1, currency: 1 });
    const results = rates.map(serializeCoinRate);
    return res.json({ status: true, data: results });
  } catch (error) {
    console.error('v3 shop coins public error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch coin rates' });
  }
});

router.post('/payout', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = req.body as {
      amount?: number;
      walletNumber?: string;
      walletType?: string;
      description?: string;
    };

    const idemKey = String(req.header('Idempotency-Key') || '').trim() || undefined;
    const data = await submitCoingoPayoutWithHold({
      userId: req.userId!,
      coinAmount: Number(body.amount),
      walletNumber: body.walletNumber ?? '',
      walletType: body.walletType ?? 'bKash',
      description: body.description,
      idempotencyKey: idemKey,
      req,
    });

    return res.status(201).json({ status: true, data });
  } catch (error) {
    if (error instanceof MoneyError) {
      return res.status(error.status).json({ status: false, message: error.message });
    }
    console.error('v3 coingo payout error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create payout' });
  }
});

router.get('/payout/:merchantSerialNo', requireAuth, async (req: AuthedRequest, res) => {
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
    console.error('v3 coingo payout status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payout status' });
  }
});

export default router;
