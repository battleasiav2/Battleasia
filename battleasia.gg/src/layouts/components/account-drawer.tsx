import type { IconButtonProps } from '@mui/material/IconButton';

import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import {
  Box,
  Stack,
  Avatar,
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

import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { Scrollbar } from 'src/components/scrollbar';
import { GLASS_CARD_RADIUS, getGoldTopLineCardSx, mergeGlassSx } from 'src/components/battle-glass-card';
import {
  USER_COLORS,
  USER_IMAGES,
} from 'src/layouts/user/user-theme';
import { UserColorModeToggle } from 'src/layouts/user/user-color-mode-toggle';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';
import { NavApkBanner } from './nav-apk-banner';

import type { AccountMenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

export type AccountDrawerProps = IconButtonProps & {
  data?: AccountMenuItem[];
};

function isMenuItemActive(pathname: string, option: AccountMenuItem): boolean {
  if (option.href && pathname.startsWith(option.href)) {
    return true;
  }

  return !!option.children?.some((child) => child.href && pathname.startsWith(child.href));
}

type MenuCardProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  showChevron?: boolean;
  chevronDown?: boolean;
  nested?: boolean;
  downloadFileName?: string;
};

function MenuCard({
  label,
  icon,
  href,
  onClick,
  isActive = false,
  showChevron = false,
  chevronDown = false,
  nested = false,
  downloadFileName,
}: MenuCardProps) {
  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'inherit',
          '& svg': {
            width: nested ? 18 : 20,
            height: nested ? 18 : 20,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          flex: 1,
          fontSize: nested ? 13 : 14,
          fontWeight: isActive ? 700 : 600,
          letterSpacing: 0.02,
          color: 'inherit',
        }}
      >
        {label}
      </Typography>

      {showChevron && (
        <Iconify
          icon={chevronDown ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          width={18}
          sx={{ color: 'var(--ba-fg-40)', flexShrink: 0 }}
        />
      )}
    </>
  );

  const cardSx = mergeGlassSx(
    getGoldTopLineCardSx({
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      px: nested ? 1.5 : 1.75,
      py: nested ? 1 : 1.125,
      pt: nested ? 1.2 : 1.35,
      minHeight: nested ? 44 : 48,
      borderRadius: `${GLASS_CARD_RADIUS}px`,
      textDecoration: 'none',
      cursor: 'pointer',
      color: isActive ? GOLD : 'var(--ba-fg-72)',
      bgcolor: isActive ? alpha(GOLD, 0.08) : 'var(--ba-bg-42)',
      border: `1px solid ${isActive ? alpha(GOLD, 0.32) : 'var(--ba-fg-08)'}`,
      boxShadow: isActive ? `0 4px 18px ${alpha(GOLD, 0.1)}` : 'none',
      transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease',
      '&:hover': {
        bgcolor: alpha(GOLD, 0.1),
        borderColor: alpha(GOLD, 0.28),
        color: GOLD,
      },
    })
  );

  if (href && downloadFileName) {
    return (
      <Box component="a" href={href} download={downloadFileName} sx={cardSx}>
        {content}
      </Box>
    );
  }

  if (href) {
    return (
      <Box component={RouterLink} href={href} sx={cardSx}>
        {content}
      </Box>
    );
  }

  return (
    <Box onClick={onClick} sx={cardSx}>
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

  const renderProfile = () => (
    <Stack alignItems="center" spacing={1.25} sx={{ px: 2.5, pt: 7, pb: 3 }}>
      <Avatar
        src={user.photoURL}
        alt={user.displayName}
        sx={{
          width: 84,
          height: 84,
          fontSize: 30,
          fontWeight: 800,
          color: GOLD,
          bgcolor: 'var(--ba-bg-65)',
          border: `2px solid ${GOLD}`,
          boxShadow: `0 0 28px ${alpha(GOLD, 0.22)}`,
        }}
      >
        {user.displayName?.charAt(0).toUpperCase()}
      </Avatar>

      <Typography
        variant="subtitle1"
        noWrap
        sx={{
          maxWidth: 1,
          fontWeight: 800,
          letterSpacing: 0.02,
          color: USER_COLORS.textPrimary,
        }}
      >
        {user.displayName}
      </Typography>

      <Typography
        variant="body2"
        noWrap
        sx={{
          maxWidth: 1,
          color: USER_COLORS.textMuted,
          fontSize: 13,
        }}
      >
        {user.email}
      </Typography>

      <BattleGoldDivider variant="compact" />
    </Stack>
  );

  const renderList = () => (
    <Stack spacing={1.25} sx={{ px: 2, py: 1 }}>
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
              <MenuCard
                label={isHome ? rootLabel : translatedLabel}
                icon={option.icon}
                isActive={isActive}
                showChevron
                chevronDown={isExpanded}
                onClick={() => handleToggleExpand(option.labelKey)}
              />

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Stack spacing={0.75} sx={{ mt: 0.75, pl: 1.25 }}>
                  {option.children?.map((child) => {
                    const childActive = !!(child.href && pathname.startsWith(child.href));

                    return (
                      <Box key={child.labelKey} onClick={onClose}>
                        <MenuCard
                          label={t(child.labelKey)}
                          icon={child.icon}
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
            <MenuCard
              label={isHome ? rootLabel : translatedLabel}
              icon={option.icon}
              href={isHome ? rootHref : option.href || '#'}
              isActive={isActive}
            />
          </Box>
        );
      })}

      <NavApkBanner onNavigate={onClose} />
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
            bgcolor: 'var(--ba-drawer-bg)',
            color: USER_COLORS.textBody,
            backgroundImage: `
              var(--ba-drawer-overlay),
              url(${USER_IMAGES.pageBg})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            borderLeft: `1px solid var(--ba-fg-10)`,
            boxShadow: `-12px 0 48px var(--ba-shadow)`,
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
            color: 'var(--ba-fg-72)',
            bgcolor: 'var(--ba-fg-06)',
            border: `1px solid var(--ba-fg-10)`,
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
          {renderProfile()}
          {renderList()}
        </Scrollbar>

        <Box
          sx={{
            px: 2,
            py: 2,
            mt: 'auto',
            borderTop: `1px solid var(--ba-border-soft)`,
            bgcolor: 'var(--ba-bg-35)',
            backdropFilter: 'blur(8px)',
            mb: { xs: '72px', md: 0 },
          }}
        >
          <Stack spacing={1.25}>
            <UserColorModeToggle dense />

            <Stack direction="row" spacing={1.25} alignItems="center">
              <SignOutButton
                onClose={onClose}
                sx={{
                  flex: 1,
                  height: 48,
                  fontSize: 13,
                }}
              />

              <IconButton
                component={RouterLink}
                href={paths.user.account.customerSupport}
                onClick={onClose}
                aria-label="Customer support"
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  color: 'var(--ba-fg-72)',
                  bgcolor: 'var(--ba-fg-06)',
                  border: `1px solid var(--ba-fg-12)`,
                  borderRadius: `${GLASS_CARD_RADIUS}px`,
                  '&:hover': {
                    bgcolor: alpha(GOLD, 0.12),
                    borderColor: alpha(GOLD, 0.32),
                    color: GOLD,
                  },
                }}
              >
                <Iconify icon="solar:headphones-round-sound-bold" width={22} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
