import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { UserGlassCard, USER_COLORS, userMutedTextSx, goldAlpha } from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';

import { EARN_HUB_GOLD } from './wallet-earn-hub-styles';

type Props = {
  claimableCount: number;
  streakDays: number;
  missionsCompleted: number;
  missionsTotal: number;
};

function SummaryTile({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  const glassTokens = getDefaultGlassTokens();

  return (
    <Box
      sx={getGlassInnerSx(glassTokens, {
        p: { xs: 1.25, md: 1.5 },
        minHeight: 88,
        border: highlight ? `1px solid ${goldAlpha( 0.45)}` : undefined,
        bgcolor: highlight ? goldAlpha( 0.06) : undefined,
      })}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Iconify icon={icon} width={16} sx={{ color: highlight ? EARN_HUB_GOLD : alpha('#ffffff', 0.55) }} />
          <Typography sx={{ ...userMutedTextSx, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 900, color: USER_COLORS.textPrimary, lineHeight: 1.1 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

export function WalletEarnSummary({ claimableCount, streakDays, missionsCompleted, missionsTotal }: Props) {
  const { t } = useTranslate();

  return (
    <UserGlassCard sx={{ p: { xs: 1.5, md: 2 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1, md: 1.25 },
        }}
      >
        <SummaryTile
          icon="solar:gift-bold"
          label={t('wallet.earnHubReady')}
          value={claimableCount}
          highlight={claimableCount > 0}
        />
        <SummaryTile
          icon="solar:fire-bold"
          label={t('wallet.earnHubStreak')}
          value={streakDays}
        />
        <SummaryTile
          icon="solar:target-bold"
          label={t('wallet.earnHubMissions')}
          value={`${missionsCompleted}/${missionsTotal || 0}`}
        />
      </Box>
    </UserGlassCard>
  );
}
