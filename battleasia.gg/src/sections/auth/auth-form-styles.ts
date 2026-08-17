import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HOME_GAME_ARTS } from 'src/sections/home/play-your-game-section';

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

export const AUTH_INPUT_BG = alpha('#000000', 0.5);

export const authFieldSlotProps = {
  inputLabel: {
    shrink: true,
    sx: {
      position: 'relative' as const,
      transform: 'none',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.4,
      color: alpha('#ffffff', 0.82),
      mb: 0.75,
      textTransform: 'uppercase' as const,
      // Match theme's `.shrink.focused` specificity so the label never turns dark on focus
      '&.MuiInputLabel-shrink': {
        transform: 'none',
        color: alpha('#ffffff', 0.82),
        '&.Mui-focused': { color: '#f59e0b' },
      },
      '&.Mui-focused': { color: '#f59e0b' },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: AUTH_INPUT_BG,
      borderRadius: '2px',
      fontSize: 14,
      minHeight: 48,
      boxShadow: `0 0 10px ${alpha('#f5c518', 0.1)}`,
      transition: 'border-color 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease',
      '& input::placeholder': {
        color: alpha('#ffffff', 0.55),
        opacity: 1,
      },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': {
        border: `1px solid ${alpha('#f5c518', 0.28)}`,
      },
      '&:hover fieldset': {
        borderColor: alpha('#f5c518', 0.5),
      },
      '&:hover': {
        boxShadow: `0 0 14px ${alpha('#f5c518', 0.18)}`,
      },
      '&.Mui-focused': {
        bgcolor: alpha('#000000', 0.58),
        boxShadow: `0 0 0 2px ${alpha('#f5c518', 0.32)}, 0 0 18px ${alpha('#f5c518', 0.28)}`,
      },
      '&.Mui-focused fieldset': {
        borderColor: '#f5c518',
        borderWidth: '1px',
      },
      '& .MuiSelect-select': {
        color: '#ffffff',
      },
      '& .MuiSelect-icon': {
        color: alpha('#ffffff', 0.65),
      },
    },
  },
};

// Compact variant — used on sign-in for a tighter, smaller card
export const authFieldSlotPropsCompact = {
  inputLabel: {
    ...authFieldSlotProps.inputLabel,
    sx: {
      ...authFieldSlotProps.inputLabel.sx,
      fontSize: 10,
      letterSpacing: 0.2,
      mb: 0.5,
    },
  },
  input: {
    ...authFieldSlotProps.input,
    sx: {
      ...authFieldSlotProps.input.sx,
      minHeight: 36,
      fontSize: 13,
      '& input': {
        paddingTop: '7px',
        paddingBottom: '7px',
      },
      // Keep browser autofill on-brand (dark box, white text)
      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active':
        {
          WebkitTextFillColor: '#ffffff',
          WebkitBoxShadow: '0 0 0 1000px #14121a inset',
          caretColor: '#ffffff',
          borderRadius: 'inherit',
          transition: 'background-color 600000s 0s, color 600000s 0s',
        },
    },
  },
};

/** Phone field — country flag + dial code sits inside the input row */
export const authPhoneInputSx = {
  '--popover-button-width': '108px',
  '--popover-button-height': '28px',
  '--popover-button-mr': '10px',
  [`& .${inputBaseClasses.input}`]: {
    pl: 'calc(var(--popover-button-width) + var(--popover-button-mr) + 2px) !important',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  '& .MuiFormHelperText-root': {
    color: alpha('#ffffff', 0.55),
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
  borderRadius: '2px',
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
        fontSize: 14,
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
  bgcolor: AUTH_INPUT_BG,
  borderRadius: '2px',
  fontSize: 14,
  minHeight: 48,
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& fieldset': {
    border: `1px solid ${alpha('#ffffff', 0.22)}`,
  },
  '&:hover fieldset': {
    borderColor: alpha('#ffffff', 0.38),
  },
  '&.Mui-focused': {
    bgcolor: alpha('#000000', 0.58),
    boxShadow: `0 0 0 2px ${alpha('#f5c518', 0.32)}, 0 0 18px ${alpha('#f5c518', 0.28)}`,
  },
  '&.Mui-focused fieldset': {
    borderColor: '#f59e0b',
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: 1.35,
  },
};

import { userGoldButtonSx } from 'src/layouts/user/user-theme';

export const authSubmitButtonSx = {
  ...userGoldButtonSx,
  py: 1.45,
  fontSize: 14,
  letterSpacing: 1,
  width: '100%',
  boxShadow: `0 0 16px ${alpha('#f5c518', 0.18)}`,
  transition: 'transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    filter: 'brightness(1.06)',
    boxShadow: `0 0 22px ${alpha('#f5c518', 0.38)}, 0 10px 28px ${alpha('#000000', 0.45)}`,
  },
  '&:active': {
    transform: 'scale(0.985) translateY(1px)',
  },
};

export const authLinkSx = {
  color: '#f59e0b',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  '&:hover': { textDecoration: 'underline', color: '#fbbf24' },
};

export const authAlertSx = {
  borderRadius: '2px',
  bgcolor: alpha('#000000', 0.45),
  border: `1px solid ${alpha('#ffffff', 0.1)}`,
  color: '#ffffff',
  '& .MuiAlert-icon': { color: 'inherit' },
};

export const authFooterTextSx = {
  textAlign: 'center' as const,
  fontSize: 13,
  color: alpha('#ffffff', 0.5),
  lineHeight: 1.6,
};
