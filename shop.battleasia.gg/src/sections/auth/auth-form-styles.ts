import { alpha } from '@mui/material/styles';
import { inputBaseClasses } from '@mui/material/InputBase';

export const AUTH_BG_IMAGE = '/assets/images/shop/bac-store-hero.webp';

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
      '&.Mui-focused': { color: '#f5c518' },
      '&.MuiInputLabel-shrink': { transform: 'none' },
    },
  },
  input: {
    sx: {
      color: '#ffffff',
      bgcolor: AUTH_INPUT_BG,
      borderRadius: '2px',
      fontSize: 14,
      minHeight: 44,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
      '& input::placeholder': {
        color: alpha('#ffffff', 0.55),
        opacity: 1,
      },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '& fieldset': {
        border: `1px solid ${alpha('#ffffff', 0.22)}`,
      },
      '&:hover fieldset': {
        borderColor: alpha('#ffffff', 0.38),
      },
      '&.Mui-focused': {
        bgcolor: alpha('#000000', 0.58),
        boxShadow: `0 0 0 3px ${alpha('#f5c518', 0.18)}`,
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

export const authPhoneInputSx = {
  '--popover-button-width': '80px',
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
  borderRadius: '2px',
  fontSize: 14,
  minHeight: 44,
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& fieldset': {
    border: `1px solid ${alpha('#ffffff', 0.22)}`,
  },
  '&:hover fieldset': {
    borderColor: alpha('#ffffff', 0.38),
  },
  '&.Mui-focused': {
    bgcolor: alpha('#000000', 0.58),
    boxShadow: `0 0 0 3px ${alpha('#f5c518', 0.18)}`,
  },
  '&.Mui-focused fieldset': {
    borderColor: '#f5c518',
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    py: 1.15,
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
  boxShadow: 'none',
  background: 'linear-gradient(180deg, #f5c518 0%, #d4a017 52%, #d97706 100%)',
  border: `1px solid ${alpha('#fbbf24', 0.9)}`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(180deg, #fbbf24 0%, #f5c518 52%, #d4a017 100%)',
    boxShadow: `0 8px 28px ${alpha('#f5c518', 0.4)}`,
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
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
  fontSize: 13,
  color: alpha('#ffffff', 0.5),
  lineHeight: 1.6,
};
