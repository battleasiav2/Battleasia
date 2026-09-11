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
  UserGlassCard,
  UserBackButton,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
  goldAlpha,
} from 'src/layouts/user';

import { Image } from 'src/components/image';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { ShopHero, ShopDetailSkeleton, GoToBacShopButton } from './components';
import { getBacShopEntryUrl } from './shop-constants';

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
  const shopHref = useMemo(() => getBacShopEntryUrl(), []);
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

      <ShopHero
        shopName={itemTitle}
        subtitle={t('shop.detailSubtitle')}
        action={
          <GoToBacShopButton
            href={shopHref}
            disabled={isSoldOut}
            label={isSoldOut ? t('shop.soldOut') : t('shop.buyNow')}
            sx={{ width: 'auto' }}
          />
        }
      />

      <Stack sx={{ mb: 2.5, display: { xs: 'flex', md: 'none' } }}>
        <GoToBacShopButton
          href={shopHref}
          fullWidth
          disabled={isSoldOut}
          label={isSoldOut ? t('shop.soldOut') : t('shop.buyNow')}
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1.75,
          mb: 3.5,
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

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box
            sx={{
              height: 1,
              p: { xs: 1.75, md: 2.25 },
              bgcolor: alpha('#06090e', 0.75),
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: `1px solid ${goldAlpha(0.28)}`,
              borderTop: `2px solid ${USER_COLORS.gold}`,
              boxShadow: `0 12px 36px ${alpha('#000000', 0.7)}`,
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                bgcolor: alpha('#000000', 0.45),
                border: `1px solid ${goldAlpha(0.2)}`,
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
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
                    ...getUserChipSx('gold'),
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2.5} sx={{ height: 1 }}>
            <Box
              sx={{
                p: { xs: 2.25, md: 2.75 },
                bgcolor: alpha('#06090e', 0.75),
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: `1px solid ${goldAlpha(0.28)}`,
                borderTop: `2px solid ${USER_COLORS.gold}`,
                boxShadow: `0 12px 36px ${alpha('#000000', 0.7)}`,
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              }}
            >
              <Typography
                className="font-tr"
                sx={{
                  fontSize: 18,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: USER_COLORS.textPrimary,
                  letterSpacing: 0.6,
                  mb: 2.25,
                }}
              >
                {t('shop.detailTitle')}
              </Typography>

              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ ...userMutedTextSx, fontSize: 13 }}>{t('shop.price')}</Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 900, color: USER_COLORS.gold, textShadow: `0 0 12px ${goldAlpha(0.4)}` }}>
                    ${Number(item.price).toFixed(2)}
                  </Typography>
                </Stack>

                {item.discountPercent > 0 ? (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ ...userMutedTextSx, fontSize: 13 }}>{t('shop.originalPrice')}</Typography>
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
                        ...getUserChipSx('gold'),
                      }}
                    />
                  </>
                ) : null}

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ ...userMutedTextSx, fontSize: 13 }}>{t('shop.amount')}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                    {item.amount} {item.symbol}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {item.paymentOptions?.length ? (
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  bgcolor: alpha('#06090e', 0.75),
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: `1px solid ${goldAlpha(0.28)}`,
                  borderTop: `2px solid ${USER_COLORS.gold}`,
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: USER_COLORS.gold,
                    mb: 1.5,
                  }}
                >
                  {t('shop.paymentOptions')}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {item.paymentOptions.map((option) => (
                    <Box key={option} sx={getGlassInnerSx(tokens, { px: 1.5, py: 0.85, borderRadius: 0 })}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: USER_COLORS.textPrimary, textTransform: 'uppercase' }}>
                        {option}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : null}

            <GoToBacShopButton
              href={shopHref}
              fullWidth
              disabled={isSoldOut}
              label={isSoldOut ? t('shop.soldOut') : undefined}
            />
          </Stack>
        </Grid>
      </Grid>
    </UserPageShell>
  );
}

