import { Router } from 'express';
import { BalanceHistory } from '../../../models/BalanceHistory.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { buildSearchFilter, paginatedResults, parsePagination, } from '../../../utils/pagination.js';
import { serializeBalanceHistory } from '../../../utils/balance-history.js';
const router = Router();
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { skip, limit, search, startDate, endDate } = parsePagination(req);
        const filter = {
            ...buildSearchFilter(search, ['username', 'email']),
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = startDate;
            if (endDate)
                filter.createdAt.$lte = endDate;
        }
        const [histories, count] = await Promise.all([
            BalanceHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            BalanceHistory.countDocuments(filter),
        ]);
        return res.json(paginatedResults(histories.map(serializeBalanceHistory), count));
    }
    catch (error) {
        console.error('balance histories error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch balance histories' });
    }
});
export default router;
