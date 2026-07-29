import { Types } from 'mongoose';
import { Match } from '../models/Match.js';
import { User } from '../models/User.js';

type Period = 'all' | 'weekly' | 'monthly';

type AggregatedRow = {
  userId: Types.ObjectId;
  username: string;
  avatar: string;
  totalWinnings: number;
  totalMatches: number;
  totalKills: number;
  wins: number;
  lastPlayed: string | null;
  totalScore?: number;
};

function periodStart(period: Period): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'weekly') {
    return new Date(now.getTime() - 7 * 86_400_000);
  }
  return new Date(now.getTime() - 30 * 86_400_000);
}

function badgeForRank(rank: number) {
  if (rank === 1) return 'Champion';
  if (rank <= 3) return 'Elite';
  if (rank <= 10) return 'Pro';
  return 'Rookie';
}

export async function getLeaderboardEntries(period: Period = 'all', limit = 50) {
  const start = periodStart(period);
  const matchFilter: Record<string, unknown> = {
    status: 'complete',
    'results.0': { $exists: true },
  };
  if (start) {
    matchFilter.matchSchedule = { $gte: start.toISOString() };
  }

  const rows = await Match.aggregate<AggregatedRow>([
    { $match: matchFilter },
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
          $sum: {
            $add: [
              { $ifNull: ['$results.winPrize', 0] },
              { $ifNull: ['$results.bonus', 0] },
              { $ifNull: ['$results.placePoint', 0] },
            ],
          },
        },
        totalMatches: { $sum: 1 },
        totalKills: { $sum: { $ifNull: ['$results.kills', 0] } },
        wins: { $sum: { $cond: [{ $eq: ['$results.status', 'winner'] }, 1, 0] } },
        lastPlayed: { $max: '$matchSchedule' },
      },
    },
    {
      $addFields: {
        totalScore: {
          $add: [
            '$totalWinnings',
            { $multiply: ['$totalKills', 5] },
          ],
        },
      },
    },
    { $sort: { totalScore: -1 } },
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
        totalScore: 1,
      },
    },
  ]);

  const userIds = rows.map((r) => r.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('username avatar');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return rows.map((row, index) => {
    const user = userMap.get(row.userId.toString());
    const gamesPlayed = row.totalMatches || 1;
    const totalScore = Math.round((row.totalScore ?? row.totalWinnings) * 10) / 10;
    const rank = index + 1;

    return {
      id: row.userId.toString(),
      rank,
      username: user?.username || row.username || 'Player',
      avatar: user?.avatar || row.avatar || null,
      totalScore,
      gamesPlayed: row.totalMatches,
      averageScore: Math.round((totalScore / gamesPlayed) * 10) / 10,
      badge: badgeForRank(rank),
      level: Math.min(99, Math.floor(row.totalMatches / 3) + 1),
      lastPlayed: row.lastPlayed,
      totalKills: row.totalKills,
    };
  });
}
