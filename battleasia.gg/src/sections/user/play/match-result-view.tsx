import { useParams, useNavigate } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';

import { fDateTime } from 'src/utils/format-time';

import {
  UserPageShell,
  UserBackButton,
  UserGlassCard,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
} from 'src/layouts/user';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';

import { useTranslate } from 'src/locales/use-locales';

import type { MatchResultData, ResultParticipant } from './match-types';
import { getMatchMapImageUrl, MATCH_RANK_COLORS } from './match-types';
import {
  MatchStatPill,
  MatchResultHero,
  MatchResultPodium,
  MatchResultSkeleton,
  MatchResultLeaderboard,
  MatchShareCard,
} from './components';

// ----------------------------------------------------------------------

function sortParticipants(participants: ResultParticipant[]) {
  const winners = participants.filter((p) => p.status === 'winner');
  const losers = participants.filter((p) => p.status === 'lose');

  return [
    ...winners.sort((a, b) => (a.placement ?? 999) - (b.placement ?? 999)),
    ...losers.sort((a, b) => (a.placement ?? 999) - (b.placement ?? 999)),
  ];
}

export function MatchResultView() {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { matchId } = useParams<{ matchId: string }>();
  const { getMatchResultApi } = useApi();

  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState('/assets/images/bounty-bg.avif');

  const fetchMatchResult = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const response = await getMatchResultApi(matchId);
      if (response?.data?.status) {
        setMatchResult(response.data.data);
        setMapImageUrl(getMatchMapImageUrl(response.data.data?.map));
      }
    } catch (error: any) {
      console.error('Failed to fetch match result:', error);
    }
    setLoading(false);
  }, [matchId, getMatchResultApi]);

  useEffect(() => {
    fetchMatchResult();
  }, [fetchMatchResult]);

  useLiveSync(fetchMatchResult, LIVE_SYNC_TOPICS.matches);

  const sortedParticipants = useMemo(
    () => sortParticipants(matchResult?.participants ?? []),
    [matchResult?.participants]
  );

  const topThree = useMemo(
    () => sortedParticipants.filter((p) => p.placement && p.placement <= 3),
    [sortedParticipants]
  );

  const summary = useMemo(() => {
    const participants = matchResult?.participants ?? [];
    const winners = participants.filter((p) => p.status === 'winner').length;
    const totalKills = participants.reduce((sum, p) => sum + (p.kills ?? 0), 0);
    const totalPrize = participants.reduce((sum, p) => sum + (p.winPrize ?? 0), 0);
    return { winners, totalKills, totalPrize, total: participants.length };
  }, [matchResult?.participants]);

  const handleMapError = useCallback(() => {
    setMapImageUrl('/assets/images/bounty-bg.avif');
  }, []);

  if (loading) {
    return (
      <UserPageShell>
        <Stack direction="row" sx={{ mb: 2 }}>
          <UserBackButton onClick={() => navigate(-1)} />
        </Stack>
        <MatchResultSkeleton />
      </UserPageShell>
    );
  }

  if (!matchResult) {
    return (
      <UserPageShell>
        <UserEmptyState
          icon="solar:trophy-bold-duotone"
          title={t('match.resultNotFound')}
          description={t('match.resultNotFoundDescription')}
          actionLabel={t('common.goBack')}
          onAction={() => navigate(-1)}
        />
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <UserBackButton onClick={() => navigate(-1)} />
      </Stack>

      <Stack spacing={3}>
        <MatchResultHero
          match={matchResult}
          mapImageUrl={mapImageUrl}
          onMapError={handleMapError}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          <UserStatTile label={t('match.winners')} value={summary.winners} suffix={t('match.suffixPlayers')} />
          <UserStatTile label={t('match.participants')} value={summary.total} suffix={t('match.suffixTotal')} />
          <UserStatTile label={t('match.totalKills')} value={summary.totalKills} />
          <UserStatTile
            label={t('match.prizePool')}
            value={<CoinValue value={summary.totalPrize} size={18} />}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
            gap: 1.5,
          }}
        >
          <MatchStatPill label={t('match.game')}>{matchResult.gameName || '-'}</MatchStatPill>
          <MatchStatPill label={t('match.typeLabel')}>{matchResult.matchType?.toUpperCase() || '-'}</MatchStatPill>
          <MatchStatPill label={t('match.map')}>{matchResult.map || '-'}</MatchStatPill>
          <MatchStatPill label={t('match.team')}>{matchResult.teamType?.toUpperCase() || '-'}</MatchStatPill>
          <MatchStatPill label={t('match.perKill')}>
            <CoinValue value={matchResult.perKill ?? 0} size={14} />
          </MatchStatPill>
          <MatchStatPill label={t('match.players')}>
            {`${matchResult.participantsCount ?? '-'} / ${matchResult.totalPlayer ?? '-'}`}
          </MatchStatPill>
        </Box>

        {topThree.length > 0 ? (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Iconify icon="solar:trophy-bold" width={22} sx={{ color: MATCH_RANK_COLORS[1] }} />
              <Typography
                className="font-tr"
                sx={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.gold, letterSpacing: 0.5 }}
              >
                Top Performers
              </Typography>
            </Stack>
            <MatchResultPodium topThree={topThree} />
          </Box>
        ) : null}

        <MatchShareCard matchId={matchResult.id} matchName={matchResult.matchName} />

        <UserGlassCard noPadding>
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:ranking-bold-duotone" width={22} sx={{ color: USER_COLORS.gold }} />
                <Typography
                  className="font-tr"
                  sx={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.gold }}
                >
                  Full Leaderboard
                </Typography>
              </Stack>
              {matchResult.matchSchedule ? (
                <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>
                  {fDateTime(matchResult.matchSchedule, 'DD/MM/YYYY hh:mm a')}
                </Typography>
              ) : null}
            </Stack>
            <BattleGoldDivider variant="section" sx={{ mt: 1, width: 140 }} />
          </Box>

          <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            <MatchResultLeaderboard participants={sortedParticipants} />
          </Box>
        </UserGlassCard>
      </Stack>
    </UserPageShell>
  );
}