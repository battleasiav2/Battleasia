import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const CARD_BG = '#161618';
const LIVE_GREEN = '#22c55e';

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha(LIVE_GREEN, 0.55)}; }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px ${alpha(LIVE_GREEN, 0)}; }
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
  onClick?: () => void;
};

/** Square-corner arena tile — matches home Play Your Game brand shell. */
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
    onClick,
  } = props;

  const isDisabled = disabled || comingSoon;
  const showLive = liveCount > 0 && !comingSoon;

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
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: CARD_BG,
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        boxShadow: `0 10px 28px ${alpha('#000000', 0.5)}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        aspectRatio: '1 / 1',
        minHeight: { xs: 168, sm: 190, md: 200 },
        isolation: 'isolate',
        transition:
          'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: GOLD,
          zIndex: 4,
          boxShadow: `0 0 12px ${goldAlpha(0.45)}`,
        },
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-6px)',
              borderColor: goldAlpha(0.38),
              boxShadow: `
                0 18px 40px ${alpha('#000000', 0.65)},
                0 0 0 1px ${goldAlpha(0.16)},
                0 0 24px ${goldAlpha(0.1)}
              `,
              '& .game-card-art': { transform: 'scale(1.06)' },
              '& .game-card-title': { color: GOLD },
            },
        '&:focus-visible': {
          outline: `2px solid ${goldAlpha(0.75)}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: '#0a0a0a',
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
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(180deg, ${alpha('#000000', 0.18)} 0%, transparent 30%),
              linear-gradient(180deg, transparent 40%, ${alpha('#000000', 0.55)} 72%, ${alpha(CARD_BG, 0.95)} 100%)
            `,
            pointerEvents: 'none',
          }}
        />

        {showLive ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.55,
              px: 0.85,
              py: 0.45,
              bgcolor: alpha('#000000', 0.72),
              borderBottom: `1px solid ${alpha(LIVE_GREEN, 0.45)}`,
              borderRight: `1px solid ${alpha(LIVE_GREEN, 0.45)}`,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: LIVE_GREEN,
                animation: `${livePulse} 1.6s ease-out infinite`,
              }}
            />
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: LIVE_GREEN, letterSpacing: 0.6 }}>
              {liveCount} {liveBadgeLabel}
            </Typography>
          </Box>
        ) : null}

        {comingSoon ? (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              px: 0.8,
              py: 0.25,
              bgcolor: alpha('#000000', 0.65),
              border: `1px solid ${goldAlpha(0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 0.5 }}>
              SOON
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Stack
        spacing={0.65}
        sx={{
          flexShrink: 0,
          px: { xs: 1.25, sm: 1.4 },
          pt: 1,
          pb: 1.1,
          bgcolor: CARD_BG,
          minHeight: { xs: 72, sm: 78 },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {subTitle ? (
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: goldAlpha(0.92),
                mb: 0.25,
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
              fontSize: { xs: 11, sm: 12, md: 13 },
              fontWeight: 800,
              letterSpacing: 0.4,
              color: '#ffffff',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.3s ease',
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
              sx={{ color: alpha('#ffffff', 0.45), flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: alpha('#ffffff', 0.72),
                whiteSpace: 'nowrap',
              }}
            >
              {formatGamePlayerCount(playerCount)}
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1,
              color: GOLD,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {joinLabel}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
