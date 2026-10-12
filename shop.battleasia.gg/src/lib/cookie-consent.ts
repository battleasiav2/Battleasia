export type CookieConsentChoice = 'all' | 'essential';

const LS_KEY = 'ba-cookie-consent';
const COOKIE_NAME = 'ba_cookie_consent';

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

function normalize(raw: string | null | undefined): CookieConsentChoice | null {
  if (raw === 'all' || raw === 'essential') return raw;
  return null;
}

export function readCookieConsent(): CookieConsentChoice | null {
  try {
    const fromCookie = normalize(readCookie(COOKIE_NAME));
    if (fromCookie) return fromCookie;
    return normalize(localStorage.getItem(LS_KEY));
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieConsentChoice) {
  try {
    localStorage.setItem(LS_KEY, choice);
    writeCookie(COOKIE_NAME, choice);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('ba-cookie-consent', { detail: choice }));
}

export function allowsAnalytics() {
  return readCookieConsent() === 'all';
}
