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
            px: { xs: 2.5, sm: 3.25 },
            py: compact ? { xs: 2.5, sm: 2.75 } : { xs: 2.75, sm: 3.25 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack alignItems="center" textAlign="center" spacing={0.55} sx={{ mb: steps ? 1.75 : 2 }}>
            <Logo
              disabled
              sx={{
                width: compact ? { xs: 96, sm: 104 } : { xs: 108, sm: 118 },
                height: 'auto',
                pointerEvents: 'none',
                mb: 0.25,
                filter: 'none',
                '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
              }}
            />
            <Box sx={{ height: 2, width: 36, bgcolor: accentColor, borderRadius: 0 }} />
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.55),
                pt: 0.15,
              }}
            >
              {t(taglineKey)}
            </Typography>

            <Typography
              className="font-tr"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: compact ? { xs: 18, sm: 20 } : { xs: 20, sm: 22 },
                lineHeight: 1.25,
                letterSpacing: -0.2,
                pt: 0.2,
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                sx={{
                  color: AUTH_TEXT_MUTED,
                  fontSize: { xs: 13, sm: 13.5 },
                  lineHeight: 1.45,
                  maxWidth: 320,
                  pt: 0.2,
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
