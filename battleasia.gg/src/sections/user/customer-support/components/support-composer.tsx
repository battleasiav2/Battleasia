import { Box, Chip, Stack, InputBase, ButtonBase, IconButton, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS, getUserChipSx, goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

type SupportComposerProps = {
  message: string;
  placeholder: string;
  sending: boolean;
  uploading: boolean;
  disabled: boolean;
  pendingAttachments: string[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onChangeMessage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onAttach: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  onSendClick: () => void;
};

export function SupportComposer({
  message,
  placeholder,
  sending,
  uploading,
  disabled,
  pendingAttachments,
  fileInputRef,
  onChangeMessage,
  onSendMessage,
  onAttach,
  onFileChange,
  onRemoveAttachment,
  onSendClick,
}: SupportComposerProps) {
  const canSend = Boolean(message.trim()) && !sending && !disabled;

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 1.75 },
        borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        bgcolor: alpha('#0a0c10', 0.95),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          onClick={onAttach}
          disabled={uploading || disabled}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            color: USER_COLORS.gold,
            '&:hover': { bgcolor: goldAlpha(0.1) },
          }}
        >
          {uploading ? (
            <CircularProgress size={18} sx={{ color: USER_COLORS.gold }} />
          ) : (
            <Iconify icon="solar:gallery-add-bold" width={20} />
          )}
        </IconButton>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha('#ffffff', 0.04),
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            borderRadius: '8px',
            px: 1.75,
            py: 0.5,
            '&:focus-within': {
              borderColor: goldAlpha(0.55),
            },
          }}
        >
          <InputBase
            fullWidth
            value={message}
            onChange={onChangeMessage}
            onKeyUp={onSendMessage}
            placeholder={placeholder}
            disabled={sending || disabled}
            sx={{
              fontSize: 13.5,
              color: '#ffffff',
              '& input::placeholder': { color: alpha('#ffffff', 0.45), opacity: 1 },
            }}
          />
        </Box>

        <ButtonBase
          onClick={onSendClick}
          disabled={!canSend}
          sx={{
            px: 2,
            height: 40,
            borderRadius: '8px',
            bgcolor: canSend ? USER_COLORS.gold : alpha('#ffffff', 0.08),
            color: canSend ? '#081401' : alpha('#ffffff', 0.4),
            fontWeight: 800,
            fontSize: 12,
            '&:hover': {
              bgcolor: canSend ? USER_COLORS.gold : alpha('#ffffff', 0.08),
              opacity: canSend ? 0.92 : 1,
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {sending ? (
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
            ) : (
              <>
                <Iconify icon="solar:plain-bold" width={15} />
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Send
                </Box>
              </>
            )}
          </Stack>
        </ButtonBase>
      </Stack>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileChange}
        multiple
        accept="image/*"
      />

      {pendingAttachments.length > 0 && (
        <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {pendingAttachments.map((attachment, idx) => {
            const fileName = attachment.split('/').pop() || `file_${idx + 1}`;
            return (
              <Chip
                key={idx}
                label={fileName}
                onDelete={() => onRemoveAttachment(idx)}
                size="small"
                sx={{
                  ...getUserChipSx('gold'),
                  borderRadius: '6px',
                  fontWeight: 700,
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}
