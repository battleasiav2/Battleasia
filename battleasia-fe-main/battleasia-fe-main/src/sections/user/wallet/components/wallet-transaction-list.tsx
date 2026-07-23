import { alpha } from '@mui/material/styles';
import { Box, Chip, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';

import { CoinValue } from 'src/components/coin-value';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export type BalanceHistoryItem = {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'earning';
  balanceBefore: number;
  balanceAfter: number;
  performedBy: string;
  detail: Record<string, any>;
  createdAt: Date | string | null;
};

type WalletTransactionListProps = {
  transactions: BalanceHistoryItem[];
  loading: boolean;
  getTransactionTitle: (transaction: BalanceHistoryItem) => string;
  formatDate: (date: Date | string | null) => string;
  onRefresh?: () => void;
};

function getTransactionChipLabel(transaction: BalanceHistoryItem, t: (key: string) => string): string {
  if (transaction.type === 'withdraw') return t('wallet.withdraw');
  if (transaction.type === 'earning') return t('wallet.earnings');
  if (
    transaction.detail?.reason === 'match_result_update' ||
    transaction.detail?.reason === 'match_winnings' ||
    transaction.detail?.reason === 'match_reward'
  ) {
    return t('wallet.earnings');
  }
  if (transaction.detail?.reason === 'match_entry_fee') return t('wallet.joinMoney');
  return t('wallet.deposit');
}

export function WalletTransactionList({
  transactions,
  loading,
  getTransactionTitle,
  formatDate,
  onRefresh,
}: WalletTransactionListProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
      <Typography
        className="font-tr"
        sx={{
          fontSize: { xs: 16, md: 18 },
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          color: USER_COLORS.gold,
          mb: 2.5,
        }}
      >
        {t('wallet.walletHistory')}
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ ...userMutedTextSx, textAlign: 'center', py: 4 }}>
          {t('common.loading')}
        </Typography>
      ) : transactions.length === 0 ? (
        <UserEmptyState
          icon="solar:history-bold-duotone"
          title={t('wallet.noTransactionHistory')}
          description={t('wallet.noTransactionsDescription')}
          actionLabel={onRefresh ? t('common.refresh') : undefined}
          onAction={onRefresh}
          sx={{ py: 5, border: 'none', bgcolor: 'transparent' }}
        />
      ) : (
        <Stack spacing={1.25}>
          {transactions.map((transaction) => {
            const isDebit = transaction.type === 'withdraw';
            const chipLabel = getTransactionChipLabel(transaction, t);

            return (
              <Box
                key={transaction.id}
                sx={getGlassInnerSx(tokens, {
                  p: { xs: 1.5, md: 2 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                })}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 700, fontSize: 14, mb: 0.5 }}>
                    {getTransactionTitle(transaction)}
                  </Typography>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                    {formatDate(transaction.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Chip
                    label={chipLabel}
                    size="small"
                    sx={{
                      mb: 1,
                      height: 22,
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      bgcolor: isDebit ? alpha(USER_COLORS.error, 0.15) : alpha(USER_COLORS.success, 0.15),
                      color: isDebit ? USER_COLORS.error : USER_COLORS.success,
                      border: `1px solid ${isDebit ? alpha(USER_COLORS.error, 0.35) : alpha(USER_COLORS.success, 0.35)}`,
                    }}
                  />
                  <Typography
                    component="div"
                    sx={{
                      color: isDebit ? USER_COLORS.error : USER_COLORS.success,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      mb: 0.25,
                    }}
                  >
                    {isDebit ? '-' : '+'}
                    <CoinValue value={transaction.amount} size={16} />
                  </Typography>
                  <Typography component="div" sx={{ ...userMutedTextSx, display: 'flex', justifyContent: 'flex-end' }}>
                    <CoinValue value={transaction.balanceAfter} size={13} />
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </UserGlassCard>
  );
}
