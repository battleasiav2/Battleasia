import axios from 'src/utils/axios';

export interface IFeedData {
  categoryId: string;
  title: string;
  description: string;
  coverUrl?: string;
  status: 'published' | 'draft';
}

export interface ICategoryData {
  name: string;
  slug: string;
}

export const getFeedsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'published' | 'draft';
  sortBy?: 'latest' | 'oldest' | 'popular';
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const queryString = queryParams.toString();
  const url = `api/v3/feed/list${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getFeedByIdApi = async (id: string) => axios.get(`api/v3/feed/list/${id}`);

export const createFeedApi = async (data: IFeedData) => axios.post('api/v3/feed/list', data);

export const updateFeedApi = async (id: string, data: Partial<IFeedData>) =>
  axios.put(`api/v3/feed/list/${id}`, data);

export const deleteFeedApi = async (id: string) => axios.delete(`api/v3/feed/list/${id}`);

export const incrementFeedViewsApi = async (id: string) => axios.post(`api/v3/feed/list/${id}/view`);

// Category APIs
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
  const url = `api/v3/feed/categories${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getCategoryByIdApi = async (id: string) => axios.get(`api/v3/feed/categories/${id}`);

export const createCategoryApi = async (data: ICategoryData) => axios.post('api/v3/feed/categories', data);

export const updateCategoryApi = async (id: string, data: Partial<ICategoryData>) =>
  axios.put(`api/v3/feed/categories/${id}`, data);

export const deleteCategoryApi = async (id: string) => axios.delete(`api/v3/feed/categories/${id}`);

