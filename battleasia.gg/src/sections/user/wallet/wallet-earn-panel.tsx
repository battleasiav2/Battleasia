import { useCallback, useEffect, useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography, CircularProgress } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { useSelector } from 'src/store';

import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';
import { PlayTabs } from 'src/components/play-tabs';

import { toast } from 'react-hot-toast';
import { WalletStreakPanel, type StreakState } from './wallet-streak-panel';
import { WalletWelcomePanel, type WelcomeBonusesState } from './wallet-welcome-panel';
import { ReferralMilestonesPanel, type ReferralMilestonesState } from '../referral/components/referral-milestones-panel';
import { WalletWeeklyArenaPanel, type WeeklyArenaState } from './wallet-weekly-arena-panel';
import { WalletSquadChallengePanel, type SquadChallengeState } from './wallet-squad-challenge-panel';
import { WalletSeasonPassPanel, type SeasonPassState } from './wallet-season-pass-panel';
import { WalletLevelPanel, type LevelState } from './wallet-level-panel';
import { WalletSharePanel, type ShareToEarnHubState } from './wallet-share-panel';
import { WalletDepositBonusPanel, type DepositBonusDaysState } from './wallet-deposit-bonus-panel';
import { WalletLuckySpinPanel, type LuckySpinState } from './wallet-lucky-spin-panel';
import { WalletEarnSummary } from './wallet-earn-summary';
import {
  WalletEarnHistoryPanel,
  WalletEarnHubTabs,
  type EarnHubTab,
} from './wallet-earn-history-panel';
import { EARN_HUB_GOLD, getEarnClaimFlashSx, getEarnReadyPulseSx } from './wallet-earn-hub-styles';
import type { BalanceHistoryItem } from './components/wallet-transaction-list';

type EngagementMissionItem = {
  id: string;
  status: 'active' | 'completed' | 'claimed';
  progress: number;
  target: number;
  mission?: {
    title: string;
    description: string;
    icon: string;
    reward?: { bacAmount: number; label?: string };
  } | null;
};

type EngagementSettings = {
  enabled: boolean;
  dailyMissionsEnabled?: boolean;
  dailyMissionsCount?: number;
  dailyMissionsResetHour?: number;
  earnTabTitle: string;
  earnTabSubtitle: string;
};

type DailyMissionsMeta = {
  count: number;
  resetHour: number;
  dateKey: string;
};

type WalletEarnPanelProps = {
  onBalanceRefresh?: () => void;
  getTransactionTitle: (transaction: BalanceHistoryItem) => string;
  formatDate: (date: Date | string | null) => string;
};

function MissionCard({
  item,
  claiming,
  flash,
  onClaim,
}: {
  item: EngagementMissionItem;
  claiming: boolean;
  flash: boolean;
  onClaim: (id: string) => void;
}) {
  const { t } = useTranslate();
  const mission = item.mission;
  if (!mission) return null;

  const percent = item.target > 0 ? Math.min((item.progress / item.target) * 100, 100) : 0;
  const canClaim = item.status === 'completed';
  const isClaimed = item.status === 'claimed';
  const glassTokens = getDefaultGlassTokens();

  return (
    <Box
      sx={{
        ...getGlassInnerSx(glassTokens, { p: { xs: 1.75, md: 2 } }),
        ...getEarnClaimFlashSx(flash),
        ...getEarnReadyPulseSx(canClaim && !flash),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            bgcolor: alpha(EARN_HUB_GOLD, 0.12),
            border: `1px solid ${alpha(EARN_HUB_GOLD, 0.25)}`,
            color: EARN_HUB_GOLD,
          }}
        >
          <Iconify icon={mission.icon || 'solar:gift-bold'} width={22} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 14, md: 15 }, color: USER_COLORS.textPrimary }}>
              {mission.title}
            </Typography>
            <CoinValue value={mission.reward?.bacAmount ?? 0} size={14} />
          </Stack>

          <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.5, lineHeight: 1.5 }}>
            {mission.description}
          </Typography>

          <Stack spacing={0.75} sx={{ mt: 1.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                {item.progress}/{item.target}
              </Typography>
              <Typography sx={{ fontSize: 11, color: alpha(EARN_HUB_GOLD, 0.9), fontWeight: 700 }}>
                {Math.round(percent)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 6,
                borderRadius: 99,
                bgcolor: alpha('#ffffff', 0.08),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 99,
                  bgcolor: canClaim || isClaimed ? EARN_HUB_GOLD : alpha(EARN_HUB_GOLD, 0.65),
                  transition: 'transform 0.35s ease',
                },
              }}
            />
          </Stack>

          <Box sx={{ mt: 1.25 }}>
            {canClaim ? (
              <UserActionButton
                actionVariant="gold"
                disabled={claiming}
                startIcon={claiming ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:gift-bold" />}
                onClick={() => onClaim(item.id)}
                sx={{ minHeight: 36, px: 1.5, fontSize: 12 }}
              >
                {claiming ? t('wallet.earnClaiming') : t('wallet.earnClaim')}
              </UserActionButton>
            ) : isClaimed ? (
              <Typography sx={{ fontSize: 12, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
                {t('wallet.earnClaimed')}
              </Typography>
            ) : (
              <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                {t('wallet.earnInProgress')}
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

export function WalletEarnPanel({ onBalanceRefresh, getTransactionTitle, formatDate }: WalletEarnPanelProps) {
  const { t } = useTranslate();
  const { getEngagementHomeApi, claimEngagementRewardApi, claimEngagementStreakApi, claimWelcomeBonusApi, claimReferralMilestoneApi, claimWeeklyArenaApi, createEngagementSquadApi, joinEngagementSquadApi, leaveEngagementSquadApi, claimSquadChallengeApi, claimSeasonPassRewardApi } = useApi();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [hubTab, setHubTab] = useState<EarnHubTab>('earn');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingStreak, setClaimingStreak] = useState(false);
  const [settings, setSettings] = useState<EngagementSettings | null>(null);
  const [dailyMissions, setDailyMissions] = useState<DailyMissionsMeta | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [welcome, setWelcome] = useState<WelcomeBonusesState | null>(null);
  const [referral, setReferral] = useState<ReferralMilestonesState | null>(null);
  const [weeklyArena, setWeeklyArena] = useState<WeeklyArenaState | null>(null);
  const [squadChallenge, setSquadChallenge] = useState<SquadChallengeState | null>(null);
  const [seasonPass, setSeasonPass] = useState<SeasonPassState | null>(null);
  const [level, setLevel] = useState<LevelState | null>(null);
  const [shareToEarn, setShareToEarn] = useState<ShareToEarnHubState | null>(null);
  const [depositBonusDays, setDepositBonusDays] = useState<DepositBonusDaysState | null>(null);
  const [luckySpin, setLuckySpin] = useState<LuckySpinState | null>(null);
  const [claimingWelcomeKey, setClaimingWelcomeKey] = useState<string | null>(null);
  const [claimingReferralKey, setClaimingReferralKey] = useState<string | null>(null);
  const [claimingWeekly, setClaimingWeekly] = useState(false);
  const [claimingSquad, setClaimingSquad] = useState(false);
  const [squadBusy, setSquadBusy] = useState(false);
  const [claimingSeasonKey, setClaimingSeasonKey] = useState<string | null>(null);
  const [missions, setMissions] = useState<EngagementMissionItem[]>([]);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const triggerFlash = (key: string) => {
    setFlashKey(key);
    window.setTimeout(() => setFlashKey(null), 650);
  };

  const loadEngagement = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEngagementHomeApi();
      if (response?.data?.status) {
        setSettings(response.data.data.settings);
        setDailyMissions(response.data.data.dailyMissions || null);
        setStreak(response.data.data.streak || null);
        setWelcome(response.data.data.welcome || null);
        setReferral(response.data.data.referral || null);
        setWeeklyArena(response.data.data.weeklyArena || null);
        setSquadChallenge(response.data.data.squadChallenge || null);
        setSeasonPass(response.data.data.seasonPass || null);
        setLevel(response.data.data.level || null);
        setShareToEarn(response.data.data.shareToEarn || null);
        setDepositBonusDays(response.data.data.depositBonusDays || null);
        setLuckySpin(response.data.data.luckySpin || null);
        setMissions(response.data.data.missions || []);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.earnLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [getEngagementHomeApi, t]);

  useEffect(() => {
    if (user) loadEngagement();
  }, [user, loadEngagement]);

  const bumpHistory = () => {
    setHistoryRefreshKey((value) => value + 1);
    onBalanceRefresh?.();
  };

  const handleClaim = async (progressId: string) => {
    setClaimingId(progressId);
    try {
      const response = await claimEngagementRewardApi(progressId);
      if (response?.data?.status) {
        toast.success(t('wallet.earnClaimSuccess'));
        triggerFlash(`mission:${progressId}`);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.earnClaimFailed'));
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimStreak = async () => {
    setClaimingStreak(true);
    try {
      const response = await claimEngagementStreakApi();
      if (response?.data?.status) {
        toast.success(t('wallet.streakClaimSuccess'));
        triggerFlash('streak');
        setStreak(response.data.data.streak || null);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.streakClaimFailed'));
    } finally {
      setClaimingStreak(false);
    }
  };

  const handleClaimWelcome = async (key: string) => {
    setClaimingWelcomeKey(key);
    try {
      const response = await claimWelcomeBonusApi(key);
      if (response?.data?.status) {
        toast.success(t('wallet.welcomeClaimSuccess'));
        triggerFlash(`welcome:${key}`);
        setWelcome(response.data.data.welcome || null);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.welcomeClaimFailed'));
    } finally {
      setClaimingWelcomeKey(null);
    }
  };

  const handleClaimReferral = async (key: string) => {
    setClaimingReferralKey(key);
    try {
      const response = await claimReferralMilestoneApi(key);
      if (response?.data?.status) {
        toast.success(t('referral.milestoneClaimSuccess'));
        triggerFlash(`referral:${key}`);
        setReferral(response.data.data.referral || null);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('referral.milestoneClaimFailed'));
    } finally {
      setClaimingReferralKey(null);
    }
  };

  const handleClaimWeekly = async () => {
    setClaimingWeekly(true);
    try {
      const response = await claimWeeklyArenaApi();
      if (response?.data?.status) {
        toast.success(t('wallet.weeklyArenaClaimSuccess'));
        triggerFlash('weekly');
        setWeeklyArena(response.data.data.weeklyArena || null);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.weeklyArenaClaimFailed'));
    } finally {
      setClaimingWeekly(false);
    }
  };

  const handleCreateSquad = async (name: string) => {
    setSquadBusy(true);
    try {
      const response = await createEngagementSquadApi(name);
      if (response?.data?.status) {
        toast.success(t('wallet.squadChallengeCreateSuccess'));
        setSquadChallenge(response.data.data.squadChallenge || null);
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.squadChallengeActionFailed'));
    } finally {
      setSquadBusy(false);
    }
  };

  const handleJoinSquad = async (inviteCode: string) => {
    setSquadBusy(true);
    try {
      const response = await joinEngagementSquadApi(inviteCode);
      if (response?.data?.status) {
        toast.success(t('wallet.squadChallengeJoinSuccess'));
        setSquadChallenge(response.data.data.squadChallenge || null);
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.squadChallengeActionFailed'));
    } finally {
      setSquadBusy(false);
    }
  };

  const handleLeaveSquad = async () => {
    setSquadBusy(true);
    try {
      const response = await leaveEngagementSquadApi();
      if (response?.data?.status) {
        toast.success(t('wallet.squadChallengeLeaveSuccess'));
        setSquadChallenge(response.data.data.squadChallenge || null);
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.squadChallengeActionFailed'));
    } finally {
      setSquadBusy(false);
    }
  };

  const handleClaimSquad = async () => {
    setClaimingSquad(true);
    try {
      const response = await claimSquadChallengeApi();
      if (response?.data?.status) {
        toast.success(t('wallet.squadChallengeClaimSuccess'));
        triggerFlash('squad');
        setSquadChallenge(response.data.data.squadChallenge || null);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.squadChallengeClaimFailed'));
    } finally {
      setClaimingSquad(false);
    }
  };

  const handleClaimSeasonPass = async (seasonLevel: number, track: 'free' | 'plus') => {
    const claimKey = `${track}:${seasonLevel}`;
    setClaimingSeasonKey(claimKey);
    try {
      const response = await claimSeasonPassRewardApi(seasonLevel, track);
      if (response?.data?.status) {
        toast.success(t('wallet.seasonPassClaimSuccess'));
        triggerFlash(claimKey);
        setSeasonPass(response.data.data.seasonPass || null);
        bumpHistory();
        loadEngagement();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('wallet.seasonPassClaimFailed'));
    } finally {
      setClaimingSeasonKey(null);
    }
  };

  if (loading) {
    return (
      <UserGlassCard sx={{ p: 3, display: 'grid', placeItems: 'center', minHeight: 180 }}>
        <CircularProgress size={28} sx={{ color: EARN_HUB_GOLD }} />
      </UserGlassCard>
    );
  }

  if (!settings?.enabled) {
    return (
      <UserGlassCard sx={{ p: { xs: 2, md: 3 } }}>
        <Typography sx={{ ...userMutedTextSx, fontSize: 14 }}>{t('wallet.earnDisabled')}</Typography>
      </UserGlassCard>
    );
  }

  const welcomeClaimable = welcome?.milestones.filter((item) => item.canClaim).length ?? 0;
  const referralClaimable = referral?.tiers.filter((item) => item.canClaim).length ?? 0;
  const weeklyClaimable = weeklyArena?.canClaim ? 1 : 0;
  const squadClaimable = squadChallenge?.canClaim ? 1 : 0;
  const seasonClaimable = seasonPass?.claimableCount ?? 0;
  const missionClaimable = missions.filter((m) => m.status === 'completed').length;
  const earnClaimable = welcomeClaimable + referralClaimable + weeklyClaimable + squadClaimable + seasonClaimable + missionClaimable;
  const claimableCount = earnClaimable + (streak?.canClaim ? 1 : 0);
  const missionsClaimed = missions.filter((m) => m.status === 'claimed').length;

  return (
    <Stack spacing={2}>
      <UserGlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography className="font-tr" sx={{ fontSize: { xs: 17, md: 20 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
          {settings.earnTabTitle || t('wallet.earnTitle')}
        </Typography>
        <Typography sx={{ ...userMutedTextSx, fontSize: 13, mt: 0.75, maxWidth: 640 }}>
          {settings.earnTabSubtitle || t('wallet.earnSubtitle')}
        </Typography>
        {claimableCount > 0 ? (
          <Typography sx={{ mt: 1.25, fontSize: 12.5, color: EARN_HUB_GOLD, fontWeight: 700 }}>
            {t('wallet.earnReadyCount', { count: claimableCount })}
          </Typography>
        ) : null}
      </UserGlassCard>

      <WalletEarnSummary
        claimableCount={claimableCount}
        streakDays={streak?.currentStreak ?? 0}
        missionsCompleted={missionsClaimed}
        missionsTotal={missions.length}
      />

      <WalletLevelPanel level={level} />

      <WalletSharePanel shareToEarn={shareToEarn} />

      <WalletDepositBonusPanel depositBonusDays={depositBonusDays} />

      <WalletLuckySpinPanel
        luckySpin={luckySpin}
        onSpun={setLuckySpin}
        onBalanceRefresh={bumpHistory}
      />

      <WalletWeeklyArenaPanel
        weeklyArena={weeklyArena}
        claiming={claimingWeekly}
        flash={flashKey === 'weekly'}
        onClaim={handleClaimWeekly}
      />

      <WalletSquadChallengePanel
        squadChallenge={squadChallenge}
        claiming={claimingSquad}
        squadBusy={squadBusy}
        flash={flashKey === 'squad'}
        onClaim={handleClaimSquad}
        onCreate={handleCreateSquad}
        onJoin={handleJoinSquad}
        onLeave={handleLeaveSquad}
      />

      <WalletSeasonPassPanel
        seasonPass={seasonPass}
        claimingKey={claimingSeasonKey}
        flashKey={flashKey}
        onClaim={handleClaimSeasonPass}
      />

      <WalletEarnHubTabs
        activeTab={hubTab}
        onChange={setHubTab}
        claimableCount={earnClaimable}
        streakClaimable={Boolean(streak?.canClaim)}
      />

      {hubTab === 'earn' ? (
        <Stack spacing={1.5}>
          <WalletWelcomePanel
            welcome={welcome}
            claimingKey={claimingWelcomeKey}
            flashKey={flashKey}
            onClaim={handleClaimWelcome}
          />

          <ReferralMilestonesPanel
            referral={referral}
            claimingKey={claimingReferralKey}
            flashKey={flashKey}
            onClaim={handleClaimReferral}
          />

          {missions.length > 0 ? (
            <>
              <UserGlassCard sx={{ p: { xs: 1.5, md: 1.75 } }}>
                <Typography className="font-tr" sx={{ fontSize: { xs: 14, md: 15 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                  {t('wallet.dailyMissionsTitle', { count: dailyMissions?.count ?? missions.length })}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 12, mt: 0.35 }}>
                  {t('wallet.dailyMissionsHint', { hour: dailyMissions?.resetHour ?? 0 })}
                </Typography>
              </UserGlassCard>
              <Stack spacing={1.25}>
                {missions.map((item) => (
                  <MissionCard
                    key={item.id}
                    item={item}
                    claiming={claimingId === item.id}
                    flash={flashKey === `mission:${item.id}`}
                    onClaim={handleClaim}
                  />
                ))}
              </Stack>
            </>
          ) : !welcome?.enabled || welcome.milestones.length === 0 ? (
            <UserGlassCard sx={{ p: { xs: 2, md: 3 } }}>
              <Typography sx={{ ...userMutedTextSx, fontSize: 14 }}>{t('wallet.earnEmpty')}</Typography>
            </UserGlassCard>
          ) : null}
        </Stack>
      ) : null}

      {hubTab === 'streak' ? (
        streak?.enabled ? (
          <Box sx={getEarnClaimFlashSx(flashKey === 'streak')}>
            <WalletStreakPanel streak={streak} claiming={claimingStreak} onClaim={handleClaimStreak} />
          </Box>
        ) : (
          <UserGlassCard sx={{ p: { xs: 2, md: 3 } }}>
            <Typography sx={{ ...userMutedTextSx, fontSize: 14 }}>{t('wallet.streakDisabled')}</Typography>
          </UserGlassCard>
        )
      ) : null}

      {hubTab === 'history' ? (
        <WalletEarnHistoryPanel
          getTransactionTitle={getTransactionTitle}
          formatDate={formatDate}
          refreshKey={historyRefreshKey}
        />
      ) : null}
    </Stack>
  );
}

export type WalletTab = 'overview' | 'earn' | 'history';

export function WalletSectionTabs({
  activeTab,
  onChange,
  showEarn,
}: {
  activeTab: WalletTab;
  onChange: (tab: WalletTab) => void;
  showEarn?: boolean;
}) {
  const { t } = useTranslate();

  const tabs = [
    { label: t('wallet.tabOverview'), value: 'overview' },
    ...(showEarn ? [{ label: t('wallet.tabEarn'), value: 'earn' }] : []),
    { label: t('wallet.tabHistory'), value: 'history' },
  ];

  return <PlayTabs tabs={tabs} activeTab={activeTab} onChange={(value) => onChange(value as WalletTab)} />;
}
