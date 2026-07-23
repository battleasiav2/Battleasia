import { useMemo, useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import CoinValue from 'src/components/coin-value';
import { UserAnimatedStat } from 'src/layouts/user';

import { useApi, useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks';
import { useSelector } from 'src/store';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
} from 'src/layouts/user';

import { useTranslate } from 'src/locales/use-locales';

import {
  mapApiMatchToStatistics,
  sortStatisticsByDate,
  type ApiMatchHistoryItem,
  type StatisticsItem,
} from './my-statistics-types';
import { StatisticsHero, StatisticsHistoryList, StatisticsPageSkeleton } from './components';

// ----------------------------------------------------------------------

export function MyStatisticsView() {
  const { t } = useTranslate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { getMatchHistoryApi } = useApi();
  const [statistics, setStatistics] = useState<StatisticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = useCallback(async () => {
    if (!isLoggedIn) {
      setStatistics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getMatchHistoryApi();
      if (response?.data?.status) {
        const data = response.data.data;
        const historyItems: ApiMatchHistoryItem[] = Array.isArray(data) ? data : [];
        setStatistics(sortStatisticsByDate(historyItems.map(mapApiMatchToStatistics)));
      } else {
        setStatistics([]);
      }
    } catch (error) {
      console.error('Failed to fetch statistics', error);
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  }, [getMatchHistoryApi, isLoggedIn]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useLiveSync(fetchStatistics, LIVE_SYNC_TOPICS.matches);

  const { totalPaid, totalWon, netProfit, wins, losses } = useMemo(() => {
    const paid = statistics.reduce((sum, stat) => sum + stat.paid, 0);
    const won = statistics.reduce((sum, stat) => sum + stat.won, 0);
    const profit = won - paid;
    const winCount = statistics.filter((stat) => stat.won > 0).length;
    const lossCount = statistics.filter((stat) => stat.won <= 0).length;

    return {
      totalPaid: paid,
      totalWon: won,
      netProfit: profit,
      wins: winCount,
      losses: lossCount,
    };
  }, [statistics]);

  const showInitialSkeleton = loading && statistics.length === 0;

  return (
    <UserPageShell>
      <StatisticsHero title={t('myStatistics.title')} />

      <UserPageTitle
        badge={t('myStatistics.badgePerformance')}
        title={t('myStatistics.title')}
        subtitle={t('myStatistics.subtitle')}
      />

      {showInitialSkeleton ? (
        <StatisticsPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile
              label={t('statistics.totalMatches')}
              value={<UserAnimatedStat value={statistics.length} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('myStatistics.totalPaid')}
              value={<CoinValue value={totalPaid} size={18} />}
              loading={loading}
            />
            <UserStatTile
              label={t('myStatistics.totalWon')}
              value={<CoinValue value={totalWon} size={18} />}
              loading={loading}
            />
            <UserStatTile
              label={t('myStatistics.netProfit')}
              value={
                <Stack direction="row" alignItems="center" spacing={0.25}>
                  {netProfit < 0 ? (
                    <Typography sx={{ color: USER_COLORS.error, fontWeight: 700, fontSize: 18 }}>-</Typography>
                  ) : null}
                  <CoinValue
                    value={Math.abs(netProfit)}
                    size={18}
                    textSx={{
                      fontWeight: 700,
                      color: netProfit >= 0 ? USER_COLORS.success : USER_COLORS.error,
                    }}
                  />
                </Stack>
              }
              loading={loading}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile label={t('statistics.wins')} value={wins} suffix="matches" loading={loading} />
            <UserStatTile label={t('statistics.losses')} value={losses} suffix="matches" loading={loading} />
            <UserStatTile
              label={t('statistics.winRate')}
              value={statistics.length ? `${Math.round((wins / statistics.length) * 100)}%` : '0%'}
              loading={loading}
            />
          </Box>

          {loading ? (
            <StatisticsPageSkeleton />
          ) : statistics.length === 0 ? (
            <UserEmptyState
              icon="solar:chart-2-bold-duotone"
              title={t('myStatistics.noStatistics')}
              description={t('myStatistics.noMatchesYet')}
              actionLabel={t('common.refresh')}
              onAction={fetchStatistics}
            />
          ) : (
            <UserGlassCard
              sx={{
                p: { xs: 1.5, md: 2 },
                borderColor: alpha(netProfit >= 0 ? USER_COLORS.success : USER_COLORS.error, 0.2),
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 2, px: { xs: 0.5, sm: 1 } }}
              >
                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: 16,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: USER_COLORS.gold,
                    letterSpacing: 0.5,
                  }}
                >
                  Match History
                </Typography>

                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '4px',
                    bgcolor: alpha(netProfit >= 0 ? USER_COLORS.success : USER_COLORS.error, 0.12),
                    border: `1px solid ${alpha(netProfit >= 0 ? USER_COLORS.success : USER_COLORS.error, 0.3)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
                      {t('myStatistics.netProfit')}:
                    </Typography>
                    <CoinValue
                      value={Math.abs(netProfit)}
                      size={14}
                      textSx={{
                        fontWeight: 700,
                        color: netProfit >= 0 ? USER_COLORS.success : USER_COLORS.error,
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>

              <StatisticsHistoryList
                items={statistics}
                labels={{
                  matchInfo: t('myStatistics.matchInfo'),
                  paid: t('myStatistics.paid'),
                  won: t('myStatistics.won'),
                }}
              />
            </UserGlassCard>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
