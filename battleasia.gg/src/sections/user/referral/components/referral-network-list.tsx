import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import CoinValue from 'src/components/coin-value';
import { Iconify } from 'src/components/iconify';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

import { formatReferralDate, type ReferralNetworkItem } from '../referral-types';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type ReferralNetworkListProps = {
  items: ReferralNetworkItem[];
  labels: {
    joined: string;
    deposits: string;
    earnings: string;
    active: string;
    inactive: string;
  };
};

export function ReferralNetworkList({ items, labels }: ReferralNetworkListProps) {
  return (
    <>
      {items.map((item, index) => {
        const isActive = item.status === 'active';
        const isLast = index === items.length - 1;
        const statusLabel = isActive ? labels.active : labels.inactive;
        const statusColor = isActive ? USER_COLORS.success : USER_COLORS.error;
        const meta = [
          `${labels.joined} ${formatReferralDate(item.joinedAt)}`,
          `${labels.deposits} ${item.depositCount} (${item.totalDeposits} BAC)`,
        ].join(' · ');

        return (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.25, sm: 1.75 },
              width: 1,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
              borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: goldAlpha(0.06),
                '& .ref-title': { color: GOLD },
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                bgcolor: '#0a0a0a',
                border: `1px solid ${alpha('#ffffff', 0.1)}`,
                color: GOLD,
              }}
            >
              <Iconify icon="solar:user-bold" width={18} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography
                  className="ref-title font-tr"
                  sx={{
                    fontSize: { xs: 13, sm: 15 },
                    fontWeight: 800,
                    color: USER_COLORS.textPrimary,
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                    transition: 'color 0.2s ease',
                  }}
                  noWrap
                >
                  {item.playerName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: statusColor,
                  }}
                >
                  {statusLabel}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: 11, sm: 12 },
                  color: alpha('#ffffff', 0.5),
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {meta}
              </Typography>
            </Box>

            <Stack
              alignItems="flex-end"
              spacing={0.35}
              sx={{ flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}
            >
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  color: alpha('#ffffff', 0.4),
                  textTransform: 'uppercase',
                }}
              >
                {labels.earnings}
              </Typography>
              <CoinValue
                value={item.totalEarnings}
                size={14}
                textSx={{ fontWeight: 700, color: '#ffffff' }}
              />
            </Stack>
          </Box>
        );
      })}
    </>
  );
}
