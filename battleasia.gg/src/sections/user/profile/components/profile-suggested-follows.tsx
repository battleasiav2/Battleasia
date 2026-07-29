import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Avatar, Box, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import { USER_COLORS, UserGlassCard, UserActionButton } from 'src/layouts/user';
import { homeMobileScrollFlexRowSx } from 'src/sections/home/home-horizontal-scroll';

import { mapFollowUser, type FollowUserItem } from '../profile-social-types';

// ----------------------------------------------------------------------

type ProfileSuggestedFollowsProps = {
  contextUserId?: string;
  isLoggedIn: boolean;
  onFollowChange?: () => void;
};

export function ProfileSuggestedFollows({ contextUserId, isLoggedIn, onFollowChange }: ProfileSuggestedFollowsProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { getSuggestedFollowsApi, followUserApi, unfollowUserApi } = useApi();
  const [items, setItems] = useState<FollowUserItem[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }
    try {
      const response = await getSuggestedFollowsApi(contextUserId);
      const results = response?.data?.data?.results;
      setItems(Array.isArray(results) ? results.map(mapFollowUser) : []);
    } catch {
      setItems([]);
    }
  }, [contextUserId, getSuggestedFollowsApi, isLoggedIn]);

  useEffect(() => {
    void fetchSuggestions();
  }, [fetchSuggestions]);

  const toggleFollow = async (targetId: string, isFollowing?: boolean) => {
    try {
      setActionId(targetId);
      const response = isFollowing ? await unfollowUserApi(targetId) : await followUserApi(targetId);
      if (response?.data?.status) {
        setItems((prev) => prev.filter((item) => item.id !== targetId));
        onFollowChange?.();
      }
    } catch (error) {
      console.error('Failed to follow suggested user:', error);
    } finally {
      setActionId(null);
    }
  };

  if (!isLoggedIn || items.length === 0) return null;

  return (
    <UserGlassCard sx={{ p: 2, mb: 2 }}>
      <Typography sx={{ fontWeight: 800, color: USER_COLORS.gold, textTransform: 'uppercase', mb: 1.5, fontSize: 14 }}>
        {t('profile.suggestedForYou')}
      </Typography>
      <Box sx={homeMobileScrollFlexRowSx}>
        <Stack direction="row" spacing={1.25} sx={{ minWidth: 'min-content', pb: 0.5 }}>
          {items.map((item) => (
            <Stack
              key={item.id}
              alignItems="center"
              spacing={1}
              sx={{
                minWidth: 132,
                p: 1.25,
                border: `1px solid ${alpha('#ffffff', 0.1)}`,
                bgcolor: alpha('#000000', 0.25),
              }}
            >
              <Avatar
                src={getImageUrl(item.avatar)}
                alt={item.username}
                onClick={() => navigate(paths.profile(item.id))}
                sx={{ width: 52, height: 52, cursor: 'pointer', border: `1px solid ${alpha(USER_COLORS.gold, 0.3)}` }}
              />
              <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary, fontSize: 13 }} noWrap>
                {item.username}
              </Typography>
              <UserActionButton
                size="small"
                fullWidth
                actionVariant="gold"
                disabled={actionId === item.id}
                onClick={() => void toggleFollow(item.id, item.isFollowing)}
              >
                {t('profile.follow')}
              </UserActionButton>
            </Stack>
          ))}
        </Stack>
      </Box>
    </UserGlassCard>
  );
}
