import { Stack, Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';
import { userGhostButtonSx, userGoldButtonSx } from 'src/layouts/user/user-theme';

type AuthNavButtonsProps = {
  homeLabel: string;
  joinLabel: string;
};

const baseButtonSx = {
  flex: 1,
  minWidth: 0,
  py: 1.1,
  px: 1.5,
  fontSize: 11,
  whiteSpace: 'nowrap' as const,
  boxShadow: 'none',
};

export function AuthNavButtons({ homeLabel, joinLabel }: AuthNavButtonsProps) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ width: 1, mt: 3 }}>
      <Button
        component={RouterLink}
        href={paths.dashboard.root}
        startIcon={
          <Iconify icon="solar:home-2-bold-duotone" width={18} sx={{ flexShrink: 0 }} />
        }
        sx={{
          ...userGhostButtonSx,
          ...baseButtonSx,
        }}
      >
        {homeLabel}
      </Button>

      <Button
        component={RouterLink}
        href={paths.user.shop}
        startIcon={
          <Iconify icon="solar:shop-bold-duotone" width={18} sx={{ flexShrink: 0 }} />
        }
        sx={{
          ...userGoldButtonSx,
          ...baseButtonSx,
        }}
      >
        {joinLabel}
      </Button>
    </Stack>
  );
}
