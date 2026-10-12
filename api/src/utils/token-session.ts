import type { Request, Response } from 'express';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { isAdminRole } from './admin-role.js';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_REFRESH_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  clearAllAuthCookies,
  setAuthCookie,
  setRefreshCookie,
} from './auth-cookie.js';
import { signAccessToken, signRefreshToken, verifyToken } from './jwt.js';

export function userVer(user: { tokenVersion?: number }) {
  return Number(user.tokenVersion || 0);
}

export function issuePair(userId: string, ver = 0) {
  return {
    accessToken: signAccessToken(userId, ver),
    refreshToken: signRefreshToken(userId, ver),
  };
}

export function attachPlayerCookies(res: Response, accessToken: string, refreshToken: string) {
  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
}

export function attachAdminCookies(res: Response, accessToken: string, refreshToken: string) {
  setAuthCookie(res, accessToken, ADMIN_AUTH_COOKIE_NAME);
  setRefreshCookie(res, refreshToken, ADMIN_REFRESH_COOKIE_NAME);
}

export function sessionPayload(accessToken: string, refreshToken: string) {
  return {
    status: true,
    token: accessToken,
    refreshToken,
    data: { token: accessToken },
    session: { accessToken, refreshToken },
  };
}

function cookiesOf(req: Request) {
  return (req as Request & { cookies?: Record<string, string> }).cookies || {};
}

function authHeaderToken(req: Request) {
  const header = req.headers.authorization;
  if (!header) return '';
  return header.startsWith('Bearer ') ? header.slice(7) : header;
}

function liveRefresh(token: string) {
  if (!token) return '';
  const payload = verifyToken(token);
  if (payload?.userId && payload.typ === 'refresh') return token;
  return '';
}

/** Only a live refresh token can mint a new pair. Access tokens are ignored, expired or not. */
function pickRefresh(req: Request, kind: 'player' | 'admin') {
  const body = (req.body || {}) as { refresh?: string; refreshToken?: string; token?: string };
  const cookies = cookiesOf(req);
  const refreshCookie =
    kind === 'admin'
      ? cookies[ADMIN_REFRESH_COOKIE_NAME] || cookies[AUTH_REFRESH_COOKIE_NAME]
      : cookies[AUTH_REFRESH_COOKIE_NAME] || cookies[ADMIN_REFRESH_COOKIE_NAME];
  const accessCookie =
    kind === 'admin'
      ? cookies[ADMIN_AUTH_COOKIE_NAME] || cookies[AUTH_COOKIE_NAME]
      : cookies[AUTH_COOKIE_NAME] || cookies[ADMIN_AUTH_COOKIE_NAME];

  const explicit = String(body.refresh || body.refreshToken || refreshCookie || '').trim();
  if (explicit) return liveRefresh(explicit);

  const bodyToken = liveRefresh(String(body.token || '').trim());
  if (bodyToken) return bodyToken;

  const header = liveRefresh(authHeaderToken(req));
  if (header) return header;

  return liveRefresh(accessCookie);
}

export async function refreshSession(req: Request, res: Response, kind: 'player' | 'admin') {
  const token = pickRefresh(req, kind);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId || payload.typ !== 'refresh') return null;

  const user = await User.findById(payload.userId);
  if (!user || !user.status) return null;
  if (payload.ver != null && Number(payload.ver) !== userVer(user)) return null;
  if (kind === 'admin' && !isAdminRole(user)) return null;

  const pair = issuePair(user._id.toString(), userVer(user));
  if (kind === 'admin') attachAdminCookies(res, pair.accessToken, pair.refreshToken);
  else attachPlayerCookies(res, pair.accessToken, pair.refreshToken);
  return pair;
}

export async function bumpTokenVersion(userId: string) {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}

/**
 * Invalidates the account that presented a still-valid access or refresh token.
 * Other accounts are left unchanged. The app has one token version per user,
 * so this signs that user out of their current sessions.
 */
export async function endSession(req: Request, res: Response) {
  const body = (req.body || {}) as { refresh?: string; refreshToken?: string; token?: string };
  const cookies = cookiesOf(req);
  const candidates = [
    String(body.refresh || '').trim(),
    String(body.refreshToken || '').trim(),
    String(cookies[AUTH_REFRESH_COOKIE_NAME] || '').trim(),
    String(cookies[ADMIN_REFRESH_COOKIE_NAME] || '').trim(),
    authHeaderToken(req),
    String(body.token || '').trim(),
    String(cookies[AUTH_COOKIE_NAME] || '').trim(),
    String(cookies[ADMIN_AUTH_COOKIE_NAME] || '').trim(),
  ];
  for (const token of candidates) {
    if (!token) continue;
    const payload = verifyToken(token);
    if (!payload?.userId) continue;
    const user = await User.findById(payload.userId).select('tokenVersion');
    if (!user) break;
    if (payload.ver != null && Number(payload.ver) !== userVer(user)) break;
    await bumpTokenVersion(String(user._id));
    await Session.deleteMany({ userId: user._id });
    break;
  }
  clearAllAuthCookies(res);
}
