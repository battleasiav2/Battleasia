import { useParams, useNavigate } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Grid2 as Grid, Stack } from '@mui/material';

import useApi from 'src/hooks/use-api';

import { CONFIG } from 'src/global-config';
import { useImagePreloader, useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks';
import { useSelector, useDispatch } from 'src/store';
import { balanceAction } from 'src/store/reducers/auth';
import {
  UserPageShell,
  UserArenaStrip,
  UserBackButton,
  UserStatTile,
  UserEmptyState,
} from 'src/layouts/user';
import { socketService } from 'src/lib/socket';

import { toast } from 'react-hot-toast';
import { useTranslate } from 'src/locales/use-locales';
import { PlayTabs } from 'src/components/play-tabs';

import { PLAY_IMAGE_PATHS } from './play-constants';
import type { IMatch, MatchTab } from './match-types';
import {
  MatchCard,
  MatchJoinDialog,
  MatchPageSkeleton,
} from './components';

// ----------------------------------------------------------------------

export function MatchView() {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { gameId } = useParams<{ gameId: string }>();
  const { getMatchesApi, joinMatchApi } = useApi();
  const dispatch = useDispatch();
  const { balance = 0, user } = useSelector((state) => state.auth);
  const isPremiumUser = !!user?.isPremium && (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt).getTime() > Date.now());

  const [activeTab, setActiveTab] = useState<MatchTab>('ongoing');
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [joiningMatchId, setJoiningMatchId] = useState<string | null>(null);
  const [confirmMatch, setConfirmMatch] = useState<IMatch | null>(null);

  useImagePreloader([PLAY_IMAGE_PATHS.game2], { delay: 300, continueOnError: true });

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const response = await getMatchesApi(gameId);
    if (response.data.status) {
      setMatches(response.data.data);
    }
    setLoading(false);
  }, [gameId, getMatchesApi]);

  useEffect(() => {
    if (gameId) {
      fetchMatches();
    } else {
      setMatches([]);
    }
  }, [gameId, fetchMatches]);

  useLiveSync(fetchMatches, LIVE_SYNC_TOPICS.matches);

  const handleMatchCreated = useCallback(
    (newMatch: IMatch) => {
      const currentGameId = gameId?.toString();
      const newMatchGameId = newMatch.gameId?.toString();

      if (newMatchGameId === currentGameId) {
        setMatches((prev) => {
          const exists = prev.some((m) => m.id === newMatch.id);
          if (exists) return prev;
          return [newMatch, ...prev];
        });
        toast.success(t('match.newMatchAvailable'));
      }
    },
    [gameId, t]
  );

  const handleMatchUpdated = useCallback(
    (updatedMatch: IMatch) => {
      const currentGameId = gameId?.toString();
      const updatedMatchGameId = updatedMatch.gameId?.toString();

      if (updatedMatchGameId === currentGameId) {
        setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
      }
    },
    [gameId]
  );

  useEffect(() => {
    if (!gameId) {
      return undefined;
    }

    socketService.connect(CONFIG.serverUrl);
    socketService.joinGameRoom(gameId);

    socketService.onMatchCreated(handleMatchCreated);
    socketService.onMatchUpdated(handleMatchUpdated);

    return () => {
      socketService.leaveGameRoom(gameId);
      socketService.offMatchCreated(handleMatchCreated);
      socketService.offMatchUpdated(handleMatchUpdated);
    };
  }, [gameId, handleMatchCreated, handleMatchUpdated]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = useCallback((tab: string) => {
    const allowedTabs: MatchTab[] = ['ongoing', 'upcoming', 'results'];
    if (allowedTabs.includes(tab as MatchTab)) {
      setActiveTab(tab as MatchTab);
    }
  }, []);

  const handleJoinMatch = useCallback(
    async (match: IMatch) => {
      if (joiningMatchId) return;

      if (match.entryFee > balance) {
        toast.error(t('match.insufficientBalance'), { id: 'insufficient-balance' });
        return;
      }

      const pubgId = (user?.pubgId || '').trim();
      if (!pubgId) {
        toast.error(t('match.pubgIdRequired'), { id: 'pubg-id-required' });
        return;
      }

      setJoiningMatchId(match.id);
      const response = await joinMatchApi(match.id);
      if (response?.data?.status) {
        toast.success(t('match.joinedSuccessfully'));
        const updatedBalance = response?.data?.data?.balance;
        if (typeof updatedBalance === 'number') {
          dispatch(balanceAction(updatedBalance));
        } else {
          dispatch(balanceAction(Math.max(balance - (match.entryFee ?? 0), 0)));
        }
        fetchMatches();
      }
      setJoiningMatchId(null);
    },
    [balance, dispatch, fetchMatches, joinMatchApi, joiningMatchId, user?.pubgId]
  );

  const handleRequestJoin = useCallback(
    (match: IMatch) => {
      if (joiningMatchId) return;

      if (match.premiumOnly && !isPremiumUser) {
        toast.error(t('match.premiumOnlyToast'), { id: 'premium-only' });
        return;
      }

      const pubgId = (user?.pubgId || '').trim();
      if (!pubgId) {
        toast.error(t('match.pubgIdRequired'), { id: 'pubg-id-required' });
        return;
      }

      setConfirmMatch(match);
    },
    [joiningMatchId, isPremiumUser, user?.pubgId]
  );

  const handleConfirmJoin = useCallback(async () => {
    if (!confirmMatch) return;
    await handleJoinMatch(confirmMatch);
    setConfirmMatch(null);
  }, [confirmMatch, handleJoinMatch]);

  const categorizedMatches = useMemo(() => {
    const now = Date.now();
    const groups: Record<MatchTab, IMatch[]> = {
      ongoing: [],
      upcoming: [],
      results: [],
    };

    matches.forEach((match) => {
      if (match.status === 'complete' || match.status === 'cancel') {
        groups.results.push(match);
        return;
      }
      if (match.matchSchedule) {
        const scheduleTime = new Date(match.matchSchedule).getTime();
        if (!Number.isNaN(scheduleTime) && scheduleTime > now) {
          groups.upcoming.push(match);
          return;
        }
        if (!Number.isNaN(scheduleTime) && scheduleTime <= now) {
          groups.ongoing.push(match);
          return;
        }
      }
      groups.results.push(match);
    });

    return groups;
  }, [matches]);

  const gameName = matches[0]?.gameName ?? 'Matches';
  const activeList = categorizedMatches[activeTab];

  const emptyMessages: Record<MatchTab, { title: string; description: string }> = {
    ongoing: {
      title: t('play.emptyOngoingTitle'),
      description: t('play.emptyOngoingDescription'),
    },
    upcoming: {
      title: t('play.emptyUpcomingTitle'),
      description: t('play.emptyUpcomingDescription'),
    },
    results: {
      title: t('play.emptyResultsTitle'),
      description: t('play.emptyResultsDescription'),
    },
  };

  return (
    <UserPageShell>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
        <UserBackButton onClick={handleBack} />
      </Stack>

      <UserArenaStrip
        badge={t('play.badgeMatchArena')}
        title={gameName}
        subtitle={t('play.matchListSubtitle')}
        imageUrl={PLAY_IMAGE_PATHS.heroBanner}
      />

      {loading && matches.length === 0 ? (
        <MatchPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <UserStatTile label={t('play.ongoing')} value={categorizedMatches.ongoing.length} suffix={t('play.suffixLive')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <UserStatTile label={t('play.upcoming')} value={categorizedMatches.upcoming.length} suffix={t('play.suffixScheduled')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <UserStatTile label={t('play.results')} value={categorizedMatches.results.length} suffix={t('play.suffixArchived')} />
            </Grid>
          </Grid>

          <PlayTabs
            tabs={[
              { label: `${t('play.ongoing')} (${categorizedMatches.ongoing.length})`, value: 'ongoing' },
              { label: `${t('play.upcoming')} (${categorizedMatches.upcoming.length})`, value: 'upcoming' },
              { label: `${t('play.results')} (${categorizedMatches.results.length})`, value: 'results' },
            ]}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

          {loading ? (
            <MatchPageSkeleton />
          ) : activeList.length === 0 ? (
            <UserEmptyState
              icon="solar:gamepad-bold-duotone"
              title={emptyMessages[activeTab].title}
              description={emptyMessages[activeTab].description}
              actionLabel={t('common.refresh')}
              onAction={fetchMatches}
            />
          ) : (
            <Grid container spacing={2} alignItems="stretch">
              {activeList.map((match) => (
                <Grid key={match.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: 'flex' }}>
                  <MatchCard
                    match={match}
                    onJoin={handleRequestJoin}
                    joining={joiningMatchId === match.id}
                    canJoin
                    isJoined={!!match.isJoined}
                    isPremiumUser={isPremiumUser}
                    isResult={activeTab === 'results'}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      )}

      <MatchJoinDialog
        match={confirmMatch}
        balance={balance}
        joining={joiningMatchId === confirmMatch?.id}
        onClose={() => setConfirmMatch(null)}
        onConfirm={handleConfirmJoin}
      />
    </UserPageShell>
  );
}
