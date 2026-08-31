import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import toast from 'react-hot-toast';
import { useSettingsContext } from 'src/components/settings';
import useApi from 'src/hooks/use-api';

type WelcomeMilestoneForm = {
  enabled: boolean;
  bacAmount: number;
  title: string;
  description: string;
  icon: string;
};

type ReferralTierForm = {
  enabled: boolean;
  threshold: number;
  bacAmount: number;
  title: string;
  description: string;
  icon: string;
};

type WelcomeBonusesForm = {
  enabled: boolean;
  milestones: {
    signup: WelcomeMilestoneForm;
    first_match: WelcomeMilestoneForm;
    complete_profile: WelcomeMilestoneForm;
    first_deposit: WelcomeMilestoneForm;
  };
};

type ReferralMilestonesForm = {
  enabled: boolean;
  tiers: {
    tier_5: ReferralTierForm;
    tier_10: ReferralTierForm;
    tier_25: ReferralTierForm;
  };
};

type WeeklyArenaForm = {
  enabled: boolean;
  teamType: 'solo' | 'duo' | 'squad' | 'any';
  targetWins: number;
  bacAmount: number;
  title: string;
  description: string;
  icon: string;
  leaderboardLimit: number;
};

type SquadChallengeForm = {
  enabled: boolean;
  teamType: 'solo' | 'duo' | 'squad' | 'any';
  targetWins: number;
  bacAmount: number;
  minMembersInMatch: number;
  maxTeamSize: number;
  title: string;
  description: string;
  icon: string;
  leaderboardLimit: number;
};

type LevelTitleForm = {
  level: number;
  title: string;
  icon: string;
};

type LevelSystemForm = {
  enabled: boolean;
  xpPerJoinMatch: number;
  xpPerWin: number;
  xpPerKill: number;
  xpPerMissionClaim: number;
  xpBasePerLevel: number;
  xpGrowthPerLevel: number;
  titles: LevelTitleForm[];
};

type ShareToEarnForm = {
  enabled: boolean;
  bacAmount: number;
  title: string;
  description: string;
  icon: string;
  cooldownHours: number;
};

type DepositBonusDaysForm = {
  enabled: boolean;
  percent: number;
  startAt: string;
  endAt: string;
  title: string;
  description: string;
  icon: string;
  minDeposit: number;
};

type LuckySpinPrizeForm = {
  id: string;
  label: string;
  bacAmount: number;
  weight: number;
  icon: string;
  color: string;
};

type LuckySpinForm = {
  enabled: boolean;
  dailyFreeSpins: number;
  title: string;
  description: string;
  prizes: LuckySpinPrizeForm[];
};

type SeasonPassRewardForm = {
  bacAmount: number;
  label: string;
  icon: string;
};

type SeasonPassTierForm = {
  level: number;
  xpRequired: number;
  freeReward: SeasonPassRewardForm;
  plusReward: SeasonPassRewardForm;
};

type SeasonPassForm = {
  enabled: boolean;
  seasonKey: string;
  title: string;
  description: string;
  icon: string;
  startAt: string;
  endAt: string;
  xpPerJoinMatch: number;
  xpPerWin: number;
  xpPerMissionClaim: number;
  tiers: SeasonPassTierForm[];
};

type EngagementSettingsForm = {
  enabled: boolean;
  streakEnabled: boolean;
  badgesEnabled: boolean;
  dailyMissionsEnabled: boolean;
  dailyMissionsCount: number;
  dailyMissionsResetHour: number;
  dailyLoginReward: number;
  streakBonusPerDay: number;
  maxStreakBonus: number;
  welcomeBonuses: WelcomeBonusesForm;
  referralMilestones: ReferralMilestonesForm;
  weeklyArenaChallenge: WeeklyArenaForm;
  squadChallenge: SquadChallengeForm;
  levelSystem: LevelSystemForm;
  shareToEarn: ShareToEarnForm;
  depositBonusDays: DepositBonusDaysForm;
  luckySpin: LuckySpinForm;
  seasonPass: SeasonPassForm;
  smartNotificationsEnabled: boolean;
  streakAtRiskHoursBeforeReset: number;
  earnTabTitle: string;
  earnTabSubtitle: string;
};

const DEFAULT_MILESTONE: WelcomeMilestoneForm = {
  enabled: true,
  bacAmount: 20,
  title: '',
  description: '',
  icon: 'solar:gift-bold',
};

const DEFAULT_REFERRAL_TIER: ReferralTierForm = {
  enabled: true,
  threshold: 5,
  bacAmount: 50,
  title: '',
  description: '',
  icon: 'solar:users-group-rounded-bold',
};

const DEFAULT_FORM: EngagementSettingsForm = {
  enabled: true,
  streakEnabled: true,
  badgesEnabled: true,
  dailyMissionsEnabled: true,
  dailyMissionsCount: 3,
  dailyMissionsResetHour: 0,
  dailyLoginReward: 5,
  streakBonusPerDay: 2,
  maxStreakBonus: 50,
  welcomeBonuses: {
    enabled: true,
    milestones: {
      signup: { ...DEFAULT_MILESTONE, title: 'Welcome Bonus', icon: 'solar:hand-stars-bold' },
      first_match: { ...DEFAULT_MILESTONE, title: 'First Match Bonus', bacAmount: 15, icon: 'solar:gamepad-bold' },
      complete_profile: { ...DEFAULT_MILESTONE, title: 'Complete Profile', bacAmount: 25, icon: 'solar:user-id-bold' },
      first_deposit: { ...DEFAULT_MILESTONE, title: 'First Deposit Bonus', bacAmount: 30, icon: 'solar:wallet-bold' },
    },
  },
  referralMilestones: {
    enabled: true,
    tiers: {
      tier_5: { ...DEFAULT_REFERRAL_TIER, threshold: 5, bacAmount: 50, title: 'Referral Starter' },
      tier_10: { ...DEFAULT_REFERRAL_TIER, threshold: 10, bacAmount: 100, title: 'Referral Builder', icon: 'solar:users-group-two-rounded-bold' },
      tier_25: { ...DEFAULT_REFERRAL_TIER, threshold: 25, bacAmount: 250, title: 'Referral Champion', icon: 'solar:crown-star-bold' },
    },
  },
  weeklyArenaChallenge: {
    enabled: true,
    teamType: 'squad',
    targetWins: 3,
    bacAmount: 75,
    title: 'Weekly Squad Wins',
    description: 'Win 3 squad matches this week to claim your arena bonus.',
    icon: 'solar:cup-star-bold',
    leaderboardLimit: 10,
  },
  squadChallenge: {
    enabled: true,
    teamType: 'squad',
    targetWins: 2,
    bacAmount: 100,
    minMembersInMatch: 2,
    maxTeamSize: 4,
    title: 'Squad Challenge',
    description: 'Team up with friends and win squad matches together this week.',
    icon: 'solar:users-group-rounded-bold',
    leaderboardLimit: 10,
  },
  levelSystem: {
    enabled: true,
    xpPerJoinMatch: 5,
    xpPerWin: 25,
    xpPerKill: 2,
    xpPerMissionClaim: 10,
    xpBasePerLevel: 100,
    xpGrowthPerLevel: 25,
    titles: [
      { level: 1, title: 'Rookie', icon: 'solar:user-bold' },
      { level: 5, title: 'Contender', icon: 'solar:shield-bold' },
      { level: 10, title: 'Veteran', icon: 'solar:medal-star-bold' },
      { level: 20, title: 'Elite', icon: 'solar:cup-star-bold' },
      { level: 35, title: 'Champion', icon: 'solar:crown-star-bold' },
      { level: 50, title: 'Legend', icon: 'solar:star-bold' },
    ],
  },
  shareToEarn: {
    enabled: true,
    bacAmount: 5,
    title: 'Share Match Result',
    description: 'Share a completed match result to earn a small BAC bonus.',
    icon: 'solar:share-bold',
    cooldownHours: 0,
  },
  depositBonusDays: {
    enabled: false,
    percent: 10,
    startAt: '',
    endAt: '',
    title: 'Deposit Bonus Days',
    description: 'Deposit during the promo window and get an extra BAC bonus on approval.',
    icon: 'solar:wad-of-money-bold',
    minDeposit: 0,
  },
  luckySpin: {
    enabled: true,
    dailyFreeSpins: 1,
    title: 'Lucky Spin',
    description: 'Spin once per day. Odds are public — what you see is what you get.',
    prizes: [
      { id: 'miss', label: 'Try again', bacAmount: 0, weight: 40, icon: 'solar:close-circle-bold', color: '#6b7280' },
      { id: 'bac_5', label: '5 BAC', bacAmount: 5, weight: 30, icon: 'solar:wad-of-money-bold', color: '#f5c518' },
      { id: 'bac_10', label: '10 BAC', bacAmount: 10, weight: 20, icon: 'solar:cup-star-bold', color: '#34d399' },
      { id: 'bac_25', label: '25 BAC', bacAmount: 25, weight: 8, icon: 'solar:medal-star-bold', color: '#60a5fa' },
      { id: 'bac_50', label: '50 BAC', bacAmount: 50, weight: 2, icon: 'solar:crown-star-bold', color: '#f472b6' },
    ],
  },
  seasonPass: {
    enabled: true,
    seasonKey: '2026-s1',
    title: 'BattleAsia Season Pass',
    description: 'Earn season XP from matches and missions. Claim free rewards — unlock the Plus track with Premium.',
    icon: 'solar:passport-bold',
    startAt: '',
    endAt: '',
    xpPerJoinMatch: 10,
    xpPerWin: 40,
    xpPerMissionClaim: 25,
    tiers: [
      {
        level: 1,
        xpRequired: 100,
        freeReward: { bacAmount: 10, label: 'Free Tier 1', icon: 'solar:gift-bold' },
        plusReward: { bacAmount: 25, label: 'Plus Tier 1', icon: 'solar:star-bold' },
      },
      {
        level: 2,
        xpRequired: 250,
        freeReward: { bacAmount: 15, label: 'Free Tier 2', icon: 'solar:medal-ribbons-bold' },
        plusReward: { bacAmount: 40, label: 'Plus Tier 2', icon: 'solar:crown-bold' },
      },
      {
        level: 3,
        xpRequired: 500,
        freeReward: { bacAmount: 20, label: 'Free Tier 3', icon: 'solar:shield-bold' },
        plusReward: { bacAmount: 60, label: 'Plus Tier 3', icon: 'solar:medal-star-bold' },
      },
    ],
  },
  smartNotificationsEnabled: true,
  streakAtRiskHoursBeforeReset: 4,
  earnTabTitle: 'Earn BAC',
  earnTabSubtitle: 'Complete missions and claim rewards to grow your wallet.',
};

const MILESTONE_LABELS: Record<keyof WelcomeBonusesForm['milestones'], string> = {
  signup: 'Signup (email verified)',
  first_match: 'First match joined',
  complete_profile: 'Complete profile',
  first_deposit: 'First deposit approved',
};

const TIER_LABELS: Record<keyof ReferralMilestonesForm['tiers'], string> = {
  tier_5: 'Tier 1 — starter referrals',
  tier_10: 'Tier 2 — growing network',
  tier_25: 'Tier 3 — champion referrer',
};

function TierEditor({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: ReferralTierForm;
  onChange: (next: ReferralTierForm) => void;
  disabled?: boolean;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">{label}</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={value.enabled}
              onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
              disabled={disabled}
            />
          }
          label="Enabled"
        />
      </Stack>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Title"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="Referrals needed"
            value={value.threshold}
            onChange={(e) => onChange({ ...value, threshold: Number(e.target.value) })}
            disabled={disabled}
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="BAC reward"
            value={value.bacAmount}
            onChange={(e) => onChange({ ...value, bacAmount: Number(e.target.value) })}
            disabled={disabled}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Icon"
            value={value.icon}
            onChange={(e) => onChange({ ...value, icon: e.target.value })}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            disabled={disabled}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

function MilestoneEditor({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: WelcomeMilestoneForm;
  onChange: (next: WelcomeMilestoneForm) => void;
  disabled?: boolean;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">{label}</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={value.enabled}
              onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
              disabled={disabled}
            />
          }
          label="Enabled"
        />
      </Stack>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Title"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="BAC reward"
            value={value.bacAmount}
            onChange={(e) => onChange({ ...value, bacAmount: Number(e.target.value) })}
            disabled={disabled}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Icon"
            value={value.icon}
            onChange={(e) => onChange({ ...value, icon: e.target.value })}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            disabled={disabled}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export default function EngagementSettingsView() {
  const settings = useSettingsContext();
  const { getEngagementSettingsApi, updateEngagementSettingsApi } = useApi();
  const [form, setForm] = useState<EngagementSettingsForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadSettings = useCallback(async () => {
    setFetching(true);
    try {
      const response = await getEngagementSettingsApi();
      if (response?.data?.status && response.data.data) {
        setForm((prev) => ({
          ...prev,
          ...response.data.data,
          welcomeBonuses: {
            ...prev.welcomeBonuses,
            ...response.data.data.welcomeBonuses,
            milestones: {
              ...prev.welcomeBonuses.milestones,
              ...response.data.data.welcomeBonuses?.milestones,
            },
          },
          referralMilestones: {
            ...prev.referralMilestones,
            ...response.data.data.referralMilestones,
            tiers: {
              ...prev.referralMilestones.tiers,
              ...response.data.data.referralMilestones?.tiers,
            },
          },
          weeklyArenaChallenge: {
            ...prev.weeklyArenaChallenge,
            ...response.data.data.weeklyArenaChallenge,
          },
          squadChallenge: {
            ...prev.squadChallenge,
            ...response.data.data.squadChallenge,
          },
          levelSystem: {
            ...prev.levelSystem,
            ...response.data.data.levelSystem,
            titles: Array.isArray(response.data.data.levelSystem?.titles)
              ? response.data.data.levelSystem.titles
              : prev.levelSystem.titles,
          },
          shareToEarn: {
            ...prev.shareToEarn,
            ...response.data.data.shareToEarn,
          },
          depositBonusDays: {
            ...prev.depositBonusDays,
            ...response.data.data.depositBonusDays,
            startAt: response.data.data.depositBonusDays?.startAt
              ? String(response.data.data.depositBonusDays.startAt).slice(0, 16)
              : '',
            endAt: response.data.data.depositBonusDays?.endAt
              ? String(response.data.data.depositBonusDays.endAt).slice(0, 16)
              : '',
          },
          luckySpin: {
            ...prev.luckySpin,
            ...response.data.data.luckySpin,
            prizes: Array.isArray(response.data.data.luckySpin?.prizes)
              ? response.data.data.luckySpin.prizes
              : prev.luckySpin.prizes,
          },
          seasonPass: {
            ...prev.seasonPass,
            ...response.data.data.seasonPass,
            startAt: response.data.data.seasonPass?.startAt
              ? String(response.data.data.seasonPass.startAt).slice(0, 16)
              : '',
            endAt: response.data.data.seasonPass?.endAt
              ? String(response.data.data.seasonPass.endAt).slice(0, 16)
              : '',
            tiers: Array.isArray(response.data.data.seasonPass?.tiers)
              ? response.data.data.seasonPass.tiers
              : prev.seasonPass.tiers,
          },
        }));
      }
    } catch (error) {
      toast.error('Failed to load engagement settings');
    } finally {
      setFetching(false);
    }
  }, [getEngagementSettingsApi]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleNumberChange = (field: keyof EngagementSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: Number(event.target.value) }));
  };

  const handleTextChange = (field: keyof EngagementSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await updateEngagementSettingsApi(form);
      if (response?.data?.status) {
        toast.success('Engagement settings saved');
        loadSettings();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack spacing={3} sx={{ py: 2 }}>
        <Typography variant="h4">Engagement Settings</Typography>

        <Alert severity="success">
          Deposit bonus days (Phase 12) and Level / XP settings are configurable below with weekly arena and referral settings.
        </Alert>

        <Card>
          <CardHeader title="Weekly arena challenge" subheader="BD calendar week wins + mini leaderboard in Wallet → Earn" />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.weeklyArenaChallenge.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: { ...prev.weeklyArenaChallenge, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable weekly arena challenge"
              />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.weeklyArenaChallenge.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: { ...prev.weeklyArenaChallenge, title: e.target.value },
                      }))
                    }
                    disabled={fetching}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    label="Team type"
                    value={form.weeklyArenaChallenge.teamType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: {
                          ...prev.weeklyArenaChallenge,
                          teamType: e.target.value as WeeklyArenaForm['teamType'],
                        },
                      }))
                    }
                    disabled={fetching}
                  >
                    <option value="squad">Squad</option>
                    <option value="duo">Duo</option>
                    <option value="solo">Solo</option>
                    <option value="any">Any</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Wins required"
                    value={form.weeklyArenaChallenge.targetWins}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: {
                          ...prev.weeklyArenaChallenge,
                          targetWins: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="BAC reward"
                    value={form.weeklyArenaChallenge.bacAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: {
                          ...prev.weeklyArenaChallenge,
                          bacAmount: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Leaderboard size"
                    value={form.weeklyArenaChallenge.leaderboardLimit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: {
                          ...prev.weeklyArenaChallenge,
                          leaderboardLimit: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 3, max: 25 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Icon"
                    value={form.weeklyArenaChallenge.icon}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: { ...prev.weeklyArenaChallenge, icon: e.target.value },
                      }))
                    }
                    disabled={fetching}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.weeklyArenaChallenge.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weeklyArenaChallenge: { ...prev.weeklyArenaChallenge, description: e.target.value },
                      }))
                    }
                    disabled={fetching}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Squad challenge"
            subheader="Invite-code squads with shared weekly win goals in Wallet → Earn"
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.squadChallenge.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: { ...prev.squadChallenge, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable squad challenge"
              />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.squadChallenge.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: { ...prev.squadChallenge, title: e.target.value },
                      }))
                    }
                    disabled={fetching}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    label="Team type"
                    value={form.squadChallenge.teamType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: {
                          ...prev.squadChallenge,
                          teamType: e.target.value as SquadChallengeForm['teamType'],
                        },
                      }))
                    }
                    disabled={fetching}
                  >
                    <option value="squad">Squad</option>
                    <option value="duo">Duo</option>
                    <option value="solo">Solo</option>
                    <option value="any">Any</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Wins required"
                    value={form.squadChallenge.targetWins}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: {
                          ...prev.squadChallenge,
                          targetWins: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="BAC reward"
                    value={form.squadChallenge.bacAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: {
                          ...prev.squadChallenge,
                          bacAmount: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min members in match"
                    value={form.squadChallenge.minMembersInMatch}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: {
                          ...prev.squadChallenge,
                          minMembersInMatch: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 2, max: 4 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max squad size"
                    value={form.squadChallenge.maxTeamSize}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: {
                          ...prev.squadChallenge,
                          maxTeamSize: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 2, max: 4 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Leaderboard size"
                    value={form.squadChallenge.leaderboardLimit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: {
                          ...prev.squadChallenge,
                          leaderboardLimit: Number(e.target.value),
                        },
                      }))
                    }
                    disabled={fetching}
                    inputProps={{ min: 3, max: 25 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Icon"
                    value={form.squadChallenge.icon}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: { ...prev.squadChallenge, icon: e.target.value },
                      }))
                    }
                    disabled={fetching}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.squadChallenge.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        squadChallenge: { ...prev.squadChallenge, description: e.target.value },
                      }))
                    }
                    disabled={fetching}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Level / XP"
            subheader="Lightweight player levels from match XP + mission claims. Titles unlock by level."
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.levelSystem.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        levelSystem: { ...prev.levelSystem, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable level / XP system"
              />
              <Grid container spacing={1.5}>
                {(
                  [
                    ['xpPerJoinMatch', 'XP per match join'],
                    ['xpPerWin', 'XP per win'],
                    ['xpPerKill', 'XP per kill'],
                    ['xpPerMissionClaim', 'XP per mission claim'],
                    ['xpBasePerLevel', 'Base XP per level'],
                    ['xpGrowthPerLevel', 'Extra XP growth / level'],
                  ] as const
                ).map(([field, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <TextField
                      fullWidth
                      type="number"
                      label={label}
                      value={form.levelSystem[field]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          levelSystem: {
                            ...prev.levelSystem,
                            [field]: Number(e.target.value),
                          },
                        }))
                      }
                      disabled={fetching || !form.levelSystem.enabled}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Level titles</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={fetching || !form.levelSystem.enabled || form.levelSystem.titles.length >= 20}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      levelSystem: {
                        ...prev.levelSystem,
                        titles: [
                          ...prev.levelSystem.titles,
                          {
                            level: (prev.levelSystem.titles.at(-1)?.level || 1) + 5,
                            title: 'New Title',
                            icon: 'solar:medal-star-bold',
                          },
                        ],
                      },
                    }))
                  }
                >
                  Add title
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {form.levelSystem.titles.map((titleRow, index) => (
                  <Grid container spacing={1.5} key={`title-${index}`}>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Level"
                        value={titleRow.level}
                        onChange={(e) =>
                          setForm((prev) => {
                            const titles = [...prev.levelSystem.titles];
                            titles[index] = { ...titles[index], level: Number(e.target.value) };
                            return { ...prev, levelSystem: { ...prev.levelSystem, titles } };
                          })
                        }
                        disabled={fetching || !form.levelSystem.enabled}
                        inputProps={{ min: 1, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={titleRow.title}
                        onChange={(e) =>
                          setForm((prev) => {
                            const titles = [...prev.levelSystem.titles];
                            titles[index] = { ...titles[index], title: e.target.value };
                            return { ...prev, levelSystem: { ...prev.levelSystem, titles } };
                          })
                        }
                        disabled={fetching || !form.levelSystem.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Icon"
                        value={titleRow.icon}
                        onChange={(e) =>
                          setForm((prev) => {
                            const titles = [...prev.levelSystem.titles];
                            titles[index] = { ...titles[index], icon: e.target.value };
                            return { ...prev, levelSystem: { ...prev.levelSystem, titles } };
                          })
                        }
                        disabled={fetching || !form.levelSystem.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        color="error"
                        size="small"
                        disabled={fetching || form.levelSystem.titles.length <= 1}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            levelSystem: {
                              ...prev.levelSystem,
                              titles: prev.levelSystem.titles.filter((_, i) => i !== index),
                            },
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Share-to-earn"
            subheader="Post-match share card on result page. Optional BAC when a participant shares a completed match."
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.shareToEarn.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shareToEarn: { ...prev.shareToEarn, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable share-to-earn"
              />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.shareToEarn.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shareToEarn: { ...prev.shareToEarn, title: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.shareToEarn.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="BAC reward"
                    value={form.shareToEarn.bacAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shareToEarn: { ...prev.shareToEarn, bacAmount: Number(e.target.value) },
                      }))
                    }
                    disabled={fetching || !form.shareToEarn.enabled}
                    inputProps={{ min: 0 }}
                    helperText="0 = share UI only"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cooldown (hours)"
                    value={form.shareToEarn.cooldownHours}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shareToEarn: { ...prev.shareToEarn, cooldownHours: Number(e.target.value) },
                      }))
                    }
                    disabled={fetching || !form.shareToEarn.enabled}
                    inputProps={{ min: 0, max: 168 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Icon"
                    value={form.shareToEarn.icon}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shareToEarn: { ...prev.shareToEarn, icon: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.shareToEarn.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.shareToEarn.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shareToEarn: { ...prev.shareToEarn, description: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.shareToEarn.enabled}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Deposit bonus days"
            subheader="Scheduled % BAC bonus applied automatically when a deposit is approved during the window."
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.depositBonusDays.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable deposit bonus days"
              />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.depositBonusDays.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, title: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Bonus percent"
                    value={form.depositBonusDays.percent}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, percent: Number(e.target.value) },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                    inputProps={{ min: 0, max: 100 }}
                    helperText="e.g. 10 = +10%"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min deposit (BAC)"
                    value={form.depositBonusDays.minDeposit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, minDeposit: Number(e.target.value) },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Starts at"
                    value={form.depositBonusDays.startAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, startAt: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                    InputLabelProps={{ shrink: true }}
                    helperText="Leave empty for open start"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Ends at"
                    value={form.depositBonusDays.endAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, endAt: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                    InputLabelProps={{ shrink: true }}
                    helperText="Leave empty for open end"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Icon"
                    value={form.depositBonusDays.icon}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, icon: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.depositBonusDays.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        depositBonusDays: { ...prev.depositBonusDays, description: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.depositBonusDays.enabled}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Season pass / Plus perks"
            subheader="Dual-track season ladder — free rewards for everyone, Plus track requires active Premium"
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.seasonPass.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seasonPass: { ...prev.seasonPass, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable season pass"
              />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Season key"
                    value={form.seasonPass.seasonKey}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seasonPass: { ...prev.seasonPass, seasonKey: e.target.value },
                      }))
                    }
                    disabled={fetching}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.seasonPass.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seasonPass: { ...prev.seasonPass, title: e.target.value },
                      }))
                    }
                    disabled={fetching}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Start at (optional)"
                    value={form.seasonPass.startAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seasonPass: { ...prev.seasonPass, startAt: e.target.value },
                      }))
                    }
                    disabled={fetching}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="End at (optional)"
                    value={form.seasonPass.endAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seasonPass: { ...prev.seasonPass, endAt: e.target.value },
                      }))
                    }
                    disabled={fetching}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {(
                  [
                    ['xpPerJoinMatch', 'XP per match join'],
                    ['xpPerWin', 'XP per win'],
                    ['xpPerMissionClaim', 'XP per mission claim'],
                  ] as const
                ).map(([field, label]) => (
                  <Grid item xs={12} sm={4} key={field}>
                    <TextField
                      fullWidth
                      type="number"
                      label={label}
                      value={form.seasonPass[field]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          seasonPass: { ...prev.seasonPass, [field]: Number(e.target.value) },
                        }))
                      }
                      disabled={fetching}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.seasonPass.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        seasonPass: { ...prev.seasonPass, description: e.target.value },
                      }))
                    }
                    disabled={fetching}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Season tiers</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={fetching || form.seasonPass.tiers.length >= 30}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      seasonPass: {
                        ...prev.seasonPass,
                        tiers: [
                          ...prev.seasonPass.tiers,
                          {
                            level: prev.seasonPass.tiers.length + 1,
                            xpRequired: (prev.seasonPass.tiers.at(-1)?.xpRequired ?? 0) + 200,
                            freeReward: { bacAmount: 10, label: `Free Tier ${prev.seasonPass.tiers.length + 1}`, icon: 'solar:gift-bold' },
                            plusReward: { bacAmount: 25, label: `Plus Tier ${prev.seasonPass.tiers.length + 1}`, icon: 'solar:star-bold' },
                          },
                        ],
                      },
                    }))
                  }
                >
                  Add tier
                </Button>
              </Stack>

              {form.seasonPass.tiers.map((tier, index) => (
                <Box key={`season-tier-${index}`} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Tier {tier.level}</Typography>
                    <Button
                      size="small"
                      color="error"
                      disabled={fetching || form.seasonPass.tiers.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          seasonPass: {
                            ...prev.seasonPass,
                            tiers: prev.seasonPass.tiers
                              .filter((_, i) => i !== index)
                              .map((entry, i) => ({ ...entry, level: i + 1 })),
                          },
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="XP required"
                        value={tier.xpRequired}
                        onChange={(e) => {
                          const tiers = [...form.seasonPass.tiers];
                          tiers[index] = { ...tiers[index], xpRequired: Number(e.target.value) };
                          setForm((prev) => ({ ...prev, seasonPass: { ...prev.seasonPass, tiers } }));
                        }}
                        disabled={fetching}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Free BAC"
                        value={tier.freeReward.bacAmount}
                        onChange={(e) => {
                          const tiers = [...form.seasonPass.tiers];
                          tiers[index] = {
                            ...tiers[index],
                            freeReward: { ...tiers[index].freeReward, bacAmount: Number(e.target.value) },
                          };
                          setForm((prev) => ({ ...prev, seasonPass: { ...prev.seasonPass, tiers } }));
                        }}
                        disabled={fetching}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Plus BAC"
                        value={tier.plusReward.bacAmount}
                        onChange={(e) => {
                          const tiers = [...form.seasonPass.tiers];
                          tiers[index] = {
                            ...tiers[index],
                            plusReward: { ...tiers[index].plusReward, bacAmount: Number(e.target.value) },
                          };
                          setForm((prev) => ({ ...prev, seasonPass: { ...prev.seasonPass, tiers } }));
                        }}
                        disabled={fetching}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Free label"
                        value={tier.freeReward.label}
                        onChange={(e) => {
                          const tiers = [...form.seasonPass.tiers];
                          tiers[index] = {
                            ...tiers[index],
                            freeReward: { ...tiers[index].freeReward, label: e.target.value },
                          };
                          setForm((prev) => ({ ...prev, seasonPass: { ...prev.seasonPass, tiers } }));
                        }}
                        disabled={fetching}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Lucky spin"
            subheader="Daily free spin with a transparent prize table. Weights determine public odds."
          />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.luckySpin.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        luckySpin: { ...prev.luckySpin, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable lucky spin"
              />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={form.luckySpin.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        luckySpin: { ...prev.luckySpin, title: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.luckySpin.enabled}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Daily free spins"
                    value={form.luckySpin.dailyFreeSpins}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        luckySpin: { ...prev.luckySpin, dailyFreeSpins: Number(e.target.value) },
                      }))
                    }
                    disabled={fetching || !form.luckySpin.enabled}
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={form.luckySpin.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        luckySpin: { ...prev.luckySpin, description: e.target.value },
                      }))
                    }
                    disabled={fetching || !form.luckySpin.enabled}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">
                  Prize table
                  {(() => {
                    const total = form.luckySpin.prizes.reduce((sum, p) => sum + Math.max(p.weight, 0), 0) || 1;
                    return ` · total weight ${total}`;
                  })()}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={fetching || !form.luckySpin.enabled || form.luckySpin.prizes.length >= 12}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      luckySpin: {
                        ...prev.luckySpin,
                        prizes: [
                          ...prev.luckySpin.prizes,
                          {
                            id: `prize_${prev.luckySpin.prizes.length + 1}`,
                            label: 'New prize',
                            bacAmount: 0,
                            weight: 10,
                            icon: 'solar:gift-bold',
                            color: '#9ca3af',
                          },
                        ],
                      },
                    }))
                  }
                >
                  Add prize
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {form.luckySpin.prizes.map((prize, index) => {
                  const totalWeight =
                    form.luckySpin.prizes.reduce((sum, p) => sum + Math.max(p.weight, 0), 0) || 1;
                  const pct = Math.round((Math.max(prize.weight, 0) / totalWeight) * 1000) / 10;
                  return (
                    <Grid container spacing={1.5} key={`spin-prize-${index}`} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="ID"
                          value={prize.id}
                          onChange={(e) =>
                            setForm((prev) => {
                              const prizes = [...prev.luckySpin.prizes];
                              prizes[index] = { ...prizes[index], id: e.target.value };
                              return { ...prev, luckySpin: { ...prev.luckySpin, prizes } };
                            })
                          }
                          disabled={fetching || !form.luckySpin.enabled}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          fullWidth
                          label="Label"
                          value={prize.label}
                          onChange={(e) =>
                            setForm((prev) => {
                              const prizes = [...prev.luckySpin.prizes];
                              prizes[index] = { ...prizes[index], label: e.target.value };
                              return { ...prev, luckySpin: { ...prev.luckySpin, prizes } };
                            })
                          }
                          disabled={fetching || !form.luckySpin.enabled}
                        />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField
                          fullWidth
                          type="number"
                          label="BAC"
                          value={prize.bacAmount}
                          onChange={(e) =>
                            setForm((prev) => {
                              const prizes = [...prev.luckySpin.prizes];
                              prizes[index] = { ...prizes[index], bacAmount: Number(e.target.value) };
                              return { ...prev, luckySpin: { ...prev.luckySpin, prizes } };
                            })
                          }
                          disabled={fetching || !form.luckySpin.enabled}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField
                          fullWidth
                          type="number"
                          label={`Weight (${pct}%)`}
                          value={prize.weight}
                          onChange={(e) =>
                            setForm((prev) => {
                              const prizes = [...prev.luckySpin.prizes];
                              prizes[index] = { ...prizes[index], weight: Number(e.target.value) };
                              return { ...prev, luckySpin: { ...prev.luckySpin, prizes } };
                            })
                          }
                          disabled={fetching || !form.luckySpin.enabled}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          label="Icon"
                          value={prize.icon}
                          onChange={(e) =>
                            setForm((prev) => {
                              const prizes = [...prev.luckySpin.prizes];
                              prizes[index] = { ...prizes[index], icon: e.target.value };
                              return { ...prev, luckySpin: { ...prev.luckySpin, prizes } };
                            })
                          }
                          disabled={fetching || !form.luckySpin.enabled}
                        />
                      </Grid>
                      <Grid item xs={4} sm={1.5}>
                        <TextField
                          fullWidth
                          label="Color"
                          value={prize.color}
                          onChange={(e) =>
                            setForm((prev) => {
                              const prizes = [...prev.luckySpin.prizes];
                              prizes[index] = { ...prizes[index], color: e.target.value };
                              return { ...prev, luckySpin: { ...prev.luckySpin, prizes } };
                            })
                          }
                          disabled={fetching || !form.luckySpin.enabled}
                        />
                      </Grid>
                      <Grid item xs={2} sm={1.5}>
                        <Button
                          color="error"
                          size="small"
                          disabled={fetching || form.luckySpin.prizes.length <= 2}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              luckySpin: {
                                ...prev.luckySpin,
                                prizes: prev.luckySpin.prizes.filter((_, i) => i !== index),
                              },
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  );
                })}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Referral milestones" subheader="One-time BAC bonuses at referral count tiers (Wallet → Earn + Referral page)" />
          <CardContent>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.referralMilestones.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        referralMilestones: { ...prev.referralMilestones, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable referral milestone rewards"
              />
              {(Object.keys(TIER_LABELS) as Array<keyof ReferralMilestonesForm['tiers']>).map((key, index, arr) => (
                <Stack key={key} spacing={2}>
                  <TierEditor
                    label={TIER_LABELS[key]}
                    value={form.referralMilestones.tiers[key]}
                    disabled={fetching}
                    onChange={(next) =>
                      setForm((prev) => ({
                        ...prev,
                        referralMilestones: {
                          ...prev.referralMilestones,
                          tiers: { ...prev.referralMilestones.tiers, [key]: next },
                        },
                      }))
                    }
                  />
                  {index < arr.length - 1 ? <Divider /> : null}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Welcome bonuses (one-time)" subheader="New player starter rewards in Wallet → Earn" />
          <CardContent>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.welcomeBonuses.enabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        welcomeBonuses: { ...prev.welcomeBonuses, enabled: e.target.checked },
                      }))
                    }
                  />
                }
                label="Enable welcome bonus track"
              />
              {(Object.keys(MILESTONE_LABELS) as Array<keyof WelcomeBonusesForm['milestones']>).map((key, index, arr) => (
                <Stack key={key} spacing={2}>
                  <MilestoneEditor
                    label={MILESTONE_LABELS[key]}
                    value={form.welcomeBonuses.milestones[key]}
                    disabled={fetching}
                    onChange={(next) =>
                      setForm((prev) => ({
                        ...prev,
                        welcomeBonuses: {
                          ...prev.welcomeBonuses,
                          milestones: { ...prev.welcomeBonuses.milestones, [key]: next },
                        },
                      }))
                    }
                  />
                  {index < arr.length - 1 ? <Divider /> : null}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Daily missions rotation" subheader="Users see N random missions from the daily pool each day" />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.dailyMissionsEnabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, dailyMissionsEnabled: e.target.checked }))}
                  />
                }
                label="Enable daily mission rotation"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Missions per day"
                    value={form.dailyMissionsCount}
                    onChange={handleNumberChange('dailyMissionsCount')}
                    disabled={fetching}
                    inputProps={{ min: 1, max: 5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Daily reset hour (BD, 0–23)"
                    value={form.dailyMissionsResetHour}
                    onChange={handleNumberChange('dailyMissionsResetHour')}
                    disabled={fetching}
                    helperText="0 = midnight Bangladesh time"
                    inputProps={{ min: 0, max: 23 }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Global toggles" />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.enabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                  />
                }
                label="Enable engagement / Earn tab for users"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.streakEnabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, streakEnabled: e.target.checked }))}
                  />
                }
                label="Enable daily login streak"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.badgesEnabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, badgesEnabled: e.target.checked }))}
                  />
                }
                label="Enable achievement badges on profiles"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.smartNotificationsEnabled}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, smartNotificationsEnabled: e.target.checked }))
                    }
                  />
                }
                label="Smart reward notifications (mission complete, claim ready, streak at risk)"
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Smart notifications"
            subheader="In-app + realtime alerts when rewards are ready. Streak-at-risk fires when the day is almost over."
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Streak-at-risk hours before reset"
                  value={form.streakAtRiskHoursBeforeReset}
                  onChange={handleNumberChange('streakAtRiskHoursBeforeReset')}
                  disabled={fetching || !form.smartNotificationsEnabled}
                  inputProps={{ min: 1, max: 12 }}
                  helperText="Notify users who have not checked in yet"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Streak economy (BAC)" subheader="Today's reward = base + min((streak-1) × bonus/day, max cap)" />
          <CardContent>
            <Grid container spacing={2}>
              {(
                [
                  ['dailyLoginReward', 'Daily login base reward'],
                  ['streakBonusPerDay', 'Extra BAC per streak day'],
                  ['maxStreakBonus', 'Max streak bonus cap'],
                ] as const
              ).map(([field, label]) => (
                <Grid item xs={12} sm={6} md={4} key={field}>
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    value={form[field]}
                    onChange={handleNumberChange(field)}
                    disabled={fetching}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="User-facing copy" subheader="Wallet Earn tab headline" />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Earn tab title"
                value={form.earnTabTitle}
                onChange={handleTextChange('earnTabTitle')}
                disabled={fetching}
              />
              <TextField
                fullWidth
                label="Earn tab subtitle"
                value={form.earnTabSubtitle}
                onChange={handleTextChange('earnTabSubtitle')}
                disabled={fetching}
                multiline
                rows={2}
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2}>
          <LoadingButton variant="contained" loading={loading} onClick={handleSave}>
            Save settings
          </LoadingButton>
          <Button variant="outlined" onClick={loadSettings} disabled={fetching}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
