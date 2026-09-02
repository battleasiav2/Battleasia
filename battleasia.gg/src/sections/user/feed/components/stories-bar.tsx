import { useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, Typography, Skeleton } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import { UserGlassCard, USER_COLORS, goldAlpha } from 'src/layouts/user';
import { getImageUrl } from 'src/utils/get-image-url';
import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { StoryViewer } from './story-viewer';
import { StoryCreateDialog } from './story-create-dialog';
import { mapApiStoryGroup, type StoryGroup } from './story-types';

// ----------------------------------------------------------------------

function getStoryPreview(group: StoryGroup) {
  const previewStory = group.stories.find((story) => !story.viewed) || group.stories[0];
  if (!previewStory) return { mediaUrl: '', mediaType: 'image' as const };

  return {
    mediaUrl: previewStory.mediaUrl,
    mediaType: previewStory.mediaType,
  };
}

type StoryCardProps = {
  label: string;
  hasUnseen: boolean;
  isOwn?: boolean;
  avatar?: string;
  previewUrl?: string;
  isVideo?: boolean;
  onClick: () => void;
  createCard?: boolean;
};

function StoryCard({
  label,
  hasUnseen,
  isOwn,
  avatar,
  previewUrl,
  isVideo,
  onClick,
  createCard,
}: StoryCardProps) {
  const preview = previewUrl ? getImageUrl(previewUrl) : '';

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        aspectRatio: '3 / 4',
        minHeight: { xs: 148, sm: 168 },
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `2px solid ${
          createCard
            ? goldAlpha(0.45)
            : hasUnseen
              ? USER_COLORS.gold
              : alpha('#ffffff', 0.18)
        }`,
        boxShadow: hasUnseen ? `0 8px 24px ${goldAlpha(0.18)}` : 'none',
        bgcolor: alpha('#000000', 0.55),
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: USER_COLORS.gold,
          boxShadow: `0 12px 28px ${goldAlpha(0.22)}`,
        },
      }}
    >
      {preview && !createCard ? (
        <>
          {isVideo ? (
            <Box
              component="video"
              src={preview}
              muted
              playsInline
              preload="metadata"
              sx={{
                width: 1,
                height: 1,
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
          ) : (
            <Box
              component="img"
              src={preview}
              alt={label}
              sx={{
                width: 1,
                height: 1,
                objectFit: 'cover',
              }}
            />
          )}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, ${alpha('#000000', 0.15)} 0%, ${alpha('#000000', 0.08)} 45%, ${alpha('#000000', 0.82)} 100%)`,
            }}
          />
        </>
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: createCard
              ? `linear-gradient(145deg, ${goldAlpha(0.18)} 0%, ${alpha('#000000', 0.75)} 100%)`
              : `linear-gradient(145deg, ${alpha('#ffffff', 0.08)} 0%, ${alpha('#000000', 0.82)} 100%)`,
          }}
        />
      )}

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          zIndex: 2,
        }}
      >
        <Avatar
          src={avatar ? getImageUrl(avatar) : undefined}
          alt={label}
          sx={{
            width: 34,
            height: 34,
            border: `2px solid ${hasUnseen || createCard ? USER_COLORS.gold : alpha('#ffffff', 0.35)}`,
            bgcolor: alpha('#000000', 0.65),
          }}
        >
          {!avatar ? <Iconify icon="solar:user-bold" width={18} sx={{ color: USER_COLORS.gold }} /> : null}
        </Avatar>
        {createCard ? (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: USER_COLORS.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha('#000000', 0.85)}`,
              ml: 'auto',
            }}
          >
            <Iconify icon="eva:plus-fill" width={14} sx={{ color: '#000000' }} />
          </Box>
        ) : isVideo ? (
          <Box
            sx={{
              ml: 'auto',
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: alpha('#000000', 0.55),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:play-bold" width={12} sx={{ color: '#ffffff' }} />
          </Box>
        ) : null}
      </Stack>

      <Typography
        noWrap
        sx={{
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: 2,
          fontSize: 12,
          fontWeight: isOwn ? 800 : 700,
          color: '#ffffff',
          textShadow: `0 2px 8px ${alpha('#000000', 0.85)}`,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function StoriesBar() {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const { getStoriesApi, viewStoryApi } = useApi();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStoriesApi();
      if (response?.data?.status) {
        const mapped = (response.data.data || []).map(mapApiStoryGroup);
        setGroups(mapped);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [getStoriesApi]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleViewStory = useCallback(
    async (storyId: string) => {
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          stories: group.stories.map((story) =>
            story.id === storyId ? { ...story, viewed: true } : story
          ),
        }))
      );

      try {
        await viewStoryApi(storyId);
      } catch (error) {
        console.error('Failed to record story view:', error);
      }
    },
    [viewStoryApi]
  );

  const openViewer = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setViewerOpen(true);
  };

  const sortedGroups = [...groups].sort((a, b) => {
    if (user?._id && a.userId === user._id) return -1;
    if (user?._id && b.userId === user._id) return 1;
    const aUnseen = a.stories.some((s) => !s.viewed);
    const bUnseen = b.stories.some((s) => !s.viewed);
    if (aUnseen !== bUnseen) return aUnseen ? -1 : 1;
    return 0;
  });

  return (
    <>
      <UserGlassCard noPadding>
        <Box sx={{ px: 2, py: 1.75 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <Iconify icon="solar:story-bold" width={16} sx={{ color: USER_COLORS.gold }} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: USER_COLORS.textSubtle,
              }}
            >
              {t('feed.stories')}
            </Typography>
          </Stack>
          <BattleGoldDivider variant="title" sx={{ mb: 1.5, opacity: 0.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, minmax(0, 1fr))',
                sm: 'repeat(4, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))',
                lg: 'repeat(6, minmax(0, 1fr))',
              },
              gap: { xs: 1, sm: 1.25 },
            }}
          >
            <StoryCard
              createCard
              label={t('feed.addStory')}
              hasUnseen={false}
              isOwn
              avatar={user?.avatar}
              onClick={() => setCreateOpen(true)}
            />

            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    sx={{ aspectRatio: '3 / 4', minHeight: { xs: 148, sm: 168 }, borderRadius: 2 }}
                  />
                ))
              : sortedGroups.map((group) => {
                  const groupIndex = groups.findIndex((g) => g.userId === group.userId);
                  const hasUnseen = group.stories.some((s) => !s.viewed);
                  const isOwn = user?._id === group.userId;
                  const preview = getStoryPreview(group);

                  return (
                    <StoryCard
                      key={group.userId}
                      label={isOwn ? t('feed.yourStory') : group.username}
                      hasUnseen={hasUnseen}
                      isOwn={isOwn}
                      avatar={group.avatar}
                      previewUrl={preview.mediaUrl}
                      isVideo={preview.mediaType === 'video'}
                      onClick={() => openViewer(groupIndex)}
                    />
                  );
                })}
          </Box>
        </Box>
      </UserGlassCard>

      <StoryViewer
        open={viewerOpen}
        groups={groups}
        initialGroupIndex={activeGroupIndex}
        onClose={() => setViewerOpen(false)}
        onViewStory={handleViewStory}
      />

      <StoryCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchStories}
      />
    </>
  );
}
