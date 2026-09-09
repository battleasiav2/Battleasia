import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

const radarPing = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  50% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
`;

const soundWave1 = keyframes`
  0%, 100% { height: 6px; }
  50% { height: 18px; }
`;

const soundWave2 = keyframes`
  0%, 100% { height: 16px; }
  50% { height: 8px; }
`;

const soundWave3 = keyframes`
  0%, 100% { height: 10px; }
  50% { height: 22px; }
`;

const soundWave4 = keyframes`
  0%, 100% { height: 20px; }
  50% { height: 10px; }
`;

const soundWave5 = keyframes`
  0%, 100% { height: 8px; }
  50% { height: 16px; }
`;

const floatGlow = keyframes`
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.18; }
  50% { transform: translateY(-8px) scale(1.04); opacity: 0.28; }
`;

const TACTICAL_STRIPES = '//////';

// ----------------------------------------------------------------------

type SupportHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SupportHero({ title, subtitle, action }: SupportHeroProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const accentColor = theme.palette.primary.main || USER_COLORS.gold;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${alpha(accentColor, 0.22)}`,
        bgcolor: '#08090d',
        p: { xs: 2.5, sm: 3.5, md: 4 },
        mb: 3,
        boxShadow: `
          0 10px 30px -10px rgba(0, 0, 0, 0.8),
          0 0 40px -15px ${alpha(accentColor, 0.25)},
          inset 0 1px 0 0 ${alpha('#ffffff', 0.1)}
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 10% 20%, ${alpha(accentColor, 0.12)} 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, ${alpha(accentColor, 0.08)} 0%, transparent 50%),
            linear-gradient(180deg, rgba(12, 14, 20, 0.85) 0%, rgba(8, 9, 13, 0.95) 100%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          boxShadow: `0 0 12px ${accentColor}`,
        },
      }}
    >
      {/* Background Floating Holographic Aura */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: '-10%', md: '5%' },
          top: '50%',
          transform: 'translateY(-50%)',
          width: { xs: 220, md: 360 },
          height: { xs: 220, md: 360 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accentColor, 0.18)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          animation: `${floatGlow} 6s ease-in-out infinite`,
          zIndex: 0,
        }}
      />

      {/* Tactical Corner HUD Brackets */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, width: 10, height: 10, borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}`, opacity: 0.7, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, opacity: 0.7, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: 10, left: 10, width: 10, height: 10, borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}`, opacity: 0.7, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 10, height: 10, borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, opacity: 0.7, pointerEvents: 'none' }} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={3}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* Left Side: Stencil Header + Title + Telemetry Subtitle */}
        <Box sx={{ maxWidth: { md: 620 } }}>
          {/* Top Classification Badge */}
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.25 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.2,
                py: 0.4,
                bgcolor: alpha(accentColor, 0.12),
                border: `1px solid ${alpha(accentColor, 0.35)}`,
                clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              }}
            >
              <Typography sx={{ fontSize: 9.5, fontWeight: 900, letterSpacing: 1.5, color: accentColor, textTransform: 'uppercase' }}>
                {t('customerSupport.badgeLiveSupport') || 'TAC-OPS HQ // COMMS RELAY'}
              </Typography>
              <Typography sx={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: 1.2 }}>
                {TACTICAL_STRIPES}
              </Typography>
            </Box>

            {/* Live Online Satellite Pulse */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.7}
              sx={{
                px: 1,
                py: 0.35,
                bgcolor: alpha('#22c55e', 0.1),
                border: `1px solid ${alpha('#22c55e', 0.3)}`,
                borderRadius: '4px',
              }}
            >
              <Box
                sx={{
                  width: 6.5,
                  height: 6.5,
                  borderRadius: '50%',
                  bgcolor: '#22c55e',
                  animation: `${radarPing} 2s ease-out infinite`,
                }}
              />
              <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: '#22c55e', textTransform: 'uppercase' }}>
                {t('customerSupport.online') || 'ACTIVE RELAY'}
              </Typography>
            </Stack>
          </Stack>

          {/* Slanted Bold Display Title */}
          <Typography
            component="h1"
            sx={{
              fontFamily: `'Barlow', 'Public Sans Variable', sans-serif`,
              fontSize: { xs: 26, sm: 32, md: 38 },
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              color: '#ffffff',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              textShadow: `0 4px 18px ${alpha('#000000', 0.9)}`,
              mb: 1,
            }}
          >
            {title}
          </Typography>

          {/* Subtitle / Telemetry briefing */}
          {subtitle && (
            <Typography
              sx={{
                fontSize: { xs: 12.5, sm: 13.5 },
                fontWeight: 500,
                color: alpha('#ffffff', 0.72),
                lineHeight: 1.6,
                letterSpacing: 0.2,
                maxWidth: 540,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Real-Time Telemetry Bar with Soundwave Comms Audio Visualizer */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              mt: 2,
              pt: 1.5,
              borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {/* Audio Comms Soundwave Frequency Visualizer */}
            <Stack direction="row" alignItems="center" spacing={0.4} sx={{ height: 24, px: 1, bgcolor: alpha('#ffffff', 0.03), borderRadius: '4px', border: `1px solid ${alpha('#ffffff', 0.08)}` }}>
              <Box sx={{ width: 2.5, bgcolor: accentColor, borderRadius: '1px', animation: `${soundWave1} 1.1s ease-in-out infinite` }} />
              <Box sx={{ width: 2.5, bgcolor: accentColor, borderRadius: '1px', animation: `${soundWave2} 0.9s ease-in-out infinite` }} />
              <Box sx={{ width: 2.5, bgcolor: accentColor, borderRadius: '1px', animation: `${soundWave3} 1.3s ease-in-out infinite` }} />
              <Box sx={{ width: 2.5, bgcolor: accentColor, borderRadius: '1px', animation: `${soundWave4} 0.8s ease-in-out infinite` }} />
              <Box sx={{ width: 2.5, bgcolor: accentColor, borderRadius: '1px', animation: `${soundWave5} 1.2s ease-in-out infinite` }} />
              <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: alpha('#ffffff', 0.6), letterSpacing: 0.8, ml: 0.6 }}>
                COMMS LINE #01
              </Typography>
            </Stack>

            {/* Monospace Telemetry Specs */}
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: 1,
                color: alpha('#ffffff', 0.45),
              }}
            >
              ENCRYPTION: AES-256 · LATENCY: 14MS · SATELLITE: ASIA_NORTH
            </Typography>
          </Stack>
        </Box>

        {/* Right Side: Optional Action or 3D Operative Comms Badge */}
        {action ? (
          <Box sx={{ flexShrink: 0 }}>{action}</Box>
        ) : (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2.25,
              borderRadius: '12px',
              bgcolor: alpha('#ffffff', 0.03),
              border: `1px solid ${alpha(accentColor, 0.25)}`,
              boxShadow: `0 8px 24px -6px ${alpha('#000000', 0.6)}`,
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                transform: 'translateY(-3px) scale(1.02)',
                borderColor: accentColor,
              },
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(accentColor, 0.15),
                border: `1.5px solid ${accentColor}`,
                boxShadow: `0 0 16px ${alpha(accentColor, 0.4)}`,
                mb: 1,
              }}
            >
              <Iconify icon="solar:headphones-round-sound-bold" width={26} sx={{ color: accentColor }} />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#ffffff', letterSpacing: 1, textTransform: 'uppercase' }}>
              DISPATCH AGENT
            </Typography>
            <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: alpha('#ffffff', 0.5), letterSpacing: 0.6 }}>
              RESPONSE &lt; 5 MINS
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
