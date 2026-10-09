import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import { EngagementClaimOffer } from '../../../models/EngagementClaimOffer.js';
import { UserClaimOffer } from '../../../models/UserClaimOffer.js';

const router = Router();

function parseOfferBody(body: Record<string, unknown>) {
  const title = String(body.title || '').trim().slice(0, 80);
  const description = String(body.description || '').trim().slice(0, 240);
  const bacAmount = Math.round(Number(body.bacAmount) || 0);
  const startsAt = body.startsAt ? new Date(String(body.startsAt)) : null;
  const endsAt = body.endsAt ? new Date(String(body.endsAt)) : null;
  const maxClaims = Math.round(Number(body.maxClaims) || 0);
  const active = body.active !== false;

  if (!title) return { error: 'Title is required' as const };
  if (!Number.isFinite(bacAmount) || bacAmount < 1 || bacAmount > 100000) {
    return { error: 'BAC must be between 1 and 100000' as const };
  }
  if (!startsAt || Number.isNaN(startsAt.getTime())) return { error: 'Start time is required' as const };
  if (endsAt && Number.isNaN(endsAt.getTime())) return { error: 'End time is invalid' as const };
  if (endsAt && endsAt.getTime() <= startsAt.getTime()) return { error: 'End time must be after the start' as const };
  if (!Number.isFinite(maxClaims) || maxClaims < 0 || maxClaims > 1000000) {
    return { error: 'Claim cap is invalid' as const };
  }

  return {
    value: {
      title,
      description,
      bacAmount,
      startsAt,
      endsAt,
      maxClaims,
      active,
    },
  };
}

function serialize(row: {
  _id: { toString(): string };
  title: string;
  description: string;
  bacAmount: number;
  startsAt: Date;
  endsAt?: Date | null;
  active: boolean;
  maxClaims: number;
  createdAt: Date;
}, claimedCount: number) {
  return {
    id: row._id.toString(),
    title: row.title,
    description: row.description,
    bacAmount: row.bacAmount,
    startsAt: row.startsAt,
    endsAt: row.endsAt || null,
    active: row.active,
    maxClaims: row.maxClaims,
    claimedCount,
    createdAt: row.createdAt,
  };
}

router.get('/', requireAuth, async (_req, res) => {
  try {
    const rows = await EngagementClaimOffer.find().sort({ startsAt: -1, createdAt: -1 }).limit(100);
    const ids = rows.map((row) => row._id);
    const counts = await UserClaimOffer.aggregate<{ _id: unknown; n: number }>([
      { $match: { offerId: { $in: ids } } },
      { $group: { _id: '$offerId', n: { $sum: 1 } } },
    ]);
    const taken = new Map(counts.map((row) => [String(row._id), row.n]));
    return res.json({
      status: true,
      data: rows.map((row) => serialize(row, taken.get(String(row._id)) || 0)),
    });
  } catch (error) {
    console.error('claim offers list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load claim offers' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = parseOfferBody(req.body && typeof req.body === 'object' ? req.body : {});
    if ('error' in parsed) return res.status(400).json({ status: false, message: parsed.error });
    const row = await EngagementClaimOffer.create(parsed.value);
    return res.status(201).json({ status: true, data: serialize(row, 0) });
  } catch (error) {
    console.error('claim offer create error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create claim offer' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const parsed = parseOfferBody(req.body && typeof req.body === 'object' ? req.body : {});
    if ('error' in parsed) return res.status(400).json({ status: false, message: parsed.error });
    const row = await EngagementClaimOffer.findByIdAndUpdate(req.params.id, parsed.value, { new: true });
    if (!row) return res.status(404).json({ status: false, message: 'Offer not found' });
    const claimedCount = await UserClaimOffer.countDocuments({ offerId: row._id });
    return res.json({ status: true, data: serialize(row, claimedCount) });
  } catch (error) {
    console.error('claim offer update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update claim offer' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const row = await EngagementClaimOffer.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ status: false, message: 'Offer not found' });
    return res.json({ status: true });
  } catch (error) {
    console.error('claim offer delete error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete claim offer' });
  }
});

export default router;
