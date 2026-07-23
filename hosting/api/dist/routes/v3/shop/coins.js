import { Router } from 'express';
import crypto from 'crypto';
import { CoinRate } from '../../../models/CoinRate.js';
import { CoingoTransaction } from '../../../models/CoingoTransaction.js';
import { User } from '../../../models/User.js';
import { requireAuth } from '../../../middleware/auth.js';
import { serializeCoinRate } from '../../../utils/payment-serialize.js';
const router = Router();
function createMerchantSerialNo(prefix) {
    return `${prefix}${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
async function resolveStatus(tx) {
    if (tx.status !== 'pending')
        return tx;
    tx.pollCount += 1;
    if (tx.pollCount >= 2)
        tx.status = 'success';
    await tx.save();
    return tx;
}
router.get('/public', requireAuth, async (_req, res) => {
    try {
        const rates = await CoinRate.find({ isActive: true }).sort({ region: 1, currency: 1 });
        const results = rates.map(serializeCoinRate);
        return res.json({ status: true, data: results });
    }
    catch (error) {
        console.error('v3 shop coins public error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch coin rates' });
    }
});
router.post('/payout', requireAuth, async (req, res) => {
    try {
        const body = req.body;
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
            email: user.email,
            username: user.username,
            description: body.description?.trim() || '',
            status: 'pending',
        });
        return res.status(201).json({
            status: true,
            data: { merchantSerialNo: tx.merchantSerialNo, status: tx.status, amount: tx.amount },
        });
    }
    catch (error) {
        console.error('v3 coingo payout error:', error);
        return res.status(500).json({ status: false, message: 'Failed to create payout' });
    }
});
router.get('/payout/:merchantSerialNo', requireAuth, async (req, res) => {
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
    }
    catch (error) {
        console.error('v3 coingo payout status error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch payout status' });
    }
});
export default router;
