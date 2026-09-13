import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Typography, ButtonBase } from '@mui/material';
import { alpha } from '@mui/material/styles';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';

import type { ILeaderboardEntry } from 'src/types';
import { UserPageShell, UserEmptyState, USER_COLORS } from 'src/layouts/user';
import { goldAlpha } from 'src/theme/accent-presets';

import { toast } from 'react-hot-toast';
import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';

import type { LeaderboardPeriod } from './leader-board-constants';
import {
  LeaderboardPodium,
  LeaderboardTable,
  LeaderboardPageSkeleton,
  LeaderboardGlassShell,
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

  const formatScore = (score: number) => score.toLocaleString();

  const fetchLeaderboard = useCallback(
    async (period: LeaderboardPeriod) => {
      try {
        setLoading(true);
        const response = await getLeaderboardApi({ period });
        const data: ILeaderboardEntry[] = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
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
  const maxScore = useMemo(() => rows[0]?.totalScore ?? 0, [rows]);

  const tableLabels = {
    games: t('leaderboard.games'),
    average: t('leaderboard.average'),
    level: t('leaderboard.level'),
  };

  const showInitialSkeleton = loading && rows.length === 0;

  return (
    <UserPageShell>
      {showInitialSkeleton ? (
        <LeaderboardPageSkeleton />
      ) : (
        <Stack spacing={2.5}>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {periods.map((period) => {
              const active = selectedPeriod === period.value;
              return (
                <ButtonBase
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '8px',
                    bgcolor: active ? goldAlpha(0.16) : alpha('#ffffff', 0.04),
                    border: `1px solid ${active ? goldAlpha(0.45) : alpha('#ffffff', 0.1)}`,
                    color: active ? USER_COLORS.gold : alpha('#ffffff', 0.72),
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                >
                  {period.label}
                </ButtonBase>
              );
            })}
          </Stack>

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
            <Stack spacing={2.5}>
              <LeaderboardGlassShell>
                <Box sx={{ px: { xs: 1.25, sm: 2 }, pt: { xs: 1.5, sm: 2 }, pb: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Iconify icon="solar:crown-bold" width={16} sx={{ color: USER_COLORS.gold }} />
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: alpha('#ffffff', 0.55),
                        fontFamily: 'monospace',
                      }}
                    >
                      Champions podium
                    </Typography>
                  </Stack>
                </Box>
                <LeaderboardPodium
                  players={topThree}
                  pointsLabel={t('leaderboard.points')}
                  formatScore={formatScore}
                />
              </LeaderboardGlassShell>

              {tableRows.length > 0 ? (
                <LeaderboardGlassShell>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 1.75 }, pb: 1 }}
                  >
                    <Iconify icon="solar:ranking-bold" width={16} sx={{ color: USER_COLORS.gold }} />
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: alpha('#ffffff', 0.55),
                        fontFamily: 'monospace',
                      }}
                    >
                      Full rankings
                    </Typography>
                  </Stack>
                  <LeaderboardTable
                    rows={tableRows}
                    labels={tableLabels}
                    formatScore={formatScore}
                    maxScore={maxScore}
                  />
                </LeaderboardGlassShell>
              ) : null}
            </Stack>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
