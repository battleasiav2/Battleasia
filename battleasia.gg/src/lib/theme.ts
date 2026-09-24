export const ACCENTS = [
  { id: 'violet', color: '#7C5CFF' },
  { id: 'cyan', color: '#21D4FD' },
  { id: 'sky', color: '#38BDF8' },
  { id: 'lime', color: '#CBFB24' },
  { id: 'ember', color: '#FF8A1A' },
  { id: 'jade', color: '#34D399' },
  { id: 'rose', color: '#FB7185' },
  { id: 'red', color: '#EF4444' },
] as const;

export type AccentId = (typeof ACCENTS)[number]['id'];
export type ThemeId = 'dark' | 'light';

const ACCENT_KEY = 'ba-accent';
const THEME_KEY = 'ba-theme';

function cookieDomain() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return '';
  if (host.endsWith('battleasia.gg')) return '; Domain=.battleasia.gg';
  return '';
}

function readCookie(name: string) {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  } catch {
    return '';
  }
}

function writeCookie(name: string, value: string) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${cookieDomain()}`;
  } catch {
    /* ignore */
  }
}

function isAccent(id: string | null | undefined): id is AccentId {
  return Boolean(id && ACCENTS.some((a) => a.id === id));
}

function isTheme(id: string | null | undefined): id is ThemeId {
  return id === 'light' || id === 'dark';
}

function readStoredAccent(): AccentId {
  try {
    const fromLs = localStorage.getItem(ACCENT_KEY);
    if (isAccent(fromLs)) return fromLs;
  } catch {
    /* ignore */
  }
  const fromCookie = readCookie(ACCENT_KEY);
  if (isAccent(fromCookie)) return fromCookie;
  return 'violet';
}

function readStoredTheme(): ThemeId {
  try {
    const fromLs = localStorage.getItem(THEME_KEY);
    if (isTheme(fromLs)) return fromLs;
  } catch {
    /* ignore */
  }
  const fromCookie = readCookie(THEME_KEY);
  if (isTheme(fromCookie)) return fromCookie;
  return 'dark';
}

/** Pull accent/theme from URL so player ↔ shop stay in sync across ports/domains. */
function consumeThemeFromUrl() {
  if (typeof window === 'undefined') return { accent: null as AccentId | null, theme: null as ThemeId | null };
  try {
    const url = new URL(window.location.href);
    const accent = url.searchParams.get('ba_accent') || url.searchParams.get('accent');
    const theme = url.searchParams.get('ba_theme') || url.searchParams.get('theme');
    let changed = false;
    if (isAccent(accent) || isTheme(theme)) {
      if (url.searchParams.has('ba_accent')) {
        url.searchParams.delete('ba_accent');
        changed = true;
      }
      if (url.searchParams.has('ba_theme')) {
        url.searchParams.delete('ba_theme');
        changed = true;
      }
      if (url.searchParams.has('accent') && isAccent(accent)) {
        url.searchParams.delete('accent');
        changed = true;
      }
      if (url.searchParams.has('theme') && isTheme(theme)) {
        url.searchParams.delete('theme');
        changed = true;
      }
      if (changed) {
        const next = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState(null, '', next);
      }
    }
    return {
      accent: isAccent(accent) ? accent : null,
      theme: isTheme(theme) ? theme : null,
    };
  } catch {
    return { accent: null, theme: null };
  }
}

export function readAccent(): AccentId {
  return readStoredAccent();
}

export function readTheme(): ThemeId {
  return readStoredTheme();
}

export function applyAccent(id: string) {
  // Drop legacy gold accent — BAC brand uses violet/cyan family only.
  const next = id === 'gold' ? 'violet' : isAccent(id) ? id : 'violet';
  document.documentElement.dataset.accent = next;
  try {
    localStorage.setItem(ACCENT_KEY, next);
  } catch {
    /* ignore */
  }
  writeCookie(ACCENT_KEY, next);
}

export function applyTheme(id: ThemeId) {
  const next: ThemeId = id === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'light' ? '#F7F8FB' : '#0E0F14');
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  writeCookie(THEME_KEY, next);
}

export function toggleTheme() {
  applyTheme(readTheme() === 'light' ? 'dark' : 'light');
}

/** Call once at app boot — one choice applies site-wide. */
export function bootTheme() {
  const fromUrl = consumeThemeFromUrl();
  applyAccent(fromUrl.accent || readStoredAccent());
  applyTheme(fromUrl.theme || readStoredTheme());
}

/** Append current accent/theme so outbound shop/player links keep the same look. */
export function withThemeQuery(href: string) {
  try {
    const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    url.searchParams.set('ba_accent', readAccent());
    url.searchParams.set('ba_theme', readTheme());
    return url.toString();
  } catch {
    return href;
  }
}
