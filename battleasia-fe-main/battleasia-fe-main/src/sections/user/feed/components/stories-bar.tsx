import { useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { UserGlassCard, USER_COLORS } from 'src/layouts/user';
import { getImageUrl } from 'src/utils/get-image-url';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type StoryGroup = {
  userId: string;
  username: string;
  avatar: string;
  stories: { id: string; viewed: boolean }[];
};

export function StoriesBar() {
  const { t } = useTranslate();
  const { getStoriesApi } = useApi();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStoriesApi();
      if (response?.data?.status) {
        setGroups(response.data.data || []);
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

  if (loading && groups.length === 0) {
    return null;
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <UserGlassCard noPadding>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: USER_COLORS.textMuted, mb: 1.5 }}>
          {t('feed.stories')}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {groups.map((group) => {
            const hasUnseen = group.stories.some((s) => !s.viewed);
            return (
              <Stack key={group.userId} alignItems="center" spacing={0.75} sx={{ minWidth: 72 }}>
                <Box
                  sx={{
                    p: '2px',
                    borderRadius: '50%',
                    background: hasUnseen
                      ? `linear-gradient(135deg, ${USER_COLORS.gold}, ${alpha(USER_COLORS.gold, 0.4)})`
                      : alpha('#ffffff', 0.15),
                  }}
                >
                  <Avatar
                    src={getImageUrl(group.avatar)}
                    alt={group.username}
                    sx={{
                      width: 56,
                      height: 56,
                      border: `2px solid ${alpha('#000000', 0.8)}`,
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: USER_COLORS.textSubtle, maxWidth: 72, textAlign: 'center' }}
                >
                  {group.username}
                </Typography>
              </Stack>
            );
          })}
          <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 72, opacity: 0.7 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: `1px dashed ${USER_COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:add-circle-bold" width={24} sx={{ color: USER_COLORS.gold }} />
            </Box>
            <Typography variant="caption" sx={{ color: USER_COLORS.textMuted }}>
              {t('feed.addStory')}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </UserGlassCard>
  );
}
