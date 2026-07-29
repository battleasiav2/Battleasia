import { useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, Typography, Skeleton } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import { UserGlassCard, USER_COLORS } from 'src/layouts/user';
import { getImageUrl } from 'src/utils/get-image-url';
import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import {
  homeMobileScrollFlexRowSx,
  homeMobileScrollItemSx,
} from 'src/sections/home/home-horizontal-scroll';

import { StoryViewer } from './story-viewer';
import { StoryCreateDialog } from './story-create-dialog';
import { mapApiStoryGroup, type StoryGroup } from './story-types';

// ----------------------------------------------------------------------

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

          <Box sx={homeMobileScrollFlexRowSx}>
            <Stack
              alignItems="center"
              spacing={0.75}
              onClick={() => setCreateOpen(true)}
              sx={{
                ...homeMobileScrollItemSx,
                flex: '0 0 auto',
                minWidth: 72,
                cursor: 'pointer',
                '&:hover': { opacity: 1 },
              }}
            >
              <Box
                sx={{
                  p: '2px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${USER_COLORS.gold}, ${alpha(USER_COLORS.gold, 0.35)})`,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: `2px solid ${alpha('#000000', 0.85)}`,
                    bgcolor: alpha('#000000', 0.45),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {user?.avatar ? (
                    <Avatar
                      src={getImageUrl(user.avatar)}
                      alt={user.username}
                      sx={{ width: 1, height: 1 }}
                    />
                  ) : (
                    <Iconify icon="solar:user-bold" width={24} sx={{ color: USER_COLORS.gold }} />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -2,
                      bottom: -2,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: USER_COLORS.gold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${alpha('#000000', 0.85)}`,
                    }}
                  >
                    <Iconify icon="eva:plus-fill" width={12} sx={{ color: '#000000' }} />
                  </Box>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: USER_COLORS.textMuted, fontSize: 11 }}>
                {t('feed.addStory')}
              </Typography>
            </Stack>

            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Stack
                    key={index}
                    alignItems="center"
                    spacing={0.75}
                    sx={{ ...homeMobileScrollItemSx, flex: '0 0 auto', minWidth: 72 }}
                  >
                    <Skeleton variant="circular" width={60} height={60} />
                    <Skeleton variant="text" width={56} />
                  </Stack>
                ))
              : sortedGroups.map((group) => {
                  const groupIndex = groups.findIndex((g) => g.userId === group.userId);
                  const hasUnseen = group.stories.some((s) => !s.viewed);
                  const isOwn = user?._id === group.userId;

                  return (
                    <Stack
                      key={group.userId}
                      alignItems="center"
                      spacing={0.75}
                      onClick={() => openViewer(groupIndex)}
                      sx={{
                        ...homeMobileScrollItemSx,
                        flex: '0 0 auto',
                        minWidth: 72,
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          p: '2px',
                          borderRadius: '50%',
                          background: hasUnseen
                            ? `linear-gradient(135deg, ${USER_COLORS.gold}, ${alpha(USER_COLORS.gold, 0.35)})`
                            : alpha('#ffffff', 0.15),
                          boxShadow: hasUnseen ? `0 0 16px ${alpha(USER_COLORS.gold, 0.25)}` : 'none',
                        }}
                      >
                        <Avatar
                          src={getImageUrl(group.avatar)}
                          alt={group.username}
                          sx={{
                            width: 56,
                            height: 56,
                            border: `2px solid ${alpha('#000000', 0.85)}`,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: isOwn ? USER_COLORS.gold : USER_COLORS.textSubtle,
                          maxWidth: 72,
                          textAlign: 'center',
                          fontSize: 11,
                          fontWeight: isOwn ? 700 : 400,
                        }}
                      >
                        {isOwn ? t('feed.yourStory') : group.username}
                      </Typography>
                    </Stack>
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
