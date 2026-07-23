import { useState, useEffect, useCallback, useMemo } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';

import useApi from 'src/hooks/use-api';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserPageTitle,
  UserStatTile,
  UserEmptyState,
} from 'src/layouts/user';
import { USER_COLORS } from 'src/layouts/user/user-theme';

import { PlayTabs } from 'src/components/play-tabs';
import { UserAnimatedStat } from 'src/layouts/user';

import { FeedCard, FeedPageSkeleton, FeedComposer, StoriesBar } from './components';
import {
  applyFeedFilter,
  mapApiFeedToItem,
  type FeedCategory,
  type FeedItem,
  type FeedSortBy,
} from './feed-types';

// ----------------------------------------------------------------------

type FeedMode = 'all' | 'following' | 'trending' | 'latest' | 'recommended' | 'explore';

export function FeedView() {
  const { t } = useTranslate();
  const { getFeedsApi, getCategoriesApi, toggleFeedLikeApi, getExploreApi } = useApi();
  const [feedMode, setFeedMode] = useState<FeedMode>('all');
  const [sortBy, setSortBy] = useState<FeedSortBy>('latest');
  const [categoryTab, setCategoryTab] = useState('all');
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getCategoriesApi({ limit: 10000 });
        if (response?.data?.status && response.data.data?.results) {
          setCategories(response.data.data.results);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [getCategoriesApi]);

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);

      if (feedMode === 'explore') {
        const response = await getExploreApi({ limit: 30 });
        if (response?.data?.status && response.data.data?.trendingPosts) {
          setFeeds(response.data.data.trendingPosts.map(mapApiFeedToItem));
        } else {
          setFeeds([]);
        }
        return;
      }

      const effectiveSort: FeedSortBy =
        feedMode === 'trending' ? 'popular' : feedMode === 'latest' ? 'latest' : sortBy;

      const response = await getFeedsApi({
        status: 'published',
        categoryId: categoryTab !== 'all' ? categoryTab : undefined,
        sortBy: effectiveSort,
        feedMode: feedMode === 'all' ? undefined : feedMode,
        limit: 100,
      });

      if (response?.data?.status && response.data.data?.results) {
        setFeeds(response.data.data.results.map(mapApiFeedToItem));
      } else {
        setFeeds([]);
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  }, [categoryTab, sortBy, feedMode, getFeedsApi, getExploreApi]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const handleLike = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    try {
      const response = await toggleFeedLikeApi(feedId);
      if (response?.data?.status) {
        setFeeds((prevFeeds) =>
          prevFeeds.map((feed) =>
            feed.id === feedId
              ? {
                  ...feed,
                  isLiked: response.data.data.isLiked,
                  totalLikes: response.data.data.totalLikes,
                }
              : feed
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const dataFiltered = applyFeedFilter({ inputData: feeds, sortBy });

  const stats = useMemo(
    () => ({
      total: dataFiltered.length,
      likes: dataFiltered.reduce((sum, feed) => sum + (feed.totalLikes || 0), 0),
      views: dataFiltered.reduce((sum, feed) => sum + (feed.totalViews || 0), 0),
    }),
    [dataFiltered]
  );

  const handleCategoryTab = useCallback((newValue: string) => {
    setCategoryTab(newValue);
  }, []);

  const handleFeedModeTab = useCallback((newValue: string) => {
    setFeedMode(newValue as FeedMode);
    if (newValue === 'trending') setSortBy('popular');
    if (newValue === 'latest') setSortBy('latest');
  }, []);

  const feedModeTabs = [
    { value: 'all', label: t('feed.allBlogs') },
    { value: 'following', label: t('feed.following') },
    { value: 'trending', label: t('feed.trending') },
    { value: 'latest', label: t('feed.latest') },
    { value: 'recommended', label: t('feed.recommended') },
    { value: 'explore', label: t('feed.explore') },
  ];

  const categoryTabs = [
    { value: 'all', label: t('feed.allBlogs') },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const showInitialSkeleton = loading && feeds.length === 0;
  const showCategoryTabs = feedMode !== 'explore';

  return (
    <UserPageShell>
      <UserPageTitle
        badge={t('feed.badgeCommunity')}
        title={t('feed.title')}
        subtitle={t('feed.whatsNew')}
      />

      {showInitialSkeleton ? (
        <FeedPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <StoriesBar />
          <FeedComposer onPosted={fetchFeeds} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile
              label={t('feed.posts')}
              value={<UserAnimatedStat value={stats.total} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('feed.totalLikes')}
              value={<UserAnimatedStat value={stats.likes} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('feed.totalViews')}
              value={<UserAnimatedStat value={stats.views} variant="h5" fontWeight={700} />}
              loading={loading}
            />
          </Box>

          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              py: 1,
              mx: { xs: -2, sm: -3, md: -5 },
              px: { xs: 2, sm: 3, md: 5 },
              bgcolor: alpha('#000000', 0.82),
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${USER_COLORS.border}`,
            }}
          >
            <Stack spacing={1.5}>
              <Box sx={{ '& .MuiStack-root': { mb: '0 !important' } }}>
                <PlayTabs tabs={feedModeTabs} activeTab={feedMode} onChange={handleFeedModeTab} />
              </Box>
              {showCategoryTabs &&
                (categoriesLoading ? (
                  <Skeleton
                    variant="rounded"
                    height={44}
                    sx={{ bgcolor: alpha('#ffffff', 0.04), borderRadius: '4px' }}
                  />
                ) : (
                  <Box sx={{ '& .MuiStack-root': { mb: '0 !important' } }}>
                    <PlayTabs tabs={categoryTabs} activeTab={categoryTab} onChange={handleCategoryTab} />
                  </Box>
                ))}
            </Stack>
          </Box>

          {loading ? (
            <FeedPageSkeleton />
          ) : dataFiltered.length === 0 ? (
            <UserEmptyState
              icon="solar:document-text-bold-duotone"
              title={t('feed.noPosts')}
              description={t('feed.emptyDescription')}
              actionLabel={t('common.refresh')}
              onAction={fetchFeeds}
            />
          ) : (
            <Grid container spacing={2}>
              {dataFiltered.map((feed) => (
                <Grid key={feed.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <FeedCard
                    feed={feed}
                    publishedAtLabel={t('feed.publishedAt')}
                    onLike={handleLike}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
