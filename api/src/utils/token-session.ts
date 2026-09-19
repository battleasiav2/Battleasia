import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { isAdminRole } from './admin-role.js';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_REFRESH_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  setAuthCookie,
  setRefreshCookie,
} from './auth-cookie.js';
import { decodeToken, signAccessToken, signRefreshToken, verifyToken } from './jwt.js';

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

function pickPresented(req: Request, kind: 'player' | 'admin') {
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
  const header = authHeaderToken(req);

  const refresh = String(body.refresh || body.refreshToken || refreshCookie || '').trim();
  if (refresh) return { token: refresh, allowExpired: false };

  const bodyToken = String(body.token || '').trim();
  if (bodyToken) {
    const decoded = decodeToken(bodyToken);
    if (decoded?.typ === 'refresh') return { token: bodyToken, allowExpired: false };
    return { token: bodyToken, allowExpired: true };
  }

  if (header) {
    const decoded = decodeToken(header);
    if (decoded?.typ === 'refresh') return { token: header, allowExpired: false };
    return { token: header, allowExpired: true };
  }

  if (accessCookie) return { token: accessCookie, allowExpired: true };
  return null;
}

export async function refreshSession(req: Request, res: Response, kind: 'player' | 'admin') {
  const presented = pickPresented(req, kind);
  if (!presented) return null;

  const live = verifyToken(presented.token);
  const payload = live || (presented.allowExpired ? decodeToken(presented.token) : null);
  if (!payload?.userId) return null;
  if (payload.typ === 'refresh' && !live) return null;

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
