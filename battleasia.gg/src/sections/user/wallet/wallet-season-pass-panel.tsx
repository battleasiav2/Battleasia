import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography, CircularProgress } from '@mui/material';

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

export type SeasonPassTierRow = {
  level: number;
  xpRequired: number;
  freeReward?: { bacAmount: number; label: string; icon: string };
  plusReward?: { bacAmount: number; label: string; icon: string };
  freeStatus?: 'locked' | 'ready' | 'claimed' | 'plus_locked';
  plusStatus?: 'locked' | 'ready' | 'claimed' | 'plus_locked';
  canClaimFree?: boolean;
  canClaimPlus?: boolean;
};

export type SeasonPassState = {
  enabled: boolean;
  seasonKey?: string;
  title?: string;
  description?: string;
  icon?: string;
  active?: boolean;
  xp?: number;
  currentTier?: number;
  nextTierXp?: number;
  progressPct?: number;
  isPlus?: boolean;
  tiers?: SeasonPassTierRow[];
  claimableCount?: number;
  xpPerJoinMatch?: number;
  xpPerWin?: number;
  xpPerMissionClaim?: number;
};

type Props = {
  seasonPass: SeasonPassState | null;
  claimingKey: string | null;
  flashKey?: string | null;
  onClaim: (level: number, track: 'free' | 'plus') => void;
};

function TrackReward({
  track,
  tier,
  claimingKey,
  flashKey,
  onClaim,
}: {
  track: 'free' | 'plus';
  tier: SeasonPassTierRow;
  claimingKey: string | null;
  flashKey?: string | null;
  onClaim: (level: number, track: 'free' | 'plus') => void;
}) {
  const { t } = useTranslate();
  const reward = track === 'free' ? tier.freeReward : tier.plusReward;
  const status = track === 'free' ? tier.freeStatus : tier.plusStatus;
  const canClaim = track === 'free' ? tier.canClaimFree : tier.canClaimPlus;
  const claimKey = `${track}:${tier.level}`;
  const isClaiming = claimingKey === claimKey;
  const isPlusLocked = status === 'plus_locked';
  const isClaimed = status === 'claimed';

  return (
    <Box
      sx={getGlassInnerSx(getDefaultGlassTokens(), {
        p: 1,
        flex: 1,
        minWidth: 0,
        borderColor: canClaim ? alpha(EARN_HUB_GOLD, 0.45) : undefined,
        ...getEarnClaimFlashSx(flashKey === claimKey),
        ...getEarnReadyPulseSx(Boolean(canClaim) && flashKey !== claimKey),
      })}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
          <Iconify icon={reward?.icon || 'solar:gift-bold'} width={16} sx={{ color: EARN_HUB_GOLD, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: USER_COLORS.textPrimary }} noWrap>
            {reward?.label || (track === 'free' ? t('wallet.seasonPassFreeTrack') : t('wallet.seasonPassPlusTrack'))}
          </Typography>
        </Stack>
        <CoinValue value={reward?.bacAmount ?? 0} size={12} />
      </Stack>

      <Box sx={{ mt: 0.75 }}>
        {canClaim ? (
          <UserActionButton
            actionVariant={track === 'plus' ? 'gold' : 'ghost'}
            disabled={isClaiming}
            startIcon={isClaiming ? <CircularProgress size={12} color="inherit" /> : undefined}
            onClick={() => onClaim(tier.level, track)}
            sx={{ minHeight: 30, px: 1, fontSize: 11, width: '100%' }}
          >
            {isClaiming ? t('wallet.earnClaiming') : t('wallet.seasonPassClaim')}
          </UserActionButton>
        ) : isClaimed ? (
          <Typography sx={{ fontSize: 11, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
            {t('wallet.seasonPassClaimed')}
          </Typography>
        ) : isPlusLocked ? (
          <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
            {t('wallet.seasonPassPlusLocked')}
          </Typography>
        ) : (
          <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
            {t('wallet.seasonPassLocked')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function WalletSeasonPassPanel({ seasonPass, claimingKey, flashKey = null, onClaim }: Props) {
  const { t } = useTranslate();

  if (!seasonPass?.enabled) return null;

  const xp = seasonPass.xp ?? 0;
  const nextTierXp = seasonPass.nextTierXp ?? 0;
  const progressPct = seasonPass.progressPct ?? 0;

  return (
    <Stack spacing={1.25}>
      <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
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
            <Iconify icon={seasonPass.icon || 'solar:passport-bold'} width={24} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
              <Typography className="font-tr" sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                {seasonPass.title || t('wallet.seasonPassTitle')}
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Box component="span" sx={{ ...getUserChipSx('gold'), fontSize: 10, px: 0.75, py: 0.15, height: 'auto' }}>
                  {seasonPass.seasonKey || '—'}
                </Box>
                {seasonPass.isPlus ? (
                  <Box component="span" sx={{ ...getUserChipSx('success'), fontSize: 10, px: 0.75, py: 0.15, height: 'auto' }}>
                    {t('wallet.seasonPassPlusActive')}
                  </Box>
                ) : null}
              </Stack>
            </Stack>

            <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.75, lineHeight: 1.5 }}>
              {seasonPass.description || t('wallet.seasonPassHint')}
            </Typography>

            {!seasonPass.active ? (
              <Typography sx={{ mt: 1, fontSize: 12, color: alpha('#f59e0b', 0.95), fontWeight: 700 }}>
                {t('wallet.seasonPassInactive')}
              </Typography>
            ) : null}

            <Stack spacing={0.75} sx={{ mt: 1.25 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                  {t('wallet.seasonPassXpProgress', { xp, target: nextTierXp || xp })}
                </Typography>
                <Typography sx={{ fontSize: 11, color: alpha(EARN_HUB_GOLD, 0.9), fontWeight: 700 }}>
                  {progressPct}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 6,
                  borderRadius: 99,
                  bgcolor: alpha('#ffffff', 0.08),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 99,
                    bgcolor: alpha(EARN_HUB_GOLD, 0.85),
                  },
                }}
              />
            </Stack>

            <Typography sx={{ ...userMutedTextSx, fontSize: 11, mt: 1 }}>
              {t('wallet.seasonPassXpSources', {
                join: seasonPass.xpPerJoinMatch ?? 0,
                win: seasonPass.xpPerWin ?? 0,
                mission: seasonPass.xpPerMissionClaim ?? 0,
              })}
            </Typography>
          </Box>
        </Stack>
      </UserGlassCard>

      {(seasonPass.tiers?.length ?? 0) > 0 ? (
        <Stack spacing={1}>
          {seasonPass.tiers!.map((tier) => (
            <UserGlassCard key={tier.level} sx={{ p: { xs: 1.25, md: 1.5 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                  {t('wallet.seasonPassTierLabel', { level: tier.level })}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                  {t('wallet.seasonPassTierXp', { xp: tier.xpRequired })}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TrackReward
                  track="free"
                  tier={tier}
                  claimingKey={claimingKey}
                  flashKey={flashKey}
                  onClaim={onClaim}
                />
                <TrackReward
                  track="plus"
                  tier={tier}
                  claimingKey={claimingKey}
                  flashKey={flashKey}
                  onClaim={onClaim}
                />
              </Stack>
            </UserGlassCard>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
