import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  USER_COLORS,
  userMutedTextSx, goldAlpha } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import type { IPublicUser } from 'src/types';

// ----------------------------------------------------------------------

type ProfileInfoProps = {
  viewingUser: IPublicUser | null;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
};

type InfoFieldProps = {
  icon: string;
  label: string;
  value: string;
};

function InfoField({ icon, label, value }: InfoFieldProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box sx={getGlassInnerSx(tokens, { p: { xs: 1.5, md: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 })}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '6px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: goldAlpha(0.1),
          border: `1px solid ${goldAlpha(0.22)}`,
          color: USER_COLORS.gold,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ ...userMutedTextSx, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            color: USER_COLORS.textPrimary,
            fontSize: { xs: 14, md: 15 },
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

type SocialLinkProps = {
  href: string;
  icon: string;
  label: string;
};

function SocialLink({ href, icon, label }: SocialLinkProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={getGlassInnerSx(tokens, {
        px: 1.5,
        py: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        color: USER_COLORS.gold,
        textDecoration: 'none',
        transition: 'border-color 0.2s, transform 0.2s',
        '&:hover': {
          borderColor: goldAlpha(0.4),
          transform: 'translateY(-1px)',
        },
      })}
    >
      <Iconify icon={icon} width={18} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.textPrimary }}>{label}</Typography>
    </Box>
  );
}

export function ProfileInfo({ viewingUser, isOwnProfile, isLoggedIn }: ProfileInfoProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  const title = isOwnProfile
    ? t('profile.myProfile')
    : t('profile.viewingProfile', { username: viewingUser?.username || '—' });

  const infoFields: InfoFieldProps[] = [
    {
      icon: 'solar:user-bold-duotone',
      label: t('profile.username') || t('profile.fullName') || 'Username',
      value: viewingUser?.username || '—',
    },
  ];

  if (viewingUser?.pubgId) {
    infoFields.push({
      icon: 'solar:gamepad-bold-duotone',
      label: t('profile.pubgId') || 'PUBG ID',
      value: viewingUser.pubgId,
    });
  }

  if (viewingUser?.gameServer) {
    infoFields.push({
      icon: 'solar:server-bold-duotone',
      label: t('profile.gameServer') || t('match.gameServer') || 'Game Server',
      value: viewingUser.gameServer,
    });
  }

  const socialLinks: SocialLinkProps[] = [];
  if (viewingUser?.twitterLink) {
    socialLinks.push({ href: viewingUser.twitterLink, icon: 'mdi:twitter', label: 'Twitter' });
  }
  if (viewingUser?.facebookLink) {
    socialLinks.push({ href: viewingUser.facebookLink, icon: 'mdi:facebook', label: 'Facebook' });
  }
  if (viewingUser?.instagramLink) {
    socialLinks.push({ href: viewingUser.instagramLink, icon: 'mdi:instagram', label: 'Instagram' });
  }

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: goldAlpha(0.1),
            border: `1px solid ${goldAlpha(0.22)}`,
            color: USER_COLORS.gold,
          }}
        >
          <Iconify icon="solar:user-id-bold-duotone" width={22} />
        </Box>
        <Box>
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 16, md: 18 },
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: USER_COLORS.textPrimary,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ ...userMutedTextSx, fontSize: 12, mt: 0.25 }}>
            {t('profile.publicProfile')}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {infoFields.map((field) => (
          <InfoField key={field.label} {...field} />
        ))}
      </Box>

      {socialLinks.length > 0 ? (
        <Box sx={{ mt: 2.5 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: USER_COLORS.textMuted,
              mb: 1.25,
            }}
          >
            {t('profile.social')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {socialLinks.map((link) => (
              <SocialLink key={link.label} {...link} />
            ))}
          </Stack>
        </Box>
      ) : null}

      {!isLoggedIn ? (
        <Box
          sx={getGlassInnerSx(tokens, {
            mt: 2.5,
            p: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
          })}
        >
          <Iconify icon="solar:lock-keyhole-bold-duotone" width={22} sx={{ color: USER_COLORS.gold, mt: 0.25 }} />
          <Typography sx={{ ...userMutedTextSx, fontSize: 13, lineHeight: 1.6 }}>
            {t('profile.loginToFollow') || 'Please log in to follow this user and see more details.'}
          </Typography>
        </Box>
      ) : null}
    </UserGlassCard>
  );
}
