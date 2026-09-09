import { alpha, Theme } from '@mui/material/styles';
import { ButtonProps, buttonClasses } from '@mui/material/Button';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// NEW VARIANT
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}

// ----------------------------------------------------------------------

export function button(theme: Theme) {
  const lightMode = theme.palette.mode === 'light';

  const rootStyles = (ownerState: ButtonProps) => {
    const inheritColor = ownerState.color === 'inherit';
    const containedVariant = ownerState.variant === 'contained';
    const outlinedVariant = ownerState.variant === 'outlined';
    const textVariant = ownerState.variant === 'text';
    const softVariant = ownerState.variant === 'soft';

    const smallSize = ownerState.size === 'small';
    const mediumSize = ownerState.size === 'medium';
    const largeSize = ownerState.size === 'large';

    let clipPath = 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)';
    if (smallSize) {
      clipPath = 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)';
    } else if (largeSize) {
      clipPath = 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)';
    }

    const baseTacticalStyle = {
      position: 'relative',
      overflow: 'hidden',
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      ...(!textVariant && {
        borderRadius: 0,
        clipPath,
        '&:hover': {
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0) scale(0.98)',
        },
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
      }),
      '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiLoadingButton-loadingIndicator': {
        position: 'relative',
        zIndex: 2,
      },
    };

    const defaultStyle = {
      ...(inheritColor && {
        // CONTAINED
        ...(containedVariant && {
          color: lightMode ? '#ffffff' : '#080a0e',
          backgroundColor: lightMode ? theme.palette.grey[800] : theme.palette.common.white,
          boxShadow: `0 0 16px ${alpha(theme.palette.common.white, 0.25)}`,
          '&:hover': {
            backgroundColor: lightMode ? theme.palette.grey[700] : '#ffffff',
            boxShadow: `0 0 24px ${alpha(theme.palette.common.white, 0.45)}`,
            filter: 'brightness(1.08)',
          },
        }),
        // OUTLINED
        ...(outlinedVariant && {
          backgroundColor: 'rgba(17, 24, 39, 0.75)',
          borderColor: alpha(theme.palette.grey[500], 0.32),
          color: '#ffffff',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`,
          },
        }),
        // TEXT
        ...(textVariant && {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette.text.primary,
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
          '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.24),
          },
        }),
      }),
      ...(outlinedVariant && {
        '&:hover': {
          borderColor: 'currentColor',
        },
      }),
    };

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        // CONTAINED
        ...(containedVariant && {
          color: '#080a0e !important',
          backgroundColor: theme.palette[color].main,
          boxShadow: `0 0 18px ${alpha(theme.palette[color].main, 0.45)}`,
          '&:hover': {
            backgroundColor: theme.palette[color].light,
            boxShadow: `0 0 28px ${alpha(theme.palette[color].main, 0.65)}`,
            filter: 'brightness(1.08)',
          },
        }),
        // OUTLINED
        ...(outlinedVariant && {
          backgroundColor: 'rgba(17, 24, 39, 0.75)',
          borderColor: alpha(theme.palette[color].main, 0.45),
          color: theme.palette[color].main,
          '&:hover': {
            backgroundColor: alpha(theme.palette[color].main, 0.18),
            borderColor: theme.palette[color].main,
            boxShadow: `0 0 20px ${alpha(theme.palette[color].main, 0.35)}`,
          },
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette[color][lightMode ? 'dark' : 'light'],
          backgroundColor: alpha(theme.palette[color].main, 0.16),
          border: `1px solid ${alpha(theme.palette[color].main, 0.28)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette[color].main, 0.28),
            borderColor: alpha(theme.palette[color].main, 0.55),
            boxShadow: `0 0 18px ${alpha(theme.palette[color].main, 0.35)}`,
          },
        }),
      }),
    }));

    const disabledState = {
      [`&.${buttonClasses.disabled}`]: {
        opacity: 0.45,
        transform: 'none !important',
        boxShadow: 'none !important',
        // SOFT
        ...(softVariant && {
          backgroundColor: theme.palette.action.disabledBackground,
        }),
      },
    };

    const size = {
      ...(smallSize && {
        height: 32,
        fontSize: 12.5,
        ...(textVariant
          ? { paddingLeft: 6, paddingRight: 6 }
          : { paddingLeft: 14, paddingRight: 14 }),
      }),
      ...(mediumSize && {
        height: 40,
        fontSize: 13.5,
        ...(textVariant
          ? { paddingLeft: 10, paddingRight: 10 }
          : { paddingLeft: 20, paddingRight: 20 }),
      }),
      ...(largeSize && {
        height: 48,
        fontSize: 15,
        ...(textVariant
          ? { paddingLeft: 14, paddingRight: 14 }
          : { paddingLeft: 26, paddingRight: 26 }),
      }),
    };

    return [baseTacticalStyle, defaultStyle, ...colorStyle, disabledState, size];
  };

  return {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: ButtonProps }) => rootStyles(ownerState),
      },
    },
  };
}
