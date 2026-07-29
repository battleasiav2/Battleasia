import axios from 'src/utils/axios';
import { INotificationPayload } from '../type';

export const getAdminNotificationsApi = async (params?: { page?: number; limit?: number; search?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v3/notifications${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const createNotificationAdminApi = async (data: INotificationPayload) =>
  axios.post('api/v3/notifications', data);


