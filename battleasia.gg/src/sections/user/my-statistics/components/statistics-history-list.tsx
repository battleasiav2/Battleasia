import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';
import CoinValue from 'src/components/coin-value';

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
  return (
    <Box>
      {items.map((stat, index) => {
        const isWin = stat.won > 0;
        const isLast = index === items.length - 1;

        return (
          <Box
            key={stat.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.25, sm: 1.75 },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
              borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
            }}
          >
            <Typography
              sx={{
                width: 28,
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 700,
                color: alpha('#ffffff', 0.4),
                textAlign: 'center',
              }}
            >
              {index + 1}
            </Typography>

            <Box sx={{ flex: 1, minWidth: 0 }}>
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
              <Typography sx={{ ...userMutedTextSx, fontSize: 11, mt: 0.25 }}>
                {stat.date ? fDateTime(stat.date, 'DD/MM/YYYY hh:mm a') : 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: alpha('#ffffff', 0.4) }}>
                {labels.paid}
              </Typography>
              <CoinValue value={stat.paid} size={14} textSx={{ fontWeight: 600 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25, minWidth: 64 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: alpha('#ffffff', 0.4) }}>
                {labels.won}
              </Typography>
              <CoinValue
                value={stat.won}
                size={14}
                textSx={{ fontWeight: 700, color: isWin ? USER_COLORS.success : USER_COLORS.textMuted }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
