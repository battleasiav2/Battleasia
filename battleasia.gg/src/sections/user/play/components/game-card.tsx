import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const CARD_BG = '#0c0e14';
const LIVE_GREEN = '#22c55e';

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha(LIVE_GREEN, 0.55)}; }
  50% { opacity: 0.75; box-shadow: 0 0 0 6px ${alpha(LIVE_GREEN, 0)}; }
`;

const artDrift = keyframes`
  0%, 100% { transform: scale(1.04) translate3d(0, 0, 0); }
  50% { transform: scale(1.1) translate3d(-1.5%, -1%, 0); }
`;

const lockBeam = keyframes`
  0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  20% { opacity: 0.85; }
  100% { transform: translateX(160%) skewX(-18deg); opacity: 0; }
`;

const cardEnter = keyframes`
  0% { opacity: 0; transform: translateY(22px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const featuredAura = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`;

const scanlineSlide = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 28px; }
`;

export function formatGamePlayerCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(value);
}

type GameCardProps = {
  title: string;
  subTitle?: string;
  imageUrl?: string;
  comingSoon?: boolean;
  disabled?: boolean;
  liveCount?: number;
  playerCount?: number;
  liveBadgeLabel?: string;
  joinLabel?: string;
  featured?: boolean;
  index?: number;
  onClick?: () => void;
};

/** Arena drop-pod tile — HUD frame, lock-in hover, deep gold JOIN. */
export function GameCard(props: GameCardProps) {
  const {
    title,
    subTitle,
    imageUrl,
    comingSoon,
    disabled,
    liveCount = 0,
    playerCount = 0,
    liveBadgeLabel = 'LIVE',
    joinLabel = 'JOIN',
    featured = false,
    index = 0,
    onClick,
  } = props;

  const isDisabled = disabled || comingSoon;
  const showLive = liveCount > 0 && !comingSoon;
  const isFeatured = featured && !isDisabled;

  return (
    <Box
      onClick={isDisabled ? undefined : onClick}
      role={isDisabled ? undefined : 'button'}
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-disabled={isDisabled}
      sx={{
        position: 'relative',
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: CARD_BG,
        borderRadius: 0,
        clipPath:
          'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))',
        border: isFeatured
          ? `1.5px solid ${goldAlpha(0.75)}`
          : `1px solid ${alpha('#ffffff', 0.1)}`,
        boxShadow: isFeatured
          ? `
            0 18px 44px ${alpha('#000000', 0.7)},
            0 0 0 1px ${goldAlpha(0.25)},
            0 0 36px ${goldAlpha(0.22)}
          `
          : `0 12px 32px ${alpha('#000000', 0.55)}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.62 : 1,
        aspectRatio: '1 / 1',
        minHeight: { xs: 176, sm: 198, md: 210 },
        isolation: 'isolate',
        animation: `${cardEnter} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both`,
        animationDelay: `${Math.min(index, 8) * 0.06}s`,
        transition:
          'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.3s ease',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isFeatured ? 3 : 2,
          background: isFeatured
            ? `linear-gradient(90deg, transparent, ${GOLD}, #fff4b0, ${GOLD}, transparent)`
            : GOLD,
          zIndex: 5,
          boxShadow: `0 0 16px ${goldAlpha(0.7)}`,
        },
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-10px) scale(1.025)',
              borderColor: goldAlpha(0.7),
              boxShadow: `
                0 28px 56px ${alpha('#000000', 0.8)},
                0 0 0 1px ${goldAlpha(0.35)},
                0 0 40px ${goldAlpha(0.28)}
              `,
              '& .game-card-art': {
                animation: 'none',
                transform: 'scale(1.14)',
                filter: 'brightness(1.08) contrast(1.06)',
              },
              '& .game-card-lock-beam': {
                opacity: 1,
                animation: `${lockBeam} 0.85s cubic-bezier(0.22, 1, 0.36, 1)`,
              },
              '& .game-card-title': { color: GOLD },
              '& .game-card-join': {
                bgcolor: 'rgba(17, 24, 39, 0.95)',
                borderColor: GOLD,
                color: GOLD,
                boxShadow: `0 0 18px ${goldAlpha(0.35)}`,
              },
              '& .game-card-bracket': { opacity: 1 },
            },
        '&:focus-visible': {
          outline: `2px solid ${goldAlpha(0.75)}`,
          outlineOffset: 3,
        },
      }}
    >
      {/* Featured aura */}
      {isFeatured ? (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(ellipse at 50% 20%, ${goldAlpha(0.28)} 0%, transparent 65%)`,
            animation: `${featuredAura} 3s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      ) : null}

      {/* HUD corner brackets */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <Box
          key={corner}
          className="game-card-bracket"
          aria-hidden
          sx={{
            position: 'absolute',
            zIndex: 6,
            width: 14,
            height: 14,
            opacity: isFeatured ? 0.9 : 0.35,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            borderColor: GOLD,
            ...(corner === 'tl' && {
              top: 8,
              left: 8,
              borderTop: '2px solid',
              borderLeft: '2px solid',
            }),
            ...(corner === 'tr' && {
              top: 8,
              right: 8,
              borderTop: '2px solid',
              borderRight: '2px solid',
            }),
            ...(corner === 'bl' && {
              bottom: 8,
              left: 8,
              borderBottom: '2px solid',
              borderLeft: '2px solid',
            }),
            ...(corner === 'br' && {
              bottom: 8,
              right: 8,
              borderBottom: '2px solid',
              borderRight: '2px solid',
            }),
          }}
        />
      ))}

      <Box
        sx={{
          position: 'relative',
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: '#050608',
          zIndex: 1,
        }}
      >
        <Box
          className="game-card-art"
          component="img"
          src={imageUrl || PLAY_IMAGE_PATHS.pubgCard}
          alt={title}
          loading="lazy"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease',
            animation: isDisabled ? 'none' : `${artDrift} 14s ease-in-out infinite`,
            animationDelay: `${index * 0.4}s`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />

        {/* Gradient + scanline mesh */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(180deg, ${alpha('#000000', 0.2)} 0%, transparent 28%),
              linear-gradient(180deg, transparent 35%, ${alpha('#000000', 0.55)} 70%, ${alpha(CARD_BG, 0.98)} 100%)
            `,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.18,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              ${alpha('#000000', 0.55)} 2px,
              ${alpha('#000000', 0.55)} 3px
            )`,
            backgroundSize: '100% 28px',
            animation: `${scanlineSlide} 8s linear infinite`,
            pointerEvents: 'none',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />

        {/* Lock-in beam on hover */}
        <Box
          className="game-card-lock-beam"
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '42%',
            opacity: 0,
            background: `linear-gradient(90deg, transparent, ${goldAlpha(0.35)}, ${alpha('#ffffff', 0.45)}, ${goldAlpha(0.35)}, transparent)`,
            pointerEvents: 'none',
            zIndex: 2,
            '@media (prefers-reduced-motion: reduce)': { display: 'none' },
          }}
        />

        {showLive ? (
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
              py: 0.45,
              bgcolor: alpha('#020805', 0.82),
              border: `1px solid ${alpha(LIVE_GREEN, 0.55)}`,
              boxShadow: `0 0 16px ${alpha(LIVE_GREEN, 0.25)}`,
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: LIVE_GREEN,
                animation: `${livePulse} 1.5s ease-out infinite`,
              }}
            />
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 9,
                fontWeight: 800,
                color: LIVE_GREEN,
                letterSpacing: 1,
              }}
            >
              {liveCount} {liveBadgeLabel}
            </Typography>
          </Box>
        ) : null}

        {isFeatured && !showLive ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 3,
              px: 1,
              py: 0.4,
              bgcolor: goldAlpha(0.16),
              border: `1px solid ${goldAlpha(0.5)}`,
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>
              FEATURED
            </Typography>
          </Box>
        ) : null}

        {comingSoon ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 3,
              px: 0.9,
              py: 0.35,
              bgcolor: alpha('#000000', 0.72),
              border: `1px solid ${goldAlpha(0.4)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 0.6 }}>
              SOON
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Stack
        spacing={0.75}
        sx={{
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
          px: { xs: 1.25, sm: 1.45 },
          pt: 1.1,
          pb: 1.2,
          bgcolor: alpha(CARD_BG, 0.96),
          minHeight: { xs: 78, sm: 86 },
          justifyContent: 'space-between',
          borderTop: `1px solid ${alpha('#ffffff', 0.06)}`,
          backgroundImage: `linear-gradient(180deg, ${goldAlpha(0.04)} 0%, transparent 40%)`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {subTitle ? (
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: goldAlpha(0.9),
                mb: 0.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subTitle}
            </Typography>
          ) : null}
          <Typography
            className="game-card-title font-tr"
            sx={{
              fontSize: { xs: 12, sm: 13, md: 14 },
              fontWeight: 800,
              letterSpacing: 0.5,
              color: '#ffffff',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.3s ease',
              textShadow: `0 2px 10px ${alpha('#000000', 0.8)}`,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.75}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
            <Iconify
              icon="solar:users-group-rounded-bold"
              width={14}
              sx={{ color: alpha('#ffffff', 0.5), flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: alpha('#ffffff', 0.78),
                whiteSpace: 'nowrap',
              }}
            >
              {formatGamePlayerCount(playerCount)}
            </Typography>
          </Stack>

          <Box
            className="game-card-join"
            sx={{
              ...userGoldButtonSx,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 28,
              height: 28,
              px: 1.35,
              py: 0,
              fontSize: 10,
              letterSpacing: 1.1,
              flexShrink: 0,
              pointerEvents: 'none',
              transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {joinLabel}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
