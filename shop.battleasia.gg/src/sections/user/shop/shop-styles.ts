import { alpha } from '@mui/material/styles';

import {
  userMutedTextSx,
  USER_COLORS,
  userPolishedDialogPaperSx,
  userPolishedDialogContentSx,
} from 'src/layouts/user';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

/**
 * Shared arena form fields — stacked labels (not floating on the border).
 * Use with InputLabelProps={SHOP_FIELD_LABEL_PROPS}.
 */
export const SHOP_FIELD_LABEL_PROPS = {
  shrink: true,
} as const;

export const SHOP_FIELD_SX = {
  '& .MuiInputLabel-root': {
    position: 'relative' as const,
    transform: 'none',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: alpha('#ffffff', 0.72),
    mb: 0.85,
    '&.Mui-focused': { color: GOLD },
    '&.MuiInputLabel-shrink': { transform: 'none' },
  },
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    bgcolor: alpha('#000000', 0.55),
    borderRadius: 0,
    fontSize: { xs: 15, md: 14 },
    minHeight: { xs: 52, md: 48 },
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    '& fieldset': {
      border: `1px solid ${alpha('#ffffff', 0.24)}`,
    },
    '&:hover fieldset': {
      borderColor: alpha('#ffffff', 0.4),
    },
    '&.Mui-focused': {
      bgcolor: alpha('#000000', 0.65),
      boxShadow: `0 0 0 3px ${alpha(GOLD, 0.18)}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: GOLD,
      borderWidth: '1px',
    },
    '& input::placeholder, & textarea::placeholder': {
      color: alpha('#ffffff', 0.4),
      opacity: 1,
    },
    '& .MuiSelect-select': {
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      py: 1.35,
    },
    '& .MuiSelect-icon': {
      color: alpha('#ffffff', 0.65),
    },
  },
  '& .MuiFormHelperText-root': {
    ml: 0,
    mt: 0.75,
    fontSize: 12,
    color: alpha('#ffffff', 0.5),
    '&.Mui-error': { color: USER_COLORS.error },
  },
};

/** Compact filter fields (sidebar) — same stacked look, slightly tighter */
export const SHOP_FILTER_FIELD_SX = {
  ...SHOP_FIELD_SX,
  '& .MuiOutlinedInput-root': {
    ...(SHOP_FIELD_SX as any)['& .MuiOutlinedInput-root'],
    minHeight: { xs: 46, md: 44 },
    fontSize: 13,
  },
};

export const SHOP_SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      mt: 0.75,
      maxHeight: 320,
      borderRadius: 0,
      bgcolor: alpha('#0a0a0a', 0.98),
      border: `1px solid ${alpha('#ffffff', 0.14)}`,
      backdropFilter: 'blur(14px)',
      boxShadow: `0 16px 40px ${alpha('#000000', 0.65)}`,
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.9),
        fontSize: 14,
        minHeight: 44,
        py: 1.1,
        px: 1.5,
        borderRadius: 0,
        gap: 1,
        '&:hover': { bgcolor: alpha(GOLD, 0.12) },
        '&.Mui-selected': {
          bgcolor: alpha(GOLD, 0.18),
          color: '#ffffff',
          '&:hover': { bgcolor: alpha(GOLD, 0.24) },
        },
        '&.Mui-disabled': {
          color: alpha('#ffffff', 0.35),
        },
      },
      '& .MuiList-root': {
        py: 0.5,
      },
    },
  },
};

export const SHOP_DIALOG_PAPER_SX = userPolishedDialogPaperSx;

export const SHOP_DIALOG_TITLE_SX = {
  color: USER_COLORS.textPrimary,
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.6,
  fontSize: { xs: 18, md: 22 },
  lineHeight: 1.15,
};

export const SHOP_DIALOG_CONTENT_SX = {
  ...userPolishedDialogContentSx,
  color: USER_COLORS.textBody,
  '& .MuiDivider-root': { borderColor: alpha('#ffffff', 0.1) },
};

export const SHOP_BODY_TEXT_SX = { color: USER_COLORS.textPrimary, fontWeight: 600 };
export const SHOP_LABEL_TEXT_SX = { ...userMutedTextSx, fontSize: 13 };

export const SHOP_MUTED_TEXT = {
  color: USER_COLORS.textMuted,
  fontSize: 13,
  lineHeight: 1.55,
};
