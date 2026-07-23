import { getImageUrl } from 'src/utils/get-image-url';

/** Play-specific image paths */
export const PLAY_IMAGE_PATHS = {
  heroBanner: '/assets/images/hero-banner-pubg.webp',
  dashboardBg: '/assets/images/dashboard-pubg-black.webp',
  game2: '/assets/images/game2.webp',
  game: '/assets/images/game.webp',
  pubgCard: '/assets/images/games/art/pubg-mobile.png',
  freeFireCard: '/assets/images/games/art/free-fire.png',
  codMobileCard: '/assets/images/games/art/cod-mobile.png',
  valorantCard: '/assets/images/games/art/valorant.png',
  mobileLegendsCard: '/assets/images/games/art/mobile-legends.png',
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

type GameArtSource = {
  packageName?: string;
  image?: string;
  logo?: string;
  idPrefix?: string;
};

/** Resolve card art when API image path is empty — matches home section assets. */
export function resolvePlayGameArt(game: GameArtSource, field: 'image' | 'logo' = 'image') {
  const raw = field === 'logo' ? game.logo : game.image;
  const url = getImageUrl(raw);
  if (url && url.length > 0) return url;
  if (game.packageName && GAME_ART_BY_PACKAGE[game.packageName]) {
    return GAME_ART_BY_PACKAGE[game.packageName];
  }
  if (game.idPrefix && GAME_ART_BY_PREFIX[game.idPrefix]) {
    return GAME_ART_BY_PREFIX[game.idPrefix];
  }
  return PLAY_IMAGE_PATHS.pubgCard;
}

export { USER_GOLD } from 'src/layouts/user/user-theme';
