import axios from 'src/lib/axios';

import type { UpdateProfileData } from '../type';

export const updateProfileApi = (data: UpdateProfileData) => axios.put('api/v2/users/me', data);

export const getBalanceHistoryApi = (params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `api/v2/users/balance-history${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getReferralsApi = () => axios.get('api/v2/users/referrals');

export const getReferralSettingsApi = () => axios.get('api/v2/users/referral-settings');

export const getReferralCommissionsApi = (params?: { page?: number; limit?: number }) =>
  axios.get('api/v2/users/referral-commissions', { params });

export const getReferralStatsApi = () => axios.get('api/v2/users/referral-stats');

export const getNotificationsApi = () => axios.get('api/v2/notifications');

export const markNotificationReadApi = (id: string) => axios.patch(`api/v2/notifications/${id}/read`);

export const markAllNotificationsReadApi = () => axios.patch('api/v2/notifications/read-all');

export const getLeaderboardApi = (params?: { period?: string }) => {
  const query = new URLSearchParams();
  if (params?.period) {
    query.append('period', params.period);
  }
  const queryString = query.toString();
  const endpoint = queryString ? `api/v2/users/leaderboard?${queryString}` : 'api/v2/users/leaderboard';
  return axios.get(endpoint);
};

export const getUserByIdApi = (id: string) => axios.get(`api/v2/users/${id}`);

export const followUserApi = (id: string) => axios.post(`api/v2/users/${id}/follow`);

export const unfollowUserApi = (id: string) => axios.delete(`api/v2/users/${id}/follow`);

// premium
export const activatePremiumApi = () => axios.post('api/v2/users/premium/activate');
export const getPremiumDetailsApi = () => axios.get('api/v2/users/premium/details');

export const getFollowersApi = (id?: string) => {
  const endpoint = id ? `api/v2/users/${id}/followers` : 'api/v2/users/me/followers';
  return axios.get(endpoint);
};

export const getFollowingApi = (id?: string) => {
  const endpoint = id ? `api/v2/users/${id}/following` : 'api/v2/users/me/following';
  return axios.get(endpoint);
};

export const getSuggestedFollowsApi = (contextUserId?: string) => {
  const query = contextUserId ? `?contextUserId=${encodeURIComponent(contextUserId)}` : '';
  return axios.get(`api/v2/users/suggested-follows${query}`);
};

export const getMutualFollowersApi = (id: string) => axios.get(`api/v2/users/${id}/mutual-followers`);

export const getRecentFollowsApi = (id: string) => axios.get(`api/v2/users/${id}/recent-follows`);

export const getProfileSocialSettingsApi = () => axios.get('api/v2/social/profile-social-settings');

// Withdrawal
export const submitWithdrawalApi = (data: {
  user_email: string;
  username: string;
  coin_amount: number;
  wallet_type: string;
  wallet_address: string;
  currency_type: string;
  currency_amount: number;
  description?: string;
}) => axios.post('api/v4/payments/withdrawal-history/submit', data);

export const getWithdrawableAmountApi = () => axios.get('api/v2/users/withdrawable-amount');

