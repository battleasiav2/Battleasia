import axios from 'src/lib/axios';

export const getOrCreateConversationApi = () => axios.get('api/v2/customer-support/conversation');

export const getMyTicketsApi = (params?: { page?: number; limit?: number; status?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const url = `api/v2/customer-support/conversations/mine${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const createTicketApi = (data: {
  subject: string;
  category: string;
  body: string;
  attachments?: string[];
}) => axios.post('api/v2/customer-support/conversation', data);

export const getMessagesApi = (conversationId: string, params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `api/v2/customer-support/conversation/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const sendMessageApi = (data: {
  body: string;
  conversationId?: string;
  attachments?: string[];
}) => axios.post('api/v2/customer-support/message', data);

export const closeConversationApi = (conversationId: string) =>
  axios.patch(`api/v2/customer-support/conversation/${conversationId}/close`);

export const getAllConversationsApi = (params?: { page?: number; limit?: number; status?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const url = `api/v2/customer-support/conversations${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};
