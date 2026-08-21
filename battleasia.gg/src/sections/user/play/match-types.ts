import { CONFIG } from 'src/global-config';
import { getImageUrl } from 'src/utils/get-image-url';

import { PLAY_IMAGE_PATHS } from './play-constants';

// ----------------------------------------------------------------------

/** Default battle-ground art when match banner is missing or fails to load. */
export const MATCH_BANNER_FALLBACK = PLAY_IMAGE_PATHS.game || '/assets/images/bounty-bg.avif';

export type IMatch = {
  id: string;
  gameId: string;
  gameName: string;
  matchName: string;
  matchUrl: string;
  matchSchedule: string;
  killRateType: string;
  entryFee: number;
  totalPlayer: number;
  teamType: string;
  perKill: number;
  matchType: string;
  map: string;
  banner: string;
  prizeDescription: string;
  matchSponsor: string;
  matchDescription: string;
  matchPrivateDescription: string;
  premiumOnly?: boolean;
  status: 'active' | 'deactive' | 'start' | 'complete' | 'cancel';
  createdAt?: string;
  participantsCount?: number;
  isJoined?: boolean;
  roomId?: string;
  password?: string;
};

export type MatchTab = 'ongoing' | 'upcoming' | 'results';

export type MatchCardProps = {
  match: IMatch;
  onJoin: (match: IMatch) => void;
  joining?: boolean;
  canJoin?: boolean;
  isJoined?: boolean;
  isPremiumUser?: boolean;
  isResult?: boolean;
};

export type MatchParticipant = {
  id: string;
  username: string;
  pubgId?: string;
  avatar?: string;
  joinedAt?: string;
  team?: string;
};

export type MatchDetailData = {
  id: string;
  gameName?: string;
  matchName: string;
  matchType?: string;
  teamType?: string;
  map?: string;
  matchSchedule?: string;
  entryFee?: number;
  perKill?: number;
  banner?: string;
  prizeDescription?: string;
  matchSponsor?: string;
  matchDescription?: string;
  matchPrivateDescription?: string;
  matchUrl?: string;
  totalPlayer?: number;
  participants?: MatchParticipant[];
  participantsCount?: number;
  roomId?: string;
  password?: string;
  isJoined?: boolean;
  premiumOnly?: boolean;
};

export type ResultParticipant = {
  id: string;
  username: string;
  avatar?: string;
  pubgId?: string;
  email?: string;
  status: 'winner' | 'lose';
  placement: number | null;
  kills: number;
  points: number;
  winPrize: number;
  bonus: number;
  refund: number;
  entryFee: number;
};

export type MatchResultData = {
  id: string;
  gameName?: string;
  gameMode?: string;
  matchName: string;
  matchType?: string;
  teamType?: string;
  map?: string;
  matchSchedule?: string;
  entryFee?: number;
  perKill?: number;
  banner?: string;
  totalPlayer?: number;
  status?: string;
  participants?: ResultParticipant[];
  participantsCount?: number;
};

export const MATCH_RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export function formatResultAvatarUrl(path?: string) {
  if (!path) return '/assets/images/mock/avatar/avatar-1.webp';
  if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('blob:')) return path;
  // FE public assets stay relative to the site origin
  if (path.startsWith('/assets/') || path.startsWith('/logo/')) return path;
  if (CONFIG.serverUrl) {
    const base = CONFIG.serverUrl.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}

export function getMatchMapImageUrl(map?: string) {
  if (!map) return MATCH_BANNER_FALLBACK;
  const trimmed = map.trim();
  if (!trimmed) return MATCH_BANNER_FALLBACK;
  // Public map assets use Title Case filenames (Erangel.webp, Livik.webp, …)
  const fileName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return `/assets/images/map/${fileName}.webp`;
}

/** Resolve match banner via shared image URL rules; never return empty. */
export function getMatchBannerUrl(path?: string, map?: string) {
  const resolved = getImageUrl(path);
  if (resolved) return resolved;
  if (map) return getMatchMapImageUrl(map);
  return MATCH_BANNER_FALLBACK;
}
