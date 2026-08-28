import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { useTranslate } from 'src/locales/use-locales';

import { HOME_GOLD, HOME_ROW_LINE, HomeBlurPanel } from 'src/sections/home/home-blur-panel';

export function AuthHeroPanel() {
  const { t } = useTranslate();

  const stats = [
    { label: t('auth.statActivePlayers'), value: CONFIG.homeStats.activePlayers ?? '12K+' },
    { label: t('auth.statPrizesPaid'), value: CONFIG.homeStats.prizeMoney },
    { label: t('auth.statMatchRooms'), value: CONFIG.homeStats.tournaments ?? '24/7' },
  ];

  return (
    <Stack spacing={{ xs: 2.5, md: 3.5 }} sx={{ width: 1, maxWidth: 520, px: { md: 1 } }}>
      <Stack spacing={1.25}>
        <Typography
          sx={{
            fontSize: { xs: 11, md: 12 },
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: HOME_GOLD,
          }}
        >
          {t('auth.brandTagline')}
        </Typography>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, md: 40, lg: 48 },
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: { xs: 0.5, md: 1 },
            textTransform: 'uppercase',
          }}
        >
          {t('auth.heroHeadlineLine1')}
          <br />
          {t('auth.heroHeadlineLine2')}
        </Typography>
        <Typography
          sx={{
            maxWidth: 420,
            fontSize: { xs: 13, md: 14 },
            color: alpha('#ffffff', 0.5),
            lineHeight: 1.65,
          }}
        >
          {t('auth.heroDescription')}
        </Typography>
      </Stack>

      <HomeBlurPanel sx={{ maxWidth: 420, p: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {stats.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                px: { xs: 1.15, sm: 1.75 },
                py: 1.5,
                borderTop: `2px solid ${HOME_GOLD}`,
                ...(index > 0 ? { borderLeft: HOME_ROW_LINE } : {}),
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  textTransform: 'uppercase',
                  color: alpha('#fff', 0.55),
                  lineHeight: 1.25,
                }}
              >
                {item.label}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </HomeBlurPanel>
    </Stack>
  );
}
