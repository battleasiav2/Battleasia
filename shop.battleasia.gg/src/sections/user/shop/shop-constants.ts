import { getImageUrl } from 'src/utils/get-image-url';

/** Official BAC coin asset (shared with main site + mobile app). */
export const BAC_COIN_IMAGE = '/assets/images/currency.webp';

/** Official site header logo (same as nav header). */
export const SHOP_HEADER_LOGO = '/logo/logo.webp';

export const SHOP_HERO_IMAGE = '/assets/images/shop/bac-store-hero.webp';

export const SHOP_COIN_IMAGE = BAC_COIN_IMAGE;

export const SHOP_COIN_PACK_IMAGE = BAC_COIN_IMAGE;

export const SHOP_PAYMENT_ICONS = {
  bkash: '/assets/images/bkash.webp',
  nagad: '/assets/images/nagad.webp',
  crypto: '/assets/images/usdt.webp',
  usdt: '/assets/images/usdt.webp',
} as const;

export const SHOP_FLAG_IMAGES: Record<string, string> = {
  usd: '/assets/images/flags/usd.webp',
  bdt: '/assets/images/flags/bdt.webp',
  inr: '/assets/images/flags/inr.webp',
  pkr: '/assets/images/flags/pkr.webp',
};

export function resolveShopCoinImage(_image?: string | null): string {
  return BAC_COIN_IMAGE;
}

export function resolvePaymentChannelIcon(channelName: string, icon?: string | null): string {
  const remote = getImageUrl(icon);
  if (remote) return remote;

  const key = channelName.toLowerCase();
  if (key.includes('bkash')) return SHOP_PAYMENT_ICONS.bkash;
  if (key.includes('nagad')) return SHOP_PAYMENT_ICONS.nagad;
  if (key.includes('crypto') || key.includes('usdt')) return SHOP_PAYMENT_ICONS.crypto;

  return SHOP_PAYMENT_ICONS.crypto;
}

export function resolveShopFlagImage(code: string): string {
  return SHOP_FLAG_IMAGES[code.toLowerCase()] ?? SHOP_FLAG_IMAGES.usd;
}
