/** Wide cinematic hero slides — compressed WebP only (LCP-critical). */
export const HOME_HERO_SLIDES = [
  {
    key: 'pubgMobile',
    src: '/assets/images/hero/hero-pubg-wide.webp',
    label: 'PUBG Mobile',
    width: 1600,
    height: 900,
  },
  {
    key: 'freeFire',
    src: '/assets/images/hero/hero-free-fire-wide.webp',
    label: 'Free Fire',
    width: 1600,
    height: 900,
  },
  {
    key: 'codMobile',
    src: '/assets/images/hero/hero-cod-mobile-wide.webp',
    label: 'Call of Duty Mobile',
    width: 1600,
    height: 900,
  },
  {
    key: 'valorant',
    src: '/assets/images/hero/hero-valorant-wide.webp',
    label: 'Valorant',
    width: 1600,
    height: 900,
  },
  {
    key: 'mobileLegends',
    src: '/assets/images/hero/hero-mobile-legends-wide.webp',
    label: 'Mobile Legends',
    width: 1600,
    height: 900,
  },
] as const;

/** Rotate hero every 90 seconds (between 1–2 min). */
export const HOME_HERO_ROTATE_MS = 90_000;

export const HOME_HERO_FADE_MS = 1800;
