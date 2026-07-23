import { useMemo } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Grid2 as Grid, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { useImagePreloader } from 'src/hooks';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserActionButton,
  UserStatTile,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { ShopDetailsCarousel } from './shop-details-carousel';
import { SHOP_EXTERNAL_URL, SHOP_HERO_IMAGE, SHOP_IMAGE_PATHS } from './shop-constants';
import { ShopHero, ShopFeatures, ShopPageSkeleton } from './components';

// ----------------------------------------------------------------------

export { SHOP_IMAGE_PATHS } from './shop-constants';

// ----------------------------------------------------------------------

export function ShopView() {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  const { isLoaded } = useImagePreloader([SHOP_HERO_IMAGE], {
    delay: 200,
    continueOnError: true,
  });

  const features = useMemo(
    () => [
      {
        icon: 'solar:cart-large-2-bold-duotone',
        title: t('shop.features.inGamePurchases.title'),
        description: t('shop.features.inGamePurchases.description'),
      },
      {
        icon: 'solar:gift-bold-duotone',
        title: t('shop.features.rewardsPrizes.title'),
        description: t('shop.features.rewardsPrizes.description'),
      },
      {
        icon: 'solar:calendar-mark-bold-duotone',
        title: t('shop.features.joinEvents.title'),
        description: t('shop.features.joinEvents.description'),
      },
      {
        icon: 'solar:shield-check-bold-duotone',
        title: t('shop.features.secureSettlement.title'),
        description: t('shop.features.secureSettlement.description'),
      },
    ],
    [t]
  );

  if (!isLoaded) {
    return (
      <UserPageShell>
        <ShopPageSkeleton />
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <ShopHero shopName={t('shop.bacShopName')} />

      <UserPageTitle
        badge={t('shop.badgeDigitalCurrency')}
        title={t('shop.title')}
        subtitle={t('shop.bacDescription')}
        action={
          <UserActionButton
            href={SHOP_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            actionVariant="gold"
            startIcon={<Iconify icon="solar:shop-bold" width={18} />}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            {t('shop.goToBacShop')}
          </UserActionButton>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <UserStatTile label={t('shop.currency')} value="BAC" suffix={t('shop.suffixCoin')} />
        <UserStatTile label={t('shop.settlement')} value={t('common.instant')} suffix={t('shop.suffixSecure')} />
        <UserStatTile label={t('shop.access')} value="24/7" suffix={t('shop.suffixOnline')} />
      </Box>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }}>
          <UserGlassCard sx={{ p: { xs: 1.5, md: 2 }, height: 1 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5, px: { xs: 0.25, md: 0 } }}
            >
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 14, md: 16 },
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: USER_COLORS.gold,
                }}
              >
                {t('shop.bacTitle')}
              </Typography>

              <Box sx={getGlassInnerSx(tokens, { px: 1.25, py: 0.5 })}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="solar:star-bold" width={12} sx={{ color: USER_COLORS.gold }} />
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: USER_COLORS.gold,
                    }}
                  >
                    {t('shop.featured')}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <ShopDetailsCarousel images={[...SHOP_IMAGE_PATHS]} name={t('shop.bacShopName')} />
          </UserGlassCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2} sx={{ height: 1 }}>
            <UserGlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  letterSpacing: 0.5,
                  mb: 1,
                }}
              >
                {t('shop.bacTitle')}
              </Typography>

              <Typography sx={{ ...userMutedTextSx, fontSize: 13, lineHeight: 1.65 }}>
                {t('shop.bacDescription')}
              </Typography>

              <Box
                sx={getGlassInnerSx(tokens, {
                  mt: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                })}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(USER_COLORS.gold, 0.12),
                    border: `1px solid ${alpha(USER_COLORS.gold, 0.28)}`,
                    color: USER_COLORS.gold,
                  }}
                >
                  <Iconify icon="solar:wallet-money-bold-duotone" width={22} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
                    {t('shop.officialPartner')}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.gold }}>
                    {t('shop.bacShopName')}
                  </Typography>
                </Box>
              </Box>
            </UserGlassCard>

            <ShopFeatures title={t('shop.whyBac')} features={features} />

            <UserActionButton
              href={SHOP_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              actionVariant="gold"
              size="large"
              fullWidth
              startIcon={<Iconify icon="solar:arrow-right-up-bold" width={18} />}
              sx={{
                height: { xs: 48, md: 52 },
                fontSize: { xs: 13, md: 14 },
              }}
            >
              {t('shop.goToBacShop')}
            </UserActionButton>
          </Stack>
        </Grid>
      </Grid>
    </UserPageShell>
  );
}
