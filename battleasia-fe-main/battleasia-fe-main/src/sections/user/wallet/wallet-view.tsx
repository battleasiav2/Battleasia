import { useMemo, useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  Grid2 as Grid,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useLiveSync, LIVE_SYNC_TOPICS } from 'src/hooks/use-live-sync';
import { useTranslate } from 'src/locales/use-locales';

import { useSelector } from 'src/store';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserActionButton,
  UserStatTile,
  USER_COLORS,
  userMutedTextSx,
  userGlassDialogPaperSx,
} from 'src/layouts/user';

import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { UserAnimatedStat } from 'src/layouts/user';

import {
  WalletHero,
  WalletPageSkeleton,
  WalletTransactionList,
  type BalanceHistoryItem,
} from './components';

import { toast } from 'react-hot-toast';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

// Currency rates (BAC to local currency)
const CURRENCY_RATES: Record<string, number> = {
  BDT: 5.5,
  INR: 4.2,
  PKR: 14.0,
  USD: 0.05,
};

// Payment channels
const PAYMENT_CHANNELS = [
  { value: 'BKash', label: 'BKash', currency: 'BDT' },
  { value: 'Nagad', label: 'Nagad', currency: 'BDT' },
  { value: 'Rocket', label: 'Rocket', currency: 'BDT' },
  { value: 'UPI', label: 'UPI', currency: 'INR' },
  { value: 'JazzCash', label: 'JazzCash', currency: 'PKR' },
  { value: 'EasyPaisa', label: 'EasyPaisa', currency: 'PKR' },
  { value: 'Bank Transfer', label: 'Bank Transfer', currency: 'USD' },
];

const walletFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: alpha('#000000', 0.5),
    color: USER_COLORS.textPrimary,
    '& fieldset': { borderColor: alpha('#ffffff', 0.22) },
    '&:hover fieldset': { borderColor: alpha('#ffffff', 0.38) },
    '&.Mui-focused fieldset': { borderColor: USER_COLORS.gold },
  },
  '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
  '& .MuiInputLabel-root.Mui-focused': { color: USER_COLORS.gold },
};

// ----------------------------------------------------------------------

export function WalletView() {
  const { user } = useSelector((state) => state.auth);
  const { getBalanceHistoryApi, getCoingoPayoutStatusApi, submitWithdrawalApi, getWithdrawableAmountApi } = useApi();
  const { t } = useTranslate();
  const [transactions, setTransactions] = useState<BalanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalStep, setWithdrawalStep] = useState<'form' | 'confirm'>('form');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalChannel, setWithdrawalChannel] = useState<string>('BKash');
  const [withdrawalWalletAddress, setWithdrawalWalletAddress] = useState<string>('');
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastPayoutRef, setLastPayoutRef] = useState<string | null>(null);

  // Withdrawable amount state
  const [withdrawableAmount, setWithdrawableAmount] = useState<number>(0);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState<boolean>(false);
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState<number>(0);

  // Fetch withdrawable amount
  useEffect(() => {
    const fetchWithdrawable = async () => {
      try {
        const response = await getWithdrawableAmountApi();
        if (response?.data?.status) {
          setWithdrawableAmount(response.data.data.withdrawableAmount || 0);
          setHasPendingWithdrawal(response.data.data.hasPendingWithdrawal || false);
          setPendingWithdrawalAmount(response.data.data.pendingWithdrawalAmount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch withdrawable amount:', error);
      }
    };
    if (user?._id) fetchWithdrawable();
  }, [getWithdrawableAmountApi, user?._id, user?.balance]);

  useEffect(() => {
    const fetchBalanceHistory = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBalanceHistoryApi({ page: 1, limit: 100 });
        const responseData = response?.data;

        if (responseData?.status && Array.isArray(responseData?.data?.results)) {
          setTransactions(
            responseData.data.results.map((item: any) => ({
              id: item.id || item._id,
              amount: Number(item.amount) || 0,
              type: item.type === 'withdraw' ? 'withdraw' : item.type === 'earning' ? 'earning' : 'deposit',
              balanceBefore: Number(item.balanceBefore) || 0,
              balanceAfter: Number(item.balanceAfter) || 0,
              performedBy: item.performedBy || '',
              detail: item.detail || {},
              createdAt: item.createdAt ? new Date(item.createdAt) : null,
            }))
          );
        }
      } catch (error: any) {
        console.error('Failed to fetch balance history:', error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          t('wallet.failedToLoadHistory');
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceHistory();
  }, [getBalanceHistoryApi, user?._id, t]);

  const refreshBalanceHistory = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await getBalanceHistoryApi({ page: 1, limit: 100 });
      const responseData = response?.data;

      if (responseData?.status && Array.isArray(responseData?.data?.results)) {
        setTransactions(
          responseData.data.results.map((item: any) => ({
            id: item.id || item._id,
            amount: Number(item.amount) || 0,
            type: item.type === 'withdraw' ? 'withdraw' : item.type === 'earning' ? 'earning' : 'deposit',
            balanceBefore: Number(item.balanceBefore) || 0,
            balanceAfter: Number(item.balanceAfter) || 0,
            performedBy: item.performedBy || '',
            detail: item.detail || {},
            createdAt: item.createdAt ? new Date(item.createdAt) : null,
          }))
        );
      }
    } catch (error: any) {
      console.error('Failed to fetch balance history:', error);
      toast.error(error?.response?.data?.message || t('wallet.failedToLoadHistory'));
    } finally {
      setLoading(false);
    }
  }, [getBalanceHistoryApi, user?._id, t]);

  useLiveSync(refreshBalanceHistory, LIVE_SYNC_TOPICS.wallet);

  const walletData = useMemo(() => {
    const deposits = transactions.filter((tx) => tx.type === 'deposit' || tx.type === 'earning');
    const withdraws = transactions.filter((tx) => tx.type === 'withdraw');

    const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithdraws = withdraws.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate win money (earnings from match rewards)
    const winMoney = transactions
      .filter((tx) =>
        tx.type === 'earning' ||
        tx.detail?.reason === 'match_result_update' ||
        tx.detail?.reason === 'match_winnings' ||
        tx.detail?.reason === 'match_reward'
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate join money (withdraws for match entry fees)
    const joinMoney = withdraws
      .filter((tx) => tx.detail?.reason === 'match_entry_fee' || tx.detail?.matchId)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalBalance: user?.balance || 0,
      winMoney,
      joinMoney,
      totalPayout: totalWithdraws,
      totalPayoutCommission: 0,
      earnings: totalDeposits,
      payouts: totalWithdraws,
    };
  }, [transactions, user?.balance]);

  // Get selected channel details
  const selectedChannel = useMemo(
    () => PAYMENT_CHANNELS.find((ch) => ch.value === withdrawalChannel) || PAYMENT_CHANNELS[0],
    [withdrawalChannel]
  );

  // Calculate currency amount based on withdrawal amount and exchange rate
  const withdrawalCurrencyAmount = useMemo(() => {
    const amount = parseFloat(withdrawalAmount) || 0;
    const rate = CURRENCY_RATES[selectedChannel.currency] || 1;
    return amount * rate;
  }, [withdrawalAmount, selectedChannel.currency]);

  // Handle withdrawal dialog open
  const handleOpenWithdrawalDialog = useCallback(() => {
    setWithdrawalDialogOpen(true);
    setWithdrawalStep('form');
    setWithdrawalAmount('');
    setWithdrawalChannel('BKash');
    setWithdrawalWalletAddress('');
  }, []);

  // Handle withdrawal dialog close
  const handleCloseWithdrawalDialog = useCallback(() => {
    setWithdrawalDialogOpen(false);
    setWithdrawalStep('form');
    setWithdrawalAmount('');
    setWithdrawalChannel('BKash');
    setWithdrawalWalletAddress('');
  }, []);

  // Handle withdrawal form continue
  const handleWithdrawalContinue = useCallback(() => {
    const amount = parseFloat(withdrawalAmount) || 0;

    if (amount <= 0) {
      toast.error(t('wallet.enterValidAmount'));
      return;
    }

    if (amount > withdrawableAmount) {
      toast.error(t('wallet.exceedsWithdrawable', { amount: withdrawableAmount.toFixed(2) }));
      return;
    }

    if (!withdrawalWalletAddress.trim()) {
      toast.error(t('wallet.enterWalletAddress'));
      return;
    }

    setWithdrawalStep('confirm');
  }, [withdrawalAmount, withdrawalWalletAddress, withdrawableAmount, t]);

  // Handle withdrawal submission
  const handleWithdrawalSubmit = useCallback(async () => {
    if (!user?.email || !user?.username) {
      toast.error(t('wallet.userInfoRequired'));
      return;
    }

    const amount = parseFloat(withdrawalAmount) || 0;
    if (amount <= 0 || amount > withdrawableAmount) {
      toast.error(t('wallet.invalidAmount'));
      return;
    }

    try {
      setWithdrawalSubmitting(true);

      await submitWithdrawalApi({
        user_email: user.email,
        username: user.username,
        coin_amount: amount,
        wallet_type: withdrawalChannel,
        wallet_address: withdrawalWalletAddress.trim(),
        currency_type: selectedChannel.currency,
        currency_amount: withdrawalCurrencyAmount,
        description: `Withdrawal request via ${withdrawalChannel}`,
      });

      toast.success(t('wallet.withdrawalRequestSuccess'));
      handleCloseWithdrawalDialog();
    } catch (error: any) {
      console.error('Withdrawal submission failed:', error);
      toast.error(error?.response?.data?.message || t('wallet.withdrawalRequestFailed'));
    } finally {
      setWithdrawalSubmitting(false);
    }
  }, [
    user,
    withdrawalAmount,
    withdrawalChannel,
    withdrawalWalletAddress,
    selectedChannel.currency,
    withdrawalCurrencyAmount,
    submitWithdrawalApi,
    handleCloseWithdrawalDialog,
    t,
    withdrawableAmount,
  ]);

  const showInitialSkeleton = loading && transactions.length === 0;
  const glassTokens = getDefaultGlassTokens();

  const getTransactionTitle = (transaction: BalanceHistoryItem): string => {
    const detail = transaction.detail || {};
    const reason = detail.reason;
    const matchName = detail.matchName;

    if (reason === 'match_entry_fee') {
      return matchName ? `Match Joined - ${matchName}` : 'Match Entry Fee';
    }
    if (reason === 'match_result_update') {
      return matchName ? `Match Earning - ${matchName}` : 'Match Earning';
    }
    if (reason === 'match_winnings') {
      return matchName ? `Match Winning - ${matchName}` : 'Match Winning';
    }
    if (reason === 'match_reward') {
      return matchName ? `Match Reward - ${matchName}` : 'Match Reward';
    }
    if (reason === 'match_cancelled_refund') {
      return matchName ? `Match Refund - ${matchName}` : 'Match Refund';
    }
    if (reason === 'withdrawal_approved') {
      return t('wallet.withdraw');
    }
    if (reason === 'withdrawal_rejected_refund') {
      return t('wallet.withdrawalRefund');
    }
    if (reason === 'referral_bonus') {
      return t('wallet.referralBonus');
    }
    if (detail.note) {
      return detail.note;
    }
    if (transaction.type === 'earning') return t('wallet.earnings');
    return transaction.type === 'deposit' ? t('wallet.deposit') : t('wallet.withdraw');
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderWithdrawalDialog = () => (
    <Dialog
      open={withdrawalDialogOpen}
      onClose={handleCloseWithdrawalDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { ...(userGlassDialogPaperSx as object), borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1, color: USER_COLORS.textPrimary }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:card-send-bold" width={24} sx={{ color: USER_COLORS.gold }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: USER_COLORS.textPrimary }}>
            {withdrawalStep === 'form' ? t('wallet.requestWithdrawal') : t('wallet.confirmWithdrawal')}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: USER_COLORS.border }}>
        {hasPendingWithdrawal && (
          <UserGlassCard sx={{ p: 2, mb: 3, bgcolor: alpha(USER_COLORS.gold, 0.1), border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:alarm-bold" width={24} sx={{ color: USER_COLORS.gold }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: USER_COLORS.gold, fontWeight: 700 }}>
                  {t('wallet.pendingWithdrawalTitle')}
                </Typography>
                <Typography variant="body2" sx={userMutedTextSx}>
                  {t('wallet.pendingWithdrawalDescription', { amount: pendingWithdrawalAmount.toFixed(2) })}
                </Typography>
              </Box>
            </Stack>
          </UserGlassCard>
        )}

        <UserGlassCard sx={{ p: 2, mb: 3, bgcolor: alpha('#000000', 0.35) }}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" sx={userMutedTextSx} display="block">
                {t('wallet.availableBalance')}
              </Typography>
              <Typography variant="h5" component="div" sx={{ color: USER_COLORS.gold, fontWeight: 800 }}>
                <CoinValue value={user?.balance} size={24} />
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={userMutedTextSx} display="block">
                {t('wallet.withdrawableAmount')}
              </Typography>
              <Typography variant="h6" component="div" sx={{ color: hasPendingWithdrawal ? USER_COLORS.textMuted : USER_COLORS.gold, fontWeight: 700 }}>
                {hasPendingWithdrawal ? '0.00' : withdrawableAmount.toFixed(2)} BAC
              </Typography>
            </Box>
          </Stack>
        </UserGlassCard>

        {withdrawalStep === 'form' ? (
          <Stack spacing={3}>
            {/* Withdrawal Amount */}
            <TextField
              label={t('wallet.withdrawAmount')}
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              fullWidth
              error={!!withdrawalAmount && parseFloat(withdrawalAmount) > withdrawableAmount}
              InputProps={{
                endAdornment: <Typography sx={userMutedTextSx}>BAC</Typography>,
              }}
              helperText={
                withdrawalAmount && parseFloat(withdrawalAmount) > withdrawableAmount
                  ? t('wallet.exceedsWithdrawable', { amount: withdrawableAmount.toFixed(2) })
                  : withdrawalAmount && parseFloat(withdrawalAmount) > 0
                    ? `${t('wallet.youWillReceive')}: ${withdrawalCurrencyAmount.toFixed(2)} ${selectedChannel.currency}`
                    : t('wallet.maximumWithdrawable', { amount: withdrawableAmount.toFixed(2) })
              }
              sx={walletFieldSx}
            />

            {/* Payment Channel */}
            <TextField
              select
              label={t('wallet.paymentChannel')}
              value={withdrawalChannel}
              onChange={(e) => setWithdrawalChannel(e.target.value)}
              fullWidth
              sx={walletFieldSx}
            >
              {PAYMENT_CHANNELS.map((channel) => (
                <MenuItem key={channel.value} value={channel.value}>
                  {channel.label} ({channel.currency})
                </MenuItem>
              ))}
            </TextField>

            {/* Wallet Address */}
            <TextField
              label={t('wallet.walletAddress')}
              value={withdrawalWalletAddress}
              onChange={(e) => setWithdrawalWalletAddress(e.target.value)}
              fullWidth
              placeholder={t('wallet.enterWalletAddressPlaceholder')}
              helperText={t('wallet.walletAddressHelper')}
              sx={walletFieldSx}
            />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {/* Confirmation Details */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Iconify icon="solar:money-bag-bold" width={20} sx={{ color: USER_COLORS.gold }} />
                <Typography variant="body2" sx={userMutedTextSx}>
                  {t('wallet.withdrawAmount')}
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={700} sx={{ color: USER_COLORS.textPrimary }}>
                {withdrawalAmount} BAC
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Iconify icon="solar:dollar-minimalistic-bold" width={20} sx={{ color: 'success.main' }} />
                <Typography variant="body2" sx={userMutedTextSx}>
                  {t('wallet.youWillReceive')}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  component="span"
                  sx={{
                    width: 24,
                    height: 16,
                    borderRadius: 0.5,
                    bgcolor: selectedChannel.currency === 'BDT' ? '#006747' :
                             selectedChannel.currency === 'INR' ? '#FF9933' :
                             selectedChannel.currency === 'PKR' ? '#006600' : '#1d4ed8',
                  }}
                />
                <Typography variant="h5" fontWeight={700} sx={{ color: USER_COLORS.success }}>
                  {withdrawalCurrencyAmount.toFixed(2)} {selectedChannel.currency}
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={userMutedTextSx}>
                  {t('wallet.paymentChannel')}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: USER_COLORS.textPrimary }}>
                  {selectedChannel.label}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={userMutedTextSx}>
                  {t('wallet.walletAddress')}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: USER_COLORS.textPrimary }}>
                  {withdrawalWalletAddress}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={userMutedTextSx}>
                  {t('wallet.exchangeRate')}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: USER_COLORS.textPrimary }}>
                  1 BAC = {CURRENCY_RATES[selectedChannel.currency]?.toFixed(2)} {selectedChannel.currency}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${USER_COLORS.border}` }}>
        {withdrawalStep === 'form' ? (
          <>
            <UserActionButton actionVariant="ghost" onClick={handleCloseWithdrawalDialog}>
              {t('common.cancel')}
            </UserActionButton>
            <UserActionButton
              actionVariant="gold"
              onClick={handleWithdrawalContinue}
              disabled={!withdrawalAmount || !withdrawalWalletAddress || hasPendingWithdrawal}
            >
              {t('common.continue')}
            </UserActionButton>
          </>
        ) : (
          <>
            <UserActionButton actionVariant="ghost" onClick={() => setWithdrawalStep('form')}>
              {t('common.back')}
            </UserActionButton>
            <UserActionButton
              actionVariant="gold"
              onClick={handleWithdrawalSubmit}
              disabled={withdrawalSubmitting}
              startIcon={withdrawalSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {withdrawalSubmitting ? t('common.submitting') : t('wallet.confirmAndSubmit')}
            </UserActionButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <UserPageShell>
      <WalletHero title={t('wallet.title')} />

      <UserPageTitle
        badge={t('wallet.badgeSecureVault')}
        title={t('wallet.title')}
        subtitle={t('wallet.subtitle')}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ display: { xs: 'none', md: 'flex' } }}>
            <UserActionButton
              actionVariant="gold"
              startIcon={<Iconify icon="solar:card-send-bold" />}
              onClick={handleOpenWithdrawalDialog}
            >
              {t('wallet.requestWithdrawal')}
            </UserActionButton>
            {lastPayoutRef ? (
              <UserActionButton
                actionVariant="ghost"
                disabled={payoutSubmitting}
                onClick={async () => {
                  try {
                    const res = await getCoingoPayoutStatusApi(lastPayoutRef);
                    const status = res?.data?.data?.status;
                    toast.success(`${t('wallet.payoutStatus')}: ${status || 'unknown'}`);
                  } catch (error: any) {
                    toast.error(error?.response?.data?.message || t('wallet.statusCheckFailed'));
                  }
                }}
              >
                {t('wallet.checkStatus')}
              </UserActionButton>
            ) : null}
          </Stack>
        }
      />

      {showInitialSkeleton ? (
        <WalletPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile
              label={t('wallet.totalBalance')}
              value={<CoinValue value={user?.balance} size={20} />}
            />
            <UserStatTile
              label={t('wallet.withdrawableAmount')}
              value={hasPendingWithdrawal ? '0.00' : withdrawableAmount.toFixed(2)}
              suffix="BAC"
            />
            <UserStatTile
              label={t('wallet.earnings')}
              value={<UserAnimatedStat value={walletData.earnings} variant="h5" fontWeight={700} />}
            />
            <UserStatTile
              label={t('wallet.payouts')}
              value={<UserAnimatedStat value={walletData.payouts} variant="h5" fontWeight={700} />}
            />
          </Box>

          <UserGlassCard sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography className="font-tr" sx={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.textPrimary }}>
                  {t('wallet.balanceBreakdown')}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 13, mt: 0.5 }}>
                  {t('wallet.balanceBreakdownHint')}
                </Typography>
              </Box>
              <UserActionButton
                actionVariant="gold"
                startIcon={<Iconify icon="solar:card-send-bold" />}
                onClick={handleOpenWithdrawalDialog}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                {t('wallet.requestWithdrawal')}
              </UserActionButton>
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={getGlassInnerSx(glassTokens, { p: 1.5 })}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 11, mb: 0.5 }}>{t('wallet.winMoney')}</Typography>
                  <CoinValue value={walletData.winMoney} size={16} />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={getGlassInnerSx(glassTokens, { p: 1.5 })}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 11, mb: 0.5 }}>{t('wallet.joinMoney')}</Typography>
                  <CoinValue value={walletData.joinMoney} size={16} />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={getGlassInnerSx(glassTokens, { p: 1.5 })}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 11, mb: 0.5 }}>{t('wallet.totalPayout')}</Typography>
                  <CoinValue value={walletData.totalPayout} size={16} />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={getGlassInnerSx(glassTokens, { p: 1.5 })}>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 11, mb: 0.5 }}>{t('wallet.transactionsCount')}</Typography>
                  <UserAnimatedStat value={transactions.length} variant="h6" fontWeight={700} />
                </Box>
              </Grid>
            </Grid>
          </UserGlassCard>

          <WalletTransactionList
            transactions={transactions}
            loading={loading}
            getTransactionTitle={getTransactionTitle}
            formatDate={formatDate}
            onRefresh={refreshBalanceHistory}
          />
        </Stack>
      )}

      {renderWithdrawalDialog()}
    </UserPageShell>
  );
}

