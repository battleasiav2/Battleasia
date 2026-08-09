import { Router } from 'express';
import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { User } from '../../models/User.js';
import { Role } from '../../models/Role.js';
import { LoginHistory } from '../../models/LoginHistory.js';
import { Session } from '../../models/Session.js';
import { VerificationCode } from '../../models/VerificationCode.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { signToken } from '../../utils/jwt.js';
import { BalanceHistory } from '../../models/BalanceHistory.js';
import { ReferralHistory } from '../../models/ReferralHistory.js';
import { serializeUser, generateReferralCode } from '../../utils/serialize.js';
import { getLeaderboardEntries } from '../../utils/leaderboard.js';
import { paginatedResults, parsePagination } from '../../utils/pagination.js';
import { Follow } from '../../models/Follow.js';
import { UserBlock } from '../../models/UserBlock.js';
import { serializePublicUser, getFollowCounts } from '../../utils/social-serialize.js';
import { createActivityNotification } from '../../utils/social-notifications.js';
import { getWithdrawableInfo } from '../../utils/withdrawable-amount.js';
import { getAppSettings, normalizeProfileSocialSettings } from '../../models/AppSettings.js';
import {
  getMutualFollowers,
  getRecentFollows,
  getSuggestedFollows,
  serializeFollowUsers,
} from '../../utils/profile-social.js';
import { recordBalanceHistory } from '../../utils/balance-history.js';
import { notifyBalanceChange } from '../../utils/balance-notify.js';
import { notifyPremiumActivated } from '../../utils/payment-notifications.js';
import { buildMyMatchHistory, buildUserMatchHistory } from '../../utils/match-history.js';
import { resolveReferrerId } from '../../utils/referral.js';
import { logAuthCode } from '../../utils/auth-log.js';
import { sendVerificationCodeEmail } from '../../utils/mail.js';
import { clearAllAuthCookies, setAuthCookie } from '../../utils/auth-cookie.js';
import mongoose from 'mongoose';

const router = Router();

const CODE_TTL_MS = 15 * 60 * 1000;
const VALID_GAME_SERVERS = new Set(['europe', 'asia', 'south-america', 'middle-east', 'krjp']);

function getClientIp(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function saveVerificationCode(email: string, type: 'signup' | 'reset') {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await VerificationCode.deleteMany({ email, type });
  await VerificationCode.create({ email, code, type, expiresAt });

  await sendVerificationCodeEmail(email, code, type);
  logAuthCode(`${type} verification code`, email, code);
  return code;
}

async function verifyCode(email: string, code: string, type: 'signup' | 'reset') {
  const record = await VerificationCode.findOne({ email: email.toLowerCase().trim(), type, code });
  if (!record) return false;
  if (record.expiresAt.getTime() < Date.now()) {
    await VerificationCode.deleteOne({ _id: record._id });
    return false;
  }
  await VerificationCode.deleteOne({ _id: record._id });
  return true;
}

async function createLoginSession(
  user: InstanceType<typeof User>,
  req: { ip?: string; headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
  res?: Response
) {
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

  if (res) {
    setAuthCookie(res, accessToken);
  }

  return accessToken;
}

router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      countryCode,
      mobileNo,
      pubgId,
      gameServer,
      referredBy,
    } = req.body as {
      email?: string;
      password?: string;
      username?: string;
      countryCode?: string;
      mobileNo?: string;
      pubgId?: string;
      gameServer?: string;
      referredBy?: string;
    };

    if (!email || !password || !username || !countryCode || !mobileNo || !pubgId || !gameServer) {
      return res.status(400).json({ status: false, message: 'All required fields must be provided' });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: false, message: 'Password must be at least 8 characters' });
    }

    if (!VALID_GAME_SERVERS.has(gameServer)) {
      return res.status(400).json({ status: false, message: 'Invalid game server' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existing) {
      if (!existing.emailVerified && existing.email === normalizedEmail) {
        await saveVerificationCode(normalizedEmail, 'signup');
        return res.status(409).json({
          status: false,
          message: 'Email verification is pending. A new code has been sent.',
          emailVerificationPending: true,
          email: normalizedEmail,
        });
      }
      if (existing.email === normalizedEmail) {
        return res.status(409).json({ status: false, message: 'Email already registered' });
      }
      return res.status(409).json({ status: false, message: 'Username already taken' });
    }

    const playerRole = await Role.findOne({ type: 'player', name: 'Player' });
    const passwordHash = await bcrypt.hash(password, 10);

    let referrerId: mongoose.Types.ObjectId | null = null;
    if (referredBy?.trim()) {
      referrerId = await resolveReferrerId(referredBy.trim());
    }

    await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      password: passwordHash,
      status: false,
      emailVerified: false,
      balance: 0,
      pubgId: pubgId.trim(),
      gameServer,
      countryCode: String(countryCode).replace(/\D/g, ''),
      mobileNo: String(mobileNo).replace(/\D/g, ''),
      referralCode: generateReferralCode(normalizedUsername),
      referredBy: referrerId,
      roleRef: playerRole?._id ?? null,
      role: {
        type: 'player',
        name: 'Player',
        permissions: [],
      },
    });

    await saveVerificationCode(normalizedEmail, 'signup');

    return res.json({
      status: true,
      emailVerificationRequired: true,
      email: normalizedEmail,
      message: 'Account created. Please verify your email.',
    });
  } catch (error) {
    console.error('signup error:', error);
    return res.status(500).json({ status: false, message: 'Registration failed' });
  }
});

router.post('/logout', (_req, res) => {
  clearAllAuthCookies(res);
  return res.json({ status: true, message: 'Logged out' });
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ status: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ status: false, message: 'Invalid email or password' });
    }

    if (!user.status && user.emailVerified === false) {
      await saveVerificationCode(user.email, 'signup');
      return res.status(403).json({
        status: false,
        message: 'Email verification required',
        emailVerificationRequired: true,
        email: user.email,
      });
    }

    if (!user.status) {
      return res.status(403).json({ status: false, message: 'Account is disabled' });
    }

    const accessToken = await createLoginSession(user, req, res);
    const serialized = serializeUser(user);

    return res.json({
      status: true,
      session: { accessToken },
      user: serialized,
      balance: { balance: user.balance ?? 0 },
    });
  } catch (error) {
    console.error('signin error:', error);
    return res.status(500).json({ status: false, message: 'Login failed' });
  }
});

router.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const period = String(req.query.period || 'all');
    const validPeriod = period === 'weekly' || period === 'monthly' ? period : 'all';
    const data = await getLeaderboardEntries(validPeriod, 50);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('leaderboard error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch leaderboard' });
  }
});

router.get('/withdrawable-amount', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const data = await getWithdrawableInfo(user._id.toString(), user.balance ?? 0);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('withdrawable-amount error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch withdrawable amount' });
  }
});

router.get('/balance-history', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const [records, count] = await Promise.all([
      BalanceHistory.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BalanceHistory.countDocuments({ userId }),
    ]);

    const results = records.map((item) => {
      const detail = (item.detail && typeof item.detail === 'object' ? item.detail : {}) as Record<
        string,
        unknown
      >;
      const reason = detail.reason;
      let type: string = item.type;
      if (reason === 'match_winnings' || reason === 'match_result_update' || reason === 'match_reward') {
        type = 'earning';
      }

      return {
        _id: String(item._id),
        id: String(item._id),
        amount: item.amount ?? 0,
        type,
        balanceBefore: item.balanceBefore ?? 0,
        balanceAfter: item.balanceAfter ?? 0,
        performedBy: item.performedBy ? String(item.performedBy) : '',
        detail,
        createdAt: item.createdAt,
      };
    });

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('balance-history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch balance history' });
  }
});

router.get('/referrals', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const referredUsers = await User.find({ referredBy: req.userId }).sort({ createdAt: -1 });
    const referredIds = referredUsers.map((u) => u._id);

    const aggregates = referredIds.length
      ? await ReferralHistory.aggregate<{
          _id: unknown;
          totalEarnings: number;
          totalDeposits: number;
          depositCount: number;
          lastCommissionAt: Date | null;
        }>([
          { $match: { referrerId: new mongoose.Types.ObjectId(req.userId), referredUserId: { $in: referredIds } } },
          {
            $group: {
              _id: '$referredUserId',
              totalEarnings: { $sum: '$commissionAmount' },
              totalDeposits: { $sum: '$depositAmount' },
              depositCount: { $sum: 1 },
              lastCommissionAt: { $max: '$createdAt' },
            },
          },
        ])
      : [];

    const aggMap = new Map(aggregates.map((row) => [String(row._id), row]));

    const data = referredUsers.map((user) => {
      const agg = aggMap.get(user._id.toString());
      return {
        _id: user._id.toString(),
        id: user._id.toString(),
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        status: user.status ? 'active' : 'inactive',
        joinedAt: user.createdAt,
        createdAt: user.createdAt,
        earnings: agg?.totalEarnings ?? 0,
        totalEarnings: agg?.totalEarnings ?? 0,
        totalDeposits: agg?.totalDeposits ?? 0,
        depositCount: agg?.depositCount ?? 0,
        lastCommissionAt: agg?.lastCommissionAt ?? null,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          status: user.status ? 'active' : 'inactive',
        },
      };
    });

    return res.json({ status: true, data });
  } catch (error) {
    console.error('referrals error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch referrals' });
  }
});

router.get('/referral-commissions', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter = { referrerId: req.userId };

    const [histories, count] = await Promise.all([
      ReferralHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReferralHistory.countDocuments(filter),
    ]);

    const results = histories.map((h) => ({
      _id: h._id.toString(),
      id: h._id.toString(),
      referredUserId: h.referredUserId.toString(),
      referredUsername: h.referredUsername,
      referredEmail: h.referredEmail,
      depositAmount: h.depositAmount,
      commissionRate: h.commissionRate,
      commissionAmount: h.commissionAmount,
      depositSource: h.depositSource || 'manual',
      depositId: h.depositId?.toString() || null,
      status: h.status,
      createdAt: h.createdAt,
    }));

    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('referral-commissions error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch referral commissions' });
  }
});

router.get('/referral-settings', requireAuth, async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      referralSettings: { commissionRate: settings.commissionRate },
    });
  } catch (error) {
    console.error('referral-settings error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch referral settings' });
  }
});

router.get('/referral-stats', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const [referredUsers, commissions, settings] = await Promise.all([
      User.find({ referredBy: req.userId }).select('status'),
      ReferralHistory.find({ referrerId: req.userId }),
      getAppSettings(),
    ]);

    const totalReferrals = referredUsers.length;
    const activeReferrals = referredUsers.filter((u) => u.status).length;
    const inactiveReferrals = totalReferrals - activeReferrals;
    const totalEarnings = commissions.reduce((sum, h) => sum + (h.commissionAmount || 0), 0);
    const paidEarnings = commissions
      .filter((h) => h.status === 'paid')
      .reduce((sum, h) => sum + (h.commissionAmount || 0), 0);
    const totalDepositsFromReferrals = commissions.reduce((sum, h) => sum + (h.depositAmount || 0), 0);
    const totalCommissionEvents = commissions.length;

    return res.json({
      status: true,
      data: {
        totalReferrals,
        activeReferrals,
        inactiveReferrals,
        totalEarnings,
        paidEarnings,
        totalDepositsFromReferrals,
        totalCommissionEvents,
        commissionRate: settings.commissionRate,
      },
    });
  } catch (error) {
    console.error('referral-stats error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch referral stats' });
  }
});

router.get('/premium/details', requireAuth, async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      premium: {
        premiumDuration: settings.premiumDuration,
        premiumPrice: settings.premiumPrice,
      },
    });
  } catch (error) {
    console.error('premium details error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch premium details' });
  }
});

router.post('/premium/activate', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const settings = await getAppSettings();
    const price = settings.premiumPrice;
    const balanceBefore = user.balance ?? 0;

    if (balanceBefore < price) {
      return res.status(400).json({ status: false, message: 'Insufficient balance for premium' });
    }

    user.balance = balanceBefore - price;
    const now = new Date();
    const base =
      user.premiumExpiresAt && user.premiumExpiresAt.getTime() > now.getTime()
        ? user.premiumExpiresAt
        : now;
    user.premiumExpiresAt = new Date(base.getTime() + settings.premiumDuration * 24 * 60 * 60 * 1000);
    user.isPremium = true;
    if (!user.premiumSince) user.premiumSince = now;
    await user.save();

    await recordBalanceHistory({
      user,
      amount: price,
      type: 'withdraw',
      balanceBefore,
      balanceAfter: user.balance,
      performedBy: req.userId,
      detail: { reason: 'premium_activation', days: settings.premiumDuration },
    });

    await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);
    await notifyPremiumActivated({
      userId: user._id.toString(),
      days: settings.premiumDuration,
    });

    return res.json({ status: true, user: serializeUser(user) });
  } catch (error) {
    console.error('premium activate error:', error);
    return res.status(500).json({ status: false, message: 'Failed to activate premium' });
  }
});

router.post('/send-verification-email', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ status: false, message: 'Email is already verified' });
    }

    await saveVerificationCode(user.email, 'signup');
    return res.json({ status: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('send-verification-email error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send verification email' });
  }
});

router.post('/verify-email', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { code } = req.body as { code?: string };
    if (!code?.trim()) {
      return res.status(400).json({ status: false, message: 'Verification code is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ status: false, message: 'Email is already verified' });
    }

    const valid = await verifyCode(user.email, code.trim(), 'signup');
    if (!valid) {
      return res.status(400).json({ status: false, message: 'Invalid or expired verification code' });
    }

    user.emailVerified = true;
    await user.save();

    return res.json({ status: true, emailVerified: true, user: serializeUser(user) });
  } catch (error) {
    console.error('verify-email error:', error);
    return res.status(500).json({ status: false, message: 'Verification failed' });
  }
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const data = await serializePublicUser(user, req.userId);
    return res.json({ status: true, user: serializeUser(user), data });
  } catch (error) {
    console.error('me error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load profile' });
  }
});

router.put('/me', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const body = req.body as Record<string, unknown>;
    const allowed = [
      'username',
      'email',
      'countryCode',
      'mobileNo',
      'pubgId',
      'gameServer',
      'referralCode',
      'avatar',
      'coverUrl',
      'displayName',
      'bio',
      'website',
      'twitterLink',
      'facebookLink',
      'instagramLink',
      'privacy',
    ] as const;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        (user as unknown as Record<string, unknown>)[key] = body[key];
      }
    }

    if (typeof body.username === 'string' && body.username.trim()) {
      const taken = await User.findOne({
        username: body.username.trim(),
        _id: { $ne: user._id },
      });
      if (taken) {
        return res.status(409).json({ status: false, message: 'Username already taken' });
      }
      user.username = body.username.trim();
    }

    await user.save();
    const data = await serializePublicUser(user, req.userId);
    return res.json({ status: true, user: serializeUser(user), data, message: 'Profile updated' });
  } catch (error) {
    console.error('update me error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update profile' });
  }
});

async function listFollowUsers(
  field: 'followerId' | 'followingId',
  userId: string,
  skip: number,
  limit: number,
  viewerId?: string
) {
  const matchField = field === 'followerId' ? 'followingId' : 'followerId';
  const filter = { [matchField]: userId };
  const [records, total] = await Promise.all([
    Follow.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Follow.countDocuments(filter),
  ]);

  const userIds = records.map((r) => r[field].toString());
  const followedAtMap = new Map(records.map((r) => [r[field].toString(), r.createdAt]));
  const results = await serializeFollowUsers(userIds, viewerId, followedAtMap);

  return { results, total };
}

router.get('/me/followers', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const { results, total } = await listFollowUsers('followerId', req.userId!, skip, limit, req.userId);
    return res.json({ status: true, data: { results, total, count: total } });
  } catch (error) {
    console.error('me followers error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch followers' });
  }
});

router.get('/me/following', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const { results, total } = await listFollowUsers('followingId', req.userId!, skip, limit, req.userId);
    return res.json({ status: true, data: { results, total, count: total } });
  } catch (error) {
    console.error('me following error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch following' });
  }
});

router.get('/suggested-follows', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const settingsDoc = await getAppSettings();
    const profileSocial = normalizeProfileSocialSettings(settingsDoc.profileSocial);
    const contextUserId = typeof req.query.contextUserId === 'string' ? req.query.contextUserId : undefined;

    if (!profileSocial.showSuggestedFollows) {
      return res.json({ status: true, data: { results: [] } });
    }

    const results = await getSuggestedFollows(req.userId!, profileSocial, contextUserId);
    return res.json({ status: true, data: { results } });
  } catch (error) {
    console.error('suggested follows error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch suggested follows' });
  }
});

router.get('/match-history', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const history = await buildMyMatchHistory(req.userId!);
    return res.json({ status: true, data: history });
  } catch (error) {
    console.error('v2 users match-history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch match history' });
  }
});

router.get('/:userId/match-history', requireAuth, async (req, res) => {
  try {
    const userId = String(req.params.userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: 'Invalid user id' });
    }

    const history = await buildUserMatchHistory(userId);
    return res.json({ status: true, data: history });
  } catch (error) {
    console.error('v2 users user match-history error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch user match history' });
  }
});

router.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id);
    if (!user || !user.status) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const data = await serializePublicUser(user, req.userId);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('get user by id error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch user' });
  }
});

router.post('/:id/follow', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const targetId = String(req.params.id);
    if (targetId === req.userId) {
      return res.status(400).json({ status: false, message: 'Cannot follow yourself' });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const existing = await Follow.findOne({ followerId: req.userId, followingId: targetId });
    if (existing) {
      const counts = await getFollowCounts(targetId);
      return res.json({ status: true, data: { isFollowing: true, followers: counts.followers } });
    }

    await Follow.create({ followerId: req.userId, followingId: targetId });
    const counts = await getFollowCounts(targetId);

    const actor = await User.findById(req.userId).select('username');
    await createActivityNotification({
      recipientId: targetId,
      actorId: req.userId!,
      type: 'follow',
      message: `${actor?.username || 'Someone'} started following you`,
    });

    return res.json({ status: true, data: { isFollowing: true, followers: counts.followers } });
  } catch (error) {
    console.error('follow error:', error);
    return res.status(500).json({ status: false, message: 'Failed to follow user' });
  }
});

router.delete('/:id/follow', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const targetId = String(req.params.id);
    await Follow.deleteOne({ followerId: req.userId, followingId: targetId });
    const counts = await getFollowCounts(targetId);
    return res.json({ status: true, data: { isFollowing: false, followers: counts.followers } });
  } catch (error) {
    console.error('unfollow error:', error);
    return res.status(500).json({ status: false, message: 'Failed to unfollow user' });
  }
});

router.get('/:id/followers', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const { results, total } = await listFollowUsers('followerId', String(req.params.id), skip, limit, req.userId);
    return res.json({ status: true, data: { results, total, count: total } });
  } catch (error) {
    console.error('followers error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch followers' });
  }
});

router.get('/:id/following', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const { results, total } = await listFollowUsers('followingId', String(req.params.id), skip, limit, req.userId);
    return res.json({ status: true, data: { results, total, count: total } });
  } catch (error) {
    console.error('following error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch following' });
  }
});

router.get('/:id/mutual-followers', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const profileUserId = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
      return res.status(400).json({ status: false, message: 'Invalid user id' });
    }

    const settingsDoc = await getAppSettings();
    const profileSocial = normalizeProfileSocialSettings(settingsDoc.profileSocial);
    if (!profileSocial.showMutualFollowers) {
      return res.json({ status: true, data: { results: [], total: 0 } });
    }

    const results = await getMutualFollowers(
      req.userId!,
      profileUserId,
      profileSocial.mutualFollowersLimit
    );

    const total = await Follow.countDocuments({
      followerId: {
        $in: (
          await Follow.find({ followerId: req.userId }).select('followingId')
        ).map((f) => f.followingId),
      },
      followingId: profileUserId,
    });

    return res.json({ status: true, data: { results, total } });
  } catch (error) {
    console.error('mutual followers error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch mutual followers' });
  }
});

router.get('/:id/recent-follows', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const profileUserId = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(profileUserId)) {
      return res.status(400).json({ status: false, message: 'Invalid user id' });
    }

    const settingsDoc = await getAppSettings();
    const profileSocial = normalizeProfileSocialSettings(settingsDoc.profileSocial);
    if (!profileSocial.showRecentFollows) {
      return res.json({ status: true, data: { results: [] } });
    }

    const results = await getRecentFollows(profileUserId, profileSocial.recentFollowsLimit, req.userId);
    return res.json({ status: true, data: { results } });
  } catch (error) {
    console.error('recent follows error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch recent follows' });
  }
});

router.post('/:id/block', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const targetId = String(req.params.id);
    if (targetId === req.userId) {
      return res.status(400).json({ status: false, message: 'Cannot block yourself' });
    }
    await UserBlock.findOneAndUpdate(
      { blockerId: req.userId, blockedId: targetId },
      {},
      { upsert: true }
    );
    await Follow.deleteMany({
      $or: [
        { followerId: req.userId, followingId: targetId },
        { followerId: targetId, followingId: req.userId },
      ],
    });
    return res.json({ status: true, message: 'User blocked' });
  } catch (error) {
    console.error('block error:', error);
    return res.status(500).json({ status: false, message: 'Failed to block user' });
  }
});

router.delete('/:id/block', requireAuth, async (req: AuthedRequest, res) => {
  try {
    await UserBlock.deleteOne({ blockerId: req.userId, blockedId: String(req.params.id) });
    return res.json({ status: true, message: 'User unblocked' });
  } catch (error) {
    console.error('unblock error:', error);
    return res.status(500).json({ status: false, message: 'Failed to unblock user' });
  }
});

router.post('/resend-verification-code', async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      return res.status(400).json({ status: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ status: false, message: 'Account not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ status: false, message: 'Email is already verified' });
    }

    await saveVerificationCode(normalizedEmail, 'signup');

    return res.json({ status: true, message: 'Verification code resent' });
  } catch (error) {
    console.error('resend-verification-code error:', error);
    return res.status(500).json({ status: false, message: 'Failed to resend code' });
  }
});

router.post('/verify-email-signup', async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({ status: false, message: 'Email and code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ status: false, message: 'Account not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ status: false, message: 'Email is already verified' });
    }

    const valid = await verifyCode(normalizedEmail, code.trim(), 'signup');
    if (!valid) {
      return res.status(400).json({ status: false, message: 'Invalid or expired verification code' });
    }

    user.emailVerified = true;
    user.status = true;
    await user.save();

    const accessToken = await createLoginSession(user, req, res);

    return res.json({
      status: true,
      emailVerified: true,
      session: { accessToken },
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('verify-email-signup error:', error);
    return res.status(500).json({ status: false, message: 'Verification failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      return res.status(400).json({ status: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ status: true, message: 'If the email exists, a reset code has been sent' });
    }

    await saveVerificationCode(normalizedEmail, 'reset');

    return res.json({ status: true, message: 'Reset code sent' });
  } catch (error) {
    console.error('forgot-password error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send reset code' });
  }
});

router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({ status: false, message: 'Email and code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const valid = await verifyCode(normalizedEmail, code.trim(), 'reset');

    if (!valid) {
      return res.status(400).json({ status: false, codeValid: false, message: 'Invalid or expired code' });
    }

    // Re-create code so reset-password can validate within TTL window
    await VerificationCode.create({
      email: normalizedEmail,
      code: code.trim(),
      type: 'reset',
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    return res.json({ status: true, codeValid: true, message: 'Code verified' });
  } catch (error) {
    console.error('verify-reset-code error:', error);
    return res.status(500).json({ status: false, message: 'Verification failed' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    if (!email?.trim() || !code?.trim() || !newPassword?.trim()) {
      return res.status(400).json({ status: false, message: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ status: false, message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await VerificationCode.findOne({
      email: normalizedEmail,
      type: 'reset',
      code: code.trim(),
    });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ status: false, message: 'Invalid or expired code' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ status: false, message: 'Account not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await VerificationCode.deleteMany({ email: normalizedEmail, type: 'reset' });

    return res.json({ status: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('reset-password error:', error);
    return res.status(500).json({ status: false, message: 'Failed to reset password' });
  }
});

export default router;
