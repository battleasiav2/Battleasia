import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user/user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type ShopSectionTab = 'shop' | 'wallet';

const TABS: { id: ShopSectionTab; labelKey: string; href: string; icon: string }[] = [
  {
    id: 'shop',
    labelKey: 'shop.tabShop',
    href: paths.user.shop,
    icon: 'solar:shop-bold-duotone',
  },
  {
    id: 'wallet',
    labelKey: 'shop.tabWallet',
    href: paths.user.shopWallet,
    icon: 'solar:wallet-money-bold-duotone',
  },
];

/** Shop / Wallet section switcher — wallet is only reachable from Shop. */
export function ShopSectionNav() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const active: ShopSectionTab = pathname.includes('/shop/wallet') ? 'wallet' : 'shop';

  return (
    <Box
      sx={{
        p: 0.5,
        mb: { xs: 2, md: 2.5 },
        bgcolor: alpha('#000000', 0.45),
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
      }}
    >
      <Stack direction="row" spacing={0.5}>
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <Box
              key={tab.id}
              component={RouterLink}
              href={tab.href}
              sx={{
                flex: 1,
                py: 1.1,
                px: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.4,
                textDecoration: 'none',
                bgcolor: selected ? goldAlpha(0.14) : 'transparent',
                border: `1px solid ${selected ? GOLD : 'transparent'}`,
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  bgcolor: selected ? goldAlpha(0.18) : alpha('#ffffff', 0.04),
                },
              }}
            >
              <Iconify
                icon={tab.icon}
                width={18}
                sx={{ color: selected ? GOLD : alpha('#ffffff', 0.45) }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: selected ? 800 : 600,
                  color: selected ? GOLD : alpha('#ffffff', 0.5),
                  letterSpacing: 0.2,
                }}
              >
                {t(tab.labelKey)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
