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

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
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
  userPolishedDialogCloseButtonSx, goldAlpha } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';

// ----------------------------------------------------------------------

type StoryCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function StoryCreateDialog({ open, onClose, onCreated }: StoryCreateDialogProps) {
  const { t } = useTranslate();
  const { uploadFileApi, createStoryApi } = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setMediaFile(null);
    setCaption('');
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
    setMediaFile(file);
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!mediaFile || submitting) return;

    try {
      setSubmitting(true);
      const uploadResponse = await uploadFileApi(mediaFile, { folder: 'stories' });
      const uploadedUrl = uploadResponse?.data?.data?.url;
      if (!uploadResponse?.data?.status || !uploadedUrl) {
        throw new Error('Upload failed');
      }

      const mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      const response = await createStoryApi({
        mediaUrl: uploadedUrl,
        mediaType,
        caption: caption.trim(),
      });

      if (response?.data?.status) {
        reset();
        onCreated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create story:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: userPolishedDialogPaperSx }}
    >
      <Box sx={userPolishedDialogRailSx} />
      <DialogTitle sx={userPolishedDialogTitleSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={userPolishedDialogEyebrowSx}>Feed</Typography>
          <Typography sx={userPolishedDialogHeadingSx}>{t('feed.createStory')}</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={submitting} sx={userPolishedDialogCloseButtonSx}>
          <Iconify icon="eva:close-fill" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={userPolishedDialogContentSx}>
        <Stack spacing={2}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          />

          {previewUrl ? (
            <Box sx={{ position: 'relative' }}>
              {isVideo ? (
                <Box
                  component="video"
                  src={previewUrl}
                  controls
                  sx={{
                    width: '100%',
                    maxHeight: 360,
                    bgcolor: '#000000',
                    border: `1px solid ${goldAlpha(0.25)}`,
                  }}
                />
              ) : (
                <Image
                  alt="Story preview"
                  src={previewUrl}
                  sx={{
                    width: '100%',
                    maxHeight: 360,
                    '& img': { objectFit: 'contain', bgcolor: '#000000' },
                  }}
                />
              )}
              <IconButton
                size="small"
                onClick={reset}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: alpha('#000000', 0.65),
                  color: '#ffffff',
                }}
              >
                <Iconify icon="eva:close-fill" width={16} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                py: 6,
                px: 2,
                textAlign: 'center',
                cursor: 'pointer',
                border: `1px dashed ${goldAlpha(0.4)}`,
                bgcolor: alpha('#000000', 0.35),
                transition: 'border-color 0.2s, background-color 0.2s',
                '&:hover': {
                  borderColor: USER_COLORS.gold,
                  bgcolor: goldAlpha(0.06),
                },
              }}
            >
              <Iconify icon="solar:gallery-add-bold" width={36} sx={{ color: USER_COLORS.gold, mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: USER_COLORS.textPrimary }}>
                {t('feed.storyUploadPrompt')}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: USER_COLORS.textMuted }}>
                {t('feed.storyUploadHint')}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder={t('feed.storyCaptionPlaceholder')}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={userFieldSx}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <UserActionButton actionVariant="ghost" onClick={handleClose} disabled={submitting}>
              {t('common.cancel')}
            </UserActionButton>
            <UserActionButton
              actionVariant="gold"
              disabled={!mediaFile || submitting}
              onClick={handleSubmit}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {t('feed.shareStory')}
            </UserActionButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
