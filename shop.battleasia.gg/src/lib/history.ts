import type { HistoryRow } from '../lib/wallet';

export type HistFilter = 'all' | 'deposit' | 'withdraw' | 'game' | 'claim' | 'transfer';

const CLAIM = new Set([
  'engagement_reward',
  'engagement_streak_reward',
  'engagement_welcome_reward',
  'engagement_weekly_reward',
  'engagement_squad_reward',
  'engagement_season_pass_reward',
  'engagement_referral_reward',
  'engagement_share_reward',
  'engagement_spin_reward',
  'engagement_deposit_bonus',
  'referral_commission',
  'watch_to_earn',
  'earning',
  'claim',
]);

const GAME = new Set([
  'match_entry_fee',
  'match_leave_refund',
  'match_entry_refund',
  'match_winnings',
  'match_result_update',
  'match_reward',
  'duel_stake',
  'duel_payout',
  'game',
]);

export function rowCategory(row: HistoryRow): HistFilter {
  const cat = (row as HistoryRow & { category?: string }).category;
  if (cat === 'deposit' || cat === 'withdraw' || cat === 'game' || cat === 'claim' || cat === 'transfer') {
    return cat;
  }
  const type = String(row.type || '').toLowerCase();
  const reason = String(row.detail?.reason || '').toLowerCase();
  const key = reason || type;
  if (type === 'transfer_sent' || type === 'transfer_received' || key.includes('transfer')) return 'transfer';
  if (CLAIM.has(key) || key.startsWith('engagement_')) return 'claim';
  if (GAME.has(key)) return 'game';
  if (type === 'withdraw' || key.includes('withdraw')) return 'withdraw';
  if (type === 'deposit' || key.includes('deposit')) return 'deposit';
  return type === 'withdraw' ? 'withdraw' : 'deposit';
}

export function isCredit(row: HistoryRow) {
  const type = String(row.type || '');
  const reason = String(row.detail?.reason || '');
  if (type === 'transfer_sent' || reason === 'user_transfer_sent') return false;
  if (type === 'withdraw' || reason === 'withdrawal_approved' || reason === 'match_entry_fee') return false;
  if (reason === 'cosmetic_buy' || reason === 'premium_activation' || reason === 'duel_stake') return false;
  if (type === 'deposit' || type === 'transfer_received' || type.includes('reward') || type === 'earning') return true;
  if (reason.includes('reward') || reason.includes('winnings') || reason.includes('refund') || reason.includes('bonus')) {
    return true;
  }
  return (row.balanceAfter ?? 0) >= (row.balanceBefore ?? 0);
}

const LABELS: Record<string, string> = {
  deposit: 'Deposit',
  deposit_approved: 'Deposit approved',
  withdraw: 'Withdrawal',
  withdrawal_approved: 'Withdrawal paid',
  withdrawal_rejected_refund: 'Withdraw refund',
  match_entry_fee: 'Match entry',
  match_leave_refund: 'Leave refund',
  match_entry_refund: 'Entry refund',
  match_winnings: 'Match winnings',
  match_result_update: 'Result update',
  match_reward: 'Match reward',
  transfer_sent: 'Transfer sent',
  transfer_received: 'Transfer received',
  user_transfer_sent: 'Transfer sent',
  user_transfer_received: 'Transfer received',
  engagement_reward: 'Mission claim',
  engagement_streak_reward: 'Streak claim',
  engagement_welcome_reward: 'Welcome claim',
  engagement_weekly_reward: 'Weekly claim',
  engagement_squad_reward: 'Squad claim',
  engagement_season_pass_reward: 'Season claim',
  engagement_referral_reward: 'Referral claim',
  engagement_share_reward: 'Share claim',
  engagement_spin_reward: 'Spin claim',
  engagement_deposit_bonus: 'Deposit bonus',
  referral_commission: 'Referral commission',
  earning: 'Earning',
  admin_adjustment: 'Admin adjust',
  premium_activation: 'Premium',
  cosmetic_buy: 'Cosmetic',
  duel_stake: 'Duel stake',
  duel_payout: 'Duel payout',
  watch_to_earn: 'Watch earn',
};

export function rowLabel(row: HistoryRow) {
  const reason = String(row.detail?.reason || '');
  const type = String(row.type || '');
  const title = String(row.detail?.missionTitle || row.detail?.note || '');
  const base = LABELS[reason] || LABELS[type] || type.replace(/_/g, ' ') || 'Movement';
  return title ? `${base} · ${title}` : base;
}

export function formatWhen(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function statusTone(status?: string) {
  const s = String(status || '').toLowerCase();
  if (s === 'approved' || s === 'completed' || s === 'success' || s === 'paid') return 'ok';
  if (s === 'pending' || s === 'processing') return 'wait';
  if (s === 'rejected' || s === 'failed' || s === 'cancelled' || s === 'canceled') return 'bad';
  return 'muted';
}
