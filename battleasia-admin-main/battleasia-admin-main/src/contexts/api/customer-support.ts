import axios from 'src/utils/axios';

export interface IConversation {
  id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  lastMessageAt: string;
}

export interface IMessage {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: string;
  isAdmin: boolean;
  attachments?: string[];
}

export const getAllConversationsApi = async (params?: {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed' | 'pending';
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const url = `api/v2/customer-support/conversations${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getConversationMessagesApi = async (conversationId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `api/v2/customer-support/conversation/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const sendMessageApi = async (data: {
  body: string;
  conversationId: string;
  attachments?: string[];
}) => axios.post('api/v2/customer-support/message', data);

export const closeConversationApi = async (conversationId: string, deleteMessages = true) =>
  axios.patch(`api/v2/customer-support/conversation/${conversationId}/close`, { deleteMessages });

