import { Types } from 'mongoose';
import { Game } from '../models/Game.js';
import { Match } from '../models/Match.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { User } from '../models/User.js';

/** In-memory + CDN-friendly TTL for GET /api/v3/public/dashboard */
export const PUBLIC_DASHBOARD_CACHE_KEY = 'public-dashboard';
export const PUBLIC_DASHBOARD_CACHE_TTL_MS = 45_000;

type TopPlayerRow = {
  userId: Types.ObjectId;
  username: string;
  avatar: string;
  totalWinnings: number;
  totalMatches: number;
  totalKills: number;
  wins: number;
  lastPlayed: string | null;
};

function toTopPlayer(row: TopPlayerRow, extra?: { winRate?: number; averageScore?: number }) {
  const totalMatches = row.totalMatches || 1;
  return {
    userId: row.userId.toString(),
    username: row.username || 'Player',
    avatar: row.avatar || null,
    totalWinnings: Math.round(row.totalWinnings * 10) / 10,
    totalMatches: row.totalMatches,
    totalKills: row.totalKills,
    winRate: extra?.winRate ?? Math.round((row.wins / totalMatches) * 1000) / 10,
    averageScore: extra?.averageScore ?? Math.round((row.totalKills / totalMatches) * 10) / 10,
    lastPlayed: row.lastPlayed,
  };
}

async function aggregatePlayerStats(sortField: 'totalWinnings' | 'totalKills', limit = 5) {
  const rows = await Match.aggregate<TopPlayerRow>([
    { $match: { status: 'complete', 'results.0': { $exists: true } } },
    { $unwind: '$results' },
    {
      $lookup: {
        from: 'matchparticipants',
        localField: 'results.participantId',
        foreignField: '_id',
        as: 'participant',
      },
    },
    { $unwind: '$participant' },
    {
      $group: {
        _id: '$participant.userId',
        username: { $first: '$results.playerName' },
        avatar: { $first: '$results.avatar' },
        totalWinnings: {
          $sum: { $add: [{ $ifNull: ['$results.winPrize', 0] }, { $ifNull: ['$results.bonus', 0] }] },
        },
        totalMatches: { $sum: 1 },
        totalKills: { $sum: { $ifNull: ['$results.kills', 0] } },
        wins: {
          $sum: {
            $cond: [{ $eq: ['$results.status', 'winner'] }, 1, 0],
          },
        },
        lastPlayed: { $max: '$matchSchedule' },
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: limit },
    {
      $project: {
        userId: '$_id',
        username: 1,
        avatar: 1,
        totalWinnings: 1,
        totalMatches: 1,
        totalKills: 1,
        wins: 1,
        lastPlayed: 1,
      },
    },
  ]);

  const userIds = rows.map((r) => r.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('username avatar');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return rows
        .filter((row) => {
            const user = userMap.get(row.userId.toString());
            const username = (user?.username || row.username || '').trim().toLowerCase();
            return username !== 'testplayer' && !username.startsWith('testplayer');
        })
        .map((row) => {
            const user = userMap.get(row.userId.toString());
            return toTopPlayer(
      {
        ...row,
        username: user?.username || row.username,
        avatar: user?.avatar || row.avatar,
      },
      sortField === 'totalKills'
        ? { averageScore: Math.round((row.totalKills / Math.max(row.totalMatches, 1)) * 10) / 10 }
        : undefined
    );
  });
}

async function getGameNameMap(gameIds: string[]) {
  const validIds = gameIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  if (!validIds.length) {
    return new Map<string, string>();
  }

  const games = await Game.find({ _id: { $in: validIds } }).select('name').lean();
  return new Map(games.map((g) => [g._id.toString(), g.name]));
}

async function buildMatchSummaries(matches: Array<InstanceType<typeof Match>>) {
  if (!matches.length) return [];

  const matchIds = matches.map((m) => m._id);
  const participantCounts = await MatchParticipant.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { matchId: { $in: matchIds } } },
    { $group: { _id: '$matchId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(participantCounts.map((p) => [p._id.toString(), p.count]));

  const gameMap = await getGameNameMap(matches.map((m) => m.gameId.toString()));

  return matches.map((match) => ({
    id: match._id.toString(),
    matchName: match.matchName,
    matchSchedule: match.matchSchedule,
    status: match.status,
    entryFee: match.entryFee,
    perKill: match.perKill,
    totalPlayer: match.totalPlayer,
    prizeEstimate: Math.round(match.entryFee * match.totalPlayer * 10) / 10,
    banner: match.banner || '',
    gameName: gameMap.get(match.gameId.toString()) || '',
    participantsCount: countMap.get(match._id.toString()) || 0,
  }));
}

export async function getPublicDashboardStats() {
  const [winningsAgg, processedMatches, ongoingMatchesCount, topProfitPlayers, topPlayers, ongoingList, highPrizeList] =
    await Promise.all([
      Match.aggregate<{ total: number }>([
        { $match: { status: 'complete', 'results.0': { $exists: true } } },
        { $unwind: '$results' },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $add: [{ $ifNull: ['$results.winPrize', 0] }, { $ifNull: ['$results.bonus', 0] }] },
            },
          },
        },
      ]),
      Match.countDocuments({ status: 'complete' }),
      Match.countDocuments({ status: 'start' }),
      aggregatePlayerStats('totalWinnings', 5),
      aggregatePlayerStats('totalKills', 5),
      Match.find({ status: 'start' }).sort({ matchSchedule: 1 }).limit(5),
      Match.find({ status: { $in: ['active', 'start', 'complete'] } })
        .sort({ entryFee: -1, totalPlayer: -1 })
        .limit(5),
    ]);

  const totalWinnings = winningsAgg[0]?.total ?? 0;

  const [ongoingMatches, highPrizeMatches] = await Promise.all([
    buildMatchSummaries(ongoingList),
    buildMatchSummaries(highPrizeList),
  ]);

  const liveByGame = await Match.aggregate<{ _id: string; count: number }>([
    { $match: { status: 'start' } },
    { $group: { _id: '$gameId', count: { $sum: 1 } } },
  ]);
  const gameIds = liveByGame.map((r) => r._id).filter((id) => Types.ObjectId.isValid(id));
  const liveGameNames = gameIds.length
    ? await Game.find({ _id: { $in: gameIds.map((id) => new Types.ObjectId(id)) } })
        .select('name')
        .lean()
    : [];
  const gameNameMap = new Map(liveGameNames.map((g) => [g._id.toString(), g.name]));
  const liveCountByGame: Record<string, number> = {};
  for (const row of liveByGame) {
    const name = gameNameMap.get(row._id.toString());
    if (name) liveCountByGame[name] = row.count;
  }

  return {
    platform: {
      totalWinnings: Math.round(totalWinnings * 10) / 10,
      processedMatches,
      ongoingMatches: ongoingMatchesCount,
    },
    liveCountByGame,
    topProfitPlayers,
    topPlayers,
    ongoingMatches,
    highPrizeMatches,
  };
}
