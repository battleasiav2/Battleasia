import { alpha } from '@mui/material/styles';
import { Box, Link, Stack, Avatar, Typography, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { getImageUrl } from 'src/utils/get-image-url';

import { USER_COLORS, userMutedTextSx } from 'src/layouts/user';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';
import {
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { getFeedCoverUrl, isOfficialAuthor, type FeedItem } from '../feed-types';

// ----------------------------------------------------------------------

type FeedCardProps = {
  feed: FeedItem;
  publishedAtLabel: string;
  onLike: (e: React.MouseEvent, feedId: string) => void;
};

const feedIconButtonSx = {
  color: USER_COLORS.textMuted,
  p: 0.5,
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.06),
    color: USER_COLORS.textSubtle,
  },
};

export function FeedCard({ feed, publishedAtLabel, onLike }: FeedCardProps) {
  const router = useRouter();
  const tokens = getDefaultGlassTokens();
  const coverUrl = getFeedCoverUrl(feed.coverUrl);
  const isOfficial = isOfficialAuthor(feed.author?.role?.name);

  const goToDetail = () => router.push(paths.user.feedDetail(feed.id));

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        p: 0,
        overflow: 'hidden',
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 48px ${alpha('#000000', 0.75)}, 0 0 28px ${alpha(USER_COLORS.gold, 0.1)}`,
        },
      })}
    >
      <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }} onClick={goToDetail}>
        {coverUrl ? (
          <Image
            alt={feed.title}
            src={coverUrl}
            sx={{
              width: '100%',
              height: '100%',
              '& img': { objectFit: 'cover' },
            }}
          />
        ) : (
          <Box
            sx={{
              width: 1,
              height: 1,
              bgcolor: alpha('#ffffff', 0.04),
              backgroundImage: `linear-gradient(135deg, ${alpha(USER_COLORS.gold, 0.08)} 0%, transparent 60%)`,
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 35%, ${alpha('#000000', 0.82)} 100%)`,
          }}
        />

        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <Box
            sx={{
              ...getGlassBadgeChipSx(tokens),
              bgcolor: alpha(USER_COLORS.info, 0.15),
              border: `1px solid ${alpha(USER_COLORS.info, 0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5, color: USER_COLORS.info }}>
              {feed.publish === 'published' ? 'PUBLISHED' : 'DRAFT'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
        {feed.author ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Link
              component={RouterLink}
              href={paths.profile(feed.author.id)}
              underline="none"
              onClick={(e) => e.stopPropagation()}
              sx={{ display: 'inline-flex' }}
            >
              {isOfficial ? (
                <Logo
                  sx={{
                    p: 0.5,
                    width: 32,
                    height: 32,
                    bgcolor: USER_COLORS.gold,
                    borderRadius: '50%',
                  }}
                />
              ) : (
                <Avatar
                  src={getImageUrl(feed.author.avatarUrl)}
                  alt={feed.author.name}
                  sx={{ width: 32, height: 32 }}
                />
              )}
            </Link>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
              <Link
                component={RouterLink}
                href={paths.profile(feed.author.id)}
                underline="none"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: USER_COLORS.textPrimary,
                  '&:hover': { color: USER_COLORS.gold },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {feed.author.name}
              </Link>
              {isOfficial ? (
                <Iconify icon="solar:verified-check-bold" width={14} sx={{ color: USER_COLORS.gold }} />
              ) : null}
            </Stack>
          </Stack>
        ) : null}

        <Box onClick={goToDetail} sx={{ flex: 1 }}>
          <Typography
            className="font-tr"
            sx={{
              fontSize: 17,
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {feed.title}
          </Typography>

          <Box
            sx={{
              mt: 1,
              color: USER_COLORS.textMuted,
              fontSize: 13,
              lineHeight: 1.55,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              '& p': { margin: 0, display: 'inline' },
              '& *': { display: 'inline' },
            }}
            dangerouslySetInnerHTML={{ __html: feed.description }}
          />
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            pt: 1,
            borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              onClick={(e) => onLike(e, feed.id)}
              sx={{
                ...feedIconButtonSx,
                color: feed.isLiked ? USER_COLORS.error : USER_COLORS.textMuted,
              }}
            >
              <Iconify icon={feed.isLiked ? 'solar:heart-bold' : 'solar:heart-outline'} width={18} />
            </IconButton>
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted, minWidth: 20 }}>
              {feed.totalLikes || 0}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={goToDetail}
            sx={{ cursor: 'pointer' }}
          >
            <Iconify icon="solar:chat-round-outline" width={18} sx={{ color: USER_COLORS.textMuted }} />
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted, minWidth: 20 }}>
              {feed.totalComments || 0}
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:eye-outline" width={16} sx={{ color: USER_COLORS.textMuted }} />
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>
              {feed.totalViews || 0}
            </Typography>
          </Stack>
        </Stack>

        <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.38) }}>
          {publishedAtLabel} {fDate(feed.createdAt)}
        </Typography>
      </Stack>
    </Box>
  );
}
