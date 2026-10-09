import type { Types } from 'mongoose';
import { EngagementClaimOffer } from '../models/EngagementClaimOffer.js';
import { UserClaimOffer } from '../models/UserClaimOffer.js';
import { creditUserBac } from './credit-bac.js';

function offerStatus(input: {
  now: Date;
  startsAt: Date;
  endsAt?: Date | null;
  claimed: boolean;
  full: boolean;
}) {
  if (input.claimed) return 'claimed' as const;
  if (input.startsAt.getTime() > input.now.getTime()) return 'upcoming' as const;
  if (input.endsAt && input.endsAt.getTime() < input.now.getTime()) return 'ended' as const;
  if (input.full) return 'full' as const;
  return 'open' as const;
}

export async function listClaimOffersForUser(userId: Types.ObjectId | string) {
  const now = new Date();
  const offers = await EngagementClaimOffer.find({ active: true }).sort({ startsAt: 1, createdAt: -1 }).limit(40).lean();
  if (!offers.length) return [];

  const ids = offers.map((row) => row._id);
  const [mine, counts] = await Promise.all([
    UserClaimOffer.find({ userId, offerId: { $in: ids } }).select('offerId').lean(),
    UserClaimOffer.aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: { offerId: { $in: ids } } },
      { $group: { _id: '$offerId', n: { $sum: 1 } } },
    ]),
  ]);
  const claimed = new Set(mine.map((row) => String(row.offerId)));
  const taken = new Map(counts.map((row) => [String(row._id), row.n]));

  return offers
    .map((row) => {
      const used = taken.get(String(row._id)) || 0;
      const full = row.maxClaims > 0 && used >= row.maxClaims && !claimed.has(String(row._id));
      const status = offerStatus({
        now,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        claimed: claimed.has(String(row._id)),
        full,
      });
      if (status === 'ended') return null;
      return {
        id: String(row._id),
        title: row.title,
        description: row.description || '',
        bacAmount: row.bacAmount,
        startsAt: row.startsAt,
        endsAt: row.endsAt || null,
        status,
        canClaim: status === 'open',
      };
    })
    .filter(Boolean);
}

export async function claimOfferReward(userId: Types.ObjectId | string, offerId: string) {
  if (!/^[a-f0-9]{24}$/i.test(offerId)) {
    return { ok: false as const, message: 'Offer not found' };
  }

  const offer = await EngagementClaimOffer.findById(offerId);
  if (!offer || !offer.active) {
    return { ok: false as const, message: 'Offer not found' };
  }

  const now = new Date();
  if (offer.startsAt.getTime() > now.getTime()) {
    return { ok: false as const, message: 'This offer is not open yet' };
  }
  if (offer.endsAt && offer.endsAt.getTime() < now.getTime()) {
    return { ok: false as const, message: 'This offer has ended' };
  }

  const rewardAmount = Math.max(Number(offer.bacAmount) || 0, 0);
  if (rewardAmount <= 0 || rewardAmount > 100000) {
    return { ok: false as const, message: 'No reward configured' };
  }

  let row;
  try {
    row = await UserClaimOffer.create({
      userId,
      offerId: offer._id,
      claimedAt: now,
      bacAmount: rewardAmount,
    });
  } catch (error: unknown) {
    const code = (error as { code?: number })?.code;
    if (code === 11000) {
      return { ok: false as const, message: 'Already claimed' };
    }
    throw error;
  }

  if (offer.maxClaims > 0) {
    const used = await UserClaimOffer.countDocuments({ offerId: offer._id });
    if (used > offer.maxClaims) {
      await UserClaimOffer.deleteOne({ _id: row._id });
      return { ok: false as const, message: 'This offer is full' };
    }
  }

  const credited = await creditUserBac(userId, rewardAmount, {
    reason: 'engagement_offer_reward',
    offerId: offer._id.toString(),
    offerTitle: offer.title,
  });
  if (!credited) {
    await UserClaimOffer.deleteOne({ _id: row._id });
    return { ok: false as const, message: 'User not found' };
  }

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter: credited.balanceAfter,
      offerId: offer._id.toString(),
    },
  };
}
