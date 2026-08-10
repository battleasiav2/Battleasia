import { alpha } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';

import { USER_COLORS, userGlassDialogPaperSx } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import type { MessagingProvider } from '../messaging-settings-utils';
import { resolveProviderUrl, openMessagingAction } from '../messaging-settings-utils';

// ----------------------------------------------------------------------

type MessagingProviderPickerProps = {
  open: boolean;
  onClose: () => void;
  providers: MessagingProvider[];
  username?: string;
  onSelectBuiltin?: () => void;
};

export function MessagingProviderPicker({
  open,
  onClose,
  providers,
  username,
  onSelectBuiltin,
}: MessagingProviderPickerProps) {
  const { t } = useTranslate();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: userGlassDialogPaperSx }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary }}>{t('messages.chooseProvider')}</Typography>
        <IconButton onClick={onClose} sx={{ color: USER_COLORS.textMuted }}>
          <Iconify icon="eva:close-fill" width={22} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          {providers.map((provider) => (
            <Stack
              key={provider.id}
              direction="row"
              spacing={1.25}
              alignItems="center"
              onClick={() => {
                if (provider.type === 'builtin') {
                  onSelectBuiltin?.();
                  onClose();
                  return;
                }
                openMessagingAction({
                  provider,
                  href: resolveProviderUrl(provider, username),
                  isBuiltin: false,
                });
                onClose();
              }}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                border: `1px solid var(--ba-fg-10)`,
                bgcolor: alpha('#000000', 0.25),
                '&:hover': { borderColor: alpha(USER_COLORS.gold, 0.35), bgcolor: alpha(USER_COLORS.gold, 0.06) },
              }}
            >
              <Iconify icon={provider.icon} width={22} sx={{ color: provider.color || USER_COLORS.gold }} />
              <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary }}>{provider.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
