import type { IFeed } from '../models/Feed.js';
import type { IFeedCategory } from '../models/FeedCategory.js';
import type { INotification } from '../models/Notification.js';
import type { ISupportConversation } from '../models/SupportConversation.js';
import type { ISupportMessage } from '../models/SupportMessage.js';
import type { IUser } from '../models/User.js';

export function serializeFeedCategory(category: IFeedCategory) {
  return {
    _id: category._id.toString(),
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function serializeFeed(feed: IFeed, category?: IFeedCategory | null) {
  const cat = category as (IFeedCategory & { _id: { toString(): string } }) | null | undefined;
  return {
    _id: feed._id.toString(),
    id: feed._id.toString(),
    title: feed.title,
    description: feed.description,
    coverUrl: feed.coverUrl || '',
    postType: feed.postType || 'text',
    mediaUrls: feed.mediaUrls || [],
    hashtags: feed.hashtags || [],
    visibility: feed.visibility || 'public',
    pinnedAt: feed.pinnedAt || null,
    status: feed.status,
    premiumOnly: feed.premiumOnly ?? false,
    categoryId: feed.categoryId.toString(),
    category: cat
      ? { id: cat._id.toString(), name: cat.name, slug: cat.slug }
      : undefined,
    totalViews: feed.totalViews ?? 0,
    totalShares: feed.totalShares ?? 0,
    totalComments: feed.totalComments ?? 0,
    totalLikes: feed.totalLikes ?? 0,
    author: {
      id: feed.authorId?.toString() || '',
      name: feed.authorName || 'Admin',
      avatarUrl: feed.authorAvatar || '',
    },
    createdAt: feed.createdAt,
    updatedAt: feed.updatedAt,
  };
}

export function serializeNotification(notification: INotification) {
  return {
    _id: notification._id.toString(),
    id: notification._id.toString(),
    subject: notification.subject || notification.title,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    type: notification.type,
    premiumOnly: notification.premiumOnly ?? false,
    target: notification.target,
    recipients: notification.recipients.map((id) => id.toString()),
    createdAt: notification.createdAt,
  };
}

export function serializeConversation(
  conversation: ISupportConversation,
  user?: IUser | null
) {
  const u = user as (IUser & { _id: { toString(): string } }) | null | undefined;
  return {
    _id: conversation._id.toString(),
    id: conversation._id.toString(),
    userId: u
      ? {
          _id: u._id.toString(),
          username: u.username,
          email: u.email,
          avatar: u.avatar || '',
        }
      : conversation.userId.toString(),
    status: conversation.status,
    createdAt: conversation.createdAt,
    lastMessageAt: conversation.lastMessageAt,
  };
}

export function serializeSupportMessage(message: ISupportMessage) {
  return {
    _id: message._id.toString(),
    id: message._id.toString(),
    body: message.body,
    senderId: message.senderId.toString(),
    senderName: message.senderName,
    senderAvatar: message.senderAvatar || '',
    createdAt: message.createdAt,
    isAdmin: message.isAdmin,
    attachments: message.attachments || [],
  };
}
