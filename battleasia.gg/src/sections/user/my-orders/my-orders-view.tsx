import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Chip,
  Stack,
  Typography,
  Grid2 as Grid,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import {
  UserPageShell,
  UserGlassCard,
  UserActionButton,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
} from 'src/layouts/user';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { PlayTabs } from 'src/components/play-tabs';
import { CoinValue } from 'src/components/coin-value';
import { UserAnimatedStat } from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { toast } from 'react-hot-toast';

import { useTranslate } from 'src/locales/use-locales';

import { OrdersHero, OrdersPageSkeleton } from './components';

// ----------------------------------------------------------------------

export function MyOrdersView() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const api = useApi();
  const tokens = getDefaultGlassTokens();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'all', label: t('myOrders.all') },
    { value: 'pending', label: t('myOrders.pending') },
    { value: 'paid', label: t('myOrders.paid') },
    { value: 'completed', label: t('myOrders.completed') },
    { value: 'cancelled', label: t('myOrders.cancelled') },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.listMyOrdersApi();
      setOrders(res?.data?.data?.results || []);
    } catch {
      toast.error(t('myOrders.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useLiveSync(fetchOrders, LIVE_SYNC_TOPICS.orders);

  const filteredOrders =
    selectedStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  }), [orders]);

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('myOrders.pending'),
      paid: t('myOrders.paid'),
      completed: t('myOrders.completed'),
      cancelled: t('myOrders.cancelled'),
    };
    return map[status] || status;
  };

  const getStatusSx = (status: string) => {
    switch (status) {
      case 'completed':
        return getUserChipSx('success');
      case 'paid':
        return getUserChipSx('info');
      case 'pending':
        return getUserChipSx('gold');
      case 'cancelled':
        return getUserChipSx('error');
      default:
        return getUserChipSx('neutral');
    }
  };

  const showInitialSkeleton = loading && orders.length === 0;

  return (
    <UserPageShell>
      <OrdersHero
        title={t('myOrders.title')}
        subtitle={t('myOrders.subtitle')}
        action={
          <UserActionButton
            actionVariant="gold"
            startIcon={<Iconify icon="solar:shop-bold" width={18} />}
            onClick={() => navigate(paths.user.shop)}
          >
            {t('shop.title')}
          </UserActionButton>
        }
      />

      <Stack sx={{ mb: 2.5, display: { xs: 'flex', md: 'none' } }}>
        <UserActionButton
          actionVariant="gold"
          startIcon={<Iconify icon="solar:shop-bold" width={18} />}
          onClick={() => navigate(paths.user.shop)}
          fullWidth
        >
          {t('shop.title')}
        </UserActionButton>
      </Stack>

      {showInitialSkeleton ? (
        <OrdersPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile label={t('myOrders.totalOrders')} value={<UserAnimatedStat value={stats.total} variant="h5" fontWeight={700} />} />
            <UserStatTile label={t('myOrders.pendingOrders')} value={<UserAnimatedStat value={stats.pending} variant="h5" fontWeight={700} />} />
            <UserStatTile label={t('myOrders.completedOrders')} value={<UserAnimatedStat value={stats.completed} variant="h5" fontWeight={700} />} />
          </Box>

          <PlayTabs
            tabs={statusOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            activeTab={selectedStatus}
            onChange={setSelectedStatus}
          />

          {loading ? (
            <OrdersPageSkeleton />
          ) : filteredOrders.length === 0 ? (
            <UserEmptyState
              icon="solar:bag-heart-bold-duotone"
              title={t('myOrders.noOrders')}
              description={
                selectedStatus === 'all'
                  ? t('myOrders.noOrdersYet')
                  : t('myOrders.noOrdersStatus', { status: selectedStatus })
              }
              actionLabel={t('myOrders.buyAgain')}
              onAction={() => navigate(paths.user.shop)}
            />
          ) : (
            <Grid container spacing={2}>
              {filteredOrders.map((order) => {
                const firstItem = order.items?.[0];
                return (
                  <Grid key={order._id} size={{ xs: 12 }}>
                    <UserGlassCard
                      sx={{
                        p: { xs: 2, md: 2.5 },
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2.5,
                        transition: 'transform 0.2s, border-color 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: alpha(USER_COLORS.gold, 0.35),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: '100%', md: 180 },
                          height: { xs: 180, md: 180 },
                          flexShrink: 0,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          src={firstItem?.image || '/assets/images/shop.webp'}
                          alt={firstItem?.name || 'Order item'}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>

                      <Stack spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={2}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography className="font-tr" sx={{ mb: 0.75, fontWeight: 800, fontSize: 18, color: USER_COLORS.textPrimary, textTransform: 'uppercase' }}>
                              {firstItem?.name || t('myOrders.orderItem')}
                            </Typography>
                            <Typography sx={{ ...userMutedTextSx, fontSize: 12, mb: 0.5 }}>
                              {t('myOrders.orderId')}: {order._id}
                            </Typography>
                            <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                              {t('myOrders.date')}: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                            </Typography>
                          </Box>
                          <Chip label={getStatusLabel(order.status)} size="small" sx={{ fontWeight: 700, ...getStatusSx(order.status) }} />
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={2}>
                          <Box>
                            <Typography sx={{ ...userMutedTextSx, fontSize: 11, mb: 0.5, textTransform: 'uppercase' }}>
                              {t('myOrders.total')}
                            </Typography>
                            <Typography component="div" sx={{ color: USER_COLORS.gold, fontWeight: 700 }}>
                              <CoinValue value={order.total || 0} size={20} />
                            </Typography>
                          </Box>
                          <UserActionButton
                            actionVariant="ghost"
                            startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                            onClick={() => navigate(paths.user.shop)}
                          >
                            {t('myOrders.buyAgain')}
                          </UserActionButton>
                        </Stack>

                        <Box sx={getGlassInnerSx(tokens, { p: 1.5 })}>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Iconify icon="solar:map-point-bold" width={20} sx={{ color: USER_COLORS.gold, mt: 0.25 }} />
                            <Box>
                              <Typography sx={{ ...userMutedTextSx, fontSize: 11, display: 'block', mb: 0.5, textTransform: 'uppercase' }}>
                                {t('myOrders.shippingAddress')}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: USER_COLORS.textSubtle }}>
                                {order.shippingAddress?.address1 || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </UserGlassCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
