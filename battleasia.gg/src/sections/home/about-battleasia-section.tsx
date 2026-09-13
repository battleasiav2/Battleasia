import { useState } from 'react';

import { Box, Stack, Container, Typography, Grid2 as Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

import { PLAY_YOUR_GAME_IMAGE_PATHS } from './home-game-arts';

// ----------------------------------------------------------------------

export function AboutBattleAsiaSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const accentColor = theme.palette.primary.main || '#cbfb24';
  const accentContrast = theme.palette.primary.contrastText || '#081401';

  const statCards = [
    {
      value: CONFIG.homeStats.activePlayers,
      label: t('home.stats.activePlayers'),
      icon: 'solar:users-group-rounded-bold-duotone',
      tint: accentColor,
    },
    {
      value: CONFIG.homeStats.prizeMoney,
      label: t('home.stats.prizeMoney'),
      icon: 'solar:wallet-money-bold-duotone',
      tint: '#f59e0b',
    },
    {
      value: CONFIG.homeStats.gamesSupported,
      label: t('home.stats.gamesSupported'),
      icon: 'solar:gamepad-minimalistic-bold-duotone',
      tint: '#38bdf8',
    },
    {
      value: CONFIG.homeStats.tournaments,
      label: t('home.stats.tournaments'),
      icon: 'solar:medal-ribbons-star-bold-duotone',
      tint: '#a855f7',
    },
  ] as const;

  const paragraphs = [
    t('home.aboutDescription1'),
    t('home.aboutDescription2'),
    t('home.aboutDescription3'),
  ] as const;

  const directives = [
    {
      index: '01',
      icon: 'solar:cup-star-bold-duotone',
    },
    {
      index: '02',
      icon: 'solar:gamepad-bold-duotone',
    },
    {
      index: '03',
      icon: 'solar:shield-check-bold-duotone',
    },
  ];

  return (
    <Box
      id="about-us"
      component="section"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: '#06090e',
        color: '#ffffff',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Stack spacing={1.5} alignItems="center" sx={{ mb: { xs: 5, md: 7 }, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2,
              py: 0.6,
              borderRadius: '8px',
              bgcolor: '#161618',
              border: `1px solid ${alpha(accentColor, 0.28)}`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: accentColor,
              }}
            />
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 800,
                letterSpacing: 2.8,
                color: accentColor,
                textTransform: 'uppercase',
              }}
            >
              {t('home.playYourGame.brandLabel')}
            </Typography>
          </Box>

          <Typography
            variant="h2"
            className="font-tr"
            sx={{
              fontSize: { xs: 26, sm: 36, md: 46 },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: { xs: 1.5, md: 3 },
              lineHeight: 1.1,
              color: '#ffffff',
            }}
          >
            {t('home.aboutBattleAsia')}
          </Typography>

          <Box sx={{ width: '100%', maxWidth: 360, mt: 0.5 }}>
            <BattleGoldDivider variant="hero" showCenterGem />
          </Box>
        </Stack>

        <Grid container spacing={{ xs: 3.5, md: 4.5 }} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6.5 }}>
            <Stack spacing={2.25} sx={{ height: 1, justifyContent: 'space-between' }}>
              {paragraphs.map((paragraph, index) => {
                const directive = directives[index];
                const isHovered = hoveredCard === index;

                return (
                  <Box
                    key={directive.index}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      position: 'relative',
                      p: { xs: 2.2, sm: 2.6, md: 3 },
                      pl: { xs: 2.6, sm: 3, md: 3.4 },
                      borderRadius: '12px',
                      bgcolor: '#161618',
                      border: `1px solid ${isHovered ? alpha(accentColor, 0.28) : alpha('#ffffff', 0.08)}`,
                      transition: 'border-color 0.2s ease',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        bgcolor: isHovered ? accentColor : alpha(accentColor, 0.35),
                        transition: 'background-color 0.2s ease',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.6 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: isHovered ? accentColor : alpha(accentColor, 0.12),
                          color: isHovered ? accentContrast : accentColor,
                          display: 'grid',
                          placeItems: 'center',
                          border: `1px solid ${alpha(accentColor, 0.28)}`,
                          transition: 'background-color 0.2s ease, color 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={directive.icon} width={18} />
                      </Box>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }} />

                      <Typography
                        sx={{
                          fontFamily: `'Barlow', sans-serif`,
                          fontSize: 22,
                          fontWeight: 900,
                          color: isHovered ? alpha(accentColor, 0.45) : alpha('#ffffff', 0.15),
                          transition: 'color 0.2s ease',
                          userSelect: 'none',
                        }}
                      >
                        {directive.index}
                      </Typography>
                    </Stack>

                    <Typography
                      className="font-tr"
                      sx={{
                        fontSize: { xs: 13.5, sm: 14.5, md: 15.5 },
                        lineHeight: { xs: 1.65, md: 1.75 },
                        color: isHovered ? '#ffffff' : alpha('#ffffff', 0.78),
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {paragraph}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5.5 }}>
            <Box
              sx={{
                position: 'relative',
                height: 1,
                minHeight: { xs: 380, md: 440 },
                borderRadius: '12px',
                p: { xs: 2.5, sm: 3 },
                bgcolor: '#161618',
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile}
                alt="Operative Watermark"
                sx={{
                  position: 'absolute',
                  right: '-12%',
                  bottom: '-12%',
                  width: { xs: '65%', md: '75%' },
                  maxWidth: 380,
                  opacity: 0.08,
                  filter: 'grayscale(0.5) contrast(1.1)',
                  maskImage: 'radial-gradient(circle at 60% 60%, black 30%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at 60% 60%, black 30%, transparent 80%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: { xs: 1.75, sm: 2 },
                  position: 'relative',
                  zIndex: 1,
                  flexGrow: 1,
                }}
              >
                {statCards.map((stat, idx) => {
                  const isHovered = hoveredStat === idx;

                  return (
                    <Box
                      key={stat.label}
                      onMouseEnter={() => setHoveredStat(idx)}
                      onMouseLeave={() => setHoveredStat(null)}
                      sx={{
                        position: 'relative',
                        p: { xs: 2, sm: 2.4 },
                        borderRadius: '10px',
                        bgcolor: '#06090e',
                        border: `1px solid ${isHovered ? alpha(stat.tint, 0.28) : alpha('#ffffff', 0.08)}`,
                        borderTop: `2px solid ${isHovered ? stat.tint : alpha(stat.tint, 0.4)}`,
                        transition: 'border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '6px',
                            bgcolor: alpha(stat.tint, 0.1),
                            border: `1px solid ${alpha(stat.tint, 0.28)}`,
                            color: stat.tint,
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Iconify icon={stat.icon} width={16} />
                        </Box>
                      </Stack>

                      <Typography
                        className="font-tr"
                        sx={{
                          fontSize: { xs: 26, sm: 32, md: 36 },
                          fontWeight: 900,
                          lineHeight: 1.1,
                          letterSpacing: 0.5,
                          color: '#ffffff',
                          my: 0.5,
                        }}
                      >
                        {stat.value}
                      </Typography>

                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          className="font-tr"
                          sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: 700,
                            color: isHovered ? '#ffffff' : alpha('#ffffff', 0.72),
                            lineHeight: 1.3,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            transition: 'color 0.2s ease',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
