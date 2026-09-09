import type { ButtonProps } from '@mui/material/Button';
import type { Theme, CSSObject, Components, ComponentsVariants } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import { buttonClasses } from '@mui/material/Button';
import { loadingButtonClasses } from '@mui/lab/LoadingButton';

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../../extend-theme-types.d.ts}
 */

export type ButtonExtendVariant = {
  soft: true;
};

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

type PaletteColor = (typeof COLORS)[number];

// ----------------------------------------------------------------------

function styleColors(ownerState: ButtonProps, styles: (val: PaletteColor) => CSSObject) {
  const outputStyle = COLORS.reduce((acc, color) => {
    if (!ownerState.disabled && ownerState.color === color) {
      acc = styles(color);
    }
    return acc;
  }, {});

  return outputStyle;
}

// ----------------------------------------------------------------------

const MuiButtonBase: Components<Theme>['MuiButtonBase'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: ({ theme }) => ({ fontFamily: theme.typography.fontFamily }) },
};

// ----------------------------------------------------------------------

const softVariant: ComponentsVariants<Theme>['MuiButton'] = [
  {
    props: ({ ownerState }) => ownerState.variant === 'soft',
    style: ({ theme }) => ({
      backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
      '&:hover': { backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.24) },
      [`&.${buttonClasses.disabled}`]: {
        backgroundColor: theme.vars.palette.action.disabledBackground,
      },
      [`& .${loadingButtonClasses.loadingIndicatorStart}`]: { left: 14 },
      [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: { right: 14 },
      [`&.${buttonClasses.sizeSmall}`]: {
        [`& .${loadingButtonClasses.loadingIndicatorStart}`]: { left: 10 },
        [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: { right: 10 },
      },
    }),
  },
  ...COLORS.map((color) => ({
    props: ({ ownerState }: { ownerState: ButtonProps }) =>
      !ownerState.disabled && ownerState.variant === 'soft' && ownerState.color === color,
    style: ({ theme }: { theme: Theme }) => ({
      color: theme.vars.palette[color].dark,
      backgroundColor: varAlpha(theme.vars.palette[color].mainChannel, 0.16),
      border: `1px solid ${varAlpha(theme.vars.palette[color].mainChannel, 0.28)}`,
      '&:hover': {
        backgroundColor: varAlpha(theme.vars.palette[color].mainChannel, 0.28),
        borderColor: varAlpha(theme.vars.palette[color].mainChannel, 0.55),
        boxShadow: `0 0 18px ${varAlpha(theme.vars.palette[color].mainChannel, 0.35)}`,
      },
      ...theme.applyStyles('dark', {
        color: theme.vars.palette[color].light,
      }),
    }),
  })),
];

const MuiButton: Components<Theme>['MuiButton'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { color: 'inherit', disableElevation: true },

  variants: softVariant,

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ ownerState }) => {
      const isText = ownerState.variant === 'text';

      return {
        position: 'relative',
        overflow: 'hidden',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        ...(!isText && {
          borderRadius: 0,
          clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
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
    },
    /**
     * @variant contained
     */
    contained: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          '&:hover': {
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 0 24px ${varAlpha(theme.vars.palette[color].mainChannel, 0.6)}`
                : theme.vars.customShadows[color],
            filter: 'brightness(1.08)',
          },
        })),
        inheritColor: {
          ...(ownerState.color === 'inherit' &&
            !ownerState.disabled && {
              color: theme.vars.palette.common.white,
              backgroundColor: theme.vars.palette.grey[800],
              '&:hover': {
                boxShadow: theme.vars.customShadows.z8,
                backgroundColor: theme.vars.palette.grey[700],
              },
              ...theme.applyStyles('dark', {
                color: '#080a0e',
                backgroundColor: theme.vars.palette.common.white,
                '&:hover': {
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 24px rgba(255, 255, 255, 0.45)',
                  filter: 'brightness(1.08)',
                },
              }),
            }),
        },
      };
      return { ...styled.inheritColor, ...styled.colors };
    },
    /**
     * @variant outlined
     */
    outlined: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          backgroundColor: 'rgba(17, 24, 39, 0.75)',
          borderColor: varAlpha(theme.vars.palette[color].mainChannel, 0.45),
          color: theme.vars.palette[color].main,
          '&:hover': {
            backgroundColor: varAlpha(theme.vars.palette[color].mainChannel, 0.18),
            borderColor: theme.vars.palette[color].main,
            boxShadow: `0 0 20px ${varAlpha(theme.vars.palette[color].mainChannel, 0.35)}`,
          },
        })),
        inheritColor: {
          ...(ownerState.color === 'inherit' &&
            !ownerState.disabled && {
              backgroundColor: 'rgba(17, 24, 39, 0.75)',
              borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
              color: '#ffffff',
              '&:hover': {
                backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.18),
                borderColor: theme.vars.palette.common.white,
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.25)',
              },
            }),
        },
        base: {
          '&:hover': { borderColor: 'currentColor' },
        },
      };
      return { ...styled.base, ...styled.inheritColor, ...styled.colors };
    },
    /**
     * @variant text
     */
    text: ({ ownerState, theme }) => {
      const styled = {
        inheritColor: {
          ...(ownerState.color === 'inherit' &&
            !ownerState.disabled && {
              '&:hover': { backgroundColor: theme.vars.palette.action.hover },
            }),
        },
      };
      return { ...styled.inheritColor };
    },
    /**
     * @sizes
     */
    sizeSmall: ({ ownerState }) => ({
      height: 32,
      fontSize: '0.8rem',
      ...(ownerState.variant !== 'text' && {
        clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
      }),
      ...(ownerState.variant === 'text'
        ? { paddingLeft: '6px', paddingRight: '6px' }
        : { paddingLeft: '14px', paddingRight: '14px' }),
    }),
    sizeMedium: ({ ownerState }) => ({
      height: 40,
      fontSize: '0.875rem',
      ...(ownerState.variant !== 'text' && {
        clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
      }),
      ...(ownerState.variant === 'text'
        ? { paddingLeft: '10px', paddingRight: '10px' }
        : { paddingLeft: '20px', paddingRight: '20px' }),
    }),
    sizeLarge: ({ ownerState }) => ({
      height: 48,
      fontSize: '0.95rem',
      ...(ownerState.variant !== 'text' && {
        clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)',
      }),
      ...(ownerState.variant === 'text'
        ? { paddingLeft: '14px', paddingRight: '14px' }
        : { paddingLeft: '26px', paddingRight: '26px' }),
    }),
  },
};

// ----------------------------------------------------------------------

export const button = { MuiButtonBase, MuiButton };
