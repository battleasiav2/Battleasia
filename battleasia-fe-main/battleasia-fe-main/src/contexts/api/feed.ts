import axios from 'src/lib/axios';

import type { IFeedsParams } from '../type';

export const getFeedsApi = (params?: IFeedsParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.feedMode) queryParams.append('feedMode', params.feedMode);

  const queryString = queryParams.toString();
  const url = `api/v2/feed${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getCategoriesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v2/feed/categories${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getFeedByIdApi = async (id: string) => axios.get(`api/v2/feed/${id}`);

export const incrementFeedViewsApi = async (id: string) => axios.post(`api/v2/feed/${id}/view`);

export const toggleFeedLikeApi = async (id: string) => axios.post(`api/v2/feed/${id}/like`);

export const getFeedCommentsApi = async (id: string, params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `api/v2/feed/${id}/comments${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const addFeedCommentApi = async (id: string, content: string, parentId?: string) =>
  axios.post(`api/v2/feed/${id}/comments`, { content, ...(parentId ? { parentId } : {}) });


export const getUserFeedsApi = (id: string, params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `api/v2/feed/user/${id}${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};
