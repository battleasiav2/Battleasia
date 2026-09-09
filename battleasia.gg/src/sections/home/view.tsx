import { lazy, Suspense, useState } from 'react';

import { Box, Stack, SvgIcon, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { useImagePreloader } from 'src/hooks';
import { useAppDownload } from 'src/hooks/use-app-download';

import { Iconify } from 'src/components/iconify/iconify';
import { ScrollReveal } from 'src/components/animate';
import { HeroStickyCta } from './hero-sticky-cta';
import { HeroVideoBanner } from './hero-video-banner';
import { Hero3dDeck } from './hero-3d-deck';
import { HeroGamingHud } from './hero-gaming-hud';

import { AboutBattleAsiaSection } from './about-battleasia-section';
import { TournamentRulesSection } from './tournament-rules-section';
import { useTranslate } from 'src/locales/use-locales';
import { goldAlpha } from 'src/theme/accent-presets';

// Below-fold: code-split (never block hero paint)
const LandingDashboardSection = lazy(() =>
  import('./dashboard-widgets').then((m) => ({ default: m.LandingDashboardSection }))
);
const PlayYourGameSection = lazy(() =>
  import('./play-your-game-section').then((m) => ({ default: m.PlayYourGameSection }))
);

// ----------------------------------------------------------------------

const GOLD = 'var(--ba-gold)';
const CHEVRONS_LABEL = '////// ➔';
const STATUS_ARMED_LABEL = '[ STATUS // ARMED ]';

/** Tiny top-of-hero gold sweep — opacity/transform only, no layout cost */
const heroTopSweep = keyframes`
  0% { transform: translate3d(-40%, 0, 0); opacity: 0; }
  18% { opacity: 0.85; }
  42% { opacity: 0.35; }
  55%, 100% { transform: translate3d(140%, 0, 0); opacity: 0; }
`;

const heroTopGlow = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
`;

const HOME_IMAGE_PATHS = {
  heroTitleLogo: '/assets/images/hero-title-battleasia.webp',
} as const;

const HOME_MODE_ARTS = {
  solo: '/landing/single.webp',
  duo: '/landing/duo.webp',
  squad: '/landing/squad.webp',
  tdm: '/landing/mutiple.webp',
} as const;

const MODE_ART_PNG_FALLBACK: Record<keyof typeof HOME_MODE_ARTS, string> = {
  solo: '/landing/single.png',
  duo: '/landing/duo.png',
  squad: '/landing/squad.png',
  tdm: '/landing/mutiple.png',
};

function modeArtKeyFromSrc(src: string): keyof typeof HOME_MODE_ARTS | null {
  const entry = (Object.entries(HOME_MODE_ARTS) as [keyof typeof HOME_MODE_ARTS, string][]).find(
    ([, art]) => art === src
  );
  return entry?.[0] ?? null;
}

// ----------------------------------------------------------------------
// Preload hero video poster and top assets
const imagePaths = [
  '/hero-poster.webp',
  '/assets/images/hero-title-battleasia.webp',
  '/landing/single.webp',
];

export function HomeView() {
  const { t } = useTranslate();
  const appDownload = useAppDownload();
  const [activeModeIndex, setActiveModeIndex] = useState(0);

  useImagePreloader(imagePaths, {
    delay: 100,
    continueOnError: true,
  });


  const sectionSlide = (
    <Box
      id="home"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        // Mobile: size to content so APK / Enter Arena CTAs are never clipped.
        overflow: { xs: 'visible', md: 'hidden' },
        bgcolor: '#000000',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        aspectRatio: { xs: 'auto', md: '16 / 9' },
        minHeight: { xs: 0, sm: 640, md: 640 },
        height: { xs: 'auto', md: 'auto' },
        maxHeight: { md: 'min(900px, 92vh)', lg: 'min(960px, 92vh)' },
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'center',
      }}
    >
      {/* 16:9 Full HD Hero Background Video */}
      <HeroVideoBanner />

      {/* Tiny gold sweep under nav */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 2, md: 3 },
          zIndex: 4,
          pointerEvents: 'none',
          overflow: 'hidden',
          background: `linear-gradient(90deg, transparent 0%, ${goldAlpha(0.15)} 50%, transparent 100%)`,
          animation: `${heroTopGlow} 4.5s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.4 },
          '&::after': {
            content: "''",
            position: 'absolute',
            top: 0,
            left: 0,
            width: '42%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.55)}, ${GOLD}, ${alpha('#fff', 0.35)}, transparent)`,
            animation: `${heroTopSweep} 5.5s 1.2s ease-in-out infinite`,
            willChange: 'transform, opacity',
            '@media (prefers-reduced-motion: reduce)': { display: 'none' },
          },
        }}
      />

      {/* Left 3D Holographic Combat HUD Card (Desktop) */}
      <HeroGamingHud />

      {/* Main 3D Gaming Command Deck (Center on Mobile, Right on Desktop) */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: '1360px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pr: { xs: 2, sm: 3, md: 5, lg: 6, xl: 7 },
          pt: { xs: 2.5, sm: 4, md: 2 },
          pb: { xs: 3, sm: 6, md: 4 },
          display: 'flex',
          justifyContent: { xs: 'center', md: 'flex-end' },
          alignItems: { xs: 'stretch', md: 'center' },
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <Hero3dDeck
          logoSrc={HOME_IMAGE_PATHS.heroTitleLogo}
          downloadHref={appDownload.href}
          downloadFileName={appDownload.fileName}
          showDownload={appDownload.enabled}
        />
      </Box>

      {/* Mobile Sticky CTA Trigger */}
      <HeroStickyCta
        downloadLabel={t('home.downloadApkButton')}
        downloadHref={appDownload.href}
        downloadFileName={appDownload.fileName}
        showDownload={appDownload.enabled}
      />

      {/* Seamless bottom fade into next section */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: { xs: 28, md: 90 },
          background: {
            xs: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 70%, #000000 100%)',
            md: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 60%, #000000 100%)',
          },
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );

  const gameModes = [
    {
      title: t('home.gameModes.solo.title'),
      description: t('home.gameModes.solo.description'),
      art: HOME_MODE_ARTS.solo,
      players: '1',
      playersLabel: t('home.gameModes.solo.playersLabel'),
      iconType: 'svg' as const,
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      features: [
        { iconPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', text: t('home.gameModes.solo.feature1') },
        { iconPath: 'M15.5 12c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5zm-2.5-8c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-1 15l-5-5 1.41-1.41L12 16.17l4.59-4.58L18 13l-6 6z', text: t('home.gameModes.solo.feature2') },
        { iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', text: t('home.gameModes.solo.feature3') },
        { iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', text: t('home.gameModes.solo.feature4') },
      ],
    },
    {
      title: t('home.gameModes.duo.title'),
      description: t('home.gameModes.duo.description'),
      art: HOME_MODE_ARTS.duo,
      players: '2',
      playersLabel: t('home.gameModes.duo.playersLabel'),
      iconType: 'svg' as const,
      iconPath:
        'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      features: [
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.duo.feature1') },
        { iconPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', text: t('home.gameModes.duo.feature2') },
        { iconPath: 'M20 12v-1c0-.6-.4-1-1-1h-3V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v4H1c-.6 0-1 .4-1 1v1c0 1.1.9 2 2 2h1v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4h1c1.1 0 2-.9 2-2zm-6 8H6v-4h8v4zm-8-8V6h8v6H6zm14 0h-1v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2V9c0-.6-.4-1-1-1s-1 .4-1 1v3h3c1.1 0 2 .9 2 2v2h2v-2c0-1.1.9-2 2-2h3z', text: t('home.gameModes.duo.feature3') },
        { iconPath: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', text: t('home.gameModes.duo.feature4') },
      ],
    },
    {
      title: t('home.gameModes.squad.title'),
      description: t('home.gameModes.squad.description'),
      art: HOME_MODE_ARTS.squad,
      players: '4',
      playersLabel: t('home.gameModes.squad.playersLabel'),
      iconType: 'svg' as const,
      iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      features: [
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.squad.feature1') },
        { iconPath: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', text: t('home.gameModes.squad.feature2') },
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.squad.feature3') },
        { iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', text: t('home.gameModes.squad.feature4') },
      ],
    },
    {
      title: t('home.gameModes.tdm.title'),
      description: t('home.gameModes.tdm.description'),
      art: HOME_MODE_ARTS.tdm,
      players: '6–8',
      playersLabel: t('home.gameModes.tdm.playersLabel'),
      iconType: 'svg' as const,
      iconPath: 'M7.05 2.05L5 12h3v7l8-14h-4l2-3z',
      features: [
        { iconPath: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z', text: t('home.gameModes.tdm.feature1') },
        { iconPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', text: t('home.gameModes.tdm.feature2') },
        { iconPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z', text: t('home.gameModes.tdm.feature3') },
        { iconPath: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z', text: t('home.gameModes.tdm.feature4') },
      ],
    },
  ];

  const activeMode = gameModes[activeModeIndex] ?? gameModes[0];

  const sectionHowToPlay = (
    <Box
      id="how-to-play"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: '#06080c',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 5 },
        borderTop: `1px solid ${alpha('#ffffff', 0.06)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.06)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, #000000 0%, transparent 15%, transparent 85%, #000000 100%),
            radial-gradient(ellipse 65% 55% at 75% 50%, ${goldAlpha(0.12)} 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 20% 30%, ${goldAlpha(0.06)} 0%, transparent 60%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1440, mx: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.92fr 1.08fr', xl: '0.88fr 1.12fr' },
            gap: { xs: 4, md: 5, lg: 6 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: Tactical Typography & Mode Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Tactical Label with Chevrons */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: { xs: 11, md: 12 },
                  fontWeight: 900,
                  letterSpacing: 3,
                  color: alpha('#ffffff', 0.6),
                  textTransform: 'uppercase',
                  fontFamily: `'Barlow', sans-serif`,
                }}
              >
                {t('home.playYourGame.brandLabel')}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: GOLD,
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                {CHEVRONS_LABEL}
              </Typography>
            </Stack>

            {/* Big Distressed / Italic Military Heading */}
            <Typography
              variant="h2"
              className="font-tr"
              sx={{
                fontSize: { xs: 36, sm: 48, md: 58, lg: 66 },
                fontWeight: 900,
                fontStyle: 'italic',
                lineHeight: 0.95,
                letterSpacing: { xs: 1.5, md: 2.5 },
                textTransform: 'uppercase',
                color: '#ffffff',
                textShadow: `0 4px 20px rgba(0,0,0,0.9), 0 0 35px ${goldAlpha(0.2)}`,
              }}
            >
              {t('home.howToPlay')}
            </Typography>

            {/* Site-Selected Tactical Accent Bar */}
            <Box
              sx={{
                width: { xs: 52, md: 68 },
                height: 4,
                bgcolor: GOLD,
                boxShadow: `0 0 16px ${goldAlpha(0.85)}`,
                mt: { xs: 1.5, md: 2 },
                mb: { xs: 1.5, md: 2 },
              }}
            />

            {/* Subtitle */}
            <Typography
              className="font-tr"
              sx={{
                fontSize: { xs: 12, sm: 13, md: 14 },
                fontWeight: 700,
                letterSpacing: { xs: 0.8, md: 1.2 },
                color: alpha('#ffffff', 0.65),
                textTransform: 'uppercase',
                lineHeight: 1.6,
                maxWidth: 580,
                mb: { xs: 3, md: 3.5 },
              }}
            >
              {t('home.howToPlaySubtitle')}
            </Typography>

            {/* Interactive Mode Selector Tabs */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 1.25,
                mb: 3,
              }}
            >
              {gameModes.map((mode, idx) => {
                const isSelected = idx === activeModeIndex;
                return (
                  <Box
                    key={mode.title}
                    component="button"
                    type="button"
                    onClick={() => setActiveModeIndex(idx)}
                    sx={{
                      px: { xs: 1.5, sm: 1.75 },
                      py: 1.25,
                      cursor: 'pointer',
                      outline: 'none',
                      textAlign: 'left',
                      bgcolor: isSelected ? goldAlpha(0.14) : alpha('#ffffff', 0.03),
                      border: '1px solid',
                      borderColor: isSelected ? GOLD : alpha('#ffffff', 0.12),
                      borderRadius: 0,
                      position: 'relative',
                      transition: 'all 0.25s ease',
                      boxShadow: isSelected ? `0 0 18px ${goldAlpha(0.35)}` : 'none',
                      '&:hover': {
                        borderColor: isSelected ? GOLD : goldAlpha(0.6),
                        bgcolor: isSelected ? goldAlpha(0.18) : alpha('#ffffff', 0.06),
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 900,
                          color: isSelected ? GOLD : alpha('#ffffff', 0.4),
                          fontFamily: 'monospace',
                        }}
                      >
                        {`//0${idx + 1}`}
                      </Typography>
                      <Typography
                        className="font-tr"
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: isSelected ? GOLD : alpha('#ffffff', 0.35),
                          textTransform: 'uppercase',
                        }}
                      >
                        {mode.playersLabel}
                      </Typography>
                    </Stack>
                    <Typography
                      className="font-tr"
                      sx={{
                        fontSize: { xs: 12, sm: 13 },
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        color: isSelected ? '#ffffff' : alpha('#ffffff', 0.75),
                        textTransform: 'uppercase',
                        lineHeight: 1.1,
                      }}
                    >
                      {mode.title}
                    </Typography>
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -1,
                          left: 0,
                          right: 0,
                          height: 2,
                          bgcolor: GOLD,
                          boxShadow: `0 0 10px ${GOLD}`,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Active Mode Details & Features Panel */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.75 },
                bgcolor: alpha('#0d1117', 0.85),
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                borderLeft: `3px solid ${GOLD}`,
                position: 'relative',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: goldAlpha(0.1),
                    border: `1px solid ${goldAlpha(0.4)}`,
                  }}
                >
                  <SvgIcon sx={{ fontSize: 22, color: GOLD }}>
                    <path d={activeMode.iconPath} />
                  </SvgIcon>
                </Box>
                <Box>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 16, sm: 18 },
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                    }}
                  >
                    {activeMode.title}
                  </Typography>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: GOLD,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeMode.playersLabel}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 12, sm: 13 },
                  color: alpha('#ffffff', 0.7),
                  lineHeight: 1.6,
                  mb: 2.5,
                }}
              >
                {activeMode.description}
              </Typography>

              {/* 4 Features Preserved */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.25,
                  mb: 3,
                }}
              >
                {activeMode.features.map((feature) => (
                  <Stack
                    key={feature.text}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{
                      p: 1.1,
                      bgcolor: alpha('#000000', 0.45),
                      border: `1px solid ${goldAlpha(0.12)}`,
                    }}
                  >
                    <SvgIcon sx={{ fontSize: 16, color: GOLD, flexShrink: 0, mt: 0.2 }}>
                      <path d={feature.iconPath} />
                    </SvgIcon>
                    <Typography
                      className="font-tr"
                      sx={{
                        fontSize: { xs: 11, sm: 12 },
                        color: alpha('#ffffff', 0.8),
                        lineHeight: 1.45,
                        fontWeight: 500,
                      }}
                    >
                      {feature.text}
                    </Typography>
                  </Stack>
                ))}
              </Box>

              {/* CTA Button */}
              <Box
                component="a"
                href="/play"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3.5,
                  minHeight: 42,
                  bgcolor: goldAlpha(0.14),
                  border: `1px solid ${GOLD}`,
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 0 16px ${goldAlpha(0.25)}`,
                  '&:hover': {
                    bgcolor: GOLD,
                    color: 'var(--ba-gold-ink)',
                    boxShadow: `0 0 28px ${goldAlpha(0.7)}`,
                  },
                }}
              >
                {t('home.startPlaying')}
                <Iconify icon="solar:arrow-right-bold" width={16} />
              </Box>
            </Box>
          </Box>

          {/* Right Column: High-Impact Larger Transparent Cutout Gamer Visual */}
          <Box
            sx={{
              position: 'relative',
              height: { xs: 380, sm: 500, md: 620, lg: 720, xl: 780 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            {/* Ambient Radial Backlight Glow in Site Color */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(ellipse 75% 70% at 50% 50%, ${goldAlpha(0.24)} 0%, ${goldAlpha(0.06)} 48%, transparent 75%)
                `,
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Tactical HUD Corner Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontFamily: 'monospace',
                fontSize: 10,
                letterSpacing: 1.5,
                color: goldAlpha(0.85),
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 0.5,
              }}
            >
              <span>{STATUS_ARMED_LABEL}</span>
              <span>{`[ OPERATOR // 0${activeModeIndex + 1} ]`}</span>
            </Box>

            {/* Cutout Gamer Images - Bigger Scale & Clean Drop Shadow */}
            {gameModes.map((mode, idx) => (
              <Box
                key={mode.title}
                component="img"
                src={mode.art}
                alt={mode.title}
                width={1200}
                height={800}
                loading={idx === activeModeIndex ? 'eager' : 'lazy'}
                decoding="async"
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.dataset.fallbackApplied === '1') return;
                  const key = modeArtKeyFromSrc(mode.art);
                  const fallback = key
                    ? MODE_ART_PNG_FALLBACK[key]
                    : mode.art.replace(/\.webp$/i, '.png');
                  if (!fallback) return;
                  img.dataset.fallbackApplied = '1';
                  img.src = fallback;
                }}
                sx={{
                  position: 'absolute',
                  inset: { xs: -10, sm: -20, md: -30 },
                  width: { xs: 'calc(100% + 20px)', sm: 'calc(100% + 40px)', md: 'calc(100% + 60px)' },
                  height: { xs: 'calc(100% + 20px)', sm: 'calc(100% + 40px)', md: 'calc(100% + 60px)' },
                  objectFit: 'contain',
                  objectPosition: 'center center',
                  display: 'block',
                  zIndex: 1,
                  opacity: idx === activeModeIndex ? 1 : 0,
                  transform: idx === activeModeIndex ? 'scale(1.12) translateY(0)' : 'scale(1.02) translateY(14px)',
                  transition: 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: 'none',
                  filter: `drop-shadow(0 25px 50px rgba(0,0,0,0.95)) drop-shadow(0 0 35px ${goldAlpha(0.35)})`,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      className="home-scroll-story"
      sx={{
        bgcolor: '#000000',
        scrollSnapType: { xs: 'none', md: 'y proximity' },
        // Slide-in sections sit translated on the X axis until they scroll into
        // view; `clip` keeps that off-screen travel from widening the page.
        overflowX: 'clip',
      }}
    >
      {/* LCP: hero only — no framer-motion */}
      {sectionSlide}

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <Suspense fallback={<Box sx={{ minHeight: { xs: 520, md: 440 } }} />}>
          <LandingDashboardSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <Suspense fallback={<Box sx={{ minHeight: { xs: 420, md: 380 } }} />}>
          <PlayYourGameSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <AboutBattleAsiaSection />
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        {sectionHowToPlay}
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <TournamentRulesSection />
      </ScrollReveal>
    </Box>
  );
}
