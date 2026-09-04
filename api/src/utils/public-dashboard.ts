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

const DEMO_PULSE_USERNAME_BLOCKLIST = new Set(['testplayer', 'demouser', 'demo']);

function isDemoPulseUsername(username: string): boolean {
  const name = username.trim().toLowerCase();
  if (!name) return true;
  if (DEMO_PULSE_USERNAME_BLOCKLIST.has(name)) return true;
  return /^testplayer\d*$/.test(name);
}

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
  const fetchLimit = limit + 10;
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
    { $limit: fetchLimit },
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
      const username = user?.username || row.username || '';
      return !isDemoPulseUsername(username);
    })
    .slice(0, limit)
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

/** Start of calendar day in Asia/Dhaka (UTC+6). */
function startOfTodayDhaka(): Date {
  const offsetMs = 6 * 60 * 60 * 1000;
  const shifted = new Date(Date.now() + offsetMs);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - offsetMs
  );
}

async function countTodayJoinedUsers() {
  return User.countDocuments({
    createdAt: { $gte: startOfTodayDhaka() },
    'role.type': 'player',
    username: { $not: /^testplayer/i },
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

type MatchSummarySource = {
  _id: Types.ObjectId | string;
  gameId: Types.ObjectId | string;
  matchName: string;
  matchSchedule: string;
  status: string;
  entryFee: number;
  perKill: number;
  totalPlayer: number;
  banner?: string;
};

async function buildMatchSummaries(matches: MatchSummarySource[]) {
  if (!matches.length) return [];

  const matchIds = matches.map((m) => new Types.ObjectId(m._id.toString()));
  const participantCounts = await MatchParticipant.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { matchId: { $in: matchIds } } },
    { $group: { _id: '$matchId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(participantCounts.map((p) => [p._id.toString(), p.count]));

  const gameMap = await getGameNameMap(matches.map((m) => m.gameId.toString()));

  return matches.map((match) => ({
    id: match._id.toString(),
    gameId: match.gameId.toString(),
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

/** One highest-prize joinable match per game (up to 5 titles). */
async function getTopMatchPerGame(statuses: Array<'active' | 'start'>, limit = 5) {
  return Match.aggregate<MatchSummarySource>([
    { $match: { status: { $in: statuses } } },
    {
      $addFields: {
        _prize: {
          $multiply: [{ $ifNull: ['$entryFee', 0] }, { $ifNull: ['$totalPlayer', 0] }],
        },
      },
    },
    { $sort: { _prize: -1, matchSchedule: 1 } },
    { $group: { _id: '$gameId', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { _prize: -1 } },
    { $limit: limit },
  ]);
}

export async function getPublicDashboardStats() {
  const [
    winningsAgg,
    processedMatches,
    ongoingMatchesCount,
    todayJoinedUsers,
    topProfitPlayers,
    topPlayers,
    ongoingList,
    highPrizeList,
  ] =
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
      countTodayJoinedUsers(),
      aggregatePlayerStats('totalWinnings', 5),
      aggregatePlayerStats('totalKills', 5),
      getTopMatchPerGame(['start'], 5),
      getTopMatchPerGame(['active', 'start'], 5),
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
  const upcomingByGame = await Match.aggregate<{ _id: string; count: number }>([
    { $match: { status: 'active' } },
    { $group: { _id: '$gameId', count: { $sum: 1 } } },
  ]);
  const gameIds = [...new Set([...liveByGame, ...upcomingByGame].map((r) => r._id))].filter((id) =>
    Types.ObjectId.isValid(id)
  );
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
  const upcomingCountByGame: Record<string, number> = {};
  for (const row of upcomingByGame) {
    const name = gameNameMap.get(row._id.toString());
    if (name) upcomingCountByGame[name] = row.count;
  }

  const participantsByGameAgg = await MatchParticipant.aggregate<{ _id: string; count: number }>([
    {
      $lookup: {
        from: 'matches',
        localField: 'matchId',
        foreignField: '_id',
        as: 'match',
      },
    },
    { $unwind: '$match' },
    { $match: { 'match.status': { $in: ['active', 'start'] } } },
    { $group: { _id: '$match.gameId', count: { $sum: 1 } } },
  ]);
  const participantGameIds = participantsByGameAgg
    .map((row) => row._id)
    .filter((id) => Types.ObjectId.isValid(id));
  const participantGameNames = participantGameIds.length
    ? await Game.find({ _id: { $in: participantGameIds.map((id) => new Types.ObjectId(id)) } })
        .select('name')
        .lean()
    : [];
  const participantNameMap = new Map(participantGameNames.map((g) => [g._id.toString(), g.name]));
  const participantsByGame: Record<string, number> = {};
  for (const row of participantsByGameAgg) {
    const name = participantNameMap.get(row._id.toString());
    if (name) participantsByGame[name] = row.count;
  }

  return {
    platform: {
      totalWinnings: Math.round(totalWinnings * 10) / 10,
      processedMatches,
      ongoingMatches: ongoingMatchesCount,
      todayJoinedUsers,
    },
    liveCountByGame,
    upcomingCountByGame,
    participantsByGame,
    topProfitPlayers,
    topPlayers,
    ongoingMatches,
    highPrizeMatches,
  };
}
