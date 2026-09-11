import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useApi } from 'src/hooks';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { useSelector } from 'src/store';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales/use-locales';
import { toast } from 'react-hot-toast';
import {
  UserPageShell,
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
  goldAlpha,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
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
  ReferralMilestonesPanel,
  type ReferralMilestonesState,
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
  const { getReferralSettingsApi, getReferralStatsApi, getReferralsApi, getReferralCommissionsApi, claimReferralMilestoneApi } = useApi();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralMilestones, setReferralMilestones] = useState<ReferralMilestonesState | null>(null);
  const [claimingTierKey, setClaimingTierKey] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);
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
        const data = statsRes.data.data as ReferralStats;
        setStats(data);
        setReferralMilestones(data.referralMilestones || null);
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

  const handleClaimReferralTier = async (key: string) => {
    setClaimingTierKey(key);
    try {
      const response = await claimReferralMilestoneApi(key);
      if (response?.data?.status) {
        toast.success(t('referral.milestoneClaimSuccess'));
        setFlashKey(`referral:${key}`);
        window.setTimeout(() => setFlashKey(null), 650);
        setReferralMilestones(response.data.data.referral || null);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('referral.milestoneClaimFailed'));
    } finally {
      setClaimingTierKey(null);
    }
  };

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
      <ReferralHero title={t('referral.title')} subtitle={t('referral.referMoreToEarn')} />

      {/* All 6 stats — short labels, merged strip (no mid-word breaks) */}
      <Box
        sx={{
          mb: 1.75,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
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
            label: t('referral.statReferrals'),
            value: <UserAnimatedStat value={displayStats.totalReferrals} variant="h5" fontWeight={700} />,
          },
          {
            icon: 'solar:user-check-bold',
            label: t('referral.statActive'),
            value: <UserAnimatedStat value={displayStats.activeReferrals} variant="h5" fontWeight={700} />,
          },
          {
            icon: 'solar:wallet-money-bold',
            label: t('referral.statEarnings'),
            value: <CoinValue value={displayStats.totalEarnings} size={16} />,
          },
          {
            icon: 'solar:sale-bold',
            label: t('referral.statRate'),
            value: `${displayStats.commissionRate}%`,
          },
          {
            icon: 'solar:hand-money-bold',
            label: t('referral.statDeposits'),
            value: <CoinValue value={displayStats.totalDeposits} size={16} />,
          },
          {
            icon: 'solar:history-bold',
            label: t('referral.statEvents'),
            value: <UserAnimatedStat value={displayStats.commissionEvents} variant="h5" fontWeight={700} />,
          },
        ].map((stat, index, arr) => (
          <Box
            key={stat.label}
            sx={{
              minWidth: 0,
              px: { xs: 1.25, md: 1.5 },
              py: { xs: 1.25, md: 1.5 },
              borderRight: {
                xs: index % 2 === 0 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                sm: index % 3 !== 2 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                lg: index < arr.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
              },
              borderBottom: {
                xs: index < 4 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                sm: index < 3 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                lg: 'none',
              },
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

      <Box sx={{ mb: 1.75 }}>
        <ReferralMilestonesPanel
          referral={referralMilestones}
          claimingKey={claimingTierKey}
          flashKey={flashKey}
          onClaim={handleClaimReferralTier}
        />
      </Box>

      {showInviteSection ? (
        <>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 1.75 }}>
            <UserGlassCard sx={{ p: { xs: 1.5, md: 2 }, flex: 1 }}>
              <Typography
                className="font-tr"
                sx={{
                  mb: 1.25,
                  fontSize: 16,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: USER_COLORS.gold,
                }}
              >
                {t('referral.inviteFriends')}
              </Typography>

              <Box
                sx={{
                  ...getGlassInnerSx(tokens, { p: 0 }),
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 1.25, md: 1.5 },
                    borderRight: { md: `1px solid ${alpha('#ffffff', 0.08)}` },
                    borderBottom: { xs: `1px solid ${alpha('#ffffff', 0.08)}`, md: 'none' },
                  }}
                >
                  <Typography sx={{ ...userMutedTextSx, fontSize: { xs: 13, md: 14 }, lineHeight: 1.55 }}>
                    {t('referral.depositCommissionInfo')}{' '}
                    <HighlightText>{displayStats.commissionRate}%</HighlightText>{' '}
                    {t('referral.depositCommissionInfoSuffix')}
                  </Typography>
                </Box>
                <Box sx={{ p: { xs: 1.25, md: 1.5 } }}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: { xs: 13, md: 14 }, lineHeight: 1.55 }}>
                    {t('referral.autoCommissionInfo')}
                  </Typography>
                </Box>
              </Box>
            </UserGlassCard>

            <Box sx={{ width: { xs: 1, lg: 400 }, flexShrink: 0 }}>
              <ReferralCodeCard referralCode={referralCode} referralUrl={referralUrl} />
            </Box>
          </Stack>

          <UserGlassCard sx={{ p: { xs: 1.5, md: 2 }, mb: 1.75 }}>
            <ReferralStepsFlow title={t('referral.howItWorks')} steps={steps} />
          </UserGlassCard>
        </>
      ) : null}

      <UserGlassCard sx={{ p: { xs: 1.25, md: 1.75 } }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{
            mb: 1.5,
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
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
