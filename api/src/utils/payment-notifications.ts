import { Notification } from '../models/Notification.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
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

/** Persist + realtime push a system notification for one user. */
export async function createSystemNotification(params: SystemNotificationParams) {
  const notification = await Notification.create({
    title: params.title,
    message: params.message,
    subject: params.title,
    category: params.category || 'General',
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

async function notifyMatchPlayers(
  matchId: string,
  build: (userId: string) => Omit<SystemNotificationParams, 'recipientId'>
) {
  const participants = await MatchParticipant.find({ matchId }).select('userId');
  await Promise.all(
    participants.map((p) =>
      createSystemNotification({
        recipientId: p.userId.toString(),
        ...build(p.userId.toString()),
      })
    )
  );
}

// ── Wallet / payments ───────────────────────────────────────────────

export async function notifyDepositSubmitted(params: {
  userId: string;
  amount: number;
  depositId: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Deposit Submitted',
    message: `Your deposit of ${params.amount} coins is pending admin review.`,
    type: 'deposit_submitted',
    category: 'Wallet',
    entityType: 'deposit',
    entityId: params.depositId,
  });
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

export async function notifyWithdrawalSubmitted(params: {
  userId: string;
  amount: number;
  withdrawalId: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Withdrawal Requested',
    message: `Your withdrawal of ${params.amount} coins is pending admin review.`,
    type: 'withdrawal_submitted',
    category: 'Wallet',
    entityType: 'withdrawal',
    entityId: params.withdrawalId,
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

export async function notifyAdminBalanceCredit(params: {
  userId: string;
  amount: number;
  adminName?: string;
}) {
  const by = params.adminName ? ` by ${params.adminName}` : '';
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Balance Credited',
    message: `${params.amount} coins were added to your wallet${by}.`,
    type: 'admin_credit',
    category: 'Wallet',
    entityType: 'balance',
  });
}

export async function notifyAdminBalanceDebit(params: {
  userId: string;
  amount: number;
  adminName?: string;
}) {
  const by = params.adminName ? ` by ${params.adminName}` : '';
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Balance Debited',
    message: `${params.amount} coins were deducted from your wallet${by}.`,
    type: 'admin_debit',
    category: 'Wallet',
    entityType: 'balance',
  });
}

export async function notifyReferralCommission(params: {
  userId: string;
  amount: number;
  fromUsername: string;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Referral Bonus',
    message: `You earned ${params.amount} coins from ${params.fromUsername}'s deposit.`,
    type: 'referral_commission',
    category: 'Wallet',
    entityType: 'referral',
  });
}

export async function notifyPremiumActivated(params: {
  userId: string;
  days: number;
}) {
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Premium Activated',
    message: `Your Premium membership is active for ${params.days} days. Enjoy exclusive matches!`,
    type: 'premium_activated',
    category: 'Account',
    entityType: 'premium',
  });
}

// ── Matches ─────────────────────────────────────────────────────────

export async function notifyMatchJoined(params: {
  userId: string;
  matchId: string;
  matchName: string;
  entryFee: number;
}) {
  const feeNote =
    params.entryFee > 0
      ? ` Entry fee ${params.entryFee} coins has been deducted.`
      : ' This is a free match.';
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Match Joined',
    message: `You joined “${params.matchName}”.${feeNote}`,
    type: 'match_joined',
    category: 'Matches',
    entityType: 'match',
    entityId: params.matchId,
  });
}

export async function notifyMatchRoomReady(params: {
  matchId: string;
  matchName: string;
  roomId: string;
  password?: string;
}) {
  const pass = params.password?.trim() ? ` Password: ${params.password.trim()}.` : '';
  return notifyMatchPlayers(params.matchId, () => ({
    title: 'Room ID Available',
    message: `“${params.matchName}” is ready. Room ID: ${params.roomId}.${pass}`,
    type: 'match_room_ready',
    category: 'Matches',
    entityType: 'match',
    entityId: params.matchId,
  }));
}

export async function notifyMatchStarted(params: {
  matchId: string;
  matchName: string;
}) {
  return notifyMatchPlayers(params.matchId, () => ({
    title: 'Match Started',
    message: `“${params.matchName}” has started. Join the room now!`,
    type: 'match_started',
    category: 'Matches',
    entityType: 'match',
    entityId: params.matchId,
  }));
}

export async function notifyMatchCancelled(params: {
  matchId: string;
  matchName: string;
}) {
  return notifyMatchPlayers(params.matchId, () => ({
    title: 'Match Cancelled',
    message: `“${params.matchName}” was cancelled. Entry fees will be refunded if applicable.`,
    type: 'match_cancelled',
    category: 'Matches',
    entityType: 'match',
    entityId: params.matchId,
  }));
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

// ── Support ─────────────────────────────────────────────────────────

export async function notifySupportReply(params: {
  userId: string;
  conversationId: string;
  preview: string;
}) {
  const preview = params.preview.trim().slice(0, 120);
  return createSystemNotification({
    recipientId: params.userId,
    title: 'Support Reply',
    message: preview || 'You have a new reply from BattleAsia Support.',
    type: 'support_reply',
    category: 'Support',
    entityType: 'support',
    entityId: params.conversationId,
  });
}
