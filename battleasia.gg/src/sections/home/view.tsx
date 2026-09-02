
import { lazy, Suspense, useState } from 'react';

import { Box, Stack, SvgIcon, Collapse, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { useImagePreloader } from 'src/hooks';
import { useAppDownload } from 'src/hooks/use-app-download';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { HeroMeshButtons } from 'src/components/mesh-buttons';
import { HeroStickyCta } from './hero-sticky-cta';
import { HeroTrustRow } from './hero-trust-row';
import { HOME_GAME_ARTS } from './home-game-arts';
import { HOME_ROW_LINE, HomeBlurPanel } from './home-blur-panel';
import { homeMobileScrollGridSx, homeMobileScrollItemSx } from './home-horizontal-scroll';
import { HeroRotatingBanner } from './hero-rotating-banner';
import { HOME_HERO_SLIDES, readHeroSlideIndex } from './hero-slides';
import { AboutBattleAsiaSection } from './about-battleasia-section';
import { useTranslate } from 'src/locales/use-locales';
import { goldAlpha } from 'src/theme/accent-presets';

// Below-fold + non-LCP FX: code-split (never block hero paint)
const HeroFxOverlay = lazy(() =>
  import('./hero-fx-overlay').then((m) => ({ default: m.HeroFxOverlay }))
);
const LandingDashboardSection = lazy(() =>
  import('./dashboard-widgets').then((m) => ({ default: m.LandingDashboardSection }))
);
const PlayYourGameSection = lazy(() =>
  import('./play-your-game-section').then((m) => ({ default: m.PlayYourGameSection }))
);

// ----------------------------------------------------------------------

const GOLD = 'var(--ba-gold)';

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const titleGlow = keyframes`
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 24px ${goldAlpha(0.35)}; }
`;

const borderPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
`;

const logoEnter = keyframes`
  0% { opacity: 0; transform: translateY(16px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const logoShimmer = keyframes`
  0% { transform: translateX(-120%) skewX(-16deg); opacity: 0; }
  15% { opacity: 0.75; }
  35% { opacity: 0.3; }
  50%, 100% { transform: translateX(160%) skewX(-16deg); opacity: 0; }
`;

const copyEnter = keyframes`
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
`;

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

type TournamentRuleItemProps = {
  question: string;
  answer: string;
};

function TournamentRuleItem({
  question,
  answer,
  defaultOpen = false,
}: TournamentRuleItemProps & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box sx={{ borderBottom: `1px solid ${alpha('#ffffff', 0.1)}` }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        sx={{
          width: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          py: { xs: 1.5, md: 1.65 },
          px: { xs: 1, md: 1.25 },
          mx: { xs: -1, md: -1.25 },
          border: 'none',
          borderLeft: `2px solid ${open ? GOLD : 'transparent'}`,
          bgcolor: open ? goldAlpha(0.06) : 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'inherit',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            bgcolor: goldAlpha(0.08),
            borderLeftColor: goldAlpha(0.75),
            transform: 'translateX(2px)',
          },
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            flex: 1,
            fontSize: { xs: 12, sm: 13, md: 14 },
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: { xs: 0.4, md: 0.6 },
            color: '#ffffff',
            lineHeight: 1.35,
            wordBreak: 'break-word',
          }}
        >
          {question}
        </Typography>

        <Box
          aria-hidden
          sx={{
            width: { xs: 34, md: 38 },
            height: { xs: 34, md: 38 },
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            border: `2px solid ${open ? GOLD : goldAlpha(0.72)}`,
            color: GOLD,
            transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
            transform: open ? 'rotate(45deg)' : 'none',
            bgcolor: open ? goldAlpha(0.12) : 'transparent',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 13,
              height: 13,
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '50%',
                bgcolor: 'currentColor',
                borderRadius: 1,
              },
              '&::before': {
                width: 2.5,
                height: 13,
                transform: 'translate(-50%, -50%)',
              },
              '&::after': {
                width: 13,
                height: 2.5,
                transform: 'translate(-50%, -50%)',
              },
            }}
          />
        </Box>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Typography
          className="font-tr"
          sx={{
            pb: { xs: 1.5, md: 1.65 },
            px: { xs: 1, md: 1.25 },
            fontSize: { xs: 12, sm: 13 },
            color: alpha('#ffffff', 0.58),
            lineHeight: 1.6,
          }}
        >
          {answer}
        </Typography>
      </Collapse>
    </Box>
  );
}

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
              radial-gradient(ellipse 70% 45% at 50% 0%, ${goldAlpha(0.08)} 0%, transparent 55%)
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
              radial-gradient(ellipse 70% 45% at 50% 0%, ${goldAlpha(0.08)} 0%, transparent 55%),
              radial-gradient(ellipse 40% 30% at 10% 100%, ${alpha('#38bdf8', 0.04)} 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }),
  };
}

const HOME_IMAGE_PATHS = {
  heroTitleLogo: '/assets/images/hero-title-battleasia.webp',
} as const;

const HOME_MODE_ARTS = {
  solo: '/assets/images/home/modes/mode-solo.webp',
  duo: '/assets/images/home/modes/mode-duo.webp',
  squad: '/assets/images/home/modes/mode-squad.webp',
  tdm: '/assets/images/home/modes/mode-tdm.webp',
} as const;

const MODE_ART_PNG_FALLBACK: Record<keyof typeof HOME_MODE_ARTS, string> = {
  solo: '/assets/images/home/modes/mode-solo.png',
  duo: '/assets/images/home/modes/mode-duo.png',
  squad: '/assets/images/home/modes/mode-squad.png',
  tdm: '/assets/images/home/modes/mode-tdm.png',
};

function modeArtKeyFromSrc(src: string): keyof typeof HOME_MODE_ARTS | null {
  const entry = (Object.entries(HOME_MODE_ARTS) as [keyof typeof HOME_MODE_ARTS, string][]).find(
    ([, art]) => art === src
  );
  return entry?.[0] ?? null;
}

// ----------------------------------------------------------------------
// Preload active hero slide only (restored index if any) — avoid competing with LCP.
const imagePaths = [HOME_HERO_SLIDES[readHeroSlideIndex()]?.src].filter(Boolean) as string[];

export function HomeView() {
  const { t } = useTranslate();
  const appDownload = useAppDownload();

  useImagePreloader(imagePaths, {
    delay: 100,
    continueOnError: true,
  });

  const FAQ = [
    {
      question: t('home.faq.noHacks'),
      answer: t('home.faq.noHacksAnswer')
    },
    {
      question: t('home.faq.matchJoinTime'),
      answer: t('home.faq.matchJoinTimeAnswer')
    },
    {
      question: t('home.faq.nameMustMatch'),
      answer: t('home.faq.nameMustMatchAnswer')
    },
    {
      question: t('home.faq.killPrizeClaims'),
      answer: t('home.faq.killPrizeClaimsAnswer')
    },
    {
      question: t('home.faq.noTeaming'),
      answer: t('home.faq.noTeamingAnswer')
    },
    {
      question: t('home.faq.paymentRules'),
      answer: t('home.faq.paymentRulesAnswer')
    },
    {
      question: t('home.faq.disconnectNoRefund'),
      answer: t('home.faq.disconnectNoRefundAnswer')
    },
    {
      question: t('home.faq.abusiveBehaviour'),
      answer: t('home.faq.abusiveBehaviourAnswer')
    },
    {
      question: t('home.faq.prizeDistribution'),
      answer: t('home.faq.prizeDistributionAnswer')
    },
    {
      question: t('home.faq.finalDecision'),
      answer: t('home.faq.finalDecisionAnswer')
    },
  ];

  const sectionSlide = (
    <Box id="home" sx={{
      scrollMarginTop: { xs: '80px', md: '100px' },
      height: { xs: 520, sm: 680, md: 860, lg: 920 },
      bgcolor: '#000000',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: {
          xs: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.14) 62%, rgba(0,0,0,0.55) 100%)',
          // Keep art readable behind hero copy — no heavy black plate on the right
          md: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 42%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.22) 100%)',
        },
        zIndex: 1,
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: {
          xs: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 24%, transparent 72%, rgba(0,0,0,0.35) 100%)',
          md: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.35) 100%)',
        },
        zIndex: 1,
      },
    }}>
      {/* Full hero image — rotates every ~12s; last slide kept across reload */}
      <HeroRotatingBanner />

      {/* Tiny gold sweep under nav — CSS only, md+, reduced-motion off */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 2, md: 3 },
          zIndex: 3,
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

      <Suspense fallback={null}>
        <HeroFxOverlay />
      </Suspense>

      {/* Copy + mobile CTAs — mid-hero cluster (not stuck in the black fade) */}
      <Stack
        spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
        sx={{
          position: 'absolute',
          zIndex: 2,
          top: { xs: 72, sm: 84, md: 0 },
          bottom: { xs: 28, sm: 40, md: 0 },
          left: { xs: 16, sm: 24, md: 'auto' },
          right: { xs: 16, sm: 24, md: 32, lg: 48 },
          width: { xs: 'auto', md: 'min(480px, 46vw)' },
          maxWidth: { xs: 'calc(100% - 32px)', md: 480 },
          boxSizing: 'border-box',
          overflow: 'hidden',
          justifyContent: { xs: 'center', md: 'center' },
          alignItems: { xs: 'center', md: 'flex-end' },
          textAlign: { xs: 'center', md: 'right' },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 10, sm: 11 },
            fontWeight: 700,
            letterSpacing: { xs: 1.4, sm: 1.8 },
            textTransform: 'uppercase',
            color: goldAlpha(0.92),
            textShadow: '0 1px 10px rgba(0,0,0,0.85)',
            width: 1,
            animation: `${copyEnter} 0.7s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {t('common.brandTagline')}
        </Typography>

        <Box
          sx={{
            position: 'relative',
            width: 1,
            maxWidth: 1,
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            overflow: 'hidden',
            // CLS: reserved box before logo image loads
            minHeight: { xs: 64, sm: 76, md: 96 },
            animation: `${logoEnter} 1s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: { xs: '12% 8%', md: '8% 0' },
              zIndex: 0,
              background: `radial-gradient(ellipse 80% 70% at 50% 50%, ${goldAlpha(0.22)} 0%, transparent 72%)`,
              pointerEvents: 'none',
              filter: 'blur(8px)',
            },
          }}
        >
          <Box
            component="img"
            src={HOME_IMAGE_PATHS.heroTitleLogo}
            alt="Battle Asia"
            width={840}
            height={168}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sx={{
              position: 'relative',
              zIndex: 1,
              width: { xs: 'min(100%, 300px)', sm: 'min(100%, 360px)', md: '100%' },
              maxWidth: { xs: 300, sm: 360, md: 460 },
              height: 'auto',
              aspectRatio: '5 / 1',
              display: 'block',
              objectFit: 'contain',
              objectPosition: { xs: 'center', md: 'right' },
              filter: `
                drop-shadow(0 3px 10px rgba(0, 0, 0, 0.8))
                drop-shadow(0 0 32px ${goldAlpha(0.42)})
                drop-shadow(0 0 64px ${goldAlpha(0.18)})
              `,
              animation: `${titleGlow} 4.5s 2s ease-in-out infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
          <Box
            aria-hidden
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: `linear-gradient(90deg,
                transparent 0%,
                ${alpha('#ffffff', 0.05)} 35%,
                ${goldAlpha(0.45)} 50%,
                ${alpha('#ffffff', 0.08)} 65%,
                transparent 100%)`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              animation: `${logoShimmer} 5.5s 2s ease-in-out infinite`,
              '@media (prefers-reduced-motion: reduce)': { display: 'none' },
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: 1,
            maxWidth: { xs: 340, sm: 400, md: '100%' },
            px: { xs: 0.75, md: 0 },
            py: { xs: 0.65, md: 0 },
            borderRadius: { xs: 1, md: 0 },
            // Soft dark plate behind subtitle so it stays readable on bright hero art
            background: {
              xs: `linear-gradient(180deg, ${alpha('#000000', 0.55)} 0%, ${alpha('#000000', 0.35)} 100%)`,
              md: 'transparent',
            },
            boxShadow: {
              xs: `0 0 24px ${alpha('#000000', 0.35)}`,
              md: 'none',
            },
            animation: `${copyEnter} 0.75s 0.55s cubic-bezier(0.22, 1, 0.36, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 13, sm: 15, md: 17, lg: 18 },
              color: '#ffffff',
              lineHeight: 1.4,
              textShadow: `
                0 1px 2px ${alpha('#000000', 0.95)},
                0 2px 14px ${alpha('#000000', 0.9)},
                0 0 20px ${alpha('#000000', 0.55)}
              `,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              width: 1,
            }}
          >
            {t('home.subtitle')}
          </Typography>
        </Box>

        <BattleGoldDivider
          variant="hero"
          sx={{
            width: { xs: 140, sm: 180, md: 220 },
            alignSelf: { xs: 'center', md: 'flex-end' },
            animation: `${copyEnter} 0.7s 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />

        {/* Mobile: CTAs sit under the divider (higher, on the art — not in the black band) */}
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            width: 1,
            pt: { xs: 1.25, sm: 1.5 },
            animation: `${copyEnter} 0.7s 0.85s cubic-bezier(0.22, 1, 0.36, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <HeroMeshButtons
            downloadLabel={t('home.downloadApkButton')}
            downloadHref={appDownload.href}
            downloadFileName={appDownload.fileName}
            showDownload={appDownload.enabled}
          />
          <HeroTrustRow align="center" />
        </Box>
      </Stack>

      {/* Desktop CTAs — anchored lower */}
      <Stack
        spacing={1.25}
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { md: 52, lg: 60 },
          zIndex: 2,
          alignItems: 'center',
          px: { md: 4 },
          animation: `${copyEnter} 0.85s 0.95s cubic-bezier(0.22, 1, 0.36, 1) both`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        <HeroMeshButtons
          downloadLabel={t('home.downloadApkButton')}
          downloadHref={appDownload.href}
          downloadFileName={appDownload.fileName}
          showDownload={appDownload.enabled}
        />
        <Box sx={{ width: '100%', maxWidth: 640 }}>
          <HeroTrustRow align="center" />
        </Box>
      </Stack>

      <HeroStickyCta
        downloadLabel={t('home.downloadApkButton')}
        downloadHref={appDownload.href}
        downloadFileName={appDownload.fileName}
        showDownload={appDownload.enabled}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: { xs: 40, md: 80 },
          background: {
            xs: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.72))',
            md: 'linear-gradient(180deg, transparent, #000000)',
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

  const sectionHowToPlay = (
    <Box id="how-to-play" sx={blackGamingSectionSx(HOME_GAME_ARTS[2])}>
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1280, mx: 'auto' }}>
        <HomeBlurPanel>
          <Stack spacing={{ xs: 2, md: 2.75 }}>
            <Stack spacing={1.25} alignItems="center">
              <Typography
                sx={{
                  fontSize: { xs: 11, md: 12 },
                  fontWeight: 700,
                  letterSpacing: 2.5,
                  color: GOLD,
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
                  color: '#ffffff',
                }}
              >
                {t('home.howToPlay')}
              </Typography>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 12, sm: 14 },
                  color: alpha('#ffffff', 0.5),
                  textAlign: 'center',
                  maxWidth: 520,
                  lineHeight: 1.6,
                }}
              >
                {t('home.howToPlaySubtitle')}
              </Typography>
              <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
            </Stack>

            <Box
              sx={homeMobileScrollGridSx(
                {
                  xs: 'repeat(4, minmax(280px, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                { xs: 1.5, md: 2.5 }
              )}
            >
          {gameModes.map((mode, index) => (
            <Box
              key={mode.title}
              sx={{
                ...homeMobileScrollItemSx,
                minWidth: { xs: 280, lg: 0 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 1,
                borderRadius: 0,
                overflow: 'hidden',
                bgcolor: '#161618',
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                isolation: 'isolate',
                animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
                transition:
                  'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.35s ease',
                boxShadow: `0 10px 28px ${alpha('#000000', 0.5)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  border: `1px solid ${goldAlpha(0.55)}`,
                  opacity: 0,
                  zIndex: 2,
                  pointerEvents: 'none',
                  transition: 'opacity 0.35s ease',
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: goldAlpha(0.45),
                  boxShadow: `
                    0 22px 48px ${alpha('#000000', 0.7)},
                    0 0 0 1px ${goldAlpha(0.2)},
                    0 0 32px ${goldAlpha(0.12)}
                  `,
                  '&::before': { opacity: 1, animation: `${borderPulse} 1.8s ease-in-out infinite` },
                  '& .mode-card-bar': { transform: 'scaleX(1)' },
                  '& .mode-card-title': { color: GOLD },
                  '& .mode-card-art': { transform: 'scale(1.06)' },
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 160, md: 190 },
                  overflow: 'hidden',
                  bgcolor: '#0a0a0a',
                }}
              >
                <Box
                  className="mode-card-art"
                  component="img"
                  src={mode.art}
                  alt={mode.playersLabel}
                  width={800}
                  height={533}
                  loading="eager"
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
                    width: 1,
                    height: 1,
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, ${alpha('#000000', 0.1)} 0%, ${alpha('#161618', 0.45)} 65%, #161618 100%)`,
                    pointerEvents: 'none',
                  }}
                />
                {/* Step number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: goldAlpha(0.9),
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#111', lineHeight: 1 }}>
                    {index + 1}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    px: 1,
                    py: 0.4,
                    bgcolor: alpha('#000000', 0.72),
                    border: `1px solid ${goldAlpha(0.55)}`,
                  }}
                >
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: GOLD,
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                    }}
                  >
                    {mode.playersLabel}
                  </Typography>
                </Box>
              </Box>

              <Stack
                spacing={1.5}
                sx={{
                  px: { xs: 2, md: 2.25 },
                  pt: { xs: 1.75, md: 2 },
                  pb: { xs: 2, md: 2.25 },
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: alpha('#000000', 0.45),
                    border: `1px solid ${goldAlpha(0.35)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SvgIcon sx={{ fontSize: 28, color: GOLD }}>
                    <path d={mode.iconPath} />
                  </SvgIcon>
                </Box>

                <Box>
                  <Typography
                    className="mode-card-title font-tr"
                    sx={{
                      fontSize: { xs: 16, md: 18 },
                      fontWeight: 800,
                      letterSpacing: 0.6,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                      transition: 'color 0.3s ease',
                      mb: 0.75,
                    }}
                  >
                    {mode.title}
                  </Typography>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 12, md: 13 },
                      color: alpha('#ffffff', 0.5),
                      lineHeight: 1.55,
                    }}
                  >
                    {mode.description}
                  </Typography>
                </Box>

                <Box
                  className="mode-card-bar"
                  sx={{
                    height: 2,
                    bgcolor: GOLD,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left center',
                    transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: `0 0 12px ${goldAlpha(0.45)}`,
                  }}
                />

                <Stack spacing={1} sx={{ mt: 'auto' }}>
                  {mode.features.map((feature) => (
                    <Stack key={feature.text} direction="row" spacing={1} alignItems="flex-start">
                      <SvgIcon sx={{ fontSize: 16, color: GOLD, flexShrink: 0, mt: 0.15 }}>
                        <path d={feature.iconPath} />
                      </SvgIcon>
                      <Typography
                        className="font-tr"
                        sx={{
                          fontSize: { xs: 11, md: 12 },
                          color: alpha('#ffffff', 0.65),
                          lineHeight: 1.45,
                        }}
                      >
                        {feature.text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
          ))}
            </Box>

            <Stack alignItems="center">
              <Box
                component="a"
                href="/play"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 4,
                  minHeight: 44,
                  bgcolor: goldAlpha(0.1),
                  border: `1px solid ${goldAlpha(0.35)}`,
                  color: GOLD,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    bgcolor: goldAlpha(0.18),
                    borderColor: goldAlpha(0.55),
                    boxShadow: `0 0 20px ${goldAlpha(0.15)}`,
                  },
                }}
              >
                {t('home.startPlaying')}
                <Iconify icon="solar:arrow-right-bold" width={16} />
              </Box>
            </Stack>
          </Stack>
        </HomeBlurPanel>
      </Box>
    </Box>
  );

  const sectionRoules = (
    <Box id="rules" sx={blackGamingSectionSx(HOME_GAME_ARTS[4])}>
      <Stack
        spacing={{ xs: 2.25, md: 3 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 1100, mx: 'auto', width: 1 }}
      >
        <Stack spacing={1.25} alignItems="center">
          <Typography
            sx={{
              fontSize: { xs: 11, md: 12 },
              fontWeight: 700,
              letterSpacing: 2.5,
              color: GOLD,
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
              color: '#ffffff',
              animation: `${titleGlow} 4s ease-in-out infinite`,
            }}
          >
            {t('home.tournamentRules')}
          </Typography>
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 12, sm: 14 },
              color: alpha('#ffffff', 0.5),
              textAlign: 'center',
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            {t('home.officialRegulations')}
          </Typography>
          <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
        </Stack>

        <HomeBlurPanel sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 0.5, md: 0.75 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              columnGap: { md: 4, lg: 6 },
              alignItems: 'start',
            }}
          >
            {FAQ.map((faq, idx) => (
              <TournamentRuleItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                defaultOpen={idx === 0}
              />
            ))}
          </Box>
        </HomeBlurPanel>

        <Stack direction="row" justifyContent="center" spacing={1} alignItems="center" sx={{ pt: 1 }}>
          <Iconify icon="solar:chat-round-dots-bold" width={16} sx={{ color: alpha('#ffffff', 0.4) }} />
          <Typography sx={{ fontSize: 12, color: alpha('#ffffff', 0.4) }}>
            {t('home.needHelp')}{' '}
            <Box
              component="a"
              href="/support"
              sx={{
                color: GOLD,
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('home.contactSupport')}
            </Box>
          </Typography>
        </Stack>
      </Stack>
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

      <Suspense fallback={<Box sx={{ minHeight: { xs: 520, md: 440 } }} />}>
        <LandingDashboardSection />
      </Suspense>

      <Suspense fallback={<Box sx={{ minHeight: { xs: 420, md: 380 } }} />}>
        <PlayYourGameSection />
      </Suspense>

      <AboutBattleAsiaSection />
      {sectionHowToPlay}
      {sectionRoules}
    </Box>
  );
}
