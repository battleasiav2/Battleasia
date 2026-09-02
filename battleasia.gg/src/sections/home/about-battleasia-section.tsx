import { Box, Stack, Typography, Grid2 as Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { goldAlpha } from 'src/theme/accent-presets';

import { CONFIG } from 'src/global-config';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

import { HOME_GAME_ARTS } from './home-game-arts';
import {
  HOME_GOLD,
  HOME_TEXT_PRIMARY,
  HOME_TEXT_SECONDARY,
  HOME_TEXT_MUTED,
  HomeBlurPanel,
} from './home-blur-panel';

// ----------------------------------------------------------------------

function blackGamingSectionSx(art?: string) {
  return {
    scrollMarginTop: { xs: '80px', md: '100px' },
    position: 'relative' as const,
    overflowX: 'clip' as const,
    overflowY: 'visible' as const,
    bgcolor: '#0a0a0a',
    py: { xs: 3.25, md: 5 },
    px: { xs: 2, md: 4 },
    ...(art
      ? {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${art})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.18,
            filter: 'grayscale(0.35) contrast(1.05)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(180deg, ${alpha('#0a0a0a', 0.82)} 0%, ${alpha('#0a0a0a', 0.92)} 45%, #0a0a0a 100%),
              radial-gradient(ellipse 70% 45% at 50% 0%, ${goldAlpha( 0.08)} 0%, transparent 55%)
            `,
            pointerEvents: 'none',
            zIndex: 0,
          },
        }
      : {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 70% 45% at 50% 0%, ${goldAlpha( 0.08)} 0%, transparent 55%),
              radial-gradient(ellipse 40% 30% at 10% 100%, ${alpha('#38bdf8', 0.04)} 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }),
  };
}

function AboutStatCard({ value, label }: { value: string; label: string }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 100, sm: 136, md: 160 },
        height: 1,
        borderRadius: 1.5,
        bgcolor: alpha('#161618', 0.88),
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderTop: `2px solid ${HOME_GOLD}`,
        boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.05)}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.5,
        textAlign: 'center',
        px: { xs: 1.25, sm: 1.5 },
        py: { xs: 1.25, sm: 1.5 },
        overflow: 'hidden',
      }}
    >
      <Typography
        className="font-tr"
        sx={{
          fontSize: { xs: 28, sm: 34, md: 38 },
          fontWeight: 800,
          color: HOME_TEXT_PRIMARY,
          lineHeight: 1.15,
        }}
      >
        {value}
      </Typography>
      <Typography
        className="font-tr"
        sx={{
          fontSize: { xs: 12, sm: 13, md: 14 },
          fontWeight: 600,
          color: HOME_TEXT_MUTED,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function AboutBattleAsiaSection() {
  const { t } = useTranslate();

  const statCards = [
    { value: CONFIG.homeStats.activePlayers, label: t('home.stats.activePlayers') },
    { value: CONFIG.homeStats.prizeMoney, label: t('home.stats.prizeMoney') },
    { value: CONFIG.homeStats.gamesSupported, label: t('home.stats.gamesSupported') },
    { value: CONFIG.homeStats.tournaments, label: t('home.stats.tournaments') },
  ] as const;

  const paragraphs = [
    t('home.aboutDescription1'),
    t('home.aboutDescription2'),
    t('home.aboutDescription3'),
  ] as const;

  return (
    <Box id="about-us" sx={{ ...blackGamingSectionSx(HOME_GAME_ARTS[0]), position: 'relative' }}>
      <Stack
        spacing={{ xs: 2.25, md: 3 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 1120, mx: 'auto', width: 1 }}
      >
        <Stack spacing={1.25} alignItems="center">
          <Typography
            sx={{
              fontSize: { xs: 11, md: 12 },
              fontWeight: 700,
              letterSpacing: 2.5,
              color: HOME_GOLD,
              textTransform: 'uppercase',
            }}
          >
            {t('home.playYourGame.brandLabel')}
          </Typography>
          <Typography
            variant="h2"
            className="font-tr"
            sx={{
              fontSize: { xs: 22, sm: 32, md: 40 },
              fontWeight: 800,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: { xs: 1, md: 2 },
              color: HOME_TEXT_PRIMARY,
            }}
          >
            {t('home.aboutBattleAsia')}
          </Typography>
          <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
        </Stack>

        <HomeBlurPanel sx={{ p: { xs: 1.5, sm: 2, md: 2.25 } }}>
          <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: 'left' }}>
                {paragraphs.map((paragraph) => (
                  <Typography
                    key={paragraph.slice(0, 24)}
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 14, sm: 16, md: 18 },
                      lineHeight: { xs: 1.65, md: 1.75 },
                      color: HOME_TEXT_SECONDARY,
                    }}
                  >
                    {paragraph}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Grid container spacing={{ xs: 1.5, sm: 1.75 }} sx={{ height: 1 }}>
                {statCards.map((stat) => (
                  <Grid key={stat.label} size={6} sx={{ display: 'flex' }}>
                    <AboutStatCard value={stat.value} label={stat.label} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </HomeBlurPanel>
      </Stack>
    </Box>
  );
}
