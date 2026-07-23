import { DepositHistory } from '../models/DepositHistory.js';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';
import { getPublicDashboardStats } from './public-dashboard.js';
let ioInstance = null;
export function setSocketServer(io) {
    ioInstance = io;
}
export function getSocketServer() {
    return ioInstance;
}
export async function emitPendingPaymentCounts() {
    if (!ioInstance)
        return;
    const [pendingDeposits, pendingWithdrawals] = await Promise.all([
        DepositHistory.countDocuments({ status: 'pending' }),
        WithdrawalHistory.countDocuments({ status: 'pending' }),
    ]);
    ioInstance.to('admin-room').emit('pending-deposits-count', { count: pendingDeposits });
    ioInstance.to('admin-room').emit('pending-withdrawals-count', { count: pendingWithdrawals });
}
export function emitNewDeposit(data) {
    ioInstance?.to('admin-room').emit('new-deposit', data);
}
export function emitNewWithdrawal(data) {
    ioInstance?.to('admin-room').emit('new-withdrawal', data);
}
export function emitUserNotification(userId, data) {
    ioInstance?.to(`user:${userId}`).emit('new-notification', data);
}
export function emitDirectMessage(conversationId, data) {
    ioInstance?.to(`conversation:${conversationId}`).emit('new-message', data);
}
export function emitBalanceUpdated(userId, balance, added, previousBalance) {
    const payload = { balance, added, previousBalance };
    ioInstance?.to(`user:${userId}`).emit('balance-updated', payload);
}
export function emitUserStatsUpdated(userId, balance) {
    ioInstance?.to(`user:${userId}`).emit('user-stats-updated', { userId, balance });
}
export function emitMatchCreated(match) {
    const gameId = match.gameId;
    if (gameId) {
        ioInstance?.to(`game:${gameId}`).emit('match-created', match);
    }
    ioInstance?.emit('match-created', match);
}
export function emitMatchUpdated(match) {
    const gameId = match.gameId;
    if (gameId) {
        ioInstance?.to(`game:${gameId}`).emit('match-updated', match);
    }
    ioInstance?.emit('match-updated', match);
}
export async function emitDashboardStatsUpdated() {
    if (!ioInstance)
        return;
    try {
        const stats = await getPublicDashboardStats();
        ioInstance.emit('dashboard-stats-updated', stats);
    }
    catch (error) {
        console.error('emitDashboardStatsUpdated error:', error);
    }
}
