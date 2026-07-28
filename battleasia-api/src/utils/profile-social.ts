import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { UserBlock } from '../models/UserBlock.js';
import type { ProfileSocialSettings } from '../models/AppSettings.js';

export type FollowUserRow = {
  id: string;
  username: string;
  avatar: string;
  role: string;
  isFollowing?: boolean;
  followedAt?: Date;
};

export async function getBlockedUserIds(userId: string) {
  const blocks = await UserBlock.find({
    $or: [{ blockerId: userId }, { blockedId: userId }],
  }).select('blockerId blockedId');

  const ids = new Set<string>();
  for (const block of blocks) {
    ids.add(block.blockerId.toString());
    ids.add(block.blockedId.toString());
  }
  ids.delete(userId);
  return ids;
}

export async function serializeFollowUsers(
  userIds: string[],
  viewerId?: string,
  followedAtMap?: Map<string, Date>
): Promise<FollowUserRow[]> {
  if (userIds.length === 0) return [];

  const users = await User.find({ _id: { $in: userIds }, status: true }).select('username avatar role');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  let followingSet = new Set<string>();
  if (viewerId) {
    const following = await Follow.find({
      followerId: viewerId,
      followingId: { $in: userIds },
    }).select('followingId');
    followingSet = new Set(following.map((f) => f.followingId.toString()));
  }

  return userIds
    .map((id) => {
      const u = userMap.get(id);
      if (!u) return null;
      const row: FollowUserRow = {
        id,
        username: u.username || '',
        avatar: u.avatar || '',
        role: u.role?.name || 'Player',
        followedAt: followedAtMap?.get(id),
      };
      if (viewerId) {
        row.isFollowing = followingSet.has(id);
      }
      return row;
    })
    .filter((row): row is FollowUserRow => row !== null);
}

/** People the viewer follows who also follow the profile user. */
export async function getMutualFollowers(
  viewerId: string,
  profileUserId: string,
  limit: number
): Promise<FollowUserRow[]> {
  if (viewerId === profileUserId) return [];

  const viewerFollowing = await Follow.find({ followerId: viewerId }).select('followingId');
  const followingIds = viewerFollowing.map((f) => f.followingId);

  if (followingIds.length === 0) return [];

  const mutualRecords = await Follow.find({
    followerId: { $in: followingIds },
    followingId: profileUserId,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  const mutualIds = mutualRecords.map((r) => r.followerId.toString());
  const followedAtMap = new Map(mutualRecords.map((r) => [r.followerId.toString(), r.createdAt]));

  return serializeFollowUsers(mutualIds, viewerId, followedAtMap);
}

/** Users the profile owner recently followed. */
export async function getRecentFollows(userId: string, limit: number, viewerId?: string) {
  const records = await Follow.find({ followerId: userId }).sort({ createdAt: -1 }).limit(limit);
  const ids = records.map((r) => r.followingId.toString());
  const followedAtMap = new Map(records.map((r) => [r.followingId.toString(), r.createdAt]));
  return serializeFollowUsers(ids, viewerId, followedAtMap);
}

export async function getSuggestedFollows(
  viewerId: string,
  settings: ProfileSocialSettings,
  contextUserId?: string
): Promise<FollowUserRow[]> {
  const limit = Math.min(Math.max(settings.suggestedLimit || 8, 1), 20);
  const exclude = await getBlockedUserIds(viewerId);
  exclude.add(viewerId);
  if (contextUserId) exclude.add(contextUserId);

  const alreadyFollowing = await Follow.find({ followerId: viewerId }).select('followingId');
  alreadyFollowing.forEach((f) => exclude.add(f.followingId.toString()));

  const picked: string[] = [];

  const pushUnique = (id: string) => {
    if (!id || exclude.has(id) || picked.includes(id)) return;
    if (!mongoose.Types.ObjectId.isValid(id)) return;
    picked.push(id);
  };

  for (const id of settings.pinnedUserIds || []) {
    if (picked.length >= limit) break;
    pushUnique(String(id));
  }

  if (settings.autoSuggestEnabled && picked.length < limit) {
    const myFollowing = await Follow.find({ followerId: viewerId }).select('followingId');
    const followingIds = myFollowing.map((f) => f.followingId);

    if (followingIds.length > 0) {
      const fofAgg = await Follow.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $match: { followerId: { $in: followingIds }, followingId: { $nin: [...exclude].map((id) => new mongoose.Types.ObjectId(id)) } } },
        { $group: { _id: '$followingId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit * 2 },
      ]);

      for (const row of fofAgg) {
        if (picked.length >= limit) break;
        pushUnique(row._id.toString());
      }
    }
  }

  if (picked.length < limit) {
    const popularAgg = await Follow.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $group: { _id: '$followingId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit * 3 },
    ]);

    for (const row of popularAgg) {
      if (picked.length >= limit) break;
      pushUnique(row._id.toString());
    }
  }

  return serializeFollowUsers(picked.slice(0, limit), viewerId);
}
