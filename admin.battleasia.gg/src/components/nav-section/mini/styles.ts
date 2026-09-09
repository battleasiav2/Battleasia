// @mui
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
//
import { NavItemProps, NavConfigProps } from '../types';

// ----------------------------------------------------------------------

type StyledItemProps = Omit<NavItemProps, 'item'> & {
  config: NavConfigProps;
};

export const StyledItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledItemProps>(({ active, open, depth, config, theme }) => {
  const subItem = depth !== 1;

  const activeStyles = {
    root: {
      color: '#ffffff',
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.18)',
      borderColor: 'var(--ba-gold, #cbfb24)',
      boxShadow: '0 0 14px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35), inset 0 0 10px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.1)',
      '&:hover': {
        backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.24)',
        borderColor: 'var(--ba-gold, #cbfb24)',
      },
    },
    sub: {
      color: '#ffffff',
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.14)',
      borderColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.4)',
      '&:hover': {
        backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.2)',
      },
    },
  };

  return {
    // Root item
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: '7px',
    minHeight: 56,
    padding: '8px 4px',
    margin: '3px 4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: alpha('#ffffff', 0.75),
    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
    },

    // Active root item
    ...(active && {
      ...activeStyles.root,
    }),

    // Sub item
    ...(subItem && {
      margin: 0,
      flexDirection: 'row',
      padding: theme.spacing(0, 1),
      minHeight: config.itemSubHeight,
      // Active sub item
      ...(active && {
        ...activeStyles.sub,
      }),
    }),

    // Open
    ...(open &&
      !active && {
        color: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.18)',
      }),
  };
});

// ----------------------------------------------------------------------

type StyledIconProps = {
  size?: number;
};

export const StyledIcon = styled(ListItemIcon)<StyledIconProps>(({ size }) => ({
  width: size,
  height: size,
  marginRight: 0,
}));
