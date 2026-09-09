import type { CSSObject } from '@mui/material/styles';

import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { Iconify } from '../../iconify';
import { createNavItem } from '../utils';
import { navItemStyles, navSectionClasses } from '../styles';

import type { NavItemProps } from '../types';

// ----------------------------------------------------------------------

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>((props, ref) => {
  const {
    path,
    icon,
    info,
    title,
    caption,
    /********/
    open,
    active,
    disabled,
    /********/
    depth,
    render,
    hasChild,
    slotProps,
    className,
    externalLink,
    enabledRootRedirect,
    ...other
  } = props;

  const navItem = createNavItem({
    path,
    icon,
    info,
    depth,
    render,
    hasChild,
    externalLink,
    enabledRootRedirect,
  });

  const ownerState: StyledState = {
    open,
    active,
    disabled,
    variant: navItem.rootItem ? 'rootItem' : 'subItem',
  };

  return (
    <ItemRoot
      ref={ref}
      aria-label={title}
      {...ownerState}
      {...navItem.baseProps}
      className={mergeClasses([navSectionClasses.item.root, className], {
        [navSectionClasses.state.open]: open,
        [navSectionClasses.state.active]: active,
        [navSectionClasses.state.disabled]: disabled,
      })}
      sx={slotProps?.sx}
      {...other}
    >
      {icon && (
        <ItemIcon {...ownerState} className={navSectionClasses.item.icon} sx={slotProps?.icon}>
          {navItem.renderIcon}
        </ItemIcon>
      )}

      {title && (
        <ItemTitle {...ownerState} className={navSectionClasses.item.title} sx={slotProps?.title}>
          {title}
        </ItemTitle>
      )}

      {caption && (
        <Tooltip title={caption} arrow placement="right">
          <ItemCaptionIcon
            {...ownerState}
            icon="eva:info-outline"
            className={navSectionClasses.item.caption}
            sx={slotProps?.caption}
          />
        </Tooltip>
      )}

      {info && navItem.subItem && (
        <ItemInfo {...ownerState} className={navSectionClasses.item.info} sx={slotProps?.info}>
          {navItem.renderInfo}
        </ItemInfo>
      )}

      {hasChild && (
        <ItemArrow
          {...ownerState}
          icon="eva:arrow-ios-forward-fill"
          className={navSectionClasses.item.arrow}
          sx={slotProps?.arrow}
        />
      )}
    </ItemRoot>
  );
});

// ----------------------------------------------------------------------

type StyledState = Pick<NavItemProps, 'open' | 'active' | 'disabled'> & {
  variant: 'rootItem' | 'subItem';
};

const shouldForwardProp = (prop: string) =>
  !['open', 'active', 'disabled', 'variant', 'sx'].includes(prop);

/**
 * @slot root
 */
const ItemRoot = styled(ButtonBase, { shouldForwardProp })<StyledState>(({
  active,
  open,
  theme,
}) => {
  const rootItemStyles: CSSObject = {
    textAlign: 'center',
    flexDirection: 'column',
    minHeight: 56,
    padding: '8px 4px',
    margin: '3px 0',
    borderRadius: '7px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
    },
    ...(open && {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
    }),
    ...(active && {
      color: '#ffffff',
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.18)',
      borderColor: 'var(--ba-gold, #cbfb24)',
      boxShadow: '0 0 14px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35), inset 0 0 10px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.1)',
      '&:hover': {
        backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.24)',
        borderColor: 'var(--ba-gold, #cbfb24)',
      },
    }),
  };

  const subItemStyles: CSSObject = {
    minHeight: 'var(--nav-item-sub-height)',
    padding: 'var(--nav-item-sub-padding)',
    color: theme.vars.palette.text.secondary,
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    ...(open && {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    }),
    ...(active && {
      color: '#ffffff',
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.14)',
      borderColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.4)',
    }),
  };

  return {
    width: '100%',
    color: 'var(--nav-item-color)',
    borderRadius: 'var(--nav-item-radius)',
    variants: [
      { props: { variant: 'rootItem' }, style: rootItemStyles },
      { props: { variant: 'subItem' }, style: subItemStyles },
      { props: { disabled: true }, style: navItemStyles.disabled },
    ],
  };
});

/**
 * @slot icon
 */
const ItemIcon = styled('span', { shouldForwardProp })<StyledState>(({ active }) => ({
  ...navItemStyles.icon,
  width: 22,
  height: 22,
  margin: 'var(--nav-icon-root-margin)',
  color: active ? 'var(--ba-gold, #cbfb24)' : 'rgba(255, 255, 255, 0.8)',
  variants: [{ props: { variant: 'subItem' }, style: { margin: 'var(--nav-icon-sub-margin)' } }],
}));

/**
 * @slot title
 */
const ItemTitle = styled('span', { shouldForwardProp })<StyledState>(({ active, theme }) => ({
  ...navItemStyles.title(theme),
  lineHeight: '14px',
  fontSize: 10,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: active ? 800 : 600,
  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
  variants: [
    {
      props: { variant: 'rootItem' },
      style: { ...(active && { fontWeight: 800, textShadow: '0 0 8px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.4)' }) },
    },
    {
      props: { variant: 'subItem' },
      style: {
        ...theme.typography.body2,
        fontWeight: theme.typography.fontWeightMedium,
        ...(active && { fontWeight: theme.typography.fontWeightSemiBold }),
      },
    },
  ],
}));

/**
 * @slot caption icon
 */
const ItemCaptionIcon = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.captionIcon,
  color: 'var(--nav-item-caption-color)',
  variants: [{ props: { variant: 'rootItem' }, style: { top: 11, left: 6, position: 'absolute' } }],
}));

/**
 * @slot info
 */
const ItemInfo = styled('span', { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.info,
}));

/**
 * @slot arrow
 */
const ItemArrow = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.arrow(theme),
  variants: [
    {
      props: { variant: 'rootItem' },
      style: {
        margin: 0,
        top: 11,
        right: 6,
        position: 'absolute',
      },
    },
    { props: { variant: 'subItem' }, style: { marginRight: theme.spacing(-0.5) } },
  ],
}));
