import { useRef } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, Typography } from '@mui/material';

import { getImageUrl } from 'src/utils/get-image-url';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserActionButton,
  USER_COLORS,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';
import {
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { PROFILE_IMAGE_PATHS } from '../profile-view';

// ----------------------------------------------------------------------

type ProfileBannerProps = {
  username: string;
  avatar?: string;
  avatarPending?: boolean;
  onSelectAvatar?: (file: File) => void;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  followLoading?: boolean;
  role?: {
    id?: string;
    name?: string;
    permissions?: any[];
    level?: number;
  };
  isPremium?: boolean;
};

export function ProfileBanner({
  username,
  avatar,
  avatarPending = false,
  onSelectAvatar,
  isOwnProfile = true,
  isFollowing = false,
  onFollow,
  onUnfollow,
  followLoading = false,
  role,
  isPremium = false,
}: ProfileBannerProps) {
  const { t } = useTranslate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tokens = getDefaultGlassTokens();
  const resolvedAvatar = getImageUrl(avatar);
  const isOfficial = role?.name === 'admin' || role?.name === 'official';

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onSelectAvatar) {
      onSelectAvatar(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Stack spacing={2}>
      {/* Slim hero strip */}
      <Box
        sx={getGlassShellSx(tokens, {
          position: 'relative',
          height: { xs: 100, md: 140 },
          p: 0,
          overflow: 'hidden',
        })}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${PROFILE_IMAGE_PATHS.war2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${alpha('#000000', 0.75)} 0%, ${alpha('#000000', 0.35)} 60%, transparent 100%)`,
          }}
        />
        <Typography
          sx={{
            position: 'absolute',
            left: { xs: 16, md: 24 },
            bottom: { xs: 16, md: 20 },
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: alpha(USER_COLORS.gold, 0.9),
          }}
        >
          Player Profile
        </Typography>
      </Box>

      {/* Identity card — no overlapping avatar */}
      <Box sx={getGlassShellSx(tokens, { p: { xs: 2, md: 2.5 } })}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          spacing={2}
        >
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            {isOfficial ? (
              <Logo
                sx={{
                  p: 1.25,
                  width: { xs: 88, md: 104 },
                  height: { xs: 88, md: 104 },
                  border: `3px solid ${USER_COLORS.gold}`,
                  bgcolor: USER_COLORS.gold,
                  borderRadius: '50%',
                  boxShadow: `0 0 28px ${alpha(USER_COLORS.gold, 0.3)}`,
                }}
              />
            ) : (
              <Avatar
                src={resolvedAvatar}
                alt={username}
                sx={{
                  width: { xs: 88, md: 104 },
                  height: { xs: 88, md: 104 },
                  border: `3px solid ${USER_COLORS.gold}`,
                  bgcolor: alpha(USER_COLORS.surface, 0.8),
                  boxShadow: `0 0 28px ${alpha(USER_COLORS.gold, 0.3)}`,
                }}
              />
            )}
          </Box>

          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0, alignItems: { xs: 'center', sm: 'flex-start' }, textAlign: { xs: 'center', sm: 'left' } }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Typography
                className="font-tr"
                sx={{
                  color: USER_COLORS.textPrimary,
                  fontWeight: 800,
                  fontSize: { xs: 24, md: 32 },
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  maxWidth: 360,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {username}
              </Typography>
              {isOfficial ? (
                <Iconify icon="solar:verified-check-bold" width={22} sx={{ color: USER_COLORS.gold }} />
              ) : null}
              {isPremium ? (
                <Box sx={{ ...getGlassBadgeChipSx(tokens), border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`, color: USER_COLORS.gold }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
                    <Iconify icon="solar:crown-bold" width={12} />
                    <Typography sx={{ fontSize: 10, fontWeight: 800 }}>PREMIUM</Typography>
                  </Stack>
                </Box>
              ) : null}
            </Stack>

            {isOfficial ? (
              <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {role?.name}
              </Typography>
            ) : null}

            <Stack direction="row" flexWrap="wrap" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              {isOwnProfile ? (
                <UserActionButton
                  size="small"
                  actionVariant="mesh"
                  startIcon={<Iconify icon="solar:gallery-edit-bold" width={16} />}
                  onClick={handlePickFile}
                >
                  {avatarPending ? t('profile.avatarSelected') : t('profile.changeAvatar')}
                </UserActionButton>
              ) : onFollow && onUnfollow ? (
                <UserActionButton
                  size="small"
                  actionVariant={isFollowing ? 'ghost' : 'gold'}
                  startIcon={
                    <Iconify
                      icon={isFollowing ? 'solar:user-minus-rounded-bold' : 'solar:user-plus-rounded-bold'}
                      width={16}
                    />
                  }
                  onClick={isFollowing ? onUnfollow : onFollow}
                  disabled={followLoading}
                >
                  {followLoading ? t('common.loading') : isFollowing ? t('profile.unfollow') : t('profile.follow')}
                </UserActionButton>
              ) : null}
            </Stack>
          </Stack>
        </Stack>

        <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleFileChange} />
      </Box>
    </Stack>
  );
}
