import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { toast } from 'react-hot-toast';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

import { AUTH_TEXT_MUTED, authSocialIconButtonSx } from './auth-form-styles';

const GOLD = '#f5c518';

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      sx={{ width: size, height: size, flexShrink: 0, display: 'block' }}
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

function SoonBadge() {
  return (
    <Typography
      component="span"
      sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        fontSize: 6,
        fontWeight: 800,
        letterSpacing: 0.6,
        lineHeight: 1,
        px: 0.6,
        py: 0.25,
        borderRadius: '3px',
        bgcolor: alpha(GOLD, 0.16),
        color: GOLD,
        textTransform: 'uppercase',
      }}
    >
      SOON
    </Typography>
  );
}

export function AuthSocialButtons() {
  const { t } = useTranslate();

  const comingSoon = () => {
    toast(t('auth.socialComingSoon'));
  };

  return (
    <Stack spacing={1} sx={{ width: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.25 }}>
        <Box sx={{ flex: 1, height: '1px', bgcolor: alpha('#fff', 0.08) }} />
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: AUTH_TEXT_MUTED, textTransform: 'uppercase' }}>
          {t('auth.orContinueWith')}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: alpha('#fff', 0.08) }} />
      </Stack>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 0.75,
          width: 1,
        }}
      >
        <Button
          variant="outlined"
          disableElevation
          onClick={comingSoon}
          aria-label={t('auth.continueWithGoogle')}
          sx={{ ...authSocialIconButtonSx, flex: '1 1 0', maxWidth: 120 }}
        >
          <GoogleMark />
          <SoonBadge />
        </Button>
        <Button
          variant="outlined"
          disableElevation
          onClick={comingSoon}
          aria-label={t('auth.continueWithDiscord')}
          sx={{ ...authSocialIconButtonSx, flex: '1 1 0', maxWidth: 120 }}
        >
          <Iconify icon="mingcute:discord-fill" width={18} sx={{ color: '#7289da' }} />
          <SoonBadge />
        </Button>
      </Box>
    </Stack>
  );
}
