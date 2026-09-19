import type { Response } from 'express';
import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'battleasia_token';
export const ADMIN_AUTH_COOKIE_NAME = 'webet_token';
export const AUTH_REFRESH_COOKIE_NAME = 'battleasia_refresh';
export const ADMIN_REFRESH_COOKIE_NAME = 'webet_refresh';

const baseCookie = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ('strict' as const) : ('lax' as const),
  path: '/',
};

const accessCookieOptions = {
  ...baseCookie,
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  ...baseCookie,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function setAuthCookie(res: Response, token: string, cookieName = AUTH_COOKIE_NAME) {
  res.cookie(cookieName, token, accessCookieOptions);
}

export function setRefreshCookie(res: Response, token: string, cookieName = AUTH_REFRESH_COOKIE_NAME) {
  res.cookie(cookieName, token, refreshCookieOptions);
}

export function clearAuthCookie(res: Response, cookieName = AUTH_COOKIE_NAME) {
  res.clearCookie(cookieName, { path: '/', httpOnly: true, sameSite: baseCookie.sameSite });
}

export function clearRefreshCookie(res: Response, cookieName = AUTH_REFRESH_COOKIE_NAME) {
  res.clearCookie(cookieName, { path: '/', httpOnly: true, sameSite: baseCookie.sameSite });
}

export function clearAllAuthCookies(res: Response) {
  clearAuthCookie(res, AUTH_COOKIE_NAME);
  clearAuthCookie(res, ADMIN_AUTH_COOKIE_NAME);
  clearRefreshCookie(res, AUTH_REFRESH_COOKIE_NAME);
  clearRefreshCookie(res, ADMIN_REFRESH_COOKIE_NAME);
}
