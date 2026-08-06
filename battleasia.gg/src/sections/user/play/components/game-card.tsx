import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type GameCardProps = {
  title: string;
  subTitle?: string;
  imageUrl?: string;
  logo?: string;
  comingSoon?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

/** Simple full-bleed game tile — title + package id over cinematic art. */
export function GameCard(props: GameCardProps) {
  const { title, subTitle, imageUrl, logo, comingSoon, disabled, onClick } = props;
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
        position: 'relative',
        width: 1,
        aspectRatio: '3 / 4.15',
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: '#0a0a0a',
        border: `1px solid ${alpha('#ffffff', 0.14)}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.78 : 1,
        boxShadow: `0 8px 24px ${alpha('#000000', 0.45)}`,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-8px)',
              borderColor: alpha(GOLD, 0.4),
              boxShadow: `0 20px 44px ${alpha('#000000', 0.65)}, 0 0 0 1px ${alpha(GOLD, 0.15)}`,
              '& .game-card-art': { transform: 'scale(1.06)' },
            },
        '&:focus-visible': {
          outline: `2px solid ${alpha(GOLD, 0.7)}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        className="game-card-art"
        component="img"
        src={imageUrl || PLAY_IMAGE_PATHS.pubgCard}
        alt={title}
        loading="lazy"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
          transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, ${alpha('#000000', 0.08)} 0%, transparent 28%),
            linear-gradient(180deg, transparent 42%, ${alpha('#000000', 0.55)} 72%, ${alpha('#000000', 0.88)} 100%)
          `,
          pointerEvents: 'none',
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
            top: 10,
            right: 10,
            width: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            objectFit: 'cover',
            borderRadius: '4px',
            border: `1px solid ${alpha('#ffffff', 0.22)}`,
            boxShadow: `0 4px 14px ${alpha('#000000', 0.55)}`,
            zIndex: 2,
          }}
        />
      ) : null}

      {comingSoon ? (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
            px: 0.85,
            py: 0.35,
            bgcolor: alpha('#000000', 0.65),
            border: `1px solid ${alpha(GOLD, 0.45)}`,
          }}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: 0.8 }}>
            SOON
          </Typography>
        </Box>
      ) : null}

      <Stack
        spacing={0.35}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          px: { xs: 1.25, sm: 1.5 },
          pb: { xs: 1.25, sm: 1.5 },
          pt: 4,
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 15, sm: 16, md: 17 },
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            textShadow: `0 2px 12px ${alpha('#000000', 0.85)}`,
          }}
        >
          {title}
        </Typography>
        {subTitle ? (
          <Typography
            sx={{
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 700,
              color: GOLD,
              letterSpacing: 0.2,
              textShadow: `0 1px 8px ${alpha('#000000', 0.8)}`,
              wordBreak: 'break-all',
            }}
          >
            {subTitle}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
