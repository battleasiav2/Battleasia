import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
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
import type { IEngagementMissionData } from 'src/contexts/api/engagement';

export interface IMissionRow {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  action: string;
  targetCount: number;
  reward: { bacAmount: number; label?: string };
  active: boolean;
  inDailyPool: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

type MissionFormValues = {
  key: string;
  title: string;
  description: string;
  icon: string;
  type: IEngagementMissionData['type'];
  action: IEngagementMissionData['action'];
  targetCount: number;
  rewardBac: number;
  rewardLabel: string;
  active: boolean;
  inDailyPool: boolean;
  sortOrder: number;
};

const MissionSchema = Yup.object().shape({
  key: Yup.string().required('Key is required').max(60),
  title: Yup.string().required('Title is required').max(120),
  description: Yup.string().max(500),
  icon: Yup.string().max(80),
  type: Yup.string().required(),
  action: Yup.string().required(),
  targetCount: Yup.number().min(1).required(),
  rewardBac: Yup.number().min(0).required(),
  rewardLabel: Yup.string().max(80),
  sortOrder: Yup.number().min(0),
});

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  mission: IMissionRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function MissionDialog({ open, mode, mission, onClose, onSuccess }: Props) {
  const { createEngagementMissionApi, updateEngagementMissionApi } = useApi();

  const defaultValues: MissionFormValues = useMemo(
    () => ({
      key: '',
      title: '',
      description: '',
      icon: 'solar:gift-bold',
      type: 'daily',
      action: 'manual',
      targetCount: 1,
      rewardBac: 5,
      rewardLabel: '',
      active: true,
      inDailyPool: true,
      sortOrder: 0,
    }),
    []
  );

  const methods = useForm<MissionFormValues>({
    resolver: yupResolver(MissionSchema),
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
    if (mission && mode === 'edit') {
      reset({
        key: mission.key,
        title: mission.title,
        description: mission.description || '',
        icon: mission.icon || 'solar:gift-bold',
        type: mission.type as MissionFormValues['type'],
        action: mission.action as MissionFormValues['action'],
        targetCount: mission.targetCount,
        rewardBac: mission.reward?.bacAmount ?? 0,
        rewardLabel: mission.reward?.label || '',
        active: mission.active !== false,
        inDailyPool: mission.inDailyPool !== false,
        sortOrder: mission.sortOrder ?? 0,
      });
    } else if (mode === 'create') {
      reset(defaultValues);
    }
  }, [mission, mode, reset, defaultValues]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: IEngagementMissionData = {
      key: values.key,
      title: values.title,
      description: values.description,
      icon: values.icon,
      type: values.type,
      action: values.action,
      targetCount: values.targetCount,
      reward: { bacAmount: values.rewardBac, label: values.rewardLabel || undefined },
      active: values.active,
      inDailyPool: values.type === 'daily' ? values.inDailyPool : false,
      sortOrder: values.sortOrder,
    };

    try {
      if (mode === 'create') {
        const response = await createEngagementMissionApi(payload);
        if (response?.data?.status) {
          toast.success('Mission created');
          onSuccess();
          onClose();
        }
      } else if (mission) {
        const response = await updateEngagementMissionApi(mission.id, payload);
        if (response?.data?.status) {
          toast.success('Mission updated');
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save mission');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{mode === 'create' ? 'New Mission' : 'Edit Mission'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <RHFTextField name="title" label="Title" />
            <RHFTextField name="key" label="Key (slug)" disabled={mode === 'edit'} />
            <RHFTextField name="description" label="Description" multiline rows={2} />
            <RHFTextField name="icon" label="Icon (Iconify name)" />
            <RHFSelect name="type" label="Type">
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="one_time">One time</MenuItem>
              <MenuItem value="event">Event</MenuItem>
            </RHFSelect>
            <RHFSelect name="action" label="Trigger action">
              <MenuItem value="daily_login">Daily login</MenuItem>
              <MenuItem value="join_match">Join match</MenuItem>
              <MenuItem value="win_match">Win match</MenuItem>
              <MenuItem value="get_kills">Get kills</MenuItem>
              <MenuItem value="complete_profile">Complete profile</MenuItem>
              <MenuItem value="first_deposit">First deposit</MenuItem>
              <MenuItem value="refer_user">Refer user</MenuItem>
              <MenuItem value="manual">Manual (admin only)</MenuItem>
            </RHFSelect>
            <RHFTextField name="targetCount" label="Target count" type="number" />
            <RHFTextField name="rewardBac" label="Reward (BAC)" type="number" />
            <RHFTextField name="rewardLabel" label="Reward label" />
            <RHFTextField name="sortOrder" label="Sort order" type="number" />
            <RHFSwitch name="active" label="Active" />
            {watch('type') === 'daily' ? <RHFSwitch name="inDailyPool" label="Include in daily rotation pool" /> : null}
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
