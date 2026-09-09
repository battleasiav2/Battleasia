/** Shared game art paths — tiny module so home can import without pulling section JS */
export const PLAY_YOUR_GAME_IMAGE_PATHS = {
  pubgMobile: '/landing/PubgMobile.webp',
  freeFire: '/landing/FreeFire.webp',
  codMobile: '/landing/CODMobile.webp',
  valorant: '/landing/Valorant.webp',
  mobileLegends: '/landing/MobileLegends.webp',
} as const;

export const HOME_GAME_ARTS = [
  PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile,
  PLAY_YOUR_GAME_IMAGE_PATHS.freeFire,
  PLAY_YOUR_GAME_IMAGE_PATHS.codMobile,
  PLAY_YOUR_GAME_IMAGE_PATHS.valorant,
  PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends,
] as const;
