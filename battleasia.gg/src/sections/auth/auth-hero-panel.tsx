import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { PLAY_YOUR_GAME_IMAGE_PATHS } from 'src/sections/home/home-game-arts';

// ----------------------------------------------------------------------
// KEYFRAME ANIMATIONS
// ----------------------------------------------------------------------

const beaconPulse = keyframes`
  0% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(203, 251, 36, 0.7);
  }
  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 8px rgba(203, 251, 36, 0);
  }
  100% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(203, 251, 36, 0);
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

const operativeFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.015);
  }
`;

// ----------------------------------------------------------------------

export function AuthHeroPanel() {
  const theme = useTheme();
  const { t } = useTranslate();

  const accentColor = theme.palette.primary.main || '#cbfb24';

  const stats = [
    {
      label: t('auth.statActivePlayers'),
      value: CONFIG.homeStats.activePlayers ?? '12K+',
      icon: 'solar:users-group-rounded-bold-duotone',
      tint: accentColor,
    },
    {
      label: t('auth.statPrizesPaid'),
      value: CONFIG.homeStats.prizeMoney,
      icon: 'solar:wallet-money-bold-duotone',
      tint: '#f59e0b',
    },
    {
      label: t('auth.statMatchRooms'),
      value: CONFIG.homeStats.tournaments ?? '24/7',
      icon: 'solar:medal-ribbons-star-bold-duotone',
      tint: '#38bdf8',
    },
  ];

  return (
    <Stack
      spacing={{ xs: 3, md: 4 }}
      sx={{
        position: 'relative',
        width: 1,
        maxWidth: 540,
        px: { md: 1 },
      }}
    >
      {/* Translucent Operative Silhouette Watermark */}
      <Box
        component="img"
        src={PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile}
        alt=""
        sx={{
          position: 'absolute',
          right: { xs: '-5%', md: '-8%' },
          bottom: { xs: '-10%', md: '-15%' },
          width: { xs: 260, md: 360 },
          maxWidth: '100%',
          opacity: 0.1,
          filter: 'grayscale(0.4) contrast(1.2)',
          maskImage: 'radial-gradient(circle at 60% 60%, black 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 60% 60%, black 25%, transparent 75%)',
          animation: `${operativeFloat} 6s ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Hero Header Content */}
      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Tactical Classification Stencil */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.2,
            px: 1.8,
            py: 0.5,
            width: 'fit-content',
            borderRadius: '999px',
            bgcolor: alpha(accentColor, 0.08),
            border: `1px solid ${alpha(accentColor, 0.3)}`,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 0 16px ${alpha(accentColor, 0.15)}`,
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: accentColor,
              animation: `${beaconPulse} 2s infinite ease-in-out`,
            }}
          />
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: { xs: 10, sm: 11 },
              fontWeight: 800,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: accentColor,
            }}
          >
            {t('auth.brandTagline')}
          </Typography>
        </Box>

        {/* Monumental Dual-Tone Shimmer Headline */}
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, sm: 36, md: 44, lg: 48 },
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: { xs: 0.5, md: 1 },
            textTransform: 'uppercase',
            background: `linear-gradient(135deg, #ffffff 0%, #f1f5f9 35%, ${accentColor} 70%, #ffffff 100%)`,
            backgroundSize: '200% auto',
            animation: `${titleShimmer} 7s linear infinite`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 4px 20px ${alpha(accentColor, 0.35)})`,
          }}
        >
          {t('auth.heroHeadlineLine1')}
          <br />
          {t('auth.heroHeadlineLine2')}
        </Typography>

        {/* Hero Description */}
        <Typography
          sx={{
            maxWidth: 440,
            fontSize: { xs: 13.5, sm: 14.5, md: 15 },
            color: alpha('#ffffff', 0.68),
            lineHeight: 1.65,
          }}
        >
          {t('auth.heroDescription')}
        </Typography>
      </Stack>

      {/* 3D Chamfered Holographic Telemetry Cores (Platform Stats) */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: { xs: 1.25, sm: 1.75 },
        }}
      >
        {stats.map((item) => (
          <Box
            key={item.label}
            sx={{
              position: 'relative',
              p: { xs: 1.5, sm: 2 },
              borderRadius: '12px',
              clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              bgcolor: alpha('#0d111a', 0.88),
              backdropFilter: 'blur(16px)',
              border: `1px solid ${alpha(item.tint, 0.35)}`,
              borderTop: `2px solid ${item.tint}`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
              transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.02)',
                borderColor: item.tint,
                boxShadow: `0 14px 32px rgba(0,0,0,0.8), 0 0 20px ${alpha(item.tint, 0.3)}`,
              },
            }}
          >
            {/* Top Row: Icon + Status */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  bgcolor: alpha(item.tint, 0.14),
                  color: item.tint,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon={item.icon} width={15} />
              </Box>

              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 8.5,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: item.tint,
                  textTransform: 'uppercase',
                }}
              >
                ● LIVE
              </Typography>
            </Stack>

            {/* Glowing Metric Number */}
            <Typography
              className="font-tr"
              sx={{
                fontSize: { xs: 20, sm: 24, md: 26 },
                fontWeight: 900,
                lineHeight: 1.1,
                background: `linear-gradient(180deg, #ffffff 20%, ${item.tint} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.4,
              }}
            >
              {item.value}
            </Typography>

            {/* Metric Label */}
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.6),
                lineHeight: 1.25,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
