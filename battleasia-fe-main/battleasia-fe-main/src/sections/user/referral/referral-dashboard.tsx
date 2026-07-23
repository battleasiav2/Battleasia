import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useApi } from 'src/hooks';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { useSelector } from 'src/store';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';

import { CoinValue } from 'src/components/coin-value';
import { UserAnimatedStat } from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import {
  mapApiCommissionItem,
  mapApiNetworkItem,
  type ApiReferralCommissionItem,
  type ApiReferralNetworkItem,
  type ReferralCommissionItem,
  type ReferralNetworkItem,
  type ReferralStats,
} from './referral-types';
import {
  ReferralHero,
  ReferralStepsFlow,
  ReferralPageSkeleton,
  ReferralCodeCard,
  ReferralNetworkList,
  ReferralCommissionList,
} from './components';

// ----------------------------------------------------------------------

function HighlightText({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ color: USER_COLORS.gold, fontWeight: 800 }}>
      {children}
    </Box>
  );
}

type ReferralDashboardProps = {
  showInviteSection?: boolean;
  defaultTab?: 'network' | 'history';
};

export function ReferralDashboard({ showInviteSection = true, defaultTab = 'network' }: ReferralDashboardProps) {
  const { t } = useTranslate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const { getReferralSettingsApi, getReferralStatsApi, getReferralsApi, getReferralCommissionsApi } = useApi();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [network, setNetwork] = useState<ReferralNetworkItem[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommissionItem[]>([]);
  const [commissionRate, setCommissionRate] = useState(10);
  const [tab, setTab] = useState<'network' | 'history'>(defaultTab);
  const [loading, setLoading] = useState(true);

  const referralCode = user?.referralCode || '';
  const referralUrl = referralCode
    ? `${window.location.origin}${paths.auth.signUp}?ref=${encodeURIComponent(referralCode)}`
    : '';

  const fetchData = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [settingsRes, statsRes, networkRes, commissionsRes] = await Promise.all([
        getReferralSettingsApi(),
        getReferralStatsApi(),
        getReferralsApi(),
        getReferralCommissionsApi({ limit: 100 }),
      ]);

      if (settingsRes?.data?.referralSettings?.commissionRate !== undefined) {
        setCommissionRate(settingsRes.data.referralSettings.commissionRate);
      }

      if (statsRes?.data?.status) {
        setStats(statsRes.data.data as ReferralStats);
      }

      if (networkRes?.data?.status) {
        const rows = (networkRes.data.data as ApiReferralNetworkItem[]) || [];
        setNetwork(rows.map(mapApiNetworkItem));
      } else {
        setNetwork([]);
      }

      if (commissionsRes?.data?.status) {
        const rows = (commissionsRes.data.data?.results as ApiReferralCommissionItem[]) || [];
        setCommissions(rows.map(mapApiCommissionItem));
      } else {
        setCommissions([]);
      }
    } catch (error) {
      console.error('Failed to fetch referral data', error);
    } finally {
      setLoading(false);
    }
  }, [getReferralCommissionsApi, getReferralSettingsApi, getReferralStatsApi, getReferralsApi, isLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useLiveSync(fetchData, LIVE_SYNC_TOPICS.referral);

  const displayStats = useMemo(
    () => ({
      totalReferrals: stats?.totalReferrals ?? network.length,
      activeReferrals: stats?.activeReferrals ?? network.filter((n) => n.status === 'active').length,
      totalEarnings: stats?.totalEarnings ?? network.reduce((sum, n) => sum + n.totalEarnings, 0),
      commissionRate: stats?.commissionRate ?? commissionRate,
      totalDeposits: stats?.totalDepositsFromReferrals ?? 0,
      commissionEvents: stats?.totalCommissionEvents ?? commissions.length,
    }),
    [commissionRate, commissions.length, network, stats]
  );

  const steps = [
    { icon: 'solar:share-bold', label: t('referral.stepShareCode') },
    { icon: 'solar:user-plus-bold', label: t('referral.stepFriendSignsUp') },
    { icon: 'solar:wallet-money-bold', label: t('referral.stepEarnOnDeposit') },
  ];

  const tokens = getDefaultGlassTokens();

  if (loading && !stats && network.length === 0) {
    return (
      <UserPageShell>
        <ReferralPageSkeleton />
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      {showInviteSection ? <ReferralHero title={t('referral.title')} /> : null}

      <UserPageTitle
        badge={t('referral.badgeRewardsProgram')}
        title={t('referral.title')}
        subtitle={t('referral.referMoreToEarn')}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <UserStatTile
          label={t('referral.totalReferrals')}
          value={<UserAnimatedStat value={displayStats.totalReferrals} variant="h5" fontWeight={700} />}
          loading={loading}
        />
        <UserStatTile
          label={t('myReferrals.active')}
          value={<UserAnimatedStat value={displayStats.activeReferrals} variant="h5" fontWeight={700} />}
          loading={loading}
        />
        <UserStatTile
          label={t('referral.earnings')}
          value={<CoinValue value={displayStats.totalEarnings} size={18} />}
          loading={loading}
        />
        <UserStatTile
          label={t('referral.commission')}
          value={`${displayStats.commissionRate}%`}
          suffix={t('referral.perDeposit')}
          loading={loading}
        />
      </Box>

      {showInviteSection ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
              gap: 1.5,
              mb: 3,
            }}
          >
            <UserStatTile
              label={t('referral.totalDeposits')}
              value={<CoinValue value={displayStats.totalDeposits} size={16} />}
              loading={loading}
            />
            <UserStatTile
              label={t('referral.commissionEvents')}
              value={<UserAnimatedStat value={displayStats.commissionEvents} variant="h5" fontWeight={700} />}
              loading={loading}
            />
          </Box>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <UserGlassCard sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
              <Typography
                className="font-tr"
                sx={{
                  mb: 2,
                  fontSize: 18,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: USER_COLORS.gold,
                }}
              >
                {t('referral.inviteFriends')}
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={getGlassInnerSx(tokens, { p: { xs: 1.5, md: 2 } })}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: { xs: 14, md: 15 }, lineHeight: 1.75 }}>
                    {t('referral.depositCommissionInfo')}{' '}
                    <HighlightText>{displayStats.commissionRate}%</HighlightText>{' '}
                    {t('referral.depositCommissionInfoSuffix')}
                  </Typography>
                </Box>
                <Box sx={getGlassInnerSx(tokens, { p: { xs: 1.5, md: 2 } })}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: { xs: 14, md: 15 }, lineHeight: 1.75 }}>
                    {t('referral.autoCommissionInfo')}
                  </Typography>
                </Box>
              </Stack>
            </UserGlassCard>

            <Box sx={{ width: { xs: 1, lg: 420 }, flexShrink: 0 }}>
              <ReferralCodeCard referralCode={referralCode} referralUrl={referralUrl} />
            </Box>
          </Stack>

          <UserGlassCard sx={{ p: { xs: 2, md: 3.5 }, mb: 3 }}>
            <ReferralStepsFlow title={t('referral.howItWorks')} steps={steps} />
          </UserGlassCard>
        </>
      ) : null}

      <UserGlassCard sx={{ p: { xs: 1.5, md: 2 } }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{
            mb: 2,
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              color: USER_COLORS.textMuted,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: 12,
            },
            '& .Mui-selected': { color: USER_COLORS.gold },
            '& .MuiTabs-indicator': { bgcolor: USER_COLORS.gold },
          }}
        >
          <Tab value="network" label={t('referral.tabNetwork')} />
          <Tab value="history" label={t('referral.tabCommissionHistory')} />
        </Tabs>

        {tab === 'network' ? (
          network.length === 0 ? (
            <UserEmptyState
              icon="solar:users-group-rounded-bold-duotone"
              title={t('myReferrals.noReferrals')}
              description={t('referral.noNetworkYet')}
              actionLabel={t('common.refresh')}
              onAction={fetchData}
            />
          ) : (
            <ReferralNetworkList
              items={network}
              labels={{
                playerName: t('myReferrals.playerName'),
                joined: t('referral.joinedAt'),
                deposits: t('referral.deposits'),
                earnings: t('myReferrals.earnings'),
                status: t('myReferrals.status'),
                active: t('myReferrals.active'),
                inactive: t('myReferrals.inactive'),
              }}
            />
          )
        ) : commissions.length === 0 ? (
          <UserEmptyState
            icon="solar:history-bold-duotone"
            title={t('referral.noCommissionHistory')}
            description={t('referral.noCommissionHistoryYet')}
            actionLabel={t('common.refresh')}
            onAction={fetchData}
          />
        ) : (
          <ReferralCommissionList
            items={commissions}
            labels={{
              date: t('myReferrals.date'),
              playerName: t('myReferrals.playerName'),
              deposit: t('referral.depositAmount'),
              rate: t('referral.rate'),
              commission: t('referral.commissionEarned'),
              source: t('referral.source'),
            }}
          />
        )}
      </UserGlassCard>
    </UserPageShell>
  );
}
