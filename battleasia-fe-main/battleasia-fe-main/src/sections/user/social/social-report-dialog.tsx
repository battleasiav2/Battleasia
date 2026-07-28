import { useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { UserActionButton, USER_COLORS, userFieldSx, userGlassDialogPaperSx } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const REPORT_REASONS = ['spam', 'harassment', 'inappropriate', 'fake', 'other'] as const;

type SocialReportDialogProps = {
  open: boolean;
  onClose: () => void;
  targetType: 'user' | 'feed' | 'reel';
  targetId: string;
};

export function SocialReportDialog({ open, onClose, targetType, targetId }: SocialReportDialogProps) {
  const { t } = useTranslate();
  const { submitSocialReportApi } = useApi();
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!targetId || submitting) return;
    try {
      setSubmitting(true);
      const response = await submitSocialReportApi({ targetType, targetId, reason, details: details.trim() });
      if (response?.data?.status) {
        toast.success(t('report.submitted'));
        setDetails('');
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error(t('report.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: userGlassDialogPaperSx }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 800, color: USER_COLORS.textPrimary }}>{t('report.title')}</Typography>
        <IconButton onClick={onClose} sx={{ color: USER_COLORS.textMuted }}>
          <Iconify icon="eva:close-fill" width={22} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField select fullWidth value={reason} onChange={(e) => setReason(e.target.value as typeof reason)} sx={userFieldSx}>
            {REPORT_REASONS.map((item) => (
              <MenuItem key={item} value={item}>
                {t(`report.reasons.${item}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t('report.detailsPlaceholder')}
            sx={userFieldSx}
          />
          <UserActionButton actionVariant="gold" fullWidth disabled={submitting} onClick={() => void handleSubmit()}>
            {t('report.submit')}
          </UserActionButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
