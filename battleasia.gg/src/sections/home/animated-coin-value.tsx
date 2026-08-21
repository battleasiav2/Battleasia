import { Box, Stack } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { PulseCountUp } from './pulse-count-up';

type AnimatedCoinValueProps = {
  value: number;
  size?: number;
};

export function AnimatedCoinValue({ value, size = 24 }: AnimatedCoinValueProps) {
  const decimals = Math.abs(value - Math.round(value)) > 0.01 ? 1 : 0;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      component="span"
      sx={{ display: 'inline-flex', flexWrap: 'nowrap', minWidth: 0, maxWidth: '100%' }}
    >
      <Box
        component="img"
        src={CONFIG.currencyIcon}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        sx={{ width: size, height: size, flexShrink: 0 }}
      />
      <Box
        component="span"
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <PulseCountUp value={value} decimals={decimals} />
      </Box>
    </Stack>
  );
}
