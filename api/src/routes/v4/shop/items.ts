import { Router } from 'express';
import { ShopItem } from '../../../models/ShopItem.js';
import { requireAuth } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import {
  buildSearchFilter,
  paginatedResults,
  parsePagination,
} from '../../../utils/pagination.js';
import { sanitizeUploadAttachment } from '../../../utils/safe-url.js';
import { serializeShopItem } from '../../../utils/payment-serialize.js';
import { safeQueryString, safeQueryStatus, SHOP_ITEM_STATUSES } from '../../../utils/query-filter.js';

const router = Router();

const USD_PER_BAC = 0.05;

function readAmount(raw: unknown) {
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) return null;
  return Math.round(amount);
}

function readDiscount(raw: unknown) {
  if (raw == null || raw === '') return 0;
  const discount = Number(raw);
  if (!Number.isFinite(discount) || discount < 0 || discount > 90) return null;
  return Math.round(discount * 10) / 10;
}

function pricesFor(amount: number, discountPercent: number) {
  const originalPrice = Math.round(amount * USD_PER_BAC * 100) / 100;
  const price = Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
  return { price, originalPrice, discountPercent };
}

function readImage(raw: unknown) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  const upload = sanitizeUploadAttachment(value);
  if (upload) return upload;
  if (value.startsWith('/assets/') && !value.includes('..') && !value.includes('\\')) {
    return value.slice(0, 500);
  }
  return null;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search, startDate, endDate } = parsePagination(req);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(search, ['symbol', 'badge']),
    };

    const includeInactive = req.query.includeInactive === 'true';
    if (!includeInactive) filter.isActive = true;
    const category = safeQueryString(req.query.category);
    if (category) filter.badge = category;
    const type = safeQueryStatus(req.query.type, SHOP_ITEM_STATUSES);
    if (type) filter.status = type;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = endDate;
    }

    const [items, count] = await Promise.all([
      ShopItem.find(filter).sort({ amount: 1 }).skip(skip).limit(limit),
      ShopItem.countDocuments(filter),
    ]);

    return res.json(paginatedResults(items.map(serializeShopItem), count));
  } catch (error) {
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
  } catch (error) {
    console.error('get shop item error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch shop item' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const amount = readAmount(req.body?.amount);
    const discountPercent = readDiscount(req.body?.discountPercent);
    const image = readImage(req.body?.image);
    if (amount == null || discountPercent == null) {
      return res.status(400).json({ status: false, message: 'Enter a BAC amount and a discount from 0 to 90' });
    }
    if (image == null) {
      return res.status(400).json({ status: false, message: 'Image must be an uploaded shop file' });
    }

    const duplicate = await ShopItem.findOne({ symbol: 'BAC', amount });
    if (duplicate) {
      return res.status(409).json({ status: false, message: 'A pack with this BAC amount already exists' });
    }

    const prices = pricesFor(amount, discountPercent);
    const item = await ShopItem.create({
      amount,
      badge: 'None',
      ...prices,
      symbol: 'BAC',
      paymentOptions: ['bkash', 'nagad', 'crypto'],
      image,
      isActive: req.body?.isActive !== false,
      status: 'available',
    });

    return res.status(201).json({ status: true, data: serializeShopItem(item) });
  } catch (error) {
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

    const amount = req.body.amount !== undefined ? readAmount(req.body.amount) : item.amount;
    const discountPercent =
      req.body.discountPercent !== undefined ? readDiscount(req.body.discountPercent) : item.discountPercent;
    if (amount == null || discountPercent == null) {
      return res.status(400).json({ status: false, message: 'Enter a BAC amount and a discount from 0 to 90' });
    }
    if (req.body.image !== undefined) {
      const image = readImage(req.body.image);
      if (image == null) {
        return res.status(400).json({ status: false, message: 'Image must be an uploaded shop file' });
      }
      item.image = image;
    }
    const duplicate = await ShopItem.findOne({ symbol: 'BAC', amount, _id: { $ne: item._id } });
    if (duplicate) {
      return res.status(409).json({ status: false, message: 'A pack with this BAC amount already exists' });
    }

    const prices = pricesFor(amount, discountPercent);
    item.amount = amount;
    item.price = prices.price;
    item.originalPrice = prices.originalPrice;
    item.discountPercent = prices.discountPercent;
    if (req.body.isActive !== undefined) item.isActive = Boolean(req.body.isActive);

    await item.save();
    return res.json({ status: true, data: serializeShopItem(item) });
  } catch (error) {
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
  } catch (error) {
    console.error('delete shop item error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete shop item' });
  }
});

export default router;
