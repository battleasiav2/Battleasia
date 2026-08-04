import { Router } from 'express';
import { SupportConversation, SUPPORT_TICKET_CATEGORIES } from '../../models/SupportConversation.js';
import type { SupportTicketCategory } from '../../models/SupportConversation.js';
import { SupportMessage } from '../../models/SupportMessage.js';
import { User } from '../../models/User.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/admin.js';
import { paginatedWithTotal, parsePagination } from '../../utils/pagination.js';
import { safeQueryStatus, CONVERSATION_STATUSES } from '../../utils/query-filter.js';
import { isAdminRole } from '../../utils/admin-role.js';
import {
  serializeConversation,
  serializeSupportMessage,
} from '../../utils/feed-serialize.js';
import { getSocketServer } from '../../utils/socket.js';
import { notifySupportReply } from '../../utils/payment-notifications.js';
import { getAppSettings, normalizeLiveChatSettings } from '../../models/AppSettings.js';

const router = Router();

function emitToConversation(conversationId: string, event: string, data: unknown) {
  getSocketServer()?.to(`conversation:${conversationId}`).emit(event, data);
}

function normalizeCategory(raw: unknown): SupportTicketCategory {
  const value = String(raw || 'other').toLowerCase();
  return (SUPPORT_TICKET_CATEGORIES as readonly string[]).includes(value)
    ? (value as SupportTicketCategory)
    : 'other';
}

function normalizeSubject(raw: unknown): string {
  const subject = String(raw || '').trim().slice(0, 120);
  return subject || 'Support Ticket';
}

async function canAccessConversation(userId: string, conversationId: string): Promise<boolean> {
  const [user, conversation] = await Promise.all([
    User.findById(userId),
    SupportConversation.findById(conversationId),
  ]);
  if (!conversation) return false;
  if (isAdminRole(user)) return true;
  return conversation.userId.toString() === userId;
}

async function enrichConversationsWithPreview(conversations: InstanceType<typeof SupportConversation>[]) {
  const ids = conversations.map((c) => c._id);
  if (!ids.length) return new Map<string, { previewBody: string; previewAttachments: string[]; attachmentCount: number }>();

  const messages = await SupportMessage.find({ conversationId: { $in: ids } })
    .sort({ createdAt: -1 })
    .select('conversationId body attachments createdAt');

  const previewMap = new Map<
    string,
    { previewBody: string; previewAttachments: string[]; attachmentCount: number }
  >();

  for (const msg of messages) {
    const key = msg.conversationId.toString();
    const existing = previewMap.get(key);
    if (!existing) {
      previewMap.set(key, {
        previewBody: msg.body || '',
        previewAttachments: Array.isArray(msg.attachments) ? msg.attachments.slice(0, 3) : [],
        attachmentCount: Array.isArray(msg.attachments) ? msg.attachments.length : 0,
      });
    } else if (Array.isArray(msg.attachments) && msg.attachments.length) {
      existing.attachmentCount += msg.attachments.length;
      if (existing.previewAttachments.length < 3) {
        existing.previewAttachments = [
          ...existing.previewAttachments,
          ...msg.attachments.slice(0, 3 - existing.previewAttachments.length),
        ];
      }
    }
  }

  return previewMap;
}

router.get('/conversation', requireAuth, async (req: AuthedRequest, res) => {
  try {
    let conversation = await SupportConversation.findOne({
      userId: req.userId,
      status: { $in: ['open', 'pending'] },
    }).sort({ updatedAt: -1 });

    if (!conversation) {
      conversation = await SupportConversation.create({
        userId: req.userId,
        status: 'open',
        subject: 'Live Support',
        category: 'other',
      });
    }

    const user = await User.findById(req.userId);
    return res.json({
      status: true,
      data: serializeConversation(conversation, user),
    });
  } catch (error) {
    console.error('get/create conversation error:', error);
    return res.status(500).json({ status: false, message: 'Failed to get conversation' });
  }
});

/** Explicit ticket create — multiple open tickets allowed */
router.post('/conversation', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const subject = normalizeSubject(req.body?.subject);
    const category = normalizeCategory(req.body?.category);
    const body = String(req.body?.body || '').trim();
    const attachments = Array.isArray(req.body?.attachments) ? req.body.attachments : [];

    if (!body && attachments.length === 0) {
      return res.status(400).json({ status: false, message: 'Description or attachment is required' });
    }

    const sender = await User.findById(req.userId);
    if (!sender) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const conversation = await SupportConversation.create({
      userId: req.userId,
      subject,
      category,
      status: 'open',
      lastMessageAt: new Date(),
    });

    const message = await SupportMessage.create({
      conversationId: conversation._id,
      body: body || subject,
      senderId: sender._id,
      senderName: sender.username,
      senderAvatar: sender.avatar || '',
      isAdmin: false,
      attachments,
    });

    const serializedMessage = serializeSupportMessage(message);
    emitToConversation(conversation._id.toString(), 'new-message', serializedMessage);

    return res.status(201).json({
      status: true,
      data: {
        ...serializeConversation(conversation, sender),
        previewBody: serializedMessage.body,
        previewAttachments: attachments.slice(0, 3),
        attachmentCount: attachments.length,
        firstMessage: serializedMessage,
      },
    });
  } catch (error) {
    console.error('create ticket error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create ticket' });
  }
});

/** Current user's tickets */
router.get('/conversations/mine', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = { userId: req.userId };
    const status = safeQueryStatus(req.query.status, CONVERSATION_STATUSES);
    if (status) filter.status = status;

    const [conversations, total, user] = await Promise.all([
      SupportConversation.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit),
      SupportConversation.countDocuments(filter),
      User.findById(req.userId),
    ]);

    const previewMap = await enrichConversationsWithPreview(conversations);
    const results = conversations.map((conv) => {
      const preview = previewMap.get(conv._id.toString());
      return {
        ...serializeConversation(conv, user),
        previewBody: preview?.previewBody || '',
        previewAttachments: preview?.previewAttachments || [],
        attachmentCount: preview?.attachmentCount || 0,
      };
    });

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('my tickets error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch tickets' });
  }
});

router.get('/conversations', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const filter: Record<string, unknown> = {};
    const status = safeQueryStatus(req.query.status, CONVERSATION_STATUSES);
    if (status) filter.status = status;

    const [conversations, total] = await Promise.all([
      SupportConversation.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit),
      SupportConversation.countDocuments(filter),
    ]);

    const userIds = conversations.map((c) => c.userId);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const previewMap = await enrichConversationsWithPreview(conversations);

    const results = conversations.map((conv) => {
      const preview = previewMap.get(conv._id.toString());
      return {
        ...serializeConversation(conv, userMap.get(conv.userId.toString())),
        previewBody: preview?.previewBody || '',
        previewAttachments: preview?.previewAttachments || [],
        attachmentCount: preview?.attachmentCount || 0,
      };
    });

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('conversations error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch conversations' });
  }
});

router.get('/conversation/:conversationId/messages', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversationId = String(req.params.conversationId);
    const allowed = await canAccessConversation(req.userId!, conversationId);
    if (!allowed) {
      return res.status(403).json({ status: false, message: 'Access denied' });
    }

    const { skip, limit } = parsePagination(req);
    const filter = { conversationId };

    const [messages, total] = await Promise.all([
      SupportMessage.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit),
      SupportMessage.countDocuments(filter),
    ]);

    return res.json(paginatedWithTotal(messages.map(serializeSupportMessage), total));
  } catch (error) {
    console.error('messages error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch messages' });
  }
});

router.post('/message', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { body, conversationId, attachments = [] } = req.body;
    if (!body || !conversationId) {
      return res.status(400).json({ status: false, message: 'Body and conversationId are required' });
    }

    const allowed = await canAccessConversation(req.userId!, conversationId);
    if (!allowed) {
      return res.status(403).json({ status: false, message: 'Access denied' });
    }

    const conversation = await SupportConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }
    if (conversation.status === 'closed') {
      return res.status(400).json({ status: false, message: 'Conversation is closed' });
    }

    const sender = req.userId ? await User.findById(req.userId) : null;
    if (!sender) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const isAdmin = isAdminRole(sender);

    const message = await SupportMessage.create({
      conversationId,
      body,
      senderId: sender._id,
      senderName: sender.username,
      senderAvatar: sender.avatar || '',
      isAdmin,
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    conversation.lastMessageAt = new Date();
    if (conversation.status === 'pending') conversation.status = 'open';
    await conversation.save();

    const serialized = serializeSupportMessage(message);
    emitToConversation(conversationId, 'new-message', serialized);

    if (isAdmin) {
      await notifySupportReply({
        userId: conversation.userId.toString(),
        conversationId: conversation._id.toString(),
        preview: String(body),
      });
    }

    return res.status(201).json({ status: true, data: serialized });
  } catch (error) {
    console.error('send message error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send message' });
  }
});

router.patch('/conversation/:conversationId/close', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversationId = String(req.params.conversationId);
    const allowed = await canAccessConversation(req.userId!, conversationId);
    if (!allowed) {
      return res.status(403).json({ status: false, message: 'Access denied' });
    }

    const conversation = await SupportConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }

    const deleteMessages = Boolean(req.body.deleteMessages);
    if (deleteMessages) {
      await SupportMessage.deleteMany({ conversationId: conversation._id });
    }

    conversation.status = 'closed';
    await conversation.save();

    return res.json({
      status: true,
      data: serializeConversation(conversation),
    });
  } catch (error) {
    console.error('close conversation error:', error);
    return res.status(500).json({ status: false, message: 'Failed to close conversation' });
  }
});

/** Public widget config — logos, agent, social links controlled from admin */
router.get('/live-chat-settings', async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      data: normalizeLiveChatSettings(settings.liveChat),
    });
  } catch (error) {
    console.error('live-chat settings get error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch live chat settings' });
  }
});

router.put('/live-chat-settings', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const settings = await getAppSettings();
    settings.liveChat = normalizeLiveChatSettings(req.body || {});
    await settings.save();
    return res.json({
      status: true,
      data: normalizeLiveChatSettings(settings.liveChat),
    });
  } catch (error) {
    console.error('live-chat settings update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update live chat settings' });
  }
});

export default router;
