import { useMemo, useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import CoinValue from 'src/components/coin-value';
import {
  USER_COLORS,
  UserPageShell,
  UserEmptyState,
  UserAnimatedStat,
  goldAlpha,
} from 'src/layouts/user';

import { useApi, useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks';
import { useSelector } from 'src/store';

import { useTranslate } from 'src/locales/use-locales';

import {
  type StatisticsItem,
  sortStatisticsByDate,
  mapApiMatchToStatistics,
  type ApiMatchHistoryItem,
} from './my-statistics-types';
import { StatisticsHero, StatisticsHistoryList, StatisticsPageSkeleton } from './components';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

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

  const { totalPaid, totalWon, netProfit, wins, losses, winRate } = useMemo(() => {
    const paid = statistics.reduce((sum, stat) => sum + stat.paid, 0);
    const won = statistics.reduce((sum, stat) => sum + stat.won, 0);
    const profit = won - paid;
    const winCount = statistics.filter((stat) => stat.won > 0).length;
    const lossCount = statistics.filter((stat) => stat.won <= 0).length;
    const rate = statistics.length ? Math.round((winCount / statistics.length) * 100) : 0;

    return {
      totalPaid: paid,
      totalWon: won,
      netProfit: profit,
      wins: winCount,
      losses: lossCount,
      winRate: rate,
    };
  }, [statistics]);

  const showInitialSkeleton = loading && statistics.length === 0;

  const statCells = [
    {
      label: t('statistics.totalMatches'),
      value: <UserAnimatedStat value={statistics.length} variant="h5" fontWeight={700} />,
    },
    {
      label: t('myStatistics.totalPaid'),
      value: <CoinValue value={totalPaid} size={18} />,
    },
    {
      label: t('myStatistics.totalWon'),
      value: <CoinValue value={totalWon} size={18} />,
    },
    {
      label: t('myStatistics.netProfit'),
      value: (
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
      ),
    },
    {
      label: t('statistics.wins'),
      value: <UserAnimatedStat value={wins} variant="h5" fontWeight={700} />,
    },
    {
      label: t('statistics.losses'),
      value: <UserAnimatedStat value={losses} variant="h5" fontWeight={700} />,
    },
    {
      label: t('statistics.winRate'),
      value: (
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: USER_COLORS.textPrimary }}>
          {winRate}%
        </Typography>
      ),
    },
  ];

  return (
    <UserPageShell>
      <StatisticsHero title={t('myStatistics.title')} />

      {showInitialSkeleton ? (
        <StatisticsPageSkeleton />
      ) : (
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
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
                  px: { xs: 1.75, md: 2.25 },
                  py: { xs: 1.75, md: 2 },
                  borderRight: {
                    xs: index % 2 === 0 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                    md: index % 4 !== 3 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
                  },
                  borderBottom: {
                    xs: index < statCells.length - 2 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                    md: index < 4 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                  },
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
              <StatisticsHistoryList
                items={statistics}
                labels={{
                  matchInfo: t('myStatistics.matchInfo'),
                  paid: t('myStatistics.paid'),
                  won: t('myStatistics.won'),
                }}
              />
            </Box>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
