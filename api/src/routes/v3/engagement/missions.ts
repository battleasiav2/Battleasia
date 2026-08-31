import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import { EngagementMission, normalizeEngagementMissionReward } from '../../../models/EngagementMission.js';
import {
  buildSearchFilter,
  paginatedWithTotal,
  parsePagination,
} from '../../../utils/pagination.js';
import { serializeEngagementMission } from '../../../utils/engagement-serialize.js';

const router = Router();

const VALID_TYPES = new Set(['daily', 'weekly', 'one_time', 'event']);
const VALID_ACTIONS = new Set([
  'daily_login',
  'join_match',
  'win_match',
  'get_kills',
  'complete_profile',
  'first_deposit',
  'refer_user',
  'manual',
]);

function normalizeMissionBody(body: Record<string, unknown>) {
  const key = String(body.key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  const type = VALID_TYPES.has(String(body.type)) ? String(body.type) : 'daily';
  const action = VALID_ACTIONS.has(String(body.action)) ? String(body.action) : 'manual';

  return {
    key,
    title: String(body.title || '').trim().slice(0, 120),
    description: String(body.description || '').trim().slice(0, 500),
    icon: String(body.icon || 'solar:gift-bold').trim().slice(0, 80),
    type,
    action,
    targetCount: Math.min(Math.max(Number(body.targetCount) || 1, 1), 1000),
    reward: normalizeEngagementMissionReward(
      body.reward && typeof body.reward === 'object' ? (body.reward as Record<string, unknown>) : null
    ),
    active: body.active !== false,
    inDailyPool: type === 'daily' ? body.inDailyPool !== false : false,
    sortOrder: Math.max(Number(body.sortOrder) || 0, 0),
    startsAt: body.startsAt ? new Date(String(body.startsAt)) : null,
    endsAt: body.endsAt ? new Date(String(body.endsAt)) : null,
    gameId: body.gameId && String(body.gameId).trim() ? String(body.gameId).trim() : null,
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter = buildSearchFilter(search, ['key', 'title', 'description']);

    const [missions, total] = await Promise.all([
      EngagementMission.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      EngagementMission.countDocuments(filter),
    ]);

    return res.json(paginatedWithTotal(missions.map(serializeEngagementMission), total));
  } catch (error) {
    console.error('engagement missions list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch missions' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const mission = await EngagementMission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ status: false, message: 'Mission not found' });
    }
    return res.json({ status: true, data: serializeEngagementMission(mission) });
  } catch (error) {
    console.error('engagement mission get error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch mission' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = normalizeMissionBody(req.body || {});
    if (!payload.key || !payload.title) {
      return res.status(400).json({ status: false, message: 'Key and title are required' });
    }

    const mission = await EngagementMission.create(payload);
    return res.status(201).json({ status: true, data: serializeEngagementMission(mission) });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ status: false, message: 'Mission key already exists' });
    }
    console.error('engagement mission create error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create mission' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const mission = await EngagementMission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ status: false, message: 'Mission not found' });
    }

    const payload = normalizeMissionBody({ ...mission.toObject(), ...req.body });
    if (!payload.title) {
      return res.status(400).json({ status: false, message: 'Title is required' });
    }

    mission.title = payload.title;
    mission.description = payload.description;
    mission.icon = payload.icon;
    mission.type = payload.type as typeof mission.type;
    mission.action = payload.action as typeof mission.action;
    mission.targetCount = payload.targetCount;
    mission.reward = payload.reward;
    mission.active = payload.active;
    mission.inDailyPool = payload.type === 'daily' ? payload.inDailyPool !== false : false;
    mission.sortOrder = payload.sortOrder;
    mission.startsAt = payload.startsAt;
    mission.endsAt = payload.endsAt;
    mission.gameId = payload.gameId as typeof mission.gameId;

    if (payload.key && payload.key !== mission.key) {
      mission.key = payload.key;
    }

    await mission.save();
    return res.json({ status: true, data: serializeEngagementMission(mission) });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ status: false, message: 'Mission key already exists' });
    }
    console.error('engagement mission update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update mission' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const mission = await EngagementMission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ status: false, message: 'Mission not found' });
    }
    await mission.deleteOne();
    return res.json({ status: true, message: 'Mission deleted' });
  } catch (error) {
    console.error('engagement mission delete error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete mission' });
  }
});

export default router;
