import { useEffect, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

import {
  HOME_SCROLL_GOLD,
  homeMobileScrollGridSx,
  homeMobileScrollItemSx,
} from './home-horizontal-scroll';
import { HOME_GAME_ARTS, PLAY_YOUR_GAME_IMAGE_PATHS } from './home-game-arts';
import { HomeBlurPanel } from './home-blur-panel';

export { HOME_GAME_ARTS, PLAY_YOUR_GAME_IMAGE_PATHS };

// ----------------------------------------------------------------------

const GOLD = HOME_SCROLL_GOLD;

type GameDef = {
  key: string;
  art: string;
  genreKey: string;
  liveCount: number;
  available: boolean;
  platforms: readonly string[];
  mobileOnly: boolean;
};

const GAMES: GameDef[] = [
  {
    key: 'pubgMobile',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile,
    genreKey: 'battleRoyale',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple', 'mdi:cellphone'],
    mobileOnly: true,
  },
  {
    key: 'freeFire',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.freeFire,
    genreKey: 'survival',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple'],
    mobileOnly: true,
  },
  {
    key: 'codMobile',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.codMobile,
    genreKey: 'fps',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple'],
    mobileOnly: true,
  },
  {
    key: 'mobileLegends',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends,
    genreKey: 'moba',
    liveCount: 0,
    available: true,
    platforms: ['mdi:android', 'mdi:apple'],
    mobileOnly: true,
  },
  {
    key: 'valorant',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.valorant,
    genreKey: 'tactical',
    liveCount: 0,
    available: false,
    platforms: ['mdi:microsoft-windows', 'mdi:sony-playstation', 'mdi:monitor'],
    mobileOnly: false,
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
): GameDef[] {
  if (!liveCountByGame) return GAMES;
  return GAMES.map((game) => {
    const apiKey = Object.entries(GAME_NAME_TO_KEY).find(([, v]) => v === game.key)?.[0];
    const count = apiKey ? liveCountByGame[apiKey] ?? 0 : 0;
    return { ...game, liveCount: count };
  });
}

// ----------------------------------------------------------------------

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha('#22c55e', 0.55)}; }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px ${alpha('#22c55e', 0)}; }
`;

const goldScan = keyframes`
  0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  35% { opacity: 0.55; }
  100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
`;

const borderPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
`;

// ----------------------------------------------------------------------

function PlayYourGameCard({ game, index }: { game: GameDef; index: number }) {
  const { t } = useTranslate();
  const isAvailable = game.available;
  const { liveCount } = game;

  return (
    <Box
      component={RouterLink}
      href={isAvailable ? `${paths.user.play}?game=${game.key}` : paths.user.play}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: 1,
        borderRadius: 0,
        overflow: 'hidden',
        aspectRatio: '3 / 5',
        minWidth: { xs: 176, sm: 0 },
        maxWidth: { md: 260 },
        minHeight: { xs: 280, md: 320 },
        scrollSnapAlign: 'start',
        textDecoration: 'none',
        bgcolor: '#161618',
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        isolation: 'isolate',
        animation: `${cardReveal} 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
        opacity: isAvailable ? 1 : 0.65,
        transition:
          'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.35s ease',
        boxShadow: `0 10px 28px ${alpha('#000000', 0.5)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          border: `1px solid ${alpha(GOLD, 0.55)}`,
          opacity: 0,
          zIndex: 6,
          pointerEvents: 'none',
          transition: 'opacity 0.35s ease',
        },
        '&:hover': {
          transform: 'translateY(-10px)',
          borderColor: alpha(GOLD, 0.45),
          boxShadow: `
            0 22px 48px ${alpha('#000000', 0.7)},
            0 0 0 1px ${alpha(GOLD, 0.2)},
            0 0 32px ${alpha(GOLD, 0.12)}
          `,
          '&::before': { opacity: 1, animation: `${borderPulse} 1.8s ease-in-out infinite` },
          '& .game-card-art': { transform: 'scale(1.08)' },
          '& .game-card-scan': { opacity: 1 },
          '& .game-card-bar': { transform: 'scaleX(1)' },
          '& .game-card-title': { color: GOLD },
          '& .game-card-play': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Artwork */}
      <Box
        sx={{
          position: 'relative',
          flex: '1 1 72%',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: '#0a0a0a',
        }}
      >
        <Box
          className="game-card-art"
          component="img"
          src={game.art}
          alt={t(`home.playYourGame.games.${game.key}`)}
          width={480}
          height={640}
          loading="lazy"
          decoding="async"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            aspectRatio: '3 / 4',
            transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        <Box
          className="game-card-scan"
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 2,
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '42%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.18)}, transparent)`,
              animation: `${goldScan} 1.1s ease-in-out`,
            },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(180deg, ${alpha('#000000', 0.2)} 0%, transparent 28%),
              linear-gradient(180deg, transparent 35%, ${alpha('#000000', 0.55)} 68%, ${alpha('#0a0a0a', 0.92)} 88%, #0a0a0a 100%)
            `,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <Stack
          className="game-card-play"
          direction="row"
          alignItems="center"
          spacing={0.6}
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: 18,
            transform: 'translate(-50%, 8px)',
            zIndex: 3,
            opacity: 0,
            px: 1.25,
            py: 0.55,
            bgcolor: alpha('#000000', 0.7),
            border: `1px solid ${alpha(GOLD, 0.55)}`,
            transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Iconify icon="solar:play-bold" width={12} sx={{ color: GOLD }} />
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            {t('home.playYourGame.enterArena')}
          </Typography>
        </Stack>

        {liveCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.55,
              px: 0.85,
              py: 0.45,
              bgcolor: alpha('#000000', 0.72),
              borderBottom: `1px solid ${alpha('#22c55e', 0.45)}`,
              borderRight: `1px solid ${alpha('#22c55e', 0.45)}`,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                animation: `${livePulse} 1.6s ease-out infinite`,
              }}
            />
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#22c55e', letterSpacing: 0.6 }}>
              {liveCount} {t('home.playYourGame.live')}
            </Typography>
          </Box>
        )}

        {!isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 3,
              px: 0.8,
              py: 0.25,
              bgcolor: alpha('#000000', 0.65),
              border: `1px solid ${alpha(GOLD, 0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 0.5 }}>
              {t('home.playYourGame.comingSoon')}
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        className="game-card-bar"
        sx={{
          height: 2,
          bgcolor: GOLD,
          transform: 'scaleX(0)',
          transformOrigin: 'left center',
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: `0 0 12px ${alpha(GOLD, 0.65)}`,
        }}
      />

      <Stack
        spacing={0.75}
        sx={{
          flexShrink: 0,
          px: { xs: 1.5, md: 1.75 },
          pt: 1.4,
          pb: 1.5,
          bgcolor: '#161618',
          minHeight: { xs: 96, md: 104 },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: GOLD,
              textTransform: 'uppercase',
              mb: 0.4,
            }}
          >
            {t('home.playYourGame.brandLabel')}
          </Typography>
          <Typography
            className="game-card-title font-tr"
            sx={{
              fontSize: { xs: 13, sm: 14, md: 15 },
              fontWeight: 800,
              letterSpacing: 0.5,
              color: '#ffffff',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              transition: 'color 0.3s ease',
            }}
          >
            {t(`home.playYourGame.games.${game.key}`)}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          {game.platforms.map((icon) => (
            <Iconify key={icon} icon={icon} width={15} sx={{ color: alpha('#ffffff', 0.45) }} />
          ))}
          <Typography
            sx={{
              ml: 'auto !important',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.9,
              color: alpha('#ffffff', 0.35),
              textTransform: 'uppercase',
            }}
          >
            {t(`home.playYourGame.genres.${game.genreKey}`)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PlayYourGameSection() {
  const { t } = useTranslate();
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
      .catch(() => {});
  }, []);

  const games = applyLiveCountsToGames(liveCountByGame);
  const sorted = [...games].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    if (a.mobileOnly !== b.mobileOnly) return a.mobileOnly ? -1 : 1;
    return b.liveCount - a.liveCount;
  });

  return (
    <Box
      id="play-your-game"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        // clip (not hidden) — hidden forces overflow-y → auto and creates a nested page scrollbar
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: '#0a0a0a',
        py: { xs: 4.5, md: 6 },
        px: { xs: 2, md: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `url(${HOME_GAME_ARTS[3]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.22,
          filter: 'blur(14px) grayscale(0.32) contrast(1.06)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, ${alpha('#0a0a0a', 0.78)} 0%, ${alpha('#0a0a0a', 0.9)} 48%, #0a0a0a 100%),
            radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha(GOLD, 0.1)} 0%, transparent 55%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1280, mx: 'auto' }}>
        <HomeBlurPanel>
          <Stack spacing={{ xs: 2.5, md: 3.5 }}>
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
                {t('home.playYourGame.title')}
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
                {t('home.playYourGame.subtitle')}
              </Typography>
              <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
            </Stack>

            <Box
              sx={homeMobileScrollGridSx(
                {
                  xs: 'repeat(5, minmax(168px, 1fr))',
                  lg: 'repeat(5, minmax(0, 230px))',
                },
                { xs: 1.25, md: 2 }
              )}
            >
              {sorted.map((game, index) => (
                <PlayYourGameCard key={game.key} game={game} index={index} />
              ))}
            </Box>
          </Stack>
        </HomeBlurPanel>
      </Box>
    </Box>
  );
}
