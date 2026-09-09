import { useMemo } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, Grid2 as Grid } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { useImagePreloader } from 'src/hooks';
import { USER_COLORS, UserPageShell, UserActionButton, UserGlassCard, goldAlpha } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { ShopDetailsCarousel } from './shop-details-carousel';
import { SHOP_HERO_IMAGE, SHOP_IMAGE_PATHS, getBacShopEntryUrl } from './shop-constants';
import { ShopFeatures, ShopArenaHero, ShopPageSkeleton, ShopSectionNav } from './components';

// ----------------------------------------------------------------------

export { SHOP_IMAGE_PATHS } from './shop-constants';

const GOLD = USER_COLORS.gold;

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

      <Stack spacing={{ xs: 4, md: 5 }}>
        {/* Featured Store Section */}
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
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  letterSpacing: 0.8,
                  textShadow: `0 0 20px ${goldAlpha(0.2)}`,
                }}
              >
                {t('shop.bacTitle')}
              </Typography>
              <BattleGoldDivider variant="section" sx={{ mt: 0.75, width: 140 }} />
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.8}
              sx={{
                alignSelf: { xs: 'flex-start', sm: 'center' },
                px: 1.5,
                py: 0.6,
                border: `1px solid ${goldAlpha(0.4)}`,
                bgcolor: alpha('#000000', 0.65),
                boxShadow: `0 4px 14px ${alpha('#000000', 0.5)}, inset 0 0 10px ${goldAlpha(0.08)}`,
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:star-bold" width={14} sx={{ color: GOLD }} />
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: GOLD,
                }}
              >
                {t('shop.featured')}
              </Typography>
            </Stack>
          </Stack>

          <Grid container spacing={2.5} alignItems="stretch">
            {/* Left Carousel Column */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <UserGlassCard noPadding sx={{ p: { xs: 1.25, md: 1.75 }, height: 1 }}>
                <ShopDetailsCarousel images={[...SHOP_IMAGE_PATHS]} name={t('shop.bacShopName')} />
              </UserGlassCard>
            </Grid>

            {/* Right Partner HUD Card Column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box
                sx={{
                  height: 1,
                  p: { xs: 2.25, md: 2.75 },
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: alpha('#06090e', 0.75),
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: `1px solid ${goldAlpha(0.28)}`,
                  borderTop: `2px solid ${GOLD}`,
                  boxShadow: `0 12px 32px ${alpha('#000000', 0.65)}, inset 0 0 20px ${goldAlpha(0.05)}`,
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
                }}
              >
                <Stack spacing={2.25} sx={{ height: 1 }}>
                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: 17,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      color: USER_COLORS.textPrimary,
                      letterSpacing: 0.6,
                    }}
                  >
                    {t('shop.officialPartner')}
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: alpha('#ffffff', 0.7), lineHeight: 1.65 }}>
                    {t('shop.partnerBlurb')}
                  </Typography>

                  {/* Currency Telemetry Box */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      p: 1.75,
                      border: `1px solid ${goldAlpha(0.35)}`,
                      bgcolor: goldAlpha(0.08),
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: goldAlpha(0.18),
                        border: `1px solid ${GOLD}`,
                        boxShadow: `0 0 14px ${goldAlpha(0.3)}`,
                        color: GOLD,
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="solar:wallet-money-bold-duotone" width={24} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          color: alpha('#ffffff', 0.55),
                        }}
                      >
                        {t('shop.currency')}
                      </Typography>
                      <Typography sx={{ fontSize: 17, fontWeight: 900, color: GOLD, textShadow: `0 0 10px ${goldAlpha(0.4)}` }}>
                        BAC COINS
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Action CTA Button */}
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
                      fontWeight: 800,
                      letterSpacing: 0.8,
                      borderRadius: 0,
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                      boxShadow: `0 8px 24px ${goldAlpha(0.3)}`,
                    }}
                  >
                    {t('shop.goToBacShop')}
                  </UserActionButton>

                  {/* Trust Footer Badges */}
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    useFlexGap
                    justifyContent="center"
                    spacing={1.25}
                    sx={{ pt: 0.5, rowGap: 0.75 }}
                  >
                    {[
                      { icon: 'solar:shield-check-bold', label: t('shop.trustSecure') },
                      { icon: 'solar:clock-circle-bold', label: t('shop.trustInstant') },
                    ].map((item) => (
                      <Stack key={item.label} direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
                        <Iconify icon={item.icon} width={13} sx={{ color: GOLD, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: alpha('#ffffff', 0.55), letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
                          {item.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Why BAC Features Section */}
        <ShopFeatures title={t('shop.whyBac')} features={features} />
      </Stack>
    </UserPageShell>
  );
}

