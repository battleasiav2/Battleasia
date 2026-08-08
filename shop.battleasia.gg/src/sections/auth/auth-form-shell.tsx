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
};

export function AuthFormShell({ title, description, children, wide }: AuthFormShellProps) {
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <AuthHomeLink label={t('auth.home')} />
      </Box>

      <GlassPanelCard
        sx={{
          width: 1,
          borderRadius: 0,
          p: wide ? { xs: 3, sm: 4, md: 4.5 } : { xs: 3.25, sm: 4.5 },
          boxShadow: `
            0 28px 60px ${alpha('#000000', 0.65)},
            0 0 40px ${alpha('#f5c518', 0.08)}
          `,
        }}
      >
        <Stack alignItems="center" spacing={1.25} sx={{ mb: 3 }}>
          <Logo
            disabled
            sx={{
              width: { xs: 132, sm: 156 },
              height: 'auto',
              pointerEvents: 'none',
              '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
            }}
          />
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: alpha('#f5c518', 0.85),
            }}
          >
            {t('shop.bacShopName')}
          </Typography>
          <Typography
            variant="h5"
            className="font-tr"
            sx={{
              fontWeight: 800,
              color: glassTokens.titleColor,
              textAlign: 'center',
              fontSize: { xs: 20, sm: 24 },
              lineHeight: 1.25,
              letterSpacing: 0.4,
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={{
                color: glassTokens.subtitleColor,
                textAlign: 'center',
                fontSize: 13,
                lineHeight: 1.55,
                maxWidth: wide ? 480 : 380,
              }}
            >
              {description}
            </Typography>
          ) : null}
          <Box sx={{ ...userPageDividerSx, mt: 0.75, width: { xs: 150, sm: 200 } }} />
        </Stack>

        {children}
      </GlassPanelCard>
    </Box>
  );
}
