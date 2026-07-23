import { Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
} from 'src/layouts/user';

import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import type { IFeedItem } from 'src/types';

import { FeedCard } from './feed-card';

// ----------------------------------------------------------------------

type FeedListProps = {
  feeds: IFeedItem[];
  loading: boolean;
};

const postsTitleSx = {
  mb: 2.5,
  fontWeight: 800,
  color: USER_COLORS.textPrimary,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
};

function FeedListSkeleton() {
  return (
    <Stack spacing={2}>
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={220}
          sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }}
        />
      ))}
    </Stack>
  );
}

export function FeedList({ feeds, loading }: FeedListProps) {
  const { t } = useTranslate();

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
      <Typography className="font-tr" variant="h6" sx={postsTitleSx}>
        {t('profile.posts')}
      </Typography>

      {loading ? (
        <FeedListSkeleton />
      ) : feeds.length === 0 ? (
        <UserEmptyState
          icon="solar:document-text-bold-duotone"
          title={t('profile.noPostsYet') || t('feed.noPosts') || 'No posts yet'}
          description={t('profile.noPostsDescription') || 'Published posts from this player will appear here.'}
          sx={{ py: 5, border: 'none', bgcolor: 'transparent' }}
        />
      ) : (
        <Stack spacing={2}>
          {feeds.map((feed) => (
            <FeedCard key={feed.id} feed={feed} />
          ))}
        </Stack>
      )}
    </UserGlassCard>
  );
}
