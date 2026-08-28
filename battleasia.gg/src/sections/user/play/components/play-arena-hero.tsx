import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { WatchLiveButton } from 'src/components/watch-live-button';

import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurns = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.08) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1) translate3d(0, 0, 0); }
`;

const emberRise = keyframes`
  0% { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
  20% { opacity: 0.7; }
  100% { transform: translate3d(var(--dx), -260px, 0) scale(1.1); opacity: 0; }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
`;

const EMBERS = [
  { left: '8%', size: 5, dx: '18px', delay: '0s', duration: '9s' },
  { left: '22%', size: 3, dx: '-14px', delay: '2.4s', duration: '11s' },
  { left: '38%', size: 6, dx: '22px', delay: '1.2s', duration: '10s' },
  { left: '56%', size: 4, dx: '-18px', delay: '3.6s', duration: '12s' },
  { left: '71%', size: 5, dx: '16px', delay: '0.8s', duration: '9.5s' },
  { left: '88%', size: 3, dx: '-12px', delay: '4.4s', duration: '10.5s' },
] as const;

// ----------------------------------------------------------------------

type ArenaStat = {
  label: string;
  value: number | string;
};

type PlayArenaHeroProps = {
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  liveLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
  stats: ArenaStat[];
  onPrimary?: () => void;
  onSecondary?: () => void;
};

/** Post-login arena hero — mirrors the home hero composition inside the user shell. */
export function PlayArenaHero({
  badge,
  title,
  description,
  imageUrl,
  liveLabel,
  primaryLabel,
  secondaryLabel,
  stats,
  onPrimary,
  onSecondary,
}: PlayArenaHeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 'auto',
        mx: { xs: -2, sm: -3, md: -4 },
        // Tighten the gap left by the shell's fixed-header padding without sliding under the header
        mt: { xs: -4.75, sm: -5, md: -6 },
        mb: { xs: 1.5, md: 3 },
        minHeight: { xs: 312, sm: 410, md: 500 },
        display: 'flex',
        alignItems: { xs: 'flex-end', md: 'center' },
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: '#000000',
        borderTop: `1px solid ${alpha(GOLD, 0.16)}`,
        borderBottom: `1px solid ${alpha(GOLD, 0.16)}`,
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt=""
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: 'center 30%',
          animation: `${kenBurns} 26s ease-in-out infinite`,
          willChange: 'transform',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: `
              linear-gradient(90deg, ${alpha('#000000', 0.9)} 0%, ${alpha('#000000', 0.62)} 45%, ${alpha('#000000', 0.35)} 100%),
              linear-gradient(180deg, ${alpha('#000000', 0.6)} 0%, transparent 32%, ${alpha('#000000', 0.92)} 100%),
              radial-gradient(ellipse 60% 45% at 20% 20%, ${alpha(GOLD, 0.12)} 0%, transparent 60%)
            `,
            md: `
              linear-gradient(180deg, ${alpha('#000000', 0.55)} 0%, ${alpha('#000000', 0.35)} 40%, ${alpha('#000000', 0.88)} 100%),
              radial-gradient(ellipse 70% 55% at 50% 35%, ${alpha(GOLD, 0.14)} 0%, transparent 65%),
              linear-gradient(90deg, ${alpha('#000000', 0.45)} 0%, transparent 28%, transparent 72%, ${alpha('#000000', 0.45)} 100%)
            `,
          },
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          '@media (prefers-reduced-motion: reduce)': { display: 'none' },
        }}
      >
        {EMBERS.map((ember, index) => (
          <Box
            key={`ember-${index}`}
            sx={{
              position: 'absolute',
              left: ember.left,
              bottom: '-4%',
              width: ember.size,
              height: ember.size,
              borderRadius: '50%',
              bgcolor: alpha(GOLD, 0.75),
              boxShadow: `0 0 10px ${alpha(GOLD, 0.6)}`,
              '--dx': ember.dx,
              animation: `${emberRise} ${ember.duration} ${ember.delay} infinite linear`,
            }}
          />
        ))}
      </Box>

      <Stack
        spacing={{ xs: 1, md: 2 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{
          position: 'relative',
          zIndex: 3,
          width: 1,
          mx: 'auto',
          px: { xs: 2.25, sm: 3.5, md: 6, lg: 8 },
          py: { xs: 2.25, md: 4.25 },
          maxWidth: { xs: 760, md: 920 },
          textAlign: { xs: 'left', md: 'center' },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: 'flex-start', md: 'center' }}
          spacing={1.25}
          flexWrap="wrap"
          useFlexGap
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: alpha(GOLD, 0.92),
            }}
          >
            {badge}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              px: 0.85,
              py: 0.3,
              border: `1px solid ${alpha(GOLD, 0.32)}`,
              bgcolor: alpha('#000000', 0.5),
              backdropFilter: 'blur(6px)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: USER_COLORS.success,
                boxShadow: `0 0 8px ${alpha(USER_COLORS.success, 0.85)}`,
                animation: `${livePulse} 1.8s ease-in-out infinite`,
              }}
            />
            <Typography sx={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.8, color: '#ffffff' }}>
              {liveLabel}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 22, sm: 36, md: 56 },
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: { md: 0.5 },
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: `0 4px 28px ${alpha('#000000', 0.9)}, 0 0 40px ${alpha(GOLD, 0.14)}`,
          }}
        >
          {title}
        </Typography>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 11, md: 15 },
            lineHeight: 1.45,
            color: alpha('#ffffff', 0.82),
            maxWidth: { xs: 520, md: 640 },
            mx: { md: 'auto' },
            textShadow: `0 1px 8px ${alpha('#000000', 0.8)}`,
          }}
        >
          {description}
        </Typography>

        <BattleGoldDivider variant="hero" sx={{ width: { xs: 100, md: 220 }, mx: { md: 'auto' } }} />

        {stats.length > 0 && (
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, minmax(0, 1fr))`,
              gap: 2,
              width: 1,
              maxWidth: 560,
              pt: 0.5,
            }}
          >
            {stats.map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  border: `1px solid ${alpha(GOLD, 0.22)}`,
                  bgcolor: alpha('#000000', 0.4),
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: GOLD,
                    lineHeight: 1.1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: alpha('#ffffff', 0.55),
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          justifyContent={{ xs: 'flex-start', md: 'center' }}
          sx={{ pt: 0.15 }}
        >
          <Button
            variant="outlined"
            disableElevation
            onClick={onSecondary}
            startIcon={<Iconify icon="solar:gamepad-bold-duotone" />}
            sx={{
              ...userGoldButtonSx,
              px: { xs: 2.1, md: 3.25 },
              py: { xs: 0.82, md: 1.1 },
              fontSize: { xs: 11.5, md: 13 },
            }}
          >
            {secondaryLabel}
          </Button>

          <WatchLiveButton
            onClick={onPrimary}
            sx={{
              px: { xs: 2.1, md: 3 },
              py: { xs: 0.82, md: 1.1 },
              fontSize: { xs: 11.5, md: 13 },
            }}
          >
            {primaryLabel}
          </WatchLiveButton>
        </Stack>
      </Stack>
    </Box>
  );
}
