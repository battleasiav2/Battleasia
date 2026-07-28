import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Avatar, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { getImageUrl } from 'src/utils/get-image-url';
import { paths } from 'src/routes/paths';
import { USER_COLORS, UserGlassCard } from 'src/layouts/user';

import { mapFollowUser, type FollowUserItem } from '../profile-social-types';

// ----------------------------------------------------------------------

type ProfileMutualFollowersProps = {
  profileUserId: string;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
};

export function ProfileMutualFollowers({ profileUserId, isOwnProfile, isLoggedIn }: ProfileMutualFollowersProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { getMutualFollowersApi } = useApi();
  const [items, setItems] = useState<FollowUserItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || isOwnProfile || !profileUserId) {
      setItems([]);
      setTotal(0);
      return;
    }

    void (async () => {
      try {
        const response = await getMutualFollowersApi(profileUserId);
        const results = response?.data?.data?.results;
        setItems(Array.isArray(results) ? results.map(mapFollowUser) : []);
        setTotal(Number(response?.data?.data?.total) || 0);
      } catch {
        setItems([]);
        setTotal(0);
      }
    })();
  }, [getMutualFollowersApi, isLoggedIn, isOwnProfile, profileUserId]);

  if (!isLoggedIn || isOwnProfile || items.length === 0) return null;

  const names = items.map((item) => item.username).filter(Boolean);
  const extra = Math.max(0, total - names.length);
  const label =
    extra > 0
      ? t('profile.followedByAndOthers', { names: names.join(', '), count: extra })
      : t('profile.followedBy', { names: names.join(', ') });

  return (
    <UserGlassCard sx={{ p: 1.5, mb: 2 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Stack direction="row" sx={{ pl: 0.5 }}>
          {items.slice(0, 3).map((item, index) => (
            <Avatar
              key={item.id}
              src={getImageUrl(item.avatar)}
              alt={item.username}
              onClick={() => navigate(paths.profile(item.id))}
              sx={{
                width: 28,
                height: 28,
                ml: index > 0 ? -1 : 0,
                cursor: 'pointer',
                border: `2px solid ${alpha('#000000', 0.8)}`,
              }}
            />
          ))}
        </Stack>
        <Typography sx={{ fontSize: 13, color: USER_COLORS.textMuted, lineHeight: 1.5 }}>{label}</Typography>
      </Stack>
    </UserGlassCard>
  );
}
