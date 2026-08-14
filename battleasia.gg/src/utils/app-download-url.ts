import { CONFIG } from 'src/global-config';

const APK_PATH = '/api/uploads/app/BattleAsia.apk';

function rewriteUploadsPath(pathname: string) {
  if (pathname.startsWith('/uploads/') || pathname === '/uploads') {
    return `/api${pathname}`;
  }
  return pathname;
}

/**
 * Resolve APK download href.
 * Coolify: bare `/uploads/...` hits the SPA (~5KB HTML). Always prefer `/api/uploads/...`.
 */
export function resolveAppDownloadHref(downloadUrl: string) {
  if (!downloadUrl) return APK_PATH;

  if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
    try {
      const u = new URL(downloadUrl);
      u.pathname = rewriteUploadsPath(u.pathname);
      return u.toString();
    } catch {
      return downloadUrl;
    }
  }

  const base = CONFIG.serverUrl?.replace(/\/$/, '') || '';
  let path = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
  path = rewriteUploadsPath(path);

  if (!base) return path;
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return `${base}${path.slice(4)}`;
  }
  return `${base}${path}`;
}

/** Force a real file download (avoids SPA route / HTML "APK"). */
export function startAppDownload(href: string, fileName = 'BattleAsia.apk') {
  const url = resolveAppDownloadHref(href || APK_PATH);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
