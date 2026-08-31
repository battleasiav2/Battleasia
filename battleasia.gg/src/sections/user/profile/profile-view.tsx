import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import { Box, Grid2 as Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';

const DEFAULT_AVATAR = '/assets/images/avatar/default-avatar.webp';
import { useSelector, useDispatch } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import type { IFeedItem, IMatchHistory, IActivityCard, IMostPlayedInfo } from 'src/types';
import { useApi, useImagePreloader, useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks';
import {
  UserPageShell,
  UserGlassCard,
  USER_COLORS,
} from 'src/layouts/user';

import { toast } from 'react-hot-toast';
import { CONFIG } from 'src/global-config';
import { userAction } from 'src/store/reducers/auth';
import { Iconify } from 'src/components/iconify';

import {
  ProfileBanner,
  ProfileSidebar,
  ProfileContent,
  ProfilePageSkeleton,
  FeedList,
  ProfileGamingStatsStrip,
  ProfileBadgesStrip,
  FollowListDialog,
  ProfileSocialExtras,
} from './components';
import { computeProfileGamingStats, mapApiFeedToItem } from './profile-stats-utils';
import { useMessagingHandler } from '../messages/use-messaging-settings';
import { MessagingProviderPicker } from '../messages/components';

// ----------------------------------------------------------------------

export const PROFILE_IMAGE_PATHS = {
  war2: '/assets/images/War2.webp',
  blackBg: '/assets/images/black_bg.webp',
  coin: CONFIG.currencyIcon,
  game: '/assets/images/game.webp',
} as const;

export function ProfileView() {
  const { t } = useTranslate();
  const { userId } = useParams();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { getMatchHistoryApi, getUserByIdApi, followUserApi, unfollowUserApi, updateProfileApi, getUserFeedsApi } = useApi();
  const {
    hasActiveMessaging,
    startMessaging,
    pickerOpen,
    setPickerOpen,
    pickerProviders,
    pickerContext,
    handleSelectBuiltin,
  } = useMessagingHandler();

  const [stats, setStats] = useState({ gamesPlayed: 0, totalKills: 0, wins: 0, winRate: 0 });
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activities, setActivities] = useState<IActivityCard[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [feeds, setFeeds] = useState<IFeedItem[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(false);
  const [followListMode, setFollowListMode] = useState<'followers' | 'following' | null>(null);

  const isOwnProfile = !userId || userId === user?._id;
  const displayUser = isOwnProfile ? user : viewingUser;

  const { isLoaded } = useImagePreloader([PROFILE_IMAGE_PATHS.coin], {
    delay: 300,
    continueOnError: true,
  });

  const fetchProfileStats = async () => {
    if (!user?._id) {
      setStats({ gamesPlayed: 0, totalKills: 0, wins: 0, winRate: 0 });
      return;
    }

    setStatsLoading(true);
    try {
      const response = await getMatchHistoryApi();
      if (!response?.data) return;

      const history: IMatchHistory[] = response.data.data;
      setStats(computeProfileGamingStats(history));

      const counts = history.reduce<Record<string, { count: number; record: any }>>((acc, record) => {
        const game = record?.gameName || record?.matchName || t('common.unknownGame');
        if (!acc[game]) acc[game] = { count: 0, record };
        acc[game].count += 1;
        return acc;
      }, {});

      let mostPlayed: IMostPlayedInfo | undefined;
      Object.entries(counts).forEach(([title, info]) => {
        if (!mostPlayed || info.count > mostPlayed.count) {
          mostPlayed = { title, record: info.record, count: info.count };
        }
      });

      const lastPlayed = history
        .map((record) => {
          const date = record?.joinedAt || null;
          const timestamp = date ? new Date(date).getTime() : 0;
          return { record, timestamp, date };
        })
        .filter((item) => item.timestamp > 0)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      const activityList: IActivityCard[] = [];

      if (mostPlayed) {
        activityList.push({
          title: mostPlayed.title,
          subtitle: t('profile.mostPlayed'),
          image: getImageUrl(mostPlayed.record?.banner),
          icon: 'solar:heart-bold',
        });
      }

      if (lastPlayed) {
        const game = lastPlayed.record?.gameName || lastPlayed.record?.matchName || t('common.unknownGame');
        activityList.push({
          title: game,
          subtitle: lastPlayed.date ? `${t('profile.lastPlayed')} ${fDateTime(lastPlayed.date)}` : t('profile.lastPlayed'),
          image: getImageUrl(lastPlayed.record?.banner),
          icon: 'solar:clock-circle-bold',
        });
      }

      setActivities(activityList);
    } catch (error: any) {
      console.error('Failed to load profile stats', error);
      setStats({ gamesPlayed: 0, totalKills: 0, wins: 0, winRate: 0 });
      setActivities([]);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnProfile) fetchProfileStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getMatchHistoryApi, isLoggedIn, isOwnProfile]);

  useLiveSync(
    useCallback(() => {
      if (isOwnProfile) void fetchProfileStats();
    }, [isOwnProfile]),
    LIVE_SYNC_TOPICS.profile
  );

  const fetchUserProfile = useCallback(async () => {
    if (!userId || isOwnProfile) return;
    try {
      const response = await getUserByIdApi(userId);
      if (response?.data?.status && response.data.data) {
        const userData = response.data.data;
        setViewingUser(userData);
        setIsFollowing(userData.isFollowing || false);
        setFollowersCount(userData.followers || 0);
        setFollowingCount(userData.following || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, [userId, isOwnProfile, getUserByIdApi]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchUserFeeds = useCallback(async () => {
    const targetUserId = isOwnProfile ? user?._id : userId;
    if (!targetUserId) return;

    try {
      setFeedsLoading(true);
      const response = await getUserFeedsApi(targetUserId, { page: 1, limit: 100 });
      if (response?.data?.status && response.data.data?.results) {
        setFeeds(response.data.data.results.map(mapApiFeedToItem));
      } else {
        setFeeds([]);
      }
    } catch (error) {
      console.error('Failed to fetch user feeds:', error);
      setFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  }, [getUserFeedsApi, isOwnProfile, user?._id, userId]);

  useEffect(() => {
    fetchUserFeeds();
  }, [fetchUserFeeds]);

  const handleFollow = useCallback(async () => {
    if (!userId || followLoading) return;
    try {
      setFollowLoading(true);
      const response = await followUserApi(userId);
      if (response?.data?.status) {
        setIsFollowing(true);
        setFollowersCount(response.data.data?.followers || followersCount + 1);
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setFollowLoading(false);
    }
  }, [userId, followLoading, followUserApi, followersCount]);

  const handleUnfollow = useCallback(async () => {
    if (!userId || followLoading) return;
    try {
      setFollowLoading(true);
      const response = await unfollowUserApi(userId);
      if (response?.data?.status) {
        setIsFollowing(false);
        setFollowersCount(response.data.data?.followers || Math.max(0, followersCount - 1));
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setFollowLoading(false);
    }
  }, [userId, followLoading, unfollowUserApi, followersCount]);

  const handleAvatarSelect = useCallback(async (file: File) => {
    if (!file) return;

    setPendingAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const response = await updateProfileApi({
        username: user?.username || '',
        email: user?.email || '',
        avatar: base64,
      });
      const responseData = response?.data;

      if (responseData?.status) {
        dispatch(userAction({ avatar: base64 }));
        toast.success(t('profile.avatarUpdatedSuccess') || 'Avatar updated successfully!');
      } else {
        throw new Error(responseData?.message || 'Failed to update avatar');
      }
    } catch (error: any) {
      console.error('Failed to save avatar:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update avatar');
    } finally {
      setPendingAvatarFile(null);
      setAvatarPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [updateProfileApi, user?.username, user?.email, dispatch, t]);

  const clearPendingAvatar = useCallback(() => {
    setPendingAvatarFile(null);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(
    () => () => {
      setAvatarPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
    },
    []
  );

  if (!isLoaded || !isLoggedIn) {
    return (
      <UserPageShell>
        <ProfilePageSkeleton />
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <ProfileBanner
        username={displayUser?.username || 'Guest'}
        avatar={isOwnProfile ? (avatarPreview || user?.avatar || DEFAULT_AVATAR) : (displayUser?.avatar || DEFAULT_AVATAR)}
        avatarPending={!!pendingAvatarFile}
        onSelectAvatar={handleAvatarSelect}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        followLoading={followLoading}
        profileUserId={userId || viewingUser?._id}
        canMessage={!isOwnProfile && !!userId && hasActiveMessaging}
        onMessage={() =>
          startMessaging({
            userId: userId!,
            username: displayUser?.username,
          })
        }
        role={displayUser?.role}
        isPremium={displayUser?.isPremium}
        isBlocked={Boolean(viewingUser?.isBlocked)}
      />

      {isOwnProfile ? <ProfileGamingStatsStrip stats={stats} loading={statsLoading} /> : null}

      {isOwnProfile ? <ProfileBadgesStrip isOwnProfile userId={userId || user?._id} /> : null}

      <ProfileSocialExtras
        profileUserId={userId || user?._id || ''}
        isOwnProfile={isOwnProfile}
        isLoggedIn={isLoggedIn}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ProfileSidebar
            activities={isOwnProfile ? activities : []}
            followers={isOwnProfile ? (user?.followers || 0) : followersCount}
            following={isOwnProfile ? (user?.following || 0) : followingCount}
            userId={userId || user?._id}
            hideBalance={!isOwnProfile}
            onFollowersClick={() => setFollowListMode('followers')}
            onFollowingClick={() => setFollowListMode('following')}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          {isOwnProfile ? (
            <ProfileContent pendingAvatarFile={pendingAvatarFile} onAvatarSaved={clearPendingAvatar} />
          ) : (
            <UserGlassCard sx={{ p: { xs: 3, md: 4 }, minHeight: 280 }}>
              <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(USER_COLORS.gold, 0.1),
                    border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
                    color: USER_COLORS.gold,
                  }}
                >
                  <Iconify icon="solar:user-bold-duotone" width={36} />
                </Box>
                <Box>
                  <Typography className="font-tr" sx={{ fontSize: 22, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.textPrimary }}>
                    {displayUser?.username}
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 14, color: USER_COLORS.textMuted, maxWidth: 420 }}>
                    {t('profile.viewingProfile', { username: displayUser?.username })}
                  </Typography>
                </Box>
              </Stack>
            </UserGlassCard>
          )}
        </Grid>
      </Grid>

      {isOwnProfile ? <FeedList feeds={feeds} loading={feedsLoading} /> : null}

      <FollowListDialog
        open={Boolean(followListMode)}
        onClose={() => setFollowListMode(null)}
        userId={userId || user?._id || ''}
        mode={followListMode || 'followers'}
      />

      <MessagingProviderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        providers={pickerProviders}
        username={pickerContext.username}
        onSelectBuiltin={handleSelectBuiltin}
      />
    </UserPageShell>
  );
}
