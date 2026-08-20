import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha('#22c55e', 0.55)}; }
  50% { opacity: 0.75; box-shadow: 0 0 0 4px ${alpha('#22c55e', 0)}; }
`;

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

/** Tournament tile — art on top, title + live/upcoming counts below. */
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
        borderRadius: '6px',
        overflow: 'hidden',
        bgcolor: '#111111',
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.78 : 1,
        boxShadow: `0 8px 24px ${alpha('#000000', 0.45)}`,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-6px)',
              borderColor: alpha(GOLD, 0.38),
              boxShadow: `0 18px 40px ${alpha('#000000', 0.6)}, 0 0 0 1px ${alpha(GOLD, 0.12)}`,
              '& .game-card-art': { transform: 'scale(1.05)' },
              '& .game-card-gold-bar': { transform: 'scaleX(1)' },
            },
        '&:focus-visible': {
          outline: `2px solid ${alpha(GOLD, 0.7)}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: 'relative',
          width: 1,
          aspectRatio: '16 / 10',
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
            objectPosition: 'center center',
            display: 'block',
            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {logo ? (
          <Box
            component="img"
            src={logo}
            alt=""
            loading="lazy"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 36,
              height: 36,
              objectFit: 'cover',
              borderRadius: '4px',
              border: `1px solid ${alpha('#ffffff', 0.2)}`,
              boxShadow: `0 4px 12px ${alpha('#000000', 0.5)}`,
            }}
          />
        ) : null}

        {comingSoon ? (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              px: 0.85,
              py: 0.35,
              bgcolor: alpha('#000000', 0.72),
              border: `1px solid ${alpha(GOLD, 0.45)}`,
              borderRadius: '3px',
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 0.8 }}>
              SOON
            </Typography>
          </Box>
        ) : null}

        <Box
          className="game-card-gold-bar"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            bgcolor: GOLD,
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
            transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow: `0 0 8px ${alpha(GOLD, 0.45)}`,
          }}
        />
      </Box>

      {/* Content */}
      <Stack spacing={1.25} sx={{ p: { xs: 1.25, sm: 1.5 }, flex: 1 }}>
        <Stack spacing={0.35}>
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 14, sm: 15 },
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#ffffff',
            }}
          >
            {title}
          </Typography>
          {subTitle ? (
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 600,
                color: alpha(GOLD, 0.85),
                letterSpacing: 0.15,
                wordBreak: 'break-all',
              }}
            >
              {subTitle}
            </Typography>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            pt: 0.5,
            borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1,
              py: 0.65,
              borderRadius: '4px',
              bgcolor: alpha('#22c55e', liveCount > 0 ? 0.1 : 0.04),
              border: `1px solid ${alpha('#22c55e', liveCount > 0 ? 0.28 : 0.12)}`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                flexShrink: 0,
                animation: liveCount > 0 ? `${livePulse} 1.4s ease-in-out infinite` : 'none',
              }}
            />
            <Stack spacing={0} sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: alpha('#ffffff', 0.55),
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {liveLabel}
              </Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                {liveCount}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1,
              py: 0.65,
              borderRadius: '4px',
              bgcolor: alpha(GOLD, upcomingCount > 0 ? 0.08 : 0.04),
              border: `1px solid ${alpha(GOLD, upcomingCount > 0 ? 0.22 : 0.1)}`,
            }}
          >
            <Iconify icon="solar:calendar-bold" width={14} sx={{ color: GOLD, flexShrink: 0 }} />
            <Stack spacing={0} sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: alpha('#ffffff', 0.55),
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {upcomingLabel}
              </Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                {upcomingCount}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
