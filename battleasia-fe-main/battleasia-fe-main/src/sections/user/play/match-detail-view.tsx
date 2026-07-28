import { useParams, useNavigate } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';

import { paths } from 'src/routes/paths';

import { useImagePreloader } from 'src/hooks';
import { useDispatch, useSelector } from 'src/store';
import { balanceAction } from 'src/store/reducers/auth';
import {
  UserPageShell,
  UserBackButton,
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
  userGoldButtonSx,
} from 'src/layouts/user';

import { toast } from 'react-hot-toast';
import { Iconify } from 'src/components/iconify';
import { PlayTabs } from 'src/components/play-tabs';
import CoinValue from 'src/components/coin-value';
import { useTranslate } from 'src/locales/use-locales';

import type { MatchDetailData } from './match-types';
import { getMatchBannerUrl } from './match-types';
import {
  MatchStatPill,
  MatchDetailHero,
  MatchDetailSkeleton,
  MatchDetailRoomPanel,
  MatchDetailDescription,
  MatchDetailParticipants,
} from './components';

// ----------------------------------------------------------------------

export function MatchDetailView() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { getMatchDetailApi, joinMatchApi } = useApi();
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { balance = 0, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('description');
  const [matchDetail, setMatchDetail] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [premiumRestricted, setPremiumRestricted] = useState(false);
  const [joining, setJoining] = useState(false);

  const fetchMatchDetail = useCallback(async () => {
    if (!matchId) {
      setMatchDetail(null);
      return;
    }
    setLoading(true);
    try {
      const response = await getMatchDetailApi(matchId);
      if (response?.data?.status) {
        setMatchDetail(response.data.data);
      } else {
        setMatchDetail(null);
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setPremiumRestricted(true);
      }
      setMatchDetail(null);
    }
    setLoading(false);
  }, [matchId, getMatchDetailApi]);

  useEffect(() => {
    fetchMatchDetail();
  }, [fetchMatchDetail]);

  useLiveSync(fetchMatchDetail, LIVE_SYNC_TOPICS.matches);

  const heroImage = useMemo(
    () => getMatchBannerUrl(matchDetail?.banner),
    [matchDetail?.banner]
  );

  const { isLoaded } = useImagePreloader([heroImage], {
    delay: 300,
    continueOnError: true,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoinMatch = useCallback(async () => {
    if (!matchDetail || joining || matchDetail.isJoined) return;

    const entryFee = matchDetail.entryFee ?? 0;
    if (entryFee > balance) {
      toast.error(t('match.insufficientBalance'), { id: 'insufficient-balance' });
      return;
    }

    const pubgId = (user?.pubgId || '').trim();
    if (!pubgId) {
      toast.error(t('match.pubgIdRequired'), { id: 'pubg-id-required' });
      return;
    }

    setJoining(true);
    const response = await joinMatchApi(matchDetail.id);
    if (response?.data?.status) {
      toast.success(t('match.joinedSuccessfully'));
      const updatedBalance = response?.data?.data?.balance;
      if (typeof updatedBalance === 'number') {
        dispatch(balanceAction(updatedBalance));
      } else {
        dispatch(balanceAction(Math.max(balance - entryFee, 0)));
      }
      fetchMatchDetail();
    }
    setJoining(false);
  }, [balance, dispatch, fetchMatchDetail, joinMatchApi, joining, matchDetail, t, user?.pubgId]);

  if (premiumRestricted) {
    return (
      <UserPageShell>
        <UserEmptyState
          icon="solar:crown-bold-duotone"
          title={t('match.premiumMatch')}
          description={t('match.premiumOnlyDescription')}
          actionLabel={t('common.goBack')}
          onAction={() => navigate(-1)}
        />
      </UserPageShell>
    );
  }

  if (!loading && !matchDetail) {
    return (
      <UserPageShell>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <UserBackButton onClick={handleBack} />
        </Stack>
        <UserEmptyState
          icon="solar:gamepad-bold-duotone"
          title={t('match.matchNotFound')}
          description={t('match.matchNotFoundDescription')}
          actionLabel={t('play.title')}
          onAction={() => navigate(paths.user.play)}
        />
      </UserPageShell>
    );
  }

  const isPageLoading = loading || !matchDetail || !isLoaded;

  return (
    <UserPageShell>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <UserBackButton onClick={handleBack} />
      </Stack>

      {isPageLoading ? (
        <MatchDetailSkeleton />
      ) : (
        <Stack spacing={3}>
          <MatchDetailHero match={matchDetail} bannerUrl={heroImage} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(5, 1fr)',
              },
              gap: 1.5,
            }}
          >
            <MatchStatPill label={t('matchDetail.team')}>
              {matchDetail.teamType?.toUpperCase() || 'N/A'}
            </MatchStatPill>
            <MatchStatPill label={t('matchDetail.entryFee')}>
              <CoinValue value={matchDetail.entryFee ?? 0} size={16} />
            </MatchStatPill>
            <MatchStatPill label={t('matchDetail.map')}>
              {matchDetail.map || 'N/A'}
            </MatchStatPill>
            <MatchStatPill label={t('matchDetail.matchType')}>
              {matchDetail.matchType?.toUpperCase() || 'N/A'}
            </MatchStatPill>
            <MatchStatPill label={t('match.players')} minHeight={64}>
              {matchDetail.totalPlayer ?? matchDetail.participantsCount ?? 0}
            </MatchStatPill>
          </Box>

          {matchDetail.isJoined ? (
            <MatchDetailRoomPanel match={matchDetail} title={t('matchDetail.roomDetails')} />
          ) : null}

          <Box
            sx={{
              p: 2,
              borderRadius: '6px',
              bgcolor: alpha('#000000', 0.35),
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:wallet-money-bold" width={20} sx={{ color: USER_COLORS.gold }} />
                <Box>
                  <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Your Balance
                  </Typography>
                  <CoinValue value={balance} size={18} />
                </Box>
              </Stack>

              <Button
                variant="outlined"
                disableElevation
                fullWidth
                onClick={handleJoinMatch}
                disabled={matchDetail.isJoined || joining || (matchDetail.entryFee ?? 0) > balance}
                sx={{
                  ...userGoldButtonSx,
                  maxWidth: { sm: 280 },
                  py: 1.25,
                }}
              >
                {matchDetail.isJoined
                  ? t('matchDetail.alreadyJoined')
                  : joining
                    ? t('matchDetail.joining')
                    : t('matchDetail.joinMatch')}
              </Button>
            </Stack>
          </Box>

          <UserGlassCard noPadding>
            <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
              <PlayTabs
                tabs={[
                  { label: t('matchDetail.description'), value: 'description' },
                  {
                    label: `${t('matchDetail.joinedMembers')} (${matchDetail.participants?.length || 0})`,
                    value: 'joined',
                  },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </Box>

            <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 1 }}>
              {activeTab === 'description' ? (
                <MatchDetailDescription
                  match={matchDetail}
                  labels={{
                    prizeDetails: t('matchDetail.prizeDetails'),
                    prize: t('matchDetail.prize'),
                    perKill: t('matchDetail.perKill'),
                    matchSponsor: t('matchDetail.matchSponsor'),
                    aboutThisMatch: t('matchDetail.aboutThisMatch'),
                    noDescription: t('matchDetail.noDescription'),
                    matchPrivateDescription: t('matchDetail.matchPrivateDescription'),
                    noPrivateDescription: t('matchDetail.noPrivateDescription'),
                    joinToViewPrivate: t('matchDetail.joinToViewPrivate'),
                  }}
                />
              ) : (
                <MatchDetailParticipants
                  participants={matchDetail.participants || []}
                  emptyLabel={t('matchDetail.noJoinedMembers')}
                  teamLabel={t('matchDetail.tableTeam')}
                  positionLabel={t('matchDetail.tablePosition')}
                  playerLabel={t('matchDetail.tablePlayerName')}
                />
              )}
            </Box>
          </UserGlassCard>
        </Stack>
      )}
    </UserPageShell>
  );
}
