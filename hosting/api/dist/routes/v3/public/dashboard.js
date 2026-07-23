import { Router } from 'express';
import { getPublicDashboardStats } from '../../../utils/public-dashboard.js';
import { getCached, setCached } from '../../../utils/cache.js';
const router = Router();
const CACHE_KEY = 'public-dashboard';
const CACHE_TTL_MS = 45_000;
router.get('/', async (_req, res) => {
    try {
        const cached = getCached(CACHE_KEY);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json({ status: true, data: cached });
        }
        const data = await getPublicDashboardStats();
        setCached(CACHE_KEY, data, CACHE_TTL_MS);
        res.setHeader('X-Cache', 'MISS');
        return res.json({ status: true, data });
    }
    catch (error) {
        console.error('public dashboard error:', error);
        return res.status(500).json({ status: false, message: 'Failed to load public dashboard' });
    }
});
export default router;
