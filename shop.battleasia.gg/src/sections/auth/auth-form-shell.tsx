import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { AuthHomeLink } from 'src/components/mesh-buttons/auth-home-link';
import { GlassPanelCard, getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { useTranslate } from 'src/locales/use-locales';

import { userPageDividerSx } from 'src/layouts/user/user-theme';

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
  /** Ghost step number shown behind the heading (e.g. "01", "02") */
  mark?: string;
};

export function AuthFormShell({ title, description, children, wide, mark }: AuthFormShellProps) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();
  const gold = '#f5c518';

  return (
    <Box
      sx={{
        width: 1,
        maxWidth: wide ? { xs: 1, sm: 540, md: 560 } : { xs: 1, sm: 420, md: 440 },
        animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      <GlassPanelCard
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: 1,
          borderRadius: 0,
          p: wide ? { xs: 2.5, sm: 3.25, md: 3.5 } : { xs: 2.75, sm: 3.5 },
          boxShadow: `
            0 24px 50px ${alpha('#000000', 0.6)},
            0 0 32px ${alpha(gold, 0.07)}
          `,
        }}
      >
        {/* Top bar: brand (left) + back-to-home (right) */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: { xs: 2.5, sm: 3 } }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Logo
              disabled
              sx={{
                width: { xs: 34, sm: 38 },
                height: 'auto',
                pointerEvents: 'none',
                '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: 8.5, sm: 9 },
                fontWeight: 700,
                letterSpacing: 1.4,
                lineHeight: 1.3,
                textTransform: 'uppercase',
                color: alpha(gold, 0.9),
                maxWidth: 120,
              }}
            >
              {t('shop.bacShopName')}
            </Typography>
          </Stack>

          <AuthHomeLink label={t('auth.home')} />
        </Stack>

        {/* Ghost step number */}
        {mark ? (
          <Typography
            aria-hidden
            className="font-tr"
            sx={{
              position: 'absolute',
              right: { xs: 14, sm: 22 },
              top: { xs: 44, sm: 52 },
              fontWeight: 800,
              lineHeight: 1,
              fontSize: { xs: 72, sm: 92 },
              color: alpha(gold, 0.06),
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {mark}
          </Typography>
        ) : null}

        {/* Heading block — left aligned like the reference */}
        <Box sx={{ position: 'relative', zIndex: 1, mb: { xs: 2.5, sm: 3 } }}>
          <Typography
            className="font-tr"
            sx={{
              fontWeight: 800,
              color: glassTokens.titleColor,
              textTransform: 'uppercase',
              fontSize: { xs: 24, sm: 28 },
              lineHeight: 1.1,
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: glassTokens.subtitleColor,
                fontSize: 12.5,
                lineHeight: 1.55,
                maxWidth: wide ? 460 : 360,
              }}
            >
              {description}
            </Typography>
          ) : null}
          <Box sx={{ ...userPageDividerSx, mt: 1.75, ml: 0, mr: 'auto', width: { xs: 90, sm: 110 } }} />
        </Box>

        {children}
      </GlassPanelCard>
    </Box>
  );
}
