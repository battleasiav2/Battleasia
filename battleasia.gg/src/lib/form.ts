import { useEffect } from 'react';
import { isApiError } from './api';

const REMEMBER = 'ba_remember_email';

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
  if (!isApiError(err)) {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }
  const msg = (err.message || '').trim();
  // Prefer the real server reason when it is specific.
  if (msg && err.status !== 429 && err.status !== 413 && err.status < 500) {
    if (err.status === 403 && /verif/i.test(msg)) return msg;
    if (err.status === 400 || err.status === 401 || err.status === 409) return msg;
    if (msg.length > 8 && !/^request failed$/i.test(msg)) return msg;
  }
  if (err.status === 429) return t('http.429').replace('{n}', String(err.retryAfter || 60));
  if (err.status === 413) return t('http.413');
  if (err.status === 409) return msg || t('http.409');
  if (err.status === 404) return msg || t('http.404');
  if (err.status === 403) return /verif/i.test(msg) ? msg : t('http.403');
  if (err.status >= 500) return t('http.5xx');
  if (err.status === 0 && /cancel/i.test(msg)) return t('http.canceled');
  return msg || fallback;
}

export function useUnsaved(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const on = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);
}

export function maskEmail(value: string) {
  const [name, host] = value.split('@');
  if (!name || !host) return value;
  return `${name.slice(0, 1)}***@${host}`;
}
