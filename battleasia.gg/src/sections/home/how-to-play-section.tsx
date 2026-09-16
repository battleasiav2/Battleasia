import { useState } from 'react';

import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { LANDING_V2, landingCharAuraSx, landingCharImgFilter, landingCharPlinthSx, landingPanelSx, landingPrimaryBtnSx, landingSectionTitleSx } from './landing-v2-theme';
import { LandingAtmosphere } from './landing-atmosphere';

// ----------------------------------------------------------------------

const MODE_ARTS = {
  solo: LANDING_V2.assets.modes.solo,
  duo: LANDING_V2.assets.modes.duo,
  squad: LANDING_V2.assets.modes.squad,
  tdm: LANDING_V2.assets.modes.tdm,
} as const;

type ModeKey = keyof typeof MODE_ARTS;

// ----------------------------------------------------------------------

export function HowToPlaySection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [activeIndex, setActiveIndex] = useState(0);
  const accentColor = theme.palette.primary.main || '#cbfb24';

  const gameModes = [
    {
      key: 'solo' as ModeKey,
      title: t('home.gameModes.solo.title'),
      description: t('home.gameModes.solo.description'),
      players: '1',
      playersLabel: t('home.gameModes.solo.playersLabel'),
      features: [
        t('home.gameModes.solo.feature1'),
        t('home.gameModes.solo.feature2'),
        t('home.gameModes.solo.feature3'),
        t('home.gameModes.solo.feature4'),
      ],
    },
    {
      key: 'duo' as ModeKey,
      title: t('home.gameModes.duo.title'),
      description: t('home.gameModes.duo.description'),
      players: '2',
      playersLabel: t('home.gameModes.duo.playersLabel'),
      features: [
        t('home.gameModes.duo.feature1'),
        t('home.gameModes.duo.feature2'),
        t('home.gameModes.duo.feature3'),
        t('home.gameModes.duo.feature4'),
      ],
    },
    {
      key: 'squad' as ModeKey,
      title: t('home.gameModes.squad.title'),
      description: t('home.gameModes.squad.description'),
      players: '4',
      playersLabel: t('home.gameModes.squad.playersLabel'),
      features: [
        t('home.gameModes.squad.feature1'),
        t('home.gameModes.squad.feature2'),
        t('home.gameModes.squad.feature3'),
        t('home.gameModes.squad.feature4'),
      ],
    },
    {
      key: 'tdm' as ModeKey,
      title: t('home.gameModes.tdm.title'),
      description: t('home.gameModes.tdm.description'),
      players: '6–8',
      playersLabel: t('home.gameModes.tdm.playersLabel'),
      features: [
        t('home.gameModes.tdm.feature1'),
        t('home.gameModes.tdm.feature2'),
        t('home.gameModes.tdm.feature3'),
        t('home.gameModes.tdm.feature4'),
      ],
    },
  ];

  const active = gameModes[activeIndex] ?? gameModes[0];
  const modeNum = String(activeIndex + 1).padStart(2, '0');

  return (
    <Box
      id="how-to-play"
      component="section"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        bgcolor: 'transparent',
        color: LANDING_V2.text,
        py: { xs: 9, sm: 11, md: 'clamp(72px, 10vw, 148px)' },
        px: { xs: 2.5, sm: 4, md: 5 },
        borderTop: `1px solid ${LANDING_V2.hair}`,
      }}
    >
      <LandingAtmosphere src={LANDING_V2.assets.modes.squad} opacity={0.5} />
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: LANDING_V2.wrap, mx: 'auto' }}>
        <Box sx={{ mb: { xs: 4, md: 5 }, maxWidth: '62ch' }}>
          <Typography
            component="h2"
            className="landing-display"
            sx={{
              ...landingSectionTitleSx,
              fontStyle: 'italic',
              letterSpacing: '-0.04em',
            }}
          >
            {t('home.howToPlay')}
          </Typography>
          <Typography
            sx={{
              mt: 2,
              color: LANDING_V2.muted,
              fontSize: { xs: '1rem', md: '1.12rem' },
              lineHeight: 1.5,
            }}
          >
            {t('home.howToPlaySubtitle')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
            gap: { xs: 2, md: 2.5 },
            alignItems: 'stretch',
          }}
        >
          {/* Mode selector — zip vertical list / mobile horizontal rail */}
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            spacing={1}
            role="tablist"
            aria-label="Match mode"
            sx={{
              overflowX: { xs: 'auto', md: 'visible' },
              pb: { xs: 0.5, md: 0 },
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {gameModes.map((mode, idx) => {
              const selected = idx === activeIndex;
              return (
                <ButtonBase
                  key={mode.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveIndex(idx)}
                  sx={{
                    flex: { xs: '0 0 auto', md: 'none' },
                    minWidth: { xs: 158, md: 'auto' },
                    width: { md: 1 },
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gridTemplateRows: 'auto auto',
                    columnGap: 1.5,
                    rowGap: 0.25,
                    alignItems: 'center',
                    px: 1.75,
                    py: 1.5,
                    textAlign: 'left',
                    borderRadius: LANDING_V2.radiusSm,
                    border: '1px solid',
                    borderColor: selected ? accentColor : LANDING_V2.hair,
                    bgcolor: selected ? alpha(accentColor, 0.06) : LANDING_V2.panel,
                    backdropFilter: `blur(${LANDING_V2.blur})`,
                    WebkitBackdropFilter: `blur(${LANDING_V2.blur})`,
                    boxShadow: selected ? `0 0 0 1px ${alpha(accentColor, 0.14)}` : 'none',
                    transition: `border-color 0.25s ${LANDING_V2.ease}`,
                    '&:hover': {
                      borderColor: selected ? accentColor : LANDING_V2.hair2,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      gridRow: '1 / 3',
                      fontFamily: LANDING_V2.display,
                      fontWeight: 600,
                      fontSize: mode.players.length > 2 ? '1.12rem' : '1.5rem',
                      color: accentColor,
                      minWidth: 52,
                      textAlign: 'center',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {mode.players}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: LANDING_V2.display,
                      fontWeight: 600,
                      fontSize: '1.08rem',
                      textTransform: 'uppercase',
                      color: LANDING_V2.text,
                      lineHeight: 1.1,
                    }}
                  >
                    {mode.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: LANDING_V2.faint,
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {mode.playersLabel}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>

          {/* Mode detail panel */}
          <Box
            sx={{
              ...landingPanelSx,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '0.78fr 1fr' },
              overflow: 'hidden',
              minHeight: { lg: 420 },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 220, lg: 'auto' },
                bgcolor: alpha('#000', 0.35),
                borderRight: { lg: `1px solid ${LANDING_V2.hair}` },
                borderBottom: { xs: `1px solid ${LANDING_V2.hair}`, lg: 'none' },
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Box aria-hidden sx={landingCharAuraSx} />
              <Box aria-hidden sx={landingCharPlinthSx} />
              {gameModes.map((mode, idx) => (
                <Box
                  key={mode.key}
                  component="img"
                  src={MODE_ARTS[mode.key]}
                  alt={mode.title}
                  width={640}
                  height={800}
                  loading={idx === activeIndex ? 'eager' : 'lazy'}
                  decoding="async"
                  sx={{
                    position: idx === activeIndex ? 'relative' : 'absolute',
                    inset: 0,
                    width: 1,
                    height: 1,
                    maxHeight: { xs: 260, lg: 480 },
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                    opacity: idx === activeIndex ? 1 : 0,
                    transition: `opacity 0.35s ${LANDING_V2.ease}`,
                    pointerEvents: 'none',
                    zIndex: 2,
                    filter: landingCharImgFilter,
                  }}
                />
              ))}
            </Box>

            <Box
              sx={{
                p: { xs: 2.75, md: 'clamp(22px, 3vw, 36px)' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: accentColor,
                }}
              >
                MODE {modeNum}
              </Typography>

              <Typography
                component="h3"
                sx={{
                  fontFamily: LANDING_V2.display,
                  fontWeight: 600,
                  fontSize: { xs: '1.35rem', md: 'clamp(1.35rem, 2.3vw, 1.9rem)' },
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                }}
              >
                {active.title}
              </Typography>

              <Typography sx={{ color: LANDING_V2.muted, fontSize: '0.98rem', lineHeight: 1.55 }}>
                {active.description}
              </Typography>

              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  m: 0,
                  p: 0,
                  borderBlock: `1px solid ${LANDING_V2.hair}`,
                }}
              >
                {active.features.map((feature, i) => (
                  <Box
                    component="li"
                    key={`${active.key}-f-${i}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 1.35,
                      borderTop: i === 0 ? 'none' : `1px solid ${LANDING_V2.hair}`,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.68rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: LANDING_V2.faint,
                        fontWeight: 700,
                        flexShrink: 0,
                        pt: 0.2,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </Typography>
                    <Typography
                      component="b"
                      sx={{
                        fontFamily: LANDING_V2.display,
                        fontWeight: 500,
                        fontSize: { xs: '0.88rem', sm: '0.95rem' },
                        textAlign: 'right',
                        lineHeight: 1.35,
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    border: `1px solid ${LANDING_V2.hair}`,
                    bgcolor: alpha('#fff', 0.03),
                    fontSize: 12,
                    fontWeight: 600,
                    color: LANDING_V2.muted,
                  }}
                >
                  {active.playersLabel}
                </Box>
              </Stack>

              <ButtonBase
                component="a"
                href="/play"
                sx={{
                  ...landingPrimaryBtnSx,
                  mt: 0.5,
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3.25,
                  minHeight: 48,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <span>{t('home.startPlaying')}</span>
                <Iconify icon="solar:arrow-right-bold" width={18} />
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
