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

export const AUTH_CARD_BG = '#181614';
export const AUTH_INPUT_BG = '#0e0e0e';
const AUTH_PLACEHOLDER = '#808080';
const AUTH_BORDER = '#2b2b2b';

/** Neutral charcoal card — slight warm gold wash + subtle top border glow */
export const authCardSx = {
  bgcolor: AUTH_CARD_BG,
  backgroundColor: AUTH_CARD_BG,
  backgroundImage: `linear-gradient(180deg, #1c1a16 0%, ${AUTH_CARD_BG} 42%, #141210 100%)`,
  border: `1px solid ${AUTH_BORDER}`,
  borderTop: `1px solid ${alpha('#f5c518', 0.22)}`,
  boxShadow: `0 24px 60px ${alpha('#000000', 0.65)}, 0 -1px 12px ${alpha('#f5c518', 0.06)}`,
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  '&:before': {
    content: "''",
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    background: `linear-gradient(180deg, ${alpha('#f5c518', 0.055)} 0%, transparent 40%)`,
    animation: 'none',
  },
};

const authInputAutofillSx = {
  '& input::selection, & .MuiInputBase-input::selection': {
    backgroundColor: alpha('#f5c518', 0.28),
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
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1.1,
      lineHeight: 1.2,
      color: alpha('#e8e0d0', 0.78),
      mb: 0.65,
      textTransform: 'uppercase' as const,
      '&.MuiInputLabel-shrink': {
        transform: 'none',
        fontSize: 12,
        color: alpha('#e8e0d0', 0.78),
        '&.Mui-focused': { color: alpha('#f5c518', 0.9) },
      },
      '&.Mui-focused': { color: alpha('#f5c518', 0.9) },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: AUTH_INPUT_BG,
      borderRadius: '4px',
      fontSize: 16,
      minHeight: 50,
      boxShadow: `0 0 0 1px ${alpha('#f5c518', 0.14)}, 0 0 10px ${alpha('#f5c518', 0.12)}`,
      transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      '& input': {
        fontSize: 16,
        paddingTop: '13px',
        paddingBottom: '13px',
      },
      '& input::placeholder': {
        color: AUTH_PLACEHOLDER,
        opacity: 1,
        fontSize: 16,
      },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': {
        border: `1px solid ${alpha('#f5c518', 0.28)}`,
      },
      '&:hover fieldset': {
        borderColor: alpha('#f5c518', 0.48),
      },
      '&:hover': {
        boxShadow: `0 0 0 1px ${alpha('#f5c518', 0.2)}, 0 0 14px ${alpha('#f5c518', 0.18)}`,
      },
      '&.Mui-focused': {
        bgcolor: AUTH_INPUT_BG,
        boxShadow: `0 0 0 1px ${alpha('#f5c518', 0.32)}, 0 0 16px ${alpha('#f5c518', 0.22)}`,
      },
      '&.Mui-focused fieldset': {
        borderColor: alpha('#f5c518', 0.55),
        borderWidth: '1px',
      },
      '& .MuiSelect-select': {
        color: '#ffffff',
        fontSize: 16,
      },
      '& .MuiSelect-icon': {
        color: '#ffffff',
      },
      '& .MuiInputAdornment-root .iconify': {
        color: '#ffffff',
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
  bgcolor: AUTH_INPUT_BG,
  borderRadius: '4px',
  fontSize: 16,
  minHeight: 50,
  boxShadow: `0 0 0 1px ${alpha('#f5c518', 0.14)}, 0 0 10px ${alpha('#f5c518', 0.12)}`,
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& fieldset': {
    border: `1px solid ${alpha('#f5c518', 0.28)}`,
  },
  '&:hover fieldset': {
    borderColor: alpha('#f5c518', 0.48),
  },
  '&.Mui-focused': {
    bgcolor: AUTH_INPUT_BG,
    boxShadow: `0 0 0 1px ${alpha('#f5c518', 0.32)}, 0 0 16px ${alpha('#f5c518', 0.22)}`,
  },
  '&.Mui-focused fieldset': {
    borderColor: alpha('#f5c518', 0.55),
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: 1.35,
    fontSize: 16,
  },
};

export const authSubmitButtonSx = {
  borderRadius: 0,
  py: 0,
  minHeight: 44,
  height: 44,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
  color: '#111111',
  width: '100%',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  filter: 'none',
  textShadow: 'none',
  backgroundImage: 'none',
  background: 'linear-gradient(180deg, #f5c518 0%, #d4a017 52%, #d97706 100%)',
  border: `1px solid ${alpha('#fbbf24', 0.9)}`,
  boxShadow: `0 0 16px ${alpha('#f5c518', 0.18)}`,
  transition: 'transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease',
  '&:hover': {
    filter: 'none',
    background: 'linear-gradient(180deg, #fbbf24 0%, #f5c518 52%, #d4a017 100%)',
    boxShadow: `0 0 22px ${alpha('#f5c518', 0.38)}, 0 10px 28px ${alpha('#000000', 0.45)}`,
  },
  '&:active': {
    transform: 'scale(0.985) translateY(1px)',
  },
  '&.Mui-disabled': {
    background: alpha('#f5c518', 0.28),
    color: alpha('#111111', 0.45),
    borderColor: alpha('#f5c518', 0.22),
    boxShadow: 'none',
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
  fontSize: 12.5,
  color: alpha('#ffffff', 0.5),
  lineHeight: 1.55,
};
