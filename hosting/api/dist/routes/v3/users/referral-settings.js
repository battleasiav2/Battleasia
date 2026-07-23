import { Router } from 'express';
import { getAppSettings } from '../../../models/AppSettings.js';
import { requireAuth } from '../../../middleware/auth.js';
const router = Router();
router.get('/details', requireAuth, async (_req, res) => {
    try {
        const settings = await getAppSettings();
        return res.json({
            referralSettings: {
                commissionRate: settings.commissionRate,
            },
        });
    }
    catch (error) {
        console.error('referral settings error:', error);
        return res.status(500).json({ message: 'Failed to fetch referral settings' });
    }
});
router.put('/update', requireAuth, async (req, res) => {
    try {
        const { commissionRate } = req.body;
        const settings = await getAppSettings();
        if (typeof commissionRate === 'number') {
            settings.commissionRate = Math.min(100, Math.max(0, commissionRate));
        }
        await settings.save();
        return res.json({
            referralSettings: {
                commissionRate: settings.commissionRate,
            },
        });
    }
    catch (error) {
        console.error('referral update error:', error);
        return res.status(500).json({ message: 'Failed to update referral settings' });
    }
});
export default router;
