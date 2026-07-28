import { useMemo, useState, useEffect } from 'react';

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
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid2 as Grid,
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { fNumber } from 'src/utils/format-number';
import { useSelector } from 'src/store';
import { PAYMENT_META, PAYMENT_OPTIONS } from 'src/global-config';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserPageShell,
  UserActionButton,
  UserGlassCard,
  UserStatTile,
  USER_COLORS,
  userMutedTextSx,
  userGlassDialogPaperSx,
} from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';
import { WalletHero } from '../wallet/wallet-hero';
import {
  SHOP_FIELD_SX,
  SHOP_FIELD_LABEL_PROPS,
  SHOP_SELECT_MENU_PROPS,
} from '../shop/shop-styles';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type CurrencyRate = {
  id?: string;
  region?: string;
  currency: string;
  rate: number;
};

const CURRENCY_OPTIONS = [
  { value: 'BDT', label: 'Bangladeshi Taka (BDT)', flag: 'bdt' },
  { value: 'INR', label: 'Indian Rupee (INR)', flag: 'inr' },
  { value: 'PKR', label: 'Pakistani Rupee (PKR)', flag: 'pkr' },
  { value: 'USD', label: 'US Dollar (USD)', flag: 'usd' },
];

export function WithdrawalView() {
  const { t } = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const { getCurrencyRatesApi, createCoingoPayoutApi, getWithdrawableAmountApi } = useApi();

  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BDT');
  const [coinAmount, setCoinAmount] = useState<string>('');
  const [paymentChannel, setPaymentChannel] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawableAmount, setWithdrawableAmount] = useState<number>(0);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState<boolean>(false);
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState<number>(0);

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
    const fetchRates = async () => {
      try {
        const res = await getCurrencyRatesApi();
        const data = res?.data?.data;
        if (Array.isArray(data)) setCurrencyRates(data);
      } catch (error) {
        console.error('Failed to fetch currency rates:', error);
        toast.error('Failed to load currency rates');
      }
    };
    fetchRates();
  }, [getCurrencyRatesApi]);

  const currentRate = useMemo(() => {
    const rate = currencyRates.find(
      (r) =>
        r.currency?.toLowerCase() === selectedCurrency.toLowerCase() ||
        r.region?.toLowerCase() === selectedCurrency.toLowerCase()
    );
    return rate?.rate || 0;
  }, [currencyRates, selectedCurrency]);

  const calculatedAmount = useMemo(() => {
    const coins = parseFloat(coinAmount) || 0;
    return coins * currentRate;
  }, [coinAmount, currentRate]);

  const effectiveWithdrawable = hasPendingWithdrawal ? 0 : withdrawableAmount;
  const amountTooHigh = !!coinAmount && parseFloat(coinAmount) > effectiveWithdrawable;
  const canSubmit =
    !hasPendingWithdrawal &&
    effectiveWithdrawable > 0 &&
    !!coinAmount &&
    !!paymentChannel &&
    !!walletAddress.trim() &&
    parseFloat(coinAmount) > 0 &&
    !amountTooHigh;

  const withdrawableHint = hasPendingWithdrawal
    ? `Pending: ${fNumber(pendingWithdrawalAmount, { minimumFractionDigits: 2 })} BAC — wait until it finishes.`
    : withdrawableAmount <= 0
      ? 'Nothing withdrawable yet. Join matches and wait for unlock rules to apply.'
      : 'Min(match bets × 70% − withdrawn, current balance)';

  const handleOpenConfirmModal = () => {
    if (!coinAmount || parseFloat(coinAmount) <= 0) {
      toast.error('Please enter a valid coin amount');
      return;
    }
    if (!paymentChannel) {
      toast.error('Please select a payment channel');
      return;
    }
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }
    if (parseFloat(coinAmount) > effectiveWithdrawable) {
      toast.error(`Exceeds withdrawable amount. Maximum: ${effectiveWithdrawable.toFixed(2)} BAC`);
      return;
    }
    setOpenConfirmModal(true);
  };

  const handleSubmitWithdrawal = async () => {
    try {
      setSubmitting(true);
      const payload = {
        amount: parseFloat(coinAmount),
        walletNumber: walletAddress,
        walletType: paymentChannel,
        description: `Withdrawal: ${coinAmount} BAC to ${selectedCurrency}`,
      };
      const response = await createCoingoPayoutApi(payload);
      if (response?.data?.status) {
        toast.success('Withdrawal request submitted successfully');
        setCoinAmount('');
        setWalletAddress('');
        setPaymentChannel('');
        setOpenConfirmModal(false);
      } else {
        toast.error(response?.data?.message || 'Failed to submit withdrawal request');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldLabelProps = SHOP_FIELD_LABEL_PROPS;

  return (
    <UserPageShell>
      <WalletHero
        title={t('withdrawal.title')}
        badge={t('withdrawal.badge')}
        subtitle={t('withdrawal.subtitle')}
        chipLabel={t('withdrawal.chip')}
        chipIcon="solar:card-send-bold"
        action={
          <UserActionButton
            component={RouterLink}
            href={paths.user.account.wallet}
            actionVariant="ghost"
            size="medium"
            startIcon={<Iconify icon="solar:wallet-bold" />}
            sx={{ px: 2.5 }}
          >
            {t('nav.wallet')}
          </UserActionButton>
        }
      />

      <UserGlassCard
        noPadding
        sx={{
          width: 1,
          maxWidth: { xs: 1, md: 980 },
          mx: 'auto',
          boxShadow: `0 24px 60px ${alpha('#000000', 0.55)}`,
        }}
      >
        {/* Balance strip */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3.5 },
            pt: { xs: 2, md: 3 },
            pb: { xs: 1.5, md: 2 },
            borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
            background: `
              linear-gradient(135deg, ${alpha(GOLD, 0.06)} 0%, transparent 45%),
              ${alpha('#000000', 0.25)}
            `,
          }}
        >
          {hasPendingWithdrawal ? (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
                bgcolor: alpha(USER_COLORS.error, 0.1),
                border: `1px solid ${alpha(USER_COLORS.error, 0.35)}`,
              }}
            >
              <Iconify icon="solar:danger-triangle-bold" width={22} sx={{ color: USER_COLORS.error, mt: 0.15 }} />
              <Box>
                <Typography sx={{ color: USER_COLORS.error, fontWeight: 800, fontSize: 13 }}>
                  {t('withdrawal.pendingTitle')}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 12, mt: 0.35 }}>
                  Pending {fNumber(pendingWithdrawalAmount, { minimumFractionDigits: 2 })} BAC — {t('withdrawal.pendingBody')}
                </Typography>
              </Box>
            </Box>
          ) : null}

          <Grid container spacing={{ xs: 1.25, md: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <UserStatTile
                icon="solar:wallet-money-bold"
                label={t('wallet.availableBalance')}
                value={fNumber(user?.balance || 0, { minimumFractionDigits: 2 })}
                suffix="BAC"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <UserStatTile
                  icon="solar:card-send-bold"
                  label={t('wallet.withdrawableAmount')}
                  value={fNumber(effectiveWithdrawable, { minimumFractionDigits: 2 })}
                  suffix="BAC"
                />
                <Typography sx={{ ...userMutedTextSx, fontSize: 12, px: 0.5, lineHeight: 1.45 }}>
                  {withdrawableHint}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Form */}
        <Box sx={{ px: { xs: 2, sm: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3.5 } }}>
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label={t('wallet.selectCurrency')}
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                helperText="Payout currency for this request"
                InputLabelProps={fieldLabelProps}
                sx={SHOP_FIELD_SX}
                SelectProps={{ MenuProps: SHOP_SELECT_MENU_PROPS }}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t('wallet.coinAmount')}
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                error={amountTooHigh}
                disabled={effectiveWithdrawable <= 0}
                helperText={
                  amountTooHigh
                    ? `Exceeds maximum of ${fNumber(effectiveWithdrawable)} BAC`
                    : `Maximum: ${fNumber(effectiveWithdrawable)} BAC`
                }
                placeholder="0.00"
                InputLabelProps={fieldLabelProps}
                inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }}
                sx={SHOP_FIELD_SX}
              />
            </Grid>

            {coinAmount && parseFloat(coinAmount) > 0 ? (
              <Grid size={12}>
                <Box
                  sx={{
                    p: { xs: 1.75, md: 2 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.25,
                    bgcolor: alpha(GOLD, 0.08),
                    border: `1px solid ${alpha(GOLD, 0.3)}`,
                  }}
                >
                  <Box>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {t('wallet.youWillReceive')}
                    </Typography>
                    <Typography sx={{ color: GOLD, fontWeight: 800, fontSize: { xs: 22, md: 24 }, mt: 0.35 }}>
                      {fNumber(calculatedAmount, { minimumFractionDigits: 2 })} {selectedCurrency}
                    </Typography>
                  </Box>
                  <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                    1 BAC = {fNumber(currentRate, { minimumFractionDigits: 2 })} {selectedCurrency}
                  </Typography>
                </Box>
              </Grid>
            ) : null}

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label={t('wallet.paymentChannel')}
                value={paymentChannel}
                onChange={(e) => setPaymentChannel(e.target.value)}
                InputLabelProps={fieldLabelProps}
                sx={SHOP_FIELD_SX}
                SelectProps={{
                  displayEmpty: true,
                  MenuProps: SHOP_SELECT_MENU_PROPS,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Typography sx={{ color: alpha('#ffffff', 0.4) }}>Select channel</Typography>
                      );
                    }
                    return (PAYMENT_META as any)[selected as string]?.label || String(selected);
                  },
                }}
              >
                {PAYMENT_OPTIONS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {(PAYMENT_META as any)[method]?.label || method}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t('wallet.walletAddress')}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Wallet / account number"
                InputLabelProps={fieldLabelProps}
                sx={SHOP_FIELD_SX}
              />
            </Grid>

            <Grid size={12}>
              <UserActionButton
                actionVariant="gold"
                size="large"
                fullWidth
                onClick={handleOpenConfirmModal}
                disabled={!canSubmit || submitting}
                startIcon={<Iconify icon="solar:card-send-bold" />}
                sx={{
                  mt: { xs: 0.5, md: 1 },
                  minHeight: { xs: 52, md: 50 },
                  fontSize: { xs: 14, md: 13 },
                }}
              >
                {t('withdrawal.requestWithdrawal')}
              </UserActionButton>
            </Grid>
          </Grid>
        </Box>
      </UserGlassCard>

      <Dialog
        open={openConfirmModal}
        onClose={() => !submitting && setOpenConfirmModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { ...userGlassDialogPaperSx, m: { xs: 1.5, sm: 2 } } }}
      >
        <DialogTitle sx={{ color: USER_COLORS.textPrimary, fontWeight: 800 }}>
          {t('wallet.confirmWithdrawal')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: USER_COLORS.border }}>
          <Box sx={{ p: 2, bgcolor: alpha('#000000', 0.35), border: `1px solid ${USER_COLORS.border}` }}>
            <Stack spacing={1.5}>
              <Typography sx={userMutedTextSx}>Withdraw Amount</Typography>
              <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 700, fontSize: 20 }}>
                {coinAmount} BAC
              </Typography>
              <Divider sx={{ borderColor: USER_COLORS.border }} />
              <Typography sx={userMutedTextSx}>You will receive</Typography>
              <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: 20 }}>
                {fNumber(calculatedAmount, { minimumFractionDigits: 2 })} {selectedCurrency}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 2,
            py: 1.5,
            gap: 1,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            borderTop: `1px solid ${USER_COLORS.border}`,
            '& > :not(style)': { m: '0 !important', width: { xs: 1, sm: 'auto' } },
          }}
        >
          <UserActionButton actionVariant="ghost" onClick={() => setOpenConfirmModal(false)} disabled={submitting}>
            {t('wallet.cancel')}
          </UserActionButton>
          <UserActionButton
            actionVariant="gold"
            onClick={handleSubmitWithdrawal}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? t('wallet.processing') : t('wallet.confirmSubmit')}
          </UserActionButton>
        </DialogActions>
      </Dialog>
    </UserPageShell>
  );
}
