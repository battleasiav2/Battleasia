import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

const MAIN_APP_URL = (import.meta.env.VITE_MAIN_APP_URL as string | undefined) || 'http://localhost:8081';

type AuthHomeLinkProps = {
  label: string;
};

export function AuthHomeLink({ label }: AuthHomeLinkProps) {
  return (
    <Button
      component="a"
      href={MAIN_APP_URL}
      startIcon={<Iconify icon="solar:home-2-bold-duotone" width={18} sx={{ color: '#ffffff' }} />}
      sx={{
        borderRadius: 0,
        color: '#ffffff',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        bgcolor: alpha('#000000', 0.42),
        border: `1px solid ${alpha('#ffffff', 0.2)}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        px: 2,
        py: 0.75,
        '&:hover': {
          bgcolor: alpha('#000000', 0.58),
          borderColor: alpha('#ffffff', 0.32),
        },
      }}
    >
      {label}
    </Button>
  );
}
