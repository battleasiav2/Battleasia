import { Box, Stack } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export type CoinValueProps = {
  value: number | string | null | undefined;
  size?: number;
  spacing?: number;
  sx?: object;
  iconSx?: object;
  textSx?: object;
};

export function CoinValue({ 
  value, 
  size = 16, 
  spacing = 0.5,
  sx,
  iconSx,
  textSx,
}: CoinValueProps) {
  const numericValue = value != null ? Number(value) : 0;
  const formattedValue = fNumber(numericValue);

  return (
    <Stack 
      direction="row" 
      alignItems="center" 
      spacing={spacing}
      component="span"
      sx={{ display: 'inline-flex', flexWrap: 'nowrap', minWidth: 0, ...sx }}
    >
      <Box
        component="img"
        src={CONFIG.currencyIcon}
        alt="Coin"
        sx={{ 
          width: size, 
          height: size, 
          flexShrink: 0,
          ...iconSx,
        }}
      />
      <Box
        component="span"
        sx={{
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
          ...textSx,
        }}
      >
        {formattedValue}
      </Box>
    </Stack>
  );
}

export default CoinValue;
