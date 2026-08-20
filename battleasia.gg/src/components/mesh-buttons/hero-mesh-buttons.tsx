import { Stack, Button } from '@mui/material';

import { Iconify } from 'src/components/iconify/iconify';
import { userGhostButtonSx, userSolidGoldButtonSx } from 'src/layouts/user/user-theme';
import { startAppDownload } from 'src/utils/app-download-url';

type HeroMeshButtonsProps = {
  downloadLabel?: string;
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
  downloadLabel,
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
        // Only a single CTA remains (Join Tournament removed), so keep width comfortable.
        maxWidth: { xs: '100%', sm: 520, md: 520 },
        mx: 'auto',
      }}
    >
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
