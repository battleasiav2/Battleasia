import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const LIVE_GREEN = '#22c55e';

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

/** Clean tournament game tile — art, title, spots, JOIN. */
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
        borderRadius: '16px',
        bgcolor: 'rgba(22,22,24,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isFeatured ? goldAlpha(0.4) : alpha('#ffffff', 0.1)}`,
        boxShadow: isFeatured
          ? `inset 2px 0 0 ${GOLD}, 0 20px 48px -28px #000`
          : 'inset 2px 0 0 transparent, 0 16px 40px -32px #000',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.58 : 1,
        aspectRatio: '3 / 4',
        minHeight: { xs: 200, sm: 220, md: 236 },
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-4px)',
              borderColor: goldAlpha(0.45),
              boxShadow: `inset 2px 0 0 ${GOLD}, 0 24px 48px -24px #000`,
              '& .game-card-art': { transform: 'scale(1.05)' },
              '& .game-card-title': { color: GOLD },
              '& .game-card-join': {
                bgcolor: goldAlpha(0.16),
                borderColor: goldAlpha(0.5),
                color: GOLD,
              },
            },
        '&:focus-visible': {
          outline: `2px solid ${goldAlpha(0.7)}`,
          outlineOffset: 3,
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
          decoding="async"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            transition: 'transform 0.45s ease',
          }}
        />

        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha('#000', 0.15)} 0%, transparent 35%, ${alpha('#161618', 0.92)} 100%)`,
            pointerEvents: 'none',
          }}
        />

        {showLive ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.55,
              px: 1,
              py: 0.4,
              borderRadius: 999,
              bgcolor: alpha('#000', 0.72),
              border: `1px solid ${alpha(LIVE_GREEN, 0.45)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: LIVE_GREEN,
              }}
            />
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                color: LIVE_GREEN,
                letterSpacing: 0.6,
              }}
            >
              {liveCount} {liveBadgeLabel}
            </Typography>
          </Box>
        ) : null}

        {comingSoon ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: alpha('#000', 0.7),
              border: `1px solid ${goldAlpha(0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 0.6 }}>
              SOON
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Stack
        spacing={0.85}
        sx={{
          flexShrink: 0,
          px: { xs: 1.25, sm: 1.4 },
          pt: 1.15,
          pb: 1.25,
          minHeight: { xs: 88, sm: 96 },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {subTitle ? (
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.42),
                mb: 0.35,
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
              fontSize: { xs: 13, sm: 14, md: 15 },
              fontWeight: 800,
              letterSpacing: 0.3,
              color: '#ffffff',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.2s ease',
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
                fontSize: 12,
                fontWeight: 700,
                color: alpha('#ffffff', 0.72),
                whiteSpace: 'nowrap',
              }}
            >
              {formatGamePlayerCount(playerCount)}
            </Typography>
          </Stack>

          <Box
            className="game-card-join"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 30,
              height: 30,
              px: 1.5,
              borderRadius: '8px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: alpha('#ffffff', 0.88),
              bgcolor: alpha('#ffffff', 0.04),
              border: `1px solid ${alpha('#ffffff', 0.14)}`,
              flexShrink: 0,
              pointerEvents: 'none',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
            }}
          >
            {joinLabel}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
