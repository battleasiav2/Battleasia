import axios from 'src/utils/axios';
import { IBalanceAdjustmentData, ICreatePlayerData } from '../type';

export const getUsersApi = async (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `api/v3/users/list${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getRolesApi = async (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string; tree?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.tree) queryParams.append('tree', 'true');

  const queryString = queryParams.toString();
  const url = `api/v3/users/roles${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getUserByIdApi = async (id: string) =>
  axios.get(`api/v3/users/list/${id}`);

export const createPlayerApi = async (data: ICreatePlayerData) =>
  axios.post('api/v3/users/list', data);

export const updatePlayerApi = async (id: string, data: Partial<ICreatePlayerData>) =>
  axios.put(`api/v3/users/list/${id}`, data);

export const updatePlayerStatusApi = async (id: string, status: boolean) =>
  axios.patch(`api/v3/users/list/${id}/status`, { status });

export const updatePlayerBalanceApi = async (
  id: string,
  data: IBalanceAdjustmentData
) => axios.patch(`api/v3/users/list/${id}/balance`, data);

export const deletePlayerApi = async (id: string) =>
  axios.delete(`api/v3/users/list/${id}`);

export const deleteAllPlayersApi = async () =>
  axios.delete('api/v3/users/list/bulk/all');

export const createRoleApi = async (data: { name: string; description?: string; parent?: string | null; permissions?: string[] }) =>
  axios.post('api/v3/users/roles', data);

export const updateRoleApi = async (id: string, data: { name?: string; description?: string; parent?: string | null; permissions?: string[] }) =>
  axios.put(`api/v3/users/roles/${id}`, data);

export const deleteRoleApi = async (id: string) =>
  axios.delete(`api/v3/users/roles/${id}`);

export const getAvailableParentRolesApi = async (excludeId?: string) => {
  const queryParams = new URLSearchParams();
  if (excludeId) queryParams.append('exclude', excludeId);
  const queryString = queryParams.toString();
  const url = `api/v3/users/roles/available-parents${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getChildRolesApi = async () => axios.get('api/v3/users/roles/available-children');

// Removed getAvailablePermissionsApi - now using global PERMISSIONS constant directly

export const getPermissionsApi = async (category?: string) => {
  const queryParams = new URLSearchParams();
  if (category) queryParams.append('category', category);
  const queryString = queryParams.toString();
  const url = `api/v3/users/permissions${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getLoginHistoriesApi = async (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `api/v3/users/histories${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getOnlineUsersApi = async () => axios.get('api/v3/users/sessions');

export const logoutAllSessionsApi = async () => axios.delete('api/v3/users/sessions/all');

export const logoutUserSessionsApi = async (userId: string) =>
  axios.delete(`api/v3/users/sessions/user/${userId}`);

// premium
export const getPremiumDetailsApi = async () => axios.get('api/v3/users/premium/details');
export const updatePremiumDetailsApi = async (premiumDuration: number, premiumPrice: number) => axios.put('api/v3/users/premium/update', { premiumDuration, premiumPrice });

// referral settings
export const getReferralSettingsApi = async () => axios.get('api/v3/users/referral-settings/details');
export const updateReferralSettingsApi = async (commissionRate: number) => axios.put('api/v3/users/referral-settings/update', { commissionRate });

export const getTransferSettingsApi = async () => axios.get('api/v3/users/transfer-settings/details');
export const updateTransferSettingsApi = async (data: {
  enabled: boolean;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
}) => axios.put('api/v3/users/transfer-settings/update', data);

// referral history
export const getReferralHistoriesApi = async (params?: { page?: number; limit?: number; search?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  const queryString = queryParams.toString();
  return axios.get(`api/v3/users/referral-history${queryString ? `?${queryString}` : ''}`);
};
export const getReferralStatsOverviewApi = async () => axios.get('api/v3/users/referral-history/stats');