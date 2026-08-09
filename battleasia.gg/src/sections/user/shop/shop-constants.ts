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

/** Live shop storefront URL — local shop app in DEV, `/store` path in Docker/prod. */
export const SHOP_EXTERNAL_URL =
  import.meta.env.VITE_BAC_SHOP_URL ||
  (import.meta.env.DEV ? 'http://localhost:8082/user/shop' : '/store/user/shop');

/**
 * Entry URL for “Go to BAC Shop”.
 * Always lands on shop sign-in with `reauth=1` so Docker/prod requires a fresh login
 * (no SSO handoff from the main app).
 */
export function getBacShopEntryUrl() {
  try {
    const storeUrl = new URL(
      SHOP_EXTERNAL_URL,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    // …/user/shop → …/auth/sign-in
    storeUrl.pathname = storeUrl.pathname.replace(/\/user\/shop\/?$/, '/auth/sign-in');
    if (!storeUrl.pathname.includes('/auth/sign-in')) {
      storeUrl.pathname = `${storeUrl.pathname.replace(/\/$/, '')}/auth/sign-in`;
    }
    storeUrl.search = 'reauth=1';
    storeUrl.hash = '';
    return storeUrl.toString();
  } catch {
    return SHOP_EXTERNAL_URL.replace(/\/user\/shop\/?$/, '/auth/sign-in') + '?reauth=1';
  }
}
