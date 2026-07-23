import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { LoginHistory } from '../../models/LoginHistory.js';
import { Session } from '../../models/Session.js';
import { VerificationCode } from '../../models/VerificationCode.js';
import { requireAuth } from '../../middleware/auth.js';
import { signToken } from '../../utils/jwt.js';
import { serializeUser } from '../../utils/serialize.js';
import { logAuthCode } from '../../utils/auth-log.js';
import { ADMIN_AUTH_COOKIE_NAME, clearAllAuthCookies, setAuthCookie, } from '../../utils/auth-cookie.js';
const router = Router();
const OTP_TTL_MS = 10 * 60 * 1000;
const ADMIN_ROLES = new Set(['admin', 'official', 'agent']);
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string')
        return forwarded.split(',')[0].trim();
    return req.ip || req.socket?.remoteAddress || '';
}
async function createAdminSession(user, req) {
    const accessToken = signToken(user._id.toString());
    const ip = getClientIp(req);
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await Promise.all([
        LoginHistory.create({
            userId: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar || '',
            ip,
            country: '',
            useragent: req.headers['user-agent'] ? { raw: req.headers['user-agent'] } : {},
        }),
        Session.create({
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role?.name || '',
            status: user.status,
            avatar: user.avatar || '',
            ip,
            country: '',
            useragent: req.headers['user-agent'] ? { raw: req.headers['user-agent'] } : {},
            expiration,
        }),
    ]);
    return accessToken;
}
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.status) {
            return res.status(403).json({ message: 'Account is disabled' });
        }
        const roleType = user.role?.type || '';
        if (!ADMIN_ROLES.has(roleType)) {
            return res.status(403).json({
                message: 'Admin access required. Use your admin account (not player login).',
            });
        }
        const otpCode = String(Math.floor(100000 + Math.random() * 900000));
        await VerificationCode.deleteMany({ email: user.email, type: 'admin_login' });
        await VerificationCode.create({
            email: user.email,
            code: otpCode,
            type: 'admin_login',
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
        });
        logAuthCode('admin OTP', user.email, otpCode);
        return res.json({
            otpRequired: true,
            email: user.email,
            message: 'OTP sent. Verify to complete sign in.',
        });
    }
    catch (error) {
        console.error('signin error:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
});
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, password, code } = req.body;
        if (!email || !password || !code?.trim()) {
            return res.status(400).json({ status: false, message: 'Email, password, and OTP are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid credentials' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ status: false, message: 'Invalid credentials' });
        }
        if (!ADMIN_ROLES.has(user.role?.type || '')) {
            return res.status(403).json({ status: false, message: 'Admin access required' });
        }
        const record = await VerificationCode.findOne({
            email: user.email,
            type: 'admin_login',
            code: code.trim(),
        });
        if (!record || record.expiresAt.getTime() < Date.now()) {
            return res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
        }
        await VerificationCode.deleteOne({ _id: record._id });
        const accessToken = await createAdminSession(user, req);
        setAuthCookie(res, accessToken, ADMIN_AUTH_COOKIE_NAME);
        return res.json({
            status: true,
            user: serializeUser(user),
            session: { accessToken },
            balance: { balance: user.balance ?? 0 },
        });
    }
    catch (error) {
        console.error('verify-otp error:', error);
        return res.status(500).json({ status: false, message: 'OTP verification failed' });
    }
});
router.post('/logout', (_req, res) => {
    clearAllAuthCookies(res);
    return res.json({ status: true, message: 'Logged out' });
});
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.json({ user: serializeUser(user) });
    }
    catch (error) {
        console.error('me error:', error);
        return res.status(500).json({ message: 'Failed to load profile' });
    }
});
router.patch('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { currentPassword, newPassword, avatar } = req.body;
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }
            const valid = await bcrypt.compare(currentPassword, user.password);
            if (!valid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }
        if (typeof avatar === 'string') {
            user.avatar = avatar;
        }
        await user.save();
        return res.json({ status: true, user: serializeUser(user) });
    }
    catch (error) {
        console.error('profile error:', error);
        return res.status(500).json({ message: 'Failed to update profile' });
    }
});
export default router;
