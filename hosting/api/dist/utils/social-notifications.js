import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { emitUserNotification } from './socket.js';
const ACTIVITY_LABELS = {
    follow: 'New Follower',
    like: 'New Like',
    comment: 'New Comment',
    reply: 'New Reply',
    mention: 'Mention',
    message: 'New Message',
    story_reaction: 'Story Reaction',
    reel_like: 'Reel Like',
};
export async function createActivityNotification(params) {
    if (params.recipientId === params.actorId)
        return null;
    const actor = await User.findById(params.actorId).select('username avatar');
    if (!actor)
        return null;
    const notification = await Notification.create({
        title: params.title || ACTIVITY_LABELS[params.type],
        message: params.message,
        subject: params.title || ACTIVITY_LABELS[params.type],
        category: 'Social',
        type: params.type,
        avatarUrl: actor.avatar || '',
        premiumOnly: false,
        target: 'selected',
        recipients: [params.recipientId],
        recipientId: params.recipientId,
        actorId: params.actorId,
        entityType: params.entityType || '',
        entityId: params.entityId || '',
        createdBy: params.actorId,
    });
    const payload = {
        _id: notification._id.toString(),
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        subject: notification.subject,
        category: notification.category,
        type: notification.type,
        avatarUrl: notification.avatarUrl,
        actorId: params.actorId,
        actorName: actor.username,
        entityType: params.entityType,
        entityId: params.entityId,
        isUnRead: true,
        createdAt: notification.createdAt,
    };
    emitUserNotification(params.recipientId, payload);
    return notification;
}
