import { useState, useEffect } from 'react';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { RootState } from 'src/store';
import { useSelector } from 'src/store';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  USER_COLORS,
  userGhostButtonSx,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { AnimatedBalance } from 'src/components/animated-balance';
import {
  getDefaultGlassTokens,
  getGlassInnerSx,
  getGlassShellSx,
} from 'src/components/battle-glass-card';
import { toast } from 'react-hot-toast';

import { paths } from 'src/routes/paths';

import { liveSyncBus } from 'src/lib/live-sync-bus';

import { PROFILE_IMAGE_PATHS } from '../profile-view';

// ----------------------------------------------------------------------

type ActivityCard = {
  title: string;
  subtitle: string;
  image?: string;
  icon?: string;
};

type ProfileSidebarProps = {
  activities?: ActivityCard[];
  followers?: number;
  following?: number;
  userId?: string;
  hideBalance?: boolean;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
};

export function ProfileSidebar({
  activities = [],
  followers = 0,
  following = 0,
  userId,
  hideBalance = false,
  onFollowersClick,
  onFollowingClick,
}: ProfileSidebarProps) {
  const { t, currentLang } = useTranslate();
  const { user, balance } = useSelector((state: RootState) => state.auth);
  const [copiedID, setCopiedID] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const tokens = getDefaultGlassTokens();
  const isBengali = currentLang?.value === 'bn';

  useEffect(() => {
    if (!user?._id) return undefined;

    const handleProfileSync = (payload: unknown) => {
      const data = payload as { userId?: string };
      if (data?.userId && data.userId !== user._id) return;
      toast.success(t('profile.statsUpdated') || 'Your stats have been updated!');
    };

    const unsubBalance = liveSyncBus.on('balance', handleProfileSync);
    const unsubProfile = liveSyncBus.on('profile', handleProfileSync);

    return () => {
      unsubBalance();
      unsubProfile();
    };
  }, [user?._id, t]);

  const handleShareProfileID = async () => {
    try {
      const profileUserId = userId || user?._id;
      if (!profileUserId) {
        toast.error(t('profile.unableToGenerateLink'));
        return;
      }
      const profileUrl = `${window.location.origin}${paths.profile(profileUserId)}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopiedID(true);
      toast.success(t('profile.linkWithIdCopied'));
      setTimeout(() => setCopiedID(false), 2000);
    } catch (err) {
      console.error('Failed to copy profile link:', err);
      toast.error(t('profile.failedToCopyLink'));
    }
  };

  const handleShareProfileName = async () => {
    try {
      const profileUserName = user?.username;
      if (!profileUserName) {
        toast.error(t('profile.unableToGenerateLink'));
        return;
      }
      const profileUrl = `${window.location.origin}${paths.profile(profileUserName)}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopiedName(true);
      toast.success(t('profile.linkWithNameCopied'));
      setTimeout(() => setCopiedName(false), 2000);
    } catch (err) {
      console.error('Failed to copy profile link:', err);
      toast.error(t('profile.failedToCopyLink'));
    }
  };

  const shareButtonSx = {
    ...userGhostButtonSx,
    fontSize: isBengali ? '0.7rem' : { xs: '0.7rem', sm: '0.75rem' },
    flex: 1,
    minWidth: 0,
  };

  return (
    <Stack spacing={2}>
      {!hideBalance ? (
        <Box sx={getGlassShellSx(tokens, { p: 2 })}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: USER_COLORS.textMuted, textTransform: 'uppercase', mb: 1 }}>
            {t('profile.accountBalance')}
          </Typography>
          <AnimatedBalance value={balance ?? 0} fontSize={{ xs: '1.25rem', sm: '1.5rem' }} fontWeight={800} color={USER_COLORS.gold} />
        </Box>
      ) : null}

      <UserGlassCard sx={{ p: 2 }}>
        <Typography className="font-tr" sx={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.gold, mb: 1.5, letterSpacing: 0.5 }}>
          {t('profile.social')}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          {[
            { type: 'followers' as const, label: t('profile.followers'), value: followers, icon: 'solar:users-group-rounded-bold' },
            { type: 'following' as const, label: t('profile.following'), value: following, icon: 'streamline-ultimate:following-1-bold' },
          ].map((item) => {
            const handleClick = item.type === 'followers' ? onFollowersClick : onFollowingClick;
            return (
            <Box
              key={item.type}
              onClick={handleClick}
              sx={{
                ...getGlassInnerSx(tokens, { p: 1.5, flex: 1, textAlign: 'center' }),
                cursor: handleClick ? 'pointer' : 'default',
                transition: 'border-color 0.2s, transform 0.2s',
                '&:hover': handleClick ? { borderColor: alpha(USER_COLORS.gold, 0.35), transform: 'translateY(-1px)' } : undefined,
              }}
            >
              <Iconify icon={item.icon} width={20} sx={{ color: USER_COLORS.gold, mb: 0.5 }} />
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: USER_COLORS.textPrimary }}>{item.value}</Typography>
              <Typography sx={{ fontSize: 10, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {item.label}
              </Typography>
            </Box>
            );
          })}
        </Stack>

        <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted, mb: 1 }}>
          {t('profile.shareProfileLink')}
        </Typography>
        <Stack direction={isBengali ? 'column' : 'row'} spacing={1}>
          <Button
            size="small"
            startIcon={<Iconify icon={copiedID ? 'solar:check-circle-bold' : 'solar:link-bold'} width={16} />}
            onClick={handleShareProfileID}
            sx={shareButtonSx}
          >
            {copiedID ? t('profile.linkCopied') : t('profile.shareWithId')}
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon={copiedName ? 'solar:check-circle-bold' : 'solar:link-bold'} width={16} />}
            onClick={handleShareProfileName}
            sx={shareButtonSx}
          >
            {copiedName ? t('profile.linkCopied') : t('profile.shareWithName')}
          </Button>
        </Stack>
      </UserGlassCard>

      {activities.length > 0 ? (
        <UserGlassCard sx={{ p: 2 }}>
          <Typography className="font-tr" sx={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.gold, mb: 1.5, letterSpacing: 0.5 }}>
            {t('profile.activity')}
          </Typography>

          <Stack spacing={1.25}>
            {activities.map((activity) => (
              <Box
                key={`${activity.title}-${activity.subtitle}`}
                sx={getGlassInnerSx(tokens, {
                  p: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  minHeight: 88,
                })}
              >
                <Box
                  sx={{
                    flex: { sm: '0 0 120px' },
                    minHeight: { xs: 80, sm: 'auto' },
                    backgroundImage: `url(${activity.image || PROFILE_IMAGE_PATHS.game})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <Stack spacing={0.5} sx={{ p: 1.5, justifyContent: 'center', minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textPrimary }} noWrap>
                    {activity.title || '—'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {activity.icon ? <Iconify icon={activity.icon} width={14} sx={{ color: USER_COLORS.gold }} /> : null}
                    <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{activity.subtitle}</Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </UserGlassCard>
      ) : null}
    </Stack>
  );
}
