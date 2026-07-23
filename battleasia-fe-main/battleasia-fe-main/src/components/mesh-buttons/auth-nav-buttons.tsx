import { Stack, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify/iconify';

type AuthNavButtonsProps = {
  homeLabel: string;
  joinLabel: string;
};

const baseButtonSx = {
  flex: 1,
  minWidth: 0,
  borderRadius: 0,
  py: 1.1,
  px: 1.5,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase' as const,
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
          <Iconify icon="solar:home-2-bold-duotone" width={18} sx={{ color: '#ffffff', flexShrink: 0 }} />
        }
        sx={{
          ...baseButtonSx,
          color: '#ffffff',
          bgcolor: alpha('#000000', 0.42),
          border: `1px solid ${alpha('#ffffff', 0.22)}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          '&:hover': {
            bgcolor: alpha('#000000', 0.55),
            borderColor: alpha('#ffffff', 0.35),
          },
        }}
      >
        {homeLabel}
      </Button>

      <Button
        component={RouterLink}
        href={paths.user.play}
        startIcon={
          <Iconify icon="game-icons:crossed-swords" width={18} sx={{ color: '#111111', flexShrink: 0 }} />
        }
        sx={{
          ...baseButtonSx,
          color: '#111111',
          background: 'linear-gradient(180deg, #f59e0b 0%, #ea8c00 52%, #d97706 100%)',
          border: `1px solid ${alpha('#fbbf24', 0.9)}`,
          '&:hover': {
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 52%, #ea8c00 100%)',
            boxShadow: `0 6px 20px ${alpha('#f59e0b', 0.35)}`,
          },
        }}
      >
        {joinLabel}
      </Button>
    </Stack>
  );
}
