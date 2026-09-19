import { Router } from 'express';
import mongoose from 'mongoose';
import { LabEntity, type LabKind } from '../../models/LabEntity.js';
import { User } from '../../models/User.js';
import { Feed } from '../../models/Feed.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { getAppSettings } from '../../models/AppSettings.js';
import { normalizeP2Flags, type P2Flags } from '../../utils/p2-flags.js';

const router = Router();

const KIND_FLAG: Record<LabKind, keyof P2Flags> = {
  live: 'liveGifting',
  watch: 'watchParty',
  clan: 'clans',
  duel: 'oneVone',
  ocr: 'ocrResults',
  cosmetic: 'customizationStore',
  fantasy: 'fantasy',
};

const COSMETICS = [
  { title: 'Aurora ring', tag: 'aurora', priceBac: 40 },
  { title: 'Victory gold', tag: 'gold', priceBac: 80 },
  { title: 'Night ops', tag: 'ops', priceBac: 120 },
];

function mapRow(row: InstanceType<typeof LabEntity>, userId?: string) {
  return {
    id: row._id.toString(),
    kind: row.kind,
    title: row.title,
    tag: row.tag,
    hostId: row.hostId.toString(),
    hostName: row.hostName,
    memberIds: row.members.map((id) => id.toString()),
    members: row.members.length,
    hearts: row.hearts,
    status: row.status,
    matchId: row.matchId || '',
    imageUrl: row.imageUrl,
    picks: row.picks || [],
    stake: row.stake || 0,
    priceBac: row.priceBac || 0,
    giftBac: row.giftBac || 0,
    joined: Boolean(userId && row.members.some((id) => id.toString() === userId)),
    messages: (row.messages || []).slice(-40).map((m) => ({
      username: m.username,
      body: m.body,
      createdAt: m.createdAt,
    })),
  };
}

async function assertFlag(res: { status: (n: number) => { json: (b: unknown) => unknown } }, key: keyof P2Flags) {
  const settings = await getAppSettings();
  const flags = normalizeP2Flags(settings.p2);
  if (!flags[key]) {
    res.status(403).json({ status: false, message: 'This P2 flag is off' });
    return false;
  }
  return true;
}

function asKind(raw: string): LabKind | null {
  if (raw === 'live' || raw === 'watch' || raw === 'clan' || raw === 'duel' || raw === 'ocr' || raw === 'cosmetic' || raw === 'fantasy') {
    return raw;
  }
  return null;
}

router.get('/creators', requireAuth, async (_req: AuthedRequest, res) => {
  try {
    if (!(await assertFlag(res, 'creatorLeaderboard'))) return;
    const creators = await Feed.aggregate([
      { $match: { status: 'published', authorId: { $ne: null } } },
      { $group: { _id: '$authorId', posts: { $sum: 1 }, likes: { $sum: '$totalLikes' }, views: { $sum: '$totalViews' } } },
      { $sort: { likes: -1, views: -1 } },
      { $limit: 25 },
    ]);
    const users = await User.find({ _id: { $in: creators.map((c) => c._id) } }).select('username avatar');
    const map = new Map(users.map((u) => [u._id.toString(), u]));
    return res.json({
      status: true,
      data: {
        results: creators.map((c, i) => {
          const u = map.get(c._id.toString());
          return {
            id: c._id.toString(),
            rank: i + 1,
            username: u?.username || '',
            avatar: u?.avatar || '',
            posts: c.posts,
            likes: c.likes,
            views: c.views,
          };
        }),
      },
    });
  } catch (error) {
    console.error('labs creators error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load creators' });
  }
});

router.get('/:kind', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const kind = asKind(String(req.params.kind || ''));
    if (!kind) return res.status(404).json({ status: false, message: 'Unknown lab' });
    if (!(await assertFlag(res, KIND_FLAG[kind]))) return;

    if (kind === 'cosmetic') {
      const existing = await LabEntity.countDocuments({ kind: 'cosmetic' });
      if (existing === 0) {
        const host = await User.findById(req.userId);
        await LabEntity.insertMany(
          COSMETICS.map((c) => ({
            kind: 'cosmetic',
            title: c.title,
            tag: c.tag,
            priceBac: c.priceBac,
            hostId: host?._id,
            hostName: 'store',
            members: [],
            status: 'catalog',
          })),
        );
      }
    }

    const rows = await LabEntity.find({ kind }).sort({ createdAt: -1 }).limit(40);
    const me = await User.findById(req.userId).select('cosmeticId');
    return res.json({
      status: true,
      data: { results: rows.map((r) => mapRow(r, req.userId)), cosmeticId: me?.cosmeticId || '' },
    });
  } catch (error) {
    console.error('labs list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load lab' });
  }
});

router.post('/:kind', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const kind = asKind(String(req.params.kind || ''));
    if (!kind) return res.status(404).json({ status: false, message: 'Unknown lab' });
    if (!(await assertFlag(res, KIND_FLAG[kind]))) return;
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    if (kind === 'cosmetic') {
      const tag = String(req.body?.tag || '').trim();
      const item = await LabEntity.findOne({ kind: 'cosmetic', tag });
      if (!item) return res.status(404).json({ status: false, message: 'Skin not found' });
      const price = item.priceBac || 0;
      if (price > 0 && user.cosmeticId !== tag) {
        const { moveWallet, MoneyError } = await import('../../utils/money.js');
        try {
          await moveWallet({
            userId: user._id.toString(),
            amount: price,
            direction: 'debit',
            otherAccount: 'platform:cosmetics',
            refType: 'cosmetic_buy',
            refId: item._id.toString(),
            reason: 'cosmetic_buy',
            idempotencyKey: String(req.header('Idempotency-Key') || '').trim() || undefined,
          });
        } catch (error) {
          if (error instanceof MoneyError) {
            return res.status(error.status).json({ status: false, message: error.message });
          }
          throw error;
        }
      }
      user.cosmeticId = tag;
      await user.save();
      return res.json({ status: true, data: { cosmeticId: tag, priceBac: price } });
    }

    const title = String(req.body?.title || '').trim().slice(0, 80);
    if (!title && kind !== 'ocr') {
      return res.status(400).json({ status: false, message: 'Title is required' });
    }

    const stake = kind === 'duel' ? Math.min(Math.max(Number(req.body?.stake) || 10, 1), 200) : 0;

    const row = await LabEntity.create({
      kind,
      title: title || 'OCR ticket',
      tag: String(req.body?.tag || '').trim().slice(0, 24),
      hostId: user._id,
      hostName: user.username,
      members: [user._id],
      matchId: String(req.body?.matchId || ''),
      imageUrl: String(req.body?.imageUrl || ''),
      picks: Array.isArray(req.body?.picks) ? req.body.picks.map((p: unknown) => String(p).slice(0, 40)).slice(0, 8) : [],
      status: kind === 'ocr' ? 'queued' : 'open',
      stake,
      giftBac: 0,
    });
    if (kind === 'duel' && stake > 0) {
      const { moveWallet, MoneyError } = await import('../../utils/money.js');
      try {
        await moveWallet({
          userId: user._id.toString(),
          amount: stake,
          direction: 'debit',
          otherAccount: `lab:${row._id}:pool`,
          refType: 'duel_stake',
          refId: row._id.toString(),
          reason: 'duel_stake',
        });
        row.giftBac = stake;
        await row.save();
      } catch (error) {
        await LabEntity.deleteOne({ _id: row._id });
        if (error instanceof MoneyError) {
          return res.status(error.status).json({ status: false, message: error.message });
        }
        throw error;
      }
    }
    return res.status(201).json({ status: true, data: mapRow(row, req.userId) });
  } catch (error) {
    console.error('labs create error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create' });
  }
});

router.post('/:kind/:id/join', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const kind = asKind(String(req.params.kind || ''));
    if (!kind) return res.status(404).json({ status: false, message: 'Unknown lab' });
    if (!(await assertFlag(res, KIND_FLAG[kind]))) return;
    const row = await LabEntity.findOne({ _id: req.params.id, kind });
    if (!row) return res.status(404).json({ status: false, message: 'Not found' });
    const uid = req.userId as string;
    if (!row.members.some((id) => id.toString() === uid)) {
      if (kind === 'duel' && row.stake > 0) {
        if (row.members.length >= 2) return res.status(400).json({ status: false, message: 'Duel is full' });
        const { moveWallet, MoneyError } = await import('../../utils/money.js');
        try {
          await moveWallet({
            userId: uid,
            amount: row.stake,
            direction: 'debit',
            otherAccount: `lab:${row._id}:pool`,
            refType: 'duel_stake',
            refId: row._id.toString(),
            reason: 'duel_stake',
          });
        } catch (error) {
          if (error instanceof MoneyError) {
            return res.status(error.status).json({ status: false, message: error.message });
          }
          throw error;
        }
        row.giftBac = (row.giftBac || 0) + row.stake;
      }
      row.members.push(new mongoose.Types.ObjectId(uid));
    }
    await row.save();
    return res.json({ status: true, data: mapRow(row, uid) });
  } catch (error) {
    console.error('labs join error:', error);
    return res.status(500).json({ status: false, message: 'Failed to join' });
  }
});

router.post('/:kind/:id/heart', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!(await assertFlag(res, 'liveGifting'))) return;
    const row = await LabEntity.findOne({ _id: req.params.id, kind: req.params.kind });
    if (!row) return res.status(404).json({ status: false, message: 'Not found' });
    row.hearts += 1;
    await row.save();
    return res.json({ status: true, data: { hearts: row.hearts } });
  } catch (error) {
    console.error('labs heart error:', error);
    return res.status(500).json({ status: false, message: 'Failed to react' });
  }
});

router.post('/:kind/:id/message', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const kind = asKind(String(req.params.kind || ''));
    if (!kind) return res.status(404).json({ status: false, message: 'Unknown lab' });
    if (!(await assertFlag(res, KIND_FLAG[kind]))) return;
    const body = String(req.body?.body || '').trim().slice(0, 240);
    if (!body) return res.status(400).json({ status: false, message: 'Message required' });
    const user = await User.findById(req.userId);
    const row = await LabEntity.findOne({ _id: req.params.id, kind });
    if (!row || !user) return res.status(404).json({ status: false, message: 'Not found' });
    row.messages.push({ userId: user._id, username: user.username, body, createdAt: new Date() });
    if (row.messages.length > 80) row.messages = row.messages.slice(-80);
    await row.save();
    return res.json({ status: true, data: mapRow(row, req.userId) });
  } catch (error) {
    console.error('labs message error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send' });
  }
});

router.post('/:kind/:id/gift', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!(await assertFlag(res, 'liveGifting'))) return;
    const row = await LabEntity.findById(req.params.id);
    if (!row || row.kind !== 'live') return res.status(404).json({ status: false, message: 'Live lobby not found' });
    const amount = Math.min(Math.max(Number(req.body?.amount) || 0, 1), 200);
    if (row.hostId.toString() === req.userId) {
      return res.status(400).json({ status: false, message: 'Cannot gift yourself' });
    }
    const { transferMoney, MoneyError } = await import('../../utils/money.js');
    try {
      await transferMoney({
        senderId: String(req.userId),
        recipientUsername: row.hostName,
        amount,
        feeAmount: 0,
        totalDebited: amount,
        feePercent: 0,
        note: 'Live gift',
        idempotencyKey: String(req.header('Idempotency-Key') || '').trim() || undefined,
      });
    } catch (error) {
      if (error instanceof MoneyError) {
        return res.status(error.status).json({ status: false, message: error.message });
      }
      throw error;
    }
    row.giftBac = (row.giftBac || 0) + amount;
    await row.save();
    return res.json({ status: true, data: mapRow(row, req.userId) });
  } catch (error) {
    console.error('labs gift error:', error);
    return res.status(500).json({ status: false, message: 'Gift failed' });
  }
});

router.post('/:kind/:id/watch-earn', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const row = await LabEntity.findById(req.params.id);
    if (!row || (row.kind !== 'live' && row.kind !== 'watch')) {
      return res.status(404).json({ status: false, message: 'Room not found' });
    }
    if (!(await assertFlag(res, row.kind === 'watch' ? 'watchParty' : 'liveGifting'))) return;
    const { BalanceHistory } = await import('../../models/BalanceHistory.js');
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const today = await BalanceHistory.countDocuments({
      userId: req.userId,
      'detail.reason': 'watch_to_earn',
      createdAt: { $gte: start },
    });
    if (today >= 5) return res.status(429).json({ status: false, message: 'Daily watch-to-earn cap reached' });
    const { moveWallet, MoneyError } = await import('../../utils/money.js');
    try {
      const paid = await moveWallet({
        userId: String(req.userId),
        amount: 1,
        direction: 'credit',
        otherAccount: 'platform:watch-earn',
        refType: 'watch_to_earn',
        refId: row._id.toString(),
        reason: 'watch_to_earn',
        idempotencyKey: `watch:${req.userId}:${row._id}:${start.toISOString().slice(0, 10)}`,
      });
      return res.json({ status: true, data: { balance: paid.balance, credited: paid.replayed ? 0 : 1 } });
    } catch (error) {
      if (error instanceof MoneyError) {
        return res.status(error.status).json({ status: false, message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('watch earn error:', error);
    return res.status(500).json({ status: false, message: 'Watch earn failed' });
  }
});

router.post('/:kind/:id/war', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!(await assertFlag(res, 'clans'))) return;
    const home = await LabEntity.findOne({ _id: req.params.id, kind: 'clan' });
    const opp = await LabEntity.findOne({ _id: String(req.body?.opponentId || ''), kind: 'clan' });
    if (!home || !opp) return res.status(404).json({ status: false, message: 'Clan not found' });
    if (home._id.toString() === opp._id.toString()) {
      return res.status(400).json({ status: false, message: 'Pick a different clan' });
    }
    const uid = String(req.userId);
    if (home.hostId.toString() !== uid) {
      return res.status(403).json({ status: false, message: 'Only the clan host can start a war' });
    }
    const war = await LabEntity.create({
      kind: 'clan',
      title: `${home.tag || home.title} vs ${opp.tag || opp.title}`,
      tag: 'war',
      hostId: home.hostId,
      hostName: home.hostName,
      members: [...new Set([...home.members, ...opp.members].map((id) => id.toString()))].map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      status: 'war',
    });
    return res.status(201).json({ status: true, data: mapRow(war, uid) });
  } catch (error) {
    console.error('clan war error:', error);
    return res.status(500).json({ status: false, message: 'War failed' });
  }
});

router.post('/:kind/:id/score', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!(await assertFlag(res, 'fantasy'))) return;
    const row = await LabEntity.findOne({ _id: req.params.id, kind: 'fantasy' });
    if (!row) return res.status(404).json({ status: false, message: 'Lineup not found' });
    if (row.hostId.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Only the owner can score' });
    }
    if (row.status === 'scored') return res.status(400).json({ status: false, message: 'Already scored' });
    row.status = 'scored';
    row.giftBac = (row.picks || []).length;
    await row.save();
    return res.json({ status: true, data: mapRow(row, req.userId) });
  } catch (error) {
    console.error('fantasy score error:', error);
    return res.status(500).json({ status: false, message: 'Score failed' });
  }
});

router.post('/:kind/:id/resolve', requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!(await assertFlag(res, 'oneVone'))) return;
    const row = await LabEntity.findOne({ _id: req.params.id, kind: 'duel' });
    if (!row) return res.status(404).json({ status: false, message: 'Duel not found' });
    if (row.hostId.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Only the host can resolve' });
    }
    if (row.status === 'complete') return res.status(400).json({ status: false, message: 'Already resolved' });
    const winnerId = String(req.body?.winnerId || req.userId);
    if (!row.members.some((id) => id.toString() === winnerId)) {
      return res.status(400).json({ status: false, message: 'Winner must be in the duel' });
    }
    const pot = roundMoneySafe(row.giftBac || row.stake * row.members.length);
    if (pot > 0) {
      const { moveWallet, MoneyError } = await import('../../utils/money.js');
      try {
        await moveWallet({
          userId: winnerId,
          amount: pot,
          direction: 'credit',
          otherAccount: `lab:${row._id}:pool`,
          refType: 'duel_payout',
          refId: row._id.toString(),
          reason: 'duel_payout',
        });
      } catch (error) {
        if (error instanceof MoneyError) {
          return res.status(error.status).json({ status: false, message: error.message });
        }
        throw error;
      }
    }
    row.status = 'complete';
    row.giftBac = 0;
    await row.save();
    return res.json({ status: true, data: mapRow(row, req.userId) });
  } catch (error) {
    console.error('duel resolve error:', error);
    return res.status(500).json({ status: false, message: 'Resolve failed' });
  }
});

function roundMoneySafe(value: number) {
  return Math.round(value * 100) / 100;
}

export default router;
