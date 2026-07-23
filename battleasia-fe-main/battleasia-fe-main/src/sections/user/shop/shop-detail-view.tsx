import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Box, Chip, Grid2 as Grid, Stack, Typography } from '@mui/material';

import { toast } from 'react-hot-toast';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserBackButton,
  UserActionButton,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { ShopHero, ShopDetailSkeleton } from './components';
import { SHOP_EXTERNAL_URL } from './shop-constants';

// ----------------------------------------------------------------------

export type ShopItemData = {
  _id: string;
  id: string;
  amount: number;
  badge: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  symbol: string;
  paymentOptions: string[];
  image: string;
  isActive: boolean;
  status: 'available' | 'soldout';
};

// ----------------------------------------------------------------------

export function ShopDetailView() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  const [item, setItem] = useState<ShopItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!shopId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);
        const res = await api.getShopItemApi(shopId);
        const data = res?.data?.data;
        if (!data) {
          setNotFound(true);
          setItem(null);
          return;
        }
        setItem(data);
      } catch {
        toast.error(t('shop.failedToLoadItem'));
        setNotFound(true);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [api, shopId, t]);

  const imageUrl = useMemo(() => {
    if (!item?.image) return '/assets/images/shop.webp';
    if (item.image.startsWith('http')) return item.image;
    return `${CONFIG.serverUrl}${item.image}`;
  }, [item?.image]);

  const isSoldOut = item?.status === 'soldout' || item?.isActive === false;
  const showBadge = item?.badge && item.badge.toLowerCase() !== 'none';

  if (loading) {
    return (
      <UserPageShell>
        <ShopDetailSkeleton />
      </UserPageShell>
    );
  }

  if (notFound || !item) {
    return (
      <UserPageShell>
        <Box sx={{ mb: 2 }}>
          <UserBackButton onClick={() => navigate(paths.user.shop)} label={t('common.goBack')} />
        </Box>
        <UserEmptyState
          icon="solar:bag-cross-bold-duotone"
          title={t('shop.itemNotFound')}
          description={t('shop.itemNotFoundDescription')}
          actionLabel={t('shop.title')}
          onAction={() => navigate(paths.user.shop)}
        />
      </UserPageShell>
    );
  }

  const itemTitle = `${item.amount} ${item.symbol}`;

  return (
    <UserPageShell>
      <Box sx={{ mb: 2 }}>
        <UserBackButton onClick={() => navigate(paths.user.shop)} label={t('common.goBack')} />
      </Box>

      <ShopHero shopName={itemTitle} />

      <UserPageTitle
        badge={t('shop.badgeCoinPack')}
        title={itemTitle}
        subtitle={t('shop.detailSubtitle')}
        action={
          <UserActionButton
            href={SHOP_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            actionVariant="gold"
            disabled={isSoldOut}
            startIcon={<Iconify icon="solar:cart-check-bold" width={18} />}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            {isSoldOut ? t('shop.soldOut') : t('shop.buyNow')}
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
        <UserStatTile label={t('shop.price')} value={`$${Number(item.price).toFixed(2)}`} />
        <UserStatTile
          label={t('shop.amount')}
          value={String(item.amount)}
          suffix={item.symbol}
        />
        <UserStatTile
          label={t('shop.availability')}
          value={isSoldOut ? t('shop.soldOut') : t('shop.inStock')}
        />
      </Box>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 7 }}>
          <UserGlassCard sx={{ p: { xs: 1.5, md: 2 }, height: 1 }}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: alpha('#000000', 0.35),
              }}
            >
              <Image
                src={imageUrl}
                alt={itemTitle}
                ratio="16/9"
                sx={{ width: '100%', maxHeight: 440, objectFit: 'contain' }}
              />
              {showBadge ? (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontWeight: 700,
                    bgcolor: alpha(USER_COLORS.gold, 0.2),
                    color: USER_COLORS.gold,
                    border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                  }}
                />
              ) : null}
            </Box>
          </UserGlassCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
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
                  mb: 2,
                }}
              >
                {t('shop.detailTitle')}
              </Typography>

              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>{t('shop.price')}</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: USER_COLORS.gold }}>
                    ${Number(item.price).toFixed(2)}
                  </Typography>
                </Stack>

                {item.discountPercent > 0 ? (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>{t('shop.originalPrice')}</Typography>
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: USER_COLORS.textMuted,
                          textDecoration: 'line-through',
                        }}
                      >
                        ${Number(item.originalPrice).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Chip
                      label={t('shop.premiumDiscount', { percent: item.discountPercent })}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        fontWeight: 700,
                        bgcolor: alpha(USER_COLORS.gold, 0.15),
                        color: USER_COLORS.gold,
                        border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                      }}
                    />
                  </>
                ) : null}

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>{t('shop.amount')}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                    {item.amount} {item.symbol}
                  </Typography>
                </Stack>
              </Stack>
            </UserGlassCard>

            {item.paymentOptions?.length ? (
              <UserGlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: USER_COLORS.gold,
                    mb: 1.5,
                  }}
                >
                  {t('shop.paymentOptions')}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {item.paymentOptions.map((option) => (
                    <Box key={option} sx={getGlassInnerSx(tokens, { px: 1.25, py: 0.75 })}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: USER_COLORS.textPrimary, textTransform: 'uppercase' }}>
                        {option}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </UserGlassCard>
            ) : null}

            <UserActionButton
              href={SHOP_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              actionVariant="gold"
              size="large"
              fullWidth
              disabled={isSoldOut}
              startIcon={<Iconify icon="solar:arrow-right-up-bold" width={18} />}
              sx={{ height: { xs: 48, md: 52 }, fontSize: { xs: 13, md: 14 } }}
            >
              {isSoldOut ? t('shop.soldOut') : t('shop.goToBacShop')}
            </UserActionButton>
          </Stack>
        </Grid>
      </Grid>
    </UserPageShell>
  );
}
