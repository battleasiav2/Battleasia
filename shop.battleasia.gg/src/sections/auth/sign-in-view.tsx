import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Link, Alert, Stack, IconButton, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { dispatch } from 'src/store';
import { loginAction } from 'src/store/reducers/auth';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AuthNavButtons } from 'src/components/mesh-buttons/auth-nav-buttons';

import { AuthFormShell } from './auth-form-shell';
import { AuthFooterLinks } from './auth-footer-links';
import { AuthSubmitButton } from './auth-submit-button';
import { authAlertSx, authFieldSlotProps, authLinkSx } from './auth-form-styles';

// ----------------------------------------------------------------------

const MAIN_APP_URL = (import.meta.env.VITE_MAIN_APP_URL as string | undefined) || 'http://localhost:8081';

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
  const router = useRouter();
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

      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push(paths.user.shop);
    } catch (error: any) {
      const feedbackMessage =
        error?.response?.data?.message ||
        error?.message ||
        (typeof error === 'string' ? error : null) ||
        'An error occurred';
      setErrorMessage(feedbackMessage);
    }
  });

  return (
    <AuthFormShell mark="01" title={t('auth.signInToAccount')} description={t('shop.bacDescription')}>
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 2.5 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={1.75}>
          <Field.Text
            name="email"
            label={t('auth.emailAddress')}
            placeholder={t('auth.emailPlaceholder')}
            slotProps={{
              ...authFieldSlotProps,
              input: {
                ...authFieldSlotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:letter-bold-duotone" width={20} sx={{ color: '#f5c518' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.75 }}>
              <Link
                href={`${MAIN_APP_URL}/auth/forgot-password`}
                target="_blank"
                rel="noopener noreferrer"
                sx={authLinkSx}
              >
                {t('auth.forgotPassword')}
              </Link>
            </Box>
            <Field.Text
              name="password"
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              type={showPassword.value ? 'text' : 'password'}
              slotProps={{
                ...authFieldSlotProps,
                input: {
                  ...authFieldSlotProps.input,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:lock-password-bold-duotone" width={20} sx={{ color: '#f5c518' }} />
                    </InputAdornment>
                  ),
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
          </Box>

          <AuthSubmitButton loading={isSubmitting} loadingIndicator={`${t('auth.signIn')}...`}>
            {t('auth.signIn')}
          </AuthSubmitButton>

          <AuthFooterLinks
            prefix={t('auth.dontHaveAccount')}
            links={[{ label: t('auth.signUp'), href: paths.auth.signUp }]}
          />
        </Stack>
      </Form>

      <AuthNavButtons homeLabel={t('auth.home')} joinLabel={t('nav.shop')} />
    </AuthFormShell>
  );
}
