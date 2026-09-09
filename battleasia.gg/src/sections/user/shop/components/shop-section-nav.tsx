import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
`;

type ShopSectionTab = 'shop' | 'wallet';

const TABS: { id: ShopSectionTab; labelKey: string; href: string; icon: string; subtitle: string }[] = [
  {
    id: 'shop',
    labelKey: 'shop.tabShop',
    href: paths.user.shop,
    icon: 'solar:shop-bold-duotone',
    subtitle: 'STOREFRONT',
  },
  {
    id: 'wallet',
    labelKey: 'shop.tabWallet',
    href: paths.user.shopWallet,
    icon: 'solar:wallet-money-bold-duotone',
    subtitle: 'VAULT & TRANSFERS',
  },
];

/** Tactical Cyberpunk HUD Shop / Wallet section switcher */
export function ShopSectionNav() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const active: ShopSectionTab = pathname.includes('/shop/wallet') ? 'wallet' : 'shop';

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 0.75, sm: 1 },
        mb: { xs: 2.5, md: 3 },
        bgcolor: alpha('#04070d', 0.8),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${goldAlpha(0.25)}`,
        boxShadow: `0 12px 32px ${alpha('#000000', 0.65)}, inset 0 0 24px ${goldAlpha(0.04)}`,
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
      }}
    >
      {/* Corner Bracket Accents */}
      <Box
        sx={{
          position: 'absolute',
          top: -1,
          left: -1,
          width: 10,
          height: 10,
          borderTop: `2px solid ${GOLD}`,
          borderLeft: `2px solid ${GOLD}`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: 10,
          height: 10,
          borderBottom: `2px solid ${GOLD}`,
          borderRight: `2px solid ${GOLD}`,
          pointerEvents: 'none',
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="stretch"
        justifyContent="space-between"
        spacing={1}
      >
        <Stack direction="row" spacing={{ xs: 0.75, sm: 1.25 }} sx={{ flex: 1 }}>
          {TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <Box
                key={tab.id}
                component={RouterLink}
                href={tab.href}
                sx={{
                  flex: 1,
                  position: 'relative',
                  py: { xs: 1.25, sm: 1.35 },
                  px: { xs: 1.5, sm: 2.25 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  bgcolor: selected ? goldAlpha(0.16) : alpha('#ffffff', 0.02),
                  border: `1px solid ${selected ? goldAlpha(0.55) : alpha('#ffffff', 0.08)}`,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: selected ? goldAlpha(0.22) : alpha('#ffffff', 0.06),
                    borderColor: selected ? GOLD : alpha('#ffffff', 0.22),
                    transform: 'translateY(-1px)',
                    boxShadow: selected ? `0 6px 20px ${goldAlpha(0.25)}` : 'none',
                  },
                }}
              >
                {/* Active Glow Top Bar */}
                {selected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                      boxShadow: `0 0 10px ${GOLD}`,
                    }}
                  />
                )}

                {/* Icon Container with glowing ring */}
                <Box
                  sx={{
                    width: { xs: 34, sm: 38 },
                    height: { xs: 34, sm: 38 },
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: selected ? goldAlpha(0.22) : alpha('#ffffff', 0.05),
                    border: `1px solid ${selected ? GOLD : alpha('#ffffff', 0.1)}`,
                    boxShadow: selected ? `0 0 14px ${goldAlpha(0.35)}` : 'none',
                    transition: 'all 0.25s ease',
                    flexShrink: 0,
                  }}
                >
                  <Iconify
                    icon={tab.icon}
                    width={20}
                    sx={{
                      color: selected ? GOLD : alpha('#ffffff', 0.5),
                      transition: 'color 0.25s ease',
                    }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      fontWeight: selected ? 800 : 700,
                      color: selected ? '#ffffff' : alpha('#ffffff', 0.65),
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      lineHeight: 1.2,
                      textShadow: selected ? `0 0 12px ${goldAlpha(0.4)}` : 'none',
                    }}
                  >
                    {t(tab.labelKey)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: selected ? GOLD : alpha('#ffffff', 0.35),
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      mt: 0.2,
                    }}
                  >
                    {tab.subtitle}
                  </Typography>
                </Box>

                {/* Selected Active Status Dot */}
                {selected && (
                  <Box
                    sx={{
                      ml: 'auto',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: GOLD,
                      boxShadow: `0 0 8px ${GOLD}`,
                      animation: `${pulseGlow} 2s infinite ease-in-out`,
                      display: { xs: 'none', md: 'block' },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>

        {/* HUD Telemetry badge on right */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
            display: { xs: 'none', md: 'flex' },
            bgcolor: alpha('#000000', 0.4),
            border: `1px solid ${goldAlpha(0.18)}`,
            clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              boxShadow: '0 0 10px #22c55e',
              animation: `${pulseGlow} 2s infinite ease-in-out`,
            }}
          />
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: goldAlpha(0.9),
              textTransform: 'uppercase',
            }}
          >
            BAC NETWORK • ONLINE
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
