import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';

// ----------------------------------------------------------------------

const { gold: GOLD, success: LIVE_GREEN } = USER_COLORS;

const CARD_MIN_HEIGHT = { xs: 248, sm: 258, md: 268 };

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha(LIVE_GREEN, 0.6)}; }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px ${alpha(LIVE_GREEN, 0)}; }
`;

type GameCardProps = {
  title: string;
  subTitle?: string;
  imageUrl?: string;
  logo?: string;
  featured?: boolean;
  comingSoon?: boolean;
  disabled?: boolean;
  liveCount?: number;
  upcomingCount?: number;
  liveLabel?: string;
  upcomingLabel?: string;
  onClick?: () => void;
};

/** Premium tournament tile — equal height grid cell, ref-style gold border. */
export function GameCard(props: GameCardProps) {
  const {
    title,
    subTitle,
    imageUrl,
    logo: _logo,
    featured = false,
    comingSoon,
    disabled,
    liveCount = 0,
    upcomingCount = 0,
    liveLabel = 'Live',
    upcomingLabel = 'Upcoming',
    onClick,
  } = props;
  const isDisabled = disabled || comingSoon;
  const accent =
    title.includes('Free Fire')
      ? '#a855f7'
      : title.includes('Call of Duty')
        ? '#60a5fa'
        : title.includes('Valorant')
          ? '#5eead4'
          : title.includes('Legends')
            ? '#facc15'
            : GOLD;

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
        width: 1,
        minHeight: CARD_MIN_HEIGHT,
        maxHeight: CARD_MIN_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        overflow: 'hidden',
        bgcolor: '#0c0c0c',
        border: `1px solid ${alpha(accent, 0.4)}`,
        boxShadow: `
          0 0 0 1px ${alpha(accent, 0.08)},
          0 12px 32px ${alpha('#000000', 0.55)},
          0 0 24px ${alpha(accent, 0.12)}
        `,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.72 : 1,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-8px)',
              borderColor: alpha(accent, 0.6),
              boxShadow: `
                0 0 0 1px ${alpha(accent, 0.18)},
                0 22px 48px ${alpha('#000000', 0.65)},
                0 0 36px ${alpha(accent, 0.22)}
              `,
              '& .game-card-art': { transform: 'scale(1.06)' },
            },
        '&:focus-visible': {
          outline: `2px solid ${alpha(accent, 0.75)}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Hero art */}
      <Box
        sx={{
          position: 'relative',
          width: 1,
          flex: '0 0 auto',
          aspectRatio: '16 / 10',
          overflow: 'hidden',
          bgcolor: '#050505',
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
            objectPosition: 'center center',
            display: 'block',
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 55%, ${alpha('#0c0c0c', 0.92)} 100%)`,
            pointerEvents: 'none',
          }}
        />

        {featured ? (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              px: 0.8,
              py: 0.35,
              display: 'flex',
              alignItems: 'center',
              gap: 0.45,
              bgcolor: alpha('#000000', 0.78),
              border: `1px solid ${alpha(GOLD, 0.5)}`,
              borderRadius: '999px',
              boxShadow: `0 0 10px ${alpha(GOLD, 0.18)}`,
            }}
          >
            <Iconify icon="solar:star-bold" width={11} sx={{ color: GOLD }} />
            <Typography sx={{ fontSize: 8, fontWeight: 800, color: GOLD, letterSpacing: 0.7 }}>
              FEATURED
            </Typography>
          </Box>
        ) : comingSoon ? (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              px: 0.85,
              py: 0.35,
              bgcolor: alpha('#000000', 0.75),
              border: `1px solid ${alpha(GOLD, 0.5)}`,
              borderRadius: '4px',
            }}
          >
            <Typography sx={{ fontSize: 8, fontWeight: 800, color: GOLD, letterSpacing: 0.8 }}>
              SOON
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* Title */}
      <Stack
        spacing={0.35}
        sx={{
          flex: '0 0 auto',
          px: 1,
          pt: 0.75,
          pb: 0.5,
          alignItems: 'center',
          textAlign: 'center',
          minHeight: 52,
          justifyContent: 'center',
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 13, sm: 14 },
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: 0.15,
            width: 1,
            minHeight: '2.3em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: accent,
            textShadow: `0 0 18px ${alpha(accent, 0.15)}`,
          }}
        >
          {title}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: 1, minHeight: 22 }}>
          <Typography
            sx={{
              px: 1,
              py: 0.35,
              fontSize: { xs: 8.5, sm: 9 },
              fontWeight: 800,
              letterSpacing: 0.7,
              textTransform: 'uppercase',
              color: alpha('#ffffff', 0.78),
              bgcolor: alpha('#ffffff', 0.06),
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '92%',
            }}
          >
            {subTitle || '\u00A0'}
          </Typography>
        </Stack>
      </Stack>

      {/* Stats — equal height pills pinned to bottom */}
      <Stack
        direction="row"
        spacing={0.65}
        sx={{
          flex: '0 0 auto',
          px: 1,
          pb: 1,
          pt: 0,
        }}
      >
        <StatPill
          label={liveLabel}
          value={liveCount}
          accent={LIVE_GREEN}
          active={liveCount > 0}
          icon={
            <Box
              sx={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                bgcolor: LIVE_GREEN,
                boxShadow: `0 0 10px ${alpha(LIVE_GREEN, 0.85)}`,
                animation: liveCount > 0 ? `${livePulse} 1.5s ease-in-out infinite` : 'none',
              }}
            />
          }
        />
        <StatPill
          label={upcomingLabel}
          value={upcomingCount}
          accent={GOLD}
          active={upcomingCount > 0}
          icon={
            <Iconify icon="solar:calendar-bold" width={16} sx={{ color: GOLD }} />
          }
        />
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

type StatPillProps = {
  label: string;
  value: number;
  accent: string;
  active: boolean;
  icon: React.ReactNode;
};

function StatPill({ label, value, accent, active, icon }: StatPillProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: 58,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.4,
        px: 0.4,
        py: 0.5,
        borderRadius: '8px',
        bgcolor: alpha('#000000', 0.5),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(accent, active ? 0.55 : 0.18)}`,
        boxShadow: active
          ? `inset 0 1px 0 ${alpha('#ffffff', 0.07)}, 0 0 16px ${alpha(accent, 0.2)}`
          : `inset 0 1px 0 ${alpha('#ffffff', 0.04)}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 9.5,
          fontWeight: 800,
          color: alpha(accent, active ? 0.95 : 0.55),
          textTransform: 'uppercase',
          letterSpacing: 0.85,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          px: 0.25,
        }}
      >
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.6}>
        {icon}
        <Typography
          sx={{
            fontSize: { xs: 19, sm: 21 },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -0.4,
            color: accent,
            textShadow: active ? `0 0 12px ${alpha(accent, 0.45)}` : 'none',
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}
