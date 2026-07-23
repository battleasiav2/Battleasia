import { Router } from 'express';
import { ReferralHistory } from '../../../models/ReferralHistory.js';
import { User } from '../../../models/User.js';
import { requireAuth } from '../../../middleware/auth.js';
import { parsePagination, } from '../../../utils/pagination.js';
const router = Router();
router.get('/stats', requireAuth, async (_req, res) => {
    try {
        const [totalPaid, totalTransactions, usersWithReferrals] = await Promise.all([
            ReferralHistory.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
            ]).then((r) => r[0]?.total ?? 0),
            ReferralHistory.countDocuments(),
            User.countDocuments({ referredBy: { $ne: null } }),
        ]);
        return res.json({
            status: true,
            data: { totalPaid, totalTransactions, usersWithReferrals },
        });
    }
    catch (error) {
        console.error('referral stats error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch referral stats' });
    }
});
router.get('/', requireAuth, async (req, res) => {
    try {
        const { skip, limit, search } = parsePagination(req);
        const histories = await ReferralHistory.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('referrerId', 'username email')
            .populate('referredUserId', 'username email');
        let filtered = histories;
        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filtered = histories.filter((h) => {
                const referrer = h.referrerId;
                const referred = h.referredUserId;
                return (regex.test(referrer?.username || '') ||
                    regex.test(referrer?.email || '') ||
                    regex.test(referred?.username || '') ||
                    regex.test(referred?.email || ''));
            });
        }
        const count = search
            ? filtered.length
            : await ReferralHistory.countDocuments();
        const data = filtered.map((h) => {
            const referrer = h.referrerId;
            const referred = h.referredUserId;
            return {
                _id: h._id.toString(),
                depositAmount: h.depositAmount,
                commissionRate: h.commissionRate,
                commissionAmount: h.commissionAmount,
                depositSource: h.depositSource || 'manual',
                depositId: h.depositId?.toString() || null,
                referredUsername: h.referredUsername,
                referredEmail: h.referredEmail,
                status: h.status,
                createdAt: h.createdAt,
                referrer: referrer?._id
                    ? { _id: referrer._id.toString(), username: referrer.username, email: referrer.email }
                    : null,
                referredUser: referred?._id
                    ? { _id: referred._id.toString(), username: referred.username, email: referred.email }
                    : null,
            };
        });
        return res.json({
            status: true,
            data,
            pagination: { total: count, page: Math.floor(skip / limit) + 1, limit },
        });
    }
    catch (error) {
        console.error('referral history error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch referral history' });
    }
});
export default router;
