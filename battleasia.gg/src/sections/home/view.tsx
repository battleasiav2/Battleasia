import { lazy, Suspense } from 'react';

import { Box } from '@mui/material';

import { useImagePreloader } from 'src/hooks';
import { useAppDownload } from 'src/hooks/use-app-download';

import { ScrollReveal } from 'src/components/animate';
import { HeroStickyCta } from './hero-sticky-cta';
import { HeroVideoBanner } from './hero-video-banner';
import { Hero3dDeck } from './hero-3d-deck';

import { AboutBattleAsiaSection } from './about-battleasia-section';
import { HowToPlaySection } from './how-to-play-section';
import { TournamentRulesSection } from './tournament-rules-section';
import { LANDING_V2 } from './landing-v2-theme';
import { useTranslate } from 'src/locales/use-locales';

// Below-fold: code-split (never block hero paint)
const LandingDashboardSection = lazy(() =>
  import('./dashboard-widgets').then((m) => ({ default: m.LandingDashboardSection }))
);
const PlayYourGameSection = lazy(() =>
  import('./play-your-game-section').then((m) => ({ default: m.PlayYourGameSection }))
);

// ----------------------------------------------------------------------

const HOME_IMAGE_PATHS = {
  heroTitleLogo: '/assets/images/hero-title-battleasia.webp',
} as const;

const imagePaths = [
  '/landing-v2/hero-poster.webp',
  '/logo/logo.webp',
  '/landing-v2/games/pubg.webp',
];

export function HomeView() {
  const { t } = useTranslate();
  const appDownload = useAppDownload();

  useImagePreloader(imagePaths, {
    delay: 100,
    continueOnError: true,
  });

  return (
    <Box
      className="home-scroll-story landing-v2"
      sx={{
        bgcolor: 'transparent',
        scrollSnapType: { xs: 'none', md: 'y proximity' },
        overflowX: 'clip',
        fontFamily: LANDING_V2.sans,
      }}
    >
      <Box
        id="home"
        sx={{
          scrollMarginTop: { xs: '80px', md: '100px' },
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
          bgcolor: LANDING_V2.ink,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // Zip `.hero` padding
          pt: { xs: '92px', md: '88px' },
          pb: { xs: '40px', md: 'clamp(48px, 8vh, 88px)' },
        }}
      >
        <HeroVideoBanner />

        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            width: '100%',
            maxWidth: LANDING_V2.wrap,
            mx: 'auto',
            // Zip `--gutter`
            px: 'clamp(20px, 5vw, 64px)',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
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

        <HeroStickyCta
          downloadLabel={t('home.downloadApkButton')}
          downloadHref={appDownload.href}
          downloadFileName={appDownload.fileName}
          showDownload={appDownload.enabled}
        />
      </Box>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <Suspense fallback={<Box sx={{ minHeight: { xs: 420, md: 360 } }} />}>
          <LandingDashboardSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={28} amount={0.06}>
        <Suspense fallback={<Box sx={{ minHeight: { xs: 360, md: 320 } }} />}>
          <PlayYourGameSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <AboutBattleAsiaSection />
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <HowToPlaySection />
      </ScrollReveal>

      <ScrollReveal repeat preset="cinematic" distance={36} amount={0.06}>
        <TournamentRulesSection />
      </ScrollReveal>
    </Box>
  );
}
