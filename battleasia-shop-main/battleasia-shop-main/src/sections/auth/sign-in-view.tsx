import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Link, Alert, Stack, IconButton, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { dispatch } from 'src/store';
import { loginAction } from 'src/store/reducers/auth';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthSubmitButton } from './auth-submit-button';
import { authAlertSx, authFieldSlotProps, authLinkSx, authFooterTextSx } from './auth-form-styles';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

export function SignInView() {
  const { loginApi } = useApi();
  const { t } = useTranslate();
  const showPassword = useBoolean();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      const res = await loginApi(data);
      const { status, session, user } = res.data;

      if (!status || !session?.accessToken) {
        throw new Error(res.data?.message || 'Access token not found in response');
      }

      dispatch(
        loginAction({
          user: user || { _id: '', email: data.email, username: data.email },
          session: { accessToken: session.accessToken },
          balance: { balance: user?.balance || 0 },
        })
      );
    } catch (error: any) {
      const feedbackMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      setErrorMessage(feedbackMessage);
    }
  });

  return (
    <AuthFormShell title={t('auth.signInToAccount')} description={t('shop.bacDescription')}>
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 2.5 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5}>
          <Field.Text
            name="email"
            label={t('auth.emailAddress')}
            placeholder="Example@domain.com"
            slotProps={{
              ...authFieldSlotProps,
              input: {
                ...authFieldSlotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:letter-bold-duotone" width={20} sx={{ color: '#f59e0b' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Text
            name="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              ...authFieldSlotProps,
              input: {
                ...authFieldSlotProps.input,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <AuthSubmitButton loading={isSubmitting} loadingIndicator={`${t('auth.signIn')}...`}>
            {t('auth.signIn')}
          </AuthSubmitButton>

          <Box sx={authFooterTextSx}>
            {t('auth.dontHaveAccount')}{' '}
            <Link component={RouterLink} href={paths.auth.signUp} sx={authLinkSx}>
              {t('auth.signUp')}
            </Link>
          </Box>
        </Stack>
      </Form>
    </AuthFormShell>
  );
}
