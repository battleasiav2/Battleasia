import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import { EngagementBadge } from '../../../models/EngagementBadge.js';
import {
  buildSearchFilter,
  paginatedWithTotal,
  parsePagination,
} from '../../../utils/pagination.js';
import { serializeEngagementBadge } from '../../../utils/engagement-serialize.js';

const router = Router();

const VALID_CRITERIA = new Set(['total_kills', 'total_wins']);

function normalizeBadgeBody(body: Record<string, unknown>) {
  const key = String(body.key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  const criteria = VALID_CRITERIA.has(String(body.criteria)) ? String(body.criteria) : 'total_kills';

  return {
    key,
    title: String(body.title || '').trim().slice(0, 120),
    description: String(body.description || '').trim().slice(0, 500),
    icon: String(body.icon || 'solar:medal-ribbons-star-bold').trim().slice(0, 80),
    criteria,
    threshold: Math.min(Math.max(Number(body.threshold) || 1, 1), 1000000),
    tier: Math.min(Math.max(Number(body.tier) || 1, 1), 100),
    active: body.active !== false,
    sortOrder: Math.max(Number(body.sortOrder) || 0, 0),
    gameId: body.gameId && String(body.gameId).trim() ? String(body.gameId).trim() : null,
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter = buildSearchFilter(search, ['key', 'title', 'description']);

    const [badges, total] = await Promise.all([
      EngagementBadge.find(filter).sort({ sortOrder: 1, threshold: 1 }).skip(skip).limit(limit),
      EngagementBadge.countDocuments(filter),
    ]);

    return res.json(paginatedWithTotal(badges.map(serializeEngagementBadge), total));
  } catch (error) {
    console.error('engagement badges list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch badges' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const badge = await EngagementBadge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ status: false, message: 'Badge not found' });
    }
    return res.json({ status: true, data: serializeEngagementBadge(badge) });
  } catch (error) {
    console.error('engagement badge get error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch badge' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = normalizeBadgeBody(req.body || {});
    if (!payload.key || !payload.title) {
      return res.status(400).json({ status: false, message: 'Key and title are required' });
    }

    const badge = await EngagementBadge.create(payload);
    return res.status(201).json({ status: true, data: serializeEngagementBadge(badge) });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ status: false, message: 'Badge key already exists' });
    }
    console.error('engagement badge create error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create badge' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const badge = await EngagementBadge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ status: false, message: 'Badge not found' });
    }

    const payload = normalizeBadgeBody({ ...badge.toObject(), ...req.body });
    if (!payload.title) {
      return res.status(400).json({ status: false, message: 'Title is required' });
    }

    badge.title = payload.title;
    badge.description = payload.description;
    badge.icon = payload.icon;
    badge.criteria = payload.criteria as typeof badge.criteria;
    badge.threshold = payload.threshold;
    badge.tier = payload.tier;
    badge.active = payload.active;
    badge.sortOrder = payload.sortOrder;
    badge.gameId = payload.gameId as typeof badge.gameId;

    if (payload.key && payload.key !== badge.key) {
      badge.key = payload.key;
    }

    await badge.save();
    return res.json({ status: true, data: serializeEngagementBadge(badge) });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ status: false, message: 'Badge key already exists' });
    }
    console.error('engagement badge update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update badge' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const badge = await EngagementBadge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ status: false, message: 'Badge not found' });
    }
    await badge.deleteOne();
    return res.json({ status: true, message: 'Badge deleted' });
  } catch (error) {
    console.error('engagement badge delete error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete badge' });
  }
});

export default router;
