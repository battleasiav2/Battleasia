import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS, getGameGenre, getGamePlatforms } from '../play-constants';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const livePulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${alpha('#22c55e', 0.55)}; }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px ${alpha('#22c55e', 0)}; }
`;

const goldScan = keyframes`
  0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
  35% { opacity: 0.55; }
  100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
`;

type GameCardProps = {
  title: string;
  subTitle?: string;
  imageUrl?: string;
  logo?: string;
  comingSoon?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function GameCard(props: GameCardProps) {
  const { title, subTitle, imageUrl, comingSoon, disabled, onClick } = props;
  const isDisabled = disabled || comingSoon;
  const genre = getGameGenre(subTitle);
  const platforms = getGamePlatforms(subTitle);

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
        display: 'flex',
        flexDirection: 'column',
        width: 1,
        aspectRatio: '3 / 4.4',
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: '#161618',
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        isolation: 'isolate',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.85 : 1,
        boxShadow: `0 10px 28px ${alpha('#000000', 0.5)}`,
        transition:
          'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.35s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-10px)',
              borderColor: alpha(GOLD, 0.45),
              boxShadow: `
                0 22px 48px ${alpha('#000000', 0.7)},
                0 0 0 1px ${alpha(GOLD, 0.2)},
                0 0 32px ${alpha(GOLD, 0.12)}
              `,
              '& .game-card-art': { transform: 'scale(1.08)' },
              '& .game-card-scan': { opacity: 1 },
              '& .game-card-bar': { transform: 'scaleX(1)' },
              '& .game-card-title': { color: GOLD },
              '& .game-card-play': { opacity: 1, transform: 'translate(-50%, 0)' },
            },
        '&:focus-visible': {
          outline: `2px solid ${alpha(GOLD, 0.7)}`,
          outlineOffset: 2,
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
          src={imageUrl || PLAY_IMAGE_PATHS.pubgCard}
          alt={title}
          loading="lazy"
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
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
              linear-gradient(180deg, ${alpha('#000000', 0.15)} 0%, transparent 30%),
              linear-gradient(180deg, transparent 45%, ${alpha('#161618', 0.75)} 82%, #161618 100%)
            `,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {!isDisabled ? (
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
              Enter Arena
            </Typography>
          </Stack>
        ) : null}

        {!isDisabled ? (
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
              LIVE
            </Typography>
          </Box>
        ) : (
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
              SOON
            </Typography>
          </Box>
        )}
      </Box>

      {/* Gold accent line */}
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

      {/* Clean info panel */}
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
            BATTLE ASIA
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
            {title}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          {platforms.map((icon) => (
            <Iconify key={icon} icon={icon} width={15} sx={{ color: alpha('#ffffff', 0.45) }} />
          ))}
          <Typography
            sx={{
              ml: 'auto !important',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.9,
              color: alpha('#ffffff', 0.45),
              textTransform: 'uppercase',
            }}
          >
            {genre}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
