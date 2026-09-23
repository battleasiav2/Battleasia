import { api, uploadFile, unwrapData, unwrapList } from './api';

function nid(item: { id?: string; _id?: string }) {
  return item.id || item._id || '';
}

export type FeedPost = {
  id: string;
  title?: string;
  description?: string;
  coverUrl?: string;
  postType?: string;
  mediaUrls?: string[];
  totalLikes?: number;
  totalComments?: number;
  totalViews?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  collectionName?: string;
  hashtags?: string[];
  author?: { id?: string; name?: string; avatarUrl?: string; isVerified?: boolean };
  createdAt?: string;
  gameTag?: string;
  entityId?: string;
  pinnedAt?: string | null;
};

export type ExploreData = {
  trendingPosts?: FeedPost[];
  trendingHashtags?: Array<{ tag: string; count: number }>;
  recommendedCreators?: Array<{ id: string; username: string; avatar?: string; likes?: number }>;
};

export type ReelItem = {
  id: string;
  username?: string;
  videoUrl: string;
  caption?: string;
  totalViews?: number;
  parentReelId?: string;
};

export type Conversation = {
  id: string;
  participant?: { id?: string; username?: string; isOnline?: boolean };
  lastMessage?: string;
  lastMessagePreview?: string;
  requestStatus?: string;
};

export type ReferralStats = {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  paidEarnings: number;
  commissionRate: number;
  referralMilestones?: Array<{ key?: string; target?: number; claimed?: boolean; progress?: number }>;
};

export type PublicProfile = {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatar?: string;
  coverUrl?: string;
  pubgId?: string;
  gameServer?: string;
  referralCode?: string;
  usernameChangedAt?: string | null;
  countryCode?: string;
  mobileNo?: string;
  twitterLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  followers?: number;
  following?: number;
  posts?: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string;
  cosmeticId?: string;
  gamingStats?: { totalMatches?: number; totalWins?: number; totalKills?: number; totalLosses?: number };
};

export type SearchHits = {
  users: Array<{ id: string; username: string; avatar?: string }>;
  posts: FeedPost[];
  hashtags: string[];
};

export async function searchSocial(q: string): Promise<SearchHits> {
  const payload = await api(`/api/v2/social/search?q=${encodeURIComponent(q)}`);
  const data = unwrapData<SearchHits>(payload);
  return {
    users: (data.users || []).map((u) => ({ ...u, id: nid(u) })),
    posts: (data.posts || []).map((p) => ({ ...p, id: nid(p) })),
    hashtags: data.hashtags || [],
  };
}

export async function fetchFeed(mode = 'all', extra: { gameTag?: string; postType?: string; hashtag?: string } = {}) {
  const q = new URLSearchParams({ limit: '24', feedMode: mode });
  if (extra.gameTag) q.set('gameTag', extra.gameTag);
  if (extra.postType) q.set('postType', extra.postType);
  if (extra.hashtag) q.set('hashtag', extra.hashtag);
  const payload = await api(`/api/v2/feed?${q.toString()}`);
  return unwrapList<FeedPost>(payload).map((p) => ({ ...p, id: nid(p) }));
}

export async function fetchExplore() {
  const payload = await api('/api/v2/feed/explore?limit=12');
  const data = unwrapData<ExploreData>(payload);
  return {
    ...data,
    trendingPosts: (data.trendingPosts || []).map((p) => ({ ...p, id: nid(p) })),
  };
}

export async function fetchSaved() {
  const payload = await api('/api/v2/feed/saved/me?limit=24');
  return unwrapList<FeedPost>(payload).map((p) => ({ ...p, id: nid(p) }));
}

export async function fetchUserFeed(userId: string) {
  const payload = await api(`/api/v2/feed/user/${userId}?limit=24`);
  return unwrapList<FeedPost>(payload).map((p) => ({ ...p, id: nid(p) }));
}

export async function fetchPost(id: string) {
  const payload = await api(`/api/v2/feed/${id}`);
  const p = unwrapData<FeedPost>(payload);
  return { ...p, id: nid(p) };
}

export type FeedComment = {
  id: string;
  content: string;
  parentId?: string | null;
  mentions?: string[];
  totalLikes?: number;
  isLiked?: boolean;
  user?: { id?: string; username?: string };
  replies?: FeedComment[];
  createdAt?: string;
};

export async function fetchComments(id: string) {
  const payload = await api(`/api/v2/feed/${id}/comments?limit=40`);
  return unwrapList<FeedComment>(payload).map((c) => ({
    ...c,
    id: nid(c),
    replies: (c.replies || []).map((r) => ({ ...r, id: nid(r) })),
  }));
}

export async function addComment(id: string, content: string, parentId?: string) {
  return api(`/api/v2/feed/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId }),
  });
}

export async function likeComment(postId: string, commentId: string) {
  const payload = await api(`/api/v2/feed/${postId}/comments/${commentId}/like`, { method: 'POST' });
  return unwrapData<{ isLiked: boolean; totalLikes: number }>(payload);
}

export async function createPost(description: string, extra: Record<string, unknown> = {}) {
  return api('/api/v2/feed', { method: 'POST', body: JSON.stringify({ description, ...extra }) });
}

export async function uploadMedia(
  file: File,
  folder = 'social',
  opts: { onProgress?: (pct: number) => void; signal?: AbortSignal } = {},
) {
  const payload = await uploadFile(`/api/v1/files/upload/${folder}`, file, opts);
  const data = unwrapData<{ url?: string }>(payload);
  if (!data.url) {
    throw { status: 400, message: 'Upload failed' };
  }
  return data.url;
}

export async function createStory(
  mediaUrl: string,
  mediaType: 'image' | 'video',
  caption = '',
  extra: {
    overlayText?: string;
    stickers?: Array<{ emoji: string; x: number; y: number }>;
    poll?: { question: string; options: string[]; kind?: 'poll' | 'quiz'; correctIndex?: number };
  } = {},
) {
  return api('/api/v2/social/stories', {
    method: 'POST',
    body: JSON.stringify({ mediaUrl, mediaType, caption, ...extra }),
  });
}

export async function createReel(videoUrl: string, caption = '', parentReelId = '') {
  return api('/api/v2/social/reels', {
    method: 'POST',
    body: JSON.stringify({ videoUrl, caption, parentReelId }),
  });
}

export async function pinPost(id: string) {
  return api(`/api/v2/feed/${id}/pin`, { method: 'POST' });
}

export async function toggleLike(id: string) {
  const payload = await api(`/api/v2/feed/${id}/like`, { method: 'POST' });
  return unwrapData<{ isLiked: boolean; totalLikes: number }>(payload);
}

export async function toggleSave(id: string, collectionName?: string) {
  const payload = await api(`/api/v2/feed/${id}/save`, {
    method: 'POST',
    body: JSON.stringify(collectionName ? { collectionName } : {}),
  });
  return unwrapData<{ isSaved: boolean; collectionName?: string }>(payload);
}

export async function fetchReels() {
  const payload = await api('/api/v2/social/reels?limit=12');
  return unwrapList<ReelItem>(payload).map((r) => ({ ...r, id: nid(r) }));
}

export async function fetchConversations(tab: 'inbox' | 'requests' = 'inbox') {
  const q = tab === 'requests' ? '&tab=requests' : '';
  const payload = await api(`/api/v2/social/messages/conversations?limit=20${q}`);
  return unwrapList<Conversation>(payload).map((c) => ({ ...c, id: nid(c) }));
}

export async function startConversation(participantId: string) {
  const payload = await api('/api/v2/social/messages/conversations', {
    method: 'POST',
    body: JSON.stringify({ participantId }),
  });
  const data = unwrapData<{ id: string; requestStatus?: string }>(payload);
  return { ...data, id: nid(data) };
}

export async function acceptConversation(id: string) {
  return api(`/api/v2/social/messages/conversations/${id}/accept`, { method: 'POST' });
}

export type StoryGroup = {
  userId: string;
  username: string;
  avatar: string;
  stories: Array<{
    id: string;
    mediaUrl: string;
    mediaType?: string;
    caption?: string;
  overlayText?: string;
  stickers?: Array<{ emoji: string; x: number; y: number }>;
  poll?: {
    question: string;
    kind?: 'poll' | 'quiz';
    correct?: number;
    options: Array<{ text: string; votes: number; chosen?: boolean }>;
  };
  }>;
};

export async function fetchStories() {
  const payload = await api('/api/v2/social/stories');
  return unwrapList<StoryGroup>(payload).map((g) => ({
    ...g,
    userId: g.userId || String((g as { id?: string }).id || ''),
  }));
}

export async function viewStory(id: string) {
  return api(`/api/v2/social/stories/${id}/view`, { method: 'POST' });
}

export async function reactStory(id: string, emoji: string) {
  return api(`/api/v2/social/stories/${id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
}

export async function fetchStoryViewers(id: string) {
  const payload = await api(`/api/v2/social/stories/${id}/viewers`);
  const data = unwrapData<Array<{ id: string; username: string }>>(payload);
  return Array.isArray(data) ? data : [];
}

export async function voteStoryPoll(id: string, option: number) {
  const payload = await api(`/api/v2/social/stories/${id}/poll`, { method: 'POST', body: JSON.stringify({ option }) });
  return unwrapData<{
    question: string;
    kind?: 'poll' | 'quiz';
    correct?: number;
    options: Array<{ text: string; votes: number; chosen?: boolean }>;
  }>(payload);
}

export async function pinStoryHighlight(id: string) {
  return api(`/api/v2/social/stories/${id}/highlight`, { method: 'POST' });
}

export async function fetchHighlights(userId: string) {
  const payload = await api(`/api/v2/social/highlights/${userId}`);
  return unwrapList<{ id: string; mediaUrl: string; mediaType?: string; overlayText?: string }>(payload);
}

export async function reactDirectMessage(conversationId: string, messageId: string, emoji: string) {
  const payload = await api(`/api/v2/social/messages/${conversationId}/${messageId}/react`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  });
  return unwrapData<Array<{ userId: string; emoji: string }>>(payload);
}

export async function pingPresence() {
  return api('/api/v2/users/me/presence', { method: 'POST' });
}

export type DirectMessage = {
  id: string;
  body?: string;
  senderName?: string;
  isMine?: boolean;
  createdAt?: string;
  attachments?: string[];
  readBy?: string[];
  replyTo?: string | null;
  reactions?: Array<{ userId: string; emoji: string }>;
};

export async function fetchDirectMessages(id: string) {
  const payload = await api(`/api/v2/social/messages/${id}?limit=40`);
  return unwrapList<DirectMessage>(payload).map((m) => ({ ...m, id: nid(m) }));
}

export async function sendDirectMessage(id: string, body: string, attachments: string[] = [], replyTo?: string) {
  return api(`/api/v2/social/messages/${id}`, {
    method: 'POST',
    body: JSON.stringify({ body, attachments, replyTo }),
  });
}

export async function markDmRead(id: string) {
  return api(`/api/v2/social/messages/${id}/read`, { method: 'POST' });
}

export async function blockUser(id: string) {
  return api(`/api/v2/users/${id}/block`, { method: 'POST' });
}

export async function reportTarget(targetType: string, targetId: string, reason = 'spam') {
  return api('/api/v2/social/reports', {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, reason }),
  });
}

export type AlertRow = {
  id: string;
  title?: string;
  subject?: string;
  message?: string;
  isUnRead?: boolean;
  createdAt?: string;
};

export async function fetchNotifications() {
  const payload = await api('/api/v2/notifications?limit=40');
  return unwrapList<AlertRow>(payload).map((n) => ({ ...n, id: nid(n) }));
}

export async function markAllRead() {
  return api('/api/v2/notifications/read-all', { method: 'PATCH' });
}

export async function markRead(id: string) {
  return api(`/api/v2/notifications/${id}/read`, { method: 'PATCH' });
}

export async function fetchReferralStats() {
  const payload = await api('/api/v2/users/referral-stats');
  return unwrapData<ReferralStats>(payload);
}

export async function fetchReferrals() {
  const payload = await api('/api/v2/users/referrals');
  return unwrapList<{ id: string; username: string; status?: string; totalEarnings?: number; joinedAt?: string }>(payload).map((r) => ({
    ...r,
    id: nid(r),
  }));
}

export async function fetchReferralCommissions() {
  const payload = await api('/api/v2/users/referral-commissions?limit=20');
  return unwrapList<{ id: string; referredUsername?: string; commissionAmount?: number; depositAmount?: number; createdAt?: string }>(
    payload
  ).map((r) => ({ ...r, id: nid(r) }));
}

export async function claimReferralMilestone(key: string) {
  return api(`/api/v2/engagement/referral/claim/${encodeURIComponent(key)}`, { method: 'POST' });
}

export async function fetchProfile(id: string) {
  const payload = await api(`/api/v2/users/${id}`);
  const p = unwrapData<PublicProfile>(payload);
  return { ...p, id: nid(p) };
}

export async function updateMe(body: Record<string, unknown>) {
  const payload = await api('/api/v2/users/me', { method: 'PUT', body: JSON.stringify(body) });
  const row = (payload || {}) as {
    user?: PublicProfile & { usernameChangedAt?: string | null; email?: string };
    data?: PublicProfile;
  };
  return {
    user: row.user || null,
    data: row.data || null,
  };
}

export type FollowUser = {
  id: string;
  username: string;
  avatar?: string;
  role?: string;
  isFollowing?: boolean;
  followedAt?: string;
};

function mapFollowUser(row: FollowUser & { _id?: string }) {
  return { ...row, id: nid(row) };
}

export async function fetchFollowers(userId: string, limit = 40) {
  const path =
    userId === 'me'
      ? `/api/v2/users/me/followers?limit=${limit}`
      : `/api/v2/users/${encodeURIComponent(userId)}/followers?limit=${limit}`;
  const payload = await api(path);
  const data = unwrapData<{ results?: FollowUser[]; total?: number }>(payload);
  return {
    results: (data.results || []).map(mapFollowUser),
    total: data.total ?? (data.results || []).length,
  };
}

export async function fetchFollowing(userId: string, limit = 40) {
  const path =
    userId === 'me'
      ? `/api/v2/users/me/following?limit=${limit}`
      : `/api/v2/users/${encodeURIComponent(userId)}/following?limit=${limit}`;
  const payload = await api(path);
  const data = unwrapData<{ results?: FollowUser[]; total?: number }>(payload);
  return {
    results: (data.results || []).map(mapFollowUser),
    total: data.total ?? (data.results || []).length,
  };
}

export async function fetchSuggestedFollows(limit = 8) {
  const payload = await api(`/api/v2/users/suggested-follows?limit=${limit}`);
  const data = unwrapData<{ results?: FollowUser[] }>(payload);
  return (data.results || []).map(mapFollowUser);
}

export async function followUser(id: string) {
  const payload = await api(`/api/v2/users/${id}/follow`, { method: 'POST' });
  return unwrapData<{ isFollowing: boolean; followers?: number }>(payload);
}

export async function unfollowUser(id: string) {
  const payload = await api(`/api/v2/users/${id}/follow`, { method: 'DELETE' });
  return unwrapData<{ isFollowing: boolean; followers?: number }>(payload);
}

export async function fetchMatchHistory() {
  const payload = await api('/api/v2/users/match-history');
  const data = unwrapData<unknown>(payload);
  return Array.isArray(data) ? data : unwrapList(payload);
}

export async function fetchUserMatchHistory(userId: string) {
  const payload = await api(`/api/v2/users/${encodeURIComponent(userId)}/match-history`);
  const data = unwrapData<unknown>(payload);
  return Array.isArray(data) ? data : unwrapList(payload);
}

export async function fetchLeaderboard(period: string) {
  const payload = await api(`/api/v2/users/leaderboard?period=${encodeURIComponent(period)}`);
  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  return unwrapList<Record<string, unknown>>(payload);
}

export async function fetchSupportConversation() {
  const payload = await api('/api/v2/customer-support/conversation');
  return unwrapData<{ id: string; subject?: string; status?: string; category?: string }>(payload);
}

export type SupportTicket = {
  id: string;
  subject?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  lastMessageAt?: string;
  previewBody?: string;
  previewAttachments?: string[];
  attachmentCount?: number;
};

export type SupportMessage = {
  id: string;
  body?: string;
  senderName?: string;
  isAdmin?: boolean;
  createdAt?: string;
  attachments?: Array<{ url?: string } | string>;
};

export async function fetchMySupportTickets(status?: string) {
  const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}&limit=50` : '?limit=50';
  const payload = await api(`/api/v2/customer-support/conversations/mine${q}`);
  return unwrapList<SupportTicket>(payload).map((t) => ({ ...t, id: nid(t) }));
}

export async function createSupportTicket(input: {
  subject: string;
  category: string;
  body: string;
  attachments?: Array<{ url: string }>;
}) {
  const payload = await api('/api/v2/customer-support/conversation', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const data = unwrapData<SupportTicket>(payload);
  return { ...data, id: nid(data) };
}

export async function closeSupportTicket(id: string) {
  return api(`/api/v2/customer-support/conversation/${id}/close`, { method: 'PATCH' });
}

export async function fetchSupportMessages(id: string) {
  const payload = await api(`/api/v2/customer-support/conversation/${id}/messages?limit=100`);
  return unwrapList<SupportMessage>(payload).map((m) => ({ ...m, id: nid(m) }));
}

export async function sendSupportMessage(
  conversationId: string,
  body: string,
  attachments: Array<{ url: string }> = [],
) {
  return api('/api/v2/customer-support/message', {
    method: 'POST',
    body: JSON.stringify({ conversationId, body: body || ' ', attachments }),
  });
}

export async function uploadSupportImages(files: File[]) {
  const urls: Array<{ url: string }> = [];
  for (const file of files.slice(0, 8)) {
    const form = new FormData();
    form.append('file', file);
    const payload = await api('/api/v1/files/upload/support', { method: 'POST', body: form });
    const data = unwrapData<{ url?: string }>(payload);
    if (data.url) urls.push({ url: data.url });
  }
  return urls;
}
