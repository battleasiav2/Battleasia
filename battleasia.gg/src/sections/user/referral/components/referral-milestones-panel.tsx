import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography, CircularProgress } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, getEarnClaimFlashSx, getEarnReadyPulseSx } from '../../wallet/wallet-earn-hub-styles';

export type ReferralTierItem = {
  key: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  bacAmount: number;
  status: 'locked' | 'ready' | 'claimed';
  canClaim: boolean;
  progress?: number;
  current?: number;
};

export type ReferralMilestonesState = {
  enabled: boolean;
  referralCount?: number;
  tiers: ReferralTierItem[];
};

function ReferralTierCard({
  item,
  claiming,
  flash,
  onClaim,
}: {
  item: ReferralTierItem;
  claiming: boolean;
  flash: boolean;
  onClaim: (key: string) => void;
}) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();
  const isClaimed = item.status === 'claimed';
  const isReady = item.canClaim;
  const current = item.progress ?? item.current ?? 0;
  const target = item.threshold || 1;
  const percent = isClaimed ? 100 : Math.min((current / target) * 100, 100);

  return (
    <Box
      sx={{
        ...getGlassInnerSx(glassTokens, { p: { xs: 1.75, md: 2 } }),
        ...getEarnClaimFlashSx(flash),
        ...getEarnReadyPulseSx(isReady && !flash),
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
            bgcolor: alpha(isClaimed ? '#22c55e' : EARN_HUB_GOLD, 0.12),
            border: `1px solid ${alpha(isClaimed ? '#22c55e' : EARN_HUB_GOLD, 0.25)}`,
            color: isClaimed ? '#22c55e' : EARN_HUB_GOLD,
          }}
        >
          <Iconify icon={item.icon || 'solar:users-group-rounded-bold'} width={22} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 14, md: 15 }, color: USER_COLORS.textPrimary }}>
              {item.title}
            </Typography>
            <CoinValue value={item.bacAmount} size={14} />
          </Stack>

          <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.5, lineHeight: 1.5 }}>
            {item.description}
          </Typography>

          <Stack spacing={0.75} sx={{ mt: 1.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                {t('referral.milestoneProgress', { current, target })}
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
                  bgcolor: isClaimed || isReady ? EARN_HUB_GOLD : alpha(EARN_HUB_GOLD, 0.45),
                },
              }}
            />
          </Stack>

          <Box sx={{ mt: 1.25 }}>
            {isReady ? (
              <UserActionButton
                actionVariant="gold"
                disabled={claiming}
                startIcon={claiming ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:gift-bold" />}
                onClick={() => onClaim(item.key)}
                sx={{ minHeight: 36, px: 1.5, fontSize: 12 }}
              >
                {claiming ? t('wallet.earnClaiming') : t('referral.milestoneClaim')}
              </UserActionButton>
            ) : isClaimed ? (
              <Typography sx={{ fontSize: 12, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
                {t('referral.milestoneClaimed')}
              </Typography>
            ) : (
              <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                {t('referral.milestoneLocked')}
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

type Props = {
  referral: ReferralMilestonesState | null;
  claimingKey: string | null;
  flashKey?: string | null;
  onClaim: (key: string) => void;
};

export function ReferralMilestonesPanel({ referral, claimingKey, flashKey, onClaim }: Props) {
  const { t } = useTranslate();

  if (!referral?.enabled || !referral.tiers.length) return null;

  const pending = referral.tiers.filter((item) => item.canClaim).length;
  const completed = referral.tiers.filter((item) => item.status === 'claimed').length;

  return (
    <Stack spacing={1.25}>
      <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
        <Typography className="font-tr" sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
          {t('referral.milestonesTitle')}
        </Typography>
        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.5 }}>
          {t('referral.milestonesSubtitle', {
            completed,
            total: referral.tiers.length,
            count: referral.referralCount ?? 0,
          })}
        </Typography>
        {pending > 0 ? (
          <Typography sx={{ mt: 1, fontSize: 12, color: EARN_HUB_GOLD, fontWeight: 700 }}>
            {t('referral.milestonesReadyCount', { count: pending })}
          </Typography>
        ) : null}
      </UserGlassCard>

      {referral.tiers.map((item) => (
        <ReferralTierCard
          key={item.key}
          item={item}
          claiming={claimingKey === item.key}
          flash={flashKey === `referral:${item.key}`}
          onClaim={onClaim}
        />
      ))}
    </Stack>
  );
}
