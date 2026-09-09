import { Box, Chip, Stack, InputBase, ButtonBase, IconButton, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS, getUserChipSx } from 'src/layouts/user';

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
  const theme = useTheme();
  const themeAccent = theme.palette.primary.main || USER_COLORS.gold;
  const accentContrast = theme.palette.primary.contrastText || '#081401';

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
        bgcolor: '#0a0c10',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Attach File Button */}
        <IconButton
          onClick={onAttach}
          disabled={uploading || disabled}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: alpha('#ffffff', 0.05),
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            color: themeAccent,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(themeAccent, 0.15),
              borderColor: themeAccent,
            },
          }}
        >
          {uploading ? (
            <CircularProgress size={18} sx={{ color: themeAccent }} />
          ) : (
            <Iconify icon="solar:gallery-add-bold" width={20} />
          )}
        </IconButton>

        {/* Tactical Input Box */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha('#ffffff', 0.04),
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            borderRadius: '8px',
            px: 2,
            py: 0.5,
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: themeAccent,
              bgcolor: alpha(themeAccent, 0.04),
              boxShadow: `0 0 16px -4px ${alpha(themeAccent, 0.35)}`,
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

        {/* Transmit Button */}
        <ButtonBase
          onClick={onSendClick}
          disabled={!message.trim() || sending || disabled}
          sx={{
            px: 2,
            height: 40,
            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
            bgcolor: !message.trim() || sending || disabled ? alpha('#ffffff', 0.08) : themeAccent,
            color: !message.trim() || sending || disabled ? alpha('#ffffff', 0.4) : accentContrast,
            fontWeight: 800,
            fontSize: 11.5,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            boxShadow: !message.trim() || sending || disabled ? 'none' : `0 0 16px ${alpha(themeAccent, 0.45)}`,
            '&:hover': {
              transform: !message.trim() || sending || disabled ? 'none' : 'translateY(-1px)',
              boxShadow: !message.trim() || sending || disabled ? 'none' : `0 0 24px ${alpha(themeAccent, 0.6)}`,
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
                  Transmit
                </Box>
              </>
            )}
          </Stack>
        </ButtonBase>
      </Stack>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileChange} multiple accept="image/*" />

      {/* Pending Attachments List */}
      {pendingAttachments.length > 0 && (
        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {pendingAttachments.map((attachment, idx) => {
            const fileName = attachment.split('/').pop() || `Evidence_${idx + 1}`;
            return (
              <Chip
                key={idx}
                label={fileName}
                onDelete={() => onRemoveAttachment(idx)}
                size="small"
                sx={{
                  ...getUserChipSx('gold'),
                  borderRadius: '4px',
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
