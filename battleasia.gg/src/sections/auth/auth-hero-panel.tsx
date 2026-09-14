import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { PLAY_YOUR_GAME_IMAGE_PATHS } from 'src/sections/home/home-game-arts';

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
    },
    {
      label: t('auth.statPrizesPaid'),
      value: CONFIG.homeStats.prizeMoney,
      icon: 'solar:wallet-money-bold-duotone',
    },
    {
      label: t('auth.statMatchRooms'),
      value: CONFIG.homeStats.tournaments ?? '24/7',
      icon: 'solar:medal-ribbons-star-bold-duotone',
    },
  ];

  return (
    <Stack
      spacing={{ xs: 3, md: 3.5 }}
      sx={{
        position: 'relative',
        width: 1,
        maxWidth: 540,
        px: { md: 1 },
      }}
    >
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
          opacity: 0.08,
          filter: 'grayscale(0.5)',
          maskImage: 'radial-gradient(circle at 60% 60%, black 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 60% 60%, black 25%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Stack spacing={1.25} sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          sx={{
            display: 'inline-flex',
            width: 'fit-content',
            px: 1.25,
            py: 0.4,
            borderRadius: '12px',
            bgcolor: alpha('#ffffff', 0.05),
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: accentColor,
          }}
        >
          {t('auth.brandTagline')}
        </Typography>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, sm: 36, md: 42 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: -0.3,
            textTransform: 'uppercase',
          }}
        >
          {t('auth.heroHeadlineLine1')}
          <br />
          <Box component="span" sx={{ color: accentColor }}>
            {t('auth.heroHeadlineLine2')}
          </Box>
        </Typography>

        <Typography
          sx={{
            maxWidth: 440,
            fontSize: { xs: 13.5, sm: 14.5 },
            color: alpha('#ffffff', 0.62),
            lineHeight: 1.6,
          }}
        >
          {t('auth.heroDescription')}
        </Typography>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: { xs: 1, sm: 1.25 },
        }}
      >
        {stats.map((item) => (
          <Box
            key={item.label}
            sx={{
              p: { xs: 1.35, sm: 1.6 },
              borderRadius: '12px',
              bgcolor: alpha('#161618', 0.38),
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              boxShadow: 'none',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <Iconify icon={item.icon} width={15} sx={{ color: accentColor }} />
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: alpha('#ffffff', 0.5),
                }}
              >
                {item.label}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: { xs: 16, sm: 18 },
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
