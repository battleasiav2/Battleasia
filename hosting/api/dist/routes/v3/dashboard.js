import { Router } from 'express';
import { User } from '../../models/User.js';
import { Match } from '../../models/Match.js';
import { requireAuth } from '../../middleware/auth.js';
import { getReceivedPaymentStats, getWithdrawalStats } from '../../utils/payment-stats.js';
const router = Router();
function emptyPaymentStats() {
    return {
        total: 0,
        today: 0,
        last7Days: 0,
        currentMonth: 0,
        currentYear: 0,
    };
}
async function getTournamentProfitStats() {
    const rows = await Match.aggregate([
        { $match: { status: 'complete' } },
        {
            $project: {
                profit: {
                    $multiply: [
                        { $ifNull: ['$entryFee', 0] },
                        { $ifNull: ['$totalPlayer', 0] },
                        { $divide: [{ $ifNull: ['$platformFeePercent', 5] }, 100] },
                    ],
                },
            },
        },
        { $group: { _id: null, total: { $sum: '$profit' } } },
    ]);
    const total = Math.round((rows[0]?.total ?? 0) * 100) / 100;
    return {
        total,
        today: total,
        last7Days: total,
        currentMonth: total,
        currentYear: total,
    };
}
router.get('/', requireAuth, async (_req, res) => {
    try {
        const [totalUsers, totalMatches, receivedPayment, withdraw, tournamentProfit] = await Promise.all([
            User.countDocuments(),
            Match.countDocuments(),
            getReceivedPaymentStats().catch(() => emptyPaymentStats()),
            getWithdrawalStats().catch(() => ({ total: 0 })),
            getTournamentProfitStats().catch(() => emptyPaymentStats()),
        ]);
        return res.json({
            status: true,
            data: {
                totalUsers,
                totalMatches,
                receivedPayment,
                withdraw,
                tournamentProfit,
            },
        });
    }
    catch (error) {
        console.error('dashboard error:', error);
        return res.status(500).json({ status: false, message: 'Failed to load dashboard' });
    }
});
export default router;
