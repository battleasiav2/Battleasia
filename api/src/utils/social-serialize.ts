import type { IUser } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { Feed } from '../models/Feed.js';
import { Reel } from '../models/Reel.js';
import { Story } from '../models/Story.js';
import { UserBlock } from '../models/UserBlock.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { Match } from '../models/Match.js';

export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    Follow.countDocuments({ followingId: userId }),
    Follow.countDocuments({ followerId: userId }),
  ]);
  return { followers, following };
}

export async function isFollowing(followerId: string, followingId: string) {
  if (followerId === followingId) return false;
  return Boolean(await Follow.exists({ followerId, followingId }));
}

export async function isBlocked(blockerId: string, blockedId: string) {
  return Boolean(
    await UserBlock.exists({
      $or: [
        { blockerId, blockedId },
        { blockerId: blockedId, blockedId: blockerId },
      ],
    })
  );
}

export async function getUserGamingStats(userId: string) {
  const participations = await MatchParticipant.find({ userId }).select('_id matchId');
  const matchIds = participations.map((p) => p.matchId);
  const matches = await Match.find({ _id: { $in: matchIds }, status: 'complete' });
  const matchMap = new Map(matches.map((m) => [m._id.toString(), m]));

  let totalMatches = 0;
  let totalWins = 0;
  let totalKills = 0;
  let totalLosses = 0;

  for (const p of participations) {
    const match = matchMap.get(p.matchId.toString());
    if (!match) continue;
    const result = match.results?.find((r) => r.participantId?.toString() === p._id.toString());
    if (!result) continue;
    totalMatches += 1;
    totalKills += result.kills || 0;
    if (result.status === 'winner') totalWins += 1;
    else totalLosses += 1;
  }

  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return {
    totalMatches,
    totalWins,
    totalLosses,
    winRate,
    totalKills,
    deaths: Math.max(0, totalMatches - totalWins),
    assists: 0,
    mvp: totalWins,
    rank: null as string | null,
    tournamentsPlayed: totalMatches,
    tournamentWins: totalWins,
    xp: totalKills * 10 + totalWins * 50,
    level: Math.max(1, Math.floor((totalKills * 10 + totalWins * 50) / 500) + 1),
  };
}

export async function getUserSocialStats(userId: string) {
  const [posts, reels, stories, likesAgg] = await Promise.all([
    Feed.countDocuments({ authorId: userId, status: 'published' }),
    Reel.countDocuments({ userId, status: 'published' }),
    Story.countDocuments({ userId, expiresAt: { $gt: new Date() } }),
    Feed.aggregate<{ total: number }>([
      { $match: { authorId: userId } },
      { $group: { _id: null, total: { $sum: '$totalLikes' } } },
    ]),
  ]);

  const { followers, following } = await getFollowCounts(userId);

  return {
    followers,
    following,
    friends: 0,
    posts,
    stories,
    reels,
    likes: likesAgg[0]?.total || 0,
  };
}

export async function serializePublicUser(
  user: IUser,
  viewerId?: string
) {
  const userId = user._id.toString();
  const [socialStats, gamingStats, following, postsCount, blockedByViewer] = await Promise.all([
    getUserSocialStats(userId),
    getUserGamingStats(userId),
    viewerId ? isFollowing(viewerId, userId) : Promise.resolve(false),
    Feed.countDocuments({ authorId: userId, status: 'published' }),
    viewerId && viewerId !== userId ? isBlocked(viewerId, userId) : Promise.resolve(false),
  ]);

  return {
    _id: userId,
    id: userId,
    email: viewerId === userId ? user.email : '',
    username: user.username,
    displayName: user.displayName || user.username,
    referralCode: user.referralCode || '',
    avatar: user.avatar || '',
    coverUrl: user.coverUrl || '',
    bio: user.bio || '',
    countryCode: user.countryCode || '',
    website: user.website || '',
    twitterLink: user.twitterLink || '',
    facebookLink: user.facebookLink || '',
    instagramLink: user.instagramLink || '',
    pubgId: user.pubgId || '',
    gameServer: user.gameServer || '',
    status: user.status,
    createdAt: user.createdAt,
    followers: socialStats.followers,
    following: socialStats.following,
    posts: postsCount,
    isFollowing: following,
    isBlocked: blockedByViewer,
    isOwnProfile: viewerId === userId,
    privacy: user.privacy || { profile: 'public' },
    gamingStats,
    socialStats,
    role: {
      id: user.roleRef?.toString() || null,
      type: user.role?.type || 'player',
      name: user.role?.name || 'Player',
      permissions: user.role?.permissions || [],
      level: 0,
    },
  };
}
