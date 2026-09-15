import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export function AuthHeroPanel() {
  const theme = useTheme();
  const { t } = useTranslate();

  const accentColor = theme.palette.primary.main || '#cbfb24';

  const stats = [
    {
      label: t('auth.statActivePlayers', { defaultValue: 'Active players' }),
      value: '12K+',
      icon: 'solar:users-group-rounded-bold-duotone',
    },
    {
      label: t('auth.statPrizesPaid', { defaultValue: 'BAC shop' }),
      value: 'BAC',
      icon: 'solar:wallet-money-bold-duotone',
    },
    {
      label: t('auth.statMatchRooms', { defaultValue: 'Always on' }),
      value: '24/7',
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
          {t('auth.brandTagline', { defaultValue: 'BattleAsia' })}
        </Typography>

        <Typography
          className="landing-display"
          sx={{
            fontFamily: '"Clash Display", "Satoshi", "Barlow", sans-serif',
            fontSize: 'clamp(1.7rem, 4vw, 2.6rem)',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            mt: 1.5,
          }}
        >
          {t('auth.heroHeadlineLine1', { defaultValue: 'Fuel your' })}
          <br />
          <Box component="span" sx={{ color: accentColor }}>
            {t('auth.heroHeadlineLine2', { defaultValue: 'next match' })}
          </Box>
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            maxWidth: '36ch',
            fontSize: { xs: 14, md: 15 },
            lineHeight: 1.55,
            color: alpha('#ffffff', 0.55),
          }}
        >
          {t('auth.heroDescription', {
            defaultValue: 'Sign in to top up BAC and jump straight back into the arena.',
          })}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ position: 'relative', zIndex: 1 }}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              flex: '1 1 140px',
              minWidth: 120,
              p: 1.5,
              borderRadius: '14px',
              bgcolor: 'rgba(22,22,24,0.38)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${alpha('#ffffff', 0.09)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
              <Iconify icon={stat.icon} width={18} sx={{ color: accentColor }} />
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: alpha('#ffffff', 0.45),
                }}
              >
                {stat.label}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: '"Clash Display", "Satoshi", "Barlow", sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
