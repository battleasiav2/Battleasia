import { useMemo } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, Grid2 as Grid } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { useImagePreloader } from 'src/hooks';
import { USER_COLORS, UserPageShell, UserActionButton, UserGlassCard } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { ShopDetailsCarousel } from './shop-details-carousel';
import { SHOP_HERO_IMAGE, SHOP_IMAGE_PATHS, getBacShopEntryUrl } from './shop-constants';
import { ShopFeatures, ShopArenaHero, ShopPageSkeleton, ShopSectionNav } from './components';

// ----------------------------------------------------------------------

export { SHOP_IMAGE_PATHS } from './shop-constants';

// ----------------------------------------------------------------------

export function ShopView() {
  const { t } = useTranslate();
  const shopHref = useMemo(() => getBacShopEntryUrl(), []);

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
      <ShopSectionNav />
      <ShopArenaHero
        badge={t('shop.badgeOfficialStore')}
        title={t('shop.bacShopName')}
        description={t('shop.bacDescription')}
        imageUrl={SHOP_HERO_IMAGE}
        verifiedLabel={t('shop.badgeVerified')}
        ctaLabel={t('shop.goToBacShop')}
        ctaHref={shopHref}
        stats={[
          { label: t('shop.currency'), value: 'BAC' },
          { label: t('shop.settlement'), value: t('common.instant') },
          { label: t('shop.access'), value: '24/7' },
        ]}
      />

      <Stack spacing={{ xs: 3.5, md: 4.5 }}>
        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: { xs: 22, md: 28 },
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  letterSpacing: 0.5,
                }}
              >
                {t('shop.bacTitle')}
              </Typography>
              <BattleGoldDivider variant="section" sx={{ mt: 0.75, width: 120 }} />
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.6}
              sx={{
                px: 1.25,
                py: 0.55,
                border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                bgcolor: alpha('#000000', 0.45),
              }}
            >
              <Iconify icon="solar:star-bold" width={12} sx={{ color: USER_COLORS.gold }} />
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: USER_COLORS.gold,
                }}
              >
                {t('shop.featured')}
              </Typography>
            </Stack>
          </Stack>

          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 8 }}>
              <UserGlassCard noPadding sx={{ p: { xs: 1.25, md: 1.75 }, height: 1 }}>
                <ShopDetailsCarousel images={[...SHOP_IMAGE_PATHS]} name={t('shop.bacShopName')} />
              </UserGlassCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <UserGlassCard
                sx={{
                  height: 1,
                  p: { xs: 2, md: 2.5 },
                  pt: { xs: 2.5, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack spacing={2} sx={{ height: 1 }}>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: USER_COLORS.textPrimary,
                      letterSpacing: 0.4,
                    }}
                  >
                    {t('shop.officialPartner')}
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: USER_COLORS.textMuted, lineHeight: 1.65 }}>
                    {t('shop.partnerBlurb')}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{
                      p: 1.5,
                      border: `1px solid ${alpha(USER_COLORS.gold, 0.28)}`,
                      bgcolor: alpha(USER_COLORS.gold, 0.06),
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
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
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          textTransform: 'uppercase',
                          color: USER_COLORS.textMuted,
                        }}
                      >
                        {t('shop.currency')}
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: USER_COLORS.gold }}>
                        BAC
                      </Typography>
                    </Box>
                  </Stack>

                  <UserActionButton
                    href={shopHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    actionVariant="gold"
                    size="large"
                    fullWidth
                    startIcon={<Iconify icon="solar:arrow-right-up-bold" width={18} />}
                    sx={{
                      mt: 'auto',
                      height: { xs: 48, md: 52 },
                      fontSize: { xs: 13, md: 14 },
                      borderRadius: 0,
                    }}
                  >
                    {t('shop.goToBacShop')}
                  </UserActionButton>

                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={1.5}
                    sx={{ pt: 0.5 }}
                  >
                    {[
                      { icon: 'solar:shield-check-bold', label: t('shop.trustSecure') },
                      { icon: 'solar:clock-circle-bold', label: t('shop.trustInstant') },
                    ].map((item) => (
                      <Stack key={item.label} direction="row" alignItems="center" spacing={0.4}>
                        <Iconify icon={item.icon} width={12} sx={{ color: alpha(USER_COLORS.gold, 0.7) }} />
                        <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: alpha('#ffffff', 0.45), letterSpacing: 0.2 }}>
                          {item.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </UserGlassCard>
            </Grid>
          </Grid>
        </Box>

        <ShopFeatures title={t('shop.whyBac')} features={features} />
      </Stack>
    </UserPageShell>
  );
}
