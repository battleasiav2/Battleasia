import { api, unwrapData } from './api';

export type SiteNotice = {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  dismissible: boolean;
  version: number;
  updatedAt: string | null;
};

const DISMISS_KEY = 'ba-site-notice-v';

export function readDismissedNoticeVersion() {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

export function writeDismissedNoticeVersion(version: number) {
  try {
    localStorage.setItem(DISMISS_KEY, String(version));
  } catch {
    /* ignore */
  }
}

export async function fetchSiteNotice(): Promise<SiteNotice | null> {
  try {
    const payload = await api('/api/v2/app-settings/site-notice', { skipRefresh: true });
    const data = unwrapData<Partial<SiteNotice>>(payload);
    if (!data || data.enabled !== true) return null;
    const title = String(data.title || '').trim();
    const message = String(data.message || '').trim();
    const imageUrl = String(data.imageUrl || '').trim();
    if (!title && !message && !imageUrl) return null;
    return {
      enabled: true,
      title,
      message,
      imageUrl,
      ctaLabel: String(data.ctaLabel || '').trim(),
      ctaUrl: String(data.ctaUrl || '').trim(),
      dismissible: data.dismissible !== false,
      version: Math.max(Number(data.version) || 1, 1),
      updatedAt: data.updatedAt ? String(data.updatedAt) : null,
    };
  } catch {
    return null;
  }
}
