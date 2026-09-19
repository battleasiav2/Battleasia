import { api, readAccessToken, unwrapUser, writeAccessToken, writeRefreshToken } from './api';
import { readReferral } from './ref';

const FLAG = 'ba-signed-in';

export type AuthUser = {
  id?: string;
  email?: string;
  username?: string;
  avatar?: string;
  coverUrl?: string;
  balance?: number;
  emailVerified?: boolean;
  referralCode?: string;
  pubgId?: string;
  bio?: string;
  gameServer?: string;
  countryCode?: string;
  mobileNo?: string;
  twitterLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  kycStatus?: string;
  muteWords?: string[];
  cosmeticId?: string;
  isPremium?: boolean;
  premiumExpiresAt?: string;
};

export function isPremiumUser(user?: AuthUser | null) {
  if (!user?.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  const t = new Date(user.premiumExpiresAt).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

export function captureAuthPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return;
  const row = payload as {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    session?: { accessToken?: string; refreshToken?: string };
    data?: { token?: string };
  };
  const token = row.session?.accessToken || row.token || row.accessToken || row.data?.token;
  if (token) writeAccessToken(token);
  const refresh = row.session?.refreshToken || row.refreshToken;
  if (refresh) writeRefreshToken(refresh);
}

export { readAccessToken };

export function markSignedIn(user?: AuthUser) {
  sessionStorage.setItem(FLAG, '1');
  if (user) sessionStorage.setItem('ba-user', JSON.stringify(user));
}

export function clearSignedIn() {
  sessionStorage.removeItem(FLAG);
  sessionStorage.removeItem('ba-user');
  writeAccessToken('');
  writeRefreshToken('');
}

export function isSignedIn() {
  return sessionStorage.getItem(FLAG) === '1';
}

export function readSessionUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem('ba-user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function safeReturnTo(value: string | null) {
  if (!value) return '/user/play';
  if (value.startsWith('/user/') || value.startsWith('/dashboard') || value.startsWith('/profile/')) return value;
  return '/user/play';
}

export async function signIn(email: string, password: string) {
  const payload = await api('/api/v2/users/signin', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
  captureAuthPayload(payload);
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
  captureAuthPayload(payload);
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
  const user = unwrapUser<AuthUser>(payload);
  markSignedIn(user);
  return user;
}

export async function logout() {
  try {
    await api('/api/v2/users/logout', { method: 'POST' });
  } finally {
    clearSignedIn();
  }
}
