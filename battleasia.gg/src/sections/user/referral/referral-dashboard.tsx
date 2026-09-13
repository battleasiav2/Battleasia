import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useApi } from 'src/hooks';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { useSelector } from 'src/store';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales/use-locales';
import { toast } from 'react-hot-toast';
import {
  UserPageShell,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
  goldAlpha,
  UserAnimatedStat,
} from 'src/layouts/user';

import { CoinValue } from 'src/components/coin-value';
import { PlayTabs } from 'src/components/play-tabs';

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

const GOLD = USER_COLORS.gold;

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

export function ReferralDashboard({
  showInviteSection = true,
  defaultTab = 'network',
}: ReferralDashboardProps) {
  const { t } = useTranslate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const {
    getReferralSettingsApi,
    getReferralStatsApi,
    getReferralsApi,
    getReferralCommissionsApi,
    claimReferralMilestoneApi,
  } = useApi();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralMilestones, setReferralMilestones] = useState<ReferralMilestonesState | null>(
    null
  );
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
  }, [
    getReferralCommissionsApi,
    getReferralSettingsApi,
    getReferralStatsApi,
    getReferralsApi,
    isLoggedIn,
  ]);

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
      activeReferrals:
        stats?.activeReferrals ?? network.filter((n) => n.status === 'active').length,
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

  const listPanelSx = {
    bgcolor: alpha('#06090e', 0.72),
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${goldAlpha(0.28)}`,
    borderTop: `2px solid ${GOLD}`,
    boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
    clipPath: {
      xs: 'none',
      md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
    },
    overflow: 'hidden',
  } as const;

  if (loading && !stats && network.length === 0) {
    return (
      <UserPageShell>
        <ReferralPageSkeleton />
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <ReferralHero title={t('referral.title')} />

      <Stack spacing={2.5}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))',
            },
            width: 1,
            bgcolor: alpha('#06090e', 0.72),
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${goldAlpha(0.28)}`,
            borderTop: `2px solid ${GOLD}`,
            boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
            clipPath: {
              xs: 'none',
              md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
            },
          }}
        >
          {[
            {
              label: t('referral.statReferrals'),
              value: (
                <UserAnimatedStat
                  value={displayStats.totalReferrals}
                  variant="h5"
                  fontWeight={700}
                />
              ),
            },
            {
              label: t('referral.statActive'),
              value: (
                <UserAnimatedStat
                  value={displayStats.activeReferrals}
                  variant="h5"
                  fontWeight={700}
                />
              ),
            },
            {
              label: t('referral.statEarnings'),
              value: <CoinValue value={displayStats.totalEarnings} size={16} />,
            },
            {
              label: t('referral.statRate'),
              value: `${displayStats.commissionRate}%`,
            },
            {
              label: t('referral.statDeposits'),
              value: <CoinValue value={displayStats.totalDeposits} size={16} />,
            },
            {
              label: t('referral.statEvents'),
              value: (
                <UserAnimatedStat
                  value={displayStats.commissionEvents}
                  variant="h5"
                  fontWeight={700}
                />
              ),
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
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: alpha('#ffffff', 0.45),
                  mb: 0.75,
                }}
              >
                {stat.label}
              </Typography>
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

        <ReferralMilestonesPanel
          referral={referralMilestones}
          claimingKey={claimingTierKey}
          flashKey={flashKey}
          onClaim={handleClaimReferralTier}
        />

        {showInviteSection ? (
          <>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
              <Box sx={{ ...listPanelSx, flex: 1, p: { xs: 1.5, md: 2 } }}>
                <Typography
                  className="font-tr"
                  sx={{
                    mb: 1.25,
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: GOLD,
                    letterSpacing: 0.6,
                  }}
                >
                  {t('referral.inviteFriends')}
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    sx={{ ...userMutedTextSx, fontSize: { xs: 13, md: 14 }, lineHeight: 1.55 }}
                  >
                    {t('referral.depositCommissionInfo')}{' '}
                    <HighlightText>{displayStats.commissionRate}%</HighlightText>{' '}
                    {t('referral.depositCommissionInfoSuffix')}
                  </Typography>
                  <Typography
                    sx={{ ...userMutedTextSx, fontSize: { xs: 13, md: 14 }, lineHeight: 1.55 }}
                  >
                    {t('referral.autoCommissionInfo')}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ width: { xs: 1, lg: 400 }, flexShrink: 0 }}>
                <ReferralCodeCard referralCode={referralCode} referralUrl={referralUrl} />
              </Box>
            </Stack>

            <Box sx={{ ...listPanelSx, p: { xs: 1.5, md: 2 } }}>
              <ReferralStepsFlow title={t('referral.howItWorks')} steps={steps} />
            </Box>
          </>
        ) : null}

        <PlayTabs
          tabs={[
            { label: t('referral.tabNetwork'), value: 'network' },
            { label: t('referral.tabCommissionHistory'), value: 'history' },
          ]}
          activeTab={tab}
          onChange={(value) => setTab(value as 'network' | 'history')}
        />

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
            <Box sx={listPanelSx}>
              <ReferralNetworkList
                items={network}
                labels={{
                  joined: t('referral.joinedAt'),
                  deposits: t('referral.deposits'),
                  earnings: t('myReferrals.earnings'),
                  active: t('myReferrals.active'),
                  inactive: t('myReferrals.inactive'),
                }}
              />
            </Box>
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
          <Box sx={listPanelSx}>
            <ReferralCommissionList
              items={commissions}
              labels={{
                date: t('myReferrals.date'),
                deposit: t('referral.depositAmount'),
                rate: t('referral.rate'),
                commission: t('referral.commissionEarned'),
                source: t('referral.source'),
              }}
            />
          </Box>
        )}
      </Stack>
    </UserPageShell>
  );
}
