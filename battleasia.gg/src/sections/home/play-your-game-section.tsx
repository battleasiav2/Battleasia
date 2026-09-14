import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { PLAY_YOUR_GAME_IMAGE_PATHS, HOME_GAME_ARTS } from './home-game-arts';
import { LANDING_V2, landingPanelSx, landingPrimaryBtnSx } from './landing-v2-theme';
import { LivePulseDot } from './live-pulse-dot';

export { HOME_GAME_ARTS, PLAY_YOUR_GAME_IMAGE_PATHS };

// ----------------------------------------------------------------------

type GameSpec = {
  key: string;
  art: string;
  available: boolean;
  liveCount: number;
};

const BASE_GAMES: Omit<GameSpec, 'liveCount'>[] = [
  { key: 'pubgMobile', art: PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile, available: true },
  { key: 'freeFire', art: PLAY_YOUR_GAME_IMAGE_PATHS.freeFire, available: true },
  { key: 'codMobile', art: PLAY_YOUR_GAME_IMAGE_PATHS.codMobile, available: true },
  { key: 'mobileLegends', art: PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends, available: true },
  { key: 'valorant', art: PLAY_YOUR_GAME_IMAGE_PATHS.valorant, available: false },
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
): GameSpec[] {
  return BASE_GAMES.map((game) => {
    const apiKey = Object.entries(GAME_NAME_TO_KEY).find(([, v]) => v === game.key)?.[0];
    const count = apiKey && liveCountByGame ? liveCountByGame[apiKey] ?? 0 : 0;
    return { ...game, liveCount: count };
  });
}

// ----------------------------------------------------------------------

export function PlayYourGameSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [activeIndex, setActiveIndex] = useState(0);
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

  const games = useMemo(() => applyLiveCountsToGames(liveCountByGame), [liveCountByGame]);
  const activeGame = games[activeIndex] || games[0];
  const accentColor = theme.palette.primary.main || '#cbfb24';

  const titleRaw = t('home.playYourGame.title') || 'PLAY YOUR GAME';
  const titleWords = titleRaw.split(' ');
  const titleLine1 = titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : titleRaw;
  const titleLine2 = titleWords.length > 1 ? titleWords[titleWords.length - 1] : '';

  const selectGame = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <Box
      id="play-your-game"
      component="section"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: LANDING_V2.ink,
        color: LANDING_V2.text,
        py: { xs: 9, sm: 11, md: 'clamp(72px, 10vw, 148px)' },
        px: { xs: 2.5, sm: 4, md: 5 },
        borderTop: `1px solid ${LANDING_V2.hair}`,
      }}
    >
      <Box
        sx={{
          maxWidth: LANDING_V2.wrap,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.02fr 0.98fr' },
          gap: { xs: 3.5, md: 5 },
          alignItems: 'center',
        }}
      >
        {/* Copy + switcher (zip play-copy) */}
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <Typography
            component="h2"
            className="landing-display"
            sx={{
              fontFamily: LANDING_V2.display,
              fontWeight: 600,
              fontSize: { xs: '2.5rem', sm: 'clamp(2.5rem, 11vw, 7.2rem)' },
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: LANDING_V2.text,
            }}
          >
            {titleLine1}
            {titleLine2 ? (
              <>
                <br />
                {titleLine2}
              </>
            ) : null}
          </Typography>

          <Typography
            sx={{
              mt: 2,
              maxWidth: '42ch',
              color: LANDING_V2.muted,
              fontSize: { xs: '1rem', md: '1.12rem' },
              lineHeight: 1.5,
            }}
          >
            {t('home.playYourGame.subtitle')}
          </Typography>

          <Stack spacing={1} sx={{ my: { xs: 3, md: 4 } }} role="listbox" aria-label="Select a game">
            {games.map((game, idx) => {
              const selected = idx === activeIndex;
              const label = t(`home.playYourGame.games.${game.key}`);

              return (
                <ButtonBase
                  key={game.key}
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectGame(idx)}
                  sx={{
                    width: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    textAlign: 'left',
                    borderRadius: LANDING_V2.radiusSm,
                    border: '1px solid',
                    borderColor: selected ? accentColor : LANDING_V2.hair,
                    bgcolor: selected ? alpha(accentColor, 0.06) : 'transparent',
                    boxShadow: selected ? `0 0 0 1px ${alpha(accentColor, 0.14)}` : 'none',
                    transition: `border-color 0.25s ${LANDING_V2.ease}, background-color 0.25s ${LANDING_V2.ease}`,
                    '&:hover': {
                      borderColor: selected ? accentColor : LANDING_V2.hair2,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: LANDING_V2.display,
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: LANDING_V2.text,
                    }}
                  >
                    {label}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                    {game.available ? (
                      <>
                        <LivePulseDot size={7} />
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            color: accentColor,
                            textTransform: 'uppercase',
                          }}
                        >
                          {game.liveCount > 0
                            ? `${game.liveCount} ${t('home.playYourGame.live')}`
                            : t('home.playYourGame.live')}
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: LANDING_V2.faint,
                          textTransform: 'uppercase',
                        }}
                      >
                        {t('home.playYourGame.comingSoon')}
                      </Typography>
                    )}
                  </Stack>
                </ButtonBase>
              );
            })}
          </Stack>

          <ButtonBase
            component={RouterLink}
            href={
              activeGame.available
                ? `${paths.user.play}?game=${activeGame.key}`
                : paths.user.play
            }
            sx={{
              ...landingPrimaryBtnSx,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3.5,
              minHeight: 52,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            <span>
              {activeGame.available
                ? t('home.playYourGame.enterArena')
                : t('home.playYourGame.comingSoon')}
            </span>
            <Iconify icon="solar:arrow-right-bold" width={18} />
          </ButtonBase>
        </Box>

        {/* Stage (zip play-stage) */}
        <Box
          sx={{
            order: { xs: 1, md: 2 },
            position: 'relative',
            minHeight: { xs: 360, sm: 420, md: 560 },
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            ...landingPanelSx,
            overflow: 'hidden',
            px: 2,
            pt: 4,
            pb: 0,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: '12% 10% 18%',
              background: `radial-gradient(ellipse at 50% 60%, ${alpha(accentColor, 0.22)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <Typography
            sx={{
              position: 'absolute',
              top: 18,
              left: { xs: '50%', md: 22 },
              transform: { xs: 'translateX(-50%)', md: 'none' },
              zIndex: 2,
              fontFamily: LANDING_V2.display,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: LANDING_V2.muted,
              px: 1.5,
              py: 0.6,
              borderRadius: 999,
              border: `1px solid ${LANDING_V2.hair}`,
              bgcolor: alpha('#000', 0.35),
              backdropFilter: 'blur(8px)',
            }}
          >
            {t(`home.playYourGame.games.${activeGame.key}`)}
          </Typography>

          <Box
            component="img"
            key={activeGame.key}
            src={activeGame.art}
            alt={t(`home.playYourGame.games.${activeGame.key}`)}
            width={720}
            height={900}
            loading="lazy"
            decoding="async"
            sx={{
              position: 'relative',
              zIndex: 1,
              maxHeight: { xs: 380, sm: 460, md: 560 },
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.65))',
              transition: `opacity 0.35s ${LANDING_V2.ease}, transform 0.35s ${LANDING_V2.ease}`,
            }}
          />

          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '8%',
              right: '8%',
              height: 48,
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.55))',
              borderRadius: '50%',
              filter: 'blur(12px)',
              zIndex: 0,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
