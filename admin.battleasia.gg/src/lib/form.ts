import { isApiError } from './api';

const REMEMBER = 'ba_admin_remember_email';

export function sanitizeLine(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();
}

export function focusFirstError(ids: string[]) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.focus();
      return;
    }
  }
}

export function readRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBER) || '';
  } catch {
    return '';
  }
}

export function writeRememberedEmail(email: string, on: boolean) {
  try {
    if (on && email) localStorage.setItem(REMEMBER, sanitizeLine(email).toLowerCase());
    else localStorage.removeItem(REMEMBER);
  } catch {
    /* ignore */
  }
}

export function httpCopy(err: unknown, t: (key: string) => string, fallback: string) {
  if (!isApiError(err)) return fallback;
  if (err.status === 429) return t('http.429').replace('{n}', String(err.retryAfter || 60));
  if (err.status === 413) return t('http.413');
  if (err.status === 409) return t('http.409');
  if (err.status === 404) return t('http.404');
  if (err.status === 403) return /verif/i.test(err.message) ? err.message : t('http.403');
  if (err.status >= 500) return t('http.5xx');
  return err.message || fallback;
}
