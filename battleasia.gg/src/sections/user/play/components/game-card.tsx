import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';

// ----------------------------------------------------------------------

const { gold: GOLD, goldGradient, success: LIVE_GREEN } = USER_COLORS;

const CARD_MIN_HEIGHT = { xs: 320, sm: 340, md: 360 };

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha(LIVE_GREEN, 0.6)}; }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px ${alpha(LIVE_GREEN, 0)}; }
`;

const goldTextGradient = {
  background: goldGradient,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

type GameCardProps = {
  title: string;
  subTitle?: string;
  imageUrl?: string;
  logo?: string;
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
    logo,
    comingSoon,
    disabled,
    liveCount = 0,
    upcomingCount = 0,
    liveLabel = 'Live',
    upcomingLabel = 'Upcoming',
    onClick,
  } = props;
  const isDisabled = disabled || comingSoon;
  const thumbSrc = logo || imageUrl || PLAY_IMAGE_PATHS.pubgCard;

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
        height: 1,
        minHeight: CARD_MIN_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        overflow: 'hidden',
        bgcolor: '#0c0c0c',
        border: `1px solid ${alpha(GOLD, 0.35)}`,
        boxShadow: `
          0 0 0 1px ${alpha(GOLD, 0.06)},
          0 12px 32px ${alpha('#000000', 0.55)},
          0 0 24px ${alpha(GOLD, 0.08)}
        `,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.72 : 1,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-8px)',
              borderColor: alpha(GOLD, 0.55),
              boxShadow: `
                0 0 0 1px ${alpha(GOLD, 0.15)},
                0 22px 48px ${alpha('#000000', 0.65)},
                0 0 36px ${alpha(GOLD, 0.18)}
              `,
              '& .game-card-art': { transform: 'scale(1.06)' },
            },
        '&:focus-visible': {
          outline: `2px solid ${alpha(GOLD, 0.7)}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Hero art — fixed flex slice so all cards share proportions */}
      <Box
        sx={{
          position: 'relative',
          width: 1,
          flex: '0 0 42%',
          minHeight: { xs: 120, sm: 130 },
          maxHeight: { xs: 150, sm: 165, md: 175 },
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

        <Box
          component="img"
          src={thumbSrc}
          alt=""
          loading="lazy"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: '6px',
            border: `1px solid ${alpha(GOLD, 0.4)}`,
            boxShadow: `0 4px 16px ${alpha('#000000', 0.6)}, 0 0 12px ${alpha(GOLD, 0.15)}`,
          }}
        />

        {comingSoon ? (
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

      {/* Title — fixed height block */}
      <Stack
        spacing={0.5}
        sx={{
          flex: '1 1 auto',
          px: 1.25,
          pt: 1,
          pb: 0.75,
          alignItems: 'center',
          textAlign: 'center',
          minHeight: 72,
          justifyContent: 'center',
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 14, sm: 15, md: 16 },
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: 0.2,
            width: 1,
            minHeight: '2.4em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            ...goldTextGradient,
          }}
        >
          {title}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ width: 1, minHeight: 16 }}>
          <Box
            sx={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)})`,
            }}
          />
          <Typography
            sx={{
              fontSize: 9,
              fontWeight: 600,
              color: alpha('#ffffff', 0.5),
              letterSpacing: 0.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '58%',
              flexShrink: 1,
            }}
          >
            {subTitle || '\u00A0'}
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, ${alpha('#ffffff', 0.2)}, transparent)`,
            }}
          />
        </Stack>
      </Stack>

      {/* Stats — equal height pills pinned to bottom */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          flex: '0 0 auto',
          px: 1.25,
          pb: 1.25,
          pt: 0,
          mt: 'auto',
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
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: LIVE_GREEN,
                boxShadow: `0 0 8px ${alpha(LIVE_GREEN, 0.7)}`,
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
            <Iconify icon="solar:calendar-bold" width={14} sx={{ color: GOLD }} />
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
        height: 68,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.35,
        px: 0.5,
        py: 0.75,
        borderRadius: '8px',
        bgcolor: alpha('#000000', 0.45),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(accent, active ? 0.42 : 0.16)}`,
        boxShadow: active
          ? `inset 0 1px 0 ${alpha('#ffffff', 0.06)}, 0 0 12px ${alpha(accent, 0.1)}`
          : `inset 0 1px 0 ${alpha('#ffffff', 0.04)}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 8,
          fontWeight: 800,
          color: alpha('#ffffff', 0.6),
          textTransform: 'uppercase',
          letterSpacing: 0.5,
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
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
        {icon}
        <Typography
          sx={{
            fontSize: { xs: 18, sm: 20 },
            fontWeight: 900,
            lineHeight: 1,
            ...goldTextGradient,
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}
