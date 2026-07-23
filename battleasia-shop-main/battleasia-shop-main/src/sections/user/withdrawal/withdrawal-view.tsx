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
} from '@mui/material';
import { toast } from 'react-hot-toast';

import useApi from 'src/hooks/use-api';
import { fNumber } from 'src/utils/format-number';
import { useSelector } from 'src/store';
import { PAYMENT_META, PAYMENT_OPTIONS } from 'src/global-config';
import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
  userGlassDialogPaperSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { WalletHero } from '../wallet/wallet-hero';
import { SHOP_FIELD_SX, SHOP_SELECT_MENU_PROPS } from '../shop/shop-styles';

// ----------------------------------------------------------------------

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
  const { user } = useSelector((state) => state.auth);
  const { getCurrencyRatesApi, createCoingoPayoutApi, getWithdrawableAmountApi } = useApi();
  const tokens = getDefaultGlassTokens();

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
    if (parseFloat(coinAmount) > withdrawableAmount) {
      toast.error(`Exceeds withdrawable amount. Maximum: ${withdrawableAmount.toFixed(2)} BAC`);
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

  return (
    <UserPageShell>
      <WalletHero title="Withdrawal" />

      <UserPageTitle
        badge="Secure Payout"
        title="Request Withdrawal"
        subtitle="Withdraw your BAC coins to your preferred payment channel."
      />

      <UserGlassCard sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={3}>
          {hasPendingWithdrawal ? (
            <UserGlassCard sx={{ p: 2, bgcolor: alpha(USER_COLORS.error, 0.08), borderColor: alpha(USER_COLORS.error, 0.35) }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon="solar:danger-triangle-bold" width={28} sx={{ color: USER_COLORS.error }} />
                <Box>
                  <Typography sx={{ color: USER_COLORS.error, fontWeight: 700 }}>
                    Pending Withdrawal Exists
                  </Typography>
                  <Typography sx={userMutedTextSx}>
                    You have a pending withdrawal of {fNumber(pendingWithdrawalAmount, { minimumFractionDigits: 2 })} BAC. Please wait until it completes.
                  </Typography>
                </Box>
              </Stack>
            </UserGlassCard>
          ) : null}

          <UserGlassCard sx={{ p: 2, bgcolor: alpha('#000000', 0.35) }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={userMutedTextSx}>Available Balance</Typography>
                <Typography sx={{ color: USER_COLORS.gold, fontWeight: 800, fontSize: 28 }}>
                  {fNumber(user?.balance || 0, { minimumFractionDigits: 2 })} BAC
                </Typography>
              </Box>
              <Divider sx={{ borderColor: USER_COLORS.border }} />
              <Box>
                <Typography sx={userMutedTextSx}>Withdrawable Amount</Typography>
                <Typography
                  sx={{
                    color: hasPendingWithdrawal ? USER_COLORS.textMuted : USER_COLORS.gold,
                    fontWeight: 800,
                    fontSize: 24,
                  }}
                >
                  {hasPendingWithdrawal ? '0.00' : fNumber(withdrawableAmount, { minimumFractionDigits: 2 })} BAC
                </Typography>
              </Box>
            </Stack>
          </UserGlassCard>

          <TextField
            select
            fullWidth
            label="Select Currency"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            helperText="Choose the currency for withdrawal"
            sx={SHOP_FIELD_SX}
            SelectProps={{ MenuProps: SHOP_SELECT_MENU_PROPS }}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Coin Amount (BAC)"
            value={coinAmount}
            onChange={(e) => setCoinAmount(e.target.value)}
            error={!!coinAmount && parseFloat(coinAmount) > withdrawableAmount}
            helperText={`Maximum: ${fNumber(withdrawableAmount)} BAC`}
            sx={SHOP_FIELD_SX}
          />

          {coinAmount && parseFloat(coinAmount) > 0 ? (
            <Box sx={getGlassInnerSx(tokens, { p: 2, borderColor: alpha(USER_COLORS.success, 0.35) })}>
              <Typography sx={userMutedTextSx}>You will receive (approx.)</Typography>
              <Typography sx={{ color: USER_COLORS.success, fontWeight: 800, fontSize: 22 }}>
                {fNumber(calculatedAmount, { minimumFractionDigits: 2 })} {selectedCurrency}
              </Typography>
              <Typography sx={{ ...userMutedTextSx, fontSize: 12, mt: 0.5 }}>
                1 BAC = {fNumber(currentRate, { minimumFractionDigits: 2 })} {selectedCurrency}
              </Typography>
            </Box>
          ) : null}

          <TextField
            select
            fullWidth
            label="Payment Channel"
            value={paymentChannel}
            onChange={(e) => setPaymentChannel(e.target.value)}
            sx={SHOP_FIELD_SX}
            SelectProps={{ MenuProps: SHOP_SELECT_MENU_PROPS }}
          >
            {PAYMENT_OPTIONS.map((method) => (
              <MenuItem key={method} value={method}>
                {(PAYMENT_META as any)[method]?.label || method}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Wallet Address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter your wallet address or account number"
            multiline
            rows={2}
            sx={SHOP_FIELD_SX}
          />

          <UserActionButton
            actionVariant="gold"
            size="large"
            fullWidth
            onClick={handleOpenConfirmModal}
            disabled={
              hasPendingWithdrawal ||
              !coinAmount ||
              !paymentChannel ||
              !walletAddress ||
              parseFloat(coinAmount) <= 0 ||
              parseFloat(coinAmount) > withdrawableAmount
            }
            startIcon={<Iconify icon="solar:card-send-bold" />}
          >
            Request Withdrawal
          </UserActionButton>
        </Stack>
      </UserGlassCard>

      <Dialog
        open={openConfirmModal}
        onClose={() => !submitting && setOpenConfirmModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: userGlassDialogPaperSx }}
      >
        <DialogTitle sx={{ color: USER_COLORS.textPrimary }}>Confirm Withdrawal</DialogTitle>
        <DialogContent dividers sx={{ borderColor: USER_COLORS.border }}>
          <UserGlassCard sx={{ p: 2, bgcolor: alpha('#000000', 0.35) }}>
            <Stack spacing={1.5}>
              <Typography sx={userMutedTextSx}>Withdraw Amount</Typography>
              <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 700, fontSize: 20 }}>
                {coinAmount} BAC
              </Typography>
              <Divider sx={{ borderColor: USER_COLORS.border }} />
              <Typography sx={userMutedTextSx}>You will receive</Typography>
              <Typography sx={{ color: USER_COLORS.success, fontWeight: 700, fontSize: 20 }}>
                {fNumber(calculatedAmount, { minimumFractionDigits: 2 })} {selectedCurrency}
              </Typography>
            </Stack>
          </UserGlassCard>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${USER_COLORS.border}` }}>
          <UserActionButton actionVariant="ghost" onClick={() => setOpenConfirmModal(false)} disabled={submitting}>
            Cancel
          </UserActionButton>
          <UserActionButton
            actionVariant="gold"
            onClick={handleSubmitWithdrawal}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? 'Processing...' : 'Confirm & Submit'}
          </UserActionButton>
        </DialogActions>
      </Dialog>
    </UserPageShell>
  );
}
