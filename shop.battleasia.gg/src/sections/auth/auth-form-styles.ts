import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

export const AUTH_BG_IMAGE = '/assets/images/shop/bac-store-hero.webp';

export const AUTH_CARD_BG = '#181614';
export const AUTH_INPUT_BG = '#0e0e0e';
const AUTH_PLACEHOLDER = '#808080';
const AUTH_BORDER = '#2b2b2b';

export const authCardSx = {
  bgcolor: AUTH_CARD_BG,
  backgroundColor: AUTH_CARD_BG,
  backgroundImage: `linear-gradient(180deg, #1c1a16 0%, ${AUTH_CARD_BG} 42%, #141210 100%)`,
  border: `1px solid ${AUTH_BORDER}`,
  boxShadow: `0 24px 60px ${alpha('#000000', 0.65)}`,
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  '&:before': {
    content: "''",
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    background: `linear-gradient(180deg, ${alpha('#f5c518', 0.045)} 0%, transparent 48%)`,
    animation: 'none',
  },
};

const authInputAutofillSx = {
  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active':
    {
      WebkitTextFillColor: '#ffffff',
      WebkitBoxShadow: `0 0 0 1000px ${AUTH_INPUT_BG} inset`,
      caretColor: '#ffffff',
      borderRadius: 'inherit',
      transition: 'background-color 600000s 0s, color 600000s 0s',
    },
};

export const authFieldSlotProps = {
  inputLabel: {
    shrink: true,
    sx: {
      position: 'relative' as const,
      transform: 'none',
      maxWidth: 'none',
      whiteSpace: 'nowrap' as const,
      overflow: 'visible',
      textOverflow: 'clip',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      lineHeight: 1.2,
      color: alpha('#e8e0d0', 0.72),
      mb: 0.5,
      textTransform: 'uppercase' as const,
      '&.MuiInputLabel-shrink': {
        transform: 'none',
        fontSize: 10,
        color: alpha('#e8e0d0', 0.72),
        '&.Mui-focused': { color: alpha('#f5c518', 0.85) },
      },
      '&.Mui-focused': { color: alpha('#f5c518', 0.85) },
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

export const authPhoneInputSx = {
  '--popover-button-width': '80px',
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
      mt: 0.75,
      maxHeight: 320,
      borderRadius: 0,
      bgcolor: alpha('#0a0a0a', 0.98),
      border: `1px solid ${alpha('#ffffff', 0.14)}`,
      backdropFilter: 'blur(14px)',
      boxShadow: `0 16px 40px ${alpha('#000000', 0.65)}`,
      '& .MuiMenuItem-root': {
        color: alpha('#ffffff', 0.9),
        fontSize: 16,
        minHeight: 44,
        py: 1.1,
        px: 1.5,
        borderRadius: 0,
        '&:hover': { bgcolor: alpha('#f5c518', 0.12) },
        '&.Mui-selected': {
          bgcolor: alpha('#f5c518', 0.18),
          color: '#ffffff',
          '&:hover': { bgcolor: alpha('#f5c518', 0.24) },
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
  py: 1.45,
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
  color: '#111111',
  boxShadow: `0 0 16px ${alpha('#f5c518', 0.18)}`,
  background: 'linear-gradient(180deg, #f5c518 0%, #d4a017 52%, #d97706 100%)',
  border: `1px solid ${alpha('#fbbf24', 0.9)}`,
  transition: 'transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(180deg, #fbbf24 0%, #f5c518 52%, #d4a017 100%)',
    boxShadow: `0 0 22px ${alpha('#f5c518', 0.38)}, 0 8px 28px ${alpha('#f5c518', 0.28)}`,
    filter: 'brightness(1.04)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'scale(0.985) translateY(1px)',
  },
};

export const authLinkSx = {
  color: '#f5c518',
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
