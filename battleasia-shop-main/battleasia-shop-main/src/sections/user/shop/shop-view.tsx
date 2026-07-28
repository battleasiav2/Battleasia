import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Stack,
  Dialog,
  Divider,
  Skeleton,
  MenuItem,
  Backdrop,
  TextField,
  Typography,
  DialogTitle,
  Grid2 as Grid,
  DialogContent,
  DialogActions,
  Grid as MuiGrid,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import {
  UserPageShell,
  UserGlassCard,
  UserActionButton,
  UserStatTile,
  UserEmptyState,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { Image } from 'src/components/image';
import useApi from 'src/hooks/use-api';
import { Iconify } from 'src/components/iconify';
import { useSelector } from 'src/store';
import { toast } from 'react-hot-toast';
import { fNumber } from 'src/utils/format-number';
import { useTranslate } from 'src/locales/use-locales';

import { ShopHero } from './shop-hero';
import {
  resolveShopCoinImage,
  resolvePaymentChannelIcon,
  resolveShopFlagImage,
} from './shop-constants';
import {
  SHOP_DIALOG_PAPER_SX,
  SHOP_DIALOG_TITLE_SX,
  SHOP_DIALOG_CONTENT_SX,
  SHOP_FIELD_SX,
  SHOP_FIELD_LABEL_PROPS,
  SHOP_FILTER_FIELD_SX,
  SHOP_SELECT_MENU_PROPS,
  SHOP_BODY_TEXT_SX,
  SHOP_LABEL_TEXT_SX,
} from './shop-styles';

// Badge color mapping (legacy — chips now use gold glass styling)

type ShopItem = {
    amount: number;
    price: number;
    originalPrice: number;
    originalPriceBeforeDiscount?: number; // Original price before premium discount
    discountPercent: number;
    premiumDiscount?: number; // Premium discount percentage (0-100)
    isPremiumUser?: boolean; // Whether current user is premium
    badge: string | null;
    badgeColor: 'default' | 'success' | 'primary' | 'secondary' | 'error' | 'info' | 'warning';
    symbol: string;
    image: string;
    isActive?: boolean;
};

type CurrencyRate = {
    id: string;
    region: string;
    currency: string;
    rate: number;
    originalRate?: number; // Original rate before premium discount
    premiumDiscount?: number; // Premium discount percentage
    isPremiumUser?: boolean; // Whether current user is premium
    createdAt: string;
    updatedAt: string;
};

type PaymentChannel = {
    _id: string;
    channel_name: string;
    icon: string;
    enabled: boolean;
    description?: string;
};

export function ShopView() {
    const api = useApi();
    const { t } = useTranslate();
    const tokens = getDefaultGlassTokens();
    const { balance } = useSelector((state) => state.auth);
    const playerEmail = useSelector((state) => state.auth.user?.email || '');
    const username = useSelector((state) => state.auth.user?.username || '');

    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
    const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
    const [loading, setLoading] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<string>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'expired'>('idle');
    const [paymentRef, setPaymentRef] = useState<string>('');
    const [paymentExpiryAt, setPaymentExpiryAt] = useState<number | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('bdt');
    const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<any>(null);
    const [transactionId, setTransactionId] = useState<string>('');
    const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
    const [paymentAmount, setPaymentAmount] = useState<number>(0); // Store the actual payment amount (with discount)
    const [fromAddress, setFromAddress] = useState<string>('');

    const fetchPaymentChannels = async () => {
        try {
            const res = await api.getPaymentChannelsApi({ limit: 100 });
            const channels = res?.data?.data?.results || [];
            const enabledChannels = channels.filter((ch: PaymentChannel) => ch.enabled);
            setPaymentChannels(enabledChannels);
            // Set default payment method to first enabled channel
            if (enabledChannels.length > 0) {
                setPaymentMethod(enabledChannels[0].channel_name.toLowerCase());
            }
        } catch (error) {
            console.error('Failed to load payment channels:', error);
            // Don't show error toast, just use empty array
            setPaymentChannels([]);
        }
    };

    const fetchCurrencyRates = async () => {
        try {
            setLoading(true);
            const res = await api.getCurrencyRatesApi();
            setCurrencyRates(res?.data?.data || []);
        } catch {
            toast.error(t('shop.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await api.listShopItemsApi();
            setShopItems(res?.data?.data?.results || []);
        } catch {
            toast.error(t('shop.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentChannels();
        fetchOffers();
        fetchCurrencyRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredShopItems = useMemo(
        () =>
            shopItems.filter((shopItem) => {
                const withinMin = minPrice ? shopItem.price >= Number(minPrice) : true;
                const withinMax = maxPrice ? shopItem.price <= Number(maxPrice) : true;
                return withinMin && withinMax;
            }),
        [shopItems, minPrice, maxPrice]
    );

    const handleOpenModal = (item: ShopItem) => {
        setSelectedItem(item);
        if (paymentFilter && paymentChannels.find(ch => ch.channel_name.toLowerCase() === paymentFilter.toLowerCase())) {
            setPaymentMethod(paymentFilter);
        } else if (paymentChannels.length > 0) {
            setPaymentMethod(paymentChannels[0].channel_name.toLowerCase());
        }
        // Reset to default currency (BDT)
        setSelectedCurrency('bdt');
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleConfirmPurchase = async () => {
        if (!selectedItem) return;
        
        const selectedChannel = paymentChannels.find(
            ch => ch.channel_name.toLowerCase() === paymentMethod.toLowerCase()
        );
        
        if (!selectedChannel) {
            toast.error('Please select a payment channel');
            return;
        }

        try {
            setSubmitting(true);
            
            // Fetch wallets for the selected channel and currency
            const res = await api.getBusinessWalletsApi({
                limit: 100,
                channel: selectedChannel._id,
                currency: selectedCurrency.toUpperCase()
            });
            
            const wallets = res?.data?.data?.results || [];
            
            if (wallets.length === 0) {
                toast.error(`No ${selectedCurrency.toUpperCase()} wallet available for ${selectedChannel.channel_name}`);
                return;
            }
            
            // Randomly select a wallet
            const randomWallet = wallets[Math.floor(Math.random() * wallets.length)];
            setSelectedWallet({
                ...randomWallet,
                channelIcon: resolvePaymentChannelIcon(selectedChannel.channel_name, selectedChannel.icon),
                channelName: selectedChannel.channel_name
            });
            
            // Store the purchase amount (coin amount)
            setPurchaseAmount(selectedItem.amount);
            
            // Calculate the payment amount (with discount if applicable)
            const rate = currencyRates.find(
                r => r.currency?.toLowerCase() === selectedCurrency.toLowerCase()
            )?.rate || 0;
            
            let totalAmount = rate * selectedItem.amount;
            
            // Apply discount if user is premium and item has discount
            const itemHasDiscount = selectedItem.discountPercent > 0;
            const isPremiumUser = selectedItem.isPremiumUser === true;
            if (itemHasDiscount && isPremiumUser) {
                totalAmount = totalAmount * (1 - selectedItem.discountPercent / 100);
            }
            
            setPaymentAmount(totalAmount);
            
            // Close the first modal and open payment details modal
            setSelectedItem(null);
            setShowPaymentDetailsModal(true);
            
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
            toast.error('Failed to get payment details');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        let timer: any;
        const poll = async () => {
            if (!paymentRef) return;
            try {
                const res = await api.getCoingoCollectionStatusApi(paymentRef);
                const status = res?.data?.data?.status;
                if (status === 'success' || status === 'failed' || status === 'cancelled') {
                    setPaymentStatus(status === 'success' ? 'success' : 'failed');
                    setPaymentRef('');
                    setPaymentExpiryAt(null);
                    if (status === 'success') {
                        toast.success('Payment confirmed');
                    } else {
                        toast.error('Payment not completed');
                    }
                    return;
                }
            } catch {
                // silent retry
            }
            timer = setTimeout(poll, 4000);
        };
        poll();
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [api, paymentRef]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        if (paymentStatus === 'pending' && paymentExpiryAt) {
            const remaining = paymentExpiryAt - Date.now();
            if (remaining <= 0) {
                setPaymentStatus('expired');
                setPaymentRef('');
                setPaymentExpiryAt(null);
            } else {
                timer = setTimeout(() => {
                    setPaymentStatus('expired');
                    setPaymentRef('');
                    setPaymentExpiryAt(null);
                }, remaining);
            }
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [paymentStatus, paymentExpiryAt]);

    const findRateForMethod = (method: string) => {
        const rates = Array.isArray(currencyRates) ? currencyRates : [];
        const lookup = (code: string) =>
            rates.find(
                (rate) =>
                    rate.currency?.toLowerCase() === code.toLowerCase() || rate.region?.toLowerCase() === code.toLowerCase()
            )?.rate;

        const isCrypto = paymentChannels.find(ch => ch.channel_name.toLowerCase() === method.toLowerCase())?.channel_name.toLowerCase().includes('crypto');
        if (isCrypto) return lookup('usd') ?? rates[0]?.rate ?? selectedItem?.price ?? 0;

        // Mobile wallets: prefer BDT, then INR, then PKR
        return (
            lookup('bdt') ??
            lookup('inr') ??
            lookup('pkr') ??
            rates[0]?.rate ??
            selectedItem?.price ??
            0
        );
    };

    const selectedRate = findRateForMethod(paymentMethod);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const coinPrice = currencyRates[0]?.rate ?? selectedItem?.price ?? selectedRate ?? 0;
    const estimatedTotal = selectedItem ? selectedRate * selectedItem.amount : 0;

    const isCryptoMethod = paymentChannels.find(ch => ch.channel_name.toLowerCase() === paymentMethod.toLowerCase())?.channel_name.toLowerCase().includes('crypto');
    const walletTotals =
        selectedItem && !isCryptoMethod
            ? ['bdt', 'inr', 'pkr'].map((code) => {
                  const rate =
                      currencyRates.find(
                          (r) => r.currency?.toLowerCase() === code || r.region?.toLowerCase() === code
                      )?.rate ?? null;
                  return {
                      code: code.toUpperCase(),
                      rate,
                      total: rate ? rate * selectedItem.amount : null,
                  };
              })
            : [];

    const currencyLabel = () => {
        if (isCryptoMethod) return 'USD';
        if (currencyRates.find((r) => r.currency.toLowerCase() === 'bdt')) return 'BDT';
        if (currencyRates.find((r) => r.currency.toLowerCase() === 'inr')) return 'INR';
        if (currencyRates.find((r) => r.currency.toLowerCase() === 'pkr')) return 'PKR';
        return currencyRates[0]?.currency ?? 'USD';
    };

    const handleTransactionSubmit = async () => {
        if (!fromAddress.trim()) {
            toast.error('Please enter the address you sent from');
            return;
        }
        if (!transactionId.trim()) {
            toast.error('Please enter the transaction identifier');
            return;
        }
        
        if (!selectedWallet) {
            toast.error('Payment details not found');
            return;
        }
        
        try {
            setSubmitting(true);
            
            // Get selected channel
            const selectedChannel = paymentChannels.find(
                ch => ch.channel_name.toLowerCase() === selectedWallet.channelName.toLowerCase()
            );
            
            if (!selectedChannel) {
                toast.error('Payment channel not found');
                return;
            }
            
            // Submit deposit record (use pre-calculated paymentAmount which includes discount)
            await api.submitDepositApi({
                user_email: playerEmail,
                username: username || playerEmail,
                transaction_id: transactionId.trim(),
                coin_amount: purchaseAmount,
                payment_currency: selectedCurrency.toUpperCase(),
                payment_amount: paymentAmount,
                from_address: fromAddress.trim(),
                payment_channel: selectedChannel._id,
                to_wallet_address: selectedWallet.wallet_address,
            });
            
            toast.success('Deposit submitted successfully! Waiting for admin approval...');
            setShowPaymentDetailsModal(false);
            setFromAddress('');
            setTransactionId('');
            setSelectedWallet(null);
        } catch (error: any) {
            // Axios interceptor already shows toast for 400, 401, 413, 429 errors
            // Only show toast for other errors that weren't handled by interceptor
            const status = error?.response?.status;
            if (status !== 400 && status !== 401 && status !== 413 && status !== 429) {
                const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit deposit';
                toast.error(errorMessage);
            }
            // If status is 400/401/413/429, interceptor already showed the toast, so we do nothing here
        } finally {
            setSubmitting(false);
        }
    };

    const resolveItemImage = (image?: string) => resolveShopCoinImage(image);

    const handleClosePaymentDetails = () => {
        setShowPaymentDetailsModal(false);
        setFromAddress('');
        setTransactionId('');
        setSelectedWallet(null);
        setPurchaseAmount(0);
        setPaymentAmount(0);
    };


    return (
        <UserPageShell>
            <ShopHero />

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 6, md: 4 }}>
                    <UserStatTile icon="solar:wallet-money-bold" label={t('shop.yourBalance')} value={fNumber(balance ?? 0)} suffix="BAC" />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                    <UserStatTile icon="solar:bag-check-bold" label={t('shop.coinPacks')} value={filteredShopItems.length} suffix={t('shop.available')} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <UserStatTile icon="solar:card-transfer-bold" label={t('shop.paymentChannels')} value={paymentChannels.length} suffix={t('shop.active')} />
                </Grid>
            </Grid>

            <Grid container spacing={2.5}>
                        {/* Filters */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <UserGlassCard sx={{ p: 2, position: { md: 'sticky' }, top: { md: 120 } }}>
                                <Typography className="font-tr" sx={{ mb: 1, fontSize: 13, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: USER_COLORS.gold }}>
                                    {t('shop.payment')}
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    label={t('shop.choosePayment')}
                                    value={paymentFilter}
                                    onChange={(e) => {setPaymentFilter(e.target.value); setPaymentMethod(e.target.value)}}
                                    InputLabelProps={SHOP_FIELD_LABEL_PROPS}
                                    sx={{ mb: 2, ...SHOP_FILTER_FIELD_SX }}
                                    SelectProps={{ MenuProps: SHOP_SELECT_MENU_PROPS }}
                                >
                                    {paymentChannels.length === 0 ? (
                                        <MenuItem value="" disabled>
                                            No payment channels
                                        </MenuItem>
                                    ) : (
                                    paymentChannels.map((channel) => (
                                        <MenuItem
                                            key={channel._id}
                                            value={channel.channel_name.toLowerCase()}
                                            sx={{ textTransform: 'capitalize' }}
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box
                                                    component="img"
                                                    src={resolvePaymentChannelIcon(channel.channel_name, channel.icon)}
                                                    alt={channel.channel_name}
                                                    sx={{
                                                        width: 48,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ color: USER_COLORS.textPrimary }}>
                                                    {channel.channel_name}
                                                </Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))
                                    )}
                                </TextField>

                                <Typography className="font-tr" sx={{ mb: 1, fontSize: 13, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: USER_COLORS.gold }}>
                                    {t('shop.priceRange')}
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                    <TextField
                                        label={t('shop.min')}
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        InputLabelProps={SHOP_FIELD_LABEL_PROPS}
                                        sx={SHOP_FILTER_FIELD_SX}
                                    />
                                    <TextField
                                        label={t('shop.max')}
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        InputLabelProps={SHOP_FIELD_LABEL_PROPS}
                                        sx={SHOP_FILTER_FIELD_SX}
                                    />
                                </Stack>
                                <UserActionButton
                                    actionVariant="ghost"
                                    size="small"
                                    sx={{ mt: 2 }}
                                    onClick={() => {
                                        setPaymentFilter('');
                                        setMinPrice('');
                                        setMaxPrice('');
                                    }}
                                >
                                    Clear
                                </UserActionButton>
                            </UserGlassCard>
                        </Grid>

                        {/* Offers */}
                        <Grid size={{ xs: 12, md: 9 }}>
                            {loading ? (
                                <Grid container spacing={3}>
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <UserGlassCard sx={{ p: 2 }}>
                                                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1, mb: 2, bgcolor: alpha('#ffffff', 0.06) }} />
                                                <Skeleton variant="text" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
                                                <Skeleton variant="text" width="60%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
                                            </UserGlassCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : filteredShopItems.length === 0 ? (
                                <UserEmptyState
                                    icon="solar:bag-smile-bold-duotone"
                                    title={t('shop.noOffers')}
                                    description="Try clearing your filters or check back later for new offers."
                                    actionLabel="Clear filters"
                                    onAction={() => {
                                        setPaymentFilter('');
                                        setMinPrice('');
                                        setMaxPrice('');
                                    }}
                                />
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredShopItems.map((shopItem) => (
                                        <Grid key={`${shopItem.amount}-${shopItem.symbol}`} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <UserGlassCard
                                                sx={{
                                                    p: 2,
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1.5,
                                                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: alpha(USER_COLORS.gold, 0.35),
                                                        transform: 'translateY(-2px)',
                                                    },
                                                }}
                                            >
                                                {shopItem.badge && (
                                                    <Chip
                                                        label={shopItem.badge}
                                                        size="small"
                                                        sx={{
                                                            alignSelf: 'flex-start',
                                                            visibility: shopItem.badge.toLowerCase() !== 'none' ? 'visible' : 'hidden',
                                                            bgcolor: alpha(USER_COLORS.gold, 0.16),
                                                            color: `${USER_COLORS.gold} !important`,
                                                            border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}`,
                                                            fontWeight: 700,
                                                            '& .MuiChip-label': {
                                                              color: `${USER_COLORS.gold} !important`,
                                                              fontWeight: 700,
                                                            },
                                                        }}
                                                    />
                                                )}
                                                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }} spacing={1}>
                                                     <Image draggable="false" src={resolveItemImage(shopItem.image)} alt="BAC coins" ratio="1/1" sx={{ borderRadius: 1, width: 120, height: 120, objectFit: 'contain', mx: 'auto' }} />
                                                </Stack>

                                                <Typography className="font-tr" sx={{ fontSize: 18, fontWeight: 800, color: USER_COLORS.textPrimary }}>
                                                    {shopItem.amount} {shopItem.symbol}
                                                </Typography>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: USER_COLORS.gold }}>
                                                        ${Number(shopItem.price).toFixed(2)}
                                                    </Typography>
                                                    {shopItem.discountPercent > 0 && (
                                                        <Typography sx={{ ...userMutedTextSx, textDecoration: 'line-through' }}>
                                                            {Number(shopItem.originalPrice).toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                                {shopItem.discountPercent > 0 && (
                                                    <Chip
                                                        label={`-${shopItem.discountPercent}% premium`}
                                                        size="small"
                                                        sx={{
                                                            alignSelf: 'flex-start',
                                                            bgcolor: alpha(USER_COLORS.gold, 0.16),
                                                            color: `${USER_COLORS.gold} !important`,
                                                            fontWeight: 700,
                                                            border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}`,
                                                            '& .MuiChip-label': {
                                                              color: `${USER_COLORS.gold} !important`,
                                                              fontWeight: 700,
                                                            },
                                                        }}
                                                    />
                                                )}
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
                                                    <UserActionButton size="small" actionVariant="gold" onClick={() => handleOpenModal(shopItem)}>
                                                        {t('shop.buy')}
                                                    </UserActionButton>
                                                </Stack>
                                            </UserGlassCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

            <Dialog open={!!selectedItem} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: SHOP_DIALOG_PAPER_SX }}>
                <DialogTitle sx={SHOP_DIALOG_TITLE_SX}>Security Payment</DialogTitle>
                <DialogContent dividers sx={SHOP_DIALOG_CONTENT_SX}>
                    {selectedItem && (
                        <MuiGrid container spacing={3}>
                            <MuiGrid item xs={12} md={7}>
                                <Stack spacing={2}>
                                    <UserGlassCard sx={{ p: 2, bgcolor: alpha('#000000', 0.35) }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:user-outline" sx={{ color: USER_COLORS.gold }} />
                                                <Typography sx={SHOP_LABEL_TEXT_SX}>
                                                    Player Email
                                                </Typography>
                                            </Stack>
                                            <Typography sx={SHOP_BODY_TEXT_SX}>{playerEmail || '—'}</Typography>
                                            <Divider />
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon="solar:ticket-outline" sx={{ color: USER_COLORS.gold }} />
                                                <Typography sx={SHOP_LABEL_TEXT_SX}>
                                                    Coupon
                                                </Typography>
                                            </Stack>
                                            <Typography sx={SHOP_LABEL_TEXT_SX}>
                                                No available coupon
                                            </Typography>
                                        </Stack>
                                    </UserGlassCard>

                                    <Stack spacing={1}>
                                        <Typography sx={SHOP_BODY_TEXT_SX}>Select payment channels</Typography>
                                        <Stack spacing={1}>
                                            {paymentChannels.map((channel) => {
                                                const isSelected = paymentMethod === channel.channel_name.toLowerCase();
                                                return (
                                                    <UserGlassCard
                                                        key={channel._id}
                                                        onClick={() => setPaymentMethod(channel.channel_name.toLowerCase())}
                                                        sx={{
                                                            p: 1.5,
                                                            cursor: 'pointer',
                                                            borderColor: isSelected ? alpha(USER_COLORS.gold, 0.55) : alpha('#ffffff', 0.12),
                                                            bgcolor: isSelected ? alpha(USER_COLORS.gold, 0.08) : alpha('#000000', 0.35),
                                                            transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                                        }}
                                                    >
                                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                                            <Box
                                                                component="img"
                                                                src={resolvePaymentChannelIcon(channel.channel_name, channel.icon)}
                                                                alt={channel.channel_name}
                                                                sx={{
                                                                    width: 64,
                                                                    height: 44,
                                                                    borderRadius: 1,
                                                                    objectFit: 'contain',
                                                                }}
                                                            />
                                                            <Stack spacing={0.25}>
                                                                <Typography sx={{ color: USER_COLORS.textPrimary }}>{channel.channel_name}</Typography>
                                                                {channel.description ? (
                                                                    <Typography variant="caption" sx={userMutedTextSx}>
                                                                        {channel.description}
                                                                    </Typography>
                                                                ) : null}
                                                            </Stack>
                                                        </Stack>
                                                    </UserGlassCard>
                                                );
                                            })}
                                        </Stack>
                                    </Stack>

                                </Stack>
                            </MuiGrid>

                            <MuiGrid item xs={12} md={5}>
                                <UserGlassCard sx={{ p: 2, height: '100%' }}>
                                    <Stack spacing={2}>
                                        <Typography className="font-tr" sx={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: USER_COLORS.gold }}>
                                            Order summary
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Image draggable="false" src={resolveItemImage(selectedItem.image)} alt="Coin" sx={{ width: 72, height: 72, borderRadius: 1, objectFit: 'contain' }} />
                                            <Stack spacing={0.5}>
                                                <Typography sx={SHOP_LABEL_TEXT_SX}>Coins</Typography>
                                                <Typography sx={SHOP_BODY_TEXT_SX}>{selectedItem.amount}</Typography>
                                            </Stack>
                                        </Stack>
                                        <Divider />
                                        <Stack direction="column" justifyContent="space-between">
                                            <Typography sx={SHOP_BODY_TEXT_SX}>Rates</Typography>
                                            <UserGlassCard sx={{ p: 1.5, width: '100%', bgcolor: alpha('#000000', 0.35) }}>
                                                {isCryptoMethod ? (
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Box
                                                                component="img"
                                                                src={resolveShopFlagImage('usd')}
                                                                alt="USD flag"
                                                                sx={{ width: 20, height: 14, borderRadius: 0.5, objectFit: 'cover' }}
                                                            />
                                                            <Typography sx={{ ...SHOP_BODY_TEXT_SX, fontSize: 14 }}>USD</Typography>
                                                        </Stack>
                                                        <Typography sx={{ ...SHOP_LABEL_TEXT_SX, fontSize: 14 }}>
                                                            {findRateForMethod(paymentMethod) ? findRateForMethod(paymentMethod).toFixed(2) : '—'} per coin
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    ['bdt', 'inr', 'pkr'].map((code) => {
                                                        const rate =
                                                            currencyRates.find(
                                                                (r) =>
                                                                    r.currency?.toLowerCase() === code || r.region?.toLowerCase() === code
                                                            )?.rate ?? null;
                                                        return (
                                                            <Stack key={code} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.25 }}>
                                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                                    <Box
                                                                        component="img"
                                                                        src={resolveShopFlagImage(code)}
                                                                        alt={`${code.toUpperCase()} flag`}
                                                                        sx={{ width: 20, height: 14, borderRadius: 0.5, objectFit: 'cover', border:'1px silver solid' }}
                                                                    />
                                                                    <Typography sx={{ ...SHOP_BODY_TEXT_SX, fontSize: 14 }}>{code.toUpperCase()}</Typography>
                                                                </Stack>
                                                                <Typography sx={{ ...SHOP_LABEL_TEXT_SX, fontSize: 14 }}>{rate ? rate.toFixed(2) : '—'} per coin</Typography>
                                                            </Stack>
                                                        );
                                                    })
                                                )}
                                            </UserGlassCard>
                                        </Stack>
                                       
                                        {/* <TextField
                                            fullWidth
                                            label="Wallet number"
                                            value={walletNumber}
                                            onChange={(e) => setWalletNumber(e.target.value)}
                                            placeholder={paymentMethod === 'bkash' ? '01XXXXXXXXX' : '01XXXXXXXXX'}
                                        /> */}
                                        {isCryptoMethod ? (
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography sx={SHOP_BODY_TEXT_SX}>
                                                        Total
                                                    </Typography>
                                                    <Stack alignItems="flex-end" spacing={0.5}>
                                                        {(() => {
                                                            // Check if THIS SPECIFIC ITEM has discount for premium users
                                                            const itemHasDiscount = selectedItem.discountPercent > 0;
                                                            const isPremiumUser = selectedItem.isPremiumUser === true;
                                                            const shouldShowDiscount = itemHasDiscount && isPremiumUser;
                                                            
                                                            if (shouldShowDiscount && estimatedTotal) {
                                                                // Original total (without discount)
                                                                const originalTotal = estimatedTotal;
                                                                // Apply discount percentage
                                                                const discountedTotal = originalTotal * (1 - selectedItem.discountPercent / 100);
                                                                
                                                                return (
                                                                    <>
                                                                        <Typography 
                                                                            sx={{ 
                                                                                ...userMutedTextSx,
                                                                                textDecoration: 'line-through' 
                                                                            }}
                                                                        >
                                                                            {currencyLabel()} {originalTotal.toFixed(2)}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: USER_COLORS.gold }}>
                                                                            {currencyLabel()} {discountedTotal.toFixed(2)}
                                                                        </Typography>
                                                                        <Chip 
                                                                            label={`-${selectedItem.discountPercent}% Premium Discount`} 
                                                                            size="small"
                                                                            sx={{
                                                                              height: 22,
                                                                              fontSize: '0.7rem',
                                                                              fontWeight: 700,
                                                                              bgcolor: alpha(USER_COLORS.gold, 0.16),
                                                                              color: `${USER_COLORS.gold} !important`,
                                                                              border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}`,
                                                                              '& .MuiChip-label': {
                                                                                color: `${USER_COLORS.gold} !important`,
                                                                                fontWeight: 700,
                                                                              },
                                                                            }}
                                                                        />
                                                                    </>
                                                                );
                                                            }
                                                            
                                                            // Non-premium user or item without discount
                                                            return (
                                                                <Typography sx={{ fontSize: 20, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                                                                    {estimatedTotal ? `${currencyLabel()} ${estimatedTotal.toFixed(2)}` : selectedItem.price}
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        ) : (
                                            <Stack spacing={1.5}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    label="Currency"
                                                    value={selectedCurrency}
                                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                                    InputLabelProps={SHOP_FIELD_LABEL_PROPS}
                                                    SelectProps={{
                                                        MenuProps: SHOP_SELECT_MENU_PROPS,
                                                    }}
                                                    sx={SHOP_FIELD_SX}
                                                >
                                                    {walletTotals.map(({ code, rate }) => (
                                                        <MenuItem key={code} value={code.toLowerCase()}>
                                                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                                                                <Box
                                                                    component="img"
                                                                    src={resolveShopFlagImage(code.toLowerCase())}
                                                                    alt={`${code} flag`}
                                                                    sx={{ width: 20, height: 14, borderRadius: 0.5, objectFit: 'cover', border:'1px silver solid' }}
                                                                />
                                                                <Typography sx={{ ...SHOP_BODY_TEXT_SX, fontSize: 14 }}>{code}</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                <Divider />
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography sx={SHOP_BODY_TEXT_SX}>
                                                        Total
                                                    </Typography>
                                                    <Stack alignItems="flex-end" spacing={0.5}>
                                                        {(() => {
                                                            const selectedTotal = walletTotals.find(
                                                                ({ code }) => code.toLowerCase() === selectedCurrency
                                                            );
                                                            
                                                            // Check if THIS SPECIFIC ITEM has discount for premium users
                                                            const itemHasDiscount = selectedItem.discountPercent > 0;
                                                            const isPremiumUser = selectedItem.isPremiumUser === true;
                                                            const shouldShowDiscount = itemHasDiscount && isPremiumUser;

                                                            if (shouldShowDiscount && selectedTotal?.total) {
                                                                const originalTotal = selectedTotal.total;
                                                                const discountedTotal = originalTotal * (1 - selectedItem.discountPercent / 100);

                                                                return (
                                                                    <>
                                                                        <Typography 
                                                                            sx={{ 
                                                                                ...userMutedTextSx,
                                                                                textDecoration: 'line-through' 
                                                                            }}
                                                                        >
                                                                            {selectedTotal.code} {originalTotal.toFixed(2)}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: USER_COLORS.gold }}>
                                                                            {selectedTotal.code} {discountedTotal.toFixed(2)}
                                                                        </Typography>
                                                                        <Chip 
                                                                            label={`-${selectedItem.discountPercent}% Premium Discount`} 
                                                                            size="small"
                                                                            sx={{
                                                                              height: 22,
                                                                              fontSize: '0.7rem',
                                                                              fontWeight: 700,
                                                                              bgcolor: alpha(USER_COLORS.gold, 0.16),
                                                                              color: `${USER_COLORS.gold} !important`,
                                                                              border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}`,
                                                                              '& .MuiChip-label': {
                                                                                color: `${USER_COLORS.gold} !important`,
                                                                                fontWeight: 700,
                                                                              },
                                                                            }}
                                                                        />
                                                                    </>
                                                                );
                                                            }

                                                            return (
                                                                <Typography sx={{ fontSize: 20, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                                                                    {selectedTotal?.total
                                                                        ? `${selectedTotal.code} ${selectedTotal.total.toFixed(2)}`
                                                                        : '—'}
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        )}
                                    </Stack>
                                </UserGlassCard>
                            </MuiGrid>
                        </MuiGrid>
                    )}
                </DialogContent>
                {/* red text color for some text  */}
                {/* <Stack direction="row" justifyContent="flex-end" px={2} alignItems="center">
                    <Typography variant="body2" color="error">
                        Payments can only be made in Bangladeshi Taka (BDT).
                    </Typography>
                </Stack> */}
                <DialogActions sx={{ borderTop: `1px solid ${alpha('#ffffff', 0.1)}`, px: 2, py: 1.5 }}>
                    <UserActionButton actionVariant="ghost" onClick={handleCloseModal} disabled={submitting}>
                        Cancel
                    </UserActionButton>
                    <UserActionButton actionVariant="gold" onClick={handleConfirmPurchase} disabled={submitting || !selectedItem}>
                        Confirm & Pay
                    </UserActionButton>
                </DialogActions>
            </Dialog>

            {/* Payment Details Modal */}
            <Dialog
                open={showPaymentDetailsModal}
                onClose={handleClosePaymentDetails}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: SHOP_DIALOG_PAPER_SX }}
            >
                <DialogTitle sx={SHOP_DIALOG_TITLE_SX}>Payment Details</DialogTitle>
                <DialogContent dividers sx={SHOP_DIALOG_CONTENT_SX}>
                    {selectedWallet && (
                        <Stack spacing={3} alignItems="center">
                            {/* Payment Channel Icon */}
                            <Box
                                component="img"
                                src={selectedWallet.channelIcon}
                                alt={selectedWallet.channelName}
                                sx={{
                                    width: 120,
                                    height: 60,
                                    borderRadius: 2,
                                    objectFit: 'contain',
                                }}
                            />


                            {/* QR Code — full width, top, as large as possible */}
                            {selectedWallet.qr_code && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        width: '100%',
                                    }}
                                >
                                    <Typography sx={{ ...SHOP_LABEL_TEXT_SX, fontSize: 12 }}>
                                        Scan QR Code
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            bgcolor: '#fff',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'inline-flex',
                                        }}
                                    >
                                        <img
                                            src={selectedWallet.qr_code}
                                            alt={`QR Code for ${selectedWallet.wallet_address}`}
                                            style={{ width: 240, height: 240, display: 'block' }}
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Amount & Wallet Address — side by side, compact */}
                            <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                                <Box sx={getGlassInnerSx(tokens, { flex: 1, p: 1.5 })}>
                                    <Typography sx={{ ...userMutedTextSx, fontSize: 11, display: 'block', mb: 0.5 }}>
                                        Amount
                                    </Typography>
                                    <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 700 }}>
                                        {paymentAmount.toFixed(2)} {selectedCurrency.toUpperCase()}
                                    </Typography>
                                </Box>

                                <Box sx={getGlassInnerSx(tokens, { flex: 1, p: 1.5, minWidth: 0 })}>
                                    <Typography sx={{ ...userMutedTextSx, fontSize: 11, display: 'block', mb: 0.5 }}>
                                        Wallet Address
                                    </Typography>
                                    <Typography sx={{ color: USER_COLORS.textPrimary, fontWeight: 600, wordBreak: 'break-all' }}>
                                        {selectedWallet.wallet_address}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Payment Description */}
                            <UserGlassCard sx={{ width: '100%', p: 2, bgcolor: alpha(USER_COLORS.info, 0.08), borderColor: alpha(USER_COLORS.info, 0.25) }}>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: USER_COLORS.info, mt: 0.25 }} />
                                        <Typography sx={userMutedTextSx}>
                                            Please send the specified amount to the wallet address listed above.
                                            After completing the payment, enter the transaction identifier in the field below
                                            and click the Confirm button to complete your purchase.
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </UserGlassCard>

                            {/* From Address Input */}
                            <TextField
                                fullWidth
                                label="From Address"
                                placeholder="Enter the address you sent from"
                                value={fromAddress}
                                onChange={(e) => setFromAddress(e.target.value)}
                                helperText="Please enter the wallet address you used to send the payment"
                                InputLabelProps={SHOP_FIELD_LABEL_PROPS}
                                sx={SHOP_FIELD_SX}
                            />

                            {/* Transaction ID Input */}
                            <TextField
                                fullWidth
                                label="Transaction Identifier"
                                placeholder="Enter your transaction ID"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                helperText="Please enter the transaction ID from your payment"
                                InputLabelProps={SHOP_FIELD_LABEL_PROPS}
                                sx={SHOP_FIELD_SX}
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: `1px solid ${alpha('#ffffff', 0.1)}`, px: 2, py: 1.5 }}>
                    <UserActionButton actionVariant="ghost" onClick={handleClosePaymentDetails} disabled={submitting}>
                        Cancel
                    </UserActionButton>
                    <UserActionButton
                        actionVariant="gold"
                        onClick={handleTransactionSubmit}
                        disabled={submitting || !fromAddress.trim() || !transactionId.trim()}
                    >
                        {submitting ? 'Confirming...' : 'Confirm'}
                    </UserActionButton>
                </DialogActions>
            </Dialog>

            <Backdrop
                open={paymentStatus === 'pending' || paymentStatus === 'expired'}
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 2 }}
            >
                <Stack
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        bgcolor: 'rgba(0,0,0,0.85)',
                        px: 3,
                        py: 2.5,
                        borderRadius: 2,
                        boxShadow: 6,
                        minWidth: 280,
                    }}
                >
                    {paymentStatus === 'pending' ? (
                        <CircularProgress color="inherit" size={28} />
                    ) : (
                        <Iconify icon="solar:close-circle-bold" width={28} height={28} color="error.main" />
                    )}
                    <Typography sx={{ color: USER_COLORS.textPrimary, fontSize: 14 }}>
                        {paymentStatus === 'expired'
                            ? 'Payment expired'
                            : paymentStatus === 'pending'
                            ? 'Payment in progress...'
                            : paymentStatus === 'failed'
                            ? 'Payment not completed'
                            : 'Payment expired'}
                    </Typography>
                    {paymentStatus === 'expired' || paymentStatus === 'failed' ? (
                        <UserActionButton
                            actionVariant="gold"
                            onClick={() => {
                                setPaymentStatus('idle');
                                setPaymentRef('');
                                setPaymentExpiryAt(null);
                            }}
                            sx={{ px: 3 }}
                        >
                            Close
                        </UserActionButton>
                    ) : null}
                </Stack>
            </Backdrop>
        </UserPageShell>
    );
}

