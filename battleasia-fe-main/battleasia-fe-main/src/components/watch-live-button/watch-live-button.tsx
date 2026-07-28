import type { ButtonProps } from '@mui/material/Button';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { userWatchLiveButtonSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const liveDotPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px ${alpha('#ef4444', 0.9)}; }
  50% { opacity: 0.55; transform: scale(1.35); box-shadow: 0 0 18px ${alpha('#ef4444', 0.95)}; }
`;

function WatchLiveStartIcon() {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#ef4444',
          flexShrink: 0,
          animation: `${liveDotPulse} 1.35s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
      <Iconify icon="solar:play-bold" width={18} />
    </Box>
  );
}

export type WatchLiveButtonProps = ButtonProps;

/** Red pulsing Watch Live CTA — use only for live stream links */
export function WatchLiveButton({ children, sx, ...other }: WatchLiveButtonProps) {
  return (
    <Button
      variant="outlined"
      startIcon={<WatchLiveStartIcon />}
      sx={[userWatchLiveButtonSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...other}
    >
      {children}
    </Button>
  );
}
