import { useRef } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, Typography } from '@mui/material';

import { getImageUrl } from 'src/utils/get-image-url';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserActionButton,
  UserArenaStrip,
  UserArenaChip,
  USER_COLORS, goldAlpha } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';

import { PROFILE_IMAGE_PATHS } from '../profile-view';
import { ProfileActionsMenu } from './profile-actions-menu';

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
  profileUserId?: string;
  canMessage?: boolean;
  onMessage?: () => void;
  role?: {
    id?: string;
    name?: string;
    permissions?: any[];
    level?: number;
  };
  isPremium?: boolean;
  isBlocked?: boolean;
  onBlockChange?: () => void;
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
  profileUserId,
  canMessage = false,
  onMessage,
  role,
  isPremium = false,
  isBlocked = false,
  onBlockChange,
}: ProfileBannerProps) {
  const { t } = useTranslate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      <UserArenaStrip
        badge={t('profile.badgePlayerProfile') || 'Player Profile'}
        title={username}
        imageUrl={PROFILE_IMAGE_PATHS.war2}
        chip={
          isPremium ? (
            <UserArenaChip
              icon={<Iconify icon="solar:crown-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
              label="PREMIUM"
            />
          ) : isOfficial ? (
            <UserArenaChip
              icon={<Iconify icon="solar:verified-check-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
              label={role?.name?.toUpperCase() || 'OFFICIAL'}
            />
          ) : undefined
        }
      />

      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          bgcolor: alpha('#000000', 0.55),
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
        }}
      >
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
                  boxShadow: `0 0 28px ${goldAlpha(0.3)}`,
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
                  boxShadow: `0 0 28px ${goldAlpha(0.3)}`,
                }}
              />
            )}
          </Box>

          <Stack
            spacing={1.25}
            sx={{
              flex: 1,
              minWidth: 0,
              alignItems: { xs: 'center', sm: 'flex-start' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              flexWrap="wrap"
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
            >
              <Typography
                className="font-tr"
                sx={{
                  color: USER_COLORS.textPrimary,
                  fontWeight: 800,
                  fontSize: { xs: 22, md: 28 },
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
            </Stack>

            {isOfficial ? (
              <Typography
                sx={{
                  fontSize: 12,
                  color: USER_COLORS.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
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
                <>
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
                    {followLoading
                      ? t('common.loading')
                      : isFollowing
                        ? t('profile.unfollow')
                        : t('profile.follow')}
                  </UserActionButton>
                  {canMessage && profileUserId && onMessage ? (
                    <UserActionButton
                      size="small"
                      actionVariant="mesh"
                      startIcon={<Iconify icon="solar:chat-round-dots-bold" width={16} />}
                      onClick={onMessage}
                    >
                      {t('messages.message')}
                    </UserActionButton>
                  ) : null}
                  {profileUserId ? (
                    <ProfileActionsMenu userId={profileUserId} isBlocked={isBlocked} onBlockChange={onBlockChange} />
                  ) : null}
                </>
              ) : null}
            </Stack>
          </Stack>
        </Stack>

        <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleFileChange} />
      </Box>
    </Stack>
  );
}
