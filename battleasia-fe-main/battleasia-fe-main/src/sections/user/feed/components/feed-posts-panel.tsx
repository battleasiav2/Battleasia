import { useState, useEffect, useCallback, useMemo } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';

import useApi from 'src/hooks/use-api';

import { ScrollReveal } from 'src/components/animate';
import { PlayTabs } from 'src/components/play-tabs';
import { useTranslate } from 'src/locales/use-locales';
import {
  homeMobileScrollGridSx,
  homeMobileScrollItemSx,
} from 'src/sections/home/home-horizontal-scroll';
import {
  UserStatTile,
  UserEmptyState,
  UserAnimatedStat,
  USER_COLORS,
} from 'src/layouts/user';

import { FeedCard } from './feed-card';
import { FeedPageSkeleton } from './feed-page-skeleton';
import { FeedComposer } from './feed-composer';
import { StoriesBar } from './stories-bar';
import {
  applyFeedFilter,
  mapApiFeedToItem,
  type FeedCategory,
  type FeedItem,
  type FeedSortBy,
} from '../feed-types';

// ----------------------------------------------------------------------

type FeedMode = 'all' | 'following' | 'trending' | 'latest' | 'recommended';

export function FeedPostsPanel() {
  const { t } = useTranslate();
  const { getFeedsApi, getCategoriesApi, toggleFeedLikeApi, toggleSaveFeedApi } = useApi();
  const [feedMode, setFeedMode] = useState<FeedMode>('all');
  const [sortBy, setSortBy] = useState<FeedSortBy>('latest');
  const [categoryTab, setCategoryTab] = useState('all');
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
        setFetchError(null);
      } else {
        setFeeds([]);
        setFetchError(t('feed.loadFailed'));
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setFeeds([]);
      setFetchError(t('feed.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [categoryTab, sortBy, feedMode, getFeedsApi, t]);

  useEffect(() => {
    void fetchFeeds();
  }, [fetchFeeds]);

  const handleSave = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    try {
      const response = await toggleSaveFeedApi(feedId);
      if (response?.data?.status) {
        setFeeds((prevFeeds) =>
          prevFeeds.map((feed) =>
            feed.id === feedId ? { ...feed, isSaved: response.data.data.isSaved } : feed
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

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

  const feedModeTabs = [
    { value: 'all', label: t('feed.allBlogs') },
    { value: 'following', label: t('feed.following') },
    { value: 'trending', label: t('feed.trending') },
    { value: 'latest', label: t('feed.latest') },
    { value: 'recommended', label: t('feed.recommended') },
  ];

  const categoryTabs = [
    { value: 'all', label: t('feed.allBlogs') },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const showInitialSkeleton = loading && feeds.length === 0;

  if (showInitialSkeleton) {
    return <FeedPageSkeleton />;
  }

  return (
    <Stack spacing={3}>
      <ScrollReveal direction="inUp" amount={0.12}>
        <StoriesBar />
      </ScrollReveal>

      <ScrollReveal direction="inUp" amount={0.12}>
        <FeedComposer onPosted={fetchFeeds} />
      </ScrollReveal>

      <ScrollReveal direction="inUp" amount={0.1}>
        <Box
          sx={homeMobileScrollGridSx(
            {
              xs: 'repeat(3, minmax(148px, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            { xs: 1.25, md: 1.5 }
          )}
        >
          <Box sx={{ ...homeMobileScrollItemSx, minWidth: { xs: 148, md: 0 } }}>
            <UserStatTile
              label={t('feed.posts')}
              value={<UserAnimatedStat value={stats.total} variant="h5" fontWeight={700} />}
              loading={loading}
            />
          </Box>
          <Box sx={{ ...homeMobileScrollItemSx, minWidth: { xs: 148, md: 0 } }}>
            <UserStatTile
              label={t('feed.totalLikes')}
              value={<UserAnimatedStat value={stats.likes} variant="h5" fontWeight={700} />}
              loading={loading}
            />
          </Box>
          <Box sx={{ ...homeMobileScrollItemSx, minWidth: { xs: 148, md: 0 } }}>
            <UserStatTile
              label={t('feed.totalViews')}
              value={<UserAnimatedStat value={stats.views} variant="h5" fontWeight={700} />}
              loading={loading}
            />
          </Box>
        </Box>
      </ScrollReveal>

      <Box
        sx={{
          py: 1,
          borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
        }}
      >
        <Stack spacing={1.25}>
          <Box sx={{ '& .MuiStack-root': { mb: '0 !important' } }}>
            <PlayTabs
              tabs={feedModeTabs}
              activeTab={feedMode}
              onChange={(value) => {
                setFeedMode(value as FeedMode);
                if (value === 'trending') setSortBy('popular');
                if (value === 'latest') setSortBy('latest');
              }}
            />
          </Box>
          {categoriesLoading ? (
            <Skeleton variant="rounded" height={44} sx={{ bgcolor: alpha('#ffffff', 0.04), borderRadius: 0 }} />
          ) : (
            <Box sx={{ '& .MuiStack-root': { mb: '0 !important' } }}>
              <PlayTabs tabs={categoryTabs} activeTab={categoryTab} onChange={setCategoryTab} />
            </Box>
          )}
        </Stack>
      </Box>

      {loading ? (
        <FeedPageSkeleton hideStats />
      ) : dataFiltered.length === 0 ? (
        <UserEmptyState
          icon="solar:document-text-bold-duotone"
          title={fetchError || t('feed.noPosts')}
          description={fetchError ? t('feed.loadFailedHint') : t('feed.emptyDescription')}
          actionLabel={t('common.refresh')}
          onAction={fetchFeeds}
        />
      ) : (
        <Grid container spacing={2}>
          {dataFiltered.map((feed) => (
            <Grid key={feed.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ScrollReveal direction="inUp" amount={0.08}>
                <FeedCard
                  feed={feed}
                  publishedAtLabel={t('feed.publishedAt')}
                  onLike={handleLike}
                  onSave={handleSave}
                />
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
