import { Router } from 'express';
import type { Types } from 'mongoose';
import { Game } from '../../../models/Game.js';
import { Match, type IMatchResultEntry } from '../../../models/Match.js';
import { MatchParticipant } from '../../../models/MatchParticipant.js';
import { User } from '../../../models/User.js';
import { requireAuth } from '../../../middleware/auth.js';
import {
  buildSearchFilter,
  paginatedResults,
  parsePagination,
} from '../../../utils/pagination.js';
import { serializeMatch } from '../../../utils/serialize.js';
import { recordBalanceHistory } from '../../../utils/balance-history.js';
import { notifyBalanceChange } from '../../../utils/balance-notify.js';
import {
  notifyMatchCancelled,
  notifyMatchRefund,
  notifyMatchRoomReady,
  notifyMatchStarted,
  notifyMatchWinnings,
} from '../../../utils/payment-notifications.js';
import {
  emitDashboardStatsUpdated,
  emitMatchCreated,
  emitMatchUpdated,
} from '../../../utils/socket.js';
import { recordMatchEngagementProgress } from '../../../utils/engagement-service.js';

const router = Router();

async function getGameNameMap(gameIds: string[]) {
  const games = await Game.find({ _id: { $in: gameIds } });
  return new Map(games.map((g) => [g._id.toString(), g.name]));
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(search, ['matchName', 'roomId', 'map']),
    };
    if (req.query.gameId) filter.gameId = req.query.gameId;

    const [matches, count] = await Promise.all([
      Match.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Match.countDocuments(filter),
    ]);

    const gameMap = await getGameNameMap(matches.map((m) => m.gameId.toString()));
    const results = matches.map((m) => serializeMatch(m, gameMap.get(m.gameId.toString())));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('matches list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch matches' });
  }
});

router.get('/:id/participants', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter: Record<string, unknown> = { matchId: req.params.id };
    if (search) Object.assign(filter, buildSearchFilter(search, ['username', 'email', 'pubgId']));

    const [participants, count] = await Promise.all([
      MatchParticipant.find(filter).sort({ joinedAt: -1 }).skip(skip).limit(limit),
      MatchParticipant.countDocuments(filter),
    ]);

    const data = participants.map((p) => ({
      _id: p._id.toString(),
      id: p._id.toString(),
      userId: p.userId.toString(),
      username: p.username,
      email: p.email,
      avatar: p.avatar,
      pubgId: p.pubgId,
      entryFee: p.entryFee,
      joinedAt: p.joinedAt,
    }));

    return res.json({ status: true, data: { participants: data, count } });
  } catch (error) {
    console.error('participants error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch participants' });
  }
});

router.put('/:id/results', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    const { resultDescription, screenshots, results } = req.body;
    if (typeof resultDescription === 'string') match.resultDescription = resultDescription;
    if (Array.isArray(screenshots)) match.resultScreenshots = screenshots;
    if (Array.isArray(results)) match.results = results;

    await match.save();
    const game = await Game.findById(match.gameId);
    return res.json({ status: true, data: serializeMatch(match, game?.name) });
  } catch (error) {
    console.error('update results error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update match results' });
  }
});

router.put('/:id/entries', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    const entries = Array.isArray(req.body) ? req.body : req.body.entries;
    if (!Array.isArray(entries)) {
      return res.status(400).json({ status: false, message: 'Entries array is required' });
    }

    match.results = entries.map((entry: Record<string, unknown>): IMatchResultEntry => ({
      participantId: entry.participantId as Types.ObjectId,
      pubgId: String(entry.pubgId || ''),
      playerName: String(entry.playerName || ''),
      avatar: String(entry.avatar || ''),
      status: entry.status === 'lose' ? 'lose' : 'winner',
      placement: (entry.placement as number | null | undefined) ?? null,
      kills: Number(entry.kills) || 0,
      points: Number(entry.points) || 0,
      placePoint: Number(entry.placePoint) || 0,
      winPrize: Number(entry.winPrize) || 0,
      bonus: Number(entry.bonus) || 0,
      refund: Number(entry.refund) || 0,
    }));

    for (const entry of entries) {
      if (!entry.participantId) continue;
      await MatchParticipant.findByIdAndUpdate(entry.participantId, {
        placement: entry.placement ?? null,
        kills: Number(entry.kills) || 0,
        points: Number(entry.points) || 0,
      });
    }

    await match.save();
    const game = await Game.findById(match.gameId);
    return res.json({ status: true, data: serializeMatch(match, game?.name) });
  } catch (error) {
    console.error('update entries error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update entries' });
  }
});

router.post('/:id/distribute-winnings', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }
    if (match.winningsDistributed) {
      return res.status(400).json({ status: false, message: 'Winnings already distributed' });
    }

    for (const entry of match.results || []) {
      const participant = await MatchParticipant.findById(entry.participantId);
      if (!participant) continue;

      recordMatchEngagementProgress(participant.userId.toString(), {
        kills: Number(entry.kills) || 0,
        won: entry.status === 'winner',
        gameId: match.gameId?.toString(),
        teamType: match.teamType,
        matchId: match._id.toString(),
      }).catch((error) => {
        console.error('engagement match progress failed:', error);
      });
    }

    for (const entry of match.results || []) {
      const totalWin =
        (Number(entry.winPrize) || 0) +
        (Number(entry.bonus) || 0) +
        (Number(entry.placePoint) || 0);
      if (totalWin <= 0) continue;

      const participant = await MatchParticipant.findById(entry.participantId);
      if (!participant) continue;

      const user = await User.findById(participant.userId);
      if (!user) continue;

      const balanceBefore = user.balance ?? 0;
      user.balance = balanceBefore + totalWin;
      await user.save();

      await recordBalanceHistory({
        user,
        amount: totalWin,
        type: 'deposit',
        balanceBefore,
        balanceAfter: user.balance,
        detail: {
          reason: 'match_winnings',
          matchId: match._id.toString(),
          matchName: match.matchName,
        },
      });
      await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
      await notifyMatchWinnings({
        userId: user._id.toString(),
        amount: totalWin,
        matchId: match._id.toString(),
        matchName: match.matchName,
      });
    }

    match.winningsDistributed = true;
    match.status = 'complete';
    await match.save();

    const game = await Game.findById(match.gameId);
    const data = serializeMatch(match, game?.name);
    emitMatchUpdated({ ...data, gameId: match.gameId.toString() });
    await emitDashboardStatsUpdated();
    return res.json({ status: true, data });
  } catch (error) {
    console.error('distribute winnings error:', error);
    return res.status(500).json({ status: false, message: 'Failed to distribute winnings' });
  }
});

router.post('/:id/refund', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }
    if (match.entriesRefunded) {
      return res.status(400).json({ status: false, message: 'Entries already refunded' });
    }

    const participants = await MatchParticipant.find({ matchId: match._id });
    for (const participant of participants) {
      if (participant.entryFee <= 0) continue;

      const user = await User.findById(participant.userId);
      if (!user) continue;

      const balanceBefore = user.balance ?? 0;
      user.balance = balanceBefore + participant.entryFee;
      await user.save();

      await recordBalanceHistory({
        user,
        amount: participant.entryFee,
        type: 'deposit',
        balanceBefore,
        balanceAfter: user.balance,
        detail: {
          reason: 'match_entry_refund',
          matchId: match._id.toString(),
          matchName: match.matchName,
        },
      });
      await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
      await notifyMatchRefund({
        userId: user._id.toString(),
        amount: participant.entryFee,
        matchId: match._id.toString(),
        matchName: match.matchName,
      });
    }

    match.entriesRefunded = true;
    match.status = 'cancel';
    await match.save();

    await notifyMatchCancelled({
      matchId: match._id.toString(),
      matchName: match.matchName,
    });

    const game = await Game.findById(match.gameId);
    return res.json({ status: true, data: serializeMatch(match, game?.name) });
  } catch (error) {
    console.error('refund error:', error);
    return res.status(500).json({ status: false, message: 'Failed to refund entries' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }
    const game = await Game.findById(match.gameId);
    return res.json({ status: true, data: serializeMatch(match, game?.name) });
  } catch (error) {
    console.error('get match error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch match' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const body = req.body;
    if (!body.gameId || !body.matchName) {
      return res.status(400).json({ status: false, message: 'Game and match name are required' });
    }

    const game = await Game.findById(body.gameId);
    if (!game) {
      return res.status(404).json({ status: false, message: 'Game not found' });
    }

    const match = await Match.create({
      gameId: body.gameId,
      gameMode: body.gameMode || 'classic',
      roomId: body.roomId || '',
      password: body.password || '',
      matchName: body.matchName,
      matchUrl: body.matchUrl || '',
      matchSchedule: body.matchSchedule || new Date().toISOString(),
      killRateType: body.killRateType || 'automatic',
      entryFee: Number(body.entryFee) || 0,
      totalPlayer: Number(body.totalPlayer) || 100,
      teamType: body.teamType || 'solo',
      perKill: Number(body.perKill) || 1,
      matchType: body.matchType || 'paid',
      map: body.map || '',
      totalKills: body.totalKills,
      banner: body.banner || '',
      prizeDescription: body.prizeDescription || '',
      matchSponsor: body.matchSponsor || '',
      matchDescription: body.matchDescription || '',
      matchPrivateDescription: body.matchPrivateDescription || '',
      premiumOnly: Boolean(body.premiumOnly),
      platformFeePercent: Number(body.platformFeePercent) || 5,
      status: body.status || 'active',
    });

    const data = serializeMatch(match, game.name);
    emitMatchCreated({ ...data, gameId: match.gameId.toString() });
    await emitDashboardStatsUpdated();

    return res.status(201).json({ status: true, data });
  } catch (error) {
    console.error('create match error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create match' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    const prevStatus = match.status;
    const prevRoomId = (match.roomId || '').trim();

    const updatable = [
      'gameId', 'gameMode', 'roomId', 'password', 'matchName', 'matchUrl',
      'matchSchedule', 'killRateType', 'entryFee', 'totalPlayer', 'teamType',
      'perKill', 'matchType', 'map', 'totalKills', 'banner', 'prizeDescription',
      'matchSponsor', 'matchDescription', 'matchPrivateDescription',
      'premiumOnly', 'platformFeePercent', 'status',
    ] as const;

    for (const field of updatable) {
      if (req.body[field] !== undefined) {
        (match as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    }

    await match.save();

    const nextRoomId = (match.roomId || '').trim();
    const roomJustPublished = Boolean(nextRoomId) && nextRoomId !== prevRoomId;
    const statusJustStarted = prevStatus !== 'start' && match.status === 'start';

    if (roomJustPublished) {
      await notifyMatchRoomReady({
        matchId: match._id.toString(),
        matchName: match.matchName,
        roomId: nextRoomId,
        password: match.password || '',
      });
    } else if (statusJustStarted) {
      await notifyMatchStarted({
        matchId: match._id.toString(),
        matchName: match.matchName,
      });
    }

    const game = await Game.findById(match.gameId);
    const data = serializeMatch(match, game?.name);
    emitMatchUpdated({ ...data, gameId: match.gameId.toString() });
    await emitDashboardStatsUpdated();
    return res.json({ status: true, data });
  } catch (error) {
    console.error('update match error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update match' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }
    await MatchParticipant.deleteMany({ matchId: match._id });
    await match.deleteOne();
    return res.json({ status: true, message: 'Match deleted' });
  } catch (error) {
    console.error('delete match error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete match' });
  }
});

export default router;
