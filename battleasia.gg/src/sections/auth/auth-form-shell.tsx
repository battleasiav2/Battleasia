import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { authCardSx } from './auth-form-styles';

// ----------------------------------------------------------------------

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GOLD = '#f5c518';

type AuthFormShellProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Top progress bar width 0–100 */
  progress?: number;
  /** Step pills shown below the header */
  steps?: ReactNode;
  wide?: boolean;
  compact?: boolean;
};

export function AuthFormShell({
  title,
  description,
  children,
  progress,
  steps,
  wide,
  compact,
}: AuthFormShellProps) {
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
          <Box sx={{ height: 4, bgcolor: alpha('#fff', 0.08) }}>
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

        <Box sx={{ px: { xs: 3, sm: 4 }, py: compact ? { xs: 3, sm: 3.25 } : { xs: 3.5, sm: 4 } }}>
          <Stack alignItems="center" textAlign="center" spacing={0.75} sx={{ mb: steps ? 0 : 2.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                bgcolor: alpha(GOLD, 0.15),
                color: GOLD,
                boxShadow: `0 0 20px -5px ${alpha(GOLD, 0.45)}`,
              }}
            >
              <Iconify icon="solar:shield-check-bold-duotone" width={24} />
            </Box>
            <Typography
              className="font-tr"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: compact ? { xs: 18, sm: 20 } : { xs: 20, sm: 22 },
                lineHeight: 1.2,
                letterSpacing: -0.2,
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                sx={{
                  color: alpha('#ffffff', 0.55),
                  fontSize: 13,
                  lineHeight: 1.45,
                  maxWidth: 340,
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
