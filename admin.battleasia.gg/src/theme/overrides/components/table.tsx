import { Theme, alpha } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { tableRowClasses } from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export function table(theme: Theme) {
  return {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          position: 'relative',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.shortest,
          }),
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(245, 166, 35, 0.06)'
                : alpha(theme.palette.primary.main, 0.04),
          },
          [`&.${tableRowClasses.selected}`]: {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(245, 166, 35, 0.12)'
                : alpha(theme.palette.primary.dark, 0.04),
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(245, 166, 35, 0.18)'
                  : alpha(theme.palette.primary.dark, 0.08),
            },
          },
          '&:last-of-type': {
            [`& .${tableCellClasses.root}`]: {
              borderColor: 'transparent',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : `1px dashed ${theme.palette.divider}`,
        },
        head: {
          fontSize: 13,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: theme.palette.mode === 'dark' ? '#F5A623' : theme.palette.text.secondary,
          fontWeight: 700,
          backgroundColor:
            theme.palette.mode === 'dark' ? '#0D121D' : theme.palette.background.neutral,
          borderBottom:
            theme.palette.mode === 'dark'
              ? '2px solid rgba(245, 166, 35, 0.25)'
              : `1px solid ${theme.palette.divider}`,
        },
        stickyHeader: {
          backgroundColor: theme.palette.background.paper,
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.neutral} 0%, ${theme.palette.background.neutral} 100%)`,
        },
        paddingCheckbox: {
          paddingLeft: theme.spacing(1),
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          width: '100%',
        },
        toolbar: {
          height: 64,
        },
        actions: {
          marginRight: 8,
        },
        select: {
          paddingLeft: 8,
          '&:focus': {
            borderRadius: theme.shape.borderRadius,
          },
        },
        selectIcon: {
          right: 4,
          width: 16,
          height: 16,
          top: 'calc(50% - 8px)',
        },
      },
    },
  };
}
