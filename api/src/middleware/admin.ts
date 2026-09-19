import type { NextFunction, Response } from 'express';
import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { extractToken, type AuthedRequest } from './auth.js';
import { isAdminRole } from '../utils/admin-role.js';
import { userVer } from '../utils/token-session.js';

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload?.userId || payload.typ === 'refresh') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.status) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (payload.ver != null && Number(payload.ver) !== userVer(user)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!isAdminRole(user)) {
    return res.status(403).json({ status: false, message: 'Admin access required' });
  }

  req.userId = payload.userId;
  return next();
}
