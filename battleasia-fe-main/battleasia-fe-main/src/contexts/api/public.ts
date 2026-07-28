import axios from 'src/lib/axios';

/** Absolute path — avoids resolving against /dashboard as a relative URL. */
export const getPublicDashboardStatsApi = () => axios.get('/api/v3/public/dashboard');

export const getAppDownloadSettingsApi = () => axios.get('/api/v2/app-settings/app-download');

