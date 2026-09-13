import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import {
  goldAlpha,
  USER_COLORS,
  UserPageShell,
  UserEmptyState,
  UserActionButton,
  UserAnimatedStat,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { PlayTabs } from 'src/components/play-tabs';
import { CoinValue } from 'src/components/coin-value';
import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { toast } from 'react-hot-toast';

import { useTranslate } from 'src/locales/use-locales';

import { OrdersHero, OrdersPageSkeleton } from './components';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

function statusColor(status: string) {
  switch (status) {
    case 'completed':
      return USER_COLORS.success;
    case 'paid':
      return USER_COLORS.info;
    case 'pending':
      return GOLD;
    case 'cancelled':
      return USER_COLORS.error;
    default:
      return alpha('#ffffff', 0.55);
  }
}

export function MyOrdersView() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const api = useApi();
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

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    }),
    [orders]
  );

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('myOrders.pending'),
      paid: t('myOrders.paid'),
      completed: t('myOrders.completed'),
      cancelled: t('myOrders.cancelled'),
    };
    return map[status] || status;
  };

  const showInitialSkeleton = loading && orders.length === 0;

  const statCells = [
    {
      label: t('myOrders.totalOrders'),
      value: <UserAnimatedStat value={stats.total} variant="h5" fontWeight={700} />,
    },
    {
      label: t('myOrders.pendingOrders'),
      value: <UserAnimatedStat value={stats.pending} variant="h5" fontWeight={700} />,
    },
    {
      label: t('myOrders.completedOrders'),
      value: <UserAnimatedStat value={stats.completed} variant="h5" fontWeight={700} />,
    },
  ];

  const shopCta = (
    <UserActionButton
      actionVariant="gold"
      size="small"
      startIcon={<Iconify icon="solar:shop-bold" width={16} />}
      onClick={() => navigate(paths.user.shop)}
      sx={{ py: 0.75, px: 1.5, fontSize: 12 }}
    >
      {t('shop.title')}
    </UserActionButton>
  );

  return (
    <UserPageShell>
      <OrdersHero title={t('myOrders.title')} action={shopCta} />

      <Stack sx={{ mb: 2, display: { xs: 'flex', md: 'none' } }}>{shopCta}</Stack>

      {showInitialSkeleton ? (
        <OrdersPageSkeleton />
      ) : (
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
              width: 1,
              bgcolor: alpha('#06090e', 0.72),
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: `1px solid ${goldAlpha(0.28)}`,
              borderTop: `2px solid ${GOLD}`,
              boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
              clipPath: {
                xs: 'none',
                md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              },
            }}
          >
            {statCells.map((cell, index) => (
              <Box
                key={cell.label}
                sx={{
                  minWidth: 0,
                  px: { xs: 1.25, md: 2.25 },
                  py: { xs: 1.5, md: 2 },
                  borderRight:
                    index < statCells.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: alpha('#ffffff', 0.45),
                    mb: 0.75,
                  }}
                >
                  {cell.label}
                </Typography>
                <Box sx={{ color: USER_COLORS.textPrimary }}>{cell.value}</Box>
              </Box>
            ))}
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
            <Box
              sx={{
                bgcolor: alpha('#06090e', 0.72),
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: `1px solid ${goldAlpha(0.28)}`,
                borderTop: `2px solid ${GOLD}`,
                boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
                clipPath: {
                  xs: 'none',
                  md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
                },
                overflow: 'hidden',
              }}
            >
              {filteredOrders.map((order, index) => {
                const firstItem = order.items?.[0];
                const isLast = index === filteredOrders.length - 1;
                const title = firstItem?.name || t('myOrders.orderItem');
                const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : '—';
                const address = order.shippingAddress?.address1;
                const meta = [
                  date,
                  address ? address : null,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Box
                    key={order._id}
                    component="button"
                    type="button"
                    onClick={() => navigate(paths.user.shop)}
                    sx={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 1.25, sm: 1.75 },
                      width: 1,
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1.25, sm: 1.5 },
                      cursor: 'pointer',
                      borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: goldAlpha(0.06),
                        '& .order-title': { color: GOLD },
                        '& .order-chevron': { color: GOLD, transform: 'translateX(3px)' },
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={firstItem?.image || '/assets/images/shop.webp'}
                      alt=""
                      sx={{
                        width: { xs: 56, sm: 72 },
                        height: { xs: 56, sm: 72 },
                        flexShrink: 0,
                        objectFit: 'cover',
                        bgcolor: '#0a0a0a',
                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                      }}
                    />

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                        <Typography
                          className="order-title font-tr"
                          sx={{
                            fontSize: { xs: 13, sm: 15 },
                            fontWeight: 800,
                            color: USER_COLORS.textPrimary,
                            textTransform: 'uppercase',
                            lineHeight: 1.2,
                            transition: 'color 0.2s ease',
                          }}
                        >
                          {title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                            color: statusColor(order.status),
                          }}
                        >
                          {getStatusLabel(order.status)}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: { xs: 11, sm: 12 },
                          color: alpha('#ffffff', 0.5),
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {meta}
                      </Typography>
                    </Box>

                    <Stack
                      alignItems="flex-end"
                      spacing={0.35}
                      sx={{ flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}
                    >
                      <Typography
                        sx={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          color: alpha('#ffffff', 0.4),
                          textTransform: 'uppercase',
                        }}
                      >
                        {t('myOrders.total')}
                      </Typography>
                      <CoinValue value={order.total || 0} size={14} />
                    </Stack>

                    <Iconify
                      className="order-chevron"
                      icon="solar:alt-arrow-right-bold"
                      width={16}
                      sx={{
                        flexShrink: 0,
                        color: alpha('#ffffff', 0.35),
                        transition: 'color 0.2s ease, transform 0.2s ease',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
