import { Notification } from '../models/Notification.js';
import { emitUserNotification } from './socket.js';

type SystemNotificationParams = {
  recipientId: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  avatarUrl?: string;
};

/** Persist + realtime push a system/wallet notification for one user. */
export async function createSystemNotification(params: SystemNotificationParams) {
  const notification = await Notification.create({
    title: params.title,
    message: params.message,
    subject: params.title,
    category: params.category || 'Wallet',
    type: params.type,
    avatarUrl: params.avatarUrl || '',
    premiumOnly: false,
    target: 'selected',
    recipients: [params.recipientId],
    recipientId: params.recipientId,
    entityType: params.entityType || '',
    entityId: params.entityId || '',
  });

  const payload = {
    _id: notification._id.toString(),
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    subject: notification.subject,
    category: notification.category,
    type: notification.type,
    avatarUrl: notification.avatarUrl || null,
    entityType: params.entityType || '',
    entityId: params.entityId || '',
    isUnRead: true,
    createdAt: notification.createdAt,
  };

  emitUserNotification(params.recipientId, payload);
  return notification;
}

export async function notifyDepositApproved(params: {
  userId: string;
  amount: number;
  depositId: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Deposit Approved',
    message: `Your deposit of ${params.amount} coins has been approved and credited to your wallet.`,
    type: 'deposit_approved',
    category: 'Wallet',
    entityType: 'deposit',
    entityId: params.depositId,
  });
}

export async function notifyDepositRejected(params: {
  userId: string;
  amount: number;
  depositId: string;
  reason?: string;
}) {
  const reason = params.reason?.trim() ? ` Reason: ${params.reason.trim()}` : '';
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Deposit Rejected',
    message: `Your deposit of ${params.amount} coins was rejected.${reason}`,
    type: 'deposit_rejected',
    category: 'Wallet',
    entityType: 'deposit',
    entityId: params.depositId,
  });
}

export async function notifyWithdrawalApproved(params: {
  userId: string;
  amount: number;
  withdrawalId: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Withdrawal Processing',
    message: `Your withdrawal of ${params.amount} coins is being processed.`,
    type: 'withdrawal_approved',
    category: 'Wallet',
    entityType: 'withdrawal',
    entityId: params.withdrawalId,
  });
}

export async function notifyWithdrawalCompleted(params: {
  userId: string;
  amount: number;
  withdrawalId: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Withdrawal Completed',
    message: `Your withdrawal of ${params.amount} coins has been completed successfully.`,
    type: 'withdrawal_completed',
    category: 'Wallet',
    entityType: 'withdrawal',
    entityId: params.withdrawalId,
  });
}

export async function notifyWithdrawalRejected(params: {
  userId: string;
  amount: number;
  withdrawalId: string;
  reason?: string;
  refunded?: boolean;
}) {
  const reason = params.reason?.trim() ? ` Reason: ${params.reason.trim()}` : '';
  const refund = params.refunded ? ' Coins have been refunded to your wallet.' : '';
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Withdrawal Rejected',
    message: `Your withdrawal of ${params.amount} coins was rejected.${refund}${reason}`,
    type: 'withdrawal_rejected',
    category: 'Wallet',
    entityType: 'withdrawal',
    entityId: params.withdrawalId,
  });
}

export async function notifyMatchWinnings(params: {
  userId: string;
  amount: number;
  matchId: string;
  matchName: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Match Winnings',
    message: `You won ${params.amount} coins from “${params.matchName}”.`,
    type: 'match_winnings',
    category: 'Matches',
    entityType: 'match',
    entityId: params.matchId,
  });
}

export async function notifyMatchRefund(params: {
  userId: string;
  amount: number;
  matchId: string;
  matchName: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Match Entry Refunded',
    message: `Your entry fee of ${params.amount} coins for “${params.matchName}” has been refunded.`,
    type: 'match_refund',
    category: 'Matches',
    entityType: 'match',
    entityId: params.matchId,
  });
}
