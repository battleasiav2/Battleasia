import { Feed } from '../models/Feed.js';
import { FeedLike } from '../models/FeedLike.js';
import { FeedCategory } from '../models/FeedCategory.js';
import { SavedPost } from '../models/SavedPost.js';
import { User } from '../models/User.js';
import { serializeFeed } from './feed-serialize.js';

export async function enrichFeedsBatch(
  feeds: InstanceType<typeof Feed>[],
  categoryMap: Map<string, InstanceType<typeof FeedCategory>>,
  userId?: string
) {
  if (!feeds.length) return [];

  const authorIds = [
    ...new Set(
      feeds
        .map((feed) => feed.authorId?.toString())
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const feedIds = feeds.map((feed) => feed._id);

  const [authors, likes, saves] = await Promise.all([
    authorIds.length
      ? User.find({ _id: { $in: authorIds } }).select('role roleRef')
      : Promise.resolve([]),
    userId
      ? FeedLike.find({ userId, feedId: { $in: feedIds } }).select('feedId')
      : Promise.resolve([]),
    userId
      ? SavedPost.find({ userId, feedId: { $in: feedIds } }).select('feedId')
      : Promise.resolve([]),
  ]);

  const authorMap = new Map(authors.map((author) => [author._id.toString(), author]));
  const likedSet = new Set(likes.map((like) => like.feedId.toString()));
  const savedSet = new Set(saves.map((save) => save.feedId.toString()));

  return feeds.map((feed) => {
    const base = serializeFeed(feed, categoryMap.get(feed.categoryId.toString()));
    const author = feed.authorId ? authorMap.get(feed.authorId.toString()) : null;
    const authorRole =
      author?.role?.name
        ? {
            id: author.roleRef?.toString() || '',
            name: author.role.name,
          }
        : null;

    return {
      ...base,
      totalLikes: feed.totalLikes ?? 0,
      isLiked: likedSet.has(feed._id.toString()),
      isSaved: savedSet.has(feed._id.toString()),
      author: {
        ...base.author,
        role: authorRole,
      },
    };
  });
}

export async function enrichFeed(
  feed: InstanceType<typeof Feed>,
  category?: InstanceType<typeof FeedCategory> | null,
  userId?: string
) {
  const categoryMap = new Map<string, InstanceType<typeof FeedCategory>>();
  if (category) categoryMap.set(feed.categoryId.toString(), category);
  const [result] = await enrichFeedsBatch([feed], categoryMap, userId);
  return result;
}
