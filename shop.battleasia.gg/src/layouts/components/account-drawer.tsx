import type { IconButtonProps } from '@mui/material/IconButton';

import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import {
  Box,
  Link,
  Stack,
  Drawer,
  Collapse,
  Typography,
  IconButton,
  ButtonBase,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { getImageUrl } from 'src/utils/get-image-url';

import { useSelector } from 'src/store';
import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { goldAlpha } from 'src/theme/accent-presets';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

import type { AccountMenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = 'var(--ba-gold, #f5c518)';

const DRAWER_PAPER_SX = {
  width: { xs: 'min(380px, 92vw)', sm: 420 },
  display: 'flex',
  flexDirection: 'column',
  bgcolor: '#060607',
  backgroundImage: 'none',
  borderLeft: `1px solid ${alpha('#ffffff', 0.09)}`,
  boxShadow: `-16px 0 60px ${alpha('#000000', 0.85)}`,
  overflow: 'hidden',
} as const;

/** Home / shop glass menu card surface — all items share this */
const MENU_CARD_SX = {
  position: 'relative' as const,
  overflow: 'hidden' as const,
  borderRadius: '8px',
  bgcolor: '#161618',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  border: `1px solid ${alpha('#ffffff', 0.09)}`,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
} as const;

const MAIN_APP_URL =
  (import.meta.env.VITE_MAIN_APP_URL as string | undefined) || 'http://localhost:8081';

export type AccountDrawerProps = IconButtonProps & {
  data?: AccountMenuItem[];
};

function isMenuItemActive(pathname: string, option: AccountMenuItem): boolean {
  if (option.href && (pathname === option.href || pathname.startsWith(`${option.href}/`))) {
    return true;
  }

  return !!option.children?.some(
    (child) => child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
  );
}

// Fallback icon mapping for shop drawer items
const FALLBACK_ICONS: Record<string, string> = {
  'nav.shop': 'solar:shop-bold',
  'nav.wallet': 'solar:wallet-bold',
  'nav.transfer': 'solar:transfer-horizontal-bold',
  'nav.withdrawal': 'solar:card-send-bold',
  'nav.account': 'solar:user-id-bold',
  'nav.profile': 'solar:user-bold',
};

function renderItemIcon(item: AccountMenuItem, isActive: boolean) {
  if (item.icon) {
    return item.icon;
  }
  const key = item.labelKey || item.label || '';
  const iconName = FALLBACK_ICONS[key] || 'solar:widget-bold';
  return <Iconify icon={iconName} width={20} />;
}

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();
  const { t } = useTranslate();

  const storeUser = useSelector((state) => state.auth.user);
  const balance = useSelector((state) => state.auth.balance);

  const user = {
    displayName: storeUser?.username || storeUser?.email || '',
    email: storeUser?.email || '',
    photoURL: getImageUrl(storeUser?.avatar),
    pubgId: storeUser?.pubgId || '',
  };

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderList = () => (
    <Stack spacing={1.5} sx={{ px: { xs: 2.25, sm: 3 }, pt: 1, pb: 2 }}>
      {data.map((option) => {
        const itemKey = option.labelKey || option.label || '';
        const translatedLabel = t(itemKey) || option.label;
        const hasChildren = option.children && option.children.length > 0;
        const isExpanded = expandedItems.has(itemKey);
        const isActive = isMenuItemActive(pathname, option);

        if (hasChildren) {
          return (
            <Box
              key={itemKey}
              sx={{
                ...MENU_CARD_SX,
                border: isExpanded
                  ? `1px solid ${goldAlpha(0.35)}`
                  : `1px solid ${alpha('#ffffff', 0.12)}`,
                bgcolor: isExpanded ? alpha('#161618', 0.52) : alpha('#161618', 0.42),
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
            >
              <ButtonBase
                onClick={() => handleToggleExpand(itemKey)}
                sx={{
                  width: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.03),
                  },
                }}
              >
                {(isActive || isExpanded) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      bgcolor: goldAlpha(0.45),
                      zIndex: 1,
                    }}
                  />
                )}

                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: isExpanded || isActive ? GOLD : alpha('#ffffff', 0.75),
                      transition: 'color 0.22s ease',
                      flexShrink: 0,
                    }}
                  >
                    {renderItemIcon(option, isActive)}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 900,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: isExpanded || isActive ? '#ffffff' : alpha('#ffffff', 0.88),
                        lineHeight: 1.2,
                      }}
                    >
                      {translatedLabel}
                    </Typography>
                  </Box>
                </Stack>

                <Iconify
                  icon="eva:arrow-ios-downward-fill"
                  width={20}
                  sx={{
                    color: isExpanded ? GOLD : alpha('#ffffff', 0.55),
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    flexShrink: 0,
                  }}
                />
              </ButtonBase>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    position: 'relative',
                    pl: 2.25,
                    pr: 1.5,
                    pb: 0.5,
                    borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 14,
                      top: 8,
                      bottom: 8,
                      width: 2,
                      bgcolor: GOLD,
                      opacity: 0.85,
                      zIndex: 1,
                    }}
                  />

                  <Stack spacing={0} sx={{ position: 'relative', zIndex: 2 }}>
                    {option.children?.map((child, idx) => {
                      const childKey = child.labelKey || child.label || '';
                      const childActive = !!(
                        child.href &&
                        (pathname === child.href || pathname.startsWith(`${child.href}/`))
                      );
                      const childLabel = t(childKey) || child.label;
                      const isLast = idx === (option.children?.length ?? 0) - 1;

                      return (
                        <ButtonBase
                          key={childKey}
                          component={RouterLink}
                          href={child.href || '#'}
                          onClick={onClose}
                          sx={{
                            width: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.35,
                            pl: 2,
                            pr: 0.5,
                            borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
                            bgcolor: 'transparent',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                              bgcolor: goldAlpha(0.05),
                              '& .child-icon, & .child-label': { color: GOLD },
                            },
                          }}
                        >
                          <Box
                            className="child-icon"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              color: childActive ? GOLD : alpha('#ffffff', 0.55),
                              transition: 'color 0.2s ease',
                              flexShrink: 0,
                            }}
                          >
                            {renderItemIcon(child, childActive)}
                          </Box>

                          <Typography
                            className="child-label"
                            sx={{
                              fontSize: 13,
                              fontWeight: childActive ? 800 : 600,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: childActive ? '#ffffff' : alpha('#ffffff', 0.72),
                              transition: 'color 0.2s ease',
                              lineHeight: 1.2,
                              textAlign: 'left',
                            }}
                          >
                            {childLabel}
                          </Typography>
                        </ButtonBase>
                      );
                    })}
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          );
        }

        return (
          <ButtonBase
            key={itemKey}
            component={RouterLink}
            href={option.href || '#'}
            onClick={onClose}
            sx={{
              width: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.4,
              ...MENU_CARD_SX,
              bgcolor: isActive ? goldAlpha(0.1) : alpha('#161618', 0.42),
              border: `1px solid ${isActive ? goldAlpha(0.35) : alpha('#ffffff', 0.12)}`,
              transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              '&:hover': {
                bgcolor: alpha('#161618', 0.52),
                borderColor: goldAlpha(0.35),
                '& .nav-icon': { color: GOLD },
                '& .nav-label': { color: '#ffffff' },
              },
            }}
          >
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: goldAlpha(0.45),
                }}
              />
            )}

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              <Box
                className="nav-icon"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? GOLD : alpha('#ffffff', 0.75),
                  transition: 'color 0.22s ease',
                  flexShrink: 0,
                }}
              >
                {renderItemIcon(option, isActive)}
              </Box>

              <Typography
                className="nav-label"
                sx={{
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: isActive ? '#ffffff' : alpha('#ffffff', 0.9),
                  transition: 'color 0.2s ease',
                  lineHeight: 1.2,
                }}
              >
                {translatedLabel}
              </Typography>
            </Stack>

            <Iconify
              icon="solar:alt-arrow-right-bold"
              width={16}
              sx={{
                color: isActive ? GOLD : alpha('#ffffff', 0.35),
              }}
            />
          </ButtonBase>
        );
      })}

      {/* Return to Main Gaming Portal Link */}
      <Box sx={{ pt: 1.5 }}>
        <Link
          href={MAIN_APP_URL}
          underline="none"
          onClick={onClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.35,
            ...MENU_CARD_SX,
            border: `1px solid ${goldAlpha(0.28)}`,
            color: alpha('#ffffff', 0.85),
            transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
            '&:hover': {
              bgcolor: alpha('#161618', 0.52),
              borderColor: goldAlpha(0.45),
              color: '#ffffff',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Iconify icon="solar:gamepad-bold" width={20} sx={{ color: GOLD }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t('nav.backToMain') || 'RETURN TO MAIN ARENA'}
            </Typography>
          </Stack>
          <Iconify icon="solar:arrow-right-up-bold" width={16} sx={{ color: GOLD }} />
        </Link>
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
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 4,
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: alpha('#000000', 0.78),
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
          },
        }}
        PaperProps={{
          sx: DRAWER_PAPER_SX,
        }}
      >
        {/* Top Header HUD Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2.5, sm: 3 },
            pt: 2.5,
            pb: 1.5,
            borderBottom: `1px solid ${alpha('#ffffff', 0.09)}`,
            bgcolor: alpha('#161618', 0.35),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: GOLD,
                transform: 'rotate(45deg)',
                boxShadow: `0 0 8px ${GOLD}`,
              }}
            />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              SHOP MATRIX
            </Typography>
          </Stack>

          <IconButton
            onClick={onClose}
            aria-label="Close menu"
            sx={{
              width: 34,
              height: 34,
              borderRadius: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${goldAlpha(0.25)}`,
              color: alpha('#ffffff', 0.88),
              transition: 'all 0.22s ease',
              '&:hover': {
                bgcolor: goldAlpha(0.18),
                borderColor: GOLD,
                color: '#ffffff',
                transform: 'rotate(90deg)',
              },
            }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        <Scrollbar sx={{ flex: '1 1 auto' }}>
          {/* Profile card — same glass as menu items */}
          <Box sx={{ px: { xs: 2.25, sm: 3 }, pt: 2, pb: 1 }}>
            <Box
              sx={{
                ...MENU_CARD_SX,
                p: 2,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: goldAlpha(0.45),
                  zIndex: 1,
                }}
              />

              <Stack direction="row" alignItems="center" spacing={1.75} sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={user.photoURL || '/assets/images/mock/avatar/avatar-1.webp'}
                    alt={user.displayName}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: `1px solid ${alpha('#ffffff', 0.12)}`,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      border: '2px solid #161618',
                    }}
                  />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.displayName || 'BATTLE COMBATANT'}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 0.8,
                        py: 0.2,
                        borderRadius: '999px',
                        bgcolor: goldAlpha(0.12),
                        border: `1px solid ${goldAlpha(0.35)}`,
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: GOLD,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Iconify icon="solar:shield-check-bold" width={11} />
                      VERIFIED
                    </Box>
                    {user.pubgId && (
                      <Typography
                        sx={{
                          fontSize: 10.5,
                          fontFamily: 'monospace',
                          color: alpha('#ffffff', 0.48),
                        }}
                      >
                        ID: {user.pubgId}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Box
                sx={{
                  mt: 1.75,
                  pt: 1.25,
                  borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Box
                    component="img"
                    src={CONFIG.currencyIcon}
                    alt="BAC"
                    sx={{ width: 18, height: 18, objectFit: 'contain' }}
                  />
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: GOLD, lineHeight: 1 }}>
                    {(balance ?? 0).toLocaleString()} BAC
                  </Typography>
                </Stack>

                <ButtonBase
                  component={RouterLink}
                  href={paths.user.account.wallet}
                  onClick={onClose}
                  sx={{
                    px: 1.25,
                    py: 0.45,
                    borderRadius: '4px',
                    bgcolor: goldAlpha(0.12),
                    border: `1px solid ${goldAlpha(0.35)}`,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: GOLD,
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: goldAlpha(0.24),
                      borderColor: GOLD,
                      color: '#ffffff',
                    },
                  }}
                >
                  WALLET &gt;
                </ButtonBase>
              </Box>
            </Box>
          </Box>

          {renderList()}
        </Scrollbar>

        {/* Sign Out CTA */}
        <Box
          sx={{
            px: { xs: 2.25, sm: 3 },
            py: 2,
            mt: 'auto',
            borderTop: `1px solid ${alpha('#ffffff', 0.09)}`,
            bgcolor: alpha('#161618', 0.55),
          }}
        >
          <SignOutButton
            onClose={onClose}
            variant="outlined"
            sx={{
              width: 1,
              py: 1.15,
              borderRadius: '8px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 13.5,
              color: '#f87171',
              bgcolor: alpha('#ef4444', 0.08),
              border: `1px solid ${alpha('#ef4444', 0.35)}`,
              transition: 'all 0.22s ease',
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.2),
                borderColor: '#ef4444',
                color: '#ffffff',
              },
            }}
          />
        </Box>
      </Drawer>
    </>
  );
}
