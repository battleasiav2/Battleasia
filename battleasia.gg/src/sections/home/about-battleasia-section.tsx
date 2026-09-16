import { Box, Stack, Container, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { LANDING_V2, landingPanelSx } from './landing-v2-theme';

// ----------------------------------------------------------------------

export function AboutBattleAsiaSection() {
  const theme = useTheme();
  const { t } = useTranslate();

  const accentColor = theme.palette.primary.main || '#cbfb24';

  /** Zip story cards — titles from bullets, body keeps existing aboutDescription copy */
  const storyCards = [
    {
      index: '01',
      icon: 'solar:users-group-rounded-bold-duotone' as const,
      title: t('home.aboutBullet1').split(/[—–-]/)[0]?.trim() || '01',
      body: t('home.aboutDescription1'),
    },
    {
      index: '02',
      icon: 'solar:wallet-money-bold-duotone' as const,
      title: t('home.aboutBullet2').split(/[—–-]/)[0]?.trim() || '02',
      body: t('home.aboutDescription2'),
    },
    {
      index: '03',
      icon: 'solar:card-transfer-bold-duotone' as const,
      title: t('home.aboutBullet3').split(/[—–-]/)[0]?.trim() || '03',
      body: t('home.aboutDescription3'),
    },
  ];

  const prizeLabel = String(CONFIG.homeStats.prizeMoney).replace(/^\$/, '');

  const stats: { value: ReactNode; label: string }[] = [
    {
      value: CONFIG.homeStats.activePlayers,
      label: t('home.stats.activePlayers'),
    },
    {
      value: (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: { xs: 0.75, md: 1 },
          }}
        >
          <Box
            component="img"
            src={CONFIG.currencyIcon}
            alt=""
            sx={{
              width: { xs: 28, md: 36 },
              height: { xs: 28, md: 36 },
              flexShrink: 0,
            }}
          />
          {prizeLabel}
        </Box>
      ),
      label: t('home.stats.prizeMoney'),
    },
    {
      value: CONFIG.homeStats.gamesSupported,
      label: t('home.stats.gamesSupported'),
    },
    {
      value: CONFIG.homeStats.tournaments,
      label: t('home.stats.tournaments'),
    },
  ];

  return (
    <Box
      id="about-us"
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
      }}
    >
      <Box
        component="img"
        src={LANDING_V2.assets.aboutBg}
        alt=""
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: `radial-gradient(70% 60% at 50% 40%, rgba(var(--ba-gold-rgb, 203,251,36), 0.12), rgba(6,6,7,0.62) 78%)`,
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: LANDING_V2.wrap,
          px: 0,
        }}
      >
        {/* Head — zip centered badge + divider + title + sub */}
        <Stack
          alignItems="center"
          spacing={0}
          sx={{ mb: { xs: 5, md: 6 }, textAlign: 'center' }}
        >
          <Box
            sx={{
              fontWeight: 900,
              fontSize: '0.7rem',
              letterSpacing: '0.28em',
              color: accentColor,
              border: `1px solid ${alpha(accentColor, 0.24)}`,
              bgcolor: alpha(accentColor, 0.06),
              px: 2,
              py: 1,
              borderRadius: '999px',
              textTransform: 'uppercase',
            }}
          >
            {t('home.playYourGame.brandLabel')}
          </Box>

          <Box
            aria-hidden
            sx={{
              width: 56,
              height: 1,
              my: 2.5,
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
          />

          <Typography
            component="h2"
            className="landing-display"
            sx={{
              fontFamily: LANDING_V2.display,
              fontWeight: 600,
              fontSize: { xs: '2.2rem', sm: 'clamp(2.2rem, 5.4vw, 4.4rem)' },
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: LANDING_V2.text,
            }}
          >
            {t('home.aboutBattleAsia')}
          </Typography>
        </Stack>

        {/* Story grid — 3 equal glass cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.25,
          }}
        >
          {storyCards.map((card) => (
            <Box
              key={card.index}
              sx={{
                ...landingPanelSx,
                position: 'relative',
                p: { xs: 3.5, md: '32px 28px' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
                minHeight: { md: 240 },
                overflow: 'hidden',
                transition: `transform 0.35s ${LANDING_V2.ease}, border-color 0.35s ease`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: LANDING_V2.hair2,
                },
              }}
            >
              <Typography
                aria-hidden
                className="landing-display"
                sx={{
                  position: 'absolute',
                  top: 18,
                  right: 22,
                  fontFamily: LANDING_V2.display,
                  fontWeight: 600,
                  fontSize: '2.6rem',
                  color: 'rgba(255,255,255,0.06)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {card.index}
              </Typography>

              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  color: accentColor,
                  border: `1px solid ${alpha(accentColor, 0.24)}`,
                  bgcolor: alpha(accentColor, 0.06),
                }}
              >
                <Iconify icon={card.icon} width={24} />
              </Box>

              <Typography
                className="landing-display"
                sx={{
                  fontFamily: LANDING_V2.display,
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', md: '1.45rem' },
                  color: LANDING_V2.text,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color: LANDING_V2.muted,
                  fontSize: { xs: '0.95rem', md: '0.98rem' },
                  lineHeight: 1.55,
                }}
              >
                {card.body}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Stat strip — zip 4-cell hairline grid */}
        <Box
          sx={{
            mt: 2.25,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: '1px',
            border: `1px solid ${LANDING_V2.hair}`,
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: LANDING_V2.hair,
          }}
        >
          {stats.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                bgcolor: 'rgba(10,10,12,0.58)',
                backdropFilter: `blur(${LANDING_V2.blur})`,
                WebkitBackdropFilter: `blur(${LANDING_V2.blur})`,
                py: { xs: 3.5, md: 4 },
                px: { xs: 2, md: 2.75 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1,
              }}
            >
              <Typography
                className="landing-display"
                sx={{
                  fontFamily: LANDING_V2.display,
                  fontWeight: 600,
                  fontSize: { xs: '2rem', md: 'clamp(2rem, 3.4vw, 2.85rem)' },
                  lineHeight: 1,
                  color: LANDING_V2.text,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: LANDING_V2.faint,
                  fontWeight: 700,
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
