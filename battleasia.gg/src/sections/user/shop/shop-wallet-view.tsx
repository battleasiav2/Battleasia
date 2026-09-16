import { useEffect } from 'react';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { getBacShopTransferUrl } from 'src/sections/user/shop/shop-constants';
import { USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

/**
 * BAC transfer moved to shop.battleasia.gg — hard-redirect off the main site.
 */
export function ShopWalletView() {
  useEffect(() => {
    const target = getBacShopTransferUrl();
    window.location.replace(target);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#060607',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={32} sx={{ color: USER_COLORS.gold }} />
        <Typography sx={{ color: 'rgba(244,244,241,0.7)', fontSize: 14, fontWeight: 600 }}>
          Opening BAC Transfer in Shop…
        </Typography>
      </Stack>
    </Box>
  );
}
