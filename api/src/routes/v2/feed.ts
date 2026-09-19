import { Router } from 'express';
import { Feed } from '../../models/Feed.js';
import { FeedLike } from '../../models/FeedLike.js';
import { FeedComment } from '../../models/FeedComment.js';
import { FeedCategory } from '../../models/FeedCategory.js';
import { SavedPost } from '../../models/SavedPost.js';
import { Follow } from '../../models/Follow.js';
import { User } from '../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import {
  buildSearchFilter,
  paginatedWithTotal,
  parsePagination,
} from '../../utils/pagination.js';
import { serializeFeed, serializeFeedCategory } from '../../utils/feed-serialize.js';
import { createActivityNotification } from '../../utils/social-notifications.js';
import { safeObjectId } from '../../utils/query-filter.js';
import { enrichFeed, enrichFeedsBatch } from '../../utils/feed-enrich.js';
import { getAppSettings } from '../../models/AppSettings.js';
import { normalizeP2Flags } from '../../utils/p2-flags.js';

const router = Router();

function getSortOption(sortBy?: string, feedMode?: string): Record<string, 1 | -1> {
  if (feedMode === 'trending' || feedMode === 'fyp' || sortBy === 'popular') {
    return { totalLikes: -1, totalViews: -1, createdAt: -1 };
  }
  if (sortBy === 'oldest') return { createdAt: 1 };
  if (sortBy === 'popular') return { totalViews: -1 };
  return { createdAt: -1 };
}

function extractHashtags(text: string) {
  const matches = text.match(/#[\w\u0980-\u09FF]+/g);
  return matches ? [...new Set(matches.map((t) => t.slice(1).toLowerCase()))] : [];
}

function extractMentions(text: string) {
  const matches = text.match(/@[\w.]+/g);
  return matches ? [...new Set(matches.map((t) => t.slice(1).toLowerCase()))] : [];
}

function mapComment(comment: InstanceType<typeof FeedComment>, userId?: string) {
  const liked = comment.likedBy || [];
  return {
    id: comment._id.toString(),
    content: comment.content,
    createdAt: comment.createdAt,
    parentId: comment.parentId?.toString() || null,
    mentions: comment.mentions || [],
    totalLikes: liked.length,
    isLiked: Boolean(userId && liked.some((id) => id.toString() === userId)),
    user: {
      id: comment.userId.toString(),
      username: comment.username,
      avatar: comment.avatar,
    },
  };
}

async function getCommunityCategoryId() {
  let category = await FeedCategory.findOne({ slug: 'community' });
  if (!category) {
    category = await FeedCategory.create({ name: 'Community', slug: 'community' });
  }
  return category._id;
}

router.get('/categories', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter = buildSearchFilter(search, ['name', 'slug']);

    const [categories, total] = await Promise.all([
      FeedCategory.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      FeedCategory.countDocuments(filter),
    ]);

    return res.json(paginatedWithTotal(categories.map(serializeFeedCategory), total));
  } catch (error) {
    console.error('v2 feed categories error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch categories' });
  }
});

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(search, ['title', 'description', 'hashtags']),
      status: 'published',
    };
    const categoryId = safeObjectId(req.query.categoryId);
    if (categoryId) filter.categoryId = categoryId;
    if (req.query.hashtag) filter.hashtags = String(req.query.hashtag).toLowerCase();
    if (req.query.gameTag) filter.gameTag = String(req.query.gameTag).toLowerCase();
    if (req.query.postType) filter.postType = String(req.query.postType);

    let feedMode = String(req.query.feedMode || 'all');
    const sortBy = String(req.query.sortBy || 'latest');
    if (feedMode === 'fyp') {
      const p2 = normalizeP2Flags((await getAppSettings()).p2);
      if (!p2.igForYou) feedMode = 'all';
    }

    if (feedMode === 'games') {
      filter.gameTag = { $nin: [null, ''] };
    }

    if (feedMode === 'following') {
      const following = await Follow.find({ followerId: req.userId }).select('followingId');
      const followingIds = following.map((f) => f.followingId);
      // Include own posts so the following timeline isn't empty after posting
      filter.authorId = { $in: [...followingIds, req.userId] };
    }

    if (feedMode === 'recommended') {
      filter.totalLikes = { $gte: 5 };
    }

    if (feedMode === 'fyp') {
      filter.totalLikes = { $gte: 0 };
    }

    const [feeds, total] = await Promise.all([
      Feed.find(filter)
        .sort({ pinnedAt: -1, ...getSortOption(sortBy, feedMode) })
        .skip(skip)
        .limit(limit),
      Feed.countDocuments(filter),
    ]);

    const categoryIds = [...new Set(feeds.map((f) => f.categoryId.toString()))];
    const categories = await FeedCategory.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    let results = await enrichFeedsBatch(feeds, categoryMap, req.userId);
    if (feedMode === 'fyp') {
      const following = await Follow.find({ followerId: req.userId }).select('followingId');
      const boost = new Set(following.map((f) => f.followingId.toString()));
      results = [...results].sort((a, b) => {
        const score = (row: typeof a) => {
          const ageH = row.createdAt ? (Date.now() - new Date(row.createdAt).getTime()) / 36e5 : 48;
          const recency = Math.max(0, 24 - ageH);
          return (row.totalLikes || 0) + (row.totalViews || 0) * 0.05 + (boost.has(row.author?.id || '') ? 40 : 0) + recency;
        };
        return score(b) - score(a);
      });
    }
    const viewer = await User.findById(req.userId).select('muteWords');
    const muted = (viewer?.muteWords || []).map((w) => w.toLowerCase()).filter(Boolean);
    if (muted.length) {
      results = results.filter((p) => {
        const blob = `${p.description || ''} ${p.title || ''} ${(p.hashtags || []).join(' ')}`.toLowerCase();
        return !muted.some((w) => blob.includes(w));
      });
    }

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('v2 feed list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch feeds' });
  }
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const {
      title,
      description,
      coverUrl,
      postType,
      mediaUrls,
      visibility,
      status,
      categoryId,
      gameTag,
      entityId,
    } = req.body as {
      title?: string;
      description?: string;
      coverUrl?: string;
      postType?: string;
      mediaUrls?: string[];
      visibility?: string;
      status?: string;
      categoryId?: string;
      gameTag?: string;
      entityId?: string;
    };

    const content = String(description || title || '').trim();
    if (!content) {
      return res.status(400).json({ status: false, message: 'Post content is required' });
    }

    const categoryObjectId = categoryId || (await getCommunityCategoryId());
    const hashtags = extractHashtags(`${title || ''} ${description || ''}`);

    const feed = await Feed.create({
      categoryId: categoryObjectId,
      title: String(title || content.slice(0, 120)),
      description: content,
      coverUrl: coverUrl || mediaUrls?.[0] || '',
      postType: postType || (mediaUrls?.length ? 'image' : 'text'),
      mediaUrls: mediaUrls || [],
      hashtags,
      visibility: visibility || 'public',
      status: status === 'draft' ? 'draft' : 'published',
      authorId: user._id,
      authorName: user.username,
      authorAvatar: user.avatar || '',
      gameTag: String(gameTag || '').toLowerCase().slice(0, 32),
      entityId: String(entityId || '').slice(0, 64),
    });

    const category = await FeedCategory.findById(feed.categoryId);
    const data = await enrichFeed(feed, category, req.userId);
    return res.status(201).json({ status: true, data });
  } catch (error) {
    console.error('v2 create feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create post' });
  }
});

router.get('/explore', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const [trendingPosts, trendingHashtags, creators] = await Promise.all([
      Feed.find({ status: 'published' }).sort({ totalLikes: -1, totalViews: -1 }).skip(skip).limit(limit),
      Feed.aggregate([
        { $match: { status: 'published', hashtags: { $ne: [] } } },
        { $unwind: '$hashtags' },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Feed.aggregate([
        { $match: { status: 'published', authorId: { $ne: null } } },
        { $group: { _id: '$authorId', posts: { $sum: 1 }, likes: { $sum: '$totalLikes' } } },
        { $sort: { likes: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const categoryIds = [...new Set(trendingPosts.map((f) => f.categoryId.toString()))];
    const categories = await FeedCategory.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));
    const posts = await enrichFeedsBatch(trendingPosts, categoryMap, req.userId);

    const creatorIds = creators.map((c) => c._id);
    const creatorUsers = await User.find({ _id: { $in: creatorIds } }).select('username avatar');
    const creatorMap = new Map(creatorUsers.map((u) => [u._id.toString(), u]));

    return res.json({
      status: true,
      data: {
        trendingPosts: posts,
        trendingHashtags: trendingHashtags.map((h) => ({ tag: h._id, count: h.count })),
        recommendedCreators: creators.map((c) => {
          const u = creatorMap.get(c._id.toString());
          return {
            id: c._id.toString(),
            username: u?.username || '',
            avatar: u?.avatar || '',
            posts: c.posts,
            likes: c.likes,
          };
        }),
      },
    });
  } catch (error) {
    console.error('v2 explore error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load explore' });
  }
});

router.get('/saved/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const saved = await SavedPost.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const feedIds = saved.map((s) => s.feedId);
    const feeds = await Feed.find({ _id: { $in: feedIds } });
    const feedMap = new Map(feeds.map((f) => [f._id.toString(), f]));
    const categoryIds = [...new Set(feeds.map((f) => f.categoryId.toString()))];
    const categories = await FeedCategory.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const results = await enrichFeedsBatch(
      saved
        .map((s) => feedMap.get(s.feedId.toString()))
        .filter((feed): feed is InstanceType<typeof Feed> => Boolean(feed)),
      categoryMap,
      req.userId
    );

    const savedMap = new Map(saved.map((s) => [s.feedId.toString(), s.collectionName || 'Saved']));
    const tagged = results.map((row) => ({
      ...row,
      collectionName: savedMap.get(String(row.id || row._id)) || 'Saved',
    }));

    return res.json(paginatedWithTotal(tagged, tagged.length));
  } catch (error) {
    console.error('v2 saved feeds error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch saved posts' });
  }
});

router.get('/user/:userId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter = { authorId: req.params.userId, status: 'published' };

    const [feeds, total] = await Promise.all([
      Feed.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feed.countDocuments(filter),
    ]);

    const categoryIds = [...new Set(feeds.map((f) => f.categoryId.toString()))];
    const categories = await FeedCategory.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const results = await enrichFeedsBatch(feeds, categoryMap, req.userId);

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('v2 user feeds error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch user feeds' });
  }
});

router.get('/:id/comments', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter = { feedId: req.params.id, parentId: null };

    const [comments, total] = await Promise.all([
      FeedComment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FeedComment.countDocuments(filter),
    ]);

    const commentIds = comments.map((comment) => comment._id);
    const allReplies = commentIds.length
      ? await FeedComment.find({ parentId: { $in: commentIds } }).sort({ createdAt: 1 })
      : [];
    const repliesByParent = new Map<string, InstanceType<typeof FeedComment>[]>();
    for (const reply of allReplies) {
      const parentId = reply.parentId?.toString();
      if (!parentId) continue;
      if (!repliesByParent.has(parentId)) repliesByParent.set(parentId, []);
      repliesByParent.get(parentId)!.push(reply);
    }

    const results = comments.map((comment) => {
      const replies = repliesByParent.get(comment._id.toString()) || [];
      return {
        ...mapComment(comment, req.userId),
        replies: replies.slice(0, 20).map((r) => mapComment(r, req.userId)),
      };
    });

    return res.json({
      status: true,
      data: { results, total, count: total },
    });
  } catch (error) {
    console.error('v2 get comments error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }

    const content = String(req.body?.content || '').trim();
    if (!content) {
      return res.status(400).json({ status: false, message: 'Comment content is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const parentId = req.body?.parentId || null;
    const comment = await FeedComment.create({
      feedId: feed._id,
      userId: user._id,
      username: user.username,
      avatar: user.avatar || '',
      content,
      parentId: parentId || null,
      mentions: extractMentions(content),
    });

    feed.totalComments = (feed.totalComments || 0) + 1;
    await feed.save();

    if (feed.authorId && feed.authorId.toString() !== req.userId) {
      await createActivityNotification({
        recipientId: feed.authorId.toString(),
        actorId: req.userId!,
        type: parentId ? 'reply' : 'comment',
        entityType: 'feed',
        entityId: feed._id.toString(),
        message: `${user.username} ${parentId ? 'replied to' : 'commented on'} your post`,
      });
    }

    return res.json({
      status: true,
      data: {
        ...mapComment(comment, req.userId),
        totalComments: feed.totalComments,
        author: {
          id: user._id.toString(),
          name: user.username,
          avatarUrl: user.avatar || '',
        },
      },
    });
  } catch (error) {
    console.error('v2 add comment error:', error);
    return res.status(500).json({ status: false, message: 'Failed to add comment' });
  }
});

router.post('/:id/comments/:commentId/like', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const comment = await FeedComment.findOne({ _id: req.params.commentId, feedId: req.params.id });
    if (!comment) return res.status(404).json({ status: false, message: 'Comment not found' });
    const uid = req.userId!;
    const liked = (comment.likedBy || []).some((id) => id.toString() === uid);
    if (liked) {
      comment.likedBy = (comment.likedBy || []).filter((id) => id.toString() !== uid);
    } else {
      comment.likedBy = [...(comment.likedBy || []), uid as unknown as typeof comment.likedBy[number]];
    }
    await comment.save();
    return res.json({
      status: true,
      data: { isLiked: !liked, totalLikes: comment.likedBy.length },
    });
  } catch (error) {
    console.error('like comment error:', error);
    return res.status(500).json({ status: false, message: 'Failed to like comment' });
  }
});

router.post('/:id/save', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }

    const existing = await SavedPost.findOne({ userId: req.userId, feedId: feed._id });
    const folder = String(req.body?.collectionName || '').trim().slice(0, 40);
    if (existing) {
      if (folder && folder !== existing.collectionName) {
        existing.collectionName = folder;
        await existing.save();
        return res.json({ status: true, data: { isSaved: true, collectionName: existing.collectionName } });
      }
      await existing.deleteOne();
      return res.json({ status: true, data: { isSaved: false } });
    }

    await SavedPost.create({
      userId: req.userId,
      feedId: feed._id,
      collectionName: String(req.body?.collectionName || 'Saved'),
    });
    return res.json({ status: true, data: { isSaved: true } });
  } catch (error) {
    console.error('v2 save post error:', error);
    return res.status(500).json({ status: false, message: 'Failed to save post' });
  }
});

router.post('/:id/like', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }

    const existing = await FeedLike.findOne({ userId: req.userId, feedId: feed._id });

    if (existing) {
      await existing.deleteOne();
      feed.totalLikes = Math.max(0, (feed.totalLikes || 0) - 1);
      await feed.save();
      return res.json({
        status: true,
        data: { isLiked: false, totalLikes: feed.totalLikes },
      });
    }

    await FeedLike.create({ userId: req.userId, feedId: feed._id });
    feed.totalLikes = (feed.totalLikes || 0) + 1;
    await feed.save();

    if (feed.authorId && feed.authorId.toString() !== req.userId) {
      const actor = await User.findById(req.userId).select('username');
      await createActivityNotification({
        recipientId: feed.authorId.toString(),
        actorId: req.userId!,
        type: 'like',
        entityType: 'feed',
        entityId: feed._id.toString(),
        message: `${actor?.username || 'Someone'} liked your post`,
      });
    }

    return res.json({
      status: true,
      data: { isLiked: true, totalLikes: feed.totalLikes },
    });
  } catch (error) {
    console.error('v2 toggle like error:', error);
    return res.status(500).json({ status: false, message: 'Failed to toggle like' });
  }
});

router.post('/:id/view', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const feed = await Feed.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalViews: 1 } },
      { new: true }
    );
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }
    const category = await FeedCategory.findById(feed.categoryId);
    const data = await enrichFeed(feed, category, req.userId);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('v2 increment views error:', error);
    return res.status(500).json({ status: false, message: 'Failed to increment views' });
  }
});

router.post('/:id/pin', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { normalizeP1Flags } = await import('../../utils/p1-flags.js');
    const { getAppSettings } = await import('../../models/AppSettings.js');
    if (!normalizeP1Flags((await getAppSettings()).p1).igPinnedPosts) {
      return res.status(403).json({ status: false, message: 'Pinned posts are off' });
    }
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ status: false, message: 'Feed not found' });
    if (feed.authorId?.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Only the author can pin' });
    }
    feed.pinnedAt = feed.pinnedAt ? null : new Date();
    await feed.save();
    return res.json({ status: true, data: { pinnedAt: feed.pinnedAt } });
  } catch (error) {
    console.error('pin feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to pin post' });
  }
});

router.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }

    if (feed.premiumOnly) {
      const user = await User.findById(req.userId);
      const isAdmin = user?.role?.type === 'admin' || user?.role?.name === 'Admin';
      const isPremiumActive =
        Boolean(user?.isPremium) &&
        (!user?.premiumExpiresAt || user.premiumExpiresAt.getTime() > Date.now());
      if (!isAdmin && !isPremiumActive) {
        return res.status(403).json({ status: false, message: 'Premium subscription required' });
      }
    }

    const category = await FeedCategory.findById(feed.categoryId);
    const data = await enrichFeed(feed, category, req.userId);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('v2 get feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch feed' });
  }
});

export default router;
