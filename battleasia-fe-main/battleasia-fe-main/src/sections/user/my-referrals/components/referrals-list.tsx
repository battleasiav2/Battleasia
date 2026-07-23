import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import CoinValue from 'src/components/coin-value';
import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

import { formatReferralDate, type ReferralItem } from '../my-referrals-types';

// ----------------------------------------------------------------------

type ReferralsListProps = {
  referrals: ReferralItem[];
  labels: {
    date: string;
    playerName: string;
    earnings: string;
    status: string;
    active: string;
    inactive: string;
  };
};

export function ReferralsList({ referrals, labels }: ReferralsListProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '1.2fr 1.4fr 1fr 0.8fr',
          gap: 1,
          px: 2,
          py: 1,
        }}
      >
        {[labels.date, labels.playerName, labels.earnings, labels.status].map((label) => (
          <Typography
            key={label}
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: USER_COLORS.textMuted,
              textAlign: label === labels.earnings || label === labels.status ? 'right' : 'left',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {referrals.map((referral) => {
        const isActive = referral.status === 'active';
        const statusColor = isActive ? USER_COLORS.success : USER_COLORS.error;
        const statusLabel = isActive ? labels.active : labels.inactive;

        return (
          <Box
            key={referral.id}
            sx={getGlassInnerSx(tokens, {
              p: { xs: 1.5, md: 2 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr auto',
                md: '1.2fr 1.4fr 1fr 0.8fr',
              },
              gap: 1,
              alignItems: 'center',
              borderColor: isActive ? alpha(USER_COLORS.success, 0.18) : undefined,
            })}
          >
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ fontSize: 13, color: USER_COLORS.textSubtle }}>
                {formatReferralDate(referral.date)}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(USER_COLORS.gold, 0.1),
                  border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
                  color: USER_COLORS.gold,
                }}
              >
                <Iconify icon="solar:user-bold" width={18} />
              </Box>
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
                  {referral.playerName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, display: { xs: 'block', md: 'none' }, mt: 0.35 }}>
                  {formatReferralDate(referral.date)}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'flex-end' }, gridColumn: { xs: '1 / -1', md: 'auto' } }}>
              <CoinValue value={referral.earnings || 0} size={14} textSx={{ fontWeight: 700, color: USER_COLORS.gold }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: '4px',
                  bgcolor: alpha(statusColor, 0.15),
                  border: `1px solid ${alpha(statusColor, 0.35)}`,
                }}
              >
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: statusColor, textTransform: 'uppercase' }}>
                  {statusLabel}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
