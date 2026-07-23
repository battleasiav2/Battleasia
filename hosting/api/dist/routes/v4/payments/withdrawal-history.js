import { Router } from 'express';
import mongoose from 'mongoose';
import { WithdrawalHistory } from '../../../models/WithdrawalHistory.js';
import { User } from '../../../models/User.js';
import { requireAuth } from '../../../middleware/auth.js';
import { requireAdmin } from '../../../middleware/admin.js';
import { paginatedResults, parsePagination } from '../../../utils/pagination.js';
import { recordBalanceHistory } from '../../../utils/balance-history.js';
import { serializeWithdrawal } from '../../../utils/payment-serialize.js';
import { emitNewWithdrawal, emitPendingPaymentCounts } from '../../../utils/socket.js';
import { getWithdrawableInfo } from '../../../utils/withdrawable-amount.js';
import { notifyBalanceChange } from '../../../utils/balance-notify.js';
import { safeQueryStatus, WITHDRAWAL_STATUSES } from '../../../utils/query-filter.js';
const router = Router();
router.get('/stats', requireAdmin, async (_req, res) => {
    try {
        const [pending, approved, completed, rejected] = await Promise.all([
            WithdrawalHistory.countDocuments({ status: 'pending' }),
            WithdrawalHistory.countDocuments({ status: 'processing' }),
            WithdrawalHistory.countDocuments({ status: 'completed' }),
            WithdrawalHistory.countDocuments({ status: 'rejected' }),
        ]);
        return res.json({ status: true, data: { pending, approved, completed, rejected } });
    }
    catch (error) {
        console.error('withdrawal stats error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal stats' });
    }
});
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { skip, limit } = parsePagination(req);
        const filter = {};
        const status = safeQueryStatus(req.query.status, WITHDRAWAL_STATUSES);
        if (status)
            filter.status = status;
        const [withdrawals, count] = await Promise.all([
            WithdrawalHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            WithdrawalHistory.countDocuments(filter),
        ]);
        const results = withdrawals.map(serializeWithdrawal);
        return res.json(paginatedResults(results, count));
    }
    catch (error) {
        console.error('withdrawal history error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal history' });
    }
});
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const body = req.body;
        const coinAmount = Number(body.coin_amount);
        const walletAddress = body.wallet_address?.trim();
        const walletType = body.wallet_type?.trim();
        if (!walletAddress) {
            return res.status(400).json({ status: false, message: 'Wallet address is required' });
        }
        if (!walletType) {
            return res.status(400).json({ status: false, message: 'Wallet type is required' });
        }
        if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
            return res.status(400).json({ status: false, message: 'Coin amount must be greater than zero' });
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const withdrawableInfo = await getWithdrawableInfo(user._id.toString(), user.balance ?? 0);
        if (withdrawableInfo.hasPendingWithdrawal) {
            return res.status(400).json({
                status: false,
                message: 'You already have a pending withdrawal request',
            });
        }
        if (coinAmount > withdrawableInfo.withdrawableAmount) {
            return res.status(400).json({
                status: false,
                message: `Exceeds withdrawable amount. Maximum: ${withdrawableInfo.withdrawableAmount.toFixed(2)} BAC`,
            });
        }
        const withdrawal = await WithdrawalHistory.create({
            userId: user._id,
            user_email: body.user_email?.trim() || user.email,
            username: body.username?.trim() || user.username,
            coin_amount: coinAmount,
            wallet_type: walletType,
            wallet_address: walletAddress,
            currency_type: body.currency_type?.trim().toUpperCase() || 'USDT',
            currency_amount: Number(body.currency_amount) || 0,
            description: body.description?.trim() || '',
            notes: body.notes?.trim() || '',
            status: 'pending',
        });
        await emitPendingPaymentCounts();
        emitNewWithdrawal(serializeWithdrawal(withdrawal));
        return res.status(201).json({
            status: true,
            message: 'Withdrawal request submitted successfully',
            data: serializeWithdrawal(withdrawal),
        });
    }
    catch (error) {
        console.error('submit withdrawal error:', error);
        return res.status(500).json({ status: false, message: 'Failed to submit withdrawal' });
    }
});
router.get('/my-history', requireAuth, async (req, res) => {
    try {
        const { skip, limit } = parsePagination(req);
        const filter = { userId: req.userId };
        const status = safeQueryStatus(req.query.status, WITHDRAWAL_STATUSES);
        if (status)
            filter.status = status;
        const [withdrawals, count] = await Promise.all([
            WithdrawalHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            WithdrawalHistory.countDocuments(filter),
        ]);
        const results = withdrawals.map(serializeWithdrawal);
        return res.json(paginatedResults(results, count));
    }
    catch (error) {
        console.error('my withdrawal history error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal history' });
    }
});
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: false, message: 'Invalid withdrawal id' });
        }
        const withdrawal = await WithdrawalHistory.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ status: false, message: 'Withdrawal not found' });
        }
        if (withdrawal.userId.toString() !== req.userId) {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }
        return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
    }
    catch (error) {
        console.error('get withdrawal by id error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch withdrawal' });
    }
});
router.patch('/:id/approve', requireAdmin, async (req, res) => {
    try {
        const withdrawal = await WithdrawalHistory.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ status: false, message: 'Withdrawal not found' });
        }
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ status: false, message: 'Withdrawal is not pending' });
        }
        const user = await User.findById(withdrawal.userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const balanceBefore = user.balance ?? 0;
        if (balanceBefore < withdrawal.coin_amount) {
            return res.status(400).json({ status: false, message: 'Insufficient user balance' });
        }
        const admin = req.userId ? await User.findById(req.userId) : null;
        user.balance = balanceBefore - withdrawal.coin_amount;
        await user.save();
        withdrawal.status = 'processing';
        withdrawal.processed_at = new Date();
        withdrawal.processed_by = req.userId;
        await withdrawal.save();
        await recordBalanceHistory({
            user,
            amount: withdrawal.coin_amount,
            type: 'withdraw',
            balanceBefore,
            balanceAfter: user.balance,
            performedBy: req.userId,
            detail: {
                reason: 'withdrawal_approved',
                withdrawal_id: withdrawal._id.toString(),
                adminName: admin?.username || 'Admin',
            },
        });
        await emitPendingPaymentCounts();
        await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
        return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
    }
    catch (error) {
        console.error('approve withdrawal error:', error);
        return res.status(500).json({ status: false, message: 'Failed to approve withdrawal' });
    }
});
router.patch('/:id/complete', requireAdmin, async (req, res) => {
    try {
        const withdrawal = await WithdrawalHistory.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ status: false, message: 'Withdrawal not found' });
        }
        if (withdrawal.status !== 'processing') {
            return res.status(400).json({ status: false, message: 'Withdrawal is not processing' });
        }
        withdrawal.status = 'completed';
        withdrawal.transaction_hash = req.body.transaction_hash || '';
        withdrawal.processed_at = new Date();
        await withdrawal.save();
        return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
    }
    catch (error) {
        console.error('complete withdrawal error:', error);
        return res.status(500).json({ status: false, message: 'Failed to complete withdrawal' });
    }
});
router.patch('/:id/reject', requireAdmin, async (req, res) => {
    try {
        const withdrawal = await WithdrawalHistory.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ status: false, message: 'Withdrawal not found' });
        }
        if (!['pending', 'processing'].includes(withdrawal.status)) {
            return res.status(400).json({ status: false, message: 'Withdrawal cannot be rejected' });
        }
        const user = await User.findById(withdrawal.userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const admin = req.userId ? await User.findById(req.userId) : null;
        if (withdrawal.status === 'processing') {
            const balanceBefore = user.balance ?? 0;
            user.balance = balanceBefore + withdrawal.coin_amount;
            await user.save();
            await recordBalanceHistory({
                user,
                amount: withdrawal.coin_amount,
                type: 'deposit',
                balanceBefore,
                balanceAfter: user.balance,
                performedBy: req.userId,
                detail: {
                    reason: 'withdrawal_rejected_refund',
                    withdrawal_id: withdrawal._id.toString(),
                    adminName: admin?.username || 'Admin',
                },
            });
            await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
        }
        withdrawal.status = 'rejected';
        withdrawal.rejection_reason = req.body.rejection_reason || '';
        withdrawal.processed_at = new Date();
        withdrawal.processed_by = req.userId;
        await withdrawal.save();
        await emitPendingPaymentCounts();
        return res.json({ status: true, data: serializeWithdrawal(withdrawal) });
    }
    catch (error) {
        console.error('reject withdrawal error:', error);
        return res.status(500).json({ status: false, message: 'Failed to reject withdrawal' });
    }
});
export default router;
