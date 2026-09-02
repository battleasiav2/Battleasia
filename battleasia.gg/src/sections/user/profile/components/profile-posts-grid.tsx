import { alpha } from '@mui/material/styles';
import { Box, Skeleton, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getImageUrl } from 'src/utils/get-image-url';

import { useTranslate } from 'src/locales/use-locales';
import { USER_COLORS, goldAlpha } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

import type { IFeedItem } from 'src/types';

// ----------------------------------------------------------------------

type ProfilePostsGridProps = {
  feeds: IFeedItem[];
};

const formatCount = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};

function GridSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0.5,
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          sx={{
            aspectRatio: '1 / 1',
            bgcolor: alpha('#ffffff', 0.04),
            borderRadius: 0,
          }}
        />
      ))}
    </Box>
  );
}

export function ProfilePostsGrid({ feeds }: ProfilePostsGridProps) {
  const { t } = useTranslate();
  const router = useRouter();

  if (feeds.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0.5,
      }}
    >
      {feeds.map((feed) => {
        const cover = getImageUrl(feed.coverUrl);
        const goToPost = () => router.push(paths.user.feedDetail(feed.id));

        return (
          <Box
            key={feed.id}
            onClick={goToPost}
            sx={{
              position: 'relative',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              cursor: 'pointer',
              bgcolor: alpha('#ffffff', 0.04),
              border: `1px solid ${alpha('#ffffff', 0.06)}`,
              '&:hover .post-grid-overlay': {
                opacity: 1,
              },
            }}
          >
            {cover ? (
              <Image
                alt={feed.title || t('profile.posts')}
                src={cover}
                sx={{
                  width: '100%',
                  height: '100%',
                  '& img': { objectFit: 'cover' },
                }}
              />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 1,
                  height: 1,
                  backgroundImage: `linear-gradient(135deg, ${goldAlpha(0.12)} 0%, transparent 70%)`,
                }}
              >
                <Iconify icon="solar:document-text-bold" width={28} sx={{ color: USER_COLORS.textMuted }} />
              </Stack>
            )}

            <Box
              className="post-grid-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: alpha('#000000', 0.55),
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:heart-bold" width={18} sx={{ color: '#ffffff' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  {formatCount(feed.totalLikes || 0)}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:chat-round-bold" width={18} sx={{ color: '#ffffff' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  {formatCount(feed.totalComments || 0)}
                </Typography>
              </Stack>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function ProfilePostsGridSkeleton() {
  return <GridSkeleton />;
}
