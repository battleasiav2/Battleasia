import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Switch,
    FormControlLabel,
    MenuItem,
    Typography,
    Grid,
    Chip,
    Card,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useApi from 'src/hooks/use-api';
import { useFileUpload } from 'src/hooks/use-file-upload';
// components
import FormProvider, { RHFTextField, RHFUploadAvatar, RHFSelect } from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { ICoinRate, IShopItemRow } from 'src/types';
import { API_URL } from 'src/config-global';
import { listCoinRatesApi } from 'src/contexts/api/shop';

// ----------------------------------------------------------------------

const PAYMENT_OPTIONS: IShopItemRow['paymentOptions'] = ['bkash', 'nagad', 'crypto'];
const BADGE_OPTIONS: IShopItemRow['badge'][] = ['Popular', 'New', 'Hot', 'Best', 'None'];
const BADGE_STYLE: Record<IShopItemRow['badge'], { color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'; sx?: any }> = {
    Popular: { color: 'primary' },
    New: { color: 'info' },
    Hot: { color: 'warning' },
    Best: { color: 'secondary' },
    None: { color: 'default', sx: { bgcolor: '#9e9e9e', color: 'common.white' } }, // iron-like grey
};

export const ShopItemSchema = Yup.object().shape({
    image: Yup.mixed<string | File>().optional(),
    amount: Yup.number().required('Amount is required').min(1),
    badge: Yup.mixed<IShopItemRow['badge']>()
        .oneOf(['Popular', 'New', 'Hot', 'Best', 'None'])
        .required('Badge is required'),
    price: Yup.number().required('Price is required').min(0),
    originalPrice: Yup.number().required('Original price is required').min(0),
    discountPercent: Yup.number().required('Discount percent is required').min(0),
    symbol: Yup.string().required('Symbol is required'),
    paymentOptions: Yup.array()
        .of(Yup.mixed<'bkash' | 'nagad' | 'crypto'>().oneOf(PAYMENT_OPTIONS))
        .min(1, 'Select at least one payment option'),
    isActive: Yup.boolean().default(true),
});

type ISchemaType = Yup.InferType<typeof ShopItemSchema>;

type DialogMode = 'create' | 'edit';

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    mode?: DialogMode;
    shopItem?: IShopItemRow | null;
    onSuccess?: () => void;
};

export function ShopItemDialog({
    open,
    onClose,
    loading = false,
    mode = 'create',
    shopItem = null,
    onSuccess,
}: Props) {
    const { createShopItemApi, updateShopItemApi } = useApi();
    const isEdit = mode === 'edit' && !!shopItem;
    const [coinRates, setCoinRates] = useState<ICoinRate[]>([]);
    const [loadingRates, setLoadingRates] = useState(false);

    const { uploadFile: uploadAvatarFile, deleteFile: deleteAvatarFile, uploading: uploadingAvatar } = useFileUpload({
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        endpoint: 'api/v1/files/upload',
        fieldName: 'file',
        folder: 'shop',
    });

    const defaultValues: ISchemaType = useMemo(
        () => ({
            image: '',
            amount: 0,
            badge: 'None',
            price: 0,
            originalPrice: 0,
            discountPercent: 0,
            symbol: 'BAC',
            paymentOptions: PAYMENT_OPTIONS,
            isActive: true,
        }),
        []
    );

    const methods = useForm<ISchemaType>({
        resolver: yupResolver(ShopItemSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
        setValue,
        watch,
    } = methods;

    const amount = watch('amount');
    const discountPercent = watch('discountPercent');

    const fetchRates = useCallback(async () => {
        try {
            setLoadingRates(true);
            const response = await listCoinRatesApi();
            if (response?.data?.status && response.data.data) {
                const results = response.data.data.results || response.data.data || [];
                const mapped = results.map((rate: any) => ({
                    id: rate._id || rate.id,
                    _id: rate._id || rate.id,
                    region: rate.region,
                    currency: rate.currency,
                    rate: rate.rate,
                    createdAt: rate.createdAt ? rate.createdAt.toString() : '',
                    updatedAt: rate.updatedAt ? rate.updatedAt.toString() : '',
                })) as ICoinRate[];
                setCoinRates(mapped);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to load coin rates');
        } finally {
            setLoadingRates(false);
        }
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        fetchRates();
        if (isEdit && shopItem) {
            reset({
                image: shopItem.image ? `${API_URL}${shopItem.image}` : '',
                amount: shopItem.amount || 0,
                badge: shopItem.badge || 'None',
                price: shopItem.price || 0,
                originalPrice: shopItem.originalPrice || 0,
                discountPercent: shopItem.discountPercent || 0,
                symbol: shopItem.symbol || 'BAC',
                paymentOptions: shopItem.paymentOptions || PAYMENT_OPTIONS,
                isActive: shopItem.isActive ?? true,
            });
        } else {
            reset(defaultValues);
        }
    }, [defaultValues, fetchRates, isEdit, open, shopItem, reset]);

    useEffect(() => {
        const baseRate = coinRates.find((r) => r.region === 'global') || coinRates[0];
        const base = baseRate ? amount * (baseRate.rate || 0) : 0;
        const finalPrice = base * (1 - discountPercent / 100);
        setValue('originalPrice', base, { shouldValidate: true });
        setValue('price', finalPrice, { shouldValidate: true });
        setValue('symbol', 'BAC', { shouldValidate: true });
    }, [amount, coinRates, discountPercent, setValue]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const onSubmitForm = handleSubmit(async (data: ISchemaType) => {
        let imageUrl = '';
        if (data.image instanceof File) {
            if (isEdit && shopItem?.image) {
                await deleteAvatarFile(shopItem.image);
            }
            const uploadedUrl = await uploadAvatarFile(data.image);
            if (!uploadedUrl) {
                toast.error('Failed to upload avatar image');
                return;
            }
            imageUrl = uploadedUrl;
        } else if (typeof data.image === 'string') {
            imageUrl = data.image;
        }

        const imageValue = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

        const payload: any = {
            amount: data.amount,
            badge: data.badge,
            badgeColor: BADGE_STYLE[data.badge]?.color || 'default',
            price: data.price,
            originalPrice: data.originalPrice,
            discountPercent: data.discountPercent,
            symbol: data.symbol,
            paymentOptions: data.paymentOptions,
            isActive: data.isActive,
            image: imageValue,
        };

        try {
            if (isEdit && shopItem) {
                const response = await updateShopItemApi(shopItem.id, payload);
                if (response?.data?.status) {
                    toast.success('Shop item updated successfully');
                    onSuccess?.();
                    handleClose();
                }
            } else {
                const response = await createShopItemApi(payload);

                if (response?.data?.status) {
                    toast.success('Shop item created successfully');
                    onSuccess?.();
                    handleClose();
                }
            }
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message;
            let normalizedMessage = 'Failed to save shop item';

            if (typeof apiMessage === 'string') {
                normalizedMessage = apiMessage;
            } else if (apiMessage && typeof apiMessage.message === 'string') {
                normalizedMessage = apiMessage.message;
            }

            toast.error(normalizedMessage);
        }
    });

    const handleDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('image', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );


    const dialogTitle = isEdit ? 'Edit Shop Item' : 'Create Shop Item';
    const actionLabel = isEdit ? 'Save Changes' : 'Create Item';

    const renderForm = () => (
        <>
            <Stack spacing={2} sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <RHFUploadAvatar
                            sx={{ width: '100%', height: '300px', minWidth: '300px', minHeight: '300px', maxWidth: '500px', maxHeight: '500px' }}
                            name="image"
                            maxSize={10 * 1024 * 1024}
                            onDrop={handleDrop}
                            helperText={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 3,
                                        mx: 'auto',
                                        display: 'block',
                                        textAlign: 'center',
                                        color: 'text.disabled',
                                    }}
                                >
                                    Allowed *.jpeg, *.jpg, *.png, *.gif
                                    <br /> max size of {fData(10 * 1024 * 1024)}
                                </Typography>
                            }
                        />
                    </Grid>
                 
                    <Grid item xs={12} md={12}>
                        <Stack spacing={2}>
                            <RHFTextField
                                name="amount"
                                label="Amount (coins)"
                                type="number"
                                required
                                fullWidth
                            />
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle2">Badge</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {BADGE_OPTIONS.map((opt) => {
                                        const current = watch('badge');
                                        const selected = current === opt;
                                        const style = BADGE_STYLE[opt];
                                        return (
                                            <Chip
                                                key={opt}
                                                label={opt}
                                                color={selected ? style.color : 'default'}
                                                variant={selected ? 'filled' : 'outlined'}
                                                sx={selected && style.sx ? style.sx : undefined}
                                                onClick={() => setValue('badge', opt, { shouldValidate: true })}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Stack>
                            <RHFTextField
                                name="discountPercent"
                                label="Discount %"
                                type="number"
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                                fullWidth
                                helperText="Adjust discount to see price updates below"
                            />
                        </Stack>
                    </Grid>
                </Grid>
                <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Prices (current price, original price)</Typography>
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack spacing={0.75}>
                            {loadingRates && <Typography variant="body2">Loading rates...</Typography>}
                            {!loadingRates && coinRates.length === 0 && (
                                <Typography variant="body2" color="text.secondary">No rates available</Typography>
                            )}
                            {coinRates.map((r) => {
                                const original = amount * (r.rate || 0);
                                const finalPrice = original * (1 - discountPercent / 100);
                                return (
                                    <Stack
                                        key={r.id}
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ borderBottom: '1px dashed', borderColor: 'divider', pb: 0.5, '&:last-of-type': { borderBottom: 'none', pb: 0 } }}
                                    >
                                        <Typography variant="body2" fontWeight={600}>
                                            {r.region} ({r.currency})
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2" color="text.primary">
                                                {finalPrice.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                                {original.toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Card>
                </Stack>
                <FormControlLabel
                    control={<Switch checked={methods.watch('isActive')} onChange={(e) => setValue('isActive', e.target.checked)} />}
                    label="Active"
                />
                {/* description for avtive */}
                <Typography variant="body2" color="text.secondary">Active status will be shown in the shop item list. Inactive status will be hidden from the shop item list.</Typography>
            </Stack>
        </>
    );

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent dividers>
                <FormProvider methods={methods} onSubmit={onSubmitForm}>
                    {renderForm()}
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                    variant="contained"
                    onClick={onSubmitForm}
                    loading={loading || isSubmitting || uploadingAvatar}
                >
                    {actionLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

