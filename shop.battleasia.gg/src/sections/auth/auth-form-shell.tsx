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
        maxWidth: wide ? { xs: 1, sm: 540, md: 560 } : { xs: 1, sm: 420, md: 440 },
        animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <AuthHomeLink label={t('auth.home')} />
      </Box>

      <GlassPanelCard
        sx={{
          width: 1,
          borderRadius: 0,
          p: wide ? { xs: 2.5, sm: 3, md: 3.5 } : { xs: 2.75, sm: 3.25 },
          boxShadow: `
            0 24px 50px ${alpha('#000000', 0.6)},
            0 0 32px ${alpha('#f5c518', 0.07)}
          `,
        }}
      >
        <Stack alignItems="center" spacing={0.75} sx={{ mb: 2.25 }}>
          <Logo
            disabled
            sx={{
              width: { xs: 92, sm: 104 },
              height: 'auto',
              pointerEvents: 'none',
              '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
            }}
          />
          <Typography
            sx={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: alpha('#f5c518', 0.85),
            }}
          >
            {t('shop.bacShopName')}
          </Typography>
          <Typography
            variant="h6"
            className="font-tr"
            sx={{
              fontWeight: 800,
              color: glassTokens.titleColor,
              textAlign: 'center',
              fontSize: { xs: 18, sm: 20 },
              lineHeight: 1.2,
              letterSpacing: 0.3,
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
                fontSize: 12.5,
                lineHeight: 1.5,
                maxWidth: wide ? 440 : 340,
              }}
            >
              {description}
            </Typography>
          ) : null}
          <Box sx={{ ...userPageDividerSx, mt: 0.5, width: { xs: 120, sm: 150 } }} />
        </Stack>

        {children}
      </GlassPanelCard>
    </Box>
  );
}
