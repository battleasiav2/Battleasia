import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { useTranslate } from 'src/locales/use-locales';

import { authCardSx, AUTH_TEXT_MUTED } from './auth-form-styles';

// ----------------------------------------------------------------------
// KEYFRAME ANIMATIONS
// ----------------------------------------------------------------------

const zoomOutEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.14) translateY(-8px);
    filter: blur(12px);
  }
  65% {
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
`;

const titleShimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const laserSweep = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
`;

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
        animation: `${zoomOutEnter} 0.75s cubic-bezier(0.16, 1, 0.3, 1) both`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box
        sx={{
          ...authCardSx,
          width: 1,
          position: 'relative',
          borderRadius: '16px',
          clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
          bgcolor: alpha('#0b0e17', 0.48),
          background: `linear-gradient(145deg, ${alpha('#141a26', 0.62)} 0%, ${alpha('#070a10', 0.42)} 100%)`,
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          border: `1px solid ${alpha(accentColor, 0.38)}`,
          borderTop: `1px solid ${alpha('#ffffff', 0.35)}`,
          boxShadow: `0 28px 68px rgba(0,0,0,0.75), 0 0 45px ${alpha(accentColor, 0.15)}, inset 0 1px 1px ${alpha('#ffffff', 0.25)}`,
          overflow: 'hidden',
          transition: 'all 0.35s ease',
          '&:hover': {
            boxShadow: `0 34px 80px rgba(0,0,0,0.85), 0 0 55px ${alpha(accentColor, 0.22)}, inset 0 1px 1.5px ${alpha('#ffffff', 0.35)}`,
          },
        }}
      >
        {/* Top Illuminated Laser Edge */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            boxShadow: `0 0 12px ${accentColor}`,
            zIndex: 3,
          }}
        />

        {/* Tactical Corner HUD Reticles */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 8,
            fontFamily: 'monospace',
            fontSize: 10,
            color: alpha(accentColor, 0.5),
            pointerEvents: 'none',
            zIndex: 2,
            userSelect: 'none',
          }}
        >
          ⌜
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 8,
            fontFamily: 'monospace',
            fontSize: 10,
            color: alpha(accentColor, 0.5),
            pointerEvents: 'none',
            zIndex: 2,
            userSelect: 'none',
          }}
        >
          ⌝
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            fontFamily: 'monospace',
            fontSize: 10,
            color: alpha(accentColor, 0.5),
            pointerEvents: 'none',
            zIndex: 2,
            userSelect: 'none',
          }}
        >
          ⌞
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            fontFamily: 'monospace',
            fontSize: 10,
            color: alpha(accentColor, 0.5),
            pointerEvents: 'none',
            zIndex: 2,
            userSelect: 'none',
          }}
        >
          ⌟
        </Box>

        {/* Progress Bar with Glowing Head */}
        {progress !== undefined && (
          <Box sx={{ position: 'relative', height: 3.5, bgcolor: alpha('#ffffff', 0.08), zIndex: 3 }}>
            <Box
              sx={{
                height: 1,
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.8)})`,
                boxShadow: `0 0 10px ${accentColor}`,
                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                '&::after': {
                  content: "''",
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '30%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6))',
                  animation: `${laserSweep} 1.5s infinite linear`,
                },
              }}
            />
          </Box>
        )}

        <Box sx={{ px: { xs: 2.75, sm: 3.5 }, py: compact ? { xs: 2.75, sm: 3 } : { xs: 3, sm: 3.5 }, position: 'relative', zIndex: 2 }}>
          {/* Card Header */}
          <Stack alignItems="center" textAlign="center" spacing={0.6} sx={{ mb: steps ? 2 : 2.25 }}>
            <Logo
              disabled
              sx={{
                width: compact ? { xs: 96, sm: 104 } : { xs: 108, sm: 118 },
                height: 'auto',
                pointerEvents: 'none',
                mb: 0.25,
                filter: `drop-shadow(0 0 12px ${alpha(accentColor, 0.3)})`,
                '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
              }}
            />
            <Box sx={{ height: 2, width: 44, bgcolor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
            <Typography
              sx={{
                fontSize: { xs: 10.5, sm: 11.5 },
                fontWeight: 800,
                letterSpacing: 2.5,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                color: accentColor,
                pt: 0.25,
              }}
            >
              {t(taglineKey)}
            </Typography>

            {/* Title with Metallic Gradient & Glow */}
            <Typography
              className="font-tr"
              sx={{
                fontWeight: 900,
                color: '#ffffff',
                fontSize: compact ? { xs: 18, sm: 20 } : { xs: 20, sm: 22 },
                lineHeight: 1.2,
                letterSpacing: -0.2,
                pt: 0.25,
                background: `linear-gradient(135deg, #ffffff 0%, #f1f5f9 40%, ${accentColor} 80%, #ffffff 100%)`,
                backgroundSize: '200% auto',
                animation: `${titleShimmer} 7s linear infinite`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
