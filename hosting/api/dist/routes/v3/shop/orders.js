import { Router } from 'express';
import { ShopOrder } from '../../../models/ShopOrder.js';
import { ShopItem } from '../../../models/ShopItem.js';
import { User } from '../../../models/User.js';
import { requireAuth } from '../../../middleware/auth.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { safeQueryStatus, ORDER_STATUSES } from '../../../utils/query-filter.js';
const router = Router();
router.post('/checkout', requireAuth, async (req, res) => {
    try {
        const { items, paymentMethod = 'manual' } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ status: false, message: 'Cart items are required' });
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const orders = [];
        for (const line of items) {
            const quantity = Math.max(1, Number(line.quantity) || 1);
            const shopItem = await ShopItem.findById(line.itemId);
            if (!shopItem || !shopItem.isActive) {
                return res.status(404).json({ status: false, message: `Shop item not found: ${line.itemId}` });
            }
            for (let i = 0; i < quantity; i += 1) {
                const order = await ShopOrder.create({
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    itemId: shopItem._id,
                    amount: shopItem.amount,
                    price: shopItem.price,
                    symbol: shopItem.symbol || 'BAC',
                    paymentMethod,
                    status: 'pending',
                });
                orders.push({
                    _id: order._id.toString(),
                    id: order._id.toString(),
                    itemId: shopItem._id.toString(),
                    amount: order.amount,
                    price: order.price,
                    symbol: order.symbol,
                    status: order.status,
                    createdAt: order.createdAt,
                });
            }
        }
        return res.status(201).json({ status: true, data: { orders, count: orders.length } });
    }
    catch (error) {
        console.error('shop checkout error:', error);
        return res.status(500).json({ status: false, message: 'Checkout failed' });
    }
});
router.get('/me', requireAuth, async (req, res) => {
    try {
        const { skip, limit } = parsePagination(req);
        const filter = { userId: req.userId };
        const status = safeQueryStatus(req.query.status, ORDER_STATUSES);
        if (status)
            filter.status = status;
        const [orders, count] = await Promise.all([
            ShopOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ShopOrder.countDocuments(filter),
        ]);
        const itemIds = [...new Set(orders.map((o) => o.itemId.toString()))];
        const items = await ShopItem.find({ _id: { $in: itemIds } });
        const itemMap = new Map(items.map((i) => [i._id.toString(), i]));
        const results = orders.map((order) => {
            const item = itemMap.get(order.itemId.toString());
            return {
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
                item: item
                    ? {
                        id: item._id.toString(),
                        amount: item.amount,
                        badge: item.badge,
                        price: item.price,
                        symbol: item.symbol,
                    }
                    : null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };
        });
        return res.json(paginatedResults(results, count));
    }
    catch (error) {
        console.error('v3 shop orders me error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch orders' });
    }
});
export default router;
