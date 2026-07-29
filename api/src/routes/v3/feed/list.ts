import { Router } from 'express';
import type { SortOrder } from 'mongoose';
import { Feed } from '../../../models/Feed.js';
import { FeedCategory } from '../../../models/FeedCategory.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import {
  buildSearchFilter,
  paginatedWithTotal,
  parsePagination,
} from '../../../utils/pagination.js';
import { serializeFeed } from '../../../utils/feed-serialize.js';
import { safeQueryStatus, FEED_STATUSES } from '../../../utils/query-filter.js';

const router = Router();

function getSortOption(sortBy?: string): Record<string, SortOrder> {
  if (sortBy === 'oldest') return { createdAt: 1 };
  if (sortBy === 'popular') return { totalViews: -1 };
  return { createdAt: -1 };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(search, ['title', 'description']),
    };
    const status = safeQueryStatus(req.query.status, FEED_STATUSES);
    if (status) filter.status = status;

    const sortBy = String(req.query.sortBy || 'latest');
    const [feeds, total] = await Promise.all([
      Feed.find(filter).sort(getSortOption(sortBy)).skip(skip).limit(limit),
      Feed.countDocuments(filter),
    ]);

    const categoryIds = [...new Set(feeds.map((f) => f.categoryId.toString()))];
    const categories = await FeedCategory.find({ _id: { $in: categoryIds } });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const results = feeds.map((feed) =>
      serializeFeed(feed, categoryMap.get(feed.categoryId.toString()))
    );

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('feed list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch feeds' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }
    const category = await FeedCategory.findById(feed.categoryId);
    return res.json({ status: true, data: serializeFeed(feed, category) });
  } catch (error) {
    console.error('get feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch feed' });
  }
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { categoryId, title, description = '', coverUrl = '', status = 'draft', premiumOnly = false } = req.body;
    if (!categoryId || !title) {
      return res.status(400).json({ status: false, message: 'Category and title are required' });
    }

    const category = await FeedCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ status: false, message: 'Category not found' });
    }

    const author = req.userId ? await User.findById(req.userId) : null;
    const feed = await Feed.create({
      categoryId,
      title,
      description,
      coverUrl,
      status,
      premiumOnly: Boolean(premiumOnly),
      authorId: author?._id,
      authorName: author?.username || 'Admin',
      authorAvatar: author?.avatar || '',
    });

    return res.status(201).json({ status: true, data: serializeFeed(feed, category) });
  } catch (error) {
    console.error('create feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create feed' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }

    const { categoryId, title, description, coverUrl, status, premiumOnly } = req.body;
    if (categoryId) feed.categoryId = categoryId;
    if (title) feed.title = title;
    if (typeof description === 'string') feed.description = description;
    if (typeof coverUrl === 'string') feed.coverUrl = coverUrl;
    if (status) feed.status = status;
    if (typeof premiumOnly === 'boolean') feed.premiumOnly = premiumOnly;

    await feed.save();
    const category = await FeedCategory.findById(feed.categoryId);
    return res.json({ status: true, data: serializeFeed(feed, category) });
  } catch (error) {
    console.error('update feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update feed' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ status: false, message: 'Feed not found' });
    }
    await feed.deleteOne();
    return res.json({ status: true, message: 'Feed deleted' });
  } catch (error) {
    console.error('delete feed error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete feed' });
  }
});

router.post('/:id/view', requireAuth, async (req, res) => {
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
    return res.json({ status: true, data: serializeFeed(feed, category) });
  } catch (error) {
    console.error('increment views error:', error);
    return res.status(500).json({ status: false, message: 'Failed to increment views' });
  }
});

export default router;
