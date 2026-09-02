import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Avatar, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import { USER_COLORS, UserGlassCard, goldAlpha } from 'src/layouts/user';

import { mapFollowUser, type FollowUserItem } from '../profile-social-types';

// ----------------------------------------------------------------------

type ProfileRecentFollowsProps = {
  profileUserId: string;
  isLoggedIn: boolean;
};

export function ProfileRecentFollows({ profileUserId, isLoggedIn }: ProfileRecentFollowsProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { getRecentFollowsApi } = useApi();
  const [items, setItems] = useState<FollowUserItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn || !profileUserId) {
      setItems([]);
      return;
    }

    void (async () => {
      try {
        const response = await getRecentFollowsApi(profileUserId);
        const results = response?.data?.data?.results;
        setItems(Array.isArray(results) ? results.map(mapFollowUser) : []);
      } catch {
        setItems([]);
      }
    })();
  }, [getRecentFollowsApi, isLoggedIn, profileUserId]);

  if (!isLoggedIn || items.length === 0) return null;

  return (
    <UserGlassCard sx={{ p: 2, mb: 2 }}>
      <Typography sx={{ fontWeight: 800, color: USER_COLORS.gold, textTransform: 'uppercase', mb: 1.5, fontSize: 14 }}>
        {t('profile.recentFollows')}
      </Typography>
      <Stack spacing={1}>
        {items.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            alignItems="center"
            spacing={1.25}
            onClick={() => navigate(paths.profile(item.id))}
            sx={{
              p: 1,
              cursor: 'pointer',
              border: `1px solid ${alpha('#ffffff', 0.08)}`,
              '&:hover': { borderColor: goldAlpha(0.25), bgcolor: goldAlpha(0.04) },
            }}
          >
            <Avatar src={getImageUrl(item.avatar)} alt={item.username} sx={{ width: 36, height: 36 }} />
            <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary, fontSize: 14 }}>{item.username}</Typography>
          </Stack>
        ))}
      </Stack>
    </UserGlassCard>
  );
}
