import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { useTranslate } from 'src/locales/use-locales';

import { authCardSx, AUTH_TEXT_MUTED } from './auth-form-styles';

// ----------------------------------------------------------------------

type AuthFormShellProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  progress?: number;
  steps?: ReactNode;
  wide?: boolean;
  compact?: boolean;
  /** i18n key for line under logo */
  taglineKey?: string;
};

/** Zip `.auth-card` / `.auth-brand` shell — API wiring stays in parent views. */
export function AuthFormShell({
  title,
  description,
  children,
  progress,
  steps,
  wide,
  compact,
  taglineKey = 'auth.brandTagline',
}: AuthFormShellProps) {
  const theme = useTheme();
  const { t } = useTranslate();

  const accentColor = theme.palette.primary.main || '#cbfb24';

  return (
    <Box
      sx={{
        width: 1,
        maxWidth: wide ? { xs: 1, sm: 440, md: 460 } : { xs: 1, sm: 410, md: 430 },
        display: 'flex',
        flexDirection: 'column',
        '@keyframes authViewEnter': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        animation: 'authViewEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box
        sx={{
          ...authCardSx,
          width: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {progress !== undefined && (
          <Box sx={{ position: 'relative', height: 2, bgcolor: alpha('#ffffff', 0.08) }}>
            <Box
              sx={{
                height: 1,
                width: `${progress}%`,
                bgcolor: accentColor,
                transition: 'width 0.35s ease',
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            // Zip `.auth-card-inner`
            px: { xs: '22px', sm: '26px', md: '28px' },
            pt: compact ? { xs: '20px', sm: '22px' } : { xs: '22px', sm: '26px' },
            pb: { xs: '22px', sm: '26px', md: '28px' },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack
            alignItems="center"
            textAlign="center"
            spacing={1}
            sx={{ mb: steps ? 2.25 : 2.25 }}
          >
            <Logo
              disabled
              sx={{
                width: compact ? { xs: 56, sm: 64 } : { xs: 64, sm: 72 },
                height: 'auto',
                pointerEvents: 'none',
                mixBlendMode: 'lighten',
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
                '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
              }}
            />
            <Box
              sx={{
                height: 2,
                width: 28,
                bgcolor: accentColor,
                borderRadius: '2px',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.42),
              }}
            >
              {t(taglineKey)}
            </Typography>

            <Typography
              className="landing-display"
              sx={{
                fontFamily: '"Clash Display", "Satoshi", "Barlow", sans-serif',
                fontWeight: 700,
                color: '#ffffff',
                fontSize: 'clamp(1.05rem, 2.4vw, 1.28rem)',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                textWrap: 'balance',
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                sx={{
                  color: AUTH_TEXT_MUTED,
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  maxWidth: '32ch',
                }}
              >
                {description}
              </Typography>
            )}
          </Stack>

          {steps}

          {children}
        </Box>
      </Box>
    </Box>
  );
}
