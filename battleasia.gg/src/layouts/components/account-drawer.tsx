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
  ButtonBase,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

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
import { CONFIG } from 'src/global-config';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';
import { NavApkBanner } from './nav-apk-banner';

import type { AccountMenuItem } from '../menu-items-config';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = 'var(--ba-gold, #f5c518)';
const GOLD_LIGHT = 'var(--ba-gold-light, #fbbf24)';

const liveBeaconPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.35;
  }
`;

const laserSweep = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
`;

const DRAWER_PAPER_SX = {
  width: { xs: 'min(380px, 92vw)', sm: 420 },
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, #090d14 0%, #04060a 100%)',
  borderLeft: `1px solid ${goldAlpha(0.25)}`,
  boxShadow: `-16px 0 60px ${alpha('#000000', 0.85)}, inset 1px 0 0 ${goldAlpha(0.12)}`,
  overflow: 'hidden',
} as const;

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

// Fallback icon map for any items lacking an explicit icon
const FALLBACK_ICONS: Record<string, string> = {
  'navigation.account': 'solar:user-id-bold',
  'navigation.profile': 'solar:user-bold',
  'navigation.myMatches': 'solar:gamepad-bold',
  'navigation.myOrders': 'solar:bag-heart-bold',
  'navigation.myStatistics': 'solar:chart-2-bold',
  'navigation.myReferrals': 'solar:users-group-rounded-bold',
  'navigation.notifications': 'solar:bell-bing-bold-duotone',
  'navigation.leaderboard': 'game-icons:podium-winner',
  'navigation.customerSupport': 'solar:headphones-round-sound-bold',
  'navigation.play': 'solar:gamepad-bold',
  'navigation.shop': 'solar:bag-heart-bold',
  'navigation.referral': 'solar:users-group-rounded-bold',
  'navigation.feed': 'solar:clapperboard-play-bold',
  'navigation.home': 'solar:home-2-bold',
  'navigation.wallet': 'solar:wallet-bold',
  'navigation.withdrawal': 'solar:card-send-bold',
};

function renderItemIcon(item: AccountMenuItem, isActive: boolean) {
  if (item.icon) {
    return item.icon;
  }
  const iconName = FALLBACK_ICONS[item.labelKey] || 'solar:widget-bold';
  return <Iconify icon={iconName} width={20} />;
}

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();
  const { t } = useTranslate();

  const storeUser = useSelector((state) => state.auth.user);

  const user = {
    displayName: storeUser?.username || storeUser?.email || '',
    email: storeUser?.email || '',
    photoURL: getImageUrl(storeUser?.avatar),
    balance: storeUser?.balance ?? 0,
    pubgId: storeUser?.pubgId || '',
  };

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  
  // By default, expand active groups or 'navigation.account' so sub-menus are discoverable
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(['navigation.account'])
  );

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
    <Stack spacing={1.5} sx={{ px: { xs: 2.25, sm: 3 }, pt: 1, pb: 2 }}>
      {data.map((option) => {
        const translatedLabel = t(option.labelKey);
        const rootLabel = pathname.includes('/dashboard') ? t('navigation.home') : 'Dashboard';
        const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;
        const hasChildren = option.children && option.children.length > 0;
        const isExpanded = expandedItems.has(option.labelKey);
        const isHome = option.labelKey === 'navigation.home';
        const isActive = isMenuItemActive(pathname, option);
        const displayLabel = isHome ? rootLabel : translatedLabel;
        const subCount = option.children?.length ?? 0;

        // Group item with Sub-menus (e.g. Account -> Profile, Matches, Orders, Stats, etc.)
        if (hasChildren) {
          return (
            <Box
              key={option.labelKey}
              sx={{
                borderRadius: '8px',
                border: isExpanded ? `1px solid ${goldAlpha(0.4)}` : `1px solid rgba(255, 255, 255, 0.1)`,
                bgcolor: isExpanded ? 'rgba(15, 20, 31, 0.85)' : 'rgba(10, 14, 22, 0.65)',
                boxShadow: isExpanded
                  ? `0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 16px ${goldAlpha(0.06)}`
                  : '0 4px 14px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
              }}
            >
              {/* Parent Expandable Command Header */}
              <ButtonBase
                onClick={() => handleToggleExpand(option.labelKey)}
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
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                  },
                }}
              >
                {/* Active Indicator Left Glow Strip */}
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3.5,
                      bgcolor: GOLD,
                      boxShadow: `0 0 12px ${GOLD}`,
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

                  {/* Title & Subtitle */}
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
                      {displayLabel}
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
                      const childActive = !!(
                        child.href &&
                        (pathname === child.href || pathname.startsWith(`${child.href}/`))
                      );
                      const childLabel = t(child.labelKey);
                      const isLast = idx === (option.children?.length ?? 0) - 1;

                      return (
                        <ButtonBase
                          key={child.labelKey}
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

        // Standalone Navigation Items (Play, Shop, Referral, Feed)
        const isPlay = option.labelKey === 'navigation.play';

        return (
          <ButtonBase
            key={option.labelKey}
            component={RouterLink}
            href={isHome ? rootHref : option.href || '#'}
            onClick={onClose}
            sx={{
              width: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.4,
              borderRadius: '8px',
              clipPath: 'none',
              bgcolor: isActive
                ? goldAlpha(0.16)
                : 'rgba(12, 17, 26, 0.75)',
              border: `1px solid ${isActive ? goldAlpha(0.45) : 'rgba(255, 255, 255, 0.12)'}`,
              boxShadow: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              '&:hover': {
                bgcolor: goldAlpha(0.12),
                borderColor: goldAlpha(0.45),
                transform: 'none',
                boxShadow: 'none',
                '& .nav-icon': {
                  color: GOLD,
                },
                '& .nav-label': {
                  color: GOLD_LIGHT,
                },
              },
            }}
          >
            {/* Active Left Strip */}
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3.5,
                  bgcolor: GOLD,
                  boxShadow: `0 0 12px ${GOLD}`,
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

              {/* Standalone Label */}
              <Typography
                className="nav-label"
                sx={{
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: isActive ? '#ffffff' : alpha('#ffffff', 0.9),
                  textShadow: isActive ? `0 0 12px ${goldAlpha(0.5)}` : 'none',
                  transition: 'color 0.2s ease',
                  lineHeight: 1.2,
                }}
              >
                {displayLabel}
              </Typography>
            </Stack>

            {/* Live Indicator Beacon for PLAY */}
            {isPlay ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 1.1,
                  py: 0.4,
                  borderRadius: '4px',
                  bgcolor: alpha('#22c55e', 0.15),
                  border: `1px solid ${alpha('#22c55e', 0.45)}`,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                    animation: `${liveBeaconPulse} 1.6s ease-out infinite`,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#22c55e',
                    textTransform: 'uppercase',
                  }}
                >
                  LIVE
                </Typography>
              </Box>
            ) : (
              <Iconify
                icon="solar:alt-arrow-right-bold"
                width={16}
                sx={{
                  color: isActive ? GOLD : alpha('#ffffff', 0.35),
                  transition: 'transform 0.2s ease, color 0.2s ease',
                }}
              />
            )}
          </ButtonBase>
        );
      })}

      {/* APK Banner */}
      <Box sx={{ pt: 1.5 }}>
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
        sx={{
          // Above FloatingFooterNav (zIndex 1300) so Logout stays visible on mobile
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
            borderBottom: `1px solid ${goldAlpha(0.16)}`,
            background: `linear-gradient(90deg, ${goldAlpha(0.08)} 0%, transparent 100%)`,
          }}
        >
          {/* Tactical Header Badge */}
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
              COMMAND MATRIX
            </Typography>
          </Stack>

          {/* Tactical Close Button */}
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
          {/* Holographic Player Profile Pod */}
          <Box sx={{ px: { xs: 2.25, sm: 3 }, pt: 2, pb: 1 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                bgcolor: 'rgba(15, 21, 33, 0.9)',
                border: `1px solid ${goldAlpha(0.35)}`,
                boxShadow: `0 8px 28px rgba(0, 0, 0, 0.5), inset 0 0 20px ${goldAlpha(0.08)}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Corner Bracket */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 14,
                  height: 14,
                  borderTop: `2px solid ${GOLD}`,
                  borderRight: `2px solid ${GOLD}`,
                }}
              />

              <Stack direction="row" alignItems="center" spacing={1.75}>
                {/* Avatar with Glowing Status Ring */}
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
                      border: `2px solid ${goldAlpha(0.6)}`,
                    }}
                  />
                  {/* Online Dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      border: '2px solid #090d14',
                      boxShadow: '0 0 8px #22c55e',
                    }}
                  />
                </Box>

                {/* Player Name & Verified Badge */}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 16,
                      fontWeight: 900,
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
                        borderRadius: '3px',
                        bgcolor: goldAlpha(0.15),
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
                          color: alpha('#ffffff', 0.5),
                        }}
                      >
                        ID: {user.pubgId}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* BAC Balance Strip inside HUD */}
              <Box
                sx={{
                  mt: 1.75,
                  pt: 1.25,
                  borderTop: `1px solid ${goldAlpha(0.15)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Box
                    component="img"
                    src={CONFIG.currencyIcon}
                    alt="BAC"
                    sx={{ width: 18, height: 18, objectFit: 'contain' }}
                  />
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                    {user.balance.toLocaleString()} BAC
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
                    color: GOLD_LIGHT,
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: goldAlpha(0.24),
                      borderColor: GOLD,
                      color: '#ffffff',
                    },
                  }}
                >
                  WALLET HUB &gt;
                </ButtonBase>
              </Box>
            </Box>
          </Box>

          {/* Render Menu Items List */}
          {renderList()}
        </Scrollbar>

        {/* Bottom Sign Out CTA — pinned above mobile safe area / footer */}
        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 2.25, sm: 3 },
            pt: { xs: 1.25, sm: 2 },
            pb: {
              xs: 'max(12px, calc(8px + env(safe-area-inset-bottom, 0px)))',
              sm: 2.5,
            },
            mt: 'auto',
            borderTop: `1px solid ${goldAlpha(0.16)}`,
            background: 'rgba(5, 8, 14, 0.98)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <SignOutButton
            onClose={onClose}
            variant="outlined"
            size="small"
            sx={{
              width: 1,
              minHeight: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              py: 0,
              borderRadius: '8px',
              clipPath: 'none',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: { xs: 11.5, sm: 12.5 },
              color: '#fecaca !important',
              bgcolor: `${alpha('#ef4444', 0.14)} !important`,
              border: `1px solid ${alpha('#ef4444', 0.55)} !important`,
              boxShadow: 'none',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              '&:hover': {
                bgcolor: `${alpha('#ef4444', 0.28)} !important`,
                borderColor: '#ef4444 !important',
                color: '#ffffff !important',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          />
        </Box>
      </Drawer>
    </>
  );
}
