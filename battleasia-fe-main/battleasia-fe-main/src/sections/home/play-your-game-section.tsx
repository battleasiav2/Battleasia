import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { GLASS_CARD_RADIUS, GLASS_CARD_RADIUS_SM } from 'src/components/battle-glass-card';
import { glassShimmerKeyframes } from 'src/components/battle-glass-card/glass-shimmer';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

export const PLAY_YOUR_GAME_IMAGE_PATHS = {
  pubgMobile: '/assets/images/games/art/pubg-mobile.png',
  freeFire: '/assets/images/games/art/free-fire.png',
  codMobile: '/assets/images/games/art/cod-mobile.png',
  valorant: '/assets/images/games/art/valorant.png',
  mobileLegends: '/assets/images/games/art/mobile-legends.png',
} as const;

const GAMES = [
  {
    key: 'pubgMobile',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile,
    accent: '#d4845c',
    genreKey: 'battleRoyale',
    liveCount: 8,
    available: true,
  },
  {
    key: 'freeFire',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.freeFire,
    accent: '#d4845c',
    genreKey: 'survival',
    liveCount: 1,
    available: true,
  },
  {
    key: 'codMobile',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.codMobile,
    accent: '#c9a06c',
    genreKey: 'fps',
    liveCount: 1,
    available: true,
  },
  {
    key: 'valorant',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.valorant,
    accent: '#c084fc',
    genreKey: 'tactical',
    liveCount: 1,
    available: true,
  },
  {
    key: 'mobileLegends',
    art: PLAY_YOUR_GAME_IMAGE_PATHS.mobileLegends,
    accent: '#d4845c',
    genreKey: 'moba',
    liveCount: 1,
    available: true,
  },
] as const;

const cardReveal = keyframes`
  from { opacity: 0; transform: translateY(22px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.88); }
`;

const borderGlow = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.9; }
`;

// ----------------------------------------------------------------------

type PlayYourGameCardProps = {
  game: (typeof GAMES)[number];
  index: number;
};

function PlayYourGameCard({ game, index }: PlayYourGameCardProps) {
  const { t } = useTranslate();
  const isAvailable = game.available;
  const liveCount = 'liveCount' in game ? game.liveCount : 0;

  return (
    <Box
      component={RouterLink}
      href={paths.user.play}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${GLASS_CARD_RADIUS}px`,
        overflow: 'hidden',
        aspectRatio: '196 / 300',
        minWidth: { xs: 172, sm: 0 },
        maxWidth: { md: 240 },
        scrollSnapAlign: 'start',
        textDecoration: 'none',
        isolation: 'isolate',
        animation: `${cardReveal} 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.09}s both`,
        bgcolor: '#0a0a0a',
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        boxShadow: `0 12px 32px ${alpha('#000000', 0.6)}, inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease',
        opacity: isAvailable ? 1 : 0.88,
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          boxShadow: `
            0 28px 56px ${alpha('#000000', 0.75)},
            0 0 40px ${alpha(game.accent, 0.25)},
            inset 0 1px 0 ${alpha('#ffffff', 0.16)}
          `,
          '& .game-card-art': {
            transform: 'scale(1.12)',
            filter: 'brightness(1.1) saturate(1.15)',
          },
          '& .game-card-border-glow': {
            opacity: 1,
          },
          '& .game-card-shine': {
            opacity: 1,
          },
          '& .game-card-cta': {
            bgcolor: alpha('#000000', 0.72),
            borderColor: alpha(game.accent, 0.45),
            '& .game-card-cta-icon': {
              transform: 'translateX(4px)',
              color: game.accent,
            },
          },
        },
      }}
    >
      {/* Animated accent border on hover */}
      <Box
        className="game-card-border-glow"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${GLASS_CARD_RADIUS}px`,
          border: `1px solid ${alpha(game.accent, 0.55)}`,
          opacity: 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 5,
          animation: `${borderGlow} 2.4s ease-in-out infinite`,
        }}
      />

      {/* Art area */}
      <Box
        sx={{
          position: 'relative',
          flex: '1 1 62%',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          className="game-card-art"
          component="img"
          src={game.art}
          alt={t(`home.playYourGame.games.${game.key}`)}
          loading="lazy"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 35%, ${alpha('#000000', 0.55)} 78%, #0a0a0a 100%)`,
            pointerEvents: 'none',
          }}
        />

        <Box
          className="game-card-shine"
          sx={{
            ...glassShimmerKeyframes,
            position: 'absolute',
            inset: 0,
            opacity: 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
            zIndex: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-20%',
              left: '-70%',
              width: '60%',
              height: '140%',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 65%, transparent 100%)',
              animation: 'glassShimmer 2s ease-in-out infinite',
            },
          }}
        />

        {liveCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.35,
              borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
              bgcolor: alpha('#000000', 0.55),
              border: `1px solid ${alpha('#22c55e', 0.45)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                animation: `${livePulse} 1.8s ease-in-out infinite`,
                boxShadow: `0 0 8px ${alpha('#22c55e', 0.8)}`,
              }}
            />
            <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#22c55e', letterSpacing: 0.6 }}>
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
              px: 0.9,
              py: 0.3,
              borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
              bgcolor: alpha('#000000', 0.6),
              border: `1px solid ${alpha('#f5c518', 0.35)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#f5c518', letterSpacing: 0.5 }}>
              {t('home.playYourGame.comingSoon')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info panel */}
      <Stack spacing={0.2} sx={{ px: 1.5, pt: 0.75, pb: 0.5, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: alpha('#ffffff', 0.45),
            textTransform: 'uppercase',
          }}
        >
          {t('home.playYourGame.brandLabel')}
        </Typography>
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 14, md: 15 },
            fontWeight: 900,
            letterSpacing: 0.4,
            color: '#ffffff',
            textTransform: 'uppercase',
            lineHeight: 1.15,
          }}
        >
          {t(`home.playYourGame.games.${game.key}`)}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: game.accent,
            textTransform: 'uppercase',
          }}
        >
          {t(`home.playYourGame.genres.${game.genreKey}`)}
        </Typography>
      </Stack>

      {/* CTA button */}
      <Box
        className="game-card-cta"
        sx={{
          mx: 1.25,
          mb: 1.25,
          mt: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.25,
          py: 0.9,
          borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
          bgcolor: alpha('#000000', 0.55),
          border: `1px solid ${alpha('#ffffff', 0.12)}`,
          backdropFilter: 'blur(10px)',
          transition: 'background-color 0.35s ease, border-color 0.35s ease',
          backgroundImage: `linear-gradient(180deg, ${alpha('#ffffff', 0.06)} 0%, transparent 55%)`,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1,
            color: alpha('#ffffff', 0.9),
            textTransform: 'uppercase',
          }}
        >
          {t('home.playYourGame.enterArena')}
        </Typography>
        <Iconify
          className="game-card-cta-icon"
          icon="eva:arrow-ios-forward-fill"
          width={14}
          sx={{
            color: alpha('#ffffff', 0.65),
            transition: 'transform 0.3s ease, color 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PlayYourGameSection() {
  const { t } = useTranslate();

  return (
    <Box
      id="play-your-game"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#000000',
        py: { xs: 4, md: 5 },
        px: { xs: 2, md: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 90% 55% at 50% -5%, ${alpha('#f5a623', 0.09)} 0%, transparent 58%),
            radial-gradient(ellipse 50% 35% at 15% 95%, ${alpha('#38bdf8', 0.06)} 0%, transparent 50%),
            radial-gradient(ellipse 50% 35% at 85% 90%, ${alpha('#c084fc', 0.06)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack
        spacing={{ xs: 2.5, md: 4 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 1280, mx: 'auto' }}
      >
        <Stack spacing={1} alignItems="center">
          <Typography
            variant="h2"
            className="font-tr"
            sx={{
              fontSize: { xs: 22, sm: 32, md: 42 },
              fontWeight: 800,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: { xs: 1, md: 2.5 },
              color: '#ffffff',
              textShadow: `0 0 48px ${alpha('#f5c518', 0.18)}`,
            }}
          >
            {t('home.playYourGame.title')}
          </Typography>
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 12, sm: 14, md: 15 },
              color: alpha('#ffffff', 0.5),
              textAlign: 'center',
              maxWidth: 540,
              lineHeight: 1.55,
            }}
          >
            {t('home.playYourGame.subtitle')}
          </Typography>
          <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(5, minmax(172px, 1fr))',
              sm: 'repeat(5, minmax(180px, 1fr))',
              lg: 'repeat(5, minmax(0, 220px))',
            },
            justifyContent: 'center',
            gap: { xs: 1.25, sm: 1.75, md: 2.25 },
            overflowX: { xs: 'auto', lg: 'visible' },
            px: { xs: 0.5, md: 0 },
            pb: { xs: 1.5, md: 0 },
            scrollSnapType: { xs: 'x mandatory', lg: 'none' },
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { height: 5 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha('#ffffff', 0.22),
              borderRadius: 4,
            },
          }}
        >
          {GAMES.map((game, index) => (
            <PlayYourGameCard key={game.key} game={game} index={index} />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
