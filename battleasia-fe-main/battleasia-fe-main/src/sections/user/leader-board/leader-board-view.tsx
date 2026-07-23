import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';

import type { ILeaderboardEntry } from 'src/types';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserStatTile,
  UserEmptyState,
  UserActionButton,
} from 'src/layouts/user';

import { toast } from 'react-hot-toast';
import { useTranslate } from 'src/locales/use-locales';
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
    [getLeaderboardApi]
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

  return (
    <UserPageShell>
      <LeaderboardHero title={t('leaderboard.title')} />

      <UserPageTitle
        badge={t('leaderboard.badgeGlobalRankings')}
        title={t('leaderboard.title')}
        subtitle={t('leaderboard.subtitle')}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ display: { xs: 'none', md: 'flex' } }}>
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
        }
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3, display: { xs: 'flex', md: 'none' } }}>
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

      {showInitialSkeleton ? (
        <LeaderboardPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile
              label={t('leaderboard.playersCount')}
              value={<UserAnimatedStat value={stats.players} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('leaderboard.totalScore')}
              value={<UserAnimatedStat value={stats.topScore} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('leaderboard.games')}
              value={<UserAnimatedStat value={stats.topGames} variant="h5" fontWeight={700} />}
              loading={loading}
            />
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
                <UserGlassCard sx={{ p: { xs: 1.5, md: 2 } }}>
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
