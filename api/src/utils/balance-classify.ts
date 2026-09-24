/** Map ledger detail.reason → UI category + display type. */

const CLAIM_REASONS = new Set([
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
]);

const GAME_REASONS = new Set([
  'match_entry_fee',
  'match_leave_refund',
  'match_entry_refund',
  'match_winnings',
  'match_result_update',
  'match_reward',
  'duel_stake',
  'duel_payout',
]);

const DEPOSIT_REASONS = new Set(['deposit_approved', 'deposit', 'admin_adjustment']);

const WITHDRAW_REASONS = new Set([
  'withdrawal_approved',
  'withdraw',
  'withdrawal_rejected_refund',
  'cosmetic_buy',
  'premium_activation',
]);

export type BalanceCategory = 'deposit' | 'withdraw' | 'game' | 'claim' | 'transfer' | 'other';

export function classifyBalanceRow(item: {
  type?: string;
  detail?: Record<string, unknown> | null;
}): { category: BalanceCategory; type: string; reason: string } {
  const detail = item.detail && typeof item.detail === 'object' ? item.detail : {};
  const reason = String(detail.reason || '').trim();
  const base = item.type === 'withdraw' ? 'withdraw' : 'deposit';

  if (reason === 'user_transfer_sent') return { category: 'transfer', type: 'transfer_sent', reason };
  if (reason === 'user_transfer_received') return { category: 'transfer', type: 'transfer_received', reason };

  if (CLAIM_REASONS.has(reason)) return { category: 'claim', type: reason || 'claim', reason };
  if (GAME_REASONS.has(reason)) return { category: 'game', type: reason || 'game', reason };

  if (reason === 'deposit_approved' || (!reason && base === 'deposit')) {
    return { category: 'deposit', type: reason || 'deposit', reason: reason || 'deposit' };
  }
  if (DEPOSIT_REASONS.has(reason) && base === 'deposit') {
    return { category: 'deposit', type: reason, reason };
  }

  if (
    reason === 'withdrawal_approved' ||
    reason === 'withdraw' ||
    (!reason && base === 'withdraw')
  ) {
    return { category: 'withdraw', type: reason || 'withdraw', reason: reason || 'withdraw' };
  }
  if (WITHDRAW_REASONS.has(reason)) {
    return { category: 'withdraw', type: reason, reason };
  }

  if (reason.startsWith('engagement_')) return { category: 'claim', type: reason, reason };

  return { category: 'other', type: reason || base, reason: reason || base };
}
