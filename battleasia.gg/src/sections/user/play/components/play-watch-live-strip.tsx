import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha, keyframes } from '@mui/material/styles';

import { WatchLiveButton } from 'src/components/watch-live-button';
import { USER_COLORS } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const LIVE_RED = '#ef4444';

const glowPulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.04); }
`;

type PlayWatchLiveStripProps = {
  label: string;
  onWatchLive?: () => void;
};

/** Compact live arena strip — Watch Live only, minimal height for game grid below. */
export function PlayWatchLiveStrip({ label, onWatchLive }: PlayWatchLiveStripProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 'auto',
        mx: { xs: -2, sm: -3, md: -4 },
        mt: { xs: -4.75, sm: -5, md: -6 },
        mb: { xs: 2, md: 2.5 },
        minHeight: { xs: 96, sm: 108 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: '#050505',
        borderTop: `1px solid ${alpha(GOLD, 0.14)}`,
        borderBottom: `1px solid ${alpha(GOLD, 0.14)}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 55% 120% at 50% 50%, ${alpha(LIVE_RED, 0.14)} 0%, transparent 62%),
            radial-gradient(ellipse 80% 80% at 50% 100%, ${alpha(GOLD, 0.1)} 0%, transparent 55%),
            linear-gradient(180deg, ${alpha('#000000', 0.35)} 0%, #050505 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: { xs: 180, sm: 240 },
          height: { xs: 180, sm: 240 },
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(LIVE_RED, 0.12)} 0%, transparent 70%)`,
          animation: `${glowPulse} 3s ease-in-out infinite`,
          pointerEvents: 'none',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          backgroundImage: `
            linear-gradient(90deg, ${alpha('#ffffff', 0.03)} 1px, transparent 1px),
            linear-gradient(180deg, ${alpha('#ffffff', 0.03)} 1px, transparent 1px)
          `,
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(180deg, transparent, #000 25%, #000 75%, transparent)',
          pointerEvents: 'none',
        }}
      />

      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          position: 'relative',
          zIndex: 1,
          px: 2,
          py: { xs: 2, sm: 2.25 },
          width: 1,
        }}
      >
        <WatchLiveButton
          onClick={onWatchLive}
          sx={{
            px: { xs: 3, sm: 3.75 },
            py: { xs: 1.05, sm: 1.15 },
            fontSize: { xs: 12.5, sm: 13.5 },
            fontWeight: 800,
            letterSpacing: 1.1,
            boxShadow: `
              0 0 0 1px ${alpha(LIVE_RED, 0.2)},
              0 10px 28px ${alpha('#000000', 0.55)},
              0 0 24px ${alpha(LIVE_RED, 0.18)}
            `,
            '&:hover': {
              boxShadow: `
                0 0 0 1px ${alpha(LIVE_RED, 0.35)},
                0 14px 34px ${alpha('#000000', 0.6)},
                0 0 32px ${alpha(LIVE_RED, 0.28)}
              `,
            },
          }}
        >
          {label}
        </WatchLiveButton>
      </Stack>
    </Box>
  );
}
