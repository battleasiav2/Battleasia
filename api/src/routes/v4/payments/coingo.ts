import { Router } from 'express';
import { CoingoTransaction } from '../../../models/CoingoTransaction.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';

const router = Router();

/** Honest capability flag until a verified Coingo gateway exists. */
router.get('/capabilities', (_req, res) => {
  return res.json({
    status: true,
    data: {
      mockMode: false,
      automatedPayout: false,
      automatedCollection: false,
      checklist: ['Staff review each withdrawal before it is paid. Automated payout is not active.'],
    },
  });
});

router.post('/collection/start', requireAuth, async (_req: AuthedRequest, res) => {
  return res.status(400).json({
    status: false,
    message: 'Automated collection is not available.',
  });
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

    return res.json({
      status: true,
      data: {
        merchantSerialNo: tx.merchantSerialNo,
        status: tx.status,
        amount: tx.amount,
      },
    });
  } catch (error) {
    console.error('coingo collection status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch collection status' });
  }
});

router.post('/payout', requireAuth, async (_req: AuthedRequest, res) => {
  return res.status(400).json({
    status: false,
    message: 'Automated payout is not available. Submit a withdrawal request for staff review.',
  });
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

    return res.json({
      status: true,
      data: {
        merchantSerialNo: tx.merchantSerialNo,
        status: tx.status,
        amount: tx.amount,
      },
    });
  } catch (error) {
    console.error('coingo payout status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch payout status' });
  }
});

export default router;
