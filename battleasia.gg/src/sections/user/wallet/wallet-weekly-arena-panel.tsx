import { alpha } from '@mui/material/styles';
import { Avatar, Box, LinearProgress, Stack, Typography, CircularProgress } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
  goldAlpha,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, getEarnClaimFlashSx, getEarnReadyPulseSx } from './wallet-earn-hub-styles';

export type WeeklyLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  winCount: number;
  isViewer?: boolean;
};

export type WeeklyArenaState = {
  enabled: boolean;
  periodKey?: string;
  title?: string;
  description?: string;
  icon?: string;
  teamType?: string;
  targetWins?: number;
  bacAmount?: number;
  winCount?: number;
  progress?: number;
  status?: 'active' | 'completed' | 'claimed';
  canClaim?: boolean;
  leaderboard?: WeeklyLeaderboardEntry[];
  viewerRank?: number | null;
};

const TEAM_LABELS: Record<string, string> = {
  solo: 'Solo',
  duo: 'Duo',
  squad: 'Squad',
  any: 'Any mode',
};

type Props = {
  weeklyArena: WeeklyArenaState | null;
  claiming: boolean;
  flash?: boolean;
  onClaim: () => void;
};

export function WalletWeeklyArenaPanel({ weeklyArena, claiming, flash = false, onClaim }: Props) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  if (!weeklyArena?.enabled) return null;

  const targetWins = weeklyArena.targetWins ?? 1;
  const winCount = weeklyArena.winCount ?? 0;
  const percent = Math.min(((weeklyArena.progress ?? winCount) / targetWins) * 100, 100);
  const isClaimed = weeklyArena.status === 'claimed';
  const canClaim = Boolean(weeklyArena.canClaim);
  const teamLabel = TEAM_LABELS[String(weeklyArena.teamType || 'any')] || weeklyArena.teamType;

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
              bgcolor: goldAlpha( 0.12),
              border: `1px solid ${goldAlpha( 0.25)}`,
              color: EARN_HUB_GOLD,
            }}
          >
            <Iconify icon={weeklyArena.icon || 'solar:cup-star-bold'} width={24} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
              <Typography className="font-tr" sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                {weeklyArena.title || t('wallet.weeklyArenaTitle')}
              </Typography>
              <CoinValue value={weeklyArena.bacAmount ?? 0} size={14} />
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Box
                component="span"
                sx={{
                  ...getUserChipSx('gold'),
                  fontSize: 10,
                  px: 0.75,
                  py: 0.15,
                  height: 'auto',
                }}
              >
                {teamLabel}
              </Box>
              <Typography sx={{ ...userMutedTextSx, fontSize: 11.5 }}>
                {t('wallet.weeklyArenaPeriod', { period: weeklyArena.periodKey || '—' })}
              </Typography>
            </Stack>

            <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.75, lineHeight: 1.5 }}>
              {weeklyArena.description || t('wallet.weeklyArenaHint')}
            </Typography>

            <Stack spacing={0.75} sx={{ mt: 1.25 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                  {t('wallet.weeklyArenaProgress', { current: winCount, target: targetWins })}
                </Typography>
                <Typography sx={{ fontSize: 11, color: goldAlpha( 0.9), fontWeight: 700 }}>
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
                    bgcolor: isClaimed || canClaim ? EARN_HUB_GOLD : goldAlpha( 0.65),
                  },
                }}
              />
            </Stack>

            {weeklyArena.viewerRank ? (
              <Typography sx={{ mt: 1, fontSize: 12, color: goldAlpha( 0.9), fontWeight: 700 }}>
                {t('wallet.weeklyArenaYourRank', { rank: weeklyArena.viewerRank })}
              </Typography>
            ) : null}

            <Box sx={{ mt: 1.25 }}>
              {canClaim ? (
                <UserActionButton
                  actionVariant="gold"
                  disabled={claiming}
                  startIcon={claiming ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:gift-bold" />}
                  onClick={onClaim}
                  sx={{ minHeight: 36, px: 1.5, fontSize: 12 }}
                >
                  {claiming ? t('wallet.earnClaiming') : t('wallet.weeklyArenaClaim')}
                </UserActionButton>
              ) : isClaimed ? (
                <Typography sx={{ fontSize: 12, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
                  {t('wallet.weeklyArenaClaimed')}
                </Typography>
              ) : (
                <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                  {t('wallet.weeklyArenaInProgress')}
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>
      </UserGlassCard>

      {(weeklyArena.leaderboard?.length ?? 0) > 0 ? (
        <UserGlassCard sx={{ p: { xs: 1.5, md: 1.75 } }}>
          <Typography className="font-tr" sx={{ fontSize: 13.5, fontWeight: 800, color: USER_COLORS.textPrimary, mb: 1 }}>
            {t('wallet.weeklyArenaLeaderboard')}
          </Typography>
          <Stack spacing={0.75}>
            {weeklyArena.leaderboard!.map((entry) => (
              <Box
                key={entry.userId}
                sx={getGlassInnerSx(glassTokens, {
                  p: 1,
                  borderLeft: entry.isViewer ? `3px solid ${EARN_HUB_GOLD}` : undefined,
                  bgcolor: entry.isViewer ? goldAlpha( 0.05) : undefined,
                })}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ width: 24, fontWeight: 800, fontSize: 12, color: goldAlpha( 0.9) }}>
                    #{entry.rank}
                  </Typography>
                  <Avatar src={entry.avatar || undefined} sx={{ width: 28, height: 28, fontSize: 12 }}>
                    {entry.username?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Typography sx={{ flex: 1, minWidth: 0, fontWeight: entry.isViewer ? 800 : 600, fontSize: 13, color: USER_COLORS.textPrimary }} noWrap>
                    {entry.username}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: goldAlpha( 0.9), fontWeight: 700 }}>
                    {entry.winCount} {t('wallet.weeklyArenaWinsShort')}
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
