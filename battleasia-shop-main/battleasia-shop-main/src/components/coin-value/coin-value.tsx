import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Theme, SxProps, TypographyProps } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export type CoinValueProps = {
  value?: number | null;
  size?: number;
  variant?: TypographyProps['variant'];
  sx?: SxProps<Theme>;
};

export function CoinValue({ value, size = 16, variant, sx }: CoinValueProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={sx}>
      <Box
        component="img"
        src={CONFIG.currencyIcon}
        alt="Coin"
        sx={{ width: size, height: size }}
      />
      <Typography variant={variant} component="span" sx={{ fontWeight: 600 }}>
        {fNumber(value ?? 0)}
      </Typography>
    </Stack>
  );
}

export default CoinValue;
