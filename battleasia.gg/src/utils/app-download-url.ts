import { CONFIG } from 'src/global-config';

export function resolveAppDownloadHref(downloadUrl: string) {
  if (!downloadUrl) return '';
  if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
    return downloadUrl;
  }

  const base = CONFIG.serverUrl?.replace(/\/$/, '') || '';
  const path = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
  return `${base}${path}`;
}
