import { alpha } from '@mui/material/styles';

export const EARN_HUB_GOLD = '#feab02';

export const earnClaimPopKeyframes = {
  '@keyframes earnClaimPop': {
    '0%': { transform: 'scale(1)', boxShadow: `0 0 0 ${alpha(EARN_HUB_GOLD, 0)}` },
    '35%': {
      transform: 'scale(1.015)',
      boxShadow: `0 0 28px ${alpha(EARN_HUB_GOLD, 0.28)}`,
    },
    '100%': { transform: 'scale(1)', boxShadow: `0 0 0 ${alpha(EARN_HUB_GOLD, 0)}` },
  },
  '@keyframes earnReadyPulse': {
    '0%, 100%': { borderColor: alpha(EARN_HUB_GOLD, 0.35) },
    '50%': { borderColor: alpha(EARN_HUB_GOLD, 0.75) },
  },
};

export function getEarnClaimFlashSx(active: boolean) {
  if (!active) return {};
  return {
    ...earnClaimPopKeyframes,
    animation: 'earnClaimPop 0.55s ease',
  };
}

export function getEarnReadyPulseSx(active: boolean) {
  if (!active) return {};
  return {
    ...earnClaimPopKeyframes,
    animation: 'earnReadyPulse 1.8s ease-in-out infinite',
  };
}

export const ENGAGEMENT_REWARD_REASONS = new Set([
  'engagement_reward',
  'engagement_streak_reward',
  'engagement_welcome_reward',
  'engagement_referral_reward',
  'engagement_weekly_reward',
  'engagement_share_reward',
  'engagement_deposit_bonus',
  'engagement_spin_reward',
  'engagement_squad_reward',
  'engagement_season_pass_reward',
]);
