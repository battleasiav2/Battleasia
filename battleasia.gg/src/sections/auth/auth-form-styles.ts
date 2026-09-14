import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HOME_ROW_LINE, HOME_TEXT_MUTED, HOME_TEXT_SECONDARY } from 'src/sections/home/home-blur-panel';
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
  color: 'var(--ba-gold)',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 13,
  '&:hover': { textDecoration: 'underline', color: 'var(--ba-gold-light)' },
};

export const baccoinSubmitButtonSx = {
  borderRadius: 1,
  py: 1.35,
  fontSize: 15,
  fontWeight: 700,
  textTransform: 'none' as const,
  bgcolor: 'var(--ba-gold)',
  color: 'var(--ba-gold-ink, #080a0e)',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: 'var(--ba-gold-light)',
    boxShadow: 'none',
  },
};

export const AUTH_CARD_BG = '#161618';
/** Zip `.auth-input-wrap` fill */
export const AUTH_INPUT_BG = 'rgba(10,10,12,0.62)';
/** Zip `--faint` / muted adornments */
export const AUTH_PLACEHOLDER = 'rgba(255,255,255,0.42)';
export const AUTH_TEXT_SECONDARY = HOME_TEXT_SECONDARY;
export const AUTH_TEXT_MUTED = HOME_TEXT_MUTED;

export const AUTH_RADIUS = {
  card: '18px',
  control: '12px',
  button: '12px',
} as const;

/** Zip `.auth-card` / `.panel` */
export const authCardSx = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  borderRadius: '18px',
  bgcolor: 'rgba(22,22,24,0.38)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 30px 80px -44px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
  transition: 'border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.25s ease',
  '&:hover': {
    bgcolor: 'rgba(30,30,33,0.55)',
    borderColor: 'rgba(255,255,255,0.14)',
  },
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
      WebkitBoxShadow: '0 0 0 1000px #0a0a0c inset !important',
      boxShadow: '0 0 0 1000px #0a0a0c inset !important',
      backgroundColor: '#0a0a0c !important',
      backgroundImage: 'none !important',
      filter: 'none',
      transition: 'background-color 99999s ease-out 0s',
    },
  '&:has(input:-webkit-autofill), &:has(input:autofill)': {
    bgcolor: '#0a0a0c',
    backgroundColor: '#0a0a0c',
  },
};

/** Zip `.auth-label` + `.auth-input-wrap` */
export const authFieldSlotProps = {
  inputLabel: {
    shrink: true,
    sx: {
      position: 'relative' as const,
      transform: 'none',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      lineHeight: 1.2,
      color: AUTH_TEXT_MUTED,
      mb: 0.75,
      textTransform: 'uppercase' as const,
      '&.MuiInputLabel-shrink': {
        transform: 'none',
        fontSize: '0.72rem',
        color: AUTH_TEXT_MUTED,
        '&.Mui-focused': { color: 'var(--ba-gold)' },
      },
      '&.Mui-focused': { color: 'var(--ba-gold)' },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: AUTH_INPUT_BG,
      borderRadius: '12px',
      fontSize: '0.92rem',
      fontWeight: 500,
      minHeight: 44,
      boxShadow: 'none',
      transition: 'border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s ease',
      '& input': {
        fontSize: '0.92rem',
        fontWeight: 500,
        paddingTop: '11px',
        paddingBottom: '11px',
      },
      '& input::placeholder': {
        color: AUTH_PLACEHOLDER,
        opacity: 1,
        fontSize: '0.92rem',
      },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': {
        border: `1px solid ${alpha('#ffffff', 0.09)}`,
        transition: 'border-color 0.25s ease',
      },
      '&:hover fieldset': {
        borderColor: alpha('#ffffff', 0.14),
      },
      '&:hover': {
        bgcolor: AUTH_INPUT_BG,
      },
      '&.Mui-focused': {
        bgcolor: AUTH_INPUT_BG,
        boxShadow: `0 0 0 3px ${goldAlpha(0.14)}`,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--ba-gold)',
        borderWidth: '1px',
      },
      '& .MuiSelect-select': {
        color: '#ffffff',
        fontSize: '0.92rem',
      },
      '& .MuiSelect-icon': {
        color: AUTH_PLACEHOLDER,
        transition: 'color 0.15s ease',
      },
      '&.Mui-focused .MuiSelect-icon': {
        color: 'var(--ba-gold)',
      },
      '& .MuiInputAdornment-root': {
        color: AUTH_PLACEHOLDER,
        transition: 'color 0.15s ease',
      },
      '& .MuiInputAdornment-root .iconify, & .MuiInputAdornment-root svg': {
        color: `${AUTH_PLACEHOLDER} !important`,
        opacity: 1,
        transition: 'color 0.15s ease',
      },
      '&:focus-within .MuiInputAdornment-root .iconify, &:focus-within .MuiInputAdornment-root svg': {
        color: `${AUTH_PLACEHOLDER} !important`,
        filter: 'none',
      },
      '& .MuiIconButton-root': {
        color: AUTH_PLACEHOLDER,
        borderRadius: '8px',
        transition: 'color 0.15s ease, background-color 0.15s ease',
        '&:hover': { color: '#ffffff', bgcolor: alpha('#ffffff', 0.05) },
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
    fontSize: 15,
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
  borderRadius: '8px',
  bgcolor: alpha('#ffffff', 0.08),
  border: `1px solid ${alpha('#ffffff', 0.1)}`,
  px: 0.6,
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.14),
    borderColor: goldAlpha(0.4),
  },
  '& .iconify': {
    color: `${alpha('#ffffff', 0.85)} !important`,
  },
  '& > span': {
    bgcolor: `${alpha('#ffffff', 0.25)} !important`,
  },
};

export const authSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.75,
      bgcolor: '#161618',
      border: `1px solid ${alpha('#ffffff', 0.12)}`,
      boxShadow: 'none',
      borderRadius: '12px',
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.9),
        fontSize: 14.5,
        py: 1.1,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': {
          bgcolor: alpha('#ffffff', 0.06),
          color: '#ffffff',
        },
        '&.Mui-selected': {
          bgcolor: goldAlpha(0.12),
          color: 'var(--ba-gold)',
          fontWeight: 700,
          '&:hover': { bgcolor: goldAlpha(0.16) },
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
  bgcolor: alpha('#0d0f14', 0.75),
  borderRadius: '12px',
  fontSize: 14,
  minHeight: 44,
  boxShadow: 'none',
  transition: 'border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& fieldset': {
    border: `1px solid ${alpha('#ffffff', 0.12)}`,
    transition: 'border-color 0.2s ease',
  },
  '&:hover fieldset': {
    borderColor: goldAlpha(0.4),
  },
  '&:hover': {
    bgcolor: alpha('#0d0f14', 0.88),
  },
  '&.Mui-focused': {
    bgcolor: '#0e0e0e',
    boxShadow: 'none',
  },
  '&.Mui-focused fieldset': {
    borderColor: goldAlpha(0.45),
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: 1.25,
    fontSize: 14.5,
  },
};

/** Solid accent CTA — Enter Arena style (no clipPath / skew / shimmer) */
export const authSubmitButtonSx = {
  borderRadius: '12px !important',
  py: 1.35,
  minHeight: 48,
  height: 'auto',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase' as const,
  width: '100%',
  clipPath: 'none !important',
  transform: 'none !important',
  color: 'var(--ba-gold-ink, #081401) !important',
  bgcolor: 'var(--ba-gold) !important',
  backgroundColor: 'var(--ba-gold) !important',
  backgroundImage: 'none !important',
  border: '1px solid var(--ba-gold) !important',
  boxShadow: '0 8px 28px -12px rgba(203,251,36,0.4), inset 0 1px 0 rgba(255,255,255,0.35) !important',
  textShadow: 'none',
  filter: 'none !important',
  transition: 'transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s ease',
  '&::before, &::after': { display: 'none !important' },
  '&.MuiButton-outlined, &.MuiButton-contained, &.MuiLoadingButton-root': {
    clipPath: 'none !important',
    borderRadius: '12px !important',
    color: 'var(--ba-gold-ink, #081401) !important',
    bgcolor: 'var(--ba-gold) !important',
    backgroundColor: 'var(--ba-gold) !important',
    backgroundImage: 'none !important',
    border: '1px solid var(--ba-gold) !important',
    boxShadow: '0 8px 28px -12px rgba(203,251,36,0.4), inset 0 1px 0 rgba(255,255,255,0.35) !important',
  },
  '@media (hover: hover)': {
    '&:hover': {
      clipPath: 'none !important',
      transform: 'translateY(-2px) !important',
      bgcolor: 'var(--ba-gold) !important',
      backgroundColor: 'var(--ba-gold) !important',
      backgroundImage: 'none !important',
      borderColor: 'var(--ba-gold) !important',
      color: 'var(--ba-gold-ink, #081401) !important',
      boxShadow: '0 16px 40px -12px rgba(203,251,36,0.4) !important',
      filter: 'none !important',
    },
  },
  '&:active, &.Mui-focusVisible': {
    clipPath: 'none !important',
    transform: 'none !important',
    bgcolor: 'var(--ba-gold) !important',
    backgroundImage: 'none !important',
    boxShadow: 'none !important',
    filter: 'none !important',
  },
  '&.Mui-disabled': {
    clipPath: 'none !important',
    bgcolor: `${alpha('#ffffff', 0.08)} !important`,
    backgroundImage: 'none !important',
    color: `${alpha('#ffffff', 0.32)} !important`,
    borderColor: `${alpha('#ffffff', 0.08)} !important`,
    boxShadow: 'none !important',
  },
};

export const authSecondaryButtonSx = {
  borderRadius: '12px !important',
  py: 1.15,
  minHeight: 42,
  height: 'auto',
  fontSize: 12.5,
  fontWeight: 800,
  letterSpacing: 0.8,
  textTransform: 'uppercase' as const,
  clipPath: 'none !important',
  transform: 'none !important',
  color: alpha('#ffffff', 0.88),
  bgcolor: alpha('#ffffff', 0.05),
  border: `1px solid ${alpha('#ffffff', 0.12)}`,
  boxShadow: 'none',
  flexShrink: 0,
  transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  '&::before, &::after': { display: 'none !important' },
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: goldAlpha(0.12),
      borderColor: goldAlpha(0.45),
      color: '#ffffff',
      boxShadow: 'none',
      transform: 'none !important',
      clipPath: 'none !important',
    },
  },
};

/** Zip `.auth-link` */
export const authLinkSx = {
  color: 'var(--ba-gold)',
  fontWeight: 600,
  fontSize: '0.84rem',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  '&:hover': { color: 'var(--ba-gold)', textDecoration: 'underline' },
};

/** Text back control — Pulse chip submit stays primary in the card */
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
  '&:hover': { color: 'var(--ba-gold-light)', textDecoration: 'underline', textDecorationColor: 'var(--ba-gold-light)' },
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
  minHeight: 42,
  height: 42,
  minWidth: 0,
  py: 0,
  px: 0,
  borderRadius: '12px !important',
  clipPath: 'none !important',
  transform: 'none !important',
  bgcolor: alpha('#ffffff', 0.05),
  backgroundColor: alpha('#ffffff', 0.05),
  backgroundImage: 'none',
  border: `1px solid ${alpha('#ffffff', 0.12)}`,
  boxShadow: 'none',
  color: 'inherit',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&::before, &::after': { display: 'none !important' },
  '&.MuiButton-root:hover': { boxShadow: 'none', clipPath: 'none !important', transform: 'none !important' },
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: goldAlpha(0.12),
      backgroundColor: goldAlpha(0.12),
      borderColor: goldAlpha(0.45),
      boxShadow: 'none',
      transform: 'none !important',
      clipPath: 'none !important',
      filter: 'none',
    },
  },
  '&:active, &.Mui-focusVisible': {
    bgcolor: alpha('#ffffff', 0.08),
    backgroundColor: alpha('#ffffff', 0.08),
    borderColor: alpha('#ffffff', 0.2),
    boxShadow: 'none',
    transform: 'none !important',
    clipPath: 'none !important',
    filter: 'none',
  },
};

/** @deprecated Use authSocialIconButtonSx */
export const authSocialButtonSx = authSocialIconButtonSx;

/** Zip `.auth-alert` */
export const authAlertSx = {
  borderRadius: '12px',
  bgcolor: alpha('#ff5050', 0.08),
  border: `1px solid ${alpha('#ff5050', 0.28)}`,
  color: '#ffb4b4',
  fontSize: '0.84rem',
  '& .MuiAlert-icon': { color: '#ffb4b4' },
};

export const authFooterTextSx = {
  textAlign: 'center' as const,
  fontSize: 13,
  color: AUTH_TEXT_MUTED,
  lineHeight: 1.55,
};
