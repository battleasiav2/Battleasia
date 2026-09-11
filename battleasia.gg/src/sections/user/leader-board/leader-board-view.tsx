import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';

import type { ILeaderboardEntry } from 'src/types';
import {
  UserPageShell,
  UserGlassCard,
  UserEmptyState,
  UserActionButton,
  USER_COLORS,
  goldAlpha,
} from 'src/layouts/user';

import { toast } from 'react-hot-toast';
import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';
import { UserAnimatedStat } from 'src/layouts/user';

import type { LeaderboardPeriod } from './leader-board-constants';
import {
  LeaderboardHero,
  LeaderboardPodium,
  LeaderboardTable,
  LeaderboardPageSkeleton,
} from './components';

// ----------------------------------------------------------------------

export function LeaderBoardView() {
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('all');
  const [rows, setRows] = useState<ILeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const { getLeaderboardApi } = useApi();
  const { t } = useTranslate();

  const periods = [
    { value: 'all' as const, label: t('leaderboard.allTime') },
    { value: 'weekly' as const, label: t('leaderboard.thisWeek') },
    { value: 'monthly' as const, label: t('leaderboard.thisMonth') },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatScore = (score: number) => score.toLocaleString();

  const fetchLeaderboard = useCallback(
    async (period: LeaderboardPeriod) => {
      try {
        setLoading(true);
        const response = await getLeaderboardApi({ period });
        const data: ILeaderboardEntry[] = Array.isArray(response?.data?.data) ? response.data.data : [];
        setRows(data);
      } catch (error) {
        console.error(error);
        toast.error(t('leaderboard.failedToLoad'));
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [getLeaderboardApi, t]
  );

  useEffect(() => {
    fetchLeaderboard(selectedPeriod);
  }, [fetchLeaderboard, selectedPeriod]);

  useLiveSync(
    useCallback(() => {
      fetchLeaderboard(selectedPeriod);
    }, [fetchLeaderboard, selectedPeriod]),
    LIVE_SYNC_TOPICS.dashboard
  );

  const topThree = useMemo(() => rows.slice(0, 3), [rows]);
  const tableRows = useMemo(() => rows.slice(3), [rows]);

  const stats = useMemo(
    () => ({
      players: rows.length,
      topScore: rows[0]?.totalScore ?? 0,
      topGames: rows[0]?.gamesPlayed ?? 0,
    }),
    [rows]
  );

  const tableLabels = {
    rank: t('leaderboard.rank'),
    player: t('leaderboard.player'),
    totalScore: t('leaderboard.totalScore'),
    games: t('leaderboard.games'),
    average: t('leaderboard.average'),
    badge: t('leaderboard.badge'),
    lastPlayed: t('leaderboard.lastPlayed'),
    level: t('leaderboard.level'),
  };

  const showInitialSkeleton = loading && rows.length === 0;

  const periodButtons = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {periods.map((period) => (
        <UserActionButton
          key={period.value}
          size="small"
          actionVariant={selectedPeriod === period.value ? 'gold' : 'ghost'}
          onClick={() => setSelectedPeriod(period.value)}
        >
          {period.label}
        </UserActionButton>
      ))}
    </Stack>
  );

  return (
    <UserPageShell>
      <LeaderboardHero
        title={t('leaderboard.title')}
        subtitle={t('leaderboard.subtitle')}
        action={<Box sx={{ display: { xs: 'none', md: 'block' } }}>{periodButtons}</Box>}
      />

      <Box sx={{ mb: 1.5, display: { xs: 'block', md: 'none' } }}>{periodButtons}</Box>

      {showInitialSkeleton ? (
        <LeaderboardPageSkeleton />
      ) : (
        <Stack spacing={1.75}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
              width: 1,
              bgcolor: alpha('#06090e', 0.72),
              border: `1px solid ${goldAlpha(0.28)}`,
              borderTop: `2px solid ${USER_COLORS.gold}`,
              boxShadow: `0 8px 24px ${alpha('#000000', 0.45)}`,
            }}
          >
            {[
              {
                icon: 'solar:users-group-rounded-bold',
                label: t('leaderboard.playersCount'),
                value: <UserAnimatedStat value={stats.players} variant="h5" fontWeight={700} />,
              },
              {
                icon: 'solar:cup-star-bold',
                label: t('leaderboard.totalScore'),
                value: <UserAnimatedStat value={stats.topScore} variant="h5" fontWeight={700} />,
              },
              {
                icon: 'solar:gamepad-bold',
                label: t('leaderboard.games'),
                value: <UserAnimatedStat value={stats.topGames} variant="h5" fontWeight={700} />,
              },
            ].map((stat, index, arr) => (
              <Box
                key={stat.label}
                sx={{
                  minWidth: 0,
                  px: { xs: 1.25, md: 1.5 },
                  py: { xs: 1.25, md: 1.5 },
                  borderRight: {
                    xs: index === 0 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                    md: index < arr.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
                  },
                  borderBottom: {
                    xs: index < 2 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                    md: 'none',
                  },
                  gridColumn: { xs: index === 2 ? '1 / -1' : 'auto', md: 'auto' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5, minWidth: 0 }}>
                  <Iconify icon={stat.icon} width={14} sx={{ color: USER_COLORS.gold, flexShrink: 0 }} />
                  <Typography
                    sx={{
                      fontSize: { xs: 10, md: 11 },
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      color: alpha('#ffffff', 0.55),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    fontSize: { xs: 18, md: 20 },
                    fontWeight: 800,
                    color: USER_COLORS.textPrimary,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {loading ? '—' : stat.value}
                </Box>
              </Box>
            ))}
          </Box>

          {loading ? (
            <LeaderboardPageSkeleton />
          ) : rows.length === 0 ? (
            <UserEmptyState
              icon="solar:trophy-bold-duotone"
              title={t('leaderboard.noData')}
              description={t('leaderboard.emptyDescription')}
              actionLabel={t('common.refresh')}
              onAction={() => fetchLeaderboard(selectedPeriod)}
            />
          ) : (
            <>
              <LeaderboardPodium
                players={topThree}
                pointsLabel={t('leaderboard.points')}
                gamesLabel={t('leaderboard.games')}
                averageLabel={t('leaderboard.average')}
                formatScore={formatScore}
              />

              {tableRows.length > 0 ? (
                <UserGlassCard sx={{ p: { xs: 1.25, md: 1.75 } }}>
                  <LeaderboardTable
                    rows={tableRows}
                    labels={tableLabels}
                    formatScore={formatScore}
                    getRankIcon={getRankIcon}
                  />
                </UserGlassCard>
              ) : null}
            </>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
