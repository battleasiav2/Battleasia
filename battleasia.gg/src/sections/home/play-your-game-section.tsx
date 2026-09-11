import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Container, ButtonBase, Typography } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { HOME_GAME_ARTS, PLAY_YOUR_GAME_IMAGE_PATHS } from './home-game-arts';

export { HOME_GAME_ARTS, PLAY_YOUR_GAME_IMAGE_PATHS };

// ----------------------------------------------------------------------

type GameTacticalSpec = {
  key: string;
  art: string;
  genreKey: string;
  liveCount: number;
  available: boolean;
  platforms: readonly string[];
  mobileOnly: boolean;
  role: string;
  weightOrClass: string;
  stats: {
    range: string;
    mode: string;
    accuracy: string;
    fireRate: string;
  };
  briefing: string;
};

const BASE_GAMES: GameTacticalSpec[] = [
  {
    key: 'pubgMobile',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile,
    genreKey: 'battleRoyale',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple', 'mdi:cellphone'],
    mobileOnly: true,
    role: 'Airborne Infiltrator',
    weightOrClass: 'Assault Class · 3.3KG',
    stats: {
      range: '800M (Ballistic)',
      mode: 'Auto / Semi-auto',
      accuracy: '78 / 100',
      fireRate: '11.8 / s',
    },
    briefing:
      'DROP INTO CONTESTED BATTLEGROUNDS. SECURE STRATEGIC AIRDROPS, HOLD TACTICAL CHOKEPOINTS, AND LEAD YOUR SQUAD TO CHICKEN DINNER GLORY WITH REAL BAC REWARDS ON EVERY FRAG.',
  },
  {
    key: 'freeFire',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.freeFire,
    genreKey: 'survival',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple'],
    mobileOnly: true,
    role: 'Shadow Striker',
    weightOrClass: 'Rush Protocol · 2.8KG',
    stats: {
      range: '450M (Rapid CQC)',
      mode: 'Full-Auto / Burst',
      accuracy: '82 / 100',
      fireRate: '16.5 / s',
    },
    briefing:
      'SURVIVE 50-PLAYER INTENSE FAST-PACED CLASHES. DEPLOY TACTICAL GLOO WALLS, EXECUTE LIGHTNING FLANK ATTACKS, AND OVERPOWER RIVAL SURVIVORS IN HIGH-STAKES ARENAS.',
  },
  {
    key: 'codMobile',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.codMobile,
    genreKey: 'fps',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple'],
    mobileOnly: true,
    role: 'Black Ops Operative',
    weightOrClass: 'Tactical Spec · 3.4KG',
    stats: {
      range: '600M (Precision ADS)',
      mode: 'Auto / 3-Round Burst',
      accuracy: '92 / 100',
      fireRate: '13.2 / s',
    },
    briefing:
      'HIGH-CALIBER MILITARY WARFARE. CHAIN DEADLY SCORESTREAKS, MASTER RECOIL PATTERNS, AND DOMINATE MULTIPLAYER ARENAS OR ISOLATED BATTLE ROYALE ZONES.',
  },
  {
    key: 'mobileLegends',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends,
    genreKey: 'moba',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple'],
    mobileOnly: true,
    role: 'Mythic Vanguard',
    weightOrClass: 'Royal Spear · 4.2KG',
    stats: {
      range: 'Melee / Spellstrike',
      mode: 'Skill Combos / Ulti',
      accuracy: 'Target Lock 95%',
      fireRate: 'Burst CD 6.5s',
    },
    briefing:
      'ASSEMBLE YOUR FIVE-HERO LINEUP. CONTEST CRUCIAL LORD AND TURTLE OBJECTIVES, EXECUTE CLEAN TEAMFIGHT INITIATIONS, AND CRUSH THE ENEMY BASE IN THRILLING ESPORTS SHOWDOWNS.',
  },
  {
    key: 'valorant',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.valorant,
    genreKey: 'tactical',
    liveCount: 0,
    available: false,
    platforms: ['mdi:microsoft-windows', 'mdi:sony-playstation', 'mdi:monitor'],
    mobileOnly: false,
    role: 'Toxic Sentinel',
    weightOrClass: 'Vandal Spec · 3.1KG',
    stats: {
      range: '1000M (Hitscan)',
      mode: 'Semi / Single Tap',
      accuracy: '98 / 100',
      fireRate: '9.75 / s',
    },
    briefing:
      'SURGICAL GUNPLAY MEETS TACTICAL AGENT ABILITIES. PRE-AIM ANGLES, DEPLOY BIOCHEMICAL SMOKES, AND CLUTCH HIGH-PRESSURE DEFUSES WITH CRISP ONE-TAP HEADSHOTS.',
  },
];

const GAME_NAME_TO_KEY: Record<string, string> = {
  'PUBG Mobile': 'pubgMobile',
  'Free Fire': 'freeFire',
  'Call of Duty Mobile': 'codMobile',
  'COD Mobile': 'codMobile',
  'Mobile Legends': 'mobileLegends',
  Valorant: 'valorant',
};

export function applyLiveCountsToGames(
  liveCountByGame: Record<string, number> | undefined
): GameTacticalSpec[] {
  if (!liveCountByGame) return BASE_GAMES;
  return BASE_GAMES.map((game) => {
    const apiKey = Object.entries(GAME_NAME_TO_KEY).find(([, v]) => v === game.key)?.[0];
    const count = apiKey ? liveCountByGame[apiKey] ?? 0 : 0;
    return { ...game, liveCount: count };
  });
}

// ----------------------------------------------------------------------

const slideInRight = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(55px, 0, 0) scale(0.97);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
`;

const slideInLeft = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(-55px, 0, 0) scale(0.97);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
`;

const reticlePulse = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.03); }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha('#22c55e', 0.6)}; }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px ${alpha('#22c55e', 0)}; }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const TACTICAL_STRIPES = '//////';
const AUTO_SLIDE_INTERVAL_MS = 4500;

// ----------------------------------------------------------------------

export function PlayYourGameSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progressKey, setProgressKey] = useState<number>(0);
  const [liveCountByGame, setLiveCountByGame] = useState<Record<string, number> | undefined>();

  useEffect(() => {
    const base = (CONFIG.serverUrl || '').replace(/\/$/, '');
    fetch(`${base}/api/v3/public/dashboard`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const counts = json?.data?.liveCountByGame || json?.liveCountByGame;
        if (counts) setLiveCountByGame(counts);
      })
      .catch(() => { });
  }, []);

  const games = useMemo(() => applyLiveCountsToGames(liveCountByGame), [liveCountByGame]);

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const slideDirectionRef = useRef(slideDirection);
  slideDirectionRef.current = slideDirection;

  const goToSlide = useCallback((index: number, forcedDirection?: 'forward' | 'backward') => {
    const current = activeIndexRef.current;
    if (index === current) return;
    const dir = forcedDirection || (index > current ? 'forward' : 'backward');
    setSlideDirection(dir);
    setActiveIndex(index);
    setProgressKey((k) => k + 1);
  }, []);

  const goNext = useCallback(() => {
    const current = activeIndexRef.current;
    const dir = slideDirectionRef.current;
    if (dir === 'forward') {
      if (current >= games.length - 1) {
        goToSlide(current - 1, 'backward');
      } else {
        goToSlide(current + 1, 'forward');
      }
    } else if (current <= 0) {
      goToSlide(current + 1, 'forward');
    } else {
      goToSlide(current - 1, 'backward');
    }
  }, [games.length, goToSlide]);

  // Auto-slide effect cycling smoothly left to right and right to left within few seconds
  useEffect(() => {
    if (isPaused || games.length <= 1) return undefined;
    const timer = setInterval(() => {
      goNext();
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, games.length, goNext]);

  const activeGame = games[activeIndex] || games[0];

  // Dynamic accent color respecting user theme selection
  const accentColor = theme.palette.primary.main || '#cbfb24';
  const accentContrast = theme.palette.primary.contrastText || '#081401';

  // Title split logic: "PLAY YOUR" / "GAME"
  const titleRaw = t('home.playYourGame.title') || 'PLAY YOUR GAME';
  const titleWords = titleRaw.split(' ');
  const titleLine1 = titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : 'PLAY YOUR';
  const titleLine2 = titleWords.length > 1 ? titleWords[titleWords.length - 1] : titleRaw;

  return (
    <Box
      id="play-your-game"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: '#07080a',
        color: '#ffffff',
        pt: { xs: 2.5, md: 3.5 },
        pb: { xs: 4, md: 6 },
        borderTop: `1px solid ${alpha('#ffffff', 0.06)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.06)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 18% 45%, ${alpha(accentColor, 0.08)} 0%, transparent 45%),
            radial-gradient(circle at 85% 25%, ${alpha(accentColor, 0.05)} 0%, transparent 50%),
            linear-gradient(180deg, rgba(7, 8, 10, 0.94) 0%, rgba(10, 11, 15, 0.7) 40%, rgba(7, 8, 10, 0.96) 100%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Top Left Tactical Reticle HUD Element */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 10, md: 16 },
          left: { xs: 12, md: 28 },
          pointerEvents: 'none',
          zIndex: 1,
          animation: `${reticlePulse} 4s ease-in-out infinite`,
        }}
      >
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <circle cx="23" cy="23" r="16" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="23" cy="23" r="7" stroke={accentColor} strokeWidth="1" opacity="0.8" />
          <line x1="23" y1="2" x2="23" y2="10" stroke={accentColor} strokeWidth="1.5" />
          <line x1="23" y1="36" x2="23" y2="44" stroke={accentColor} strokeWidth="1.5" />
          <line x1="2" y1="23" x2="10" y2="23" stroke={accentColor} strokeWidth="1.5" />
          <line x1="36" y1="23" x2="44" y2="23" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.18fr 1fr' },
            gap: { xs: 4, md: 5, lg: 3 },
            alignItems: 'center',
            minHeight: { md: 660, lg: 740 },
          }}
        >
          {/* LEFT SIDE: HERO OPERATIVE VISUAL + TACTICAL HUD STATS CALLOUT */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: 500, sm: 600, md: 700, lg: 760 },
              overflow: 'visible',
            }}
          >
            {/* Background Halo for the Operative */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '42%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 340, sm: 460, md: 540 },
                height: { xs: 340, sm: 460, md: 540 },
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(accentColor, 0.16)} 0%, transparent 70%)`,
                filter: 'blur(36px)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Main Character Image with Transparent Background & Smooth Directional Slide */}
            <Box
              key={`hero-${activeGame.key}`}
              component="img"
              src={activeGame.art}
              alt={t(`home.playYourGame.games.${activeGame.key}`)}
              loading="eager"
              decoding="async"
              sx={{
                position: 'relative',
                zIndex: 2,
                maxHeight: { xs: 500, sm: 620, md: 740, lg: 820 },
                maxWidth: { xs: '98%', sm: '94%', md: '90%', lg: '95%' },
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                filter: `drop-shadow(0 22px 42px rgba(0,0,0,0.88)) drop-shadow(0 0 36px ${alpha(accentColor, 0.24)})`,
                animation: `${slideDirection === 'forward' ? slideInRight : slideInLeft} 0.65s cubic-bezier(0.16, 1, 0.3, 1) both`,
                maskImage: 'linear-gradient(to bottom, black 0%, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 88%, transparent 100%)',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />

            {/* Tactical Spec HUD Callout Floating Line & Specs (Directional Slide) */}
            <Box
              key={`hud-${activeGame.key}`}
              sx={{
                position: 'absolute',
                right: { xs: 2, sm: 12, md: 0, lg: '-18px' },
                top: { xs: '46%', sm: '43%', md: '44%' },
                transform: 'translateY(-50%)',
                zIndex: 3,
                animation: `${slideDirection === 'forward' ? slideInRight : slideInLeft} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both`,
                pointerEvents: 'none',
              }}
            >
              {/* Spec Header: e.g. Assault Rifle 3.3KG */}
              <Box sx={{ textAlign: 'right', pr: 1.5, mb: 0.4 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 15 },
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    color: '#ffffff',
                    lineHeight: 1.1,
                    textTransform: 'capitalize',
                  }}
                >
                  {activeGame.role}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 9, sm: 10 },
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: alpha('#ffffff', 0.5),
                    textTransform: 'uppercase',
                  }}
                >
                  {activeGame.weightOrClass}
                </Typography>
              </Box>

              {/* Connecting Line with Terminal Dot (●────────) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  width: { xs: 150, sm: 190, md: 220 },
                  my: 0.8,
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    height: '1px',
                    bgcolor: alpha('#ffffff', 0.65),
                    boxShadow: `0 0 6px ${alpha('#ffffff', 0.3)}`,
                  }}
                />
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#ffffff',
                    boxShadow: `0 0 8px ${accentColor}`,
                    flexShrink: 0,
                  }}
                />
              </Box>

              {/* 4-Row Tactical Specs Grid */}
              <Stack
                spacing={0.5}
                sx={{
                  width: { xs: 155, sm: 185, md: 210 },
                  ml: 'auto',
                  pr: 1.5,
                  pt: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: alpha('#ffffff', 0.55) }}>
                    Range
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {activeGame.stats.range}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: alpha('#ffffff', 0.55) }}>
                    Mode
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {activeGame.stats.mode}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: alpha('#ffffff', 0.55) }}>
                    Accuracy
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {activeGame.stats.accuracy}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: alpha('#ffffff', 0.55) }}>
                    Fire Rate
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 11 },
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'monospace',
                    }}
                  >
                    {activeGame.stats.fireRate}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* RIGHT SIDE: DISTRESSED TYPOGRAPHY, BRAND BADGE, LORE BRIEFING & CHAMFERED TABS */}
          <Stack
            spacing={{ xs: 2.5, md: 3.5 }}
            sx={{
              pl: { lg: 3 },
              alignItems: { xs: 'center', lg: 'flex-start' },
              textAlign: { xs: 'center', lg: 'left' },
            }}
          >
            {/* Header Block: Military Stencil Line 1 + Slanted Giant Line 2 + Tactical Badge */}
            <Box>
              {/* Line 1: Distressed Military Stencil Typography */}
              <Typography
                component="div"
                sx={{
                  fontFamily: `'Barlow', 'Public Sans Variable', sans-serif`,
                  fontSize: { xs: 26, sm: 34, md: 44, lg: 48 },
                  fontWeight: 900,
                  letterSpacing: { xs: 2.5, md: 4 },
                  color: alpha('#ffffff', 0.9),
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(255,255,255,0.1)',
                }}
              >
                {titleLine1}
              </Typography>

              {/* Line 2 + Tactical Badge */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  flexWrap: 'wrap',
                  gap: { xs: 1.5, sm: 2 },
                  mt: 0.5,
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: `'Barlow', 'Public Sans Variable', sans-serif`,
                    fontSize: { xs: 44, sm: 58, md: 70, lg: 76 },
                    fontWeight: 900,
                    fontStyle: 'italic',
                    letterSpacing: '-0.01em',
                    lineHeight: 0.92,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    textShadow: `0 4px 20px ${alpha('#000000', 0.9)}`,
                  }}
                >
                  {titleLine2}
                </Typography>

                {/* Tactical Badge (100% matched to LOSTLIGHT //////✈ in reference) */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderTop: `1px solid ${alpha('#ffffff', 0.45)}`,
                    borderBottom: `1px solid ${alpha('#ffffff', 0.45)}`,
                    py: 0.4,
                    px: 1.2,
                    lineHeight: 1,
                    bgcolor: alpha('#ffffff', 0.03),
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 9, sm: 10, md: 11 },
                      fontWeight: 900,
                      letterSpacing: 2.5,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('home.playYourGame.brandLabel') || 'BATTLEASIA'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.35 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: 8, sm: 9 },
                        fontWeight: 900,
                        color: accentColor,
                        letterSpacing: 1.5,
                        lineHeight: 1,
                      }}
                    >
                      {TACTICAL_STRIPES}
                    </Typography>
                    <Iconify
                      icon="solar:plain-bold"
                      width={10}
                      sx={{
                        color: accentColor,
                        transform: 'rotate(45deg)',
                      }}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* Dynamic Sliding Information Container (Lore, Briefing, Action Buttons, Stats) */}
            <Stack
              key={`info-${activeGame.key}`}
              spacing={{ xs: 2.5, md: 3 }}
              sx={{
                width: 1,
                alignItems: { xs: 'center', lg: 'flex-start' },
                animation: `${slideDirection === 'forward' ? slideInRight : slideInLeft} 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
              }}
            >
              {/* Lore & Subtitle Content (Preserving original translation keys) */}
              <Stack spacing={1.5} sx={{ maxWidth: 580 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 14.5 },
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    color: alpha('#ffffff', 0.85),
                    lineHeight: 1.6,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('home.playYourGame.subtitle')}
                </Typography>

                {/* Dynamic Game Briefing in Tactical All-Caps */}
                <Typography
                  sx={{
                    fontSize: { xs: 11.5, sm: 12.5 },
                    fontWeight: 500,
                    letterSpacing: 0.8,
                    color: alpha('#ffffff', 0.52),
                    lineHeight: 1.65,
                  }}
                >
                  {activeGame.briefing}
                </Typography>
              </Stack>

              {/* Action Bar: Enter Arena CTA + Live Indicator + Platforms */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                spacing={2}
                sx={{ width: { xs: 1, sm: 'auto' } }}
              >
                <ButtonBase
                  component={RouterLink}
                  href={activeGame.available ? `${paths.user.play}?game=${activeGame.key}` : paths.user.play}
                  sx={{
                    position: 'relative',
                    px: 3.5,
                    py: 1.35,
                    bgcolor: activeGame.available ? accentColor : alpha('#ffffff', 0.08),
                    color: activeGame.available ? accentContrast : alpha('#ffffff', 0.5),
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: activeGame.available ? `0 6px 20px ${alpha(accentColor, 0.4)}` : 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: activeGame.available ? `0 10px 28px ${alpha(accentColor, 0.6)}` : 'none',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:play-bold" width={14} />
                    <span>{activeGame.available ? t('home.playYourGame.enterArena') : t('home.playYourGame.comingSoon')}</span>
                  </Stack>
                </ButtonBase>

                {/* Live Match Count Badge */}
                {activeGame.liveCount > 0 && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.8,
                      px: 1.5,
                      py: 0.75,
                      bgcolor: alpha('#22c55e', 0.12),
                      border: `1px solid ${alpha('#22c55e', 0.4)}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: '#22c55e',
                        animation: `${livePulse} 1.6s ease-out infinite`,
                      }}
                    />
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 0.8 }}>
                      {activeGame.liveCount} {t('home.playYourGame.live')}
                    </Typography>
                  </Box>
                )}

                {/* Platform Icons */}
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  {activeGame.platforms.map((icon) => (
                    <Iconify key={icon} icon={icon} width={18} sx={{ color: alpha('#ffffff', 0.45) }} />
                  ))}
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: alpha('#ffffff', 0.4),
                      textTransform: 'uppercase',
                    }}
                  >
                    {t(`home.playYourGame.genres.${activeGame.genreKey}`)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* BOTTOM RIGHT CHAMFERED GAME TABS WITH BIDIRECTIONAL AUTO-SLIDE NAVIGATION */}
            <Box
              sx={{
                width: 1,
                pt: { xs: 2, md: 3 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 0.8, sm: 1.25 },
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  flexWrap: 'wrap',
                }}
              >
                {/* Chamfered Game Tabs with Slide Highlight */}
                {games.map((g, idx) => {
                  const isActive = idx === activeIndex;
                  const label = t(`home.playYourGame.games.${g.key}`);

                  return (
                    <ButtonBase
                      key={g.key}
                      onClick={() => goToSlide(idx)}
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        px: { xs: 1.75, sm: 2.4, md: 3 },
                        py: { xs: 0.9, sm: 1.1 },
                        clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                        bgcolor: isActive ? accentColor : alpha('#181a20', 0.85),
                        color: isActive ? accentContrast : alpha('#ffffff', 0.68),
                        fontWeight: 800,
                        fontSize: { xs: 11, sm: 12.5 },
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        border: isActive ? 'none' : `1px solid ${alpha('#ffffff', 0.12)}`,
                        boxShadow: isActive
                          ? `0 0 20px ${alpha(accentColor, 0.45)}, 0 4px 12px rgba(0,0,0,0.5)`
                          : 'none',
                        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                        '&:hover': {
                          bgcolor: isActive ? accentColor : alpha('#262a33', 0.95),
                          color: isActive ? accentContrast : '#ffffff',
                          borderColor: isActive ? 'none' : alpha(accentColor, 0.35),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {label}
                      {/* Active auto-slide progress line at bottom of tab */}
                      {isActive && !isPaused && (
                        <Box
                          key={`progress-${progressKey}-${activeIndex}`}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '3px',
                            bgcolor: accentContrast,
                            opacity: 0.55,
                            animation: `${progressFill} ${AUTO_SLIDE_INTERVAL_MS}ms linear forwards`,
                          }}
                        />
                      )}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
