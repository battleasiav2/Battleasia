import { getImageUrl } from 'src/utils/get-image-url';

/** Play-specific image paths */
export const PLAY_IMAGE_PATHS = {
  heroBanner: '/assets/images/hero-banner-pubg.webp',
  dashboardBg: '/assets/images/dashboard-pubg-black.webp',
  game2: '/assets/images/game2.webp',
  game: '/assets/images/game.webp',
  pubgCard: '/assets/images/games/art/pubg-mobile.webp?v=ai2',
  freeFireCard: '/assets/images/games/art/free-fire.webp?v=ai2',
  codMobileCard: '/assets/images/games/art/cod-mobile.webp?v=ai2',
  valorantCard: '/assets/images/games/art/valorant.webp?v=ai2',
  mobileLegendsCard: '/assets/images/games/art/mobile-legends.webp?v=ai2',
} as const;

export const GAME_ART_BY_PACKAGE: Record<string, string> = {
  'com.tencent.ig': PLAY_IMAGE_PATHS.pubgCard,
  'com.dts.freefireth': PLAY_IMAGE_PATHS.freeFireCard,
  'com.activision.callofduty.shooter': PLAY_IMAGE_PATHS.codMobileCard,
  'com.riotgames.valorant': PLAY_IMAGE_PATHS.valorantCard,
  'com.mobilelegends': PLAY_IMAGE_PATHS.mobileLegendsCard,
};

export const GAME_ART_BY_PREFIX: Record<string, string> = {
  PUBG: PLAY_IMAGE_PATHS.pubgCard,
  FF: PLAY_IMAGE_PATHS.freeFireCard,
  COD: PLAY_IMAGE_PATHS.codMobileCard,
  VAL: PLAY_IMAGE_PATHS.valorantCard,
  ML: PLAY_IMAGE_PATHS.mobileLegendsCard,
};

/** Display order — PUBG always first, matches home "Play Your Game" section. */
export const GAME_ORDER_BY_PREFIX: Record<string, number> = {
  PUBG: 0,
  FF: 1,
  COD: 2,
  VAL: 3,
  ML: 4,
};

export const GAME_GENRE_BY_PREFIX: Record<string, string> = {
  PUBG: 'BATTLE ROYALE',
  FF: 'BATTLE ROYALE',
  COD: 'FPS ACTION',
  VAL: 'TACTICAL FPS',
  ML: 'MOBA',
};

export const GAME_PLATFORMS_BY_PREFIX: Record<string, string[]> = {
  PUBG: ['mdi:android', 'mdi:apple', 'mdi:cellphone'],
  FF: ['mdi:android', 'mdi:apple'],
  COD: ['mdi:android', 'mdi:apple'],
  VAL: ['mdi:microsoft-windows', 'mdi:sony-playstation', 'mdi:monitor'],
  ML: ['mdi:android', 'mdi:apple'],
};

const DEFAULT_PLATFORMS = ['mdi:android', 'mdi:apple'];

export function getGameGenre(idPrefix?: string) {
  return (idPrefix && GAME_GENRE_BY_PREFIX[idPrefix]) || 'ESPORTS';
}

export function getGamePlatforms(idPrefix?: string) {
  return (idPrefix && GAME_PLATFORMS_BY_PREFIX[idPrefix]) || DEFAULT_PLATFORMS;
}

function arenaRank(game: { idPrefix?: string; name?: string }): number {
  const prefix = (game.idPrefix || '').toUpperCase();
  if (prefix && GAME_ORDER_BY_PREFIX[prefix] !== undefined) {
    return GAME_ORDER_BY_PREFIX[prefix];
  }
  const n = (game.name || '').toLowerCase();
  if (n.includes('pubg')) return 0;
  if (n.includes('free fire') || n.includes('freefire')) return 1;
  if (n.includes('cod') || n.includes('call of duty')) return 2;
  if (n.includes('valorant')) return 3;
  if (n.includes('legend') || n.includes('mlbb')) return 4;
  return 99;
}

/** PUBG first, then known arenas, then anything else alphabetically. */
export function sortGamesForArena<T extends { idPrefix?: string; name?: string }>(games: T[]): T[] {
  return [...games].sort((a, b) => {
    const rankA = arenaRank(a);
    const rankB = arenaRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return (a.name || '').localeCompare(b.name || '');
  });
}

type GameArtSource = {
  packageName?: string;
  image?: string;
  logo?: string;
  idPrefix?: string;
};

/** Unique card art per game — never reuse one photo for all five arenas. */
export function resolvePlayGameArt(game: GameArtSource, field: 'image' | 'logo' = 'image') {
  if (game.packageName && GAME_ART_BY_PACKAGE[game.packageName]) {
    return GAME_ART_BY_PACKAGE[game.packageName];
  }
  if (game.idPrefix && GAME_ART_BY_PREFIX[game.idPrefix]) {
    return GAME_ART_BY_PREFIX[game.idPrefix];
  }
  const n = `${game.packageName || ''}`.toLowerCase();
  if (n.includes('pubg') || n.includes('tencent.ig')) return PLAY_IMAGE_PATHS.pubgCard;
  if (n.includes('freefire') || n.includes('dts.freefire')) return PLAY_IMAGE_PATHS.freeFireCard;
  if (n.includes('callofduty') || n.includes('activision')) return PLAY_IMAGE_PATHS.codMobileCard;
  if (n.includes('valorant') || n.includes('riot')) return PLAY_IMAGE_PATHS.valorantCard;
  if (n.includes('mobilelegends')) return PLAY_IMAGE_PATHS.mobileLegendsCard;

  const raw = field === 'logo' ? game.logo : game.image;
  const url = getImageUrl(raw);
  if (url && url.length > 0) return url;
  return PLAY_IMAGE_PATHS.pubgCard;
}

export { USER_GOLD } from 'src/layouts/user/user-theme';
