import { Stack, Button } from '@mui/material';

import { Iconify } from 'src/components/iconify/iconify';
import { userGhostButtonSx, userGoldButtonSx } from 'src/layouts/user/user-theme';

type HeroMeshButtonsProps = {
  joinLabel: string;
  downloadLabel: string;
  joinHref?: string;
  downloadHref?: string;
};

const baseButtonSx = {
  flex: 1,
  minWidth: 0,
  py: { xs: 1.15, sm: 1.35, md: 1.5 },
  px: { xs: 1.25, sm: 2, md: 2.5 },
  fontSize: { xs: 11, sm: 13, md: 15 },
  whiteSpace: 'nowrap' as const,
  boxShadow: 'none',
};

export function HeroMeshButtons({
  joinLabel,
  downloadLabel,
  joinHref = '/dashboard/play',
  downloadHref = '/battleasia.apk',
}: HeroMeshButtonsProps) {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
      sx={{ width: '100%', maxWidth: { xs: 360, sm: 520, md: 620 } }}
    >
      <Button
        component="a"
        href={joinHref}
        startIcon={
          <Iconify icon="game-icons:crossed-swords" width={22} sx={{ flexShrink: 0 }} />
        }
        sx={{
          ...userGoldButtonSx,
          ...baseButtonSx,
        }}
      >
        {joinLabel}
      </Button>

      <Button
        component="a"
        href={downloadHref}
        download="BattleAsia.apk"
        startIcon={
          <Iconify icon="solar:download-bold-duotone" width={22} sx={{ flexShrink: 0 }} />
        }
        sx={{
          ...userGhostButtonSx,
          ...baseButtonSx,
        }}
      >
        {downloadLabel}
      </Button>
    </Stack>
  );
}
