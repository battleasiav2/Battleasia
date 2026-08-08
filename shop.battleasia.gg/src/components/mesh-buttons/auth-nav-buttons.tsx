import { Stack, Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';
import { userGhostButtonSx, userGoldButtonSx } from 'src/layouts/user/user-theme';

type AuthNavButtonsProps = {
  homeLabel: string;
  joinLabel: string;
  compact?: boolean;
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

export function AuthNavButtons({ homeLabel, joinLabel, compact }: AuthNavButtonsProps) {
  const buttonSx = compact ? { ...baseButtonSx, py: 0.9 } : baseButtonSx;

  return (
    <Stack direction="row" spacing={1.25} sx={{ width: 1, mt: compact ? 2 : 3 }}>
      <Button
        component={RouterLink}
        href={paths.dashboard.root}
        startIcon={
          <Iconify icon="solar:home-2-bold-duotone" width={18} sx={{ flexShrink: 0 }} />
        }
        sx={{
          ...userGhostButtonSx,
          ...buttonSx,
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
          ...buttonSx,
        }}
      >
        {joinLabel}
      </Button>
    </Stack>
  );
}
