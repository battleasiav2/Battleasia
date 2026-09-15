import { alpha } from '@mui/material/styles';

import {
  userMutedTextSx,
  USER_COLORS,
  userPolishedDialogPaperSx,
  userPolishedDialogContentSx,
} from 'src/layouts/user';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

/** Shared glass panel — home / main-site shop language */
export const SHOP_PANEL_SX = {
  bgcolor: 'rgba(22,22,24,0.38)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 30px 80px -44px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
  transition: 'border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
  '&:hover': {
    bgcolor: 'rgba(30,30,33,0.55)',
    borderColor: 'rgba(255,255,255,0.14)',
  },
} as const;

export const SHOP_ICON_TILE_SX = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: goldAlpha(0.12),
  border: `1px solid ${goldAlpha(0.28)}`,
  color: GOLD,
  flexShrink: 0,
} as const;

/**
 * Shared arena form fields — stacked labels (not floating on the border).
 * Use with InputLabelProps={SHOP_FIELD_LABEL_PROPS}.
 * Label colors use !important so MUI FormLabel shrink/focused theme
 * (text.primary = black in light scheme) cannot win.
 */
export const SHOP_FIELD_LABEL_PROPS = {
  shrink: true,
  sx: {
    color: `${alpha('#ffffff', 0.72)} !important`,
    fontFamily: '"Barlow", "Public Sans Variable", sans-serif',
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    '&.Mui-focused': { color: `${GOLD} !important` },
    '&.MuiInputLabel-shrink': { color: `${alpha('#ffffff', 0.72)} !important` },
    '&.MuiInputLabel-shrink.Mui-focused': { color: `${GOLD} !important` },
    '&.Mui-error': { color: `${USER_COLORS.error} !important` },
  },
} as const;

const SHOP_FONT = '"Barlow", "Public Sans Variable", sans-serif';

export const SHOP_FIELD_SX = {
  fontFamily: SHOP_FONT,
  '& .MuiInputLabel-root': {
    position: 'relative' as const,
    transform: 'none',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    fontFamily: SHOP_FONT,
    color: `${alpha('#ffffff', 0.72)} !important`,
    mb: 0.85,
    '&.Mui-focused': { color: `${GOLD} !important` },
    '&.MuiInputLabel-shrink': {
      transform: 'none',
      color: `${alpha('#ffffff', 0.72)} !important`,
    },
    '&.MuiInputLabel-shrink.Mui-focused': { color: `${GOLD} !important` },
    '&.MuiFormLabel-filled': { color: `${alpha('#ffffff', 0.72)} !important` },
    '&.Mui-error': { color: `${USER_COLORS.error} !important` },
  },
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    fontFamily: SHOP_FONT,
    bgcolor: 'rgba(10,10,12,0.62)',
    borderRadius: '12px',
    fontSize: { xs: 15, md: 14 },
    minHeight: { xs: 48, md: 44 },
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    '& fieldset': {
      border: `1px solid ${alpha('#ffffff', 0.09)}`,
    },
    '&:hover fieldset': {
      borderColor: alpha('#ffffff', 0.14),
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(10,10,12,0.72)',
      boxShadow: `0 0 0 3px ${goldAlpha(0.14)}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: GOLD,
      borderWidth: '1px',
    },
    '& input::placeholder, & textarea::placeholder': {
      color: alpha('#ffffff', 0.42),
      opacity: 1,
    },
    '& .MuiSelect-select': {
      color: '#ffffff !important',
      fontFamily: SHOP_FONT,
      display: 'flex',
      alignItems: 'center',
      py: 1.25,
    },
    '& .MuiSelect-icon': {
      color: alpha('#ffffff', 0.55),
    },
  },
  '& .MuiFormHelperText-root': {
    ml: 0,
    mt: 0.75,
    fontSize: 12,
    fontFamily: SHOP_FONT,
    color: alpha('#ffffff', 0.5),
    '&.Mui-error': { color: USER_COLORS.error },
  },
};

/** Compact filter fields (sidebar) — same stacked look, slightly tighter */
export const SHOP_FILTER_FIELD_SX = {
  ...SHOP_FIELD_SX,
  '& .MuiOutlinedInput-root': {
    ...(SHOP_FIELD_SX as any)['& .MuiOutlinedInput-root'],
    minHeight: { xs: 44, md: 42 },
    fontSize: 13,
  },
};

export const SHOP_SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      mt: 0.75,
      maxHeight: 320,
      borderRadius: '12px',
      bgcolor: 'rgba(22,22,24,0.96)',
      border: `1px solid ${alpha('#ffffff', 0.1)}`,
      backdropFilter: 'blur(16px)',
      boxShadow: `0 16px 40px ${alpha('#000000', 0.55)}`,
      fontFamily: '"Barlow", "Public Sans Variable", sans-serif',
      '& .MuiMenuItem-root': {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: '"Barlow", "Public Sans Variable", sans-serif',
        minHeight: 44,
        py: 1.1,
        px: 1.5,
        borderRadius: '8px',
        mx: 0.5,
        gap: 1,
        '&:hover': { bgcolor: goldAlpha(0.12) },
        '&.Mui-selected': {
          bgcolor: goldAlpha(0.18),
          color: '#ffffff',
          '&:hover': { bgcolor: goldAlpha(0.24) },
        },
        '&.Mui-disabled': {
          color: alpha('#ffffff', 0.35),
        },
        '& .MuiTypography-root': {
          color: '#ffffff !important',
          fontFamily: '"Barlow", "Public Sans Variable", sans-serif',
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
