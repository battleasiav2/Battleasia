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
  userPolishedDialogPaperSx,
  userPolishedDialogRailSx,
  userPolishedDialogTitleSx,
  userPolishedDialogEyebrowSx,
  userPolishedDialogHeadingSx,
  userPolishedDialogContentSx,
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
        title={t('withdrawal.title') || 'WITHDRAWAL TERMINAL'}
        badge="PAYOUT DISPATCH ENGINE"
        subtitle={t('withdrawal.subtitle') || 'Convert your match winnings and BAC balance directly into your preferred mobile bank or crypto wallet'}
        chipLabel="DISPATCH PORTAL"
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
            {t('nav.wallet') || 'Wallet Overview'}
          </UserActionButton>
        }
      />

      <UserGlassCard
        noPadding
        sx={{
          width: 1,
          maxWidth: { xs: 1, md: 980 },
          mx: 'auto',
          bgcolor: alpha('#060912', 0.85),
          border: `1px solid ${alpha(GOLD, 0.35)}`,
          borderTop: `3px solid ${GOLD}`,
          boxShadow: `0 24px 60px ${alpha('#000000', 0.95)}, inset 0 1px 0 ${alpha(GOLD, 0.2)}`,
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Balance strip */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3, md: 4 },
            pt: { xs: 2.5, md: 3.5 },
            pb: { xs: 2, md: 2.5 },
            borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
            background: `
              linear-gradient(135deg, ${alpha(GOLD, 0.08)} 0%, transparent 55%),
              ${alpha('#000000', 0.3)}
            `,
          }}
        >
          {hasPendingWithdrawal ? (
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                bgcolor: alpha(USER_COLORS.error, 0.12),
                border: `1px solid ${alpha(USER_COLORS.error, 0.4)}`,
                borderLeft: `4px solid ${USER_COLORS.error}`,
              }}
            >
              <Iconify icon="solar:danger-triangle-bold" width={26} sx={{ color: USER_COLORS.error, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ color: USER_COLORS.error, fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>
                  {t('withdrawal.pendingTitle') || 'DISPATCH LOCKED — PENDING PAYOUT'}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 12, mt: 0.35 }}>
                  Pending payout of {fNumber(pendingWithdrawalAmount, { minimumFractionDigits: 2 })} BAC is currently being processed. Wait for completion before submitting a new request.
                </Typography>
              </Box>
            </Box>
          ) : null}

          <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <UserStatTile
                icon="solar:wallet-money-bold"
                label={t('wallet.availableBalance') || 'Total Balance'}
                value={fNumber(user?.balance || 0, { minimumFractionDigits: 2 })}
                suffix="BAC"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <UserStatTile
                  icon="solar:card-send-bold"
                  label={t('wallet.withdrawableAmount') || 'Withdrawable Balance'}
                  value={fNumber(effectiveWithdrawable, { minimumFractionDigits: 2 })}
                  suffix="BAC"
                />
                <Typography sx={{ ...userMutedTextSx, fontSize: 11, px: 0.5, lineHeight: 1.45 }}>
                  {withdrawableHint}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Interactive Cyber Form */}
        <Box sx={{ px: { xs: 2.5, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {/* Step 1 Header */}
            <Grid size={12}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 6, height: 16, bgcolor: GOLD }} />
                <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: GOLD }}>
                  STEP 1: SELECT CURRENCY & AMOUNT
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label={t('wallet.selectCurrency') || 'Payout Currency'}
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                helperText="Choose target currency for conversion"
                InputLabelProps={fieldLabelProps}
                sx={SHOP_FIELD_SX}
                SelectProps={{ MenuProps: SHOP_SELECT_MENU_PROPS }}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box
                        component="img"
                        src={`/assets/images/flags/${option.flag}.gif`}
                        alt={option.value}
                        sx={{ width: 22, height: 14, borderRadius: 0.5, objectFit: 'cover', border: '1px silver solid' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('wallet.coinAmount') || 'Withdrawal Amount (BAC)'}
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  error={amountTooHigh}
                  disabled={effectiveWithdrawable <= 0}
                  helperText={
                    amountTooHigh
                      ? `Exceeds withdrawable maximum of ${fNumber(effectiveWithdrawable)} BAC`
                      : `Maximum available: ${fNumber(effectiveWithdrawable)} BAC`
                  }
                  placeholder="0.00"
                  InputLabelProps={fieldLabelProps}
                  inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }}
                  sx={SHOP_FIELD_SX}
                  InputProps={{
                    startAdornment: (
                      <Box component="img" src="/assets/images/currency.webp" alt="BAC" sx={{ width: 22, height: 22, mr: 1 }} />
                    ),
                  }}
                />

                {/* Quick Percentage Presets */}
                {!hasPendingWithdrawal && effectiveWithdrawable > 0 && (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {[
                      { label: '25%', ratio: 0.25 },
                      { label: '50%', ratio: 0.50 },
                      { label: '75%', ratio: 0.75 },
                      { label: 'MAX', ratio: 1.00 },
                    ].map((preset) => (
                      <Box
                        key={preset.label}
                        onClick={() => setCoinAmount((effectiveWithdrawable * preset.ratio).toFixed(2))}
                        sx={{
                          px: 1.25,
                          py: 0.35,
                          fontSize: 10,
                          fontWeight: 800,
                          color: GOLD,
                          bgcolor: alpha(GOLD, 0.1),
                          border: `1px solid ${alpha(GOLD, 0.3)}`,
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha(GOLD, 0.25),
                            borderColor: GOLD,
                          },
                        }}
                      >
                        {preset.label}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Grid>

            {/* Calculated Amount Display Box */}
            {coinAmount && parseFloat(coinAmount) > 0 ? (
              <Grid size={12}>
                <Box
                  sx={{
                    p: 2.25,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: alpha(GOLD, 0.08),
                    border: `1px solid ${alpha(GOLD, 0.35)}`,
                    boxShadow: `0 8px 24px ${alpha('#000000', 0.4)}, inset 0 0 16px ${alpha(GOLD, 0.05)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={`/assets/images/flags/${selectedCurrency.toLowerCase()}.gif`}
                      alt={selectedCurrency}
                      sx={{ width: 32, height: 20, borderRadius: 0.5, objectFit: 'cover', border: '1px silver solid' }}
                    />
                    <Box>
                      <Typography sx={{ ...userMutedTextSx, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                        {t('wallet.youWillReceive') || 'ESTIMATED PAYOUT RECEIPT'}
                      </Typography>
                      <Typography sx={{ color: GOLD, fontWeight: 900, fontSize: { xs: 24, md: 28 }, lineHeight: 1.1, mt: 0.25 }}>
                        {fNumber(calculatedAmount, { minimumFractionDigits: 2 })} {selectedCurrency}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography sx={{ color: alpha('#ffffff', 0.8), fontSize: 12, fontWeight: 700 }}>
                      EXCHANGE RATE
                    </Typography>
                    <Typography sx={{ ...userMutedTextSx, fontSize: 12, fontFamily: 'monospace' }}>
                      1 BAC = {fNumber(currentRate, { minimumFractionDigits: 2 })} {selectedCurrency}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ) : null}

            {/* Step 2 Header */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 6, height: 16, bgcolor: GOLD }} />
                <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: GOLD }}>
                  STEP 2: SELECT PAYMENT METHOD & DESTINATION
                </Typography>
              </Stack>
            </Grid>

            {/* Payment Channel Visual Selector Cards */}
            <Grid size={12}>
              <Typography variant="caption" sx={{ ...userMutedTextSx, display: 'block', mb: 1.25, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: 10 }}>
                PAYMENT GATEWAY METHOD
              </Typography>
              <Grid container spacing={1.5}>
                {PAYMENT_OPTIONS.map((method) => {
                  const meta = (PAYMENT_META as any)[method];
                  const isSelected = paymentChannel === method;
                  return (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={method}>
                      <Box
                        onClick={() => setPaymentChannel(method)}
                        sx={{
                          p: 1.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          cursor: 'pointer',
                          bgcolor: isSelected ? alpha(GOLD, 0.15) : alpha('#000000', 0.4),
                          border: `1px solid ${isSelected ? GOLD : alpha('#ffffff', 0.12)}`,
                          boxShadow: isSelected ? `0 0 16px ${alpha(GOLD, 0.3)}` : 'none',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: alpha(GOLD, 0.6),
                            bgcolor: alpha(GOLD, 0.08),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            backgroundImage: `url(${meta?.imgurl})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            width: 50,
                            height: 32,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 12,
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? GOLD : '#ffffff',
                            textAlign: 'center',
                          }}
                        >
                          {meta?.label || method}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* Wallet Address Input */}
            <Grid size={12}>
              <TextField
                fullWidth
                label={t('wallet.walletAddress') || 'Destination Wallet / Account Number'}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your bKash/Nagad/Rocket number or USDT wallet address"
                helperText="Ensure the address matches your selected payment method"
                InputLabelProps={fieldLabelProps}
                sx={SHOP_FIELD_SX}
              />
            </Grid>

            {/* Micro Telemetry Bar */}
            <Grid size={12}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 1.25, bgcolor: alpha('#000000', 0.3), border: `1px solid ${alpha('#ffffff', 0.08)}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:clock-circle-bold" width={18} sx={{ color: GOLD }} />
                    <Box>
                      <Typography sx={{ fontSize: 9, color: alpha('#ffffff', 0.5), fontWeight: 700, textTransform: 'uppercase' }}>ESTIMATED SPEED</Typography>
                      <Typography sx={{ fontSize: 11, color: '#ffffff', fontWeight: 700 }}>~15 MINS PROCESSING</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 1.25, bgcolor: alpha('#000000', 0.3), border: `1px solid ${alpha('#ffffff', 0.08)}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: '#22c55e' }} />
                    <Box>
                      <Typography sx={{ fontSize: 9, color: alpha('#ffffff', 0.5), fontWeight: 700, textTransform: 'uppercase' }}>NETWORK FEE</Typography>
                      <Typography sx={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>0.00 BAC (100% FREE)</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ p: 1.25, bgcolor: alpha('#000000', 0.3), border: `1px solid ${alpha('#ffffff', 0.08)}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:lock-keyhole-bold" width={18} sx={{ color: GOLD }} />
                    <Box>
                      <Typography sx={{ fontSize: 9, color: alpha('#ffffff', 0.5), fontWeight: 700, textTransform: 'uppercase' }}>SECURITY</Typography>
                      <Typography sx={{ fontSize: 11, color: '#ffffff', fontWeight: 700 }}>ENCRYPTED DISPATCH</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Action CTA Button */}
            <Grid size={12}>
              <UserActionButton
                actionVariant="gold"
                size="large"
                fullWidth
                onClick={handleOpenConfirmModal}
                disabled={!canSubmit || submitting}
                startIcon={<Iconify icon="solar:card-send-bold" width={22} />}
                sx={{
                  mt: 1,
                  minHeight: 54,
                  fontSize: '1rem',
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  boxShadow: `0 12px 32px ${alpha(GOLD, 0.35)}`,
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
                }}
              >
                {t('withdrawal.requestWithdrawal') || 'INITIATE PAYOUT DISPATCH'}
              </UserActionButton>
            </Grid>
          </Grid>
        </Box>
      </UserGlassCard>

      {/* Cyber Confirmation Dialog */}
      <Dialog
        open={openConfirmModal}
        onClose={() => !submitting && setOpenConfirmModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { ...userPolishedDialogPaperSx, m: { xs: 1.5, sm: 2 } } }}
      >
        <Box sx={userPolishedDialogRailSx} />
        <DialogTitle sx={userPolishedDialogTitleSx}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={userPolishedDialogEyebrowSx}>PAYOUT CONFIRMATION</Typography>
            <Typography sx={userPolishedDialogHeadingSx}>{t('wallet.confirmWithdrawal') || 'Confirm Payout Request'}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={userPolishedDialogContentSx}>
          <Stack spacing={2.5}>
            <Box sx={{ p: 2.25, bgcolor: alpha('#000000', 0.45), border: `1px solid ${alpha(GOLD, 0.3)}` }}>
              <Stack spacing={1.5}>
                <Typography sx={{ ...userMutedTextSx, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Withdrawal Amount
                </Typography>
                <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 22 }}>
                  {coinAmount} BAC
                </Typography>
                <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />
                <Typography sx={{ ...userMutedTextSx, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Estimated Fiat Receipt
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="img"
                    src={`/assets/images/flags/${selectedCurrency.toLowerCase()}.gif`}
                    alt={selectedCurrency}
                    sx={{ width: 24, height: 16, borderRadius: 0.5, objectFit: 'cover', border: '1px silver solid' }}
                  />
                  <Typography sx={{ color: GOLD, fontWeight: 900, fontSize: 22 }}>
                    {fNumber(calculatedAmount, { minimumFractionDigits: 2 })} {selectedCurrency}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Stack spacing={1.5} sx={{ px: 0.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={userMutedTextSx}>Payment Method</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: GOLD }}>
                  {(PAYMENT_META as any)[paymentChannel]?.label || paymentChannel}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={userMutedTextSx}>Destination Wallet</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {walletAddress}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={userMutedTextSx}>Conversion Rate</Typography>
                <Typography variant="body2" fontWeight={700}>
                  1 BAC = {fNumber(currentRate, { minimumFractionDigits: 2 })} {selectedCurrency}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1.5,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
            '& > :not(style)': { m: '0 !important', width: { xs: 1, sm: 'auto' } },
          }}
        >
          <UserActionButton actionVariant="ghost" onClick={() => setOpenConfirmModal(false)} disabled={submitting}>
            {t('wallet.cancel') || 'Cancel'}
          </UserActionButton>
          <UserActionButton
            actionVariant="gold"
            onClick={handleSubmitWithdrawal}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? (t('wallet.processing') || 'Processing...') : (t('wallet.confirmSubmit') || 'Confirm & Submit')}
          </UserActionButton>
        </DialogActions>
      </Dialog>
    </UserPageShell>
  );
}

