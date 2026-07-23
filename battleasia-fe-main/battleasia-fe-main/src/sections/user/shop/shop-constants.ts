/** Shop-specific image paths */
export const SHOP_IMAGE_PATHS = [
  '/assets/images/shop/9.webp',
  '/assets/images/shop/1.webp',
  '/assets/images/shop/2.webp',
  '/assets/images/shop/3.webp',
  '/assets/images/shop/4.webp',
  '/assets/images/shop/5.webp',
  '/assets/images/shop/6.webp',
  '/assets/images/shop/7.webp',
  '/assets/images/shop/8.webp',
] as const;

export const SHOP_HERO_IMAGE = '/assets/images/shop/bac-store-hero.webp';

/** Live shop domain in production; local shop app when developing on this machine. */
export const SHOP_EXTERNAL_URL =
  import.meta.env.VITE_BAC_SHOP_URL ||
  (import.meta.env.DEV ? 'http://localhost:8082/user/shop' : 'https://baccoin.shop');
