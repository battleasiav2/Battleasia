import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = {
  userId: string;
  typ?: 'access' | 'refresh';
  ver?: number;
};

export const ACCESS_TTL = '15m';
export const REFRESH_TTL = '7d';

export function signAccessToken(userId: string, ver = 0) {
  return jwt.sign({ userId, typ: 'access', ver }, env.jwtSecret, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(userId: string, ver = 0) {
  return jwt.sign({ userId, typ: 'refresh', ver }, env.jwtSecret, { expiresIn: REFRESH_TTL });
}

export function signToken(userId: string, ver = 0) {
  return signAccessToken(userId, ver);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret, { ignoreExpiration: true }) as JwtPayload;
  } catch {
    return null;
  }
}
