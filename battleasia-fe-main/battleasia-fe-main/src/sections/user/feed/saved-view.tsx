import { useCallback, useEffect, useState } from 'react';

import { Grid2 as Grid, Stack } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { UserPageShell, UserPageTitle, UserEmptyState } from 'src/layouts/user';

import { FeedCard } from './components';
import { mapApiFeedToItem, type FeedItem } from './feed-types';

// ----------------------------------------------------------------------

export function SavedFeedsView({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslate();
  const { getSavedFeedsApi, toggleFeedLikeApi, toggleSaveFeedApi } = useApi();
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSavedFeedsApi({ limit: 100 });
      const results = response?.data?.data?.results;
      setFeeds(Array.isArray(results) ? results.map(mapApiFeedToItem) : []);
    } catch (error) {
      console.error('Failed to load saved feeds:', error);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  }, [getSavedFeedsApi]);

  useEffect(() => {
    void fetchSaved();
  }, [fetchSaved]);

  const handleLike = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    try {
      const response = await toggleFeedLikeApi(feedId);
      if (response?.data?.status) {
        setFeeds((prev) =>
          prev.map((feed) =>
            feed.id === feedId
              ? { ...feed, isLiked: response.data.data.isLiked, totalLikes: response.data.data.totalLikes }
              : feed
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    try {
      const response = await toggleSaveFeedApi(feedId);
      if (response?.data?.status) {
        if (!response.data.data.isSaved) {
          setFeeds((prev) => prev.filter((feed) => feed.id !== feedId));
        } else {
          setFeeds((prev) =>
            prev.map((feed) => (feed.id === feedId ? { ...feed, isSaved: true } : feed))
          );
        }
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const content =
    loading ? (
      <UserEmptyState icon="solar:bookmark-bold-duotone" title={t('common.loading')} sx={{ minHeight: 280 }} />
    ) : feeds.length === 0 ? (
      <UserEmptyState
        icon="solar:bookmark-bold-duotone"
        title={t('saved.emptyTitle')}
        description={t('saved.emptyDescription')}
      />
    ) : (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {feeds.map((feed) => (
            <Grid key={feed.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeedCard feed={feed} publishedAtLabel="" onLike={handleLike} onSave={handleSave} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );

  if (embedded) return content;

  return (
    <UserPageShell contentSx={{ maxWidth: 1100, mx: 'auto' }}>
      <UserPageTitle badge={t('saved.badge')} title={t('saved.title')} subtitle={t('saved.subtitle')} />
      {content}
    </UserPageShell>
  );
}
