import { Router } from 'express';
import { Game } from '../../models/Game.js';
import { Match } from '../../models/Match.js';
import { MatchParticipant } from '../../models/MatchParticipant.js';
import { User } from '../../models/User.js';
import { BalanceHistory } from '../../models/BalanceHistory.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { serializeMatch } from '../../utils/serialize.js';
import { notifyBalanceChange } from '../../utils/balance-notify.js';
import { notifyMatchJoined } from '../../utils/payment-notifications.js';
import { buildMyMatchHistory, buildUserMatchHistory } from '../../utils/match-history.js';
import { isUserPremium } from '../../utils/serialize.js';

const router = Router();

async function getGameNameMap(gameIds: string[]) {
  const games = await Game.find({ _id: { $in: gameIds } });
  return new Map(games.map((g) => [g._id.toString(), g.name]));
}

async function enrichMatchesForUser(
  matches: InstanceType<typeof Match>[],
  userId: string
) {
  const gameMap = await getGameNameMap(matches.map((m) => m.gameId.toString()));
  const matchIds = matches.map((m) => m._id);

  const [participantCounts, userParticipations] = await Promise.all([
    MatchParticipant.aggregate<{ _id: unknown; count: number }>([
      { $match: { matchId: { $in: matchIds } } },
      { $group: { _id: '$matchId', count: { $sum: 1 } } },
    ]),
    MatchParticipant.find({ matchId: { $in: matchIds }, userId }).select('matchId'),
  ]);

  const countMap = new Map(participantCounts.map((p) => [String(p._id), p.count]));
  const joinedSet = new Set(userParticipations.map((p) => p.matchId.toString()));

  return matches.map((match) => {
    const base = serializeMatch(match, gameMap.get(match.gameId.toString()));
    // Never expose room secrets on list payloads — fetch via /matches/:id/room after join.
    return {
      ...base,
      roomId: undefined,
      password: undefined,
      matchPrivateDescription: '',
      participantsCount: countMap.get(match._id.toString()) || 0,
      isJoined: joinedSet.has(match._id.toString()),
    };
  });
}

router.get('/', requireAuth, async (_req, res) => {
  try {
    const games = await Game.find({ status: true }).sort({ createdAt: -1 });
    return res.json({
      status: true,
      data: games.map((g) => ({
        _id: g._id.toString(),
        id: g._id.toString(),
        name: g.name,
        packageName: g.packageName,
        image: g.image || '',
        logo: g.logo || '',
        canCreateChallenge: g.canCreateChallenge ?? true,
        status: g.status,
        comingSoon: g.comingSoon ?? false,
        idPrefix: g.idPrefix,
        rules: g.rules || '',
      })),
    });
  } catch (error) {
    console.error('v2 games list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch games' });
  }
});

router.get('/matches/history/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const history = await buildMyMatchHistory(req.userId!);
    return res.json({ status: true, data: history });
  } catch (error) {
    console.error('v2 match history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch match history' });
  }
});

router.get('/matches/history/user/:userId', requireAuth, async (req, res) => {
  try {
    const history = await buildUserMatchHistory(String(req.params.userId));
    return res.json({ status: true, data: history });
  } catch (error) {
    console.error('v2 user match history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch user match history' });
  }
});

router.get('/matches', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const filter: Record<string, unknown> = {
      status: { $in: ['active', 'start', 'complete'] },
    };
    if (req.query.gameId) filter.gameId = req.query.gameId;

    const matches = await Match.find(filter).sort({ matchSchedule: -1 }).limit(200);
    const data = await enrichMatchesForUser(matches, req.userId!);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('v2 matches list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch matches' });
  }
});

router.get('/matches/:id/result', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    const game = await Game.findById(match.gameId);
    const participants = await MatchParticipant.find({ matchId: match._id });

    const resultParticipants = (match.results?.length ? match.results : []).map((entry) => {
      const participant = participants.find((p) => p._id.toString() === entry.participantId?.toString());
      return {
        id: participant?._id.toString() || entry.participantId?.toString() || '',
        username: entry.playerName || participant?.username || 'Player',
        avatar: entry.avatar || participant?.avatar || '',
        pubgId: entry.pubgId || participant?.pubgId || '',
        email: participant?.email || '',
        status: entry.status || 'lose',
        placement: entry.placement ?? null,
        kills: Number(entry.kills) || 0,
        points: Number(entry.points) || 0,
        winPrize: Number(entry.winPrize) || 0,
        bonus: Number(entry.bonus) || 0,
        refund: Number(entry.refund) || 0,
        entryFee: participant?.entryFee ?? match.entryFee,
      };
    });

    if (!resultParticipants.length && participants.length) {
      for (const p of participants) {
        resultParticipants.push({
          id: p._id.toString(),
          username: p.username,
          avatar: p.avatar || '',
          pubgId: p.pubgId || '',
          email: p.email || '',
          status: p.placement === 1 ? 'winner' : 'lose',
          placement: p.placement ?? null,
          kills: p.kills ?? 0,
          points: p.points ?? 0,
          winPrize: 0,
          bonus: 0,
          refund: 0,
          entryFee: p.entryFee,
        });
      }
    }

    return res.json({
      status: true,
      data: {
        id: match._id.toString(),
        gameName: game?.name || '',
        gameMode: match.gameMode,
        matchName: match.matchName,
        matchType: match.matchType,
        teamType: match.teamType,
        map: match.map,
        matchSchedule: match.matchSchedule,
        entryFee: match.entryFee,
        perKill: match.perKill,
        banner: match.banner || '',
        totalPlayer: match.totalPlayer,
        status: match.status,
        participants: resultParticipants,
        participantsCount: participants.length,
      },
    });
  } catch (error) {
    console.error('v2 match result error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch match result' });
  }
});

router.post('/matches/:id/check-join', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const existing = await MatchParticipant.findOne({ matchId: match._id, userId: user._id });
    const participantCount = await MatchParticipant.countDocuments({ matchId: match._id });

    const issues: string[] = [];
    if (!user.pubgId) issues.push('PUBG ID is required');
    if (existing) issues.push('Already joined');
    if (match.status !== 'active' && match.status !== 'start') issues.push('Match is not joinable');
    if (participantCount >= match.totalPlayer) issues.push('Match is full');
    if (match.entryFee > (user.balance ?? 0) && !existing) issues.push('Insufficient balance');
    if (match.premiumOnly && user && !isUserPremium(user)) issues.push('Premium required');

    return res.json({
      status: true,
      data: {
        canJoin: issues.length === 0,
        issues,
        isJoined: Boolean(existing),
        balance: user.balance ?? 0,
        entryFee: match.entryFee,
      },
    });
  } catch (error) {
    console.error('v2 check-join error:', error);
    return res.status(500).json({ status: false, message: 'Failed to check join status' });
  }
});

/** Joined players only — room id/password never returned on match list. */
router.get('/matches/:id/room', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const match = await Match.findById(req.params.id).select(
      'matchName map matchSchedule roomId password status'
    );
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    const participant = await MatchParticipant.findOne({
      matchId: match._id,
      userId: req.userId,
    }).select('_id');

    if (!participant) {
      return res.status(403).json({
        status: false,
        message: 'Join this match to view room credentials',
      });
    }

    return res.json({
      status: true,
      data: {
        matchName: match.matchName,
        map: match.map || '',
        matchSchedule: match.matchSchedule,
        roomId: match.roomId || '',
        password: match.password || '',
      },
    });
  } catch (error) {
    console.error('v2 match room credentials error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch room credentials' });
  }
});

router.post('/matches/:id/join', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    if (match.status !== 'active' && match.status !== 'start') {
      return res.status(400).json({ status: false, message: 'Match is not joinable' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    if (!user.pubgId) {
      return res.status(400).json({ status: false, message: 'PUBG ID is required to join matches' });
    }

    if (match.premiumOnly && !isUserPremium(user)) {
      return res.status(403).json({ status: false, message: 'Premium membership required' });
    }

    const existing = await MatchParticipant.findOne({ matchId: match._id, userId: user._id });
    if (existing) {
      return res.status(400).json({ status: false, message: 'Already joined this match' });
    }

    const participantCount = await MatchParticipant.countDocuments({ matchId: match._id });
    if (participantCount >= match.totalPlayer) {
      return res.status(400).json({ status: false, message: 'Match is full' });
    }

    const entryFee = match.matchType === 'free' ? 0 : match.entryFee;
    if (entryFee > (user.balance ?? 0)) {
      return res.status(400).json({ status: false, message: 'Insufficient balance' });
    }

    const balanceBefore = user.balance ?? 0;
    if (entryFee > 0) {
      user.balance = balanceBefore - entryFee;
      await user.save();

      await BalanceHistory.create({
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        amount: entryFee,
        type: 'withdraw',
        balanceBefore,
        balanceAfter: user.balance,
        detail: { reason: 'match_entry_fee', matchId: match._id.toString(), matchName: match.matchName },
      });

      await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
    }

    const participant = await MatchParticipant.create({
      matchId: match._id,
      userId: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || '',
      pubgId: user.pubgId,
      entryFee,
      joinedAt: new Date(),
    });

    await notifyMatchJoined({
      userId: user._id.toString(),
      matchId: match._id.toString(),
      matchName: match.matchName,
      entryFee,
    });

    return res.json({
      status: true,
      message: 'Joined match successfully',
      data: {
        participantId: participant._id.toString(),
        balance: user.balance,
        isJoined: true,
      },
    });
  } catch (error) {
    console.error('v2 join match error:', error);
    return res.status(500).json({ status: false, message: 'Failed to join match' });
  }
});

router.get('/matches/:id', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: false, message: 'Match not found' });
    }

    if (match.premiumOnly) {
      // Premium-only matches are visible but join is blocked on the client when not premium.
    }

    const game = await Game.findById(match.gameId);
    const [participants, userParticipant, participantsCount] = await Promise.all([
      MatchParticipant.find({ matchId: match._id }).sort({ joinedAt: -1 }).limit(50),
      MatchParticipant.findOne({ matchId: match._id, userId: req.userId }),
      MatchParticipant.countDocuments({ matchId: match._id }),
    ]);

    const isJoined = Boolean(userParticipant);
    // Room secrets only for participants — never for spectators / non-joiners.
    const showRoom = isJoined;

    return res.json({
      status: true,
      data: {
        id: match._id.toString(),
        gameName: game?.name || '',
        matchName: match.matchName,
        matchType: match.matchType,
        teamType: match.teamType,
        map: match.map,
        matchSchedule: match.matchSchedule,
        entryFee: match.entryFee,
        perKill: match.perKill,
        banner: match.banner || '',
        prizeDescription: match.prizeDescription || '',
        matchSponsor: match.matchSponsor || '',
        matchDescription: match.matchDescription || '',
        matchPrivateDescription: showRoom ? match.matchPrivateDescription || '' : '',
        matchUrl: match.matchUrl || '',
        totalPlayer: match.totalPlayer,
        premiumOnly: match.premiumOnly ?? false,
        status: match.status,
        participantsCount,
        isJoined,
        roomId: showRoom ? match.roomId : undefined,
        password: showRoom ? match.password : undefined,
        participants: participants.map((p) => ({
          id: p._id.toString(),
          username: p.username,
          pubgId: p.pubgId,
          avatar: p.avatar || '',
          joinedAt: p.joinedAt,
        })),
      },
    });
  } catch (error) {
    console.error('v2 match detail error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch match detail' });
  }
});

export default router;
