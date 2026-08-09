import { Box, Typography } from '@mui/material';

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
  lineHeight: 1.2,
  mb: 0.75,
};

function StatCell({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: number;
  align?: 'left' | 'right';
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <Typography sx={{ ...labelSx, textAlign: align }}>{label}</Typography>
      <CoinValue
        value={value}
        size={15}
        spacing={0.45}
        sx={{
          flexWrap: 'nowrap',
          maxWidth: 1,
          minWidth: 0,
        }}
        textSx={{
          fontSize: 14,
          fontWeight: 700,
          color: USER_COLORS.textPrimary,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      />
    </Box>
  );
}

export function MatchEntryWinTile({ entryFee, winningAmount }: MatchEntryWinTileProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={getGoldTopLineCardSx({
        p: { xs: 1.25, sm: 1.5 },
        minHeight: 88,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      })}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: { xs: 1.25, sm: 1.75 },
          alignItems: 'center',
          width: 1,
        }}
      >
        <StatCell label={t('match.entryFee')} value={entryFee} />
        <StatCell label={t('match.prizePool')} value={winningAmount} align="right" />
      </Box>
    </Box>
  );
}
