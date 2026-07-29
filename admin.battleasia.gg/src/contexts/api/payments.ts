import axios from 'src/utils/axios';

export const getBalanceHistoriesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `api/v4/payments/balance-histories${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

// Payment Channels API
export const getPaymentChannelsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v4/payments/payment-channels${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getPaymentChannelByIdApi = async (id: string) =>
  axios.get(`api/v4/payments/payment-channels/${id}`);

export const createPaymentChannelApi = async (data: {
  channel_name: string;
  description?: string;
  icon?: string;
}) => axios.post('api/v4/payments/payment-channels', data);

export const updatePaymentChannelApi = async (
  id: string,
  data: {
    channel_name?: string;
    description?: string;
    icon?: string;
    enabled?: boolean;
  }
) => axios.put(`api/v4/payments/payment-channels/${id}`, data);

export const deletePaymentChannelApi = async (id: string) =>
  axios.delete(`api/v4/payments/payment-channels/${id}`);

export const togglePaymentChannelApi = async (id: string) =>
  axios.patch(`api/v4/payments/payment-channels/${id}/toggle`);

// Business Wallets API
export const getBusinessWalletsApi = async (params?: {
  page?: number;
  limit?: number;
  channelId?: string;
  currencyType?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.channelId) queryParams.append('channelId', params.channelId);
  if (params?.currencyType) queryParams.append('currencyType', params.currencyType);

  const queryString = queryParams.toString();
  const url = `api/v4/payments/business-wallets${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getBusinessWalletByIdApi = async (id: string) =>
  axios.get(`api/v4/payments/business-wallets/${id}`);

export const createBusinessWalletApi = async (data: {
  channel_id: string;
  wallet_address: string;
  currency_type: string;
}) => axios.post('api/v4/payments/business-wallets', data);

export const updateBusinessWalletApi = async (
  id: string,
  data: {
    channel_id?: string;
    wallet_address?: string;
    currency_type?: string;
    enabled?: boolean;
  }
) => axios.put(`api/v4/payments/business-wallets/${id}`, data);

export const deleteBusinessWalletApi = async (id: string) =>
  axios.delete(`api/v4/payments/business-wallets/${id}`);

export const toggleBusinessWalletApi = async (id: string) =>
  axios.patch(`api/v4/payments/business-wallets/${id}/toggle`);


