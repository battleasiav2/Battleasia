import { Theme, alpha } from '@mui/material/styles';
import { listClasses } from '@mui/material/List';
import { paperClasses } from '@mui/material/Paper';
import { buttonClasses } from '@mui/material/Button';
import { listItemIconClasses } from '@mui/material/ListItemIcon';
import { tablePaginationClasses } from '@mui/material/TablePagination';
//
import { paper } from '../../css';

// ----------------------------------------------------------------------

export function dataGrid(theme: Theme) {
  const paperStyles = paper({ theme, dropdown: true });

  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          borderWidth: 0,
          [`& .${tablePaginationClasses.root}`]: {
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245, 166, 35, 0.12)' : theme.palette.divider}`,
          },
          [`& .${tablePaginationClasses.toolbar}`]: {
            height: 'auto',
          },
          '& .MuiDataGrid-row': {
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.shortest,
            }),
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(245, 166, 35, 0.07)'
                  : alpha(theme.palette.primary.main, 0.04),
            },
            '&.Mui-selected': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(245, 166, 35, 0.12)'
                  : alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(245, 166, 35, 0.18)'
                    : alpha(theme.palette.primary.main, 0.12),
              },
            },
          },
        },
        cell: {
          borderBottom:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : `1px dashed ${theme.palette.divider}`,
        },
        selectedRowCount: {
          whiteSpace: 'nowrap',
          color: theme.palette.primary.main,
          fontWeight: 600,
        },
        columnSeparator: {
          color:
            theme.palette.mode === 'dark'
              ? 'rgba(245, 166, 35, 0.15)'
              : theme.palette.divider,
        },
        toolbarContainer: {
          padding: theme.spacing(2),
          borderBottom:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(245, 166, 35, 0.12)'
              : `1px dashed ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? '#0F1523' : theme.palette.background.neutral,
        },
        paper: {
          ...paperStyles,
          padding: 0,
        },
        menu: {
          [`& .${paperClasses.root}`]: {
            ...paperStyles,
          },
          [`& .${listClasses.root}`]: {
            padding: 0,
            [`& .${listItemIconClasses.root}`]: {
              minWidth: 0,
              marginRight: theme.spacing(2),
            },
          },
        },
        columnHeaders: {
          borderRadius: 0,
          backgroundColor:
            theme.palette.mode === 'dark' ? '#0D121D' : theme.palette.background.neutral,
          borderBottom:
            theme.palette.mode === 'dark'
              ? '2px solid rgba(245, 166, 35, 0.25)'
              : `1px solid ${theme.palette.divider}`,
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            color: theme.palette.mode === 'dark' ? '#F5A623' : theme.palette.text.primary,
          },
        },
        panelHeader: {
          padding: theme.spacing(2),
        },
        panelFooter: {
          padding: theme.spacing(2),
          justifyContent: 'flex-end',
          borderTop: `dashed 1px ${theme.palette.divider}`,
          [`& .${buttonClasses.root}`]: {
            '&:first-of-type': {
              border: `solid 1px ${alpha(theme.palette.grey[500], 0.24)}`,
            },
            '&:last-of-type': {
              marginLeft: theme.spacing(1.5),
              color: theme.palette.background.paper,
              backgroundColor: theme.palette.text.primary,
            },
          },
        },
        filterForm: {
          padding: theme.spacing(2),
        },
        filterFormValueInput: {
          marginLeft: theme.spacing(2),
        },
        filterFormColumnInput: {
          marginLeft: theme.spacing(2),
        },
        filterFormOperatorInput: {
          marginLeft: theme.spacing(2),
        },
      },
    },
  };
}
