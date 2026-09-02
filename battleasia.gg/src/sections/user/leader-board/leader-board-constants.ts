import { PLAY_IMAGE_PATHS } from '../play/play-constants';

export const LEADERBOARD_HERO_IMAGE = PLAY_IMAGE_PATHS.heroBanner;

export const LEADERBOARD_PODIUM_COLORS = {
  1: 'var(--ba-gold)',
  2: '#c0c0c0',
  3: '#cd7f32',
} as const;

export const LEADERBOARD_PODIUM_ORDER = [2, 1, 3] as const;

export type LeaderboardPeriod = 'all' | 'weekly' | 'monthly';
