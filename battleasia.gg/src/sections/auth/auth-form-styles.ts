import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HOME_ROW_LINE, homeBlurPanelSx, HOME_TEXT_MUTED, HOME_TEXT_SECONDARY } from 'src/sections/home/home-blur-panel';
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

export const authCardSx = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  borderRadius: '16px',
  bgcolor: alpha('#0d0f14', 0.45),
  background: `linear-gradient(145deg, ${alpha('#161922', 0.62)} 0%, ${alpha('#0a0c10', 0.42)} 100%)`,
  backdropFilter: 'blur(32px) saturate(190%)',
  WebkitBackdropFilter: 'blur(32px) saturate(190%)',
  border: `1px solid ${alpha('#ffffff', 0.16)}`,
  borderTop: `1px solid ${alpha('#ffffff', 0.32)}`,
  boxShadow: `
    0 30px 70px rgba(0, 0, 0, 0.65),
    inset 0 1px 1px ${alpha('#ffffff', 0.22)},
    0 0 50px ${goldAlpha(0.12)}
  `,
  transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
  '&:hover': {
    boxShadow: `
      0 36px 80px rgba(0, 0, 0, 0.75),
      inset 0 1px 1.5px ${alpha('#ffffff', 0.3)},
      0 0 60px ${goldAlpha(0.18)}
    `,
    borderColor: alpha('#ffffff', 0.24),
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
      letterSpacing: 0.2,
      lineHeight: 1.2,
      color: AUTH_TEXT_SECONDARY,
      mb: 0.7,
      textTransform: 'none' as const,
      '&.MuiInputLabel-shrink': {
        transform: 'none',
        fontSize: 13,
        color: AUTH_TEXT_SECONDARY,
        '&.Mui-focused': { color: goldAlpha(0.95) },
      },
      '&.Mui-focused': { color: goldAlpha(0.95) },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: alpha('#06080c', 0.48),
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '8px',
      fontSize: 14,
      minHeight: 44,
      boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      '& input': {
        fontSize: 14.5,
        paddingTop: '11px',
        paddingBottom: '11px',
      },
      '& input::placeholder': {
        color: AUTH_PLACEHOLDER,
        opacity: 0.85,
        fontSize: 14,
      },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': {
        border: `1px solid ${alpha('#ffffff', 0.14)}`,
        transition: 'border-color 0.2s ease',
      },
      '&:hover fieldset': {
        borderColor: goldAlpha(0.4),
      },
      '&:hover': {
        bgcolor: alpha('#06080c', 0.65),
      },
      '&.Mui-focused': {
        bgcolor: alpha('#05070a', 0.75),
        boxShadow: `0 0 0 3px ${goldAlpha(0.22)}, inset 0 1px 0 ${alpha('#ffffff', 0.12)}`,
      },
      '&.Mui-focused fieldset': {
        borderColor: goldAlpha(0.75),
        borderWidth: '1px',
      },
      '& .MuiSelect-select': {
        color: '#ffffff',
        fontSize: 14.5,
      },
      '& .MuiSelect-icon': {
        color: AUTH_PLACEHOLDER,
        transition: 'color 0.2s ease, transform 0.2s ease',
      },
      '&.Mui-focused .MuiSelect-icon': {
        color: 'var(--ba-gold)',
      },
      '& .MuiInputAdornment-root': {
        color: AUTH_PLACEHOLDER,
        transition: 'color 0.2s ease',
      },
      '& .MuiInputAdornment-root .iconify, & .MuiInputAdornment-root svg': {
        color: `${AUTH_PLACEHOLDER} !important`,
        opacity: 0.9,
        transition: 'color 0.2s ease, filter 0.2s ease',
      },
      '&:focus-within .MuiInputAdornment-root .iconify, &:focus-within .MuiInputAdornment-root svg': {
        color: 'var(--ba-gold) !important',
        filter: 'drop-shadow(0 0 6px goldAlpha(0.5))',
      },
      '& .MuiIconButton-root': {
        color: AUTH_PLACEHOLDER,
        transition: 'color 0.2s ease',
        '&:hover': { color: '#ffffff' },
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
  borderRadius: '3px',
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
      bgcolor: alpha('#0b0e14', 0.98),
      border: `1px solid ${goldAlpha(0.25)}`,
      backdropFilter: 'blur(16px)',
      boxShadow: `0 20px 48px rgba(0, 0, 0, 0.8), 0 0 20px ${goldAlpha(0.12)}`,
      borderRadius: '6px',
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.9),
        fontSize: 14.5,
        py: 1.1,
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: goldAlpha(0.15),
          color: '#ffffff',
          pl: 2.2,
        },
        '&.Mui-selected': {
          bgcolor: goldAlpha(0.22),
          color: 'var(--ba-gold)',
          fontWeight: 700,
          '&:hover': { bgcolor: goldAlpha(0.28) },
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
  borderRadius: '4px',
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
    bgcolor: alpha('#0b0d12', 0.95),
    boxShadow: `0 0 0 1px ${goldAlpha(0.55)}, 0 0 16px ${goldAlpha(0.2)}, inset 0 0 8px ${goldAlpha(0.06)}`,
  },
  '&.Mui-focused fieldset': {
    borderColor: goldAlpha(0.75),
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: 1.25,
    fontSize: 14.5,
  },
};

export const authSubmitButtonSx = {
  position: 'relative' as const,
  borderRadius: '4px',
  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
  py: 1.35,
  minHeight: 48,
  height: 'auto',
  fontSize: 14.5,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase' as const,
  color: 'var(--ba-gold-ink, #080a0e) !important',
  width: '100%',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  filter: 'none',
  textShadow: '0 1px 1px rgba(255,255,255,0.4)',
  backgroundColor: 'var(--ba-gold) !important',
  background: 'linear-gradient(135deg, var(--ba-gold-light) 0%, var(--ba-gold) 50%, var(--ba-gold-dark) 100%) !important',
  border: `1px solid ${goldAlpha(0.7)}`,
  boxShadow: `0 4px 20px ${goldAlpha(0.35)}, inset 0 1px 1px rgba(255, 255, 255, 0.4)`,
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
    transform: 'skewX(-25deg)',
    transition: 'left 0.6s ease',
    pointerEvents: 'none',
  },
  '&.MuiButton-contained.MuiButton-containedInherit': {
    color: 'var(--ba-gold-ink, #080a0e) !important',
    backgroundColor: 'var(--ba-gold) !important',
    background: 'linear-gradient(135deg, var(--ba-gold-light) 0%, var(--ba-gold) 50%, var(--ba-gold-dark) 100%) !important',
  },
  '@media (hover: hover)': {
    '&:hover': {
      backgroundColor: 'var(--ba-gold-light) !important',
      background: 'linear-gradient(135deg, #ffffff 0%, var(--ba-gold-light) 50%, var(--ba-gold) 100%) !important',
      borderColor: goldAlpha(0.9),
      boxShadow: `0 6px 28px ${goldAlpha(0.55)}, inset 0 1px 1px rgba(255, 255, 255, 0.6)`,
      transform: 'translateY(-1.5px)',
      '&::before': {
        left: '140%',
      },
    },
    '&.MuiButton-contained.MuiButton-containedInherit:hover': {
      color: 'var(--ba-gold-ink, #080a0e) !important',
      backgroundColor: 'var(--ba-gold-light) !important',
      background: 'linear-gradient(135deg, #ffffff 0%, var(--ba-gold-light) 50%, var(--ba-gold) 100%) !important',
    },
  },
  '&:active, &.Mui-focusVisible': {
    backgroundColor: 'var(--ba-gold-dark) !important',
    background: 'linear-gradient(135deg, var(--ba-gold) 0%, var(--ba-gold-dark) 100%) !important',
    borderColor: 'var(--ba-gold-dark)',
    boxShadow: `0 2px 10px ${goldAlpha(0.4)}`,
    transform: 'translateY(1px)',
  },
  '&.Mui-disabled': {
    backgroundColor: `${goldAlpha(0.25)} !important`,
    background: 'none !important',
    color: `${alpha('#ffffff', 0.4)} !important`,
    borderColor: goldAlpha(0.2),
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
};

export const authSecondaryButtonSx = {
  borderRadius: '4px',
  py: 1.25,
  minHeight: 46,
  height: 'auto',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0.3,
  textTransform: 'none' as const,
  color: AUTH_TEXT_SECONDARY,
  bgcolor: alpha('#ffffff', 0.04),
  border: `1px solid ${alpha('#ffffff', 0.14)}`,
  boxShadow: 'none',
  flexShrink: 0,
  transition: 'all 0.2s ease',
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: alpha('#ffffff', 0.08),
      borderColor: goldAlpha(0.4),
      color: '#ffffff',
      boxShadow: `0 4px 14px ${goldAlpha(0.12)}`,
      transform: 'translateY(-1px)',
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
  borderRadius: '4px',
  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
  bgcolor: alpha('#0d0f14', 0.8),
  backgroundColor: alpha('#0d0f14', 0.8),
  backgroundImage: 'none',
  border: `1px solid ${alpha('#ffffff', 0.12)}`,
  boxShadow: 'none',
  color: 'inherit',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  '&.MuiButton-root:hover': { boxShadow: 'none' },
  '@media (hover: hover)': {
    '&:hover': {
      bgcolor: alpha('#151922', 0.95),
      backgroundColor: alpha('#151922', 0.95),
      borderColor: goldAlpha(0.45),
      boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 12px ${goldAlpha(0.15)}`,
      transform: 'translateY(-1.5px)',
      filter: 'none',
    },
  },
  '&:active, &.Mui-focusVisible': {
    bgcolor: alpha('#0b0e14', 0.98),
    backgroundColor: alpha('#0b0e14', 0.98),
    borderColor: goldAlpha(0.6),
    boxShadow: 'none',
    transform: 'translateY(1px)',
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
