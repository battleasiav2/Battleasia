import axios from 'src/utils/axios';

export const listShopItemsApi = (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string; startDate?: string; endDate?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.type) query.append('type', params.type);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  query.append('includeInactive', 'true');
  return axios.get(`/api/v4/shop/items?${query.toString()}`);
};

export const getShopItemApi = (id: string) => axios.get(`/api/v4/shop/items/${id}`);

export const createShopItemApi = (data: any) => axios.post('/api/v4/shop/items', data);

export const updateShopItemApi = (id: string, data: any) => axios.put(`/api/v4/shop/items/${id}`, data);

export const deleteShopItemApi = (id: string) => axios.delete(`/api/v4/shop/items/${id}`);

// Coin rates
export const listCoinRatesApi = () => axios.get(`/api/v4/shop/coins`);
export const createCoinRateApi = (data: any) => axios.post(`/api/v4/shop/coins`, data);
export const updateCoinRateApi = (id: string, data: any) => axios.put(`/api/v4/shop/coins/${id}`, data);
export const deleteCoinRateApi = (id: string) => axios.delete(`/api/v4/shop/coins/${id}`);

export const listOrdersApi = (params?: { page?: number; limit?: number; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.status) query.append('status', params.status);
  return axios.get(`/api/v4/shop/orders?${query.toString()}`);
};
