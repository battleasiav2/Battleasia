import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';

// ----------------------------------------------------------------------

const { gold: GOLD, goldGradient, success: LIVE_GREEN } = USER_COLORS;

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

/** Premium tournament tile — ref-style gold border, gradient title, glass stat pills. */
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
      {/* Hero art */}
      <Box
        sx={{
          position: 'relative',
          width: 1,
          aspectRatio: '16 / 11',
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

        {/* Bottom fade into card body */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 55%, ${alpha('#0c0c0c', 0.92)} 100%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Inset thumbnail — ref top-right */}
        <Box
          component="img"
          src={thumbSrc}
          alt=""
          loading="lazy"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
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
              top: 10,
              left: 10,
              px: 1,
              py: 0.4,
              bgcolor: alpha('#000000', 0.75),
              border: `1px solid ${alpha(GOLD, 0.5)}`,
              borderRadius: '4px',
              boxShadow: `0 0 10px ${alpha(GOLD, 0.2)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>
              SOON
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* Title block */}
      <Stack
        spacing={0.75}
        sx={{
          px: { xs: 1.25, sm: 1.5 },
          pt: { xs: 1, sm: 1.25 },
          pb: { xs: 0.5, sm: 0.75 },
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 17, sm: 19 },
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: 0.3,
            ...goldTextGradient,
          }}
        >
          {title}
        </Typography>

        {subTitle ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1, maxWidth: 220 }}>
            <Box
              sx={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.22)})`,
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: 9, sm: 10 },
                fontWeight: 600,
                color: alpha('#ffffff', 0.55),
                letterSpacing: 0.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '55%',
              }}
            >
              {subTitle}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg, ${alpha('#ffffff', 0.22)}, transparent)`,
              }}
            />
          </Stack>
        ) : null}
      </Stack>

      {/* Live / Upcoming pills */}
      <Stack direction="row" spacing={1} sx={{ px: { xs: 1.25, sm: 1.5 }, pb: { xs: 1.25, sm: 1.5 }, pt: 0.5 }}>
        {/* Live */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.1,
            py: 1,
            borderRadius: '8px',
            bgcolor: alpha('#000000', 0.45),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(LIVE_GREEN, liveCount > 0 ? 0.45 : 0.18)}`,
            boxShadow: liveCount > 0
              ? `inset 0 1px 0 ${alpha('#ffffff', 0.06)}, 0 0 16px ${alpha(LIVE_GREEN, 0.12)}`
              : `inset 0 1px 0 ${alpha('#ffffff', 0.04)}`,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: LIVE_GREEN,
              flexShrink: 0,
              boxShadow: `0 0 8px ${alpha(LIVE_GREEN, 0.7)}`,
              animation: liveCount > 0 ? `${livePulse} 1.5s ease-in-out infinite` : 'none',
            }}
          />
          <Stack spacing={0.15} sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 800,
                color: alpha('#ffffff', 0.65),
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                lineHeight: 1,
              }}
            >
              {liveLabel}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 22 },
                fontWeight: 900,
                lineHeight: 1,
                ...goldTextGradient,
              }}
            >
              {liveCount}
            </Typography>
          </Stack>
        </Box>

        {/* Upcoming */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.1,
            py: 1,
            borderRadius: '8px',
            bgcolor: alpha('#000000', 0.45),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(GOLD, upcomingCount > 0 ? 0.42 : 0.18)}`,
            boxShadow: upcomingCount > 0
              ? `inset 0 1px 0 ${alpha('#ffffff', 0.06)}, 0 0 16px ${alpha(GOLD, 0.1)}`
              : `inset 0 1px 0 ${alpha('#ffffff', 0.04)}`,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              bgcolor: alpha(GOLD, 0.12),
              border: `1px solid ${alpha(GOLD, 0.28)}`,
              color: GOLD,
            }}
          >
            <Iconify icon="solar:calendar-bold" width={16} />
          </Box>
          <Stack spacing={0.15} sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 800,
                color: alpha('#ffffff', 0.65),
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                lineHeight: 1,
              }}
            >
              {upcomingLabel}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 22 },
                fontWeight: 900,
                lineHeight: 1,
                ...goldTextGradient,
              }}
            >
              {upcomingCount}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
