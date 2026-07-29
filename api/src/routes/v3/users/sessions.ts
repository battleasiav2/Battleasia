import { Router } from 'express';
import { Session } from '../../../models/Session.js';
import { requireAuth } from '../../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  try {
    const now = new Date();
    const sessions = await Session.find({ expiration: { $gt: now } }).sort({ createdAt: -1 });

    const results = sessions.map((s) => ({
      _id: s._id.toString(),
      id: s._id.toString(),
      userId: s.userId.toString(),
      username: s.username,
      email: s.email,
      role: s.role,
      status: s.status,
      avatar: s.avatar,
      ip: s.ip,
      country: s.country,
      useragent: s.useragent,
      expiration: s.expiration,
    }));

    return res.json({ status: true, data: { results, count: results.length } });
  } catch (error) {
    console.error('sessions error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch sessions' });
  }
});

router.delete('/all', requireAuth, async (_req, res) => {
  try {
    const result = await Session.deleteMany({});
    return res.json({ status: true, message: `Logged out ${result.deletedCount} sessions` });
  } catch (error) {
    console.error('logout all error:', error);
    return res.status(500).json({ status: false, message: 'Failed to logout sessions' });
  }
});

router.delete('/user/:userId', requireAuth, async (req, res) => {
  try {
    const result = await Session.deleteMany({ userId: req.params.userId });
    return res.json({ status: true, message: `Logged out ${result.deletedCount} sessions` });
  } catch (error) {
    console.error('logout user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to logout user sessions' });
  }
});

export default router;
