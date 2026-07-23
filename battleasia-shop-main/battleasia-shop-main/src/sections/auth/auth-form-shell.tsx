import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
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
      <GlassPanelCard
        sx={{
          width: 1,
          p: wide ? { xs: 3, sm: 4, md: 4.5 } : { xs: 3.25, sm: 4.5 },
          boxShadow: `
            0 28px 60px ${alpha('#000000', 0.65)},
            0 0 56px ${alpha('#f59e0b', 0.08)},
            inset 0 1px 0 ${alpha('#ffffff', 0.12)}
          `,
        }}
      >
        <Stack alignItems="center" spacing={1.25} sx={{ mb: 3 }}>
          <Logo disabled sx={{ width: { xs: 120, sm: 140 }, height: 'auto', pointerEvents: 'none' }} />
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
              fontSize: { xs: 19, sm: 22 },
              lineHeight: 1.3,
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
