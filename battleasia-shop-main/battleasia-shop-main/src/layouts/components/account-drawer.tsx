import type { IconButtonProps } from '@mui/material/IconButton';

import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import {
  Box, Link, Avatar, Drawer, MenuList, MenuItem, Collapse, Typography, IconButton, ListItemButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { getImageUrl } from 'src/utils/get-image-url';

import { useSelector } from 'src/store';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';
import { USER_COLORS, USER_IMAGES, userMeshButtonSx } from 'src/layouts/user/user-theme';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

import type { AccountMenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

export type AccountDrawerProps = IconButtonProps & {
  data?: AccountMenuItem[];
};

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();

  const storeUser = useSelector((state) => state.auth.user);

  const user = {
    displayName: storeUser?.username || storeUser?.email || '',
    email: storeUser?.email || '',
    photoURL: getImageUrl(storeUser?.avatar),
  };

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const menuItemSx = {
    p: 1,
    width: 1,
    display: 'flex',
    typography: 'body2',
    alignItems: 'center',
    color: alpha('#ffffff', 0.62),
    borderRadius: `${GLASS_CARD_RADIUS}px`,
    '& svg': { width: 24, height: 24 },
    '&:hover': {
      color: '#ffffff',
      bgcolor: alpha(GOLD, 0.1),
    },
  } as const;

  const renderAvatar = () => (
    <Avatar
      src={user?.photoURL}
      alt={user?.displayName}
      sx={{
        width: 84,
        height: 84,
        fontSize: 30,
        fontWeight: 800,
        color: GOLD,
        bgcolor: alpha('#000000', 0.65),
        border: `2px solid ${GOLD}`,
        boxShadow: `0 0 28px ${alpha(GOLD, 0.22)}`,
      }}
    >
      {user?.displayName?.charAt(0).toUpperCase()}
    </Avatar>
  );

  const renderList = () => (
    <MenuList
      disablePadding
      sx={{
        py: 2,
        px: 2,
        borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
        '& li': { p: 0, mb: 0.5 },
      }}
    >
      {data.map((option) => {
        const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';
        const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;
        const hasChildren = option.children && option.children.length > 0;
        const isExpanded = expandedItems.has(option.label);

        if (hasChildren) {
          return (
            <Box key={option.label}>
              <MenuItem>
                <ListItemButton
                  onClick={() => handleToggleExpand(option.label)}
                  sx={menuItemSx}
                >
                  {option.icon}

                  <Box component="span" sx={{ ml: 2, flexGrow: 1 }}>
                    {option.label === 'Home' ? rootLabel : option.label}
                  </Box>

                  <Iconify
                    icon={isExpanded ? 'iconamoon:arrow-down-2-light' : 'iconamoon:arrow-right-2-light'}
                    width={20}
                    sx={{ ml: 1 }}
                  />
                </ListItemButton>
              </MenuItem>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2 }}>
                  {option.children?.map((child) => (
                    <MenuItem key={child.label}>
                      <Link
                        component={RouterLink}
                        href={child.href || '#'}
                        color="inherit"
                        underline="none"
                        onClick={onClose}
                        sx={{ ...menuItemSx, '& svg': { width: 20, height: 20 } }}
                      >
                        {child.icon}

                        <Box component="span" sx={{ ml: 2 }}>
                          {child.label}
                        </Box>
                      </Link>
                    </MenuItem>
                  ))}
                </Box>
              </Collapse>
            </Box>
          );
        }

        return (
          <MenuItem key={option.label}>
            <Link
              component={RouterLink}
              href={option.label === 'Home' ? rootHref : option.href || '#'}
              color="inherit"
              underline="none"
              onClick={onClose}
              sx={menuItemSx}
            >
              {option.icon}

              <Box component="span" sx={{ ml: 2 }}>
                {option.label === 'Home' ? rootLabel : option.label}
              </Box>
            </Link>
          </MenuItem>
        );
      })}
    </MenuList>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={user?.photoURL || ""}
        displayName={user?.displayName}
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
              bgcolor: alpha('#000000', 0.55),
              backdropFilter: 'blur(4px)',
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: 'min(320px, 90vw)', sm: 340 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: alpha('#060608', 0.98),
            backgroundImage: `
              linear-gradient(180deg, ${alpha('#000000', 0.55)} 0%, ${alpha('#000000', 0.92)} 72%),
              url(${USER_IMAGES.pageBg})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            borderLeft: `1px solid ${alpha('#ffffff', 0.1)}`,
            boxShadow: `-12px 0 48px ${alpha('#000000', 0.65)}`,
          },
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close menu"
          sx={{
            top: 14,
            left: 14,
            zIndex: 9,
            position: 'absolute',
            width: 40,
            height: 40,
            color: alpha('#ffffff', 0.75),
            bgcolor: alpha('#ffffff', 0.06),
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            '&:hover': {
              bgcolor: alpha(GOLD, 0.12),
              borderColor: alpha(GOLD, 0.3),
              color: GOLD,
            },
          }}
        >
          <Iconify icon="mingcute:close-line" width={22} />
        </IconButton>

        <Scrollbar sx={{ flex: '1 1 auto' }}>
          <Box
            sx={{
              pt: 8,
              pb: 3,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {renderAvatar()}

            <Typography
              variant="subtitle1"
              noWrap
              className="font-tr"
              sx={{
                maxWidth: 1,
                fontWeight: 800,
                letterSpacing: 0.4,
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              {user?.displayName}
            </Typography>

            <Typography
              variant="body2"
              noWrap
              sx={{
                maxWidth: 1,
                color: alpha('#ffffff', 0.5),
                fontSize: 13,
              }}
            >
              {user?.email}
            </Typography>
          </Box>

          {renderList()}

          <Box sx={{ px: 2, py: 2 }}>
            <UpgradeBlock />
          </Box>
        </Scrollbar>

        <Box
          sx={{
            px: 2,
            py: 2,
            borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
            bgcolor: alpha('#000000', 0.35),
            backdropFilter: 'blur(8px)',
            mb: { xs: '72px', md: 0 },
          }}
        >
          <SignOutButton
            onClose={onClose}
            sx={{
              width: 1,
              height: 48,
              fontSize: 13,
              borderRadius: `${GLASS_CARD_RADIUS}px`,
              ...userMeshButtonSx,
            }}
          />
        </Box>
      </Drawer>
    </>
  );
}
