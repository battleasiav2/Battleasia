import type { CSSObject } from '@mui/material/styles';

import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Tooltip from '@mui/material/Tooltip';
import { alpha, styled } from '@mui/material/styles';
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
        <ItemTexts {...ownerState} className={navSectionClasses.item.texts} sx={slotProps?.texts}>
          <ItemTitle {...ownerState} className={navSectionClasses.item.title} sx={slotProps?.title}>
            {title}
          </ItemTitle>

          {caption && (
            <Tooltip title={caption} placement="top-start">
              <ItemCaptionText
                {...ownerState}
                className={navSectionClasses.item.caption}
                sx={slotProps?.caption}
              >
                {caption}
              </ItemCaptionText>
            </Tooltip>
          )}
        </ItemTexts>
      )}

      {info && (
        <ItemInfo {...ownerState} className={navSectionClasses.item.info} sx={slotProps?.info}>
          {navItem.renderInfo}
        </ItemInfo>
      )}

      {hasChild && (
        <ItemArrow
          {...ownerState}
          icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
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
  const bulletSvg = `"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 0 14 14'%3E%3Cpath d='M1 1v4a8 8 0 0 0 8 8h4' stroke='%23efefef' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"`;

  const bulletStyles: CSSObject = {
    left: 0,
    content: '""',
    position: 'absolute',
    width: 'var(--nav-bullet-size)',
    height: 'var(--nav-bullet-size)',
    backgroundColor: 'var(--nav-bullet-light-color)',
    mask: `url(${bulletSvg}) no-repeat 50% 50%/100% auto`,
    WebkitMask: `url(${bulletSvg}) no-repeat 50% 50%/100% auto`,
    transform:
      theme.direction === 'rtl'
        ? 'translate(calc(var(--nav-bullet-size) * 1), calc(var(--nav-bullet-size) * -0.4)) scaleX(-1)'
        : 'translate(calc(var(--nav-bullet-size) * -1), calc(var(--nav-bullet-size) * -0.4))',
    ...theme.applyStyles('dark', {
      backgroundColor: 'var(--nav-bullet-dark-color)',
    }),
  };

  const rootItemStyles: CSSObject = {
    minHeight: 46,
    margin: '3px 0',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '7px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
      transform: 'translateX(4px)',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
    },
    ...(open && {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
    }),
    ...(active && {
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
    }),
  };

  const subItemStyles: CSSObject = {
    minHeight: 'var(--nav-item-sub-height)',
    margin: '2px 0 2px 6px',
    borderRadius: '6px',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
    '&::before': bulletStyles,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      transform: 'translateX(3px)',
      color: '#ffffff',
    },
    ...(open && {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    }),
    ...(active && {
      color: '#ffffff',
      fontWeight: 700,
      backgroundColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.12)',
      borderColor: 'rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35)',
      boxShadow: 'inset 0 0 10px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.08)',
      '&::before': {
        ...bulletStyles,
        backgroundColor: 'var(--ba-gold, #cbfb24)',
        boxShadow: '0 0 8px var(--ba-gold, #cbfb24)',
      },
    }),
  };

  return {
    width: '100%',
    paddingTop: '6px',
    paddingLeft: '10px',
    paddingRight: '12px',
    paddingBottom: '6px',
    borderRadius: '7px',
    color: 'var(--nav-item-color)',
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

/**
 * @slot texts
 */
const ItemTexts = styled('span', { shouldForwardProp })<StyledState>(() => ({
  ...navItemStyles.texts,
}));

/**
 * @slot title
 */
const ItemTitle = styled('span', { shouldForwardProp })<StyledState>(({ active, theme }) => ({
  ...navItemStyles.title(theme),
  fontSize: 13.5,
  fontWeight: active ? 800 : 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: active ? '#ffffff' : alpha('#ffffff', 0.82),
  textShadow: active ? '0 0 12px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.45)' : 'none',
  transition: 'all 0.2s ease',
}));

/**
 * @slot caption text
 */
const ItemCaptionText = styled('span', { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.captionText(theme),
  color: 'var(--nav-item-caption-color)',
}));

/**
 * @slot info
 */
const ItemInfo = styled('span', { shouldForwardProp })<StyledState>(() => ({
  ...navItemStyles.info,
}));

/**
 * @slot arrow
 */
const ItemArrow = styled(Iconify, { shouldForwardProp })<StyledState>(({ theme }) => ({
  ...navItemStyles.arrow(theme),
}));
