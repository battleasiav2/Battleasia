import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { AuthHomeLink } from 'src/components/mesh-buttons/auth-home-link';
import { GlassPanelCard, getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { useTranslate } from 'src/locales/use-locales';

import { USER_COLORS, userPageDividerSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

type AuthFormShellProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Use on sign-up — more fields need a wider card */
  wide?: boolean;
  /** Ghost step number rendered behind the heading (e.g. "01", "02") */
  mark?: string;
};

export function AuthFormShell({ title, description, children, wide, mark }: AuthFormShellProps) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  return (
    <Box
      sx={{
        width: 1,
        maxWidth: wide ? { xs: 1, sm: 580, md: 620 } : { xs: 1, sm: 500, md: 520 },
        animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      {/* Top bar — brand (left) + back to home (right) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Logo
            disabled
            sx={{
              width: { xs: 44, sm: 52 },
              height: 'auto',
              flexShrink: 0,
              pointerEvents: 'none',
              '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
            }}
          />
          <Stack spacing={0.15} sx={{ minWidth: 0 }}>
            <Typography
              className="font-brand-gaming"
              sx={{
                fontSize: { xs: 15, sm: 17 },
                fontWeight: 800,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                background: `linear-gradient(180deg, #ffe08a 0%, ${USER_COLORS.gold} 48%, #d4a017 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              BattleAsia
            </Typography>
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.6),
                whiteSpace: 'nowrap',
              }}
            >
              {t('shop.bacShopName')}
            </Typography>
          </Stack>
        </Stack>

        <AuthHomeLink label={t('auth.home')} />
      </Box>

      <GlassPanelCard
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: 1,
          borderRadius: 0,
          p: wide ? { xs: 3, sm: 4, md: 4.5 } : { xs: 3.25, sm: 4.5 },
          boxShadow: `
            0 28px 60px ${alpha('#000000', 0.65)},
            0 0 40px ${alpha('#f5c518', 0.08)}
          `,
        }}
      >
        {/* Ghost step number behind heading */}
        {mark ? (
          <Typography
            aria-hidden
            className="font-tr"
            sx={{
              position: 'absolute',
              top: { xs: -14, sm: -20 },
              right: { xs: 4, sm: 18 },
              fontSize: { xs: 96, sm: 132 },
              fontWeight: 800,
              lineHeight: 1,
              color: alpha('#f5c518', 0.08),
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
            }}
          >
            {mark}
          </Typography>
        ) : null}

        {/* Heading block — left aligned (zip style) */}
        <Box sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
          <Typography
            className="font-tr"
            sx={{
              fontWeight: 800,
              color: glassTokens.titleColor,
              fontSize: { xs: 26, sm: 32 },
              lineHeight: 1.1,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={{
                mt: 1.25,
                color: glassTokens.subtitleColor,
                fontSize: 13.5,
                lineHeight: 1.55,
                maxWidth: wide ? 480 : 400,
              }}
            >
              {description}
            </Typography>
          ) : null}
          <Box sx={{ ...userPageDividerSx, mt: 2, width: 120 }} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
      </GlassPanelCard>
    </Box>
  );
}
