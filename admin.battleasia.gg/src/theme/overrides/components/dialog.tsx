import { Theme } from '@mui/material/styles';
import { DialogProps } from '@mui/material/Dialog';

// ----------------------------------------------------------------------

export function dialog(theme: Theme) {
  return {
    MuiDialog: {
      styleOverrides: {
        paper: ({ ownerState }: { ownerState: DialogProps }) => ({
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 166, 35, 0.1)'
              : theme.customShadows.dialog,
          borderRadius: theme.shape.borderRadius * 2,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #131926 0%, #0F1420 100%)'
              : theme.palette.background.paper,
          border:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(245, 166, 35, 0.22)'
              : `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, transparent, rgba(245, 166, 35, 0.8), transparent)'
                : 'transparent',
            pointerEvents: 'none',
          },
          ...(!ownerState.fullScreen && {
            margin: theme.spacing(2),
          }),
        }),
        paperFullScreen: {
          borderRadius: 0,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: theme.palette.mode === 'dark' ? '#F5A623' : theme.palette.text.primary,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0, 3),
        },
        dividers: {
          borderTop: 0,
          borderBottomStyle: 'dashed',
          paddingBottom: theme.spacing(3),
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
          '& > :not(:first-of-type)': {
            marginLeft: theme.spacing(1.5),
          },
        },
      },
    },
  };
}
