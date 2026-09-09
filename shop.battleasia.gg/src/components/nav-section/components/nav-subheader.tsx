import type { ListSubheaderProps } from '@mui/material/ListSubheader';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';

import { navSectionClasses } from '../styles';
import { Iconify, iconifyClasses } from '../../iconify';

// ----------------------------------------------------------------------

export type NavSubheaderProps = ListSubheaderProps & { open?: boolean };

export const NavSubheader = styled(({ open, children, className, ...other }: NavSubheaderProps) => (
  <ListSubheader
    disableSticky
    component="div"
    {...other}
    className={mergeClasses([navSectionClasses.subheader, className])}
  >
    <Box
      component="span"
      sx={{
        width: 5,
        height: 5,
        borderRadius: '1px',
        bgcolor: 'var(--ba-gold, #cbfb24)',
        boxShadow: '0 0 8px var(--ba-gold, #cbfb24)',
        mr: 0.5,
        display: 'inline-block',
      }}
    />
    <Iconify
      width={14}
      icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
    />
    {children}
  </ListSubheader>
))(({ theme }) => ({
  ...theme.typography.overline,
  cursor: 'pointer',
  alignItems: 'center',
  position: 'relative',
  gap: theme.spacing(0.75),
  display: 'inline-flex',
  alignSelf: 'flex-start',
  color: 'var(--ba-gold, #cbfb24)',
  padding: theme.spacing(2, 1, 0.75, 1.25),
  fontSize: 10.5,
  fontWeight: 900,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  opacity: 0.85,
  transition: theme.transitions.create(['color', 'padding-left', 'opacity'], {
    duration: theme.transitions.duration.standard,
  }),
  [`& .${iconifyClasses.root}`]: {
    left: -4,
    opacity: 0,
    position: 'absolute',
    transition: theme.transitions.create(['opacity'], {
      duration: theme.transitions.duration.standard,
    }),
  },
  '&:hover': {
    paddingLeft: theme.spacing(2),
    color: '#ffffff',
    opacity: 1,
    [`& .${iconifyClasses.root}`]: { opacity: 1 },
  },
}));
