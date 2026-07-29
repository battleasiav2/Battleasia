import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Avatar, Box, Chip, Grid2 as Grid, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { homeMobileScrollFlexRowSx } from 'src/sections/home/home-horizontal-scroll';

import { FeedCard } from './components';
import { mapApiFeedToItem, type FeedItem } from './feed-types';

// ----------------------------------------------------------------------

type ExploreCreator = {
  id: string;
  username: string;
  avatar: string;
  posts: number;
  likes: number;
};

type ExploreHashtag = {
  tag: string;
  count: number;
};

export function ExploreView({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { getExploreApi, toggleFeedLikeApi } = useApi();
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [creators, setCreators] = useState<ExploreCreator[]>([]);
  const [hashtags, setHashtags] = useState<ExploreHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExplore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getExploreApi({ limit: 30 });
      if (response?.data?.status && response.data.data) {
        setPosts((response.data.data.trendingPosts || []).map(mapApiFeedToItem));
        setCreators(response.data.data.recommendedCreators || []);
        setHashtags(response.data.data.trendingHashtags || []);
      } else {
        setPosts([]);
        setCreators([]);
        setHashtags([]);
      }
    } catch (error) {
      console.error('Failed to load explore:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [getExploreApi]);

  useEffect(() => {
    void fetchExplore();
  }, [fetchExplore]);

  const handleLike = async (e: React.MouseEvent, feedId: string) => {
    e.stopPropagation();
    try {
      const response = await toggleFeedLikeApi(feedId);
      if (response?.data?.status) {
        setPosts((prev) =>
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

  const content = loading ? (
    <UserEmptyState icon="solar:magnifer-bold-duotone" title={t('common.loading')} sx={{ minHeight: 280 }} />
  ) : (
    <Stack spacing={2.5}>
          {hashtags.length > 0 ? (
            <UserGlassCard sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 800, color: USER_COLORS.gold, textTransform: 'uppercase', mb: 1.5, fontSize: 13 }}>
                {t('explore.trendingHashtags')}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {hashtags.map((item) => (
                  <Chip
                    key={item.tag}
                    label={`#${item.tag} · ${item.count}`}
                    sx={{
                      bgcolor: alpha(USER_COLORS.gold, 0.1),
                      color: USER_COLORS.textPrimary,
                      border: `1px solid ${alpha(USER_COLORS.gold, 0.25)}`,
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Stack>
            </UserGlassCard>
          ) : null}

          {creators.length > 0 ? (
            <UserGlassCard sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 800, color: USER_COLORS.gold, textTransform: 'uppercase', mb: 1.5, fontSize: 13 }}>
                {t('explore.recommendedCreators')}
              </Typography>
              <Box sx={homeMobileScrollFlexRowSx}>
                <Stack direction="row" spacing={1.25} sx={{ minWidth: 'min-content' }}>
                  {creators.map((creator) => (
                    <Stack
                      key={creator.id}
                      alignItems="center"
                      spacing={1}
                      onClick={() => navigate(paths.profile(creator.id))}
                      sx={{
                        minWidth: 120,
                        p: 1.25,
                        cursor: 'pointer',
                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                        bgcolor: alpha('#000000', 0.25),
                        '&:hover': { borderColor: alpha(USER_COLORS.gold, 0.35) },
                      }}
                    >
                      <Avatar
                        src={getImageUrl(creator.avatar)}
                        alt={creator.username}
                        sx={{ width: 52, height: 52, border: `1px solid ${alpha(USER_COLORS.gold, 0.3)}` }}
                      />
                      <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary, fontSize: 13 }} noWrap>
                        {creator.username}
                      </Typography>
                      <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                        {creator.posts} {t('profile.posts')} · {creator.likes} {t('explore.likes')}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </UserGlassCard>
          ) : null}

          <Box>
            <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary, textTransform: 'uppercase', mb: 1.5, fontSize: 14 }}>
              {t('explore.trendingPosts')}
            </Typography>
            {posts.length === 0 ? (
              <UserEmptyState icon="solar:document-bold-duotone" title={t('explore.noPosts')} />
            ) : (
              <Grid container spacing={2}>
                {posts.map((feed) => (
                  <Grid key={feed.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <FeedCard feed={feed} publishedAtLabel="" onLike={handleLike} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
  );

  if (embedded) return content;

  return (
    <UserPageShell contentSx={{ maxWidth: 1100, mx: 'auto' }}>
      <UserPageTitle badge={t('explore.badge')} title={t('explore.title')} subtitle={t('explore.subtitle')} />
      {content}
    </UserPageShell>
  );
}
