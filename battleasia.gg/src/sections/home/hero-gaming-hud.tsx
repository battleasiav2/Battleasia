import { useState, useEffect } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

export function HeroGamingHud() {
  const [onlinePlayers, setOnlinePlayers] = useState(3842);

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
          width: 300,
          p: 2,
          borderRadius: '12px',
          bgcolor: alpha('#06090e', 0.82),
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: `1px solid ${goldAlpha(0.28)}`,
          boxShadow: `0 12px 28px ${alpha('#000000', 0.4)}, inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#22c55e',
              lineHeight: 1,
            }}
          >
            LIVE
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: alpha('#ffffff', 0.45),
              lineHeight: 1,
            }}
          >
            Pulse
          </Typography>
        </Stack>

        <Stack spacing={0.7} sx={{ mb: 1.25 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.55), fontWeight: 600 }}>
              ACTIVE WARRIORS
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: '#ffffff',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 0.3,
              }}
            >
              {onlinePlayers.toLocaleString()}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography sx={{ fontSize: 11, color: alpha('#ffffff', 0.55), fontWeight: 600 }}>
              PRIZE POOL ARENA
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: 'var(--ba-gold)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 0.3,
              }}
            >
              $50,000 USD
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            pt: 1.15,
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
              }}
            >
              <Typography
                sx={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: alpha('#ffffff', 0.85),
                }}
              >
                {mode}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.15 }}>
          <Iconify icon="solar:shield-check-bold" width={13} sx={{ color: 'var(--ba-gold)' }} />
          <Typography
            sx={{
              fontSize: 9.5,
              color: alpha('#ffffff', 0.5),
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            FAIR PLAY • SECURE MATCHES
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
