

import { Box, Stack, SvgIcon, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { useImagePreloader } from 'src/hooks';
import { useAppDownload } from 'src/hooks/use-app-download';

import { Image } from 'src/components/image';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { HeroMeshButtons } from 'src/components/mesh-buttons';
import { ScrollReveal, ScrollParallax } from 'src/components/animate';
import { LandingDashboardSection } from './dashboard-widgets';
import { PlayYourGameSection, HOME_GAME_ARTS } from './play-your-game-section';
import { homeMobileScrollGridSx, homeMobileScrollItemSx } from './home-horizontal-scroll';
import { HeroFxOverlay } from './hero-fx-overlay';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const titleGlow = keyframes`
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 24px ${alpha(GOLD, 0.35)}; }
`;

const borderPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
`;

const heroKenBurns = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.08) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1) translate3d(0, 0, 0); }
`;

const HOME_IMAGE_PATHS = {
  banner: '/assets/images/hero-banner-pubg-drop.webp',
  heroTitleLogo: '/assets/images/hero-title-battleasia.webp',
} as const;

const HOME_MODE_ARTS = {
  solo: '/assets/images/home/modes/mode-solo.webp',
  duo: '/assets/images/home/modes/mode-duo.webp',
  squad: '/assets/images/home/modes/mode-squad.webp',
  tdm: '/assets/images/home/modes/mode-tdm.webp',
} as const;

function blackGamingSectionSx(art?: string) {
  return {
    scrollMarginTop: { xs: '80px', md: '100px' },
    position: 'relative' as const,
    overflowX: 'hidden' as const,
    bgcolor: '#0a0a0a',
    py: { xs: 4.5, md: 6 },
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
              radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha(GOLD, 0.08)} 0%, transparent 55%)
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
              radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha(GOLD, 0.08)} 0%, transparent 55%),
              radial-gradient(ellipse 40% 30% at 10% 100%, ${alpha('#38bdf8', 0.04)} 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }),
  };
}

// ----------------------------------------------------------------------
// Preload only above-the-fold hero assets — mode/game cards lazy-load on scroll.
const imagePaths = [HOME_IMAGE_PATHS.banner, HOME_IMAGE_PATHS.heroTitleLogo];

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
      height: { xs: 580, sm: 700, md: 860, lg: 920 },
      bgcolor: '#000000',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: {
          xs: 'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 36%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.82) 100%)',
          md: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.06) 38%, rgba(0,0,0,0.48) 66%, rgba(0,0,0,0.72) 100%)',
        },
        zIndex: 1,
      },
      '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 28%, transparent 62%, rgba(0,0,0,0.55) 100%)',
        zIndex: 1,
      },
    }}>
      {/* Full hero image with slow cinematic zoom + scroll parallax */}
      <ScrollParallax offset={120} scaleRange={[1.12, 1, 1.08]} sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Box
          component="img"
          src={HOME_IMAGE_PATHS.banner}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: { xs: '50% 18%', sm: '48% 24%', md: '36% center', lg: '32% center' },
            // Desktop-only slow drift — skip on phones (Ken Burns + parallax felt heavy)
            animation: { xs: 'none', md: `${heroKenBurns} 36s ease-in-out infinite` },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </ScrollParallax>

      <HeroFxOverlay />

      {/* Logo + copy — top on mobile, upper-right on desktop */}
      <Stack
        spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
        sx={{
          position: 'absolute',
          zIndex: 2,
          top: { xs: 64, sm: 76, md: 0 },
          bottom: { xs: 96, sm: 116, md: 0 },
          left: { xs: 16, sm: 24, md: 'auto' },
          right: { xs: 16, sm: 24, md: 32, lg: 48 },
          width: { xs: 'auto', md: 'min(480px, 46vw)' },
          maxWidth: { xs: 'calc(100% - 32px)', md: 480 },
          boxSizing: 'border-box',
          overflow: 'hidden',
          justifyContent: 'center',
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
            color: alpha('#f5c518', 0.92),
            textShadow: '0 1px 10px rgba(0,0,0,0.85)',
            width: 1,
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
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: { xs: '-4px -8px', md: '-6px -10px' },
              bgcolor: alpha('#000000', 0.28),
              // Soft shadow without live CSS filter blur (cheaper paint)
              boxShadow: `0 0 28px 12px ${alpha('#000000', 0.35)}`,
              borderRadius: 0,
              zIndex: 0,
            },
          }}
        >
          <Box
            component="img"
            src={HOME_IMAGE_PATHS.heroTitleLogo}
            alt="Battle Asia"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sx={{
              position: 'relative',
              zIndex: 1,
              width: { xs: 'min(100%, 280px)', sm: 'min(100%, 340px)', md: '100%' },
              maxWidth: { xs: 280, sm: 340, md: 420 },
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: { xs: 'center', md: 'right' },
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.9))',
              // Static presence — no infinite title glow (was causing soft flicker)
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
        </Box>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 13, sm: 15, md: 17, lg: 18 },
            color: alpha('#ffffff', 0.9),
            lineHeight: 1.4,
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.9)',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            width: 1,
            maxWidth: { xs: 340, sm: 400, md: '100%' },
            px: { xs: 0.5, md: 0 },
          }}
        >
          {t('home.subtitle')}
        </Typography>

        <BattleGoldDivider
          variant="hero"
          sx={{
            width: { xs: 140, sm: 180, md: 220 },
            alignSelf: { xs: 'center', md: 'flex-end' },
          }}
        />
      </Stack>

      {/* Both CTAs — always side-by-side on mobile + desktop */}
      <Stack
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { xs: 24, sm: 36, md: 52, lg: 60 },
          zIndex: 2,
          alignItems: 'center',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <HeroMeshButtons
          joinLabel={t('home.joinTournament')}
          downloadLabel={t('home.downloadApkButton')}
          downloadHref={appDownload.href}
          downloadFileName={appDownload.fileName}
          showDownload={appDownload.enabled}
        />
      </Stack>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: { xs: 100, md: 80 },
          background: 'linear-gradient(180deg, transparent, #000000)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );

  const aboutStats = [
    { value: '500K+', label: t('home.stats.activePlayers') },
    { value: '$2M+', label: t('home.stats.prizeMoney') },
    { value: '15+', label: t('home.stats.gamesSupported') },
    { value: '24/7', label: t('home.stats.tournaments') },
  ];

  const sectionAbout = (
    <Box id="about-us" sx={blackGamingSectionSx(HOME_GAME_ARTS[0])}>
      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 1280, mx: 'auto' }}
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
            {t('home.aboutBattleAsia')}
          </Typography>
          <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              bgcolor: '#161618',
              border: `1px solid ${alpha('#ffffff', 0.08)}`,
              p: { xs: 2.25, md: 3 },
              boxShadow: `0 10px 28px ${alpha('#000000', 0.5)}`,
              animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`,
              transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.4s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                border: `1px solid ${alpha(GOLD, 0.55)}`,
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.35s ease',
              },
              '&:hover': {
                transform: 'translateY(-6px)',
                borderColor: alpha(GOLD, 0.45),
                boxShadow: `
                  0 22px 48px ${alpha('#000000', 0.7)},
                  0 0 0 1px ${alpha(GOLD, 0.2)},
                  0 0 32px ${alpha(GOLD, 0.12)}
                `,
                '&::before': { opacity: 1, animation: `${borderPulse} 1.8s ease-in-out infinite` },
              },
            }}
          >
            <Box
              sx={{
                height: 2,
                width: 48,
                bgcolor: GOLD,
                mb: 2,
                boxShadow: `0 0 12px ${alpha(GOLD, 0.45)}`,
              }}
            />
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {[t('home.aboutDescription1'), t('home.aboutDescription2'), t('home.aboutDescription3')].map(
                (text) => (
                  <Typography
                    key={text.slice(0, 24)}
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 13, sm: 14, md: 15 },
                      lineHeight: 1.7,
                      color: alpha('#ffffff', 0.62),
                    }}
                  >
                    {text}
                  </Typography>
                )
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: { xs: 1.25, sm: 1.5 },
            }}
          >
            {aboutStats.map((stat, index) => (
              <Box
                key={stat.label}
                sx={{
                  position: 'relative',
                  bgcolor: '#161618',
                  border: `1px solid ${alpha('#ffffff', 0.08)}`,
                  p: { xs: 1.75, md: 2.25 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: { xs: 100, md: 120 },
                  boxShadow: `0 10px 28px ${alpha('#000000', 0.45)}`,
                  animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${0.08 + index * 0.08}s both`,
                  transition: 'transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: alpha(GOLD, 0.4),
                    boxShadow: `0 18px 40px ${alpha('#000000', 0.65)}, 0 0 24px ${alpha(GOLD, 0.1)}`,
                    '& .about-stat-value': { color: GOLD },
                  },
                }}
              >
                <Typography
                  className="about-stat-value font-tr"
                  sx={{
                    fontSize: { xs: 22, sm: 26, md: 30 },
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                    transition: 'color 0.3s ease',
                    mb: 0.75,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 10, md: 11 },
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    color: alpha('#ffffff', 0.4),
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  );

  const gameModes = [
    {
      title: t('home.gameModes.solo.title'),
      description: t('home.gameModes.solo.description'),
      art: HOME_MODE_ARTS.solo,
      players: '1',
      playersLabel: '1 Player',
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
      playersLabel: '2 Players',
      iconType: 'dual-svg' as const,
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
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
      playersLabel: '4 Players',
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
      playersLabel: '6–8 Players',
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
      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 1280, mx: 'auto' }}
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
            Solo 1 · Duo 2 · Squad 4 · TDM 6–8 — pick your team size.
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
                  border: `1px solid ${alpha(GOLD, 0.55)}`,
                  opacity: 0,
                  zIndex: 2,
                  pointerEvents: 'none',
                  transition: 'opacity 0.35s ease',
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  borderColor: alpha(GOLD, 0.45),
                  boxShadow: `
                    0 22px 48px ${alpha('#000000', 0.7)},
                    0 0 0 1px ${alpha(GOLD, 0.2)},
                    0 0 32px ${alpha(GOLD, 0.12)}
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
                  loading="lazy"
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
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    px: 1,
                    py: 0.4,
                    bgcolor: alpha('#000000', 0.72),
                    border: `1px solid ${alpha(GOLD, 0.55)}`,
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
                    border: `1px solid ${alpha(GOLD, 0.35)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: mode.iconType === 'dual-svg' ? 'relative' : 'static',
                  }}
                >
                  {mode.iconType === 'dual-svg' ? (
                    <>
                      <SvgIcon sx={{ fontSize: 22, color: GOLD, position: 'absolute', left: 6 }}>
                        <path d={mode.iconPath} />
                      </SvgIcon>
                      <SvgIcon sx={{ fontSize: 22, color: GOLD, position: 'absolute', right: 6 }}>
                        <path d={mode.iconPath} />
                      </SvgIcon>
                    </>
                  ) : (
                    <SvgIcon sx={{ fontSize: 28, color: GOLD }}>
                      <path d={mode.iconPath} />
                    </SvgIcon>
                  )}
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
                    boxShadow: `0 0 12px ${alpha(GOLD, 0.45)}`,
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
      </Stack>
    </Box>
  );

  const sectionRoules = (
    <Box id="rules" sx={blackGamingSectionSx(HOME_GAME_ARTS[4])}>
      <Stack
        spacing={{ xs: 3, md: 4 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 900, mx: 'auto' }}
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

        <Stack spacing={1.25}>
          {FAQ.map((faq, index) => (
            <Accordion
              key={faq.question}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: '#161618',
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                borderRadius: '0 !important',
                overflow: 'hidden',
                boxShadow: `0 8px 24px ${alpha('#000000', 0.4)}`,
                animation: `${cardReveal} 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.07}s both`,
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: 0,
                  borderColor: alpha(GOLD, 0.35),
                  boxShadow: `0 12px 32px ${alpha('#000000', 0.55)}, 0 0 20px ${alpha(GOLD, 0.08)}`,
                },
                '&:hover': {
                  borderColor: alpha(GOLD, 0.28),
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <SvgIcon sx={{ color: GOLD, fontSize: { xs: 20, sm: 22 } }}>
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                  </SvgIcon>
                }
                sx={{
                  py: { xs: 0.5, sm: 0.75 },
                  px: { xs: 1.5, sm: 2.25 },
                  minHeight: 52,
                  bgcolor: 'transparent',
                  '& .MuiAccordionSummary-content': { margin: '12px 0' },
                  '&.Mui-expanded': { bgcolor: 'transparent' },
                }}
              >
                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: { xs: 13, sm: 15, md: 16 },
                    fontWeight: 700,
                    color: '#ffffff',
                    wordBreak: 'break-word',
                    lineHeight: 1.35,
                    letterSpacing: 0.2,
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  pb: 2.25,
                  px: { xs: 1.5, sm: 2.25 },
                  pt: 0,
                  bgcolor: 'transparent',
                  borderTop: `1px solid ${alpha(GOLD, 0.15)}`,
                }}
              >
                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: { xs: 12, sm: 13, md: 14 },
                    color: alpha('#ffffff', 0.55),
                    lineHeight: 1.7,
                    pt: 1.5,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
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
      {sectionSlide}
      <ScrollReveal preset="cinematic" fullViewport>
        <LandingDashboardSection />
      </ScrollReveal>
      <ScrollReveal preset="cinematic" fullViewport>
        <PlayYourGameSection />
      </ScrollReveal>
      <ScrollReveal preset="cinematic-slide-left" fullViewport>
        {sectionAbout}
      </ScrollReveal>
      <ScrollReveal preset="cinematic-slide-right" fullViewport>
        {sectionHowToPlay}
      </ScrollReveal>
      <ScrollReveal preset="cinematic" fullViewport>
        {sectionRoules}
      </ScrollReveal>
    </Box>
  );
}
