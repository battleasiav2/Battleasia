import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import CoinValue from 'src/components/coin-value';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

import {
  formatReferralDate,
  getDepositSourceLabel,
  type ReferralCommissionItem,
} from '../referral-types';

// ----------------------------------------------------------------------

type ReferralCommissionListProps = {
  items: ReferralCommissionItem[];
  labels: {
    date: string;
    playerName: string;
    deposit: string;
    rate: string;
    commission: string;
    source: string;
  };
};

export function ReferralCommissionList({ items, labels }: ReferralCommissionListProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: { xs: 'none', lg: 'grid' },
          gridTemplateColumns: '1fr 1.1fr 0.8fr 0.6fr 0.8fr 0.7fr',
          gap: 1,
          px: 2,
          py: 1,
        }}
      >
        {[labels.date, labels.playerName, labels.deposit, labels.rate, labels.commission, labels.source].map((label) => (
          <Typography
            key={label}
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: USER_COLORS.textMuted,
              textAlign:
                label === labels.rate || label === labels.commission || label === labels.source ? 'right' : 'left',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {items.map((item) => (
        <Box
          key={item.id}
          sx={getGlassInnerSx(tokens, {
            p: { xs: 1.5, md: 2 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr auto',
              lg: '1fr 1.1fr 0.8fr 0.6fr 0.8fr 0.7fr',
            },
            gap: 1,
            alignItems: 'center',
          })}
        >
          <Typography sx={{ fontSize: 13, color: USER_COLORS.textSubtle, display: { xs: 'none', lg: 'block' } }}>
            {formatReferralDate(item.createdAt)}
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
              {item.playerName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, display: { xs: 'block', lg: 'none' } }}>
              {formatReferralDate(item.createdAt)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: { lg: 'flex-start' }, gridColumn: { xs: '1 / -1', lg: 'auto' } }}>
            <CoinValue value={item.depositAmount} size={14} textSx={{ fontWeight: 600, color: USER_COLORS.textPrimary }} />
          </Box>

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.gold, textAlign: 'right' }}>
            {item.commissionRate}%
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CoinValue value={item.commissionAmount} size={14} textSx={{ fontWeight: 700, color: USER_COLORS.gold }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: '4px',
                bgcolor: goldAlpha(0.12),
                border: `1px solid ${goldAlpha(0.28)}`,
              }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: USER_COLORS.gold, textTransform: 'uppercase' }}>
                {getDepositSourceLabel(item.depositSource)}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
