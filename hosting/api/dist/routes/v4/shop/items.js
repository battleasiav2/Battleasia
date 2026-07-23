import { Router } from 'express';
import { ShopItem } from '../../../models/ShopItem.js';
import { requireAuth } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { buildSearchFilter, paginatedResults, parsePagination, } from '../../../utils/pagination.js';
import { serializeShopItem } from '../../../utils/payment-serialize.js';
import { safeQueryString, safeQueryStatus, SHOP_ITEM_STATUSES } from '../../../utils/query-filter.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    try {
        const { skip, limit, search, startDate, endDate } = parsePagination(req);
        const filter = {
            ...buildSearchFilter(search, ['symbol', 'badge']),
        };
        const includeInactive = req.query.includeInactive === 'true';
        if (!includeInactive)
            filter.isActive = true;
        const category = safeQueryString(req.query.category);
        if (category)
            filter.badge = category;
        const type = safeQueryStatus(req.query.type, SHOP_ITEM_STATUSES);
        if (type)
            filter.status = type;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = startDate;
            if (endDate)
                filter.createdAt.$lte = endDate;
        }
        const [items, count] = await Promise.all([
            ShopItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ShopItem.countDocuments(filter),
        ]);
        return res.json(paginatedResults(items.map(serializeShopItem), count));
    }
    catch (error) {
        console.error('shop items error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch shop items' });
    }
});
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ status: false, message: 'Shop item not found' });
        }
        return res.json({ status: true, data: serializeShopItem(item) });
    }
    catch (error) {
        console.error('get shop item error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch shop item' });
    }
});
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { amount, badge = 'None', price, originalPrice = 0, discountPercent = 0, symbol = 'BAC', paymentOptions = ['bkash', 'nagad', 'crypto'], image = '', isActive = true, } = req.body;
        if (amount == null || price == null) {
            return res.status(400).json({ status: false, message: 'Amount and price are required' });
        }
        const item = await ShopItem.create({
            amount,
            badge,
            price,
            originalPrice,
            discountPercent,
            symbol,
            paymentOptions,
            image,
            isActive: Boolean(isActive),
            status: 'available',
        });
        return res.status(201).json({ status: true, data: serializeShopItem(item) });
    }
    catch (error) {
        console.error('create shop item error:', error);
        return res.status(500).json({ status: false, message: 'Failed to create shop item' });
    }
});
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ status: false, message: 'Shop item not found' });
        }
        const fields = [
            'amount', 'badge', 'price', 'originalPrice', 'discountPercent',
            'symbol', 'paymentOptions', 'image', 'isActive', 'status',
        ];
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        }
        await item.save();
        return res.json({ status: true, data: serializeShopItem(item) });
    }
    catch (error) {
        console.error('update shop item error:', error);
        return res.status(500).json({ status: false, message: 'Failed to update shop item' });
    }
});
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ status: false, message: 'Shop item not found' });
        }
        await item.deleteOne();
        return res.json({ status: true, message: 'Shop item deleted' });
    }
    catch (error) {
        console.error('delete shop item error:', error);
        return res.status(500).json({ status: false, message: 'Failed to delete shop item' });
    }
});
export default router;
