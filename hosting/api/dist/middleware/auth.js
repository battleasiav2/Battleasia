import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { AUTH_COOKIE_NAME, ADMIN_AUTH_COOKIE_NAME } from '../utils/auth-cookie.js';
export function extractToken(req) {
    const cookies = req.cookies;
    const cookieToken = cookies?.[AUTH_COOKIE_NAME] || cookies?.[ADMIN_AUTH_COOKIE_NAME];
    if (cookieToken)
        return cookieToken;
    const header = req.headers.authorization;
    if (!header)
        return null;
    if (header.startsWith('Bearer ')) {
        return header.slice(7);
    }
    return header;
}
export async function requireAuth(req, res, next) {
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
