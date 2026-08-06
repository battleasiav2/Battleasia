/** Wide cinematic hero slides — distant establishing shots, not close-up portraits. */
export const HOME_HERO_SLIDES = [
  {
    key: 'pubgMobile',
    src: '/assets/images/hero/hero-pubg-wide.webp',
    label: 'PUBG Mobile',
  },
  {
    key: 'freeFire',
    src: '/assets/images/hero/hero-free-fire-wide.png',
    label: 'Free Fire',
  },
  {
    key: 'codMobile',
    src: '/assets/images/hero/hero-cod-mobile-wide.png',
    label: 'Call of Duty Mobile',
  },
  {
    key: 'valorant',
    src: '/assets/images/hero/hero-valorant-wide.png',
    label: 'Valorant',
  },
  {
    key: 'mobileLegends',
    src: '/assets/images/hero/hero-mobile-legends-wide.png',
    label: 'Mobile Legends',
  },
] as const;

/** Rotate hero every 90 seconds (between 1–2 min). */
export const HOME_HERO_ROTATE_MS = 90_000;

export const HOME_HERO_FADE_MS = 1800;
