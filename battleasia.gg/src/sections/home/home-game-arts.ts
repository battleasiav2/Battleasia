/** Shared game art paths — tiny module so home can import without pulling section JS */
export const PLAY_YOUR_GAME_IMAGE_PATHS = {
  pubgMobile: '/assets/images/games/art/pubg-mobile.webp?v=ai2',
  freeFire: '/assets/images/games/art/free-fire.webp?v=ai2',
  codMobile: '/assets/images/games/art/cod-mobile.webp?v=ai2',
  valorant: '/assets/images/games/art/valorant.webp?v=ai2',
  mobileLegends: '/assets/images/games/art/mobile-legends.webp?v=ai2',
} as const;

export const HOME_GAME_ARTS = [
  PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile,
  PLAY_YOUR_GAME_IMAGE_PATHS.freeFire,
  PLAY_YOUR_GAME_IMAGE_PATHS.codMobile,
  PLAY_YOUR_GAME_IMAGE_PATHS.valorant,
  PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends,
] as const;
