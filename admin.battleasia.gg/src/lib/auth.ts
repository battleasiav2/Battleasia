import { api, unwrapUser, writeAdminRefresh, writeAdminToken } from './api';

const USER = 'ba-admin-user';
const GATE = 'ba-admin-gate';

/** In-memory only — never persist plaintext password (XSS-safe). */
let otpPasswordMemory = '';

export type AdminUser = {
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
  role?: { type?: string; name?: string; permissions?: string[] };
  permissions?: string[];
};

export function markAdmin(user?: AdminUser, token?: string) {
  sessionStorage.setItem(GATE, '1');
  if (user) sessionStorage.setItem(USER, JSON.stringify(user));
  if (token) writeAdminToken(token);
}

export function clearAdmin() {
  sessionStorage.removeItem(GATE);
  sessionStorage.removeItem(USER);
  otpPasswordMemory = '';
  writeAdminToken('');
  writeAdminRefresh('');
}

export function isAdminAuthed() {
  return sessionStorage.getItem(GATE) === '1';
}

export function readAdminUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function can(perm?: string | null) {
  if (!perm) return true;
  const user = readAdminUser();
  const type = user?.role?.type || '';
  if (type === 'admin') return true;
  const perms = user?.role?.permissions || user?.permissions || [];
  return perms.includes(perm);
}

export function stashOtpPassword(password: string) {
  otpPasswordMemory = password;
}

export function takeOtpPassword() {
  const value = otpPasswordMemory;
  otpPasswordMemory = '';
  return value;
}

export function safeReturnTo(value: string | null) {
  if (!value) return '/dashboard';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return '/dashboard';
}

function tokenFrom(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '';
  const row = payload as {
    token?: string;
    session?: { accessToken?: string; refreshToken?: string };
    refreshToken?: string;
  };
  const refresh = row.session?.refreshToken || row.refreshToken;
  if (refresh) writeAdminRefresh(refresh);
  return row.session?.accessToken || row.token || '';
}

export async function adminSignIn(email: string, password: string) {
  const payload = await api<{ otpRequired?: boolean; email?: string; session?: { accessToken?: string } }>(
    '/api/v3/users/auth/signin',
    { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) }
  );
  return payload;
}

export async function adminVerifyOtp(email: string, password: string, code: string) {
  const payload = await api('/api/v3/users/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, password, code }),
  });
  return payload;
}

export async function fetchAdminMe() {
  const payload = await api('/api/v3/users/auth/me');
  return unwrapUser<AdminUser>(payload);
}

export async function adminLogout() {
  try {
    await api('/api/v3/users/auth/logout', { method: 'POST' });
  } finally {
    clearAdmin();
  }
}

export function finishLogin(payload: unknown) {
  const user = unwrapUser<AdminUser>(payload);
  markAdmin(user, tokenFrom(payload));
  otpPasswordMemory = '';
  return user;
}
