export type FollowUserItem = {
  id: string;
  username: string;
  avatar: string;
  role?: string;
  isFollowing?: boolean;
  followedAt?: string;
};

export type ProfileSocialSettings = {
  showMutualFollowers: boolean;
  showSuggestedFollows: boolean;
  showRecentFollows: boolean;
  autoSuggestEnabled: boolean;
  suggestedLimit: number;
  mutualFollowersLimit: number;
  recentFollowsLimit: number;
  pinnedUserIds: string[];
};

export const mapFollowUser = (raw: any): FollowUserItem => ({
  id: raw?.id || raw?._id || '',
  username: raw?.username || 'User',
  avatar: raw?.avatar || '',
  role: raw?.role || 'Player',
  isFollowing: raw?.isFollowing,
  followedAt: raw?.followedAt,
});

export const mapProfileSocialSettings = (raw: any): ProfileSocialSettings => ({
  showMutualFollowers: raw?.showMutualFollowers !== false,
  showSuggestedFollows: raw?.showSuggestedFollows !== false,
  showRecentFollows: raw?.showRecentFollows !== false,
  autoSuggestEnabled: raw?.autoSuggestEnabled !== false,
  suggestedLimit: Number(raw?.suggestedLimit) || 8,
  mutualFollowersLimit: Number(raw?.mutualFollowersLimit) || 3,
  recentFollowsLimit: Number(raw?.recentFollowsLimit) || 6,
  pinnedUserIds: Array.isArray(raw?.pinnedUserIds) ? raw.pinnedUserIds : [],
});
