import { Stack, Button } from '@mui/material';

import { Iconify } from 'src/components/iconify/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { userGhostButtonSx } from 'src/layouts/user/user-theme';
import { startAppDownload } from 'src/utils/app-download-url';
import { homeGoldCtaSx } from 'src/sections/home/home-tokens';

type HeroMeshButtonsProps = {
  playNowLabel?: string;
  playNowHref?: string;
  downloadLabel?: string;
  downloadHref?: string;
  downloadFileName?: string;
  showDownload?: boolean;
  showPlayNow?: boolean;
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
  playNowLabel,
  playNowHref = paths.user.play,
  downloadLabel,
  downloadHref = '/api/uploads/app/BattleAsia.apk',
  downloadFileName = 'BattleAsia.apk',
  showDownload = true,
  showPlayNow = true,
}: HeroMeshButtonsProps) {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 560, md: 560 },
        mx: 'auto',
      }}
    >
      {showPlayNow && playNowLabel ? (
        <Button
          component={RouterLink}
          href={playNowHref}
          variant="contained"
          disableElevation
          startIcon={<Iconify icon="solar:play-bold" width={18} sx={{ flexShrink: 0 }} />}
          sx={{
            ...homeGoldCtaSx,
            ...baseButtonSx,
            flex: { xs: 1.15, sm: 1.2 },
            borderRadius: 0,
            '&.MuiButton-root': { borderRadius: 0 },
          }}
        >
          {playNowLabel}
        </Button>
      ) : null}

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
