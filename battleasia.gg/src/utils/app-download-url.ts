import { CONFIG } from 'src/global-config';

/**
 * Resolve APK (and other upload) download hrefs.
 * On Coolify, bare `/uploads/...` hits the SPA (~5KB HTML). Prefer `/api/uploads/...`
 * when the API is same-origin under `/api`.
 */
export function resolveAppDownloadHref(downloadUrl: string) {
  if (!downloadUrl) return '';
  if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
    return downloadUrl;
  }

  const base = CONFIG.serverUrl?.replace(/\/$/, '') || '';
  let path = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;

  if (path.startsWith('/uploads/') || path === '/uploads') {
    if (!base) {
      path = `/api${path}`;
    } else if (base.endsWith('/api')) {
      // base + /uploads → .../api/uploads
    } else {
      return `${base}/api${path}`;
    }
  }

  return `${base}${path}`;
}
