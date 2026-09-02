import { alpha } from '@mui/material/styles';
import { Box, Chip, Stack, InputBase, IconButton, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { USER_COLORS, getUserChipSx, goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

type DmComposerProps = {
  message: string;
  placeholder: string;
  sending: boolean;
  uploading: boolean;
  disabled?: boolean;
  pendingAttachments: string[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onChangeMessage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onAttach: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  onSendClick: () => void;
};

export function DmComposer({
  message,
  placeholder,
  sending,
  uploading,
  disabled = false,
  pendingAttachments,
  fileInputRef,
  onChangeMessage,
  onSendMessage,
  onAttach,
  onFileChange,
  onRemoveAttachment,
  onSendClick,
}: DmComposerProps) {
  const tokens = getDefaultGlassTokens();
  const canSend = (message.trim().length > 0 || pendingAttachments.length > 0) && !sending && !disabled;

  return (
    <Box sx={{ p: 2, borderTop: `1px solid ${USER_COLORS.border}`, bgcolor: alpha('#000000', 0.25) }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton onClick={onAttach} disabled={uploading || disabled} sx={{ color: USER_COLORS.gold }}>
          {uploading ? (
            <CircularProgress size={20} sx={{ color: USER_COLORS.gold }} />
          ) : (
            <Iconify icon="eva:attach-2-fill" />
          )}
        </IconButton>

        <Box sx={{ flex: 1, ...getGlassInnerSx(tokens, { p: 0, overflow: 'hidden' }) }}>
          <InputBase
            fullWidth
            value={message}
            onChange={onChangeMessage}
            onKeyUp={onSendMessage}
            placeholder={placeholder}
            disabled={sending || disabled}
            sx={{
              px: 2,
              py: 1.1,
              color: USER_COLORS.textPrimary,
              '& input::placeholder': { color: alpha('#ffffff', 0.4), opacity: 1 },
            }}
          />
        </Box>

        <IconButton
          onClick={onSendClick}
          disabled={!canSend}
          sx={{
            color: USER_COLORS.gold,
            bgcolor: goldAlpha(0.12),
            border: `1px solid ${goldAlpha(0.28)}`,
            '&:hover': { bgcolor: goldAlpha(0.2) },
          }}
        >
          {sending ? (
            <CircularProgress size={20} sx={{ color: USER_COLORS.gold }} />
          ) : (
            <Iconify icon="solar:plain-2-bold" />
          )}
        </IconButton>
      </Stack>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileChange} multiple />

      {pendingAttachments.length > 0 ? (
        <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {pendingAttachments.map((attachment, idx) => {
            const fileName = attachment.split('/').pop() || `Attachment ${idx + 1}`;
            return (
              <Chip
                key={idx}
                label={fileName}
                onDelete={() => onRemoveAttachment(idx)}
                size="small"
                sx={getUserChipSx('gold')}
              />
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
