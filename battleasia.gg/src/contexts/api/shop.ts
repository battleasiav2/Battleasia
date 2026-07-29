import axios from 'src/lib/axios';

export const listShopItemsApi = (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.type) query.append('type', params.type);
  return axios.get(`/api/v4/shop/items?${query.toString()}`);
};

export const getShopItemApi = (id: string) => axios.get(`/api/v4/shop/items/${id}`);

export const checkoutShopApi = (data: { items: { itemId: string; quantity: number }[]; shippingAddress?: any }) =>
  axios.post('/api/v3/shop/orders/checkout', data);

export const listMyOrdersApi = (params?: { page?: number; limit?: number; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.status) query.append('status', params.status);
  return axios.get(`/api/v3/shop/orders/me?${query.toString()}`);
};

export const getCurrencyRatesApi = () => axios.get('/api/v3/shop/coins/public');

export const createCoingoPayoutApi = (data: { amount: number; walletNumber: string; walletType: string; description?: string }) => axios.post('/api/v3/shop/coins/payout', data);

export const getCoingoPayoutStatusApi = (merchantSerialNo: string) => axios.get(`/api/v3/shop/coins/payout/${merchantSerialNo}`);
