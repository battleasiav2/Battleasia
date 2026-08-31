import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  getUserChipSx,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

import { EARN_HUB_GOLD } from './wallet-earn-hub-styles';

export type DepositBonusDaysState = {
  enabled: boolean;
  active?: boolean;
  percent?: number;
  title?: string;
  description?: string;
  icon?: string;
  minDeposit?: number;
  startAt?: string | null;
  endAt?: string | null;
};

type Props = {
  depositBonusDays: DepositBonusDaysState | null;
};

export function WalletDepositBonusPanel({ depositBonusDays }: Props) {
  const { t } = useTranslate();
  const router = useRouter();

  if (!depositBonusDays?.enabled || !depositBonusDays.active) return null;

  const percent = depositBonusDays.percent ?? 0;

  return (
    <UserGlassCard sx={{ p: { xs: 1.75, md: 2.25 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Iconify
            icon={depositBonusDays.icon || 'solar:wad-of-money-bold'}
            width={20}
            sx={{ color: EARN_HUB_GOLD }}
          />
          <Typography
            className="font-tr"
            sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 800, color: USER_COLORS.textPrimary }}
          >
            {depositBonusDays.title || t('wallet.depositBonusTitle')}
          </Typography>
          {percent > 0 ? (
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
              +{percent}%
            </Box>
          ) : null}
        </Stack>

        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5 }}>
          {depositBonusDays.description || t('wallet.depositBonusHint')}
        </Typography>

        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          {(depositBonusDays.minDeposit ?? 0) > 0 ? (
            <Typography sx={{ ...userMutedTextSx, fontSize: 11.5 }}>
              {t('wallet.depositBonusMin', { amount: depositBonusDays.minDeposit })}
            </Typography>
          ) : null}
          {depositBonusDays.endAt ? (
            <Typography sx={{ ...userMutedTextSx, fontSize: 11.5 }}>
              {t('wallet.depositBonusEnds', {
                date: new Date(depositBonusDays.endAt).toLocaleString(),
              })}
            </Typography>
          ) : null}
        </Stack>

        <UserActionButton
          onClick={() => router.push(paths.user.shopWallet)}
          sx={{ alignSelf: 'flex-start' }}
        >
          <Iconify icon="solar:wallet-bold" width={16} />
          {t('wallet.depositBonusCta')}
        </UserActionButton>
      </Stack>
    </UserGlassCard>
  );
}
