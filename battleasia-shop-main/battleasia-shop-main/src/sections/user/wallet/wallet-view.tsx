import { useMemo, useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import {
    Box,
    Card,
    Chip,
    Stack,
    Button,
    Dialog,
    Divider,
    MenuItem,
    TextField,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid2 as Grid,
} from '@mui/material';
import {
    DataGrid,
    GridToolbar,
    type GridColDef,
} from '@mui/x-data-grid';

import useApi from 'src/hooks/use-api';
import { fNumber } from 'src/utils/format-number';
import { useSelector, useDispatch } from 'src/store';
import { balanceAction } from 'src/store/reducers/auth';
import {
    UserPageShell,
    UserPageTitle,
    UserGlassCard,
    UserActionButton,
    USER_COLORS,
    userMutedTextSx,
    userGlassDialogPaperSx,
} from 'src/layouts/user';
import { SHOP_FIELD_SX, SHOP_SELECT_MENU_PROPS } from '../shop/shop-styles';
import { WalletHero } from './wallet-hero';
import { PAYMENT_META, PAYMENT_OPTIONS } from 'src/global-config';

import { toast } from 'react-hot-toast';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';

// ----------------------------------------------------------------------

type BalanceHistoryItem = {
    id: string;
    amount: number;
    type: 'deposit' | 'withdraw' | 'earning';
    balanceBefore: number;
    balanceAfter: number;
    performedBy: string;
    detail: Record<string, any>;
    createdAt: Date | string | null;
    status?: string;
};

type CurrencyRate = {
    id?: string;
    region?: string;
    currency: string;
    rate: number;
};
// ---------------------------------------------------------------------

const CURRENCY_OPTIONS = [
    { value: 'BDT', label: 'Bangladeshi Taka (BDT)', flag: 'bdt' },
    { value: 'INR', label: 'Indian Rupee (INR)', flag: 'inr' },
    { value: 'PKR', label: 'Pakistani Rupee (PKR)', flag: 'pkr' },
    { value: 'USD', label: 'US Dollar (USD)', flag: 'usd' },
];

export function WalletView() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { getBalanceHistoryApi, getCurrencyRatesApi, submitWithdrawalApi, initialize, getWithdrawableAmountApi, getWithdrawalByIdApi, getDepositByIdApi } = useApi();
    const playerEmail = useSelector((state) => state.auth.user?.email || '');

    const [transactions, setTransactions] = useState<BalanceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Withdrawal modal state
    const [openWithdrawalModal, setOpenWithdrawalModal] = useState(false);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('BDT');
    const [coinAmount, setCoinAmount] = useState<string>('');
    const [paymentChannel, setPaymentChannel] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

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

    // Fetch fresh user balance on component mount
    useEffect(() => {
        const fetchUserBalance = async () => {
            try {
                const response = await initialize();
                if (response?.data?.status && response?.data?.data?.balance?.balance !== undefined) {
                    dispatch(balanceAction(response.data.data.balance.balance));
                }
            } catch (error) {
                console.error('Failed to fetch user balance:', error);
            }
        };

        fetchUserBalance();
    }, [initialize, dispatch]);

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
                    // Map transactions and fetch actual status from source collections
                    const transactionsWithStatus = await Promise.all(
                        responseData.data.results.map(async (item: any) => {
                            let actualStatus = item.status || 'completed';
                            
                            // For withdrawals, check detail for withdrawal_id or try to fetch status
                            if (item.type === 'withdraw') {
                                const withdrawalId = item.detail?.withdrawal_id || item.detail?.withdrawalId || item.detail?.id;
                                
                                // If there's a pending withdrawal and this is the most recent withdrawal, mark as pending
                                if (hasPendingWithdrawal && pendingWithdrawalAmount === Math.abs(Number(item.amount))) {
                                    actualStatus = 'pending';
                                }
                                // Otherwise try to fetch from API if we have an ID
                                else if (withdrawalId) {
                                    try {
                                        const withdrawalResponse = await getWithdrawalByIdApi(withdrawalId);
                                        if (withdrawalResponse?.data?.status && withdrawalResponse?.data?.data) {
                                            actualStatus = withdrawalResponse.data.data.status || 'completed';
                                        }
                                    } catch (error) {
                                        console.error('Failed to fetch withdrawal status:', error);
                                    }
                                }
                            }
                            
                            // For deposits, fetch actual status from deposit_histories collection
                            else if (item.type === 'deposit') {
                                const depositId = item.detail?.deposit_id || item.detail?.depositId || item.detail?.id;
                                
                                if (depositId) {
                                    try {
                                        const depositResponse = await getDepositByIdApi(depositId);
                                        if (depositResponse?.data?.status && depositResponse?.data?.data) {
                                            actualStatus = depositResponse.data.data.status || 'completed';
                                        }
                                    } catch (error) {
                                        console.error('Failed to fetch deposit status:', error);
                                    }
                                }
                            }

                            return {
                                id: item.id || item._id,
                                amount: Number(item.amount) || 0,
                                type: item.type === 'withdraw' ? 'withdraw' : item.type === 'earning' ? 'earning' : 'deposit',
                                balanceBefore: Number(item.balanceBefore) || 0,
                                balanceAfter: Number(item.balanceAfter) || 0,
                                performedBy: item.performedBy || '',
                                detail: item.detail || {},
                                createdAt: item.createdAt ? new Date(item.createdAt) : null,
                                // Use actual status fetched from source collection
                                status: actualStatus,
                            };
                        })
                    );
                    
                    setTransactions(transactionsWithStatus);
                }
            } catch (error: any) {
                console.error('Failed to fetch balance history:', error);
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to load wallet history';
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchBalanceHistory();
    }, [getBalanceHistoryApi, getWithdrawalByIdApi, getDepositByIdApi, user?._id, refreshTrigger, hasPendingWithdrawal, pendingWithdrawalAmount]);

    // Listen for balance changes (e.g., from Socket.IO) and refresh history
    useEffect(() => {
        if (user?.balance !== undefined) {
            // Trigger a refresh of balance history when balance changes
            setRefreshTrigger(prev => prev + 1);
        }
    }, [user?.balance]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await getCurrencyRatesApi();
                const data = res?.data?.data;
                if (Array.isArray(data)) {
                    setCurrencyRates(data);
                }
            } catch (error) {
                console.error('Failed to fetch currency rates:', error);
                toast.error('Failed to load currency rates');
            }
        };
        fetchRates();
    }, [getCurrencyRatesApi]);

    const walletData = useMemo(() => {
        const deposits = transactions.filter((t) => t.type === 'deposit' || t.type === 'earning');
        const withdraws = transactions.filter((t) => t.type === 'withdraw');

        const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
        const totalWithdraws = withdraws.reduce((sum, t) => sum + t.amount, 0);

        // Calculate win money (earnings from match rewards)
        const winMoney = transactions
            .filter((t) =>
                t.type === 'earning' ||
                t.detail?.reason === 'match_result_update' ||
                t.detail?.reason === 'match_winnings' ||
                t.detail?.reason === 'match_reward'
            )
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate join money (withdraws for match entry fees)
        const joinMoney = withdraws
            .filter((t) => t.detail?.reason === 'match_entry_fee' || t.detail?.matchId)
            .reduce((sum, t) => sum + t.amount, 0);

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

    const userBalanceTotals = useMemo(
        () =>
            currencyRates.map((item) => {
                const amount = user?.balance * item.rate;
                return {
                    code: item.currency.toUpperCase(),
                    amount: amount != null ? amount : 0,
                };
            }),
        [currencyRates, user?.balance]
    );

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

    const handleOpenWithdrawalModal = () => {
        setOpenWithdrawalModal(true);
    };

    const handleCloseWithdrawalModal = () => {
        setOpenWithdrawalModal(false);
        // Reset form
        setCoinAmount('');
        setWalletAddress('');
        setPaymentChannel('');
        setSelectedCurrency('BDT');
    };

    const handleOpenConfirmModal = () => {
        // Validation
        if (!coinAmount || parseFloat(coinAmount) <= 0) {
            toast.error('Please enter a valid coin amount');
            return;
        }
        if (!paymentChannel) {
            toast.error('Please select a payment channel');
            return;
        }
        if (!walletAddress || walletAddress.trim() === '') {
            toast.error('Please enter a wallet address');
            return;
        }
        if (parseFloat(coinAmount) > withdrawableAmount) {
            toast.error(`Exceeds withdrawable amount. Maximum: ${withdrawableAmount.toFixed(2)} BAC`);
            return;
        }

        setOpenConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setOpenConfirmModal(false);
    };

    const refreshUserBalance = async () => {
        try {
            const response = await initialize();
            if (response?.data?.status && response?.data?.data?.balance?.balance !== undefined) {
                dispatch(balanceAction(response.data.data.balance.balance));
            }
        } catch (error) {
            console.error('Failed to refresh user balance:', error);
        }
    };

    const handleSubmitWithdrawal = async () => {
        try {
            setSubmitting(true);

            const payload = {
                user_email: playerEmail,
                username: user?.username || user?.name || '',
                coin_amount: parseFloat(coinAmount),
                wallet_type: paymentChannel,
                wallet_address: walletAddress,
                currency_type: selectedCurrency,
                currency_amount: calculatedAmount,
                description: `Withdrawal: ${coinAmount} BAC to ${selectedCurrency} (${fNumber(calculatedAmount, { minimumFractionDigits: 2 })} ${selectedCurrency})`,
            };

            const response = await submitWithdrawalApi(payload);

            if (response?.data?.status) {
                toast.success('Withdrawal request submitted successfully');
                
                // Refresh user balance
                await refreshUserBalance();
                
                // Close modals and reset form
                setOpenConfirmModal(false);
                setOpenWithdrawalModal(false);
                setCoinAmount('');
                setWalletAddress('');
                setPaymentChannel('');
                setSelectedCurrency('BDT');
            } else {
                toast.error(response?.data?.message || 'Failed to submit withdrawal request');
            }
        } catch (error: any) {
            console.error('Withdrawal error:', error);
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to submit withdrawal request';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderBalanceCard = () => (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
                <UserGlassCard sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
                    <Stack spacing={3}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>                       
                                <Typography sx={{ ...userMutedTextSx, fontWeight: 600, mb: 1 }}>
                                    Total Balance
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    color: USER_COLORS.gold,
                                    fontWeight: 800,
                                    fontSize: { xs: 28, md: 36 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 32, height: 32 }} />
                                {fNumber(user?.balance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BAC
                            </Typography>
                            <Stack spacing={0.5} sx={{ mt: 1, maxWidth: 200 }}>
                                {userBalanceTotals.map((item) => (
                                        <Box
                                            key={item.code}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Box
                                                    component="img"
                                                    src={`/assets/images/flags/${item.code.toLowerCase()}.gif`}
                                                    alt={`${item.code} flag`}
                                                    sx={{ width: 20, height: 14, borderRadius: 0.5, objectFit: 'cover', border:"1px silver solid" }}
                                                />
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {item.code}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                                {item.amount != null
                                                    ? fNumber(item.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                    : '--'}
                                            </Typography>
                                        </Box>
                                    ))}
                            </Stack>
                        </Box>
                    </Stack>
                </UserGlassCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <UserGlassCard sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
                    <Stack spacing={3}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>                       
                                <Typography sx={{ ...userMutedTextSx, fontWeight: 600, mb: 1 }}>
                                    Withdrawable Amount
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    color: hasPendingWithdrawal ? USER_COLORS.textMuted : USER_COLORS.gold,
                                    fontWeight: 800,
                                    fontSize: { xs: 28, md: 36 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 32, height: 32, opacity: hasPendingWithdrawal ? 0.5 : 1 }} />
                                {hasPendingWithdrawal ? '0.00' : fNumber(withdrawableAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BAC
                            </Typography>
                            {hasPendingWithdrawal && (
                                <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                                    Pending withdrawal: {fNumber(pendingWithdrawalAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BAC
                                </Typography>
                            )}
                            {!hasPendingWithdrawal && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', lineHeight: 1.5 }}>
                                    * Calculation: Min(Total match bets × 70% - Already withdrawn, Current balance)
                                </Typography>
                            )}
                        </Box>

                        {/* Withdrawal Button */}
                        <UserActionButton
                            onClick={handleOpenWithdrawalModal}
                            actionVariant="gold"
                            size="large"
                            fullWidth
                            startIcon={<Iconify icon="solar:transfer-horizontal-bold" />}
                            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
                        >
                            Request Withdrawal
                        </UserActionButton>
                    </Stack>
                </UserGlassCard>
            </Grid>
        </Grid>
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderSummaryCards = () => null;

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
            return 'Withdrawal';
        }
        if (reason === 'withdrawal_rejected_refund') {
            return 'Withdrawal Refund';
        }
        if (reason === 'referral_bonus') {
            return 'Referral Bonus';
        }
        if (detail.note) {
            return detail.note;
        }
        if (transaction.type === 'earning') return 'Earning';
        return transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal';
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

    const getTransactionType = (transaction: BalanceHistoryItem): { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' | 'primary' } => {
        const detail = transaction.detail || {};
        const reason = detail?.reason;

        // Default: Earning for deposit/earning, Betting for withdraw
        let label = transaction.type === 'withdraw' ? 'Betting' : 'Earning';
        let color: 'success' | 'error' | 'warning' | 'info' | 'default' | 'primary' = transaction.type === 'withdraw' ? 'info' : 'success';

        // Match entry fee (Betting)
        if (reason === 'match_entry_fee') {
            label = 'Betting';
            color = 'info';
        } 
        // Match winnings and refunds (Earning)
        else if (reason === 'match_winnings' || reason === 'match_result_update' || reason === 'match_winner_refund_return' || reason === 'match_reward') {
            label = 'Earning';
            color = 'error';
        } 
        // Withdrawal approved (Withdrawal)
        else if (reason === 'withdrawal_approved') {
            label = 'Withdrawal';
            color = 'warning';
        } 
        // Withdrawal rejection refund (Refund)
        else if (reason === 'withdrawal_rejected_refund') {
            label = 'Refund';
            color = 'info';
        }
        // Deposit (Deposit)
        else if (detail?.deposit_id) {
            label = 'Deposit';
            color = 'success';
        }
        // Referral bonus (Referral)
        else if (reason === 'referral_bonus') {
            label = 'Referral';
            color = 'success';
        }

        return { label, color };
    };

    const getTransactionStatus = (transaction: BalanceHistoryItem): { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' } => {
        const status = transaction.status || 'completed';
        
        if (status === 'completed') {
            return { label: 'Completed', color: 'success' };
        }
        if (status === 'pending') {
            return { label: 'Pending', color: 'warning' };
        }
        if (status === 'processing') {
            return { label: 'Processing', color: 'info' };
        }
        if (status === 'rejected' || status === 'failed') {
            return { label: 'Failed', color: 'error' };
        }
        
        return { label: 'Completed', color: 'success' };
    };

    const renderTransactionHistory = () => {
        const columns: GridColDef[] = [
            {
                field: 'type',
                headerName: 'Type',
                width: 120,
                valueGetter: (value, row) => {
                    const typeInfo = getTransactionType(row);
                    return typeInfo.label;
                },
                renderCell: (params) => {
                    const typeInfo = getTransactionType(params.row);
                    return (
                        <Chip
                            label={typeInfo.label}
                            size="small"
                            color={typeInfo.color}
                            sx={{
                                fontWeight: 600,
                                minWidth: 80,
                            }}
                        />
                    );
                },
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 120,
                valueGetter: (value, row) => {
                    const statusInfo = getTransactionStatus(row);
                    return statusInfo.label;
                },
                renderCell: (params) => {
                    const statusInfo = getTransactionStatus(params.row);
                    return (
                        <Chip
                            label={statusInfo.label}
                            size="small"
                            color={statusInfo.color}
                            variant="outlined"
                            sx={{
                                fontWeight: 600,
                                minWidth: 80,
                            }}
                        />
                    );
                },
            },
            {
                field: 'title',
                headerName: 'Description',
                flex: 1,
                minWidth: 250,
                valueGetter: (value, row) => getTransactionTitle(row),
            },
            {
                field: 'amount',
                headerName: 'Amount',
                width: 150,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 16, height: 16 }} />
                        <Typography
                            variant="body2"
                            sx={{
                                color: params.row.type === 'withdraw' ? 'error.main' : 'success.main',
                                fontWeight: 600,
                            }}
                        >
                            {params.row.type === 'withdraw' ? '-' : '+'} {fNumber(params.value)} BAC
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'balanceAfter',
                headerName: 'Balance After',
                width: 150,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 16, height: 16 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {fNumber(params.value)} BAC
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'createdAt',
                headerName: 'Date/Time',
                width: 180,
                valueFormatter: (value) => formatDate(value),
            },
        ];

        return (
            <Box>
                <Typography className="font-tr" sx={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: USER_COLORS.gold, mb: 2 }}>
                    Wallet History
                </Typography>
                <UserGlassCard sx={{ height: 600, width: '100%', p: 0, overflow: 'hidden' }}>
                    <DataGrid
                        rows={transactions}
                        columns={columns}
                        loading={loading}
                        pageSizeOptions={[10, 25, 50, 100]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                            sorting: {
                                sortModel: [{ field: 'createdAt', sort: 'desc' }],
                            },
                        }}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                            },
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            color: USER_COLORS.textPrimary,
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: alpha('#000000', 0.45),
                                color: USER_COLORS.gold,
                                borderBottom: `1px solid ${alpha('#ffffff', 0.12)}`,
                            },
                            '& .MuiDataGrid-cell': {
                                display: 'flex',
                                alignItems: 'center',
                                borderColor: alpha('#ffffff', 0.08),
                            },
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-row:hover': { bgcolor: alpha(USER_COLORS.gold, 0.06) },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: `1px solid ${alpha('#ffffff', 0.12)}`,
                                bgcolor: alpha('#000000', 0.35),
                            },
                        }}
                    />
                </UserGlassCard>
            </Box>
        );
    };

    return (
        <UserPageShell>
            <WalletHero title="Wallet" />
            <UserPageTitle badge="Secure Vault" title="Wallet" subtitle="Manage balance, withdrawals, and transaction history." />
            <Stack spacing={3}>
                {renderBalanceCard()}
                {renderTransactionHistory()}
            </Stack>

            {/* Withdrawal Modal */}
            <Dialog
                open={openWithdrawalModal}
                onClose={handleCloseWithdrawalModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: userGlassDialogPaperSx }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:transfer-horizontal-bold" width={24} sx={{ color: 'primary.main' }} />
                        <Typography variant="h6">Request Withdrawal</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {/* Pending Withdrawal Warning */}
                        {hasPendingWithdrawal && (
                            <UserGlassCard sx={{ p: 2, bgcolor: alpha(USER_COLORS.error, 0.08), borderColor: alpha(USER_COLORS.error, 0.35) }}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Iconify icon="solar:danger-triangle-bold" width={28} sx={{ color: 'error.main' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: 'error.dark' }}>
                                            Pending Withdrawal Exists
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'error.dark' }}>
                                            You have a pending withdrawal of {fNumber(pendingWithdrawalAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BAC being processed. Please wait until it is completed or rejected before submitting a new request.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </UserGlassCard>
                        )}

                        <UserGlassCard sx={{ p: 2, bgcolor: alpha('#000000', 0.35) }}>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Available Balance
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 24, height: 24 }} />
                                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                            {fNumber(user?.balance || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BAC
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Withdrawable Amount
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 24, height: 24 }} />
                                        <Typography variant="h5" sx={{ color: hasPendingWithdrawal ? 'text.disabled' : 'warning.main', fontWeight: 700 }}>
                                            {hasPendingWithdrawal ? '0.00' : fNumber(withdrawableAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BAC
                                        </Typography>
                                    </Box>
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            component="img"
                                            src={`/assets/images/flags/${option.flag}.gif`}
                                            alt={`${option.value} flag`}
                                            sx={{ width: 20, height: 14, borderRadius: 0.5, objectFit: 'cover', border: '1px silver solid' }}
                                        />
                                        <Typography>{option.label}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Coin Amount Input */}
                        <TextField
                            fullWidth
                            type="number"
                            label="Coin Amount (BAC)"
                            value={coinAmount}
                            onChange={(e) => setCoinAmount(e.target.value)}
                            placeholder="Enter amount in BAC"
                            error={!!coinAmount && parseFloat(coinAmount) > withdrawableAmount}
                            helperText={
                                !!coinAmount && parseFloat(coinAmount) > withdrawableAmount
                                    ? `Exceeds withdrawable amount. Maximum: ${fNumber(withdrawableAmount)} BAC`
                                    : `Maximum: ${fNumber(withdrawableAmount)} BAC`
                            }
                            InputProps={{
                                startAdornment: (
                                    <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 20, height: 20, mr: 1 }} />
                                ),
                            }}
                        />

                        {/* Calculated Currency Amount Display */}
                        {coinAmount && parseFloat(coinAmount) > 0 && (
                            <UserGlassCard sx={{ p: 2, bgcolor: alpha(USER_COLORS.success, 0.08), borderColor: alpha(USER_COLORS.success, 0.35) }}>
                                <Stack spacing={1}>
                                    <Typography sx={userMutedTextSx}>
                                        You will receive (approx.)
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            component="img"
                                            src={`/assets/images/flags/${selectedCurrency.toLowerCase()}.gif`}
                                            alt={`${selectedCurrency} flag`}
                                            sx={{ width: 24, height: 16, borderRadius: 0.5, objectFit: 'cover', border: '1px silver solid' }}
                                        />
                                        <Typography sx={{ color: USER_COLORS.success, fontWeight: 700, fontSize: 20 }}>
                                            {fNumber(calculatedAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>
                                        Exchange rate: 1 BAC = {fNumber(currentRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency}
                                    </Typography>
                                </Stack>
                            </UserGlassCard>
                        )}

                        {/* Payment Channel Selection */}
                        <TextField
                            select
                            fullWidth
                            label="Payment Channel"
                            value={paymentChannel}
                            onChange={(e) => setPaymentChannel(e.target.value)}
                            helperText="Select your preferred payment method"
                            sx={SHOP_FIELD_SX}
                            SelectProps={{ MenuProps: SHOP_SELECT_MENU_PROPS }}
                        >
                            {PAYMENT_OPTIONS.map((method) => {
                                const meta = PAYMENT_META[method];
                                return (
                                    <MenuItem key={method} value={method}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    backgroundImage: `url(${meta.imgurl})`,
                                                    backgroundSize: 'contain',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat',
                                                    width: 40,
                                                    height: 28,
                                                }}
                                            />
                                            <Stack spacing={0}>
                                                <Typography variant="body2">{meta.label}</Typography>
                                                {meta.helper && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {meta.helper}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </TextField>

                        {/* Wallet Address Input */}
                        <TextField
                            fullWidth
                            label="Wallet Address"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="Enter your wallet address or account number"
                            helperText="Enter the destination address for receiving funds"
                            multiline
                            rows={2}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha('#ffffff', 0.1)}` }}>
                    <UserActionButton actionVariant="ghost" onClick={handleCloseWithdrawalModal} disabled={submitting}>
                        Cancel
                    </UserActionButton>
                    <UserActionButton
                        actionVariant="gold"
                        onClick={handleOpenConfirmModal}
                        disabled={hasPendingWithdrawal || !coinAmount || !paymentChannel || !walletAddress || parseFloat(coinAmount) <= 0 || parseFloat(coinAmount) > withdrawableAmount || submitting}
                    >
                        Continue
                    </UserActionButton>
                </DialogActions>
            </Dialog>

            <Dialog open={openConfirmModal} onClose={handleCloseConfirmModal} maxWidth="sm" fullWidth PaperProps={{ sx: userGlassDialogPaperSx }}>
                <DialogTitle sx={{ color: USER_COLORS.textPrimary }}>Confirm Withdrawal</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3}>
                        <UserGlassCard sx={{ p: 2, bgcolor: alpha('#000000', 0.35) }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box component="img" src="/assets/images/currency.webp" alt="Currency" sx={{ width: 20, height: 20 }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Withdraw Amount
                                    </Typography>
                                </Stack>
                                <Typography variant="h6" fontWeight={700}>
                                    {coinAmount} BAC
                                </Typography>
                                <Divider />
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Iconify icon="solar:dollar-minimalistic-bold" />
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        You will receive
                                    </Typography>
                                </Stack>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        component="img"
                                        src={`/assets/images/flags/${selectedCurrency.toLowerCase()}.gif`}
                                        alt={`${selectedCurrency} flag`}
                                        sx={{ width: 24, height: 16, borderRadius: 0.5, objectFit: 'cover', border: '1px silver solid' }}
                                    />
                                    <Typography variant="h6" fontWeight={700}>
                                        {fNumber(calculatedAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency}
                                    </Typography>
                                </Box>
                            </Stack>
                        </UserGlassCard>

                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" sx={userMutedTextSx}>
                                    Payment Channel
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {(PAYMENT_META as any)[paymentChannel]?.label || paymentChannel}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Wallet Address
                                </Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>
                                    {walletAddress}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Exchange Rate
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    1 BAC = {fNumber(currentRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha('#ffffff', 0.1)}` }}>
                    <UserActionButton actionVariant="ghost" onClick={handleCloseConfirmModal} disabled={submitting}>
                        Back
                    </UserActionButton>
                    <UserActionButton actionVariant="gold" onClick={handleSubmitWithdrawal} disabled={submitting}>
                        {submitting ? 'Processing...' : 'Confirm & Submit'}
                    </UserActionButton>
                </DialogActions>
            </Dialog>
        </UserPageShell>
    );
}

