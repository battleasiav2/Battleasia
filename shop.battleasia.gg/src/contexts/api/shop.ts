import axios from 'src/lib/axios';

function normalizeListPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { results?: T[] }).results)
  ) {
    return (payload as { results: T[] }).results;
  }
  return [];
}

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

export const getCurrencyRatesApi = async () => {
  const res = await axios.get('/api/v4/shop/coins');
  const rates = normalizeListPayload(res?.data?.data);
  return {
    ...res,
    data: {
      ...res.data,
      data: rates,
    },
  };
};

// export const buyCoinsApi = (data: { amount: number; paymentMethod?: string }) =>
//   axios.post('/api/v4/coins/buy', data);

// export const sellCoinsApi = (data: { amount: number }) => axios.post('/api/v3/coins/sell', data);

// coingo collection. PayIn
export const startCoingoCollectionApi = (data: { amount: number; walletNumber: string; walletType: string }) =>
  axios.post('/api/v4/payments/coingo/collection/start', data);

export const getCoingoCollectionStatusApi = (merchantSerialNo: string) =>
  axios.get(`/api/v4/payments/coingo/collection/${merchantSerialNo}/status`);

// coingo PayOut
export const createCoingoPayoutApi = (data: {
  amount: number;
  walletNumber: string;
  walletType: string;
  description?: string;
  email?: string;
  username?: string;
  currency_type?: string;
  currency_amount?: number;
}) => axios.post('/api/v4/payments/coingo/payout', data);

export const getCoingoPayoutStatusApi = (merchantSerialNo: string) =>
  axios.get(`/api/v4/payments/coingo/payout/${merchantSerialNo}/status`);

// balance history
export const getBalanceHistoryApi = (params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `api/v2/users/balance-history${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

// payment channels
export const getPaymentChannelsApi = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  return axios.get(`/api/v4/payments/payment-channels/public?${query.toString()}`);
};

// business wallets (public)
export const getBusinessWalletsApi = (params?: { page?: number; limit?: number; channel?: string; currency?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.channel) query.append('channel', params.channel);
  if (params?.currency) query.append('currency', params.currency);
  return axios.get(`/api/v4/payments/business-wallets/public?${query.toString()}`);
};

// deposit history
export const submitDepositApi = (data: {
  user_email: string;
  username: string;
  transaction_id: string;
  coin_amount: number;
  payment_currency: string;
  payment_amount: number;
  from_address: string;
  payment_channel: string;
  to_wallet_address: string;
}) => axios.post('/api/v4/payments/deposit-history/submit', data);

// withdrawal history
export const submitWithdrawalApi = (data: {
  user_email: string;
  username: string;
  coin_amount: number;
  wallet_type: string;
  wallet_address: string;
  currency_type: string;
  currency_amount: number;
  description?: string;
  notes?: string;
}) => axios.post('/api/v4/payments/withdrawal-history/submit', data);

export const getWithdrawableAmountApi = () => axios.get('/api/v2/users/withdrawable-amount');

// Get withdrawal details by ID
export const getWithdrawalByIdApi = (id: string) => axios.get(`/api/v4/payments/withdrawal-history/${id}`);

// Get deposit details by ID
export const getDepositByIdApi = (id: string) => axios.get(`/api/v4/payments/deposit-history/${id}`);