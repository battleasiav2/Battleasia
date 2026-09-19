import { Router } from 'express';
import { Session } from '../../../models/Session.js';
import { User } from '../../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { writeAudit } from '../../../models/AuditLog.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const now = new Date();
    const filter: Record<string, unknown> = { expiration: { $gt: now } };
    if (String(req.query.mine || '') === '1' && req.userId) {
      filter.userId = req.userId;
    }
    const sessions = await Session.find(filter).sort({ createdAt: -1 });

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
    const ids = await Session.distinct('userId');
    if (ids.length) {
      await User.updateMany({ _id: { $in: ids } }, { $inc: { tokenVersion: 1 } });
    }
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
    await User.updateOne({ _id: req.params.userId }, { $inc: { tokenVersion: 1 } });
    return res.json({ status: true, message: `Logged out ${result.deletedCount} sessions` });
  } catch (error) {
    console.error('logout user error:', error);
    return res.status(500).json({ status: false, message: 'Failed to logout user sessions' });
  }
});

router.delete('/:sessionId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const row = await Session.findById(req.params.sessionId);
    if (!row) return res.status(404).json({ status: false, message: 'Session not found' });
    await Session.deleteOne({ _id: row._id });
    await User.updateOne({ _id: row.userId }, { $inc: { tokenVersion: 1 } });
    await writeAudit({
      actorId: req.userId,
      action: 'session.revoke',
      target: String(row.userId),
      detail: String(row._id),
    });
    return res.json({ status: true, message: 'Session revoked' });
  } catch (error) {
    console.error('revoke session error:', error);
    return res.status(500).json({ status: false, message: 'Failed to revoke session' });
  }
});

export default router;
