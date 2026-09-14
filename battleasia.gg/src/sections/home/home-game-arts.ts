/** Shared game art paths — BattleAsia 2.0 landing zip assets */
export const PLAY_YOUR_GAME_IMAGE_PATHS = {
  pubgMobile: '/landing-v2/games/pubg.webp',
  freeFire: '/landing-v2/games/freefire.webp',
  codMobile: '/landing-v2/games/cod.webp',
  valorant: '/landing-v2/games/valorant.webp',
  mobileLegends: '/landing-v2/games/mlbb.webp',
} as const;

export const HOME_GAME_ARTS = [
  PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile,
  PLAY_YOUR_GAME_IMAGE_PATHS.freeFire,
  PLAY_YOUR_GAME_IMAGE_PATHS.codMobile,
  PLAY_YOUR_GAME_IMAGE_PATHS.valorant,
  PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends,
] as const;
