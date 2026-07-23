import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import {
  GLASS_CARD_RADIUS,
  GLASS_CARD_RADIUS_SM,
  getDefaultGlassTokens,
  getGlassShellSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { PLAY_IMAGE_PATHS } from '../play-constants';

// ----------------------------------------------------------------------

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
  const { title, subTitle, imageUrl, logo, comingSoon, disabled, onClick } = props;
  const isDisabled = disabled || comingSoon;
  const tokens = getDefaultGlassTokens();

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
      sx={getGlassShellSx(tokens, {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        minHeight: { xs: 'auto', sm: 148 },
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.72 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        p: 0,
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease',
        '&:hover': isDisabled
          ? undefined
          : {
              transform: 'translateY(-4px)',
              boxShadow: `0 20px 48px ${alpha('#000000', 0.75)}, 0 0 32px ${alpha(USER_COLORS.gold, 0.12)}`,
              '& .game-card-art': {
                transform: 'scale(1.06)',
              },
            },
      })}
      aria-disabled={isDisabled}
    >
      {/* Art panel — landscape strip */}
      <Box
        sx={{
          position: 'relative',
          flex: { xs: '0 0 auto', sm: '0 0 42%' },
          minHeight: { xs: 160, sm: 'auto' },
          overflow: 'hidden',
        }}
      >
        <Box
          className="game-card-art"
          component="img"
          src={imageUrl || PLAY_IMAGE_PATHS.pubgCard}
          alt={title}
          sx={{
            width: 1,
            height: 1,
            minHeight: { xs: 160, sm: 148 },
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
            transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 40%, ${alpha('#000000', 0.55)} 100%)`,
            display: { xs: 'none', sm: 'block' },
          }}
        />

        {logo ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 36,
              height: 36,
              borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
              bgcolor: alpha('#000000', 0.55),
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box component="img" src={logo} alt={title} sx={{ width: 24, height: 24, objectFit: 'contain' }} />
          </Box>
        ) : null}

        {comingSoon ? (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              px: 1,
              py: 0.35,
              borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
              bgcolor: alpha('#000000', 0.6),
              border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: USER_COLORS.gold, letterSpacing: 0.6 }}>
              SOON
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* Content panel */}
      <Stack
        spacing={1.25}
        sx={{
          flex: 1,
          p: { xs: 2, sm: 2.25 },
          justifyContent: 'center',
          minWidth: 0,
        }}
      >
        <Box>
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 20, sm: 22 },
              fontWeight: 800,
              letterSpacing: 0.4,
              color: '#ffffff',
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            {title}
          </Typography>
          {subTitle ? (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: alpha(USER_COLORS.gold, 0.85),
                textTransform: 'uppercase',
              }}
            >
              {subTitle}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontSize: 12, color: alpha('#ffffff', 0.5), lineHeight: 1.4 }}>
            {isDisabled ? 'Launching soon on Battle Asia' : 'Join tournaments and win rewards'}
          </Typography>

          <Box
            sx={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.65,
              borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
              bgcolor: isDisabled ? alpha('#ffffff', 0.06) : alpha(USER_COLORS.gold, 0.14),
              border: `1px solid ${isDisabled ? alpha('#ffffff', 0.1) : alpha(USER_COLORS.gold, 0.3)}`,
              color: isDisabled ? alpha('#ffffff', 0.45) : USER_COLORS.gold,
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              {isDisabled ? 'Soon' : 'Enter'}
            </Typography>
            {!isDisabled ? <Iconify icon="eva:arrow-ios-forward-fill" width={12} /> : null}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
