import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';

import CoinValue from 'src/components/coin-value';
import { getGoldTopLineCardSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

type MatchEntryWinTileProps = {
  entryFee: number;
  winningAmount: number;
};

const labelSx = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 0.7,
  color: USER_COLORS.textMuted,
  textTransform: 'uppercase' as const,
  mb: 0.5,
};

export function MatchEntryWinTile({ entryFee, winningAmount }: MatchEntryWinTileProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={getGoldTopLineCardSx({
        p: 1.25,
        minHeight: 88,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      })}
    >
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography sx={labelSx}>{t('match.entryFee')}</Typography>
          <CoinValue value={entryFee} size={18} />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={labelSx}>{t('match.prizePool')}</Typography>
          <CoinValue value={winningAmount} size={18} />
        </Box>
      </Stack>
    </Box>
  );
}
