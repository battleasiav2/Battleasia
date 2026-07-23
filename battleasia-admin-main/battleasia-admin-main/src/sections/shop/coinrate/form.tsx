import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
    Typography,
    Grid,
    MenuItem,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useEffect, useMemo } from 'react';
import useApi from 'src/hooks/use-api';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { ICoinRate } from 'src/types';
import { createCoinRateApi, updateCoinRateApi } from 'src/contexts/api/shop';

const REGIONS: ICoinRate['region'][] = ['global', 'bangladesh', 'india', 'pakistan'];

export const CoinRateSchema = Yup.object().shape({
    region: Yup.mixed<ICoinRate['region']>().oneOf(REGIONS).required('Region is required'),
    currency: Yup.string().required('Currency is required'),
    rate: Yup.number().required('Rate is required').min(0),
    isActive: Yup.boolean().default(true),
});

type ISchemaType = Yup.InferType<typeof CoinRateSchema>;
type DialogMode = 'create' | 'edit';

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    mode?: DialogMode;
    rate?: ICoinRate | null;
    onSuccess?: () => void;
};

export function CoinRateDialog({
    open,
    onClose,
    loading = false,
    mode = 'create',
    rate = null,
    onSuccess,
}: Props) {
    const isEdit = mode === 'edit' && !!rate;

    const defaultValues: ISchemaType = useMemo(
        () => ({
            region: 'global',
            currency: 'USD',
            rate: 0,
            isActive: true,
        }),
        []
    );

    const methods = useForm<ISchemaType>({
        resolver: yupResolver(CoinRateSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting },
        setValue,
    } = methods;

    useEffect(() => {
        if (!open) return;
        if (isEdit && rate) {
            reset({
                region: rate.region,
                currency: rate.currency,
                rate: rate.rate,
                isActive: rate.isActive ?? true,
            });
        } else {
            reset(defaultValues);
        }
    }, [defaultValues, isEdit, open, rate, reset]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const onSubmitForm = handleSubmit(async (data) => {
        try {
            const payload = { ...data };
            if (isEdit && rate) {
                const response = await updateCoinRateApi(rate.id, payload);
                if (response?.data?.status) {
                    toast.success('Coin rate updated');
                    onSuccess?.();
                    handleClose();
                }
            } else {
                const response = await createCoinRateApi(payload);
                if (response?.data?.status) {
                    toast.success('Coin rate created');
                    onSuccess?.();
                    handleClose();
                }
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save coin rate');
        }
    });

    const dialogTitle = isEdit ? 'Edit Coin Rate' : 'Create Coin Rate';
    const actionLabel = isEdit ? 'Save Changes' : 'Create Rate';

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent dividers>
                <FormProvider methods={methods} onSubmit={onSubmitForm}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <RHFSelect name="region" label="Region" fullWidth>
                                    {REGIONS.map((r) => (
                                        <MenuItem key={r} value={r}>
                                            {r}
                                        </MenuItem>
                                    ))}
                                </RHFSelect>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <RHFTextField name="currency" label="Currency" required fullWidth />
                            </Grid>
                        </Grid>
                        <RHFTextField name="rate" label="Rate per coin" type="number" required fullWidth />
                        <FormControlLabel
                            control={<Switch checked={methods.watch('isActive')} onChange={(e) => setValue('isActive', e.target.checked)} />}
                            label="Active"
                        />
                        <Typography variant="body2" color="text.secondary">
                            Set the coin rate per region and currency.
                        </Typography>
                    </Stack>
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton variant="contained" onClick={onSubmitForm} loading={loading || isSubmitting}>
                    {actionLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

