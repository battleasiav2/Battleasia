import { Router } from 'express';
import { CoinRate } from '../../../models/CoinRate.js';
import { requireAuth } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { serializeCoinRate } from '../../../utils/payment-serialize.js';
const router = Router();
router.get('/', requireAuth, async (_req, res) => {
    try {
        const rates = await CoinRate.find().sort({ region: 1, currency: 1 });
        const results = rates.map(serializeCoinRate);
        return res.json({ status: true, data: { results, count: results.length } });
    }
    catch (error) {
        console.error('coin rates error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch coin rates' });
    }
});
router.get('/public', requireAuth, async (_req, res) => {
    try {
        const rates = await CoinRate.find({ isActive: true }).sort({ region: 1, currency: 1 });
        const results = rates.map(serializeCoinRate);
        return res.json({ status: true, data: results });
    }
    catch (error) {
        console.error('coin rates public error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch coin rates' });
    }
});
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { region, currency, rate, isActive = true } = req.body;
        if (!region || !currency || rate == null) {
            return res.status(400).json({ status: false, message: 'Region, currency and rate are required' });
        }
        const coinRate = await CoinRate.create({ region, currency, rate, isActive: Boolean(isActive) });
        return res.status(201).json({ status: true, data: serializeCoinRate(coinRate) });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: false, message: 'Coin rate already exists for this region/currency' });
        }
        console.error('create coin rate error:', error);
        return res.status(500).json({ status: false, message: 'Failed to create coin rate' });
    }
});
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const coinRate = await CoinRate.findById(req.params.id);
        if (!coinRate) {
            return res.status(404).json({ status: false, message: 'Coin rate not found' });
        }
        const { region, currency, rate, isActive } = req.body;
        if (region)
            coinRate.region = region;
        if (currency)
            coinRate.currency = currency;
        if (rate != null)
            coinRate.rate = rate;
        if (typeof isActive === 'boolean')
            coinRate.isActive = isActive;
        await coinRate.save();
        return res.json({ status: true, data: serializeCoinRate(coinRate) });
    }
    catch (error) {
        console.error('update coin rate error:', error);
        return res.status(500).json({ status: false, message: 'Failed to update coin rate' });
    }
});
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const coinRate = await CoinRate.findById(req.params.id);
        if (!coinRate) {
            return res.status(404).json({ status: false, message: 'Coin rate not found' });
        }
        await coinRate.deleteOne();
        return res.json({ status: true, message: 'Coin rate deleted' });
    }
    catch (error) {
        console.error('delete coin rate error:', error);
        return res.status(500).json({ status: false, message: 'Failed to delete coin rate' });
    }
});
export default router;
