import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { CONFIG } from 'src/global-config';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import {
  UserPageShell,
  UserPageTitle,
  UserActionButton,
  UserEmptyState,
  USER_COLORS,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

import { ReelCreateDialog } from './components/reel-create-dialog';
import { mapApiReel, type ReelItem } from './reel-types';

// ----------------------------------------------------------------------

const resolveVideoUrl = (videoUrl: string) => {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('http')) return videoUrl;
  if (videoUrl.startsWith('/assets/')) return videoUrl;
  return `${CONFIG.serverUrl || ''}${videoUrl}`;
};

export function ReelsView({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { getReelsApi, viewReelApi } = useApi();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReelsApi({ page: 1, limit: 50 });
      const results = response?.data?.data?.results;
      setReels(Array.isArray(results) ? results.map(mapApiReel) : []);
    } catch (error) {
      console.error('Failed to load reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  }, [getReelsApi]);

  useEffect(() => {
    void fetchReels();
  }, [fetchReels]);

  useEffect(() => {
    const reel = reels[activeIndex];
    if (!reel || viewedRef.current.has(reel.id)) return;
    viewedRef.current.add(reel.id);
    void viewReelApi(reel.id);
  }, [activeIndex, reels, viewReelApi]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex && index >= 0 && index < reels.length) {
      setActiveIndex(index);
    }
  };

  const reelHeight = embedded ? { xs: 520, md: 560 } : { xs: 'calc(100vh - 220px)', md: 640 };

  const body = loading ? (
    <UserEmptyState icon="solar:clapperboard-play-bold-duotone" title={t('common.loading')} sx={{ minHeight: 420 }} />
  ) : reels.length === 0 ? (
    <UserEmptyState
      icon="solar:clapperboard-play-bold-duotone"
      title={t('reels.emptyTitle')}
      description={t('reels.emptyDescription')}
      actionLabel={t('reels.createReel')}
      onAction={() => setCreateOpen(true)}
    />
  ) : (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: reelHeight,
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        bgcolor: alpha('#000000', 0.45),
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      {reels.map((reel) => (
        <Box
          key={reel.id}
          sx={{
            height: reelHeight,
            scrollSnapAlign: 'start',
            position: 'relative',
            bgcolor: '#000',
          }}
        >
              <Box
                component="video"
                src={resolveVideoUrl(reel.videoUrl)}
                controls
                playsInline
                autoPlay={reels[activeIndex]?.id === reel.id}
                muted
                loop
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <Stack
                spacing={1}
                sx={{
                  position: 'absolute',
                  left: 16,
                  bottom: 24,
                  right: 72,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pointerEvents: 'auto' }}>
                  <Avatar
                    src={getImageUrl(reel.avatar)}
                    alt={reel.username}
                    onClick={() => navigate(paths.profile(reel.userId))}
                    sx={{ width: 36, height: 36, cursor: 'pointer', border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}` }}
                  />
                  <Typography sx={{ fontWeight: 800, color: '#fff' }}>{reel.username}</Typography>
                </Stack>
                {reel.caption ? (
                  <Typography sx={{ color: alpha('#ffffff', 0.92), fontSize: 14, lineHeight: 1.45 }}>{reel.caption}</Typography>
                ) : null}
                {reel.musicTitle ? (
                  <Typography sx={{ color: USER_COLORS.gold, fontSize: 12, fontWeight: 700 }}>{reel.musicTitle}</Typography>
                ) : null}
                <Typography sx={{ color: alpha('#ffffff', 0.65), fontSize: 12 }}>
                  {reel.totalViews} {t('reels.views')}
                </Typography>
              </Stack>

              <Stack spacing={1.5} sx={{ position: 'absolute', right: 12, bottom: 40, zIndex: 2 }}>
                <IconButton sx={{ color: '#fff', bgcolor: alpha('#000000', 0.35) }}>
                  <Iconify icon="solar:heart-bold" width={22} />
                </IconButton>
                <Typography sx={{ color: '#fff', fontSize: 11, textAlign: 'center' }}>{reel.totalLikes}</Typography>
              </Stack>
            </Box>
          ))}
        </Box>
  );

  const createAction = (
    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
      <UserActionButton
        actionVariant="gold"
        size="small"
        startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
        onClick={() => setCreateOpen(true)}
      >
        {t('reels.createReel')}
      </UserActionButton>
    </Stack>
  );

  const content = (
    <>
      {createAction}
      {body}
      <ReelCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void fetchReels()} />
    </>
  );

  if (embedded) return content;

  return (
    <UserPageShell contentSx={{ maxWidth: 480, mx: 'auto', px: { xs: 0, sm: 2 } }}>
      <Box sx={{ px: { xs: 2, sm: 0 }, pt: 1, pb: 2 }}>
        <UserPageTitle
          badge={t('reels.badge')}
          title={t('reels.title')}
          subtitle={t('reels.subtitle')}
          action={
            <UserActionButton actionVariant="gold" size="small" startIcon={<Iconify icon="solar:add-circle-bold" width={16} />} onClick={() => setCreateOpen(true)}>
              {t('reels.createReel')}
            </UserActionButton>
          }
        />
      </Box>
      {body}
      <ReelCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void fetchReels()} />
    </UserPageShell>
  );
}
