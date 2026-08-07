import { Router } from 'express';
import {
  getPublicDashboardStats,
  PUBLIC_DASHBOARD_CACHE_KEY,
  PUBLIC_DASHBOARD_CACHE_TTL_MS,
} from '../../../utils/public-dashboard.js';
import { getCached, setCached } from '../../../utils/cache.js';

const router = Router();

function setDashboardCacheHeaders(res: import('express').Response, hit: boolean) {
  // Browsers: 30s; shared caches/CDN: 45s; allow stale while revalidating
  res.setHeader(
    'Cache-Control',
    'public, max-age=30, s-maxage=45, stale-while-revalidate=60'
  );
  res.setHeader('X-Cache', hit ? 'HIT' : 'MISS');
  res.setHeader('Vary', 'Accept-Encoding');
}

router.get('/', async (_req, res) => {
  try {
    const cached = getCached<Awaited<ReturnType<typeof getPublicDashboardStats>>>(
      PUBLIC_DASHBOARD_CACHE_KEY
    );
    if (cached) {
      setDashboardCacheHeaders(res, true);
      return res.json({ status: true, data: cached });
    }

    const data = await getPublicDashboardStats();
    setCached(PUBLIC_DASHBOARD_CACHE_KEY, data, PUBLIC_DASHBOARD_CACHE_TTL_MS);
    setDashboardCacheHeaders(res, false);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('public dashboard error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load public dashboard' });
  }
});

export default router;
