import { Router } from 'express';
import { CoinRate } from '../../../models/CoinRate.js';
import { CoingoTransaction } from '../../../models/CoingoTransaction.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { serializeCoinRate } from '../../../utils/payment-serialize.js';

const router = Router();

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

router.post('/payout', requireAuth, async (_req: AuthedRequest, res) => {
  return res.status(400).json({
    status: false,
    message: 'Automated payout is not available. Submit a withdrawal request for staff review.',
  });
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

    return res.json({
      status: true,
      data: {
        merchantSerialNo: tx.merchantSerialNo,
        status: tx.status,
        amount: tx.amount,
      },
    });
  } catch (error) {
    console.error('v3 coingo payout status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payout status' });
  }
});

export default router;
