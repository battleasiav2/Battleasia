import { Router } from 'express';
import { SupportConversation } from '../../models/SupportConversation.js';
import { SupportMessage } from '../../models/SupportMessage.js';
import { User } from '../../models/User.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/admin.js';
import { paginatedWithTotal, parsePagination } from '../../utils/pagination.js';
import { safeQueryStatus, CONVERSATION_STATUSES } from '../../utils/query-filter.js';
import { isAdminRole } from '../../utils/admin-role.js';
import { serializeConversation, serializeSupportMessage, } from '../../utils/feed-serialize.js';
import { getSocketServer } from '../../utils/socket.js';
const router = Router();
function emitToConversation(conversationId, event, data) {
    getSocketServer()?.to(`conversation:${conversationId}`).emit(event, data);
}
async function canAccessConversation(userId, conversationId) {
    const [user, conversation] = await Promise.all([
        User.findById(userId),
        SupportConversation.findById(conversationId),
    ]);
    if (!conversation)
        return false;
    if (isAdminRole(user))
        return true;
    return conversation.userId.toString() === userId;
}
router.get('/conversation', requireAuth, async (req, res) => {
    try {
        let conversation = await SupportConversation.findOne({
            userId: req.userId,
            status: { $in: ['open', 'pending'] },
        }).sort({ updatedAt: -1 });
        if (!conversation) {
            conversation = await SupportConversation.create({
                userId: req.userId,
                status: 'open',
            });
        }
        const user = await User.findById(req.userId);
        return res.json({
            status: true,
            data: serializeConversation(conversation, user),
        });
    }
    catch (error) {
        console.error('get/create conversation error:', error);
        return res.status(500).json({ status: false, message: 'Failed to get conversation' });
    }
});
router.get('/conversations', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { skip, limit } = parsePagination(req);
        const filter = {};
        const status = safeQueryStatus(req.query.status, CONVERSATION_STATUSES);
        if (status)
            filter.status = status;
        const [conversations, total] = await Promise.all([
            SupportConversation.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit),
            SupportConversation.countDocuments(filter),
        ]);
        const userIds = conversations.map((c) => c.userId);
        const users = await User.find({ _id: { $in: userIds } });
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));
        const results = conversations.map((conv) => serializeConversation(conv, userMap.get(conv.userId.toString())));
        return res.json(paginatedWithTotal(results, total));
    }
    catch (error) {
        console.error('conversations error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch conversations' });
    }
});
router.get('/conversation/:conversationId/messages', requireAuth, async (req, res) => {
    try {
        const conversationId = String(req.params.conversationId);
        const allowed = await canAccessConversation(req.userId, conversationId);
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
    }
    catch (error) {
        console.error('messages error:', error);
        return res.status(500).json({ status: false, message: 'Failed to fetch messages' });
    }
});
router.post('/message', requireAuth, async (req, res) => {
    try {
        const { body, conversationId, attachments = [] } = req.body;
        if (!body || !conversationId) {
            return res.status(400).json({ status: false, message: 'Body and conversationId are required' });
        }
        const allowed = await canAccessConversation(req.userId, conversationId);
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
        if (conversation.status === 'pending')
            conversation.status = 'open';
        await conversation.save();
        const serialized = serializeSupportMessage(message);
        emitToConversation(conversationId, 'new-message', serialized);
        return res.status(201).json({ status: true, data: serialized });
    }
    catch (error) {
        console.error('send message error:', error);
        return res.status(500).json({ status: false, message: 'Failed to send message' });
    }
});
router.patch('/conversation/:conversationId/close', requireAuth, async (req, res) => {
    try {
        const conversationId = String(req.params.conversationId);
        const allowed = await canAccessConversation(req.userId, conversationId);
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
    }
    catch (error) {
        console.error('close conversation error:', error);
        return res.status(500).json({ status: false, message: 'Failed to close conversation' });
    }
});
export default router;
