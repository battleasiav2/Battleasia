import { Router } from 'express';
import { getAppSettings } from '../../../models/AppSettings.js';
import { requireAuth } from '../../../middleware/auth.js';
const router = Router();
router.get('/details', requireAuth, async (_req, res) => {
    try {
        const settings = await getAppSettings();
        return res.json({
            premium: {
                premiumDuration: settings.premiumDuration,
                premiumPrice: settings.premiumPrice,
            },
        });
    }
    catch (error) {
        console.error('premium details error:', error);
        return res.status(500).json({ message: 'Failed to fetch premium details' });
    }
});
router.put('/update', requireAuth, async (req, res) => {
    try {
        const { premiumDuration, premiumPrice } = req.body;
        const settings = await getAppSettings();
        if (typeof premiumDuration === 'number')
            settings.premiumDuration = premiumDuration;
        if (typeof premiumPrice === 'number')
            settings.premiumPrice = premiumPrice;
        await settings.save();
        return res.json({
            premium: {
                premiumDuration: settings.premiumDuration,
                premiumPrice: settings.premiumPrice,
            },
        });
    }
    catch (error) {
        console.error('premium update error:', error);
        return res.status(500).json({ message: 'Failed to update premium details' });
    }
});
export default router;
