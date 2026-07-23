import type { Response } from 'express';
import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'battleasia_token';
export const ADMIN_AUTH_COOKIE_NAME = 'webet_token';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ('strict' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export function setAuthCookie(res: Response, token: string, cookieName = AUTH_COOKIE_NAME) {
  res.cookie(cookieName, token, cookieOptions);
}

export function clearAuthCookie(res: Response, cookieName = AUTH_COOKIE_NAME) {
  res.clearCookie(cookieName, { path: '/', httpOnly: true, sameSite: cookieOptions.sameSite });
}

export function clearAllAuthCookies(res: Response) {
  clearAuthCookie(res, AUTH_COOKIE_NAME);
  clearAuthCookie(res, ADMIN_AUTH_COOKIE_NAME);
}
