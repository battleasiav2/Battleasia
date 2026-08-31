import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFTextField, RHFSelect, RHFSwitch } from 'src/components/hook-form';
import useApi from 'src/hooks/use-api';
import type { IEngagementBadgeData } from 'src/contexts/api/engagement';

export interface IBadgeRow {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  threshold: number;
  tier: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

type BadgeFormValues = {
  key: string;
  title: string;
  description: string;
  icon: string;
  criteria: IEngagementBadgeData['criteria'];
  threshold: number;
  tier: number;
  active: boolean;
  sortOrder: number;
};

const BadgeSchema = Yup.object().shape({
  key: Yup.string().required('Key is required').max(60),
  title: Yup.string().required('Title is required').max(120),
  description: Yup.string().max(500),
  icon: Yup.string().max(80),
  criteria: Yup.string().required(),
  threshold: Yup.number().min(1).required(),
  tier: Yup.number().min(1),
  sortOrder: Yup.number().min(0),
  active: Yup.boolean().required(),
});

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  badge: IBadgeRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function BadgeDialog({ open, mode, badge, onClose, onSuccess }: Props) {
  const { createEngagementBadgeApi, updateEngagementBadgeApi } = useApi();

  const defaultValues: BadgeFormValues = useMemo(
    () => ({
      key: '',
      title: '',
      description: '',
      icon: 'solar:medal-ribbons-star-bold',
      criteria: 'total_kills',
      threshold: 10,
      tier: 1,
      active: true,
      sortOrder: 0,
    }),
    []
  );

  const methods = useForm<BadgeFormValues>({
    resolver: yupResolver(BadgeSchema) as Resolver<BadgeFormValues>,
    defaultValues,
  });

  const { reset, handleSubmit, watch, setValue, formState: { isSubmitting } } = methods;
  const title = watch('title');

  useEffect(() => {
    if (mode === 'create' && title) {
      const autoKey = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const currentKey = watch('key');
      if (!currentKey) setValue('key', autoKey);
    }
  }, [mode, title, setValue, watch]);

  useEffect(() => {
    if (badge && mode === 'edit') {
      reset({
        key: badge.key,
        title: badge.title,
        description: badge.description || '',
        icon: badge.icon || 'solar:medal-ribbons-star-bold',
        criteria: badge.criteria as BadgeFormValues['criteria'],
        threshold: badge.threshold,
        tier: badge.tier ?? 1,
        active: badge.active !== false,
        sortOrder: badge.sortOrder ?? 0,
      });
    } else if (mode === 'create') {
      reset(defaultValues);
    }
  }, [badge, mode, reset, defaultValues]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: IEngagementBadgeData = {
      key: values.key,
      title: values.title,
      description: values.description,
      icon: values.icon,
      criteria: values.criteria,
      threshold: values.threshold,
      tier: values.tier,
      active: values.active,
      sortOrder: values.sortOrder,
    };

    try {
      if (mode === 'create') {
        const response = await createEngagementBadgeApi(payload);
        if (response?.data?.status) {
          toast.success('Badge created');
          onSuccess();
          onClose();
        }
      } else if (badge) {
        const response = await updateEngagementBadgeApi(badge.id, payload);
        if (response?.data?.status) {
          toast.success('Badge updated');
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save badge');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{mode === 'create' ? 'New Badge' : 'Edit Badge'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <RHFTextField name="title" label="Title" />
            <RHFTextField name="key" label="Key (slug)" disabled={mode === 'edit'} />
            <RHFTextField name="description" label="Description" multiline rows={2} />
            <RHFTextField name="icon" label="Icon (Iconify name)" />
            <RHFSelect name="criteria" label="Unlock criteria">
              <MenuItem value="total_kills">Total kills (lifetime)</MenuItem>
              <MenuItem value="total_wins">Total wins (lifetime)</MenuItem>
            </RHFSelect>
            <RHFTextField name="threshold" label="Threshold" type="number" />
            <RHFTextField name="tier" label="Tier" type="number" />
            <RHFTextField name="sortOrder" label="Sort order" type="number" />
            <RHFSwitch name="active" label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {mode === 'create' ? 'Create' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
