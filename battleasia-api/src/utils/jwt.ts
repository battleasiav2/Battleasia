import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = {
  userId: string;
};

export function signToken(userId: string) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}
