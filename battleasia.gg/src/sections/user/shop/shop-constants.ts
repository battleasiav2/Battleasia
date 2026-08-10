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
 * Opens the storefront — AuthGuard sends guests to sign-in.
 * Session persists (no forced reauth on every visit).
 */
export function getBacShopEntryUrl() {
  try {
    const storeUrl = new URL(
      SHOP_EXTERNAL_URL,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    storeUrl.search = '';
    storeUrl.hash = '';
    return storeUrl.toString();
  } catch {
    return SHOP_EXTERNAL_URL;
  }
}
