import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Avatar,
  AvatarGroup,
  Box,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, getEarnClaimFlashSx, getEarnReadyPulseSx } from './wallet-earn-hub-styles';

export type SquadMember = {
  userId: string;
  username: string;
  avatar: string;
};

export type SquadInfo = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  isOwner: boolean;
  members: SquadMember[];
};

export type SquadLeaderboardEntry = {
  rank: number;
  squadId: string;
  name: string;
  memberCount: number;
  winCount: number;
  isViewer?: boolean;
};

export type SquadChallengeState = {
  enabled: boolean;
  periodKey?: string;
  title?: string;
  description?: string;
  icon?: string;
  teamType?: string;
  targetWins?: number;
  bacAmount?: number;
  minMembersInMatch?: number;
  maxTeamSize?: number;
  winCount?: number;
  progress?: number;
  status?: 'active' | 'completed' | 'claimed';
  canClaim?: boolean;
  squad?: SquadInfo | null;
  leaderboard?: SquadLeaderboardEntry[];
  viewerRank?: number | null;
};

const TEAM_LABELS: Record<string, string> = {
  solo: 'Solo',
  duo: 'Duo',
  squad: 'Squad',
  any: 'Any mode',
};

type Props = {
  squadChallenge: SquadChallengeState | null;
  claiming: boolean;
  squadBusy: boolean;
  flash?: boolean;
  onClaim: () => void;
  onCreate: (name: string) => Promise<void>;
  onJoin: (inviteCode: string) => Promise<void>;
  onLeave: () => Promise<void>;
};

export function WalletSquadChallengePanel({
  squadChallenge,
  claiming,
  squadBusy,
  flash = false,
  onClaim,
  onCreate,
  onJoin,
  onLeave,
}: Props) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();
  const [squadName, setSquadName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  if (!squadChallenge?.enabled) return null;

  const targetWins = squadChallenge.targetWins ?? 1;
  const winCount = squadChallenge.winCount ?? 0;
  const percent = Math.min(((squadChallenge.progress ?? winCount) / targetWins) * 100, 100);
  const isClaimed = squadChallenge.status === 'claimed';
  const canClaim = Boolean(squadChallenge.canClaim);
  const teamLabel = TEAM_LABELS[String(squadChallenge.teamType || 'any')] || squadChallenge.teamType;
  const hasSquad = Boolean(squadChallenge.squad);

  const handleCreate = async () => {
    const name = squadName.trim();
    if (!name) return;
    await onCreate(name);
    setSquadName('');
  };

  const handleJoin = async () => {
    const code = inviteCode.trim();
    if (!code) return;
    await onJoin(code);
    setInviteCode('');
  };

  return (
    <Stack spacing={1.25}>
      <UserGlassCard
        sx={{
          p: { xs: 1.75, md: 2.25 },
          ...getEarnClaimFlashSx(flash),
          ...getEarnReadyPulseSx(canClaim && !flash),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: alpha(EARN_HUB_GOLD, 0.12),
              border: `1px solid ${alpha(EARN_HUB_GOLD, 0.25)}`,
              color: EARN_HUB_GOLD,
            }}
          >
            <Iconify icon={squadChallenge.icon || 'solar:users-group-rounded-bold'} width={24} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
              <Typography className="font-tr" sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                {squadChallenge.title || t('wallet.squadChallengeTitle')}
              </Typography>
              <CoinValue value={squadChallenge.bacAmount ?? 0} size={14} />
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Box component="span" sx={{ ...getUserChipSx('gold'), fontSize: 10, px: 0.75, py: 0.15, height: 'auto' }}>
                {teamLabel}
              </Box>
              <Typography sx={{ ...userMutedTextSx, fontSize: 11.5 }}>
                {t('wallet.squadChallengePeriod', { period: squadChallenge.periodKey || '—' })}
              </Typography>
            </Stack>

            <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.75, lineHeight: 1.5 }}>
              {squadChallenge.description || t('wallet.squadChallengeHint')}
            </Typography>

            {hasSquad ? (
              <Box sx={{ mt: 1.25, ...getGlassInnerSx(glassTokens, { p: 1.25 }) }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: USER_COLORS.textPrimary }} noWrap>
                      {squadChallenge.squad!.name}
                    </Typography>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 11.5, mt: 0.25 }}>
                      {t('wallet.squadChallengeInviteCode', { code: squadChallenge.squad!.inviteCode })}
                    </Typography>
                  </Box>
                  <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11 } }}>
                    {squadChallenge.squad!.members.map((member) => (
                      <Avatar key={member.userId} src={member.avatar || undefined} alt={member.username}>
                        {member.username?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Stack>
                <Typography sx={{ ...userMutedTextSx, fontSize: 11, mt: 0.75 }}>
                  {t('wallet.squadChallengeMembersHint', {
                    min: squadChallenge.minMembersInMatch ?? 2,
                    max: squadChallenge.maxTeamSize ?? 4,
                  })}
                </Typography>
                <UserActionButton
                  actionVariant="ghost"
                  disabled={squadBusy}
                  onClick={onLeave}
                  sx={{ mt: 1, minHeight: 32, px: 1.25, fontSize: 11.5 }}
                >
                  {squadBusy ? t('wallet.squadChallengeBusy') : t('wallet.squadChallengeLeave')}
                </UserActionButton>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ mt: 1.25 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={t('wallet.squadChallengeNamePlaceholder')}
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    disabled={squadBusy}
                    sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}
                  />
                  <UserActionButton
                    actionVariant="gold"
                    disabled={squadBusy || !squadName.trim()}
                    onClick={handleCreate}
                    sx={{ minHeight: 40, px: 1.5, fontSize: 12, whiteSpace: 'nowrap' }}
                  >
                    {squadBusy ? t('wallet.squadChallengeBusy') : t('wallet.squadChallengeCreate')}
                  </UserActionButton>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={t('wallet.squadChallengeCodePlaceholder')}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    disabled={squadBusy}
                    sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}
                  />
                  <UserActionButton
                    actionVariant="ghost"
                    disabled={squadBusy || !inviteCode.trim()}
                    onClick={handleJoin}
                    sx={{ minHeight: 40, px: 1.5, fontSize: 12, whiteSpace: 'nowrap' }}
                  >
                    {squadBusy ? t('wallet.squadChallengeBusy') : t('wallet.squadChallengeJoin')}
                  </UserActionButton>
                </Stack>
              </Stack>
            )}

            {hasSquad ? (
              <Stack spacing={0.75} sx={{ mt: 1.25 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                    {t('wallet.squadChallengeProgress', { current: winCount, target: targetWins })}
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
                      bgcolor: isClaimed || canClaim ? EARN_HUB_GOLD : alpha(EARN_HUB_GOLD, 0.65),
                    },
                  }}
                />
              </Stack>
            ) : null}

            {squadChallenge.viewerRank ? (
              <Typography sx={{ mt: 1, fontSize: 12, color: alpha(EARN_HUB_GOLD, 0.9), fontWeight: 700 }}>
                {t('wallet.squadChallengeYourRank', { rank: squadChallenge.viewerRank })}
              </Typography>
            ) : null}

            {hasSquad ? (
              <Box sx={{ mt: 1.25 }}>
                {canClaim ? (
                  <UserActionButton
                    actionVariant="gold"
                    disabled={claiming}
                    startIcon={claiming ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:gift-bold" />}
                    onClick={onClaim}
                    sx={{ minHeight: 36, px: 1.5, fontSize: 12 }}
                  >
                    {claiming ? t('wallet.earnClaiming') : t('wallet.squadChallengeClaim')}
                  </UserActionButton>
                ) : isClaimed ? (
                  <Typography sx={{ fontSize: 12, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
                    {t('wallet.squadChallengeClaimed')}
                  </Typography>
                ) : (
                  <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                    {t('wallet.squadChallengeInProgress')}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Box>
        </Stack>
      </UserGlassCard>

      {(squadChallenge.leaderboard?.length ?? 0) > 0 ? (
        <UserGlassCard sx={{ p: { xs: 1.5, md: 1.75 } }}>
          <Typography className="font-tr" sx={{ fontSize: 13.5, fontWeight: 800, color: USER_COLORS.textPrimary, mb: 1 }}>
            {t('wallet.squadChallengeLeaderboard')}
          </Typography>
          <Stack spacing={0.75}>
            {squadChallenge.leaderboard!.map((entry) => (
              <Box
                key={entry.squadId}
                sx={getGlassInnerSx(glassTokens, {
                  p: 1,
                  borderLeft: entry.isViewer ? `3px solid ${EARN_HUB_GOLD}` : undefined,
                  bgcolor: entry.isViewer ? alpha(EARN_HUB_GOLD, 0.05) : undefined,
                })}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ width: 24, fontWeight: 800, fontSize: 12, color: alpha(EARN_HUB_GOLD, 0.9) }}>
                    #{entry.rank}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: entry.isViewer ? 800 : 600, fontSize: 13, color: USER_COLORS.textPrimary }} noWrap>
                      {entry.name}
                    </Typography>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 10.5 }}>
                      {t('wallet.squadChallengeMemberCount', { count: entry.memberCount })}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: alpha(EARN_HUB_GOLD, 0.9), fontWeight: 700 }}>
                    {entry.winCount} {t('wallet.squadChallengeWinsShort')}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </UserGlassCard>
      ) : null}
    </Stack>
  );
}
