import { alpha } from '@mui/material/styles';
import { Box, Link, Stack, Avatar, Typography } from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';

import { UserGlassCard, USER_COLORS, userMutedTextSx } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';
import { RouterLink } from 'src/routes/components';

import type { IFeedItem } from 'src/types';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type FeedCardProps = {
  feed: IFeedItem;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export function FeedCard({ feed }: FeedCardProps) {
  const { t } = useTranslate();

  return (
    <UserGlassCard
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        overflow: 'hidden',
        p: 0,
        transition: 'transform 0.2s, border-color 0.2s',
        '&:hover': {
          borderColor: alpha(USER_COLORS.gold, 0.35),
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          flex: { xs: 1, sm: '0 0 60%' },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: feed.status === 'published' ? alpha(USER_COLORS.info, 0.15) : alpha('#ffffff', 0.08),
              color: feed.status === 'published' ? USER_COLORS.info : USER_COLORS.textMuted,
              border: `1px solid ${feed.status === 'published' ? alpha(USER_COLORS.info, 0.35) : USER_COLORS.border}`,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {feed.status === 'published' ? t('feed.published') : t('feed.draft')}
          </Box>
          <Typography variant="caption" sx={userMutedTextSx}>
            {fDate(feed.createdAt)}
          </Typography>
        </Stack>

        <Link
          component={RouterLink}
          href={paths.user.feedDetail(feed.id)}
          sx={{
            mb: 1.5,
            color: USER_COLORS.textPrimary,
            cursor: 'pointer',
            fontWeight: 700,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: 'none',
            '&:hover': { color: USER_COLORS.gold },
          }}
        >
          {feed.title}
        </Link>

        <Box
          sx={{
            color: USER_COLORS.textMuted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            minHeight: 60,
            '& p': {
              margin: 0,
              display: 'inline',
            },
            '& *': {
              display: 'inline',
            },
          }}
          dangerouslySetInnerHTML={{ __html: feed.description }}
        />

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:chat-round-bold" width={18} sx={{ color: USER_COLORS.textMuted }} />
            <Typography variant="caption" sx={userMutedTextSx}>
              {formatNumber(feed.totalComments)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:eye-bold" width={18} sx={{ color: USER_COLORS.textMuted }} />
            <Typography variant="caption" sx={userMutedTextSx}>
              {formatNumber(feed.totalViews)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:share-bold" width={18} sx={{ color: USER_COLORS.textMuted }} />
            <Typography variant="caption" sx={userMutedTextSx}>
              {formatNumber(feed.totalShares || feed.totalLikes)}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: { xs: 1, sm: '0 0 40%' },
          position: 'relative',
          minHeight: { xs: 200, sm: 'auto' },
        }}
      >
        <Image
          alt={feed.title}
          src={getImageUrl(feed.coverUrl)}
          ratio="16/9"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {feed.author?.avatarUrl && (
          <Avatar
            src={getImageUrl(feed.author.avatarUrl)}
            alt={feed.author.name}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 40,
              height: 40,
              border: `2px solid ${USER_COLORS.gold}`,
              boxShadow: `0 0 12px ${alpha(USER_COLORS.gold, 0.3)}`,
            }}
          />
        )}
      </Box>
    </UserGlassCard>
  );
}
