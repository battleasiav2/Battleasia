import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HOME_ROW_LINE, HOME_TEXT_MUTED, HOME_TEXT_SECONDARY, homeBlurPanelSx } from 'src/sections/home/home-blur-panel';
import { HOME_GAME_ARTS } from 'src/sections/home/home-game-arts';
import { goldAlpha } from 'src/theme/accent-presets';

export const AUTH_BG_IMAGE = HOME_GAME_ARTS[0];

/** baccoin.shop-style white inputs on auth forms */
export const baccoinFieldSlotProps = {
  inputLabel: {
    sx: {
      color: 'grey.600',
      '&.Mui-focused': { color: 'grey.600 !important' },
      '&.MuiInputLabel-shrink': {
        bgcolor: 'white',
        px: 0.75,
      },
    },
  },
  input: {
    sx: {
      color: 'common.black',
      bgcolor: 'white',
      borderRadius: 1,
      fontSize: 14,
      '& fieldset': {
        border: '1px solid transparent',
      },
      '& input::placeholder': {
        color: 'grey.500',
        opacity: 1,
      },
    },
  },
};

export const baccoinPasswordFieldSlotProps = {
  inputLabel: {
    shrink: true,
    sx: {
      color: 'grey.600',
      bgcolor: 'white',
      px: 0.75,
      '&.Mui-focused': { color: 'grey.600 !important' },
    },
  },
  input: {
    sx: {
      color: 'common.black',
      bgcolor: 'white',
      borderRadius: 1,
      fontSize: 14,
      '& fieldset': {
        border: '1px solid transparent',
      },
      '& input::placeholder': {
        color: 'grey.500',
        opacity: 1,
      },
    },
  },
};

export const baccoinForgotLinkSx = {
  color: '#ffb400',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 13,
  '&:hover': { textDecoration: 'underline', color: '#ffc933' },
};

export const baccoinSubmitButtonSx = {
  borderRadius: 1,
  py: 1.35,
  fontSize: 15,
  fontWeight: 700,
  textTransform: 'none' as const,
  bgcolor: '#ffb400',
  color: '#fff',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: '#e6a200',
    boxShadow: 'none',
  },
};

export const AUTH_CARD_BG = '#161618';
export const AUTH_INPUT_BG = '#0e0e0e';
/** Brighter placeholder / adornment icons on dark inputs */
export const AUTH_PLACEHOLDER = '#9CA3AF';
export const AUTH_TEXT_SECONDARY = HOME_TEXT_SECONDARY;
export const AUTH_TEXT_MUTED = HOME_TEXT_MUTED;

export const AUTH_RADIUS = {
  card: '0',
  control: '0',
  button: '0',
} as const;

/** Same flat blur surface as home HomeBlurPanel */
export const authCardSx = {
  ...homeBlurPanelSx,
  overflow: 'hidden' as const,
  borderRadius: AUTH_RADIUS.card,
};

const authInputAutofillSx = {
  '& input::selection, & .MuiInputBase-input::selection': {
    backgroundColor: goldAlpha(0.28),
    color: '#ffffff',
  },
  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active, & input:autofill, & .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:autofill':
    {
      WebkitTextFillColor: '#ffffff !important',
      caretColor: '#ffffff',
      borderRadius: 'inherit',
      WebkitBoxShadow: `0 0 0 1000px ${AUTH_INPUT_BG} inset !important`,
      boxShadow: `0 0 0 1000px ${AUTH_INPUT_BG} inset !important`,
      backgroundColor: `${AUTH_INPUT_BG} !important`,
      backgroundImage: 'none !important',
      filter: 'none',
      transition: 'background-color 99999s ease-out 0s',
    },
  '&:has(input:-webkit-autofill), &:has(input:autofill)': {
    bgcolor: AUTH_INPUT_BG,
    backgroundColor: AUTH_INPUT_BG,
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
        '&.Mui-focused': { color: goldAlpha(0.9) },
      },
      '&.Mui-focused': { color: goldAlpha(0.9) },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: alpha(AUTH_INPUT_BG, 0.65),
      borderRadius: AUTH_RADIUS.control,
      fontSize: 14,
      minHeight: 42,
      boxShadow: 'none',
      transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      '& input': {
        fontSize: 14.5,
        paddingTop: '11px',
        paddingBottom: '11px',
      },
      '& input::placeholder': {
        color: AUTH_PLACEHOLDER,
        opacity: 1,
        fontSize: 14.5,
      },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': {
        border: `1px solid ${alpha('#ffffff', 0.12)}`,
      },
      '&:hover fieldset': {
        borderColor: alpha('#ffffff', 0.22),
      },
      '&:hover': {
        boxShadow: 'none',
      },
      '&.Mui-focused': {
        bgcolor: alpha(AUTH_INPUT_BG, 0.8),
        boxShadow: `0 0 0 2px ${goldAlpha(0.28)}`,
      },
      '&.Mui-focused fieldset': {
        borderColor: goldAlpha(0.5),
        borderWidth: '1px',
      },
      '& .MuiSelect-select': {
        color: '#ffffff',
        fontSize: 14.5,
      },
      '& .MuiSelect-icon': {
        color: AUTH_PLACEHOLDER,
      },
      '& .MuiInputAdornment-root': {
        color: AUTH_PLACEHOLDER,
      },
      '& .MuiInputAdornment-root .iconify, & .MuiInputAdornment-root svg': {
        color: `${AUTH_PLACEHOLDER} !important`,
        opacity: 1,
      },
      '& .MuiIconButton-root': {
        color: AUTH_PLACEHOLDER,
        '&:hover': { color: '#D1D5DB' },
      },
      ...authInputAutofillSx,
    },
  },
};

export const authFieldSlotPropsCompact = authFieldSlotProps;

/** Phone field — country flag + dial code sits inside the input row */
export const authPhoneInputSx = {
  '--popover-button-width': '108px',
  '--popover-button-height': '28px',
  '--popover-button-mr': '10px',
  [`& .${inputBaseClasses.input}`]: {
    pl: 'calc(var(--popover-button-width) + var(--popover-button-mr) + 2px) !important',
    fontSize: 16,
    letterSpacing: 0,
  },
  '& .MuiFormHelperText-root': {
    color: AUTH_TEXT_MUTED,
    ml: 0,
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
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.1),
  },
  '& .iconify': {
    color: `${alpha('#ffffff', 0.7)} !important`,
  },
  '& > span': {
    bgcolor: `${alpha('#ffffff', 0.2)} !important`,
  },
};

export const authSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.5,
      bgcolor: alpha('#0a0a0a', 0.96),
      border: `1px solid ${alpha('#ffffff', 0.14)}`,
      backdropFilter: 'blur(12px)',
      boxShadow: `0 16px 40px ${alpha('#000000', 0.65)}`,
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.88),
        fontSize: 16,
        '&:hover': { bgcolor: alpha('#f59e0b', 0.12) },
        '&.Mui-selected': {
          bgcolor: alpha('#f59e0b', 0.18),
          '&:hover': { bgcolor: alpha('#f59e0b', 0.22) },
        },
        '&.Mui-disabled': {
          color: alpha('#ffffff', 0.35),
        },
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
  '& fieldset': {
    border: `1px solid ${alpha('#ffffff', 0.12)}`,
  },
  '&:hover fieldset': {
    borderColor: alpha('#ffffff', 0.22),
  },
  '&.Mui-focused': {
    bgcolor: alpha(AUTH_INPUT_BG, 0.8),
    boxShadow: `0 0 0 2px ${goldAlpha(0.28)}`,
  },
  '&.Mui-focused fieldset': {
    borderColor: goldAlpha(0.5),
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: 1.35,
    fontSize: 16,
  },
};

export const authSubmitButtonSx = {
  borderRadius: AUTH_RADIUS.button,
  py: 1.25,
  minHeight: 46,
  height: 'auto',
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: 'none' as const,
  color: 'var(--ba-gold-ink)',
  width: '100%',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  filter: 'none',
  textShadow: 'none',
  backgroundImage: 'none',
  // Use backgroundColor — MUI dark "contained + inherit" sets backgroundColor:white
  // after shorthand `background`, which made production Sign In buttons look white.
  backgroundColor: 'var(--ba-gold)',
  border: `1px solid ${goldAlpha(0.85)}`,
  boxShadow: 'none',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&.MuiButton-contained.MuiButton-containedInherit': {
    color: 'var(--ba-gold-ink)',
    backgroundColor: 'var(--ba-gold)',
  },
  '&.MuiButton-root:hover': { boxShadow: 'none' },
  '@media (hover: hover)': {
    '&:hover': {
      backgroundColor: 'var(--ba-gold-light)',
      borderColor: goldAlpha(0.9),
      boxShadow: 'none',
      transform: 'none',
      filter: 'none',
    },
    '&.MuiButton-contained.MuiButton-containedInherit:hover': {
      color: 'var(--ba-gold-ink)',
      backgroundColor: 'var(--ba-gold-light)',
    },
  },
  '&:active, &.Mui-focusVisible': {
    backgroundColor: 'var(--ba-gold-dark)',
    borderColor: 'var(--ba-gold-dark)',
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
  '&.Mui-disabled': {
    backgroundColor: goldAlpha(0.28),
    color: alpha('#111111', 0.45),
    borderColor: goldAlpha(0.22),
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
};

export const authSecondaryButtonSx = {
  borderRadius: AUTH_RADIUS.button,
  py: 1.25,
  minHeight: 46,
  height: 'auto',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0,
  textTransform: 'none' as const,
  color: AUTH_TEXT_SECONDARY,
  bgcolor: 'transparent',
  border: `1px solid ${alpha('#ffffff', 0.14)}`,
  boxShadow: 'none',
  flexShrink: 0,
  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: alpha('#ffffff', 0.06),
      borderColor: alpha('#ffffff', 0.22),
      color: alpha('#ffffff', 0.88),
    },
  },
};

export const authLinkSx = {
  color: 'var(--ba-gold)',
  fontWeight: 700,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1.5px',
  transition: 'color 0.2s ease, text-decoration-color 0.2s ease',
  '&:hover': { color: 'var(--ba-gold-light)', textDecorationColor: 'var(--ba-gold-light)' },
};

/** Text back control — keeps a single gold submit button in the card */
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
  '&:hover': { color: '#ffe066', textDecoration: 'underline', textDecorationColor: '#ffe066' },
};

/** Divider above in-card footer (trust row) */
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
      borderColor: goldAlpha(0.32),
      boxShadow: 'none',
      transform: 'none',
      filter: 'none',
    },
  },
  '&:active, &.Mui-focusVisible': {
    bgcolor: alpha(AUTH_INPUT_BG, 0.92),
    backgroundColor: alpha(AUTH_INPUT_BG, 0.92),
    borderColor: goldAlpha(0.4),
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
  '& .MuiAlert-icon': { color: 'inherit' },
};

export const authFooterTextSx = {
  textAlign: 'center' as const,
  fontSize: 13,
  color: AUTH_TEXT_MUTED,
  lineHeight: 1.55,
};
