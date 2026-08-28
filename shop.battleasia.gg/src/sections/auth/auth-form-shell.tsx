import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { useTranslate } from 'src/locales/use-locales';

import { authCardSx } from './auth-form-styles';

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GOLD = '#f5c518';

type AuthFormShellProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  progress?: number;
  steps?: ReactNode;
  wide?: boolean;
  compact?: boolean;
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
  taglineKey = 'shop.bacShopName',
}: AuthFormShellProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        width: 1,
        maxWidth: wide ? { xs: 1, sm: 420, md: 440 } : { xs: 1, sm: 400, md: 420 },
        display: 'flex',
        flexDirection: 'column',
        animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box sx={{ ...authCardSx, width: 1 }}>
        {progress !== undefined && (
          <Box sx={{ height: 3, bgcolor: alpha('#fff', 0.08) }}>
            <Box
              sx={{
                height: 1,
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${GOLD}, ${alpha(GOLD, 0.55)})`,
                transition: 'width 0.5s ease',
              }}
            />
          </Box>
        )}

        <Box sx={{ px: { xs: 2.75, sm: 3.5 }, py: compact ? { xs: 2.75, sm: 3 } : { xs: 3, sm: 3.5 } }}>
          <Stack alignItems="center" textAlign="center" spacing={0.5} sx={{ mb: steps ? 2 : 2.25 }}>
            <Logo
              disabled
              sx={{
                width: compact ? { xs: 96, sm: 104 } : { xs: 108, sm: 118 },
                height: 'auto',
                pointerEvents: 'none',
                mb: 0.25,
                '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
              }}
            />
            <Box sx={{ height: 2, width: 40, bgcolor: GOLD }} />
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                color: alpha(GOLD, 0.88),
                pt: 0.25,
              }}
            >
              {t(taglineKey)}
            </Typography>
            <Typography
              className="font-tr"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: compact ? { xs: 17, sm: 19 } : { xs: 19, sm: 21 },
                lineHeight: 1.2,
                letterSpacing: -0.2,
                pt: 0.25,
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                sx={{
                  color: alpha('#ffffff', 0.52),
                  fontSize: 13,
                  lineHeight: 1.45,
                  maxWidth: 320,
                  pt: 0.25,
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
