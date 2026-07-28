import axios from 'src/lib/axios';

export const getStoriesApi = () => axios.get('api/v2/social/stories');

export const createStoryApi = (data: { mediaUrl: string; mediaType?: string; caption?: string }) =>
  axios.post('api/v2/social/stories', data);

export const viewStoryApi = (id: string) => axios.post(`api/v2/social/stories/${id}/view`);

export const getReelsApi = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qs = query.toString();
  return axios.get(`api/v2/social/reels${qs ? `?${qs}` : ''}`);
};

export const createReelApi = (data: { videoUrl: string; caption?: string; musicTitle?: string }) =>
  axios.post('api/v2/social/reels', data);

export const viewReelApi = (id: string) => axios.post(`api/v2/social/reels/${id}/view`);

export const getConversationsApi = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qs = query.toString();
  return axios.get(`api/v2/social/messages/conversations${qs ? `?${qs}` : ''}`);
};

export const createConversationApi = (participantId: string) =>
  axios.post('api/v2/social/messages/conversations', { participantId });

export const getDirectMessagesApi = (
  conversationId: string,
  params?: { page?: number; limit?: number }
) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qs = query.toString();
  return axios.get(`api/v2/social/messages/${conversationId}${qs ? `?${qs}` : ''}`);
};

export const sendDirectMessageApi = (
  conversationId: string,
  data: { body: string; attachments?: string[] }
) => axios.post(`api/v2/social/messages/${conversationId}`, data);

export const globalSearchApi = (q: string) =>
  axios.get(`api/v2/social/search?q=${encodeURIComponent(q)}`);

export const getExploreApi = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qs = query.toString();
  return axios.get(`api/v2/feed/explore${qs ? `?${qs}` : ''}`);
};

export const createFeedPostApi = (data: {
  title?: string;
  description: string;
  coverUrl?: string;
  mediaUrls?: string[];
  postType?: string;
  visibility?: string;
}) => axios.post('api/v2/feed', data);

export const getSavedFeedsApi = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qs = query.toString();
  return axios.get(`api/v2/feed/saved/me${qs ? `?${qs}` : ''}`);
};

export const toggleSaveFeedApi = (id: string, collectionName?: string) =>
  axios.post(`api/v2/feed/${id}/save`, collectionName ? { collectionName } : {});

export const getMessagingSettingsApi = () => axios.get('api/v2/social/messaging-settings');

export const blockUserApi = (id: string) => axios.post(`api/v2/users/${id}/block`);

export const unblockUserApi = (id: string) => axios.delete(`api/v2/users/${id}/block`);

export const submitSocialReportApi = (data: {
  targetType: 'user' | 'feed' | 'reel';
  targetId: string;
  reason: string;
  details?: string;
}) => axios.post('api/v2/social/reports', data);
