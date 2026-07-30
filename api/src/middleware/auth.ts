import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { AUTH_COOKIE_NAME, ADMIN_AUTH_COOKIE_NAME } from '../utils/auth-cookie.js';

export type AuthedRequest = Request & {
  userId?: string;
};

export function extractToken(req: Request) {
  const header = req.headers.authorization;
  if (header) {
    if (header.startsWith('Bearer ')) {
      return header.slice(7);
    }
    return header;
  }

  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const cookieToken = cookies?.[AUTH_COOKIE_NAME] || cookies?.[ADMIN_AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  return null;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload?.userId) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.status) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.userId = payload.userId;
  return next();
}
