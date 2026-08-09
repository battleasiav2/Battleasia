import { useRef, useState } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Dialog,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { CONFIG } from 'src/global-config';
import {
  UserActionButton,
  USER_COLORS,
  userFieldSx,
  userPolishedDialogPaperSx,
  userPolishedDialogRailSx,
  userPolishedDialogTitleSx,
  userPolishedDialogEyebrowSx,
  userPolishedDialogHeadingSx,
  userPolishedDialogContentSx,
  userPolishedDialogCloseButtonSx,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ReelCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function ReelCreateDialog({ open, onClose, onCreated }: ReelCreateDialogProps) {
  const { t } = useTranslate();
  const { uploadFileApi, createReelApi } = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setVideoFile(null);
    setCaption('');
    setMusicTitle('');
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setVideoFile(file);
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!videoFile || submitting) return;

    try {
      setSubmitting(true);
      const uploadResponse = await uploadFileApi(videoFile, { folder: 'reels' });
      const uploadedUrl = uploadResponse?.data?.data?.url;
      if (!uploadResponse?.data?.status || !uploadedUrl) {
        throw new Error('Upload failed');
      }

      const fullUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${CONFIG.serverUrl || ''}${uploadedUrl}`;
      const response = await createReelApi({ videoUrl: fullUrl, caption: caption.trim(), musicTitle: musicTitle.trim() });
      if (!response?.data?.status) {
        throw new Error('Create reel failed');
      }

      reset();
      onCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create reel:', error);
      toast.error(t('reels.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: userPolishedDialogPaperSx }}>
      <Box sx={userPolishedDialogRailSx} />
      <DialogTitle sx={userPolishedDialogTitleSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={userPolishedDialogEyebrowSx}>Reels</Typography>
          <Typography sx={userPolishedDialogHeadingSx}>{t('reels.createReel')}</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={userPolishedDialogCloseButtonSx}>
          <Iconify icon="eva:close-fill" width={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={userPolishedDialogContentSx}>
        <Stack spacing={2}>
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${alpha(USER_COLORS.gold, 0.35)}`,
              bgcolor: alpha('#000000', 0.35),
              cursor: 'pointer',
            }}
          >
            {previewUrl ? (
              <Box component="video" src={previewUrl} controls sx={{ width: '100%', maxHeight: 320 }} />
            ) : (
              <Stack alignItems="center" spacing={1}>
                <Iconify icon="solar:videocamera-add-bold-duotone" width={42} sx={{ color: USER_COLORS.gold }} />
                <Typography sx={{ color: USER_COLORS.textMuted }}>{t('reels.uploadVideo')}</Typography>
              </Stack>
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('reels.captionPlaceholder')}
            sx={userFieldSx}
          />
          <TextField
            fullWidth
            value={musicTitle}
            onChange={(e) => setMusicTitle(e.target.value)}
            placeholder={t('reels.musicPlaceholder')}
            sx={userFieldSx}
          />

          <UserActionButton actionVariant="gold" fullWidth disabled={!videoFile || submitting} onClick={() => void handleSubmit()}>
            {submitting ? <CircularProgress size={20} sx={{ color: '#000' }} /> : t('reels.shareReel')}
          </UserActionButton>
        </Stack>
      </DialogContent>
      <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
    </Dialog>
  );
}
