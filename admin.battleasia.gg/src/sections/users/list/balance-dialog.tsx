import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { IUserRow } from 'src/types';
import useApi from 'src/hooks/use-api';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';

const BalanceSchema = Yup.object().shape({
  type: Yup.mixed<'deposit' | 'withdraw'>().oneOf(['deposit', 'withdraw']).required(),
  amount: Yup.number()
    .typeError('Amount is required')
    .positive('Amount must be greater than 0')
    .required('Amount is required'),
});

type BalanceFormValues = Yup.InferType<typeof BalanceSchema>;

type BalanceDialogProps = {
  open: boolean;
  user?: IUserRow | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const formatBalance = (value?: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export function BalanceDialog({ open, user, onClose, onSuccess }: BalanceDialogProps) {
  const { updatePlayerBalanceApi } = useApi();
  const { hasPermission } = usePermissions();

  const defaultValues = useMemo<BalanceFormValues>(
    () => ({
      type: 'deposit',
      amount: 0,
    }),
    []
  );

  const methods = useForm<BalanceFormValues>({
    resolver: yupResolver(BalanceSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const selectedType = watch('type');

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(defaultValues);
  }, [defaultValues, open, reset]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      toast.error('User information is missing');
      return;
    }

    if (!hasPermission(PERMISSIONS.PAYMENTS.MANAGE)) {
      toast.error('You do not have permission to manage payments');
      return;
    }

    try {
     const res =  await updatePlayerBalanceApi(user.id, {
        type: values.type,
        amount: Number(values.amount),
      });
      if(!res?.data) return;
      if (res.data.status) {
        toast.success(res.data.message);
      } 
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to update balance');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adjust Balance</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Current Balance:{' '}
            <Typography component="span" fontWeight={600}>
              {formatBalance(user?.balance)}
            </Typography>
          </Typography>

          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    value={field.value}
                    exclusive
                    fullWidth
                    onChange={(_, value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <ToggleButton value="deposit">Deposit</ToggleButton>
                    <ToggleButton value="withdraw">Withdraw</ToggleButton>
                  </ToggleButtonGroup>
                )}
              />

              <RHFTextField
                name="amount"
                label="Amount"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                required
                helperText={`Balance will ${selectedType === 'withdraw' ? 'withdraw' : 'deposit'}.`}
              />
            </Stack>
          </FormProvider>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton onClick={onSubmit} loading={isSubmitting} variant="contained">
          Apply
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}


