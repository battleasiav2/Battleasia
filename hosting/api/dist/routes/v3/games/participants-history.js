import { Router } from 'express';
import { Match } from '../../../models/Match.js';
import { MatchParticipant } from '../../../models/MatchParticipant.js';
import { requireAuth } from '../../../middleware/auth.js';
import { buildSearchFilter, paginatedResults, parsePagination, } from '../../../utils/pagination.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    try {
        const { skip, limit, search, startDate, endDate } = parsePagination(req);
        const filter = {
            ...buildSearchFilter(search, ['username', 'email', 'pubgId']),
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = startDate;
            if (endDate)
                filter.createdAt.$lte = endDate;
        }
        const [participants, count] = await Promise.all([
            MatchParticipant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            MatchParticipant.countDocuments(filter),
        ]);
        const matchIds = [...new Set(participants.map((p) => p.matchId.toString()))];
        const matches = await Match.find({ _id: { $in: matchIds } });
        const matchMap = new Map(matches.map((m) => [m._id.toString(), m.matchName]));
        const results = participants.map((p) => ({
            _id: p._id.toString(),
            id: p._id.toString(),
            matchId: p.matchId.toString(),
            matchName: matchMap.get(p.matchId.toString()) || '',
            userId: p.userId.toString(),
            username: p.username,
            email: p.email,
            avatar: p.avatar,
            pubgId: p.pubgId,
            entryFee: p.entryFee,
            placement: p.placement,
            kills: p.kills,
            points: p.points,
            createdAt: p.createdAt,
        }));
        return res.json(paginatedResults(results, count));
    }
    catch (error) {
        console.error('participants history error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch participants history' });
    }
});
export default router;
