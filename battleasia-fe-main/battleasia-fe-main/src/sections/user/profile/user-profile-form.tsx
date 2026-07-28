import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';

import useApi from 'src/hooks/use-api';
import { useSelector } from 'src/store';
import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  USER_COLORS,
  userGoldButtonSx,
} from 'src/layouts/user';

import { toast } from 'react-hot-toast';
import { Form, Field } from 'src/components/hook-form';
import { authFieldSlotProps } from 'src/sections/auth/auth-form-styles';

// ----------------------------------------------------------------------

export type ProfileSchemaType = zod.infer<typeof ProfileSchema>;

export const ProfileSchema = zod.object({
  avatar: zod.custom<File | string | null>().nullable().optional(),
  username: zod.string().min(1, { message: 'Username is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  referral: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function UserProfileForm() {
  const { user } = useSelector((state) => state.auth);
  const { updateProfileApi } = useApi();
  const { t } = useTranslate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ProfileSchemaType = {
    avatar: null,
    username: user?.username || '',
    email: user?.email || '',
    referral: user?.referral || '',
  };

  const methods = useForm<ProfileSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(ProfileSchema),
    defaultValues,
    values: {
      avatar: null,
      username: user?.username || '',
      email: user?.email || '',
      referral: user?.referral || '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      const profileData = {
        username: data.username,
        email: data.email,
        referralCode: data.referral,
        avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
      };

      await updateProfileApi(profileData);
      reset();
      toast.success(t('profile.profileUpdatedSuccess'));
    } catch (error: any) {
      console.error(error);
      const responseData = error?.response?.data;

      if (error?.response?.status === 429) {
        const message = responseData?.message || 'You can only update your profile once every 24 hours.';
        setErrorMessage(message);
        toast.error(message);
      } else {
        const message = responseData?.message || 'Failed to update profile';
        setErrorMessage(message);
        toast.error(message);
      }
    }
  });

  return (
    <Box pt={15}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <UserGlassCard sx={{ pt: 10, pb: 5, px: 3 }}>
              <Box sx={{ mb: 5 }}>
                <Field.UploadAvatar
                  name="avatar"
                  maxSize={3145728}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: alpha('#ffffff', 0.38),
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>
            </UserGlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <UserGlassCard sx={{ p: 3 }}>
              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    bgcolor: alpha(USER_COLORS.error, 0.12),
                    color: USER_COLORS.textPrimary,
                    border: `1px solid ${alpha(USER_COLORS.error, 0.3)}`,
                  }}
                >
                  {errorMessage}
                </Alert>
              )}

              <Box
                sx={{
                  rowGap: 3,
                  columnGap: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Field.Text name="username" label={t('profile.username')} slotProps={authFieldSlotProps} />
                <Field.Text name="email" label={t('profile.email')} slotProps={authFieldSlotProps} />
                <Field.Text name="referral" label={t('profile.referralCodeOptional')} slotProps={authFieldSlotProps} />
              </Box>

              <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
                <LoadingButton type="submit" variant="outlined" disableElevation loading={isSubmitting} sx={userGoldButtonSx}>
                  {t('common.saveChanges')}
                </LoadingButton>
              </Stack>
            </UserGlassCard>
          </Grid>
        </Grid>
      </Form>
    </Box>
  );
}
