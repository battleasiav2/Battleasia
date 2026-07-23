import { Stack, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';

type HeroMeshButtonsProps = {
  joinLabel: string;
  downloadLabel: string;
  joinHref?: string;
  downloadHref?: string;
};

const baseButtonSx = {
  flex: 1,
  minWidth: 0,
  borderRadius: 0,
  py: { xs: 1.15, sm: 1.35, md: 1.5 },
  px: { xs: 1.25, sm: 2, md: 2.5 },
  fontSize: { xs: 11, sm: 13, md: 15 },
  fontWeight: 800,
  letterSpacing: { xs: 0.4, sm: 0.8 },
  textTransform: 'uppercase' as const,
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
          <Iconify
            icon="game-icons:crossed-swords"
            width={24}
            sx={{ color: '#111111', flexShrink: 0 }}
          />
        }
        sx={{
          ...baseButtonSx,
          color: '#111111',
          background: 'linear-gradient(180deg, #f59e0b 0%, #ea8c00 52%, #d97706 100%)',
          border: 'none',
          '&:hover': {
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 52%, #ea8c00 100%)',
            boxShadow: `0 8px 24px ${alpha('#f59e0b', 0.35)}`,
          },
        }}
      >
        {joinLabel}
      </Button>

      <Button
        component="a"
        href={downloadHref}
        download="BattleAsia.apk"
        startIcon={
          <Iconify
            icon="solar:download-bold-duotone"
            width={24}
            sx={{ color: '#111111', flexShrink: 0 }}
          />
        }
        sx={{
          ...baseButtonSx,
          color: '#111111',
          background: 'url(/assets/images/btn-bg.webp) no-repeat center center',
          backgroundSize: 'cover',
          border: 'none',
          '&:hover': {
            filter: 'brightness(1.08)',
            boxShadow: `0 8px 24px ${alpha('#000000', 0.35)}`,
          },
        }}
      >
        {downloadLabel}
      </Button>
    </Stack>
  );
}
