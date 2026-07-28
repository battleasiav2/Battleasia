import axios from 'src/utils/axios';

export const getSocialReportsApi = (params?: { page?: number; limit?: number; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.status) query.append('status', params.status);
  const qs = query.toString();
  return axios.get(`api/v2/social/reports${qs ? `?${qs}` : ''}`);
};

export const updateSocialReportApi = (id: string, data: { status?: string; adminNote?: string }) =>
  axios.patch(`api/v2/social/reports/${id}`, data);

export const getAdminReelsApi = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qs = query.toString();
  return axios.get(`api/v2/social/reels/admin${qs ? `?${qs}` : ''}`);
};

export const deleteReelApi = (id: string) => axios.delete(`api/v2/social/reels/${id}`);
