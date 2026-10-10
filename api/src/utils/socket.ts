import type { Server } from 'socket.io';
import { DepositHistory } from '../models/DepositHistory.js';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';
import { countOpenSupportUnread, countPlayerSupportUnread } from './support-inbox.js';
import { invalidateCache, setCached } from './cache.js';
import {
  getPublicDashboardStats,
  PUBLIC_DASHBOARD_CACHE_KEY,
  PUBLIC_DASHBOARD_CACHE_TTL_MS,
} from './public-dashboard.js';

let ioInstance: Server | null = null;

export function setSocketServer(io: Server) {
  ioInstance = io;
}

export function getSocketServer() {
  return ioInstance;
}

export async function emitPendingPaymentCounts() {
  if (!ioInstance) return;

  const [pendingDeposits, pendingWithdrawals] = await Promise.all([
    DepositHistory.countDocuments({ status: 'pending' }),
    WithdrawalHistory.countDocuments({ status: 'pending' }),
  ]);

  ioInstance.to('admin-room').emit('pending-deposits-count', { count: pendingDeposits });
  ioInstance.to('admin-room').emit('pending-withdrawals-count', { count: pendingWithdrawals });
}

export function emitNewDeposit(data: Record<string, unknown>) {
  ioInstance?.to('admin-room').emit('new-deposit', data);
}

export function emitNewWithdrawal(data: Record<string, unknown>) {
  ioInstance?.to('admin-room').emit('new-withdrawal', data);
}

export async function emitSupportUnread() {
  if (!ioInstance) return;
  try {
    const count = await countOpenSupportUnread();
    ioInstance.to('admin-room').emit('support-unread-count', { count });
  } catch (error) {
    console.error('support unread emit error:', error);
  }
}

export async function emitPlayerSupportUnread(userId: string) {
  if (!ioInstance || !userId) return;
  try {
    const count = await countPlayerSupportUnread(userId);
    ioInstance.to(`user:${userId}`).emit('support-player-unread', { count });
  } catch (error) {
    console.error('player support unread emit error:', error);
  }
}

export function emitNewSupport(data: Record<string, unknown>) {
  ioInstance?.to('admin-room').emit('new-support', data);
}

export function emitUserNotification(userId: string, data: Record<string, unknown>) {
  ioInstance?.to(`user:${userId}`).emit('new-notification', data);
}

export function emitDirectMessage(conversationId: string, data: Record<string, unknown>) {
  ioInstance?.to(`conversation:${conversationId}`).emit('new-message', data);
}

export function emitBalanceUpdated(
  userId: string,
  balance: number,
  added: number,
  previousBalance: number
) {
  const payload = { balance, added, previousBalance };
  ioInstance?.to(`user:${userId}`).emit('balance-updated', payload);
}

export function emitUserStatsUpdated(userId: string, balance: number) {
  ioInstance?.to(`user:${userId}`).emit('user-stats-updated', { userId, balance });
}

export function emitMatchCreated(match: Record<string, unknown>) {
  const safe: Record<string, unknown> = {
    ...match,
    roomId: undefined,
    password: undefined,
    matchPrivateDescription: undefined,
  };
  const gameId = typeof safe.gameId === 'string' ? safe.gameId : undefined;
  if (gameId) {
    ioInstance?.to(`game:${gameId}`).emit('match-created', safe);
  }
  ioInstance?.emit('match-created', safe);
}

export function emitMatchUpdated(match: Record<string, unknown>) {
  const safe: Record<string, unknown> = {
    ...match,
    roomId: undefined,
    password: undefined,
    matchPrivateDescription: undefined,
  };
  const gameId = typeof safe.gameId === 'string' ? safe.gameId : undefined;
  if (gameId) {
    ioInstance?.to(`game:${gameId}`).emit('match-updated', safe);
  }
  ioInstance?.emit('match-updated', safe);
}

export async function emitDashboardStatsUpdated() {
  if (!ioInstance) return;
  try {
    invalidateCache(PUBLIC_DASHBOARD_CACHE_KEY);
    const stats = await getPublicDashboardStats();
    setCached(PUBLIC_DASHBOARD_CACHE_KEY, stats, PUBLIC_DASHBOARD_CACHE_TTL_MS);
    ioInstance.emit('dashboard-stats-updated', stats);
  } catch (error) {
    console.error('emitDashboardStatsUpdated error:', error);
  }
}

