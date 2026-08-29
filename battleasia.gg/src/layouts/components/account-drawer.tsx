import type { IconButtonProps } from '@mui/material/IconButton';

import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import {
  Box,
  Stack,
  Drawer,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { getImageUrl } from 'src/utils/get-image-url';
import { startAppDownload } from 'src/utils/app-download-url';

import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { USER_COLORS } from 'src/layouts/user/user-theme';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';
import { NavApkBanner } from './nav-apk-banner';

import type { AccountMenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const DRAWER_PAPER_SX = {
  width: { xs: 'min(360px, 88vw)', sm: 400 },
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, #0c0c0e 0%, #000000 100%)',
  borderLeft: `1px solid ${alpha(GOLD, 0.12)}`,
  boxShadow: `-12px 0 48px ${alpha('#000000', 0.6)}, inset 1px 0 0 ${alpha(GOLD, 0.08)}`,
} as const;

const HAIRLINE_BORDER = `1px solid ${alpha(GOLD, 0.1)}`;

export type AccountDrawerProps = IconButtonProps & {
  data?: AccountMenuItem[];
};

function isMenuItemActive(pathname: string, option: AccountMenuItem): boolean {
  if (option.href && pathname.startsWith(option.href)) {
    return true;
  }

  return !!option.children?.some((child) => child.href && pathname.startsWith(child.href));
}

type DrawerLinkProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  nested?: boolean;
  downloadFileName?: string;
};

function DrawerLink({
  label,
  href,
  onClick,
  isActive = false,
  nested = false,
  downloadFileName,
}: DrawerLinkProps) {
  const labelSx = {
    flex: 1,
    fontSize: nested ? { xs: 16, md: 17 } : { xs: 20, md: 22 },
    fontWeight: isActive ? 600 : 500,
    lineHeight: 1.25,
    color: isActive ? '#ffffff' : alpha('#ffffff', 0.55),
    transition: 'color 0.2s ease',
  };

  const rowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    width: 1,
    py: nested ? { xs: 0.85, md: 1 } : { xs: 1, md: 1.15 },
    pl: nested ? 2 : 0,
    pr: 1,
    borderBottom: HAIRLINE_BORDER,
    textDecoration: 'none',
    cursor: onClick || href ? 'pointer' : 'default',
    transition: 'opacity 0.2s ease',
    '&:hover .drawer-link-label': {
      color: '#ffffff',
    },
  };

  const dotSx = {
    width: 5,
    height: 5,
    borderRadius: '50%',
    flexShrink: 0,
    bgcolor: isActive ? GOLD : 'transparent',
    transition: 'background-color 0.2s ease',
  };

  const labelNode = (
    <Typography component="span" className="drawer-link-label" sx={labelSx}>
      {label}
    </Typography>
  );

  const content = (
    <>
      <Box sx={dotSx} />
      {labelNode}
    </>
  );

  if (href && downloadFileName) {
    return (
      <Box
        component="a"
        href={href}
        download={downloadFileName}
        onClick={(event) => {
          event.preventDefault();
          startAppDownload(href, downloadFileName);
        }}
        sx={rowSx}
      >
        {content}
      </Box>
    );
  }

  if (href) {
    return (
      <Box component={RouterLink} href={href} sx={rowSx}>
        {content}
      </Box>
    );
  }

  return (
    <Box onClick={onClick} sx={rowSx}>
      {content}
    </Box>
  );
}

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();
  const { t } = useTranslate();

  const storeUser = useSelector((state) => state.auth.user);

  const user = {
    displayName: storeUser?.username || storeUser?.email || '',
    email: storeUser?.email || '',
    photoURL: getImageUrl(storeUser?.avatar),
  };

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggleExpand = (labelKey: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(labelKey)) {
        newSet.delete(labelKey);
      } else {
        newSet.add(labelKey);
      }
      return newSet;
    });
  };

  const renderList = () => (
    <Stack spacing={0} sx={{ px: { xs: 3, sm: 4 }, pt: 1, pb: 2 }}>
      {data.map((option) => {
        const translatedLabel = t(option.labelKey);
        const rootLabel = pathname.includes('/dashboard') ? t('navigation.home') : 'Dashboard';
        const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;
        const hasChildren = option.children && option.children.length > 0;
        const isExpanded = expandedItems.has(option.labelKey);
        const isHome = option.labelKey === 'navigation.home';
        const isActive = isMenuItemActive(pathname, option);

        if (hasChildren) {
          return (
            <Box key={option.labelKey}>
              <DrawerLink
                label={isHome ? rootLabel : translatedLabel}
                isActive={isActive && !isExpanded}
                onClick={() => handleToggleExpand(option.labelKey)}
              />

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Stack spacing={0} sx={{ pb: 0.5 }}>
                  {option.children?.map((child) => {
                    const childActive = !!(child.href && pathname.startsWith(child.href));

                    return (
                      <Box key={child.labelKey} onClick={onClose}>
                        <DrawerLink
                          label={t(child.labelKey)}
                          href={child.href || '#'}
                          isActive={childActive}
                          nested
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Collapse>
            </Box>
          );
        }

        return (
          <Box key={option.labelKey} onClick={onClose}>
            <DrawerLink
              label={isHome ? rootLabel : translatedLabel}
              href={isHome ? rootHref : option.href || '#'}
              isActive={isActive}
            />
          </Box>
        );
      })}

      <Box sx={{ pt: 2 }}>
        <NavApkBanner onNavigate={onClose} />
      </Box>
    </Stack>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={user.photoURL || ''}
        displayName={user.displayName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: alpha('#000000', 0.72),
            },
          },
        }}
        PaperProps={{
          sx: DRAWER_PAPER_SX,
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close menu"
          sx={{
            top: 20,
            right: 20,
            zIndex: 9,
            position: 'absolute',
            width: 36,
            height: 36,
            p: 0,
            color: alpha('#ffffff', 0.88),
            '&:hover': {
              bgcolor: 'transparent',
              color: '#ffffff',
            },
          }}
        >
          <Iconify icon="mingcute:close-line" width={26} />
        </IconButton>

        <Scrollbar sx={{ flex: '1 1 auto' }}>
          <Stack spacing={0} sx={{ pt: { xs: 9, md: 10 }, pb: 2 }}>
            {user.displayName ? (
              <Typography
                noWrap
                sx={{
                  px: { xs: 3, sm: 4 },
                  pb: 2,
                  fontSize: 13,
                  fontWeight: 500,
                  color: alpha('#ffffff', 0.42),
                  letterSpacing: 0.04,
                }}
              >
                {user.displayName}
              </Typography>
            ) : null}
            {renderList()}
          </Stack>
        </Scrollbar>

        <Box
          sx={{
            px: { xs: 3, sm: 4 },
            py: 2.5,
            mt: 'auto',
            mb: { xs: '72px', md: 0 },
          }}
        >
          <SignOutButton
            onClose={onClose}
            variant="text"
            sx={{
              justifyContent: 'flex-start',
              px: 0,
              minWidth: 0,
              height: 'auto',
              fontSize: { xs: 16, md: 17 },
              fontWeight: 500,
              color: alpha('#ffffff', 0.55),
              textTransform: 'none',
              border: 'none',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'transparent',
                color: alpha('#ffffff', 0.88),
              },
            }}
          />
        </Box>
      </Drawer>
    </>
  );
}
