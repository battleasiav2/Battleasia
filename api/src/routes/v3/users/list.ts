import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../../models/User.js';
import { Role } from '../../../models/Role.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import {
  buildSearchFilter,
  paginatedResults,
  parsePagination,
} from '../../../utils/pagination.js';
import { generateReferralCode, serializeUser } from '../../../utils/serialize.js';
import { recordBalanceHistory } from '../../../utils/balance-history.js';
import { notifyBalanceChange } from '../../../utils/balance-notify.js';
import { processReferralCommission } from '../../../utils/referral.js';

const router = Router();

async function applyRoleToUser(user: InstanceType<typeof User>, roleId?: string | null) {
  if (!roleId) return;
  const role = await Role.findById(roleId);
  if (!role) return;
  user.roleRef = role._id;
  user.role = {
    type: role.type,
    name: role.name,
    permissions: role.permissions || [],
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search, startDate, endDate } = parsePagination(req);
    const filter: Record<string, unknown> = {
      ...buildSearchFilter(search, ['username', 'email', 'pubgId', 'referralCode']),
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = endDate;
    }

    const [users, count] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const results = users.map((user) => serializeUser(user));
    return res.json(paginatedResults(results, count));
  } catch (error) {
    console.error('users list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch users' });
  }
});

router.delete('/bulk/all', requireAuth, async (_req, res) => {
  try {
    const result = await User.deleteMany({ 'role.type': { $ne: 'admin' } });
    return res.json({ status: true, message: `Deleted ${result.deletedCount} users` });
  } catch (error) {
    console.error('bulk delete error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete users' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const roleDoc = user.roleRef ? await Role.findById(user.roleRef) : null;
    return res.json({ status: true, data: serializeUser(user, roleDoc) });
  } catch (error) {
    console.error('get user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch user' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      status = true,
      avatar = '',
      countryCode = '',
      mobileNo = '',
      pubgId = '',
      gameServer = '',
      referralCode,
      role,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ status: false, message: 'Username, email and password are required' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existing) {
      return res.status(409).json({ status: false, message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: passwordHash,
      status,
      avatar,
      countryCode,
      mobileNo,
      pubgId,
      gameServer,
      referralCode: referralCode || generateReferralCode(username),
      balance: 0,
      role: { type: 'player', name: 'Player', permissions: [] },
    });

    await applyRoleToUser(user, role);
    await user.save();

    const roleDoc = user.roleRef ? await Role.findById(user.roleRef) : null;
    return res.status(201).json({ status: true, data: serializeUser(user, roleDoc) });
  } catch (error) {
    console.error('create user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create user' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const {
      username,
      email,
      password,
      status,
      avatar,
      countryCode,
      mobileNo,
      pubgId,
      gameServer,
      referralCode,
      role,
    } = req.body;

    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();
    if (typeof status === 'boolean') user.status = status;
    if (typeof avatar === 'string') user.avatar = avatar;
    if (typeof countryCode === 'string') user.countryCode = countryCode;
    if (typeof mobileNo === 'string') user.mobileNo = mobileNo;
    if (typeof pubgId === 'string') user.pubgId = pubgId;
    if (typeof gameServer === 'string') user.gameServer = gameServer;
    if (typeof referralCode === 'string') user.referralCode = referralCode;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role !== undefined) await applyRoleToUser(user, role);

    await user.save();
    const roleDoc = user.roleRef ? await Role.findById(user.roleRef) : null;
    return res.json({ status: true, data: serializeUser(user, roleDoc) });
  } catch (error) {
    console.error('update user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update user' });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    user.status = Boolean(req.body.status);
    await user.save();
    return res.json({ status: true, data: serializeUser(user) });
  } catch (error) {
    console.error('update status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update status' });
  }
});

router.patch('/:id/balance', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const { amount, type } = req.body as { amount?: number; type?: 'deposit' | 'withdraw' };
    if (!amount || amount <= 0 || !type) {
      return res.status(400).json({ status: false, message: 'Valid amount and type are required' });
    }

    const admin = req.userId ? await User.findById(req.userId) : null;
    const balanceBefore = user.balance ?? 0;

    if (type === 'deposit') {
      user.balance = balanceBefore + amount;
    } else {
      if (balanceBefore < amount) {
        return res.status(400).json({ status: false, message: 'Insufficient balance' });
      }
      user.balance = balanceBefore - amount;
    }

    await user.save();

    await recordBalanceHistory({
      user,
      amount,
      type,
      balanceBefore,
      balanceAfter: user.balance,
      performedBy: req.userId,
      detail: {
        reason: 'admin_adjustment',
        adminName: admin?.username || 'Admin',
      },
    });

    await notifyBalanceChange(user._id.toString(), user.balance, balanceBefore);

    if (type === 'deposit') {
      await processReferralCommission({
        depositor: user,
        depositAmount: amount,
        depositSource: 'admin',
      });
    }

    return res.json({ status: true, data: serializeUser(user) });
  } catch (error) {
    console.error('balance update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update balance' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    if (user.role?.type === 'admin') {
      return res.status(403).json({ status: false, message: 'Cannot delete admin user' });
    }
    await user.deleteOne();
    return res.json({ status: true, message: 'User deleted' });
  } catch (error) {
    console.error('delete user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete user' });
  }
});

export default router;
