/** Five premium hero slides — one per top arena game (rotates every ~90s). */
export const HOME_HERO_SLIDES = [
  {
    key: 'pubgMobile',
    src: '/assets/images/hero-banner-pubg-drop.webp',
    label: 'PUBG Mobile',
  },
  {
    key: 'freeFire',
    src: '/assets/images/games/art/free-fire.webp?v=hero',
    label: 'Free Fire',
  },
  {
    key: 'codMobile',
    src: '/assets/images/games/art/cod-mobile.webp?v=hero',
    label: 'Call of Duty Mobile',
  },
  {
    key: 'valorant',
    src: '/assets/images/games/art/valorant.webp?v=hero',
    label: 'Valorant',
  },
  {
    key: 'mobileLegends',
    src: '/assets/images/games/art/mobile-legends.webp?v=hero',
    label: 'Mobile Legends',
  },
] as const;

/** Rotate hero every 90 seconds (between 1–2 min). */
export const HOME_HERO_ROTATE_MS = 90_000;

export const HOME_HERO_FADE_MS = 1800;
