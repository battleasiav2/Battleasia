import { Stack, Button } from '@mui/material';

import { Iconify } from 'src/components/iconify/iconify';
import { userGhostButtonSx, userSolidGoldButtonSx } from 'src/layouts/user/user-theme';
import { startAppDownload } from 'src/utils/app-download-url';

type HeroMeshButtonsProps = {
  joinLabel: string;
  downloadLabel?: string;
  joinHref?: string;
  downloadHref?: string;
  downloadFileName?: string;
  showDownload?: boolean;
};

const baseButtonSx = {
  flex: 1,
  minWidth: 0,
  minHeight: 44,
  height: 44,
  py: 0,
  px: { xs: 1.25, sm: 2, md: 2.5 },
  fontSize: { xs: 11, sm: 12, md: 13 },
  whiteSpace: 'nowrap' as const,
};

export function HeroMeshButtons({
  joinLabel,
  downloadLabel,
  joinHref = '/dashboard/play',
  downloadHref = '/api/uploads/app/BattleAsia.apk',
  downloadFileName = 'BattleAsia.apk',
  showDownload = true,
}: HeroMeshButtonsProps) {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 520, md: showDownload ? 640 : 320 },
        mx: 'auto',
      }}
    >
      <Button
        component="a"
        href={joinHref}
        variant="contained"
        disableElevation
        startIcon={
          <Iconify icon="game-icons:crossed-swords" width={18} sx={{ flexShrink: 0, color: 'inherit' }} />
        }
        sx={{
          ...userSolidGoldButtonSx,
          ...baseButtonSx,
          boxShadow: 'none',
          ...(showDownload ? {} : { flex: 'none', minWidth: { xs: 220, sm: 260 } }),
        }}
      >
        {joinLabel}
      </Button>

      {showDownload && downloadHref && downloadLabel ? (
        <Button
          component="a"
          href={downloadHref}
          download={downloadFileName}
          variant="outlined"
          disableElevation
          onClick={(event) => {
            event.preventDefault();
            startAppDownload(downloadHref, downloadFileName);
          }}
          startIcon={
            <Iconify icon="solar:download-bold-duotone" width={18} sx={{ flexShrink: 0 }} />
          }
          sx={{
            ...userGhostButtonSx,
            ...baseButtonSx,
          }}
        >
          {downloadLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
