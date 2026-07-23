import { Router } from 'express';
import { Notification } from '../../models/Notification.js';
import { NotificationRead } from '../../models/NotificationRead.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { serializeNotification } from '../../utils/feed-serialize.js';
import { paginatedWithTotal, parsePagination } from '../../utils/pagination.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const userId = req.userId!;

    const filter = {
      $or: [
        { target: 'all' },
        { recipients: userId },
        { recipientId: userId },
      ],
    };

    const [notifications, total, readRecords] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      NotificationRead.find({ userId }).select('notificationId'),
    ]);

    const readSet = new Set(readRecords.map((r) => r.notificationId.toString()));

    const results = notifications.map((n) => ({
      ...serializeNotification(n),
      isUnRead: !readSet.has(n._id.toString()),
      avatarUrl: n.avatarUrl || null,
    }));

    return res.json({
      status: true,
      data: { results, total, count: total },
    });
  } catch (error) {
    console.error('v2 notifications error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch notifications' });
  }
});

router.patch('/:id/read', requireAuth, async (req: AuthedRequest, res) => {
  try {
    await NotificationRead.findOneAndUpdate(
      { userId: req.userId, notificationId: req.params.id },
      { readAt: new Date() },
      { upsert: true }
    );
    return res.json({ status: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('v2 mark read error:', error);
    return res.status(500).json({ status: false, message: 'Failed to mark notification as read' });
  }
});

router.patch('/read-all', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const filter = {
      $or: [
        { target: 'all' },
        { recipients: userId },
        { recipientId: userId },
      ],
    };
    const notifications = await Notification.find(filter).select('_id');

    await Promise.all(
      notifications.map((n) =>
        NotificationRead.findOneAndUpdate(
          { userId, notificationId: n._id },
          { readAt: new Date() },
          { upsert: true }
        )
      )
    );

    return res.json({ status: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('v2 mark all read error:', error);
    return res.status(500).json({ status: false, message: 'Failed to mark all as read' });
  }
});

export default router;
