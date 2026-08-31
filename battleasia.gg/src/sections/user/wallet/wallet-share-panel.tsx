import { Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { EARN_HUB_GOLD } from './wallet-earn-hub-styles';

export type ShareToEarnHubState = {
  enabled: boolean;
  bacAmount?: number;
  title?: string;
  description?: string;
  icon?: string;
  claimedCount?: number;
};

type Props = {
  shareToEarn: ShareToEarnHubState | null;
};

export function WalletSharePanel({ shareToEarn }: Props) {
  const { t } = useTranslate();
  const router = useRouter();

  if (!shareToEarn?.enabled) return null;

  const bacAmount = shareToEarn.bacAmount ?? 0;

  return (
    <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify
            icon={shareToEarn.icon || 'solar:share-bold'}
            width={20}
            sx={{ color: EARN_HUB_GOLD }}
          />
          <Typography
            className="font-tr"
            sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}
          >
            {shareToEarn.title || t('wallet.shareToEarnTitle')}
          </Typography>
        </Stack>

        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>
          {shareToEarn.description || t('wallet.shareToEarnHint')}
        </Typography>

        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          {bacAmount > 0 ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography sx={{ fontSize: 12, color: EARN_HUB_GOLD, fontWeight: 700 }}>
                {t('wallet.shareToEarnReward')}
              </Typography>
              <CoinValue value={bacAmount} size={14} />
            </Stack>
          ) : null}
          {(shareToEarn.claimedCount ?? 0) > 0 ? (
            <Typography sx={{ ...userMutedTextSx, fontSize: 11.5 }}>
              {t('wallet.shareToEarnClaimed', { count: shareToEarn.claimedCount })}
            </Typography>
          ) : null}
        </Stack>

        <UserActionButton
          onClick={() => router.push(paths.user.play)}
          sx={{ alignSelf: 'flex-start' }}
        >
          <Iconify icon="solar:gamepad-bold" width={16} />
          {t('wallet.shareToEarnCta')}
        </UserActionButton>
      </Stack>
    </UserGlassCard>
  );
}
