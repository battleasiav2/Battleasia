import { Router } from 'express';
import { Story } from '../../models/Story.js';
import { Reel } from '../../models/Reel.js';
import { User } from '../../models/User.js';
import { DirectConversation } from '../../models/DirectConversation.js';
import { DirectMessage } from '../../models/DirectMessage.js';
import { Feed } from '../../models/Feed.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { parsePagination, paginatedWithTotal } from '../../utils/pagination.js';
import { emitDirectMessage } from '../../utils/socket.js';
import { createActivityNotification } from '../../utils/social-notifications.js';

const router = Router();
const STORY_TTL_MS = 24 * 60 * 60 * 1000;

// Stories
router.get('/stories', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const now = new Date();
    const stories = await Story.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 }).limit(200);
    const grouped = new Map<string, typeof stories>();

    for (const story of stories) {
      const key = story.userId.toString();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(story);
    }

    const results = Array.from(grouped.entries()).map(([userId, items]) => ({
      userId,
      username: items[0]?.username || '',
      avatar: items[0]?.avatar || '',
      stories: items.map((s) => ({
        id: s._id.toString(),
        mediaType: s.mediaType,
        mediaUrl: s.mediaUrl,
        caption: s.caption,
        totalViews: s.totalViews,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        viewed: s.viewers.some((v) => v.toString() === req.userId),
      })),
    }));

    return res.json({ status: true, data: results });
  } catch (error) {
    console.error('stories list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch stories' });
  }
});

router.post('/stories', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    const { mediaUrl, mediaType, caption } = req.body as {
      mediaUrl?: string;
      mediaType?: string;
      caption?: string;
    };

    if (!mediaUrl?.trim()) {
      return res.status(400).json({ status: false, message: 'mediaUrl is required' });
    }

    const story = await Story.create({
      userId: user._id,
      username: user.username,
      avatar: user.avatar || '',
      mediaType: mediaType === 'video' ? 'video' : 'image',
      mediaUrl: mediaUrl.trim(),
      caption: caption || '',
      expiresAt: new Date(Date.now() + STORY_TTL_MS),
    });

    return res.status(201).json({
      status: true,
      data: {
        id: story._id.toString(),
        mediaType: story.mediaType,
        mediaUrl: story.mediaUrl,
        caption: story.caption,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
      },
    });
  } catch (error) {
    console.error('create story error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create story' });
  }
});

router.post('/stories/:id/view', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ status: false, message: 'Story not found' });

    const viewerId = req.userId!;
    if (!story.viewers.some((v) => v.toString() === viewerId)) {
      story.viewers.push(viewerId as unknown as typeof story.viewers[number]);
      story.totalViews += 1;
      await story.save();
    }

    return res.json({ status: true, data: { totalViews: story.totalViews } });
  } catch (error) {
    console.error('view story error:', error);
    return res.status(500).json({ status: false, message: 'Failed to record story view' });
  }
});

// Reels
router.get('/reels', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const [reels, total] = await Promise.all([
      Reel.find({ status: 'published' }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Reel.countDocuments({ status: 'published' }),
    ]);

    const results = reels.map((r) => ({
      id: r._id.toString(),
      userId: r.userId.toString(),
      username: r.username,
      avatar: r.avatar,
      videoUrl: r.videoUrl,
      caption: r.caption,
      musicTitle: r.musicTitle,
      totalViews: r.totalViews,
      totalLikes: r.totalLikes,
      totalComments: r.totalComments,
      createdAt: r.createdAt,
    }));

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('reels list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch reels' });
  }
});

router.post('/reels', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    const { videoUrl, caption, musicTitle } = req.body as {
      videoUrl?: string;
      caption?: string;
      musicTitle?: string;
    };

    if (!videoUrl?.trim()) {
      return res.status(400).json({ status: false, message: 'videoUrl is required' });
    }

    const reel = await Reel.create({
      userId: user._id,
      username: user.username,
      avatar: user.avatar || '',
      videoUrl: videoUrl.trim(),
      caption: caption || '',
      musicTitle: musicTitle || '',
    });

    return res.status(201).json({ status: true, data: { id: reel._id.toString() } });
  } catch (error) {
    console.error('create reel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create reel' });
  }
});

router.post('/reels/:id/view', requireAuth, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalViews: 1 } },
      { new: true }
    );
    if (!reel) return res.status(404).json({ status: false, message: 'Reel not found' });
    return res.json({ status: true, data: { totalViews: reel.totalViews } });
  } catch (error) {
    console.error('reel view error:', error);
    return res.status(500).json({ status: false, message: 'Failed to record view' });
  }
});

// Direct messages
router.get('/messages/conversations', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const userId = req.userId!;
    const [conversations, total] = await Promise.all([
      DirectConversation.find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      DirectConversation.countDocuments({ participants: userId }),
    ]);

    const otherIds = [
      ...new Set(
        conversations
          .map((conversation) =>
            conversation.participants.find((participant) => participant.toString() !== userId)?.toString()
          )
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const users = otherIds.length
      ? await User.find({ _id: { $in: otherIds } }).select('username avatar')
      : [];
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const results = conversations.map((conversation) => {
      const otherId = conversation.participants
        .find((participant) => participant.toString() !== userId)
        ?.toString();
      const other = otherId ? userMap.get(otherId) : null;
      return {
        id: conversation._id.toString(),
        participant: {
          id: other?._id.toString() || otherId || '',
          username: other?.username || '',
          avatar: other?.avatar || '',
        },
        lastMessagePreview: conversation.lastMessagePreview,
        lastMessageAt: conversation.lastMessageAt,
      };
    });

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('conversations error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch conversations' });
  }
});

router.post('/messages/conversations', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const participantId = String(req.body?.participantId || '').trim();
    if (!participantId) {
      return res.status(400).json({ status: false, message: 'participantId is required' });
    }

    const userId = req.userId!;
    let conversation = await DirectConversation.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (!conversation) {
      conversation = await DirectConversation.create({
        participants: [userId, participantId],
      });
    }

    return res.json({ status: true, data: { id: conversation._id.toString() } });
  } catch (error) {
    console.error('create conversation error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create conversation' });
  }
});

router.get('/messages/:conversationId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversation = await DirectConversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }

    const { skip, limit } = parsePagination(req);
    const [messages, total] = await Promise.all([
      DirectMessage.find({ conversationId: conversation._id, deletedForEveryone: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DirectMessage.countDocuments({ conversationId: conversation._id, deletedForEveryone: false }),
    ]);

    const results = messages.reverse().map((m) => ({
      id: m._id.toString(),
      body: m.body,
      senderId: m.senderId.toString(),
      senderName: m.senderName,
      senderAvatar: m.senderAvatar,
      attachments: m.attachments,
      readBy: m.readBy.map((id) => id.toString()),
      createdAt: m.createdAt,
      isMine: m.senderId.toString() === req.userId,
    }));

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('messages error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch messages' });
  }
});

router.post('/messages/:conversationId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversation = await DirectConversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    const body = String(req.body?.body || '').trim();
    const attachments = (req.body?.attachments as string[]) || [];
    if (!body && attachments.length === 0) {
      return res.status(400).json({ status: false, message: 'Message body is required' });
    }

    const message = await DirectMessage.create({
      conversationId: conversation._id,
      senderId: user._id,
      senderName: user.username,
      senderAvatar: user.avatar || '',
      body,
      attachments,
      readBy: [user._id],
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = body.slice(0, 120);
    await conversation.save();

    const payload = {
      id: message._id.toString(),
      conversationId: conversation._id.toString(),
      body: message.body,
      senderId: user._id.toString(),
      senderName: user.username,
      senderAvatar: user.avatar || '',
      attachments,
      createdAt: message.createdAt,
    };

    emitDirectMessage(conversation._id.toString(), payload);

    const recipientId = conversation.participants
      .find((p) => p.toString() !== req.userId)
      ?.toString();
    if (recipientId) {
      await createActivityNotification({
        recipientId,
        actorId: req.userId!,
        type: 'message',
        entityType: 'conversation',
        entityId: conversation._id.toString(),
        message: `${user.username} sent you a message`,
      });
    }

    return res.status(201).json({ status: true, data: payload });
  } catch (error) {
    console.error('send message error:', error);
    return res.status(500).json({ status: false, message: 'Failed to send message' });
  }
});

// Global search
router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ status: true, data: { users: [], posts: [], hashtags: [] } });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [users, posts, hashtagPosts] = await Promise.all([
      User.find({ username: regex, status: true }).limit(10).select('username avatar'),
      Feed.find({ status: 'published', $or: [{ title: regex }, { description: regex }] })
        .limit(10)
        .select('title coverUrl authorName totalLikes'),
      Feed.find({ status: 'published', hashtags: q.replace('#', '').toLowerCase() })
        .limit(5)
        .select('hashtags'),
    ]);

    return res.json({
      status: true,
      data: {
        users: users.map((u) => ({
          id: u._id.toString(),
          username: u.username,
          avatar: u.avatar || '',
        })),
        posts: posts.map((p) => ({
          id: p._id.toString(),
          title: p.title,
          coverUrl: p.coverUrl,
          authorName: p.authorName,
          totalLikes: p.totalLikes,
        })),
        hashtags: [...new Set(hashtagPosts.flatMap((p) => p.hashtags))].slice(0, 10),
      },
    });
  } catch (error) {
    console.error('search error:', error);
    return res.status(500).json({ status: false, message: 'Search failed' });
  }
});

export default router;
