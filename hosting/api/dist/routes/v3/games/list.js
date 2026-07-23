import { Router } from 'express';
import { Game } from '../../../models/Game.js';
import { requireAuth } from '../../../middleware/auth.js';
import { buildSearchFilter, paginatedResults, parsePagination, } from '../../../utils/pagination.js';
import { serializeGame } from '../../../utils/serialize.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    try {
        const { skip, limit, search } = parsePagination(req);
        const filter = buildSearchFilter(search, ['name', 'packageName', 'idPrefix']);
        const [games, count] = await Promise.all([
            Game.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Game.countDocuments(filter),
        ]);
        return res.json(paginatedResults(games.map(serializeGame), count));
    }
    catch (error) {
        console.error('games list error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch games' });
    }
});
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ status: false, message: 'Game not found' });
        }
        return res.json({ status: true, data: serializeGame(game) });
    }
    catch (error) {
        console.error('get game error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch game' });
    }
});
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, packageName, image = '', logo = '', canCreateChallenge = true, status = true, comingSoon = false, idPrefix, rules = '', } = req.body;
        if (!name || !packageName || !idPrefix) {
            return res.status(400).json({ status: false, message: 'Name, package name and id prefix are required' });
        }
        const game = await Game.create({
            name,
            packageName,
            image,
            logo,
            canCreateChallenge,
            status: Boolean(status),
            comingSoon: Boolean(comingSoon),
            idPrefix,
            rules,
        });
        return res.status(201).json({ status: true, data: serializeGame(game) });
    }
    catch (error) {
        console.error('create game error:', error);
        return res.status(500).json({ status: false, message: 'Failed to create game' });
    }
});
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ status: false, message: 'Game not found' });
        }
        const fields = [
            'name', 'packageName', 'image', 'logo', 'canCreateChallenge',
            'status', 'comingSoon', 'idPrefix', 'rules',
        ];
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                if (field === 'status' || field === 'comingSoon' || field === 'canCreateChallenge') {
                    game[field] = Boolean(req.body[field]);
                }
                else {
                    game[field] = req.body[field];
                }
            }
        }
        await game.save();
        return res.json({ status: true, data: serializeGame(game) });
    }
    catch (error) {
        console.error('update game error:', error);
        return res.status(500).json({ status: false, message: 'Failed to update game' });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ status: false, message: 'Game not found' });
        }
        await game.deleteOne();
        return res.json({ status: true, message: 'Game deleted' });
    }
    catch (error) {
        console.error('delete game error:', error);
        return res.status(500).json({ status: false, message: 'Failed to delete game' });
    }
});
export default router;
