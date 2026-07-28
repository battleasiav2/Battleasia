import { Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
} from 'src/layouts/user';

import type { IFeedItem } from 'src/types';

import { ProfilePostsGrid, ProfilePostsGridSkeleton } from './profile-posts-grid';

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

export function FeedList({ feeds, loading }: FeedListProps) {
  const { t } = useTranslate();

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
      <Typography className="font-tr" variant="h6" sx={postsTitleSx}>
        {t('profile.posts')}
      </Typography>

      {loading ? (
        <ProfilePostsGridSkeleton />
      ) : feeds.length === 0 ? (
        <UserEmptyState
          icon="solar:gallery-bold-duotone"
          title={t('profile.noPostsYet') || t('feed.noPosts') || 'No posts yet'}
          description={t('profile.noPostsDescription') || 'Published posts from this player will appear here.'}
          sx={{ py: 5, border: 'none', bgcolor: 'transparent' }}
        />
      ) : (
        <ProfilePostsGrid feeds={feeds} />
      )}
    </UserGlassCard>
  );
}
