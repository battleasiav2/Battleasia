import { Box, Stack, Typography } from '@mui/material';

import { livePulseDotKeyframes } from './home-tokens';

type LivePulseDotProps = {
  label?: string;
  color?: 'green' | 'gold';
  size?: number;
};

const COLOR_MAP = {
  green: '#22c55e',
  gold: '#f5c518',
} as const;

export function LivePulseDot({ label, color = 'green', size = 7 }: LivePulseDotProps) {
  const dotColor = COLOR_MAP[color];

  return (
    <Stack direction="row" alignItems="center" spacing={0.65} sx={{ flexShrink: 0 }}>
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: dotColor,
          animation: `${livePulseDotKeyframes} 1.6s ease-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
      {label ? (
        <Typography
          sx={{
            fontSize: { xs: '0.58rem', sm: '0.64rem' },
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: dotColor,
            lineHeight: 1,
          }}
        >
          {label}
        </Typography>
      ) : null}
    </Stack>
  );
}
