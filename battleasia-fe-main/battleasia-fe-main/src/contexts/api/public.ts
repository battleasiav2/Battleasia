import axios from 'src/lib/axios';

export const getPublicDashboardStatsApi = () => axios.get('api/v3/public/dashboard');

