import axios from 'src/utils/axios';

export type ProfileSocialSettingsPayload = {
  showMutualFollowers?: boolean;
  showSuggestedFollows?: boolean;
  showRecentFollows?: boolean;
  autoSuggestEnabled?: boolean;
  suggestedLimit?: number;
  mutualFollowersLimit?: number;
  recentFollowsLimit?: number;
  pinnedUserIds?: string[];
};

export const getProfileSocialSettingsApi = () => axios.get('api/v2/social/profile-social-settings');

export const updateProfileSocialSettingsApi = (data: ProfileSocialSettingsPayload) =>
  axios.put('api/v2/social/profile-social-settings', data);
