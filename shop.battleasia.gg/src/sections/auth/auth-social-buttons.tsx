import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

const GOLD = '#f5c518';

function GoogleMark() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: 16, height: 16, flexShrink: 0 }}
      aria-hidden
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3 5.5 15.1l-3.8 3C4 21.1 7.7 23 12 23c3 0 5.5-1 7.3-2.8l-3.1-2.4c-.9.6-2 1-3.2 1-2.5 0-4.6-1.7-5.4-4z"
      />
      <path
        fill="#FBBC05"
        d="M2.8 6.9A10.9 10.9 0 0 0 1 12c0 1.8.4 3.5 1.2 5l4.4-3.4A6.5 6.5 0 0 1 6.3 12c0-.7.1-1.4.3-2L2.8 6.9z"
      />
      <path
        fill="#4285F4"
        d="M12 5.1c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 1.8 15 1 12 1 7.7 1 4 2.9 2.2 6.9l4.4 3.4C7.4 6.8 9.5 5.1 12 5.1z"
      />
    </Box>
  );
}

const socialBtnSx = {
  py: 0.85,
  minHeight: 40,
  borderRadius: 0,
  textTransform: 'none' as const,
  fontSize: 12.5,
  fontWeight: 700,
  color: alpha('#fff', 0.92),
  bgcolor: alpha('#000', 0.42),
  border: `1px solid ${alpha('#fff', 0.14)}`,
  boxShadow: 'none',
  transition: 'border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease',
  '&:hover': {
    bgcolor: alpha('#000', 0.55),
    borderColor: alpha(GOLD, 0.45),
    boxShadow: `0 0 14px ${alpha(GOLD, 0.12)}`,
  },
  '&:active': {
    transform: 'scale(0.985)',
  },
};

export function AuthSocialButtons() {
  const { t } = useTranslate();

  const comingSoon = () => {
    toast(t('auth.socialComingSoon'));
  };

  return (
    <Stack spacing={1} sx={{ mt: 0.25 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.25 }}>
        <Box sx={{ flex: 1, height: '1px', bgcolor: alpha('#fff', 0.1) }} />
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: alpha('#fff', 0.42), textTransform: 'uppercase' }}>
          {t('auth.orContinueWith')}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: alpha('#fff', 0.1) }} />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button fullWidth variant="outlined" disableElevation onClick={comingSoon} startIcon={<GoogleMark />} sx={socialBtnSx}>
          {t('auth.continueWithGoogle')}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          disableElevation
          onClick={comingSoon}
          startIcon={<Iconify icon="mingcute:discord-fill" width={16} />}
          sx={socialBtnSx}
        >
          {t('auth.continueWithDiscord')}
        </Button>
      </Stack>
    </Stack>
  );
}
