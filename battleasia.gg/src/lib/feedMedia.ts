import { safeHref } from './safeHref';
import { webpSrcSet } from './games';

/** Display width for feed tiles (list + explore). */
export const FEED_LIST_IMG_W = 480;

const LEGACY_ASSET = /^\/assets\/images\/(shop|games|home|map)\//i;

/** Local art that ships with the player app (fast, cacheable). */
export const FEED_STOCK_IMAGES = [
  '/covers/maps/Erangel.webp',
  '/covers/maps/Miramar.webp',
  '/covers/maps/Sanhok.webp',
  '/covers/maps/Livik.webp',
  '/covers/maps/Vikendi.webp',
  '/covers/maps/Nusa.webp',
  '/covers/maps/Karakin.webp',
  '/covers/maps/Rondo.webp',
  '/covers/maps/Warehouse.webp',
  '/covers/maps/Hanger.webp',
  '/covers/maps/Gun.webp',
  '/covers/pubg.webp',
  '/covers/freefire.webp',
  '/covers/mlbb.webp',
  '/covers/valorant.webp',
  '/covers/modes/solo.webp',
  '/covers/modes/duo.webp',
  '/covers/modes/squad.webp',
  '/covers/modes/tdm.webp',
] as const;

export function isFeedVideo(url: string) {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export function feedMediaUrl(raw: unknown): string {
  const href = safeHref(raw);
  if (!href) return '';
  if (LEGACY_ASSET.test(href.split('?')[0]) || /\.png$/i.test(href.split('?')[0])) {
    return pickStockFromLegacy(href);
  }
  if (href.startsWith('/uploads/') && !href.includes('..')) return `/api${href}`;
  if (href.startsWith('/api/uploads/')) return href;
  return href;
}

function pickStockFromLegacy(href: string) {
  let hash = 0;
  for (let i = 0; i < href.length; i += 1) hash = (hash * 31 + href.charCodeAt(i)) >>> 0;
  return FEED_STOCK_IMAGES[hash % FEED_STOCK_IMAGES.length];
}

/** Small variant for feed list / stories tray (faster LCP). */
export function feedPreviewSrc(raw: unknown): string {
  const url = feedMediaUrl(raw);
  if (!url || isFeedVideo(url)) return url;

  if (/picsum\.photos/i.test(url)) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=${FEED_LIST_IMG_W}&q=55`;
  }

  if (/images\.unsplash\.com/i.test(url)) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=${FEED_LIST_IMG_W}&q=55&auto=format`;
  }

  const bare = url.split('?')[0];
  const q = url.includes('?') ? `?${url.split('?')[1]}` : '';

  if (bare.endsWith('.webp') && !bare.includes('-sm.webp') && !bare.includes('/covers/maps/')) {
    return `${bare.replace(/\.webp$/, '-sm.webp')}${q}`;
  }

  return url;
}

export function feedImageSrcSet(raw: unknown): string | undefined {
  const url = feedMediaUrl(raw);
  if (!url || isFeedVideo(url)) return undefined;
  return webpSrcSet(url, 360, FEED_LIST_IMG_W);
}

export function feedAvatarSrc(raw: unknown, _size = 56): string {
  const url = feedMediaUrl(raw);
  if (!url || isFeedVideo(url)) return url;
  if (/mock\/avatar\//.test(url) && url.endsWith('.webp')) return url;
  if (url.includes('.webp') && !url.includes('-sm.webp') && !url.includes('/covers/')) {
    const bare = url.split('?')[0];
    const q = url.includes('?') ? `?${url.split('?')[1]}` : '';
    return `${bare.replace(/\.webp$/, '-sm.webp')}${q}`;
  }
  return url;
}
