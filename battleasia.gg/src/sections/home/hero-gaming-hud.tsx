import { useState, useEffect } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const hudCardFloat = keyframes`
  0%, 100% {
    transform: perspective(1000px) rotateY(10deg) rotateX(4deg) translate3d(0, 0, 0);
  }
  50% {
    transform: perspective(1000px) rotateY(7deg) rotateX(2deg) translate3d(0, -8px, 12px);
  }
`;

const sweepRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const eqBarAnim = keyframes`
  0%, 100% { height: 4px; }
  25% { height: 16px; }
  50% { height: 8px; }
  75% { height: 20px; }
`;

const shimmerBeam = keyframes`
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(200%); }
`;

export function HeroGamingHud() {
  const [onlinePlayers, setOnlinePlayers] = useState(3842);

  // Micro-fluctuation for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(3800, prev + delta);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: { xs: 'none', lg: 'block' },
        position: 'absolute',
        left: { lg: 36, xl: 56 },
        bottom: { lg: 68, xl: 84 },
        zIndex: 3,
        pointerEvents: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 320,
          p: 2.25,
          borderRadius: '12px',
          bgcolor: alpha('#06090e', 0.82),
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: `1px solid ${goldAlpha(0.28)}`,
          boxShadow: `
            0 20px 50px rgba(0, 0, 0, 0.7),
            0 0 20px ${goldAlpha(0.12)},
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          clipPath:
            'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
          animation: `${hudCardFloat} 7s ease-in-out infinite`,
          transformStyle: 'preserve-3d',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'default',
          '&:hover': {
            transform:
              'perspective(1000px) rotateY(2deg) rotateX(1deg) translate3d(0, -6px, 24px) scale(1.02)',
            borderColor: goldAlpha(0.55),
            boxShadow: `
              0 25px 60px rgba(0, 0, 0, 0.8),
              0 0 30px ${goldAlpha(0.25)},
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 48,
            height: 2,
            bgcolor: 'var(--ba-gold)',
            boxShadow: `0 0 8px ${goldAlpha(0.8)}`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${goldAlpha(0.08)}, transparent)`,
            transform: 'translateX(-100%)',
            animation: `${shimmerBeam} 6s 1s ease-in-out infinite`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Header Telemetry with Authentic Tactical Radar Scope */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            {/* Real Tactical Radar Scope (360° sweep beam + target reticle) */}
            <Box
              sx={{
                position: 'relative',
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: '#02060b',
                border: '1px solid rgba(34, 197, 94, 0.65)',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.35)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* Range Ring */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: '5px',
                  borderRadius: '50%',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                }}
              />
              {/* Axes */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: '1px',
                  bgcolor: 'rgba(34, 197, 94, 0.2)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '1px',
                  bgcolor: 'rgba(34, 197, 94, 0.2)',
                }}
              />
              {/* Conical Radar Sweep */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(34, 197, 94, 0.15) 310deg, rgba(34, 197, 94, 0.85) 360deg)',
                  animation: `${sweepRotate} 3s linear infinite`,
                }}
              />
              {/* Target Squad Blip */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '28%',
                  left: '65%',
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  bgcolor: '#22c55e',
                  boxShadow: '0 0 5px #22c55e',
                }}
              />
            </Box>

            <Stack spacing={0.1}>
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: '#22c55e',
                  lineHeight: 1,
                }}
              >
                TACTICAL RADAR
              </Typography>
              <Typography
                sx={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  color: alpha('#ffffff', 0.55),
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                12MS • ASIA SOUTH
              </Typography>
            </Stack>
          </Stack>

          {/* Equalizer Comms Visualizer */}
          <Stack direction="row" alignItems="flex-end" spacing={0.4} sx={{ height: 18, px: 0.5 }}>
            {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 2.5,
                  borderRadius: 0.5,
                  bgcolor: 'var(--ba-gold)',
                  boxShadow: `0 0 6px ${goldAlpha(0.6)}`,
                  animation: `${eqBarAnim} 1.4s ${delay}s ease-in-out infinite`,
                }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Middle Stats */}
        <Stack spacing={0.75} sx={{ my: 1.25 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.6), fontWeight: 600 }}>
              ACTIVE WARRIORS
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'monospace',
                letterSpacing: 0.5,
                textShadow: '0 0 10px rgba(255,255,255,0.4)',
              }}
            >
              {onlinePlayers.toLocaleString()}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.6), fontWeight: 600 }}>
              PRIZE POOL ARENA
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 900,
                color: 'var(--ba-gold)',
                fontFamily: 'monospace',
                letterSpacing: 0.5,
                textShadow: `0 0 12px ${goldAlpha(0.7)}`,
              }}
            >
              $50,000 USD
            </Typography>
          </Stack>
        </Stack>

        {/* Bottom Game Chips (Solid 1px border, zero dashes) */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            pt: 1.25,
            borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
          }}
        >
          {['SOLO', 'DUO', 'SQUAD'].map((mode) => (
            <Box
              key={mode}
              sx={{
                flex: 1,
                py: 0.4,
                textAlign: 'center',
                borderRadius: '4px',
                bgcolor: alpha('#ffffff', 0.05),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: goldAlpha(0.15),
                  borderColor: goldAlpha(0.5),
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: alpha('#ffffff', 0.85),
                }}
              >
                {mode}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Anti-cheat verified tag (Clean bullet separator, zero dashes) */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25 }}>
          <Iconify icon="solar:shield-check-bold" width={13} sx={{ color: 'var(--ba-gold)' }} />
          <Typography
            sx={{
              fontSize: 9.5,
              color: alpha('#ffffff', 0.55),
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            MILITARY GRADE ANTI CHEAT • 128 TICK SERVER
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
