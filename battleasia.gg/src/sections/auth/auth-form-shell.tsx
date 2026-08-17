import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { GlassPanelCard, getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

type AuthFormShellProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Use on sign-up — more fields need a wider card */
  wide?: boolean;
  /** Tighter card + header for a smaller footprint (sign-in) */
  compact?: boolean;
};

export function AuthFormShell({ title, description, children, wide, compact }: AuthFormShellProps) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();
  const gold = '#f5c518';

  return (
    <Box
      sx={{
        width: 1,
        maxWidth: wide
          ? { xs: 1, sm: 500, md: 520 }
          : compact
            ? { xs: 1, sm: 352, md: 366 }
            : { xs: 1, sm: 390, md: 408 },
        animation: `${cardReveal} 0.28s ease-out both`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <GlassPanelCard
        sx={{
          width: 1,
          borderRadius: 0,
          border: `1px solid ${alpha(gold, 0.32)}`,
          p: wide ? { xs: 2, sm: 2.5, md: 2.75 } : compact ? { xs: 1.75, sm: 1.9 } : { xs: 2, sm: 2.4 },
          boxShadow: `
            0 24px 60px ${alpha('#000000', 0.65)},
            0 0 0 1px ${alpha(gold, 0.06)},
            0 0 36px ${alpha(gold, 0.1)}
          `,
        }}
      >
        <Stack alignItems="center" spacing={compact ? 0.3 : 0.45} sx={{ mb: compact ? 1 : 1.25 }}>
          <Logo
            disabled
            sx={{
              width: compact ? { xs: 93, sm: 103 } : { xs: 115, sm: 130 },
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
              color: alpha(gold, 0.85),
            }}
          >
            {t('auth.brandTagline')}
          </Typography>
          <Typography
            variant="h6"
            className="font-tr"
            sx={{
              fontWeight: 800,
              color: glassTokens.titleColor,
              textAlign: 'center',
              fontSize: compact ? { xs: 16, sm: 18 } : { xs: 18, sm: 20 },
              lineHeight: 1.2,
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: glassTokens.subtitleColor,
                textAlign: 'center',
                fontSize: compact ? 11.5 : 12.5,
                lineHeight: 1.45,
                maxWidth: wide ? 440 : compact ? 300 : 340,
              }}
            >
              {description}
            </Typography>
          )}
          <Box
            sx={{
              mt: compact ? 0.5 : 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              width: compact ? { xs: 150, sm: 180 } : { xs: 180, sm: 220 },
            }}
          >
            <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${alpha(gold, 0.55)})` }} />
            <Box
              sx={{
                width: 6,
                height: 6,
                flexShrink: 0,
                transform: 'rotate(45deg)',
                bgcolor: gold,
                boxShadow: `0 0 8px ${alpha(gold, 0.6)}`,
              }}
            />
            <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${alpha(gold, 0.55)}, transparent)` }} />
          </Box>
        </Stack>

        {children}
      </GlassPanelCard>
    </Box>
  );
}
