// @mui
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
//
import { NavItemProps, NavConfigProps } from '../types';

// ----------------------------------------------------------------------

type StyledItemProps = Omit<NavItemProps, 'item'> & {
  config: NavConfigProps;
};

export const StyledItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledItemProps>(({ active, depth, config, theme }) => {
  const subItem = depth !== 1;
  const deepSubItem = depth > 2;

  const activeStyles = {
    root: {
      color: '#ffffff',
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.14)',
      backgroundImage: 'linear-gradient(90deg, rgba(var(--ba-gold-rgb, 203, 251, 36), 0.22) 0%, rgba(var(--ba-gold-rgb, 203, 251, 36), 0.04) 100%)',
      borderColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.5)',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45), inset 0 0 16px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.08)',
      fontWeight: 800,
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '3.5px',
        backgroundColor: 'var(--ba-gold, #cbfb24)',
        boxShadow: '0 0 10px var(--ba-gold, #cbfb24)',
      },
      '&:hover': {
        backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.2)',
        borderColor: 'var(--ba-gold, #cbfb24)',
        transform: 'translateX(4px)',
      },
    },
    sub: {
      color: '#ffffff',
      fontWeight: 700,
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.12)',
      borderColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35)',
      boxShadow: 'inset 0 0 10px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.08)',
      '&:hover': {
        backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.18)',
      },
    },
  };

  return {
    // Root item
    padding: '6px 12px',
    margin: '3px 8px',
    borderRadius: '7px',
    minHeight: 46,
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    color: alpha('#ffffff', 0.8),
    transition: theme.transitions.create(['transform', 'background-color', 'color', 'border-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      transform: 'translateX(4px)',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
    },

    // Active root item
    ...(active && {
      ...activeStyles.root,
    }),

    // Sub item
    ...(subItem && {
      minHeight: config.itemSubHeight,
      margin: '2px 8px 2px 14px',
      borderRadius: '6px',
      // Active sub item
      ...(active && {
        ...activeStyles.sub,
      }),
    }),

    // Deep sub item
    ...(deepSubItem && {
      paddingLeft: theme.spacing(depth),
    }),
  };
});

// ----------------------------------------------------------------------

type StyledIconProps = {
  size?: number;
  active?: boolean;
};

export const StyledIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledIconProps>(({ size, active }) => ({
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
  flexShrink: 0,
  backgroundColor: active ? 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.2)' : 'rgba(255, 255, 255, 0.05)',
  border: active ? '1px solid rgba(var(--ba-gold-rgb, 203, 251, 36), 0.65)' : '1px solid rgba(255, 255, 255, 0.12)',
  color: active ? 'var(--ba-gold, #cbfb24)' : 'rgba(255, 255, 255, 0.75)',
  boxShadow: active ? '0 0 14px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35)' : '0 2px 6px rgba(0,0,0,0.3)',
  transition: 'all 0.22s ease',
  '& svg': {
    width: 20,
    height: 20,
  },
}));

type StyledDotIconProps = {
  active?: boolean;
};

export const StyledDotIcon = styled('span')<StyledDotIconProps>(({ active, theme }) => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  backgroundColor: theme.palette.text.disabled,
  transition: theme.transitions.create(['transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  ...(active && {
    transform: 'scale(1.8)',
    backgroundColor: 'var(--ba-gold, #cbfb24)',
    boxShadow: '0 0 8px var(--ba-gold, #cbfb24)',
  }),
}));

// ----------------------------------------------------------------------

type StyledSubheaderProps = {
  config: NavConfigProps;
};

export const StyledSubheader = styled(ListSubheader)<StyledSubheaderProps>(({ config, theme }) => ({
  ...theme.typography.overline,
  fontSize: 10.5,
  fontWeight: 900,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: config.itemPadding,
  paddingTop: theme.spacing(2.5),
  marginBottom: config.itemGap,
  paddingBottom: theme.spacing(0.75),
  color: 'var(--ba-gold, #cbfb24)',
  opacity: 0.85,
  transition: theme.transitions.create(['color', 'opacity', 'padding-left'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&::before': {
    content: '""',
    display: 'inline-block',
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: 'var(--ba-gold, #cbfb24)',
    boxShadow: '0 0 8px var(--ba-gold, #cbfb24)',
  },
  '&:hover': {
    color: '#ffffff',
    opacity: 1,
    paddingLeft: theme.spacing(2),
  },
}));
