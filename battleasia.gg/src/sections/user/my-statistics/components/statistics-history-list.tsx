import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';
import CoinValue from 'src/components/coin-value';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, userMutedTextSx } from 'src/layouts/user';

import type { StatisticsItem } from '../my-statistics-types';

// ----------------------------------------------------------------------

type StatisticsHistoryListProps = {
  items: StatisticsItem[];
  labels: {
    matchInfo: string;
    paid: string;
    won: string;
  };
};

export function StatisticsHistoryList({ items, labels }: StatisticsHistoryListProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: '48px 1.6fr 1fr 1fr',
          gap: 1,
          px: 2,
          py: 1,
        }}
      >
        {['#', labels.matchInfo, labels.paid, labels.won].map((label) => (
          <Typography
            key={label}
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: USER_COLORS.textMuted,
              textAlign: label === labels.paid || label === labels.won ? 'right' : 'left',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {items.map((stat, index) => {
        const isWin = stat.won > 0;

        return (
          <Box
            key={stat.id}
            sx={getGlassInnerSx(tokens, {
              p: { xs: 1.5, sm: 2 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '36px 1fr auto',
                sm: '48px 1.6fr 1fr 1fr',
              },
              gap: 1,
              alignItems: 'center',
              borderColor: isWin ? alpha(USER_COLORS.success, 0.2) : undefined,
            })}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textMuted, textAlign: 'center' }}>
              {index + 1}
            </Typography>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                className="font-tr"
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: USER_COLORS.textPrimary,
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {stat.matchName}
              </Typography>
              <Typography sx={{ ...userMutedTextSx, fontSize: 11, mt: 0.35 }}>
                {stat.date ? fDateTime(stat.date, 'DD/MM/YYYY hh:mm a') : 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}>
              <CoinValue value={stat.paid} size={14} textSx={{ fontWeight: 600 }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <CoinValue
                value={stat.won}
                size={14}
                textSx={{ fontWeight: 700, color: isWin ? USER_COLORS.success : USER_COLORS.textMuted }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
