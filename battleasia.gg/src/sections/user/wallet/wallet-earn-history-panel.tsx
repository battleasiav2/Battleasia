import { useCallback, useEffect, useMemo, useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { useSelector } from 'src/store';

import {
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, ENGAGEMENT_REWARD_REASONS } from './wallet-earn-hub-styles';
import type { BalanceHistoryItem } from './components/wallet-transaction-list';

type Props = {
  getTransactionTitle: (item: BalanceHistoryItem) => string;
  formatDate: (date: Date | string | null) => string;
  refreshKey?: number;
};

function mapHistoryItems(results: unknown[]): BalanceHistoryItem[] {
  if (!Array.isArray(results)) return [];
  return results.map((item: any) => ({
    id: item.id || item._id,
    amount: Number(item.amount) || 0,
    type: item.type,
    detail: item.detail && typeof item.detail === 'object' ? item.detail : {},
    createdAt: item.createdAt ? new Date(item.createdAt) : null,
    balanceBefore: Number(item.balanceBefore) || 0,
    balanceAfter: Number(item.balanceAfter) || 0,
    performedBy: item.performedBy || null,
  }));
}

export function WalletEarnHistoryPanel({ getTransactionTitle, formatDate, refreshKey = 0 }: Props) {
  const { t } = useTranslate();
  const { getBalanceHistoryApi } = useApi();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BalanceHistoryItem[]>([]);
  const glassTokens = getDefaultGlassTokens();

  const loadHistory = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getBalanceHistoryApi({ page: 1, limit: 100 });
      const results = response?.data?.data?.results;
      const mapped = mapHistoryItems(results).filter((item) =>
        ENGAGEMENT_REWARD_REASONS.has(String(item.detail?.reason || ''))
      );
      setItems(mapped);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getBalanceHistoryApi, user?._id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshKey]);

  const totalEarned = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [items]
  );

  return (
    <Stack spacing={1.5}>
      <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
        <Typography className="font-tr" sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
          {t('wallet.earnHubHistoryTitle')}
        </Typography>
        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.5 }}>
          {t('wallet.earnHubHistoryHint')}
        </Typography>
        {items.length > 0 ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
            <Typography sx={{ fontSize: 12, color: alpha(EARN_HUB_GOLD, 0.9), fontWeight: 700 }}>
              {t('wallet.earnHubHistoryTotal')}
            </Typography>
            <CoinValue value={totalEarned} size={14} />
          </Stack>
        ) : null}
      </UserGlassCard>

      <UserGlassCard sx={{ p: { xs: 1.5, md: 2 } }}>
        {loading ? (
          <Typography sx={{ ...userMutedTextSx, textAlign: 'center', py: 4, fontSize: 13 }}>
            {t('common.loading')}
          </Typography>
        ) : items.length === 0 ? (
          <UserEmptyState
            title={t('wallet.earnHubHistoryEmpty')}
            description={t('wallet.earnHubHistoryEmptyHint')}
          />
        ) : (
          <Stack spacing={1}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={getGlassInnerSx(glassTokens, {
                  p: 1.5,
                  borderLeft: `3px solid ${EARN_HUB_GOLD}`,
                })}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: USER_COLORS.textPrimary }}>
                      {getTransactionTitle(item)}
                    </Typography>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 11.5, mt: 0.35 }}>
                      {formatDate(item.createdAt)}
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5}>
                    <CoinValue value={item.amount} size={14} />
                    <Box
                      component="span"
                      sx={{
                        ...getUserChipSx('success'),
                        fontSize: 10,
                        px: 0.75,
                        py: 0.15,
                        height: 'auto',
                      }}
                    >
                      {t('wallet.earnings')}
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </UserGlassCard>
    </Stack>
  );
}

export type EarnHubTab = 'earn' | 'streak' | 'history';

export function WalletEarnHubTabs({
  activeTab,
  onChange,
  claimableCount,
  streakClaimable,
}: {
  activeTab: EarnHubTab;
  onChange: (tab: EarnHubTab) => void;
  claimableCount: number;
  streakClaimable: boolean;
}) {
  const { t } = useTranslate();

  const tabs: Array<{ label: string; value: EarnHubTab; badge?: number }> = [
    { label: t('wallet.earnHubTabEarn'), value: 'earn', badge: claimableCount > 0 ? claimableCount : undefined },
    { label: t('wallet.earnHubTabStreak'), value: 'streak', badge: streakClaimable ? 1 : undefined },
    { label: t('wallet.earnHubTabHistory'), value: 'history' },
  ];

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        p: 0.75,
        borderRadius: 2,
        bgcolor: alpha('#0a0a0a', 0.65),
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Box
            key={tab.value}
            onClick={() => onChange(tab.value)}
            sx={{
              position: 'relative',
              px: { xs: 1.5, md: 2.25 },
              py: { xs: 1, md: 1.15 },
              cursor: 'pointer',
              borderRadius: 1.5,
              flex: { xs: '1 1 0', md: '0 0 auto' },
              minWidth: 0,
              textAlign: 'center',
              bgcolor: isActive ? alpha(EARN_HUB_GOLD, 0.14) : 'transparent',
              border: isActive ? `1px solid ${alpha(EARN_HUB_GOLD, 0.35)}` : '1px solid transparent',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                bgcolor: isActive ? alpha(EARN_HUB_GOLD, 0.18) : alpha('#ffffff', 0.05),
              },
            }}
          >
            <Typography
              className="font-tr"
              sx={{
                color: isActive ? EARN_HUB_GOLD : alpha('#ffffff', 0.55),
                fontWeight: isActive ? 800 : 500,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                fontSize: { xs: 10.5, md: 12 },
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </Typography>
            {tab.badge ? (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 6,
                  minWidth: 16,
                  height: 16,
                  px: 0.5,
                  borderRadius: 99,
                  bgcolor: EARN_HUB_GOLD,
                  color: '#0a0a0a',
                  fontSize: 9,
                  fontWeight: 900,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {tab.badge}
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Stack>
  );
}
