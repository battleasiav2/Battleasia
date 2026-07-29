import axios from 'src/utils/axios';

export const getAdminDashboardStatsApi = async () =>
  axios.get('api/v3/dashboard');
