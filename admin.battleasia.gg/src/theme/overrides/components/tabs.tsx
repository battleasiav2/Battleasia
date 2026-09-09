import { Theme } from '@mui/material/styles';
import { tabClasses } from '@mui/material/Tab';

// ----------------------------------------------------------------------

export function tabs(theme: Theme) {
  return {
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor:
            theme.palette.mode === 'dark' ? '#F5A623' : theme.palette.primary.main,
          height: 3,
          borderRadius: '3px 3px 0 0',
          boxShadow:
            theme.palette.mode === 'dark' ? '0 0 12px rgba(245, 166, 35, 0.8)' : 'none',
        },
        scrollButtons: {
          width: 48,
          borderRadius: '50%',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 0,
          opacity: 1,
          minWidth: 48,
          minHeight: 48,
          fontWeight: 700,
          letterSpacing: '0.02em',
          transition: theme.transitions.create(['color'], {
            duration: theme.transitions.duration.shortest,
          }),
          '&:not(:last-of-type)': {
            marginRight: theme.spacing(3),
            [theme.breakpoints.up('sm')]: {
              marginRight: theme.spacing(5),
            },
          },
          [`&.${tabClasses.selected}`]: {
            color: theme.palette.mode === 'dark' ? '#F5A623' : theme.palette.primary.main,
          },
          [`&:not(.${tabClasses.selected})`]: {
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary,
            },
          },
        },
      },
    },
  };
}
