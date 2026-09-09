import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HOME_ROW_LINE, HOME_TEXT_MUTED, HOME_TEXT_SECONDARY, homeBlurPanelSx } from 'src/sections/home/home-blur-panel';

export const AUTH_BG_IMAGE = '/auth-background.jpeg';

export const AUTH_CARD_BG = '#161618';
export const AUTH_INPUT_BG = '#0e0e0e';
export const AUTH_PLACEHOLDER = '#9CA3AF';
export const AUTH_TEXT_SECONDARY = HOME_TEXT_SECONDARY;
export const AUTH_TEXT_MUTED = HOME_TEXT_MUTED;

export const AUTH_RADIUS = {
  card: '0',
  control: '0',
  button: '0',
} as const;

export const authCardSx = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  borderRadius: '16px',
  bgcolor: alpha('#101114', 0.42),
  background: `linear-gradient(145deg, ${alpha('#18191e', 0.58)} 0%, ${alpha('#0a0b0d', 0.38)} 100%)`,
  backdropFilter: 'blur(32px) saturate(190%)',
  WebkitBackdropFilter: 'blur(32px) saturate(190%)',
  border: `1px solid ${alpha('#ffffff', 0.16)}`,
  borderTop: `1px solid ${alpha('#ffffff', 0.32)}`,
  boxShadow: `
    0 30px 70px rgba(0, 0, 0, 0.65),
    inset 0 1px 1px ${alpha('#ffffff', 0.22)},
    0 0 50px ${alpha('#f5c518', 0.1)}
  `,
  transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
  '&:hover': {
    boxShadow: `
      0 36px 80px rgba(0, 0, 0, 0.75),
      inset 0 1px 1.5px ${alpha('#ffffff', 0.3)},
      0 0 60px ${alpha('#f5c518', 0.15)}
    `,
    borderColor: alpha('#ffffff', 0.22),
  },
};

const authInputAutofillSx = {
  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active, & input:autofill, & .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:autofill':
    {
      WebkitTextFillColor: '#ffffff !important',
      caretColor: '#ffffff',
      borderRadius: 'inherit',
      WebkitBoxShadow: `0 0 0 1000px ${AUTH_INPUT_BG} inset !important`,
      boxShadow: `0 0 0 1000px ${AUTH_INPUT_BG} inset !important`,
      backgroundColor: `${AUTH_INPUT_BG} !important`,
      transition: 'background-color 99999s ease-out 0s',
    },
};

export const authFieldSlotProps = {
  inputLabel: {
    shrink: true,
    sx: {
      position: 'relative' as const,
      transform: 'none',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.2,
      color: AUTH_TEXT_SECONDARY,
      mb: 0.6,
      textTransform: 'none' as const,
      '&.MuiInputLabel-shrink': {
        transform: 'none',
        fontSize: 13,
        color: AUTH_TEXT_SECONDARY,
        '&.Mui-focused': { color: alpha('#f5c518', 0.95) },
      },
      '&.Mui-focused': { color: alpha('#f5c518', 0.95) },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: alpha('#060608', 0.45),
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '8px',
      fontSize: 14,
      minHeight: 44,
      boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      '& input': { fontSize: 14, paddingTop: '11.5px', paddingBottom: '11.5px' },
      '& input::placeholder': { color: AUTH_PLACEHOLDER, opacity: 0.85, fontSize: 14 },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': { border: `1px solid ${alpha('#ffffff', 0.14)}` },
      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.28) },
      '&.Mui-focused': {
        bgcolor: alpha('#060608', 0.65),
        boxShadow: `0 0 0 3px ${alpha('#f5c518', 0.22)}, inset 0 1px 0 ${alpha('#ffffff', 0.12)}`,
      },
      '&.Mui-focused fieldset': { borderColor: alpha('#f5c518', 0.55), borderWidth: '1px' },
      '& .MuiInputAdornment-root .iconify, & .MuiInputAdornment-root svg': {
        color: `${AUTH_PLACEHOLDER} !important`,
      },
      '& .MuiIconButton-root': { color: AUTH_PLACEHOLDER },
      ...authInputAutofillSx,
    },
  },
};

export const authFieldSlotPropsCompact = authFieldSlotProps;

export const authPhoneInputSx = {
  '--popover-button-width': '108px',
  '--popover-button-height': '28px',
  '--popover-button-mr': '10px',
  [`& .${inputBaseClasses.input}`]: {
    pl: 'calc(var(--popover-button-width) + var(--popover-button-mr) + 2px) !important',
    fontSize: 14,
  },
};

export const authPhoneCountrySx = {
  mt: '0 !important',
  top: 'auto !important',
  bottom: '10px !important',
  left: '10px !important',
  height: '32px !important',
  alignItems: 'center',
  borderRadius: AUTH_RADIUS.control,
  bgcolor: alpha('#ffffff', 0.06),
  px: 0.5,
};

export const authSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.5,
      bgcolor: alpha('#0a0a0a', 0.96),
      border: `1px solid ${alpha('#ffffff', 0.14)}`,
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.88),
        fontSize: 14,
        '&:hover': { bgcolor: alpha('#f59e0b', 0.12) },
      },
    },
  },
};

export const authSelectSx = {
  mt: 0,
  color: '#ffffff',
  bgcolor: alpha(AUTH_INPUT_BG, 0.65),
  borderRadius: AUTH_RADIUS.control,
  fontSize: 14,
  minHeight: 42,
  boxShadow: 'none',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& fieldset': { border: `1px solid ${alpha('#ffffff', 0.12)}` },
  '&:hover fieldset': { borderColor: alpha('#ffffff', 0.22) },
  '&.Mui-focused': {
    bgcolor: alpha(AUTH_INPUT_BG, 0.8),
    boxShadow: `0 0 0 2px ${alpha('#f5c518', 0.28)}`,
  },
  '&.Mui-focused fieldset': { borderColor: alpha('#f5c518', 0.5) },
  '& .MuiSelect-select': { py: 1.15, fontSize: 14 },
};

export const authSubmitButtonSx = {
  borderRadius: 0,
  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
  py: 1.25,
  minHeight: 46,
  height: 'auto',
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#080a0e !important',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#f5c518',
  border: `1px solid ${alpha('#d4a017', 0.85)}`,
  boxShadow: `0 0 18px ${alpha('#f5c518', 0.38)}`,
  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-140%',
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transform: 'skewX(-20deg)',
    transition: 'left 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&:hover::before': {
    left: '160%',
  },
  '&.MuiButton-contained.MuiButton-containedInherit': {
    color: '#080a0e !important',
    backgroundColor: '#f5c518',
  },
  '@media (hover: hover)': {
    '&:hover': {
      backgroundColor: '#fbbf24',
      borderColor: alpha('#ca8a04', 0.95),
      boxShadow: `0 0 28px ${alpha('#f5c518', 0.65)}`,
      transform: 'translateY(-2px)',
      filter: 'brightness(1.08)',
    },
    '&.MuiButton-contained.MuiButton-containedInherit:hover': {
      color: '#080a0e !important',
      backgroundColor: '#fbbf24',
    },
  },
  '&:active, &.Mui-focusVisible': {
    backgroundColor: '#d97706',
    borderColor: alpha('#b45309', 0.9),
    boxShadow: 'none',
    transform: 'translateY(0) scale(0.98)',
  },
  '&.Mui-disabled': {
    backgroundColor: alpha('#f5c518', 0.28),
    color: alpha('#111111', 0.45),
    boxShadow: 'none',
    transform: 'none',
  },
};

export const authSecondaryButtonSx = {
  borderRadius: 0,
  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
  py: 1.25,
  minHeight: 46,
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#ffffff',
  bgcolor: 'rgba(17, 24, 39, 0.75)',
  border: `1px solid ${alpha('#ffffff', 0.18)}`,
  position: 'relative',
  overflow: 'hidden',
  flexShrink: 0,
  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-140%',
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
    transform: 'skewX(-20deg)',
    transition: 'left 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&:hover::before': {
    left: '160%',
  },
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: alpha('#f5c518', 0.12),
      borderColor: alpha('#f5c518', 0.55),
      color: '#f5c518',
      boxShadow: `0 0 18px ${alpha('#f5c518', 0.25)}`,
      transform: 'translateY(-2px)',
    },
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
  },
};

export const authLinkSx = {
  color: '#f5c518',
  fontWeight: 700,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  '&:hover': { color: '#ffe066' },
};

export const authBackLinkSx = {
  ...authLinkSx,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  fontSize: 13,
  fontWeight: 600,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  p: 0,
  mb: 0.5,
  textDecoration: 'none',
  '&:hover': { color: '#ffe066', textDecoration: 'underline' },
};

export const authCardFooterSx = {
  mt: 2,
  pt: 2,
  borderTop: HOME_ROW_LINE,
};

/** Icon-only social login tiles — compact, matches auth dark inputs */
export const authSocialIconButtonSx = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  height: 40,
  minWidth: 0,
  py: 0,
  px: 0,
  borderRadius: AUTH_RADIUS.control,
  bgcolor: alpha(AUTH_INPUT_BG, 0.72),
  backgroundColor: alpha(AUTH_INPUT_BG, 0.72),
  backgroundImage: 'none',
  border: `1px solid ${alpha('#ffffff', 0.12)}`,
  boxShadow: 'none',
  color: 'inherit',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  '&.MuiButton-root:hover': { boxShadow: 'none' },
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: alpha(AUTH_INPUT_BG, 0.88),
      backgroundColor: alpha(AUTH_INPUT_BG, 0.88),
      borderColor: alpha('#f5c518', 0.32),
      boxShadow: 'none',
      transform: 'none',
      filter: 'none',
    },
  },
  '&:active, &.Mui-focusVisible': {
    bgcolor: alpha(AUTH_INPUT_BG, 0.92),
    backgroundColor: alpha(AUTH_INPUT_BG, 0.92),
    borderColor: alpha('#f5c518', 0.4),
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
};

/** @deprecated Use authSocialIconButtonSx */
export const authSocialButtonSx = authSocialIconButtonSx;

export const authAlertSx = {
  borderRadius: AUTH_RADIUS.control,
  bgcolor: alpha('#000000', 0.45),
  border: `1px solid ${alpha('#ffffff', 0.1)}`,
  color: '#ffffff',
};

export const authFooterTextSx = {
  textAlign: 'center' as const,
  fontSize: 13,
  color: AUTH_TEXT_MUTED,
  lineHeight: 1.55,
};
