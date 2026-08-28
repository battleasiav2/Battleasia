import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { useTranslate } from 'src/locales/use-locales';

import { AUTH_CARD_BG, authCardSx } from './auth-form-styles';

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
  /** Use on sign-up — more fields need a wider card */
  wide?: boolean;
  /** Tighter card + header for a smaller footprint (sign-in) */
  compact?: boolean;
};

export function AuthFormShell({ title, description, children, wide, compact }: AuthFormShellProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        width: 1,
        maxWidth: wide
          ? { xs: 1, sm: 500, md: 520 }
          : { xs: 1, sm: 480, md: 500 },
        display: 'flex',
        flexDirection: 'column',
        animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box
        sx={{
          width: 1,
          p: wide ? { xs: 2, sm: 2.5, md: 2.75 } : compact ? { xs: 1.75, sm: 1.9 } : { xs: 2, sm: 2.4 },
          ...authCardSx,
        }}
      >
        {/* Home-card gold accent bar */}
        <Box
          sx={{
            height: 2,
            width: 48,
            bgcolor: GOLD,
            mb: compact ? 1.5 : 2,
            mx: 'auto',
            boxShadow: `0 0 12px ${alpha(GOLD, 0.45)}`,
          }}
        />

        <Stack alignItems="center" spacing={compact ? 0.3 : 0.45} sx={{ mb: compact ? 1 : 1.25 }}>
          <Logo
            disabled
            sx={{
              width: compact ? { xs: 112, sm: 124 } : { xs: 138, sm: 156 },
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
              color: alpha(GOLD, 0.85),
            }}
          >
            {t('auth.brandTagline')}
          </Typography>
          <Typography
            variant="h6"
            className="font-tr"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              textAlign: 'center',
              fontSize: compact ? { xs: 16, sm: 18 } : { xs: 17, sm: 19 },
              lineHeight: 1.2,
              letterSpacing: 0.15,
              textTransform: 'none',
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: alpha('#ffffff', 0.55),
                textAlign: 'center',
                fontSize: compact ? 11.5 : 12,
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
            <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.55)})` }} />
            <Box
              sx={{
                width: 6,
                height: 6,
                flexShrink: 0,
                transform: 'rotate(45deg)',
                bgcolor: GOLD,
                boxShadow: `0 0 8px ${alpha(GOLD, 0.6)}`,
              }}
            />
            <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${alpha(GOLD, 0.55)}, transparent)` }} />
          </Box>
        </Stack>

        <Box sx={{ bgcolor: 'transparent', backgroundColor: AUTH_CARD_BG }}>{children}</Box>
      </Box>
    </Box>
  );
}
