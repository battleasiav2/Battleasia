import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function card(theme: Theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
              : theme.customShadows.card,
          borderRadius: theme.shape.borderRadius * 2,
          zIndex: 0, // Fix Safari overflow: hidden with border radius
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #131A2A 0%, #0F1420 100%)'
              : theme.palette.background.paper,
          border:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(245, 166, 35, 0.12)'
              : `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '5%',
            right: '5%',
            height: '1px',
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, transparent, rgba(245, 166, 35, 0.35), transparent)'
                : 'transparent',
            pointerEvents: 'none',
            zIndex: 1,
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },
  };
}
