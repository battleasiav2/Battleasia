import { alpha } from '@mui/material/styles';

import { userMutedTextSx, USER_COLORS, userGlassDialogPaperSx } from 'src/layouts/user';

export const SHOP_FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    color: USER_COLORS.textPrimary,
    bgcolor: alpha('#000000', 0.5),
    borderRadius: '2px',
    fontSize: 14,
    '& fieldset': { borderColor: alpha('#ffffff', 0.22) },
    '&:hover fieldset': { borderColor: alpha('#ffffff', 0.38) },
    '&.Mui-focused fieldset': { borderColor: USER_COLORS.gold },
  },
  '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
  '& .MuiInputLabel-root.Mui-focused': { color: USER_COLORS.gold },
  '& .MuiFormHelperText-root': { color: alpha('#ffffff', 0.5) },
};

export const SHOP_SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      mt: 0.5,
      bgcolor: alpha('#0a0a0a', 0.96),
      border: `1px solid ${alpha('#ffffff', 0.14)}`,
      backdropFilter: 'blur(12px)',
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.88),
        '&:hover': { bgcolor: alpha('#f59e0b', 0.12) },
        '&.Mui-selected': {
          bgcolor: alpha('#f59e0b', 0.18),
          '&:hover': { bgcolor: alpha('#f59e0b', 0.22) },
        },
      },
    },
  },
};

export const SHOP_DIALOG_PAPER_SX = userGlassDialogPaperSx;

export const SHOP_DIALOG_TITLE_SX = {
  color: USER_COLORS.textPrimary,
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.6,
  fontSize: 18,
};

export const SHOP_DIALOG_CONTENT_SX = {
  color: USER_COLORS.textBody,
  borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
  borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
  '& .MuiDivider-root': { borderColor: alpha('#ffffff', 0.1) },
};

export const SHOP_BODY_TEXT_SX = { color: USER_COLORS.textPrimary, fontWeight: 600 };
export const SHOP_LABEL_TEXT_SX = { ...userMutedTextSx, fontSize: 13 };

export const SHOP_MUTED_TEXT = {
  color: USER_COLORS.textMuted,
  fontSize: 13,
  lineHeight: 1.55,
};
