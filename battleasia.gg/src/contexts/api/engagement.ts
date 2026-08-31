import axios from 'src/lib/axios';

export const getEngagementHomeApi = () => axios.get('api/v2/engagement/home');

export const getEngagementAlertsApi = () => axios.get('api/v2/engagement/alerts');

export const claimEngagementRewardApi = (progressId: string) =>
  axios.post(`api/v2/engagement/claim/${progressId}`);

export const claimEngagementStreakApi = () => axios.post('api/v2/engagement/streak/claim');

export const claimWelcomeBonusApi = (key: string) => axios.post(`api/v2/engagement/welcome/claim/${key}`);

export const claimReferralMilestoneApi = (key: string) =>
  axios.post(`api/v2/engagement/referral/claim/${key}`);

export const claimWeeklyArenaApi = () => axios.post('api/v2/engagement/weekly/claim');

export const createEngagementSquadApi = (name: string) =>
  axios.post('api/v2/engagement/squad/create', { name });

export const joinEngagementSquadApi = (inviteCode: string) =>
  axios.post('api/v2/engagement/squad/join', { inviteCode });

export const leaveEngagementSquadApi = () => axios.post('api/v2/engagement/squad/leave');

export const claimSquadChallengeApi = () => axios.post('api/v2/engagement/squad/claim');

export const claimSeasonPassRewardApi = (level: number, track: 'free' | 'plus') =>
  axios.post('api/v2/engagement/season/claim', { level, track });

export const getShareStatusApi = (matchId: string) => axios.get(`api/v2/engagement/share/${matchId}`);

export const claimShareRewardApi = (matchId: string, platform = 'native') =>
  axios.post('api/v2/engagement/share/claim', { matchId, platform });

export const getLuckySpinStatusApi = () => axios.get('api/v2/engagement/spin');

export const spinLuckySpinApi = () => axios.post('api/v2/engagement/spin');

export const getEngagementBadgesApi = () => axios.get('api/v2/engagement/badges');

export const getUserEngagementBadgesApi = (userId: string) =>
  axios.get(`api/v2/engagement/badges/user/${userId}`);
