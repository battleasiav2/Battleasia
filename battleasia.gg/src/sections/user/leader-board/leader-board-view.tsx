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

import type { LeaderboardPeriod } from './leader-board-constants';
import { LeaderboardTable, LeaderboardPageSkeleton, LeaderboardGlassShell } from './components';

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

  const tableLabels = useMemo(
    () => ({
      rank: t('leaderboard.rank'),
      player: t('leaderboard.player'),
      wins: t('leaderboard.wins'),
      matches: t('leaderboard.matches'),
      games: t('leaderboard.games'),
      average: t('leaderboard.average'),
      level: t('leaderboard.level'),
    }),
    [t]
  );

  const showInitialSkeleton = loading && rows.length === 0;

  return (
    <UserPageShell>
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: USER_COLORS.gold,
              mb: 0.75,
            }}
          >
            {t('leaderboard.hallEyebrow')}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 28, sm: 34 },
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {t('leaderboard.title')}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              maxWidth: 52 * 8,
              fontSize: { xs: 13, sm: 14 },
              color: alpha('#ffffff', 0.55),
              lineHeight: 1.5,
            }}
          >
            {t('leaderboard.hallDescription')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            p: 0.5,
            borderRadius: 999,
            bgcolor: alpha('#ffffff', 0.04),
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            gap: 0.35,
            flexWrap: 'wrap',
          }}
        >
          {periods.map((period) => {
            const active = selectedPeriod === period.value;
            return (
              <ButtonBase
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                sx={{
                  px: 1.75,
                  py: 0.9,
                  borderRadius: 999,
                  bgcolor: active ? USER_COLORS.gold : 'transparent',
                  color: active ? '#111111' : alpha('#ffffff', 0.62),
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  textTransform: 'uppercase',
                  minHeight: 36,
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    bgcolor: active ? USER_COLORS.gold : goldAlpha(0.1),
                  },
                }}
              >
                {period.label}
              </ButtonBase>
            );
          })}
        </Box>

        {showInitialSkeleton || loading ? (
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
          <LeaderboardGlassShell>
            <Box sx={{ pt: { xs: 1.5, sm: 1.75 } }}>
              <LeaderboardTable rows={rows} labels={tableLabels} />
            </Box>
          </LeaderboardGlassShell>
        )}
      </Stack>
    </UserPageShell>
  );
}
