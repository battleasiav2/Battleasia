import { Router } from 'express';
import { LoginHistory } from '../../../models/LoginHistory.js';
import { requireAuth } from '../../../middleware/auth.js';
import {
  buildSearchFilter,
  paginatedResults,
  parsePagination,
} from '../../../utils/pagination.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search, startDate, endDate } = parsePagination(req);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(search, ['username', 'email', 'ip', 'country']),
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = endDate;
    }

    const [histories, count] = await Promise.all([
      LoginHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      LoginHistory.countDocuments(filter),
    ]);

    const results = histories.map((h) => ({
      _id: h._id.toString(),
      id: h._id.toString(),
      userId: h.userId.toString(),
      username: h.username,
      email: h.email,
      avatar: h.avatar,
      ip: h.ip,
      country: h.country,
      useragent: h.useragent,
      createdAt: h.createdAt,
    }));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('login histories error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch login histories' });
  }
});

export default router;
