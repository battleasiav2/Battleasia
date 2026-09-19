import { safeHref } from './safeHref';

export type SiteSocialLink = {
  label: string;
  href: string;
  color?: string;
};

export const FALLBACK_SITE_SOCIALS: SiteSocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1HQV9D33ic/?mibextid=wwXIfr', color: '#1877F2' },
  { label: 'YouTube', href: 'https://youtube.com/@battleasia?si=9ROsHqQNc3mVFMvl', color: '#FF0000' },
  { label: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VbBDBVtGpLHQgYC7WM44', color: '#25D366' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@battleasia?_r=1&_t=ZN-91f9vFOUJcc', color: '#ffffff' },
  { label: 'Discord', href: 'https://discord.gg/battleasia', color: '#5865F2' },
  { label: 'Instagram', href: 'https://www.instagram.com/battleasia', color: '#E1306C' },
  { label: 'Telegram', href: 'https://t.me/battleasiaofficial', color: '#229ED9' },
];

const COLORS: Record<string, string> = {
  facebook: '#1877F2',
  youtube: '#FF0000',
  whatsapp: '#25D366',
  tiktok: '#ffffff',
  discord: '#5865F2',
  instagram: '#E1306C',
  telegram: '#229ED9',
  twitter: '#1DA1F2',
  x: '#ffffff',
};

let cache: SiteSocialLink[] | null = null;
let inflight: Promise<SiteSocialLink[]> | null = null;

function withColor(row: SiteSocialLink): SiteSocialLink {
  if (row.color) return row;
  const key = row.label.toLowerCase().replace(/\s+/g, '');
  return { ...row, color: COLORS[key] };
}

function normalize(links: Array<{ label?: string; href?: string; color?: string }>): SiteSocialLink[] {
  return links
    .map((l) => ({
      label: String(l.label || '').trim(),
      href: safeHref(l.href),
      color: l.color,
    }))
    .filter((l) => l.label && l.href)
    .map((l) => withColor(l));
}

/** Site social links from Admin → Live Chat settings (`socialLinks`). */
export async function fetchSiteSocialLinks(): Promise<SiteSocialLink[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/api/v2/customer-support/live-chat-settings')
    .then((r) => (r.ok ? r.json() : null))
    .then((payload) => {
      const data = (payload?.data ?? payload) as { socialLinks?: Array<{ label?: string; href?: string; color?: string }> } | null;
      const next = normalize(data?.socialLinks || []);
      cache = next.length ? next : FALLBACK_SITE_SOCIALS;
      return cache;
    })
    .catch(() => {
      cache = FALLBACK_SITE_SOCIALS;
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function findSocialHref(links: SiteSocialLink[], label: string, fallback: string) {
  const key = label.toLowerCase();
  const hit = links.find((l) => l.label.toLowerCase().includes(key));
  return safeHref(hit?.href) || safeHref(fallback) || fallback;
}
