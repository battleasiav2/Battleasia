import axios from 'src/utils/axios';

export type IEngagementMissionData = {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  type: 'daily' | 'weekly' | 'one_time' | 'event';
  action:
    | 'daily_login'
    | 'join_match'
    | 'win_match'
    | 'get_kills'
    | 'complete_profile'
    | 'first_deposit'
    | 'refer_user'
    | 'manual';
  targetCount: number;
  reward: { bacAmount: number; label?: string };
  active?: boolean;
  inDailyPool?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  gameId?: string | null;
};

export type IEngagementSettingsData = {
  enabled?: boolean;
  streakEnabled?: boolean;
  badgesEnabled?: boolean;
  dailyLoginReward?: number;
  streakBonusPerDay?: number;
  maxStreakBonus?: number;
  welcomeBonus?: number;
  firstMatchBonus?: number;
  earnTabTitle?: string;
  earnTabSubtitle?: string;
};

export const getEngagementMissionsApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v3/engagement/missions${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getEngagementMissionByIdApi = async (id: string) =>
  axios.get(`api/v3/engagement/missions/${id}`);

export const createEngagementMissionApi = async (data: IEngagementMissionData) =>
  axios.post('api/v3/engagement/missions', data);

export const updateEngagementMissionApi = async (id: string, data: Partial<IEngagementMissionData>) =>
  axios.put(`api/v3/engagement/missions/${id}`, data);

export const deleteEngagementMissionApi = async (id: string) =>
  axios.delete(`api/v3/engagement/missions/${id}`);

export const getEngagementSettingsApi = async () => axios.get('api/v3/engagement/settings');

export const updateEngagementSettingsApi = async (data: IEngagementSettingsData) =>
  axios.put('api/v3/engagement/settings', data);

export type IEngagementBadgeData = {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  criteria: 'total_kills' | 'total_wins';
  threshold: number;
  tier?: number;
  active?: boolean;
  sortOrder?: number;
  gameId?: string | null;
};

export const getEngagementBadgesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v3/engagement/badges${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getEngagementBadgeByIdApi = async (id: string) =>
  axios.get(`api/v3/engagement/badges/${id}`);

export const createEngagementBadgeApi = async (data: IEngagementBadgeData) =>
  axios.post('api/v3/engagement/badges', data);

export const updateEngagementBadgeApi = async (id: string, data: Partial<IEngagementBadgeData>) =>
  axios.put(`api/v3/engagement/badges/${id}`, data);

export const deleteEngagementBadgeApi = async (id: string) =>
  axios.delete(`api/v3/engagement/badges/${id}`);
