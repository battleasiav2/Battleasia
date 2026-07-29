import { Router } from 'express';
import { Notification } from '../../models/Notification.js';
import { User } from '../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import {
  buildSearchFilter,
  paginatedWithTotal,
  parsePagination,
} from '../../utils/pagination.js';
import { serializeNotification } from '../../utils/feed-serialize.js';
import { emitUserNotification } from '../../utils/socket.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { skip, limit, search } = parsePagination(req);
    const filter = buildSearchFilter(search, ['title', 'message', 'category', 'type']);

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    return res.json(paginatedWithTotal(notifications.map(serializeNotification), total));
  } catch (error) {
    console.error('notifications list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch notifications' });
  }
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const {
      title,
      message,
      category = 'General',
      type = 'general',
      avatarUrl = '',
      premiumOnly = false,
      target = 'all',
      userIds = [],
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ status: false, message: 'Title and message are required' });
    }

    let recipients: string[] = [];
    if (target === 'selected' && Array.isArray(userIds) && userIds.length > 0) {
      recipients = userIds;
    } else if (target === 'all') {
      const users = await User.find({ 'role.type': { $ne: 'admin' } }).select('_id');
      recipients = users.map((u) => u._id.toString());
    }

    const notification = await Notification.create({
      title,
      message,
      subject: title,
      category,
      type,
      avatarUrl,
      premiumOnly: Boolean(premiumOnly),
      target,
      recipients,
      createdBy: req.userId,
    });

    const payload = serializeNotification(notification);
    for (const recipientId of recipients) {
      emitUserNotification(recipientId, payload);
    }

    return res.status(201).json({ status: true, data: payload });
  } catch (error) {
    console.error('create notification error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send notification' });
  }
});

export default router;
