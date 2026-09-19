import { Router } from 'express';
import { Story } from '../../models/Story.js';
import { StoryHighlight } from '../../models/StoryHighlight.js';
import { Reel } from '../../models/Reel.js';
import { User } from '../../models/User.js';
import { DirectConversation } from '../../models/DirectConversation.js';
import { DirectMessage } from '../../models/DirectMessage.js';
import { Feed } from '../../models/Feed.js';
import { SocialReport } from '../../models/SocialReport.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/admin.js';
import { Follow } from '../../models/Follow.js';
import { getAppSettings, normalizeMessagingSettings, normalizeProfileSocialSettings } from '../../models/AppSettings.js';
import { normalizeP1Flags } from '../../utils/p1-flags.js';
import { parsePagination, paginatedWithTotal } from '../../utils/pagination.js';
import { emitDirectMessage } from '../../utils/socket.js';
import { createActivityNotification } from '../../utils/social-notifications.js';
import { sanitizeAttachmentList } from '../../utils/safe-url.js';

const router = Router();
const STORY_TTL_MS = 24 * 60 * 60 * 1000;

function mapPoll(story: InstanceType<typeof Story>, userId?: string, reveal = false) {
  if (!story.poll?.question) return null;
  const voted = Boolean(
    userId && (story.poll.options || []).some((o) => (o.votes || []).some((v) => v.toString() === userId)),
  );
  const isQuiz = story.poll.kind === 'quiz';
  return {
    question: story.poll.question,
    kind: isQuiz ? 'quiz' : 'poll',
    correct: isQuiz && (reveal || voted) && Number.isInteger(story.poll.correctIndex) && (story.poll.correctIndex ?? -1) >= 0
      ? story.poll.correctIndex
      : undefined,
    options: (story.poll.options || []).map((o) => ({
      text: o.text,
      votes: (o.votes || []).length,
      chosen: Boolean(userId && (o.votes || []).some((v) => v.toString() === userId)),
    })),
  };
}

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
        overlayText: s.overlayText || '',
        stickers: s.stickers || [],
        poll: mapPoll(s, req.userId),
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

    const flags = normalizeP1Flags((await getAppSettings()).p1);
    const { mediaUrl, mediaType, caption, overlayText, stickers, poll } = req.body as {
      mediaUrl?: string;
      mediaType?: string;
      caption?: string;
      overlayText?: string;
      stickers?: Array<{ emoji?: string; x?: number; y?: number }>;
      poll?: { question?: string; options?: string[]; kind?: string; correctIndex?: number };
    };

    if (!mediaUrl?.trim()) {
      return res.status(400).json({ status: false, message: 'mediaUrl is required' });
    }

    const safeStickers = (Array.isArray(stickers) ? stickers : [])
      .slice(0, 8)
      .map((s) => ({
        emoji: String(s.emoji || '').slice(0, 8),
        x: Math.min(100, Math.max(0, Number(s.x) || 50)),
        y: Math.min(100, Math.max(0, Number(s.y) || 50)),
      }))
      .filter((s) => s.emoji);

    const pollQuestion = flags.igHighlights ? String(poll?.question || '').trim().slice(0, 80) : '';
    const pollOptions = (Array.isArray(poll?.options) ? poll.options : [])
      .map((t) => String(t || '').trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 4);
    const isQuiz = poll?.kind === 'quiz';
    const correctIndex = Number(poll?.correctIndex);
    const safeCorrect =
      isQuiz && Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < pollOptions.length
        ? correctIndex
        : -1;

    const story = await Story.create({
      userId: user._id,
      username: user.username,
      avatar: user.avatar || '',
      mediaType: mediaType === 'video' ? 'video' : 'image',
      mediaUrl: mediaUrl.trim(),
      caption: caption || '',
      overlayText: String(overlayText || '').slice(0, 80),
      stickers: safeStickers,
      poll:
        pollQuestion && pollOptions.length >= 2
          ? {
              question: pollQuestion,
              kind: isQuiz ? 'quiz' : 'poll',
              correctIndex: safeCorrect,
              options: pollOptions.map((text) => ({ text, votes: [] })),
            }
          : undefined,
      expiresAt: new Date(Date.now() + STORY_TTL_MS),
    });

    return res.status(201).json({
      status: true,
      data: {
        id: story._id.toString(),
        mediaType: story.mediaType,
        mediaUrl: story.mediaUrl,
        caption: story.caption,
        overlayText: story.overlayText,
        stickers: story.stickers,
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

router.get('/stories/:id/viewers', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('viewers', 'username avatar');
    if (!story) return res.status(404).json({ status: false, message: 'Story not found' });
    if (story.userId.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Only the author can see viewers' });
    }
    const viewers = (story.viewers as unknown as Array<{ _id: { toString: () => string }; username?: string; avatar?: string }>).map(
      (u) => ({
        id: u._id.toString(),
        username: u.username || '',
        avatar: u.avatar || '',
      }),
    );
    return res.json({ status: true, data: viewers });
  } catch (error) {
    console.error('story viewers error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch viewers' });
  }
});

router.post('/stories/:id/react', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const emoji = String(req.body?.emoji || '').slice(0, 8);
    if (!['🔥', '👏', '❤', '♥', 'GG'].includes(emoji)) {
      return res.status(400).json({ status: false, message: 'Unsupported reaction' });
    }
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ status: false, message: 'Story not found' });
    const uid = req.userId!;
    story.reactions = (story.reactions || []).filter((r) => r.userId.toString() !== uid);
    story.reactions.push({ userId: uid as unknown as typeof story.reactions[number]['userId'], emoji });
    await story.save();
    if (story.userId.toString() !== uid) {
      await createActivityNotification({
        recipientId: story.userId.toString(),
        actorId: uid,
        type: 'story_reaction',
        entityType: 'story',
        entityId: story._id.toString(),
        message: `Reacted ${emoji} to your story`,
      });
    }
    return res.json({ status: true, data: { emoji } });
  } catch (error) {
    console.error('story react error:', error);
    return res.status(500).json({ status: false, message: 'Failed to react' });
  }
});

router.post('/stories/:id/poll', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const flags = normalizeP1Flags((await getAppSettings()).p1);
    if (!flags.igHighlights) return res.status(403).json({ status: false, message: 'Story polls are off' });
    const idx = Number(req.body?.option);
    const story = await Story.findById(req.params.id);
    if (!story?.poll?.question) return res.status(404).json({ status: false, message: 'Poll not found' });
    if (!Number.isInteger(idx) || idx < 0 || idx >= story.poll.options.length) {
      return res.status(400).json({ status: false, message: 'Invalid option' });
    }
    const uid = req.userId!;
    for (const opt of story.poll.options) {
      opt.votes = (opt.votes || []).filter((v) => v.toString() !== uid);
    }
    story.poll.options[idx].votes.push(uid as unknown as (typeof story.poll.options)[0]['votes'][number]);
    await story.save();
    return res.json({ status: true, data: mapPoll(story, uid) });
  } catch (error) {
    console.error('story poll error:', error);
    return res.status(500).json({ status: false, message: 'Failed to vote' });
  }
});

router.post('/stories/:id/highlight', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const flags = normalizeP1Flags((await getAppSettings()).p1);
    if (!flags.igHighlights) return res.status(403).json({ status: false, message: 'Highlights are off' });
    const story = await Story.findById(req.params.id);
    if (!story || story.userId.toString() !== req.userId) {
      return res.status(404).json({ status: false, message: 'Story not found' });
    }
    const row = await StoryHighlight.create({
      userId: story.userId,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      overlayText: story.overlayText || '',
      caption: story.caption || '',
      sourceStoryId: story._id,
    });
    return res.status(201).json({ status: true, data: { id: row._id.toString() } });
  } catch (error) {
    console.error('highlight pin error:', error);
    return res.status(500).json({ status: false, message: 'Failed to pin highlight' });
  }
});

router.get('/highlights/:userId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const rows = await StoryHighlight.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(24);
    return res.json({
      status: true,
      data: rows.map((r) => ({
        id: r._id.toString(),
        mediaUrl: r.mediaUrl,
        mediaType: r.mediaType,
        overlayText: r.overlayText,
        caption: r.caption,
      })),
    });
  } catch (error) {
    console.error('highlights list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load highlights' });
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
      parentReelId: r.parentReelId || '',
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

    const { videoUrl, caption, musicTitle, parentReelId } = req.body as {
      videoUrl?: string;
      caption?: string;
      musicTitle?: string;
      parentReelId?: string;
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
      parentReelId: String(parentReelId || '').trim().slice(0, 80),
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

router.get('/reels/admin', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const [reels, total] = await Promise.all([
      Reel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Reel.countDocuments(),
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
      status: r.status,
      createdAt: r.createdAt,
    }));
    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('admin reels list error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch reels' });
  }
});

router.delete('/reels/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) return res.status(404).json({ status: false, message: 'Reel not found' });
    await SocialReport.deleteMany({ targetType: 'reel', targetId: reel._id });
    return res.json({ status: true, message: 'Reel deleted' });
  } catch (error) {
    console.error('delete reel error:', error);
    return res.status(500).json({ status: false, message: 'Failed to delete reel' });
  }
});

const VALID_REPORT_REASONS = new Set(['spam', 'harassment', 'inappropriate', 'fake', 'other']);
const VALID_REPORT_TYPES = new Set(['user', 'feed', 'reel']);

router.post('/reports', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body as {
      targetType?: string;
      targetId?: string;
      reason?: string;
      details?: string;
    };

    if (!targetType || !VALID_REPORT_TYPES.has(targetType)) {
      return res.status(400).json({ status: false, message: 'Invalid target type' });
    }
    if (!targetId) {
      return res.status(400).json({ status: false, message: 'targetId is required' });
    }
    const normalizedReason = String(reason || 'other').toLowerCase();
    if (!VALID_REPORT_REASONS.has(normalizedReason)) {
      return res.status(400).json({ status: false, message: 'Invalid reason' });
    }
    if (targetType === 'user' && targetId === req.userId) {
      return res.status(400).json({ status: false, message: 'Cannot report yourself' });
    }

    const report = await SocialReport.findOneAndUpdate(
      { reporterId: req.userId, targetType, targetId },
      {
        reason: normalizedReason,
        details: String(details || '').slice(0, 500),
        status: 'pending',
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      status: true,
      data: {
        id: report._id.toString(),
        status: report.status,
      },
      message: 'Report submitted',
    });
  } catch (error) {
    console.error('create report error:', error);
    return res.status(500).json({ status: false, message: 'Failed to submit report' });
  }
});

router.get('/reports', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const filter = status ? { status } : {};

    const [reports, total] = await Promise.all([
      SocialReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SocialReport.countDocuments(filter),
    ]);

    const reporterIds = [...new Set(reports.map((r) => r.reporterId.toString()))];
    const reporters = await User.find({ _id: { $in: reporterIds } }).select('username email');
    const reporterMap = new Map(reporters.map((u) => [u._id.toString(), u]));

    const results = reports.map((report) => ({
      id: report._id.toString(),
      reporterId: report.reporterId.toString(),
      reporterUsername: reporterMap.get(report.reporterId.toString())?.username || '',
      targetType: report.targetType,
      targetId: report.targetId.toString(),
      reason: report.reason,
      details: report.details,
      status: report.status,
      adminNote: report.adminNote,
      createdAt: report.createdAt,
    }));

    return res.json(paginatedWithTotal(results, total));
  } catch (error) {
    console.error('list reports error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch reports' });
  }
});

router.patch('/reports/:id', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { status, adminNote } = req.body as { status?: string; adminNote?: string };
    const report = await SocialReport.findById(req.params.id);
    if (!report) return res.status(404).json({ status: false, message: 'Report not found' });

    if (status && ['pending', 'reviewed', 'dismissed'].includes(status)) {
      report.status = status as typeof report.status;
      report.reviewedBy = req.userId as any;
      report.reviewedAt = new Date();
    }
    if (typeof adminNote === 'string') {
      report.adminNote = adminNote.slice(0, 500);
    }

    await report.save();
    return res.json({ status: true, data: { id: report._id.toString(), status: report.status } });
  } catch (error) {
    console.error('update report error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update report' });
  }
});

// Direct messages
router.get('/messages/conversations', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { skip, limit } = parsePagination(req);
    const userId = req.userId!;
    const requests = String(req.query.tab || req.query.requests || '') === 'requests';
    const query: Record<string, unknown> = { participants: userId };
    if (requests) {
      query.requestStatus = 'pending';
      query.initiatedBy = { $ne: userId };
    } else {
      query.$or = [{ requestStatus: { $ne: 'pending' } }, { requestStatus: { $exists: false } }, { initiatedBy: userId }];
    }
    const [conversations, total] = await Promise.all([
      DirectConversation.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      DirectConversation.countDocuments(query),
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
      ? await User.find({ _id: { $in: otherIds } }).select('username avatar lastSeenAt')
      : [];
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const results = conversations.map((conversation) => {
      const otherId = conversation.participants
        .find((participant) => participant.toString() !== userId)
        ?.toString();
      const other = otherId ? userMap.get(otherId) : null;
      const lastSeen = other?.lastSeenAt ? new Date(other.lastSeenAt).getTime() : 0;
      return {
        id: conversation._id.toString(),
        participant: {
          id: other?._id.toString() || otherId || '',
          username: other?.username || '',
          avatar: other?.avatar || '',
          isOnline: Boolean(lastSeen && Date.now() - lastSeen < 2 * 60 * 1000),
        },
        lastMessagePreview: conversation.lastMessagePreview,
        lastMessageAt: conversation.lastMessageAt,
        requestStatus: conversation.requestStatus || 'accepted',
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
      const flags = normalizeP1Flags((await getAppSettings()).p1);
      let requestStatus: 'pending' | 'accepted' = 'accepted';
      if (flags.igMessageRequests) {
        const follows = await Follow.findOne({ followerId: participantId, followingId: userId });
        if (!follows) requestStatus = 'pending';
      }
      conversation = await DirectConversation.create({
        participants: [userId, participantId],
        initiatedBy: userId,
        requestStatus,
      });
    }

    return res.json({ status: true, data: { id: conversation._id.toString(), requestStatus: conversation.requestStatus || 'accepted' } });
  } catch (error) {
    console.error('create conversation error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create conversation' });
  }
});

router.post('/messages/conversations/:id/accept', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversation = await DirectConversation.findById(req.params.id);
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }
    if (conversation.initiatedBy?.toString() === req.userId) {
      return res.status(400).json({ status: false, message: 'Waiting for the other player' });
    }
    conversation.requestStatus = 'accepted';
    await conversation.save();
    return res.json({ status: true, data: { id: conversation._id.toString(), requestStatus: 'accepted' } });
  } catch (error) {
    console.error('accept conversation error:', error);
    return res.status(500).json({ status: false, message: 'Failed to accept request' });
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
      replyTo: m.replyTo?.toString() || null,
      reactions: (m.reactions || []).map((r) => ({ userId: r.userId.toString(), emoji: r.emoji })),
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
    if (conversation.requestStatus === 'pending' && conversation.initiatedBy?.toString() !== req.userId) {
      return res.status(403).json({ status: false, message: 'Accept the message request first' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    const body = String(req.body?.body || '').trim();
    const attachments = sanitizeAttachmentList(req.body?.attachments);
    const replyTo = req.body?.replyTo ? String(req.body.replyTo) : null;
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
      replyTo: replyTo || null,
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

router.post('/messages/:conversationId/:messageId/react', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversation = await DirectConversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }
    const emoji = String(req.body?.emoji || '').slice(0, 8);
    if (!['🔥', '👏', '❤', '♥', 'GG'].includes(emoji)) {
      return res.status(400).json({ status: false, message: 'Unsupported reaction' });
    }
    const message = await DirectMessage.findOne({ _id: req.params.messageId, conversationId: conversation._id });
    if (!message) return res.status(404).json({ status: false, message: 'Message not found' });
    const uid = req.userId!;
    message.reactions = (message.reactions || []).filter((r) => r.userId.toString() !== uid);
    message.reactions.push({ userId: uid as unknown as typeof message.reactions[number]['userId'], emoji });
    await message.save();
    return res.json({
      status: true,
      data: (message.reactions || []).map((r) => ({ userId: r.userId.toString(), emoji: r.emoji })),
    });
  } catch (error) {
    console.error('dm react error:', error);
    return res.status(500).json({ status: false, message: 'Failed to react' });
  }
});

router.post('/messages/:conversationId/read', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const conversation = await DirectConversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.userId)) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }
    await DirectMessage.updateMany(
      { conversationId: conversation._id, deletedForEveryone: false },
      { $addToSet: { readBy: req.userId } },
    );
    return res.json({ status: true });
  } catch (error) {
    console.error('read messages error:', error);
    return res.status(500).json({ status: false, message: 'Failed to mark read' });
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

/** Player-facing + admin messaging provider config */
router.get('/messaging-settings', async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      data: normalizeMessagingSettings(settings.messaging),
    });
  } catch (error) {
    console.error('messaging settings get error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch messaging settings' });
  }
});

router.put('/messaging-settings', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const settings = await getAppSettings();
    settings.messaging = normalizeMessagingSettings(req.body || {});
    await settings.save();
    return res.json({
      status: true,
      data: normalizeMessagingSettings(settings.messaging),
    });
  } catch (error) {
    console.error('messaging settings update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update messaging settings' });
  }
});

/** Player-facing + admin profile social config */
router.get('/profile-social-settings', async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      data: normalizeProfileSocialSettings(settings.profileSocial),
    });
  } catch (error) {
    console.error('profile social settings get error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch profile social settings' });
  }
});

router.put('/profile-social-settings', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const settings = await getAppSettings();
    settings.profileSocial = normalizeProfileSocialSettings(req.body || {});
    await settings.save();
    return res.json({
      status: true,
      data: normalizeProfileSocialSettings(settings.profileSocial),
    });
  } catch (error) {
    console.error('profile social settings update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update profile social settings' });
  }
});

export default router;
