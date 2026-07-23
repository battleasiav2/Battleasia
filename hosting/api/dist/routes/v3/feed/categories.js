import { Router } from 'express';
import { FeedCategory } from '../../../models/FeedCategory.js';
import { requireAuth } from '../../../middleware/auth.js';
import { buildSearchFilter, paginatedWithTotal, parsePagination, } from '../../../utils/pagination.js';
import { serializeFeedCategory } from '../../../utils/feed-serialize.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    try {
        const { skip, limit, search } = parsePagination(req);
        const filter = buildSearchFilter(search, ['name', 'slug']);
        const [categories, total] = await Promise.all([
            FeedCategory.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
            FeedCategory.countDocuments(filter),
        ]);
        return res.json(paginatedWithTotal(categories.map(serializeFeedCategory), total));
    }
    catch (error) {
        console.error('feed categories error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch categories' });
    }
});
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const category = await FeedCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ status: false, message: 'Category not found' });
        }
        return res.json({ status: true, data: serializeFeedCategory(category) });
    }
    catch (error) {
        console.error('get category error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch category' });
    }
});
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ status: false, message: 'Name and slug are required' });
        }
        const category = await FeedCategory.create({ name, slug: slug.toLowerCase() });
        return res.status(201).json({ status: true, data: serializeFeedCategory(category) });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: false, message: 'Category slug already exists' });
        }
        console.error('create category error:', error);
        return res.status(500).json({ status: false, message: 'Failed to create category' });
    }
});
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const category = await FeedCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ status: false, message: 'Category not found' });
        }
        const { name, slug } = req.body;
        if (name)
            category.name = name;
        if (slug)
            category.slug = slug.toLowerCase();
        await category.save();
        return res.json({ status: true, data: serializeFeedCategory(category) });
    }
    catch (error) {
        console.error('update category error:', error);
        return res.status(500).json({ status: false, message: 'Failed to update category' });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const category = await FeedCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ status: false, message: 'Category not found' });
        }
        await category.deleteOne();
        return res.json({ status: true, message: 'Category deleted' });
    }
    catch (error) {
        console.error('delete category error:', error);
        return res.status(500).json({ status: false, message: 'Failed to delete category' });
    }
});
export default router;
