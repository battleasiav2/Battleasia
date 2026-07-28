import { useParams, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import { Grid2 as Grid, Stack } from '@mui/material';

import { fDateTime } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';

import { _mock } from 'src/_mock';
import { useSelector } from 'src/store';
import type { IFeedItem, IPublicUser, IMatchHistory, IActivityCard, IMostPlayedInfo } from 'src/types';
import { useApi } from 'src/hooks';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserPageTitle,
  UserEmptyState,
  UserBackButton,
} from 'src/layouts/user';

import { FeedList, ProfileInfo, ProfileBanner, ProfileSidebar, ProfilePageSkeleton, ProfileGamingStatsStrip, FollowListDialog, ProfileSocialExtras } from './components';
import { computeProfileGamingStats, mapApiFeedToItem } from './profile-stats-utils';
import { useMessagingHandler } from '../messages/use-messaging-settings';
import { MessagingProviderPicker } from '../messages/components';

// ----------------------------------------------------------------------

export function PublicProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const { getUserByIdApi, followUserApi, unfollowUserApi, getUserMatchHistoryApi, getUserFeedsApi } = useApi();
  const {
    hasActiveMessaging,
    startMessaging,
    pickerOpen,
    setPickerOpen,
    pickerProviders,
    pickerContext,
    handleSelectBuiltin,
  } = useMessagingHandler();
  const [viewingUser, setViewingUser] = useState<IPublicUser | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalKills: 0,
    wins: 0,
    winRate: 0,
  });
  const [activities, setActivities] = useState<IActivityCard[]>([]);
  const [feeds, setFeeds] = useState<IFeedItem[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(false);
  const [followListMode, setFollowListMode] = useState<'followers' | 'following' | null>(null);

  const isOwnProfile = isLoggedIn && userId === user?._id;

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getUserByIdApi(userId);
      if (response?.data?.status && response.data.data) {
        const userData = response.data.data;
        setViewingUser(userData);
        if (isLoggedIn) {
          setIsFollowing(userData.isFollowing || false);
        }
        setFollowersCount(userData.followers || 0);
        setFollowingCount(userData.following || 0);
      } else {
        setViewingUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setViewingUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId, getUserByIdApi, isLoggedIn]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchProfileStats = useCallback(async () => {
    if (!userId) return;

    try {
      setStatsLoading(true);
      const response = await getUserMatchHistoryApi(userId);
      if (response?.data?.status && response.data.data) {
        const history: IMatchHistory[] = response.data.data;
        setStats(computeProfileGamingStats(history));

        const counts = history.reduce<
          Record<string, { count: number; record: any }>
        >((acc, record) => {
          const game = record?.gameName || record?.matchName || 'Unknown Game';
          if (!acc[game]) {
            acc[game] = { count: 0, record };
          }
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
          const banner = mostPlayed.record?.banner;
          activityList.push({
            title: mostPlayed.title,
            subtitle: t('profile.mostPlayed'),
            image: getImageUrl(banner),
            icon: 'solar:heart-bold',
          });
        }

        if (lastPlayed) {
          const banner = lastPlayed.record?.banner;
          const game = lastPlayed.record?.gameName || lastPlayed.record?.matchName || 'Unknown Game';
          activityList.push({
            title: game,
            subtitle: lastPlayed.date ? `${t('profile.lastPlayed')} ${fDateTime(lastPlayed.date)}` : t('profile.lastPlayed'),
            image: getImageUrl(banner),
            icon: 'solar:clock-circle-bold',
          });
        }

        setActivities(activityList);
      }
    } catch (error: any) {
      console.error('Failed to load profile stats', error);
    } finally {
      setStatsLoading(false);
    }
  }, [userId, getUserMatchHistoryApi, t]);

  useEffect(() => {
    fetchProfileStats();
  }, [fetchProfileStats]);

  const fetchUserFeeds = useCallback(async () => {
    if (!userId) return;

    try {
      setFeedsLoading(true);
      const response = await getUserFeedsApi(userId, { page: 1, limit: 100 });
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
  }, [userId, getUserFeedsApi]);

  useEffect(() => {
    fetchUserFeeds();
  }, [fetchUserFeeds]);

  const handleFollow = useCallback(async () => {
    if (!viewingUser?._id || !isLoggedIn || followLoading) return;

    try {
      setFollowLoading(true);
      const response = await followUserApi(viewingUser._id);
      if (response?.data?.status) {
        setIsFollowing(true);
        setFollowersCount(response.data.data?.followers || followersCount + 1);
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setFollowLoading(false);
    }
  }, [viewingUser?._id, isLoggedIn, followLoading, followUserApi, followersCount]);

  const handleUnfollow = useCallback(async () => {
    if (!viewingUser?._id || !isLoggedIn || followLoading) return;

    try {
      setFollowLoading(true);
      const response = await unfollowUserApi(viewingUser._id);
      if (response?.data?.status) {
        setIsFollowing(false);
        setFollowersCount(response.data.data?.followers || Math.max(0, followersCount - 1));
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setFollowLoading(false);
    }
  }, [viewingUser?._id, isLoggedIn, followLoading, unfollowUserApi, followersCount]);

  if (loading) {
    return (
      <UserPageShell>
        <ProfilePageSkeleton />
      </UserPageShell>
    );
  }

  if (!viewingUser) {
    return (
      <UserPageShell>
        <Stack spacing={2}>
          <UserBackButton onClick={() => navigate(-1)} label={t('common.back') || 'Back'} />
          <UserEmptyState
            icon="solar:user-cross-bold-duotone"
            title={t('profile.userNotFound') || 'User not found'}
            description={t('profile.userNotFoundDescription') || 'This profile may have been removed or the link is invalid.'}
            actionLabel={t('footer.home') || 'Home'}
            onAction={() => navigate('/')}
          />
        </Stack>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <Stack spacing={0} sx={{ mb: 2 }}>
        <UserBackButton onClick={() => navigate(-1)} label={t('common.back') || 'Back'} />
      </Stack>

      <ProfileBanner
        username={viewingUser?.username || 'Guest'}
        avatar={viewingUser?.avatar || _mock.image.avatar(1)}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        followLoading={followLoading}
        profileUserId={viewingUser?._id}
        canMessage={isLoggedIn && !isOwnProfile && hasActiveMessaging}
        onMessage={() =>
          startMessaging({
            userId: viewingUser!._id,
            username: viewingUser?.username,
          })
        }
        role={viewingUser?.role}
        isPremium={viewingUser?.isPremium}
        isBlocked={Boolean(viewingUser?.isBlocked)}
        onBlockChange={() => void fetchUserProfile()}
      />

      <UserPageTitle
        badge={t('profile.publicProfile')}
        title={viewingUser?.username || t('profile.title')}
        subtitle={t('profile.viewingProfile', { username: viewingUser?.username })}
      />

      <ProfileGamingStatsStrip stats={stats} loading={statsLoading} />

      <ProfileSocialExtras
        profileUserId={viewingUser!._id}
        isOwnProfile={isOwnProfile}
        isLoggedIn={isLoggedIn}
        onFollowChange={() => void fetchUserProfile()}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ProfileSidebar
            activities={activities}
            followers={followersCount}
            following={followingCount}
            userId={userId}
            hideBalance
            onFollowersClick={isLoggedIn ? () => setFollowListMode('followers') : undefined}
            onFollowingClick={isLoggedIn ? () => setFollowListMode('following') : undefined}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={0}>
            <ProfileInfo
              viewingUser={viewingUser}
              isOwnProfile={isOwnProfile}
              isLoggedIn={isLoggedIn}
            />

            <FeedList feeds={feeds} loading={feedsLoading} />
          </Stack>
        </Grid>
      </Grid>

      <FollowListDialog
        open={Boolean(followListMode)}
        onClose={() => setFollowListMode(null)}
        userId={viewingUser?._id || userId || ''}
        mode={followListMode || 'followers'}
        onFollowChange={() => void fetchUserProfile()}
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
