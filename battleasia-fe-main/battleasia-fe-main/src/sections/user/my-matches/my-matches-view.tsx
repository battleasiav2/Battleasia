import { useNavigate } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Grid2 as Grid, Stack } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import { useApi, useImagePreloader, useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks';
import {
  UserPageShell,
  UserArenaStrip,
  UserStatTile,
  UserEmptyState,
  UserAnimatedStat,
} from 'src/layouts/user';

import { CoinValue } from 'src/components/coin-value';
import { PlayTabs } from 'src/components/play-tabs';

import { PLAY_IMAGE_PATHS } from '../play/play-constants';
import { MyMatchCard, MyMatchesPageSkeleton } from './components';
import {
  mapApiMatchToCard,
  type ApiMatchHistoryItem,
  type MyMatchStatus,
  type MyMatchTab,
} from './my-matches-types';

// ----------------------------------------------------------------------

export function MyMatchesView() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { getMatchHistoryApi } = useApi();
  const [activeTab, setActiveTab] = useState<MyMatchTab>('all');
  const [matches, setMatches] = useState<ApiMatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useImagePreloader([PLAY_IMAGE_PATHS.game2], { delay: 300, continueOnError: true });

  const fetchMatches = useCallback(async () => {
    if (!isLoggedIn) {
      setMatches([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getMatchHistoryApi();
      if (response?.data?.status) {
        const data = response.data.data;
        setMatches(Array.isArray(data) ? data : []);
      } else {
        setMatches([]);
      }
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [getMatchHistoryApi, isLoggedIn]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useLiveSync(fetchMatches, LIVE_SYNC_TOPICS.matches);

  const allMatches = useMemo(() => matches.map(mapApiMatchToCard), [matches]);

  const filteredMatches = useMemo(() => {
    if (activeTab === 'all') return allMatches;
    return allMatches.filter((match) => match.status === activeTab);
  }, [activeTab, allMatches]);

  const stats = useMemo(() => {
    const total = allMatches.length;
    const wins = allMatches.filter((match) => match.status === 'win').length;
    const losses = allMatches.filter((match) => match.status === 'loss').length;
    const pending = allMatches.filter((match) => match.status === 'pending').length;
    const totalPrize = allMatches
      .filter((match) => match.status === 'win')
      .reduce((sum, match) => sum + parseFloat(match.prizeWon), 0);

    return { total, wins, losses, pending, totalPrize };
  }, [allMatches]);

  const handleTabChange = useCallback((tab: string) => {
    const allowedTabs: MyMatchTab[] = ['all', 'win', 'loss', 'pending'];
    if (allowedTabs.includes(tab as MyMatchTab)) {
      setActiveTab(tab as MyMatchTab);
    }
  }, []);

  const handleViewDetails = (matchId: string, status: MyMatchStatus) => {
    if (status === 'pending') {
      navigate(paths.user.match(matchId));
    } else {
      navigate(paths.user.matchResult(matchId));
    }
  };

  const cardTranslations = {
    won: t('match.status.win'),
    lost: t('match.status.loss'),
    pending: t('match.status.pending'),
    entryFee: t('match.entryFee'),
    prizeWon: t('match.prizeWon'),
    kills: t('match.kills'),
    rank: t('match.rank'),
    viewDetails: t('common.viewDetails'),
    matchTypePaid: t('match.type.paid'),
    matchTypeFree: t('match.type.free'),
  };

  const emptyMessages: Record<MyMatchTab, { title: string; description: string }> = {
    all: {
      title: t('myMatches.noMatchesFound'),
      description: t('myMatches.emptyAllDescription'),
    },
    win: {
      title: t('myMatches.emptyWinsTitle'),
      description: t('myMatches.emptyWinsDescription'),
    },
    loss: {
      title: t('myMatches.emptyLossesTitle'),
      description: t('myMatches.emptyLossesDescription'),
    },
    pending: {
      title: t('myMatches.emptyPendingTitle'),
      description: t('myMatches.emptyPendingDescription'),
    },
  };

  const showInitialSkeleton = loading && matches.length === 0;

  return (
    <UserPageShell>
      <UserArenaStrip
        badge={t('myMatches.badgeBattleHistory')}
        title={t('myMatches.title')}
        subtitle={t('myMatches.subtitle')}
        imageUrl={PLAY_IMAGE_PATHS.heroBanner}
      />

      {showInitialSkeleton ? (
        <MyMatchesPageSkeleton />
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
              label={t('myMatches.totalMatches')}
              value={<UserAnimatedStat value={stats.total} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('myMatches.wins')}
              value={<UserAnimatedStat value={stats.wins} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('myMatches.losses')}
              value={<UserAnimatedStat value={stats.losses} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('myMatches.totalPrize')}
              value={<CoinValue value={stats.totalPrize} size={18} />}
              loading={loading}
            />
          </Box>

          <PlayTabs
            tabs={[
              { label: `${t('myMatches.all')} (${stats.total})`, value: 'all' },
              { label: `${t('myMatches.winsTab')} (${stats.wins})`, value: 'win' },
              { label: `${t('myMatches.lossesTab')} (${stats.losses})`, value: 'loss' },
              { label: `${t('myMatches.pendingTab')} (${stats.pending})`, value: 'pending' },
            ]}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

          {loading ? (
            <MyMatchesPageSkeleton />
          ) : filteredMatches.length === 0 ? (
            <UserEmptyState
              icon="solar:document-text-bold-duotone"
              title={emptyMessages[activeTab].title}
              description={emptyMessages[activeTab].description}
              actionLabel={t('common.refresh')}
              onAction={fetchMatches}
            />
          ) : (
            <Grid container spacing={2}>
              {filteredMatches.map((match) => (
                <Grid key={match.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <MyMatchCard
                    match={match}
                    onViewDetails={() => handleViewDetails(match.id, match.status)}
                    translations={cardTranslations}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
