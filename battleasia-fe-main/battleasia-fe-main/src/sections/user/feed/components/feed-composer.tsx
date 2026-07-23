import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Avatar, TextField, CircularProgress } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import { UserGlassCard, UserActionButton, USER_COLORS } from 'src/layouts/user';
import { getImageUrl } from 'src/utils/get-image-url';

// ----------------------------------------------------------------------

type FeedComposerProps = {
  onPosted?: () => void;
};

export function FeedComposer({ onPosted }: FeedComposerProps) {
  const { t } = useTranslate();
  const { createFeedPostApi } = useApi();
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const description = content.trim();
    if (!description || submitting) return;

    try {
      setSubmitting(true);
      const response = await createFeedPostApi({ description });
      if (response?.data?.status) {
        setContent('');
        onPosted?.();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserGlassCard>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          src={getImageUrl(user?.avatar)}
          alt={user?.username || 'User'}
          sx={{ width: 44, height: 44, border: `1px solid ${USER_COLORS.border}` }}
        />
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder={t('feed.composePlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha('#000000', 0.35),
                color: USER_COLORS.textPrimary,
                '& fieldset': { borderColor: USER_COLORS.border },
                '&:hover fieldset': { borderColor: alpha(USER_COLORS.gold, 0.4) },
                '&.Mui-focused fieldset': { borderColor: USER_COLORS.gold },
              },
            }}
          />
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <UserActionButton
              actionVariant="gold"
              disabled={!content.trim() || submitting}
              onClick={handleSubmit}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {t('feed.postAction')}
            </UserActionButton>
          </Stack>
        </Box>
      </Stack>
    </UserGlassCard>
  );
}
