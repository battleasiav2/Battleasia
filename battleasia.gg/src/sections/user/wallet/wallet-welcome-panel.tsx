import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography, CircularProgress } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  goldAlpha,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD, getEarnClaimFlashSx, getEarnReadyPulseSx } from './wallet-earn-hub-styles';

export type WelcomeMilestoneItem = {
  key: string;
  title: string;
  description: string;
  icon: string;
  bacAmount: number;
  status: 'locked' | 'ready' | 'claimed';
  canClaim: boolean;
};

export type WelcomeBonusesState = {
  enabled: boolean;
  milestones: WelcomeMilestoneItem[];
};

function WelcomeMilestoneCard({
  item,
  claiming,
  flash,
  onClaim,
}: {
  item: WelcomeMilestoneItem;
  claiming: boolean;
  flash: boolean;
  onClaim: (key: string) => void;
}) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();
  const isClaimed = item.status === 'claimed';
  const isReady = item.canClaim;
  const progress = isClaimed ? 100 : isReady ? 100 : item.status === 'locked' ? 8 : 50;

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
            bgcolor: isClaimed ? alpha('#22c55e', 0.12) : goldAlpha(0.12),
            border: `1px solid ${isClaimed ? alpha('#22c55e', 0.25) : goldAlpha(0.25)}`,
            color: isClaimed ? '#22c55e' : EARN_HUB_GOLD,
          }}
        >
          <Iconify icon={item.icon || 'solar:gift-bold'} width={22} />
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

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1.25,
              height: 6,
              borderRadius: 99,
              bgcolor: alpha('#ffffff', 0.08),
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                  bgcolor: isClaimed || isReady ? EARN_HUB_GOLD : goldAlpha( 0.45),
              },
            }}
          />

          <Box sx={{ mt: 1.25 }}>
            {isReady ? (
              <UserActionButton
                actionVariant="gold"
                disabled={claiming}
                startIcon={claiming ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:gift-bold" />}
                onClick={() => onClaim(item.key)}
                sx={{ minHeight: 36, px: 1.5, fontSize: 12 }}
              >
                {claiming ? t('wallet.earnClaiming') : t('wallet.welcomeClaim')}
              </UserActionButton>
            ) : isClaimed ? (
              <Typography sx={{ fontSize: 12, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
                {t('wallet.welcomeClaimed')}
              </Typography>
            ) : (
              <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                {t('wallet.welcomeLocked')}
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

type Props = {
  welcome: WelcomeBonusesState | null;
  claimingKey: string | null;
  flashKey?: string | null;
  onClaim: (key: string) => void;
};

export function WalletWelcomePanel({ welcome, claimingKey, flashKey, onClaim }: Props) {
  const { t } = useTranslate();

  if (!welcome?.enabled || !welcome.milestones.length) return null;

  const pending = welcome.milestones.filter((item) => item.canClaim).length;
  const completed = welcome.milestones.filter((item) => item.status === 'claimed').length;

  return (
    <Stack spacing={1.25}>
      <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
        <Typography className="font-tr" sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
          {t('wallet.welcomeTitle')}
        </Typography>
        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.5 }}>
          {t('wallet.welcomeSubtitle', { completed, total: welcome.milestones.length })}
        </Typography>
        {pending > 0 ? (
          <Typography sx={{ mt: 1, fontSize: 12, color: EARN_HUB_GOLD, fontWeight: 700 }}>
            {t('wallet.welcomeReadyCount', { count: pending })}
          </Typography>
        ) : null}
      </UserGlassCard>

      {welcome.milestones.map((item) => (
        <WelcomeMilestoneCard
          key={item.key}
          item={item}
          claiming={claimingKey === item.key}
          flash={flashKey === `welcome:${item.key}`}
          onClaim={onClaim}
        />
      ))}
    </Stack>
  );
}
