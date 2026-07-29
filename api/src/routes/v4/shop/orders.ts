import { Router } from 'express';
import { ShopOrder } from '../../../models/ShopOrder.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { safeQueryStatus, ORDER_STATUSES } from '../../../utils/query-filter.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = {};
    const status = safeQueryStatus(req.query.status, ORDER_STATUSES);
    if (status) filter.status = status;

    const [orders, count] = await Promise.all([
      ShopOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ShopOrder.countDocuments(filter),
    ]);

    const results = orders.map((order) => ({
      _id: order._id.toString(),
      id: order._id.toString(),
      userId: order.userId.toString(),
      username: order.username,
      email: order.email,
      itemId: order.itemId.toString(),
      amount: order.amount,
      price: order.price,
      symbol: order.symbol,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('shop orders error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch shop orders' });
  }
});

export default router;
