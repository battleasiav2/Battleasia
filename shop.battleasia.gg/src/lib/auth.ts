import { api, rememberShopRefresh, unwrapUser } from './api';
import { readReferral } from './ref';
import {
  beginShopHour,
  clearShopSession,
  readShopKey,
  SHOP_GATE,
  SHOP_USER,
  shopSessionAlive,
  writeShopKey,
} from './shopSession';
import { withThemeQuery } from './theme';

export function getMainAppUrl(path = '/') {
  const configured = (import.meta.env.VITE_MAIN_APP_URL as string | undefined) || 'https://battleasia.gg';
  let origin = configured;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      try {
        const url = new URL(configured);
        url.hostname = host;
        origin = url.origin;
      } catch {
        origin = configured;
      }
    }
  }
  const target = path.startsWith('/') ? path : `/${path}`;
  return withThemeQuery(`${origin.replace(/\/$/, '')}${target}`);
}

export type AuthUser = {
  id?: string;
  email?: string;
  username?: string;
  balance?: number;
  emailVerified?: boolean;
};

export function markShopGate(user?: AuthUser) {
  beginShopHour();
  writeShopKey(SHOP_GATE, '1');
  if (user) writeShopKey(SHOP_USER, JSON.stringify(user));
}

export function patchSessionBalance(balance: number) {
  try {
    const raw = readShopKey(SHOP_USER);
    const user = raw ? (JSON.parse(raw) as AuthUser) : {};
    const next = { ...user, balance };
    writeShopKey(SHOP_USER, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('ba-balance', { detail: balance }));
  } catch {
    window.dispatchEvent(new CustomEvent('ba-balance', { detail: balance }));
  }
}

export function clearShopGate() {
  clearShopSession();
}

export function isShopAuthed() {
  if (!shopSessionAlive()) {
    if (readShopKey(SHOP_GATE)) clearShopSession();
    return false;
  }
  return readShopKey(SHOP_GATE) === '1';
}

export function readSessionUser(): AuthUser | null {
  if (!shopSessionAlive()) return null;
  try {
    const raw = readShopKey(SHOP_USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function safeReturnTo(value: string | null) {
  if (!value) return '/user/shop';
  if (value === '/user' || value.startsWith('/user/')) return value;
  return '/user/shop';
}

export async function signIn(email: string, password: string) {
  const payload = await api('/api/v2/users/signin', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
  rememberShopRefresh(payload);
  return unwrapUser<AuthUser>(payload);
}

export async function signUp(payload: Record<string, string>) {
  const referredBy = readReferral();
  return api<{ email: string }>('/api/v2/users/signup', {
    method: 'POST',
    body: JSON.stringify({ ...payload, referredBy: referredBy || undefined }),
  });
}

export type EmailCheck = {
  available: boolean;
  pending?: boolean;
  message?: string;
};

export async function checkEmailAvailable(email: string): Promise<EmailCheck> {
  const q = encodeURIComponent(email.trim().toLowerCase());
  const payload = await api(`/api/v2/users/check-email?email=${q}`);
  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: EmailCheck }).data
      : (payload as EmailCheck);
  return {
    available: Boolean(data?.available),
    pending: Boolean(data?.pending),
    message: typeof data?.message === 'string' ? data.message : undefined,
  };
}

export async function verifyEmailSignup(email: string, code: string) {
  const payload = await api('/api/v2/users/verify-email-signup', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  rememberShopRefresh(payload);
  return unwrapUser<AuthUser>(payload);
}

export async function resendVerification(email: string) {
  return api('/api/v2/users/resend-verification-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string) {
  return api('/api/v2/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
}

export async function resetPassword(email: string, code: string, password: string) {
  return api('/api/v2/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword: password }),
  });
}

export async function fetchMe() {
  const payload = await api('/api/v2/users/me');
  return unwrapUser<AuthUser>(payload);
}

export function leaveShop() {
  void import('./socket').then(({ disconnectSocket }) => disconnectSocket());
  clearShopGate();
}
