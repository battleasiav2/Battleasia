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

/** Rotate hero every 12s — snappy but still readable. */
export const HOME_HERO_ROTATE_MS = 12_000;

export const HOME_HERO_FADE_MS = 900;

/** sessionStorage key — survives reload, resets on new tab/session. */
export const HOME_HERO_STORAGE_KEY = 'ba_hero_slide';

export function readHeroSlideIndex(): number {
  try {
    const n = Number(sessionStorage.getItem(HOME_HERO_STORAGE_KEY));
    if (Number.isInteger(n) && n >= 0 && n < HOME_HERO_SLIDES.length) {
      return n;
    }
  } catch {
    // ignore
  }
  return 0;
}

export function writeHeroSlideIndex(index: number) {
  try {
    sessionStorage.setItem(HOME_HERO_STORAGE_KEY, String(index));
  } catch {
    // ignore
  }
}
