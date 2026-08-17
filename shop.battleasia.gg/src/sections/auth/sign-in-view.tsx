import { z as zod } from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Link,
  Alert,
  Stack,
  Checkbox,
  IconButton,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { dispatch } from 'src/store';
import { loginAction } from 'src/store/reducers/auth';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthTrustRow } from './auth-trust-row';
import { AuthFooterLinks } from './auth-footer-links';
import { AuthSubmitButton } from './auth-submit-button';
import { AuthSocialButtons } from './auth-social-buttons';
import { authAlertSx, authFieldSlotPropsCompact, authLinkSx } from './auth-form-styles';

const MAIN_APP_URL = (import.meta.env.VITE_MAIN_APP_URL as string | undefined) || 'http://localhost:8081';
const REMEMBER_EMAIL_KEY = 'ba_remember_email';

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
  const [rememberMe, setRememberMe] = useState(false);

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setValue('email', saved);
        setRememberMe(true);
      }
    } catch {
      /* ignore */
    }
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      const res = await loginApi(data);
      const { status, session, user } = res.data;

      if (!status || !session?.accessToken) {
        throw new Error(res.data?.message || 'Access token not found in response');
      }

      try {
        if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
        else localStorage.removeItem(REMEMBER_EMAIL_KEY);
      } catch {
        /* ignore */
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
    <AuthFormShell compact title={t('auth.signInToAccount')} description={t('auth.heroLine')}>
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 1.5 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={1.5}>
          <Stack spacing={1.75}>
          <Field.Text
            name="email"
            label={t('auth.emailAddress')}
            placeholder={t('auth.emailPlaceholder')}
            slotProps={{
              ...authFieldSlotPropsCompact,
              input: {
                ...authFieldSlotPropsCompact.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:letter-bold-duotone" width={18} sx={{ color: '#ffffff' }} />
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
              ...authFieldSlotPropsCompact,
              input: {
                ...authFieldSlotPropsCompact.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:lock-password-bold-duotone" width={18} sx={{ color: '#ffffff' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end" size="small" sx={{ color: '#ffffff' }}>
                      <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ minHeight: 22, height: 22 }}
          >
            <FormControlLabel
              sx={{
                mr: 0,
                ml: -0.5,
                my: 0,
                height: 22,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': { lineHeight: 1, display: 'flex', alignItems: 'center' },
              }}
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  sx={{
                    color: alpha('#f5c518', 0.55),
                    p: 0,
                    mr: 0.75,
                    '&.Mui-checked': { color: '#f5c518' },
                  }}
                />
              }
              label={
                <Box sx={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', lineHeight: 1 }}>
                  {t('auth.rememberMe')}
                </Box>
              }
            />
            <Link
              href={`${MAIN_APP_URL}/auth/forgot-password`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...authLinkSx,
                fontSize: 12,
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
                height: 22,
              }}
            >
              {t('auth.forgotPassword')}
            </Link>
          </Stack>

          <AuthSubmitButton
            loading={isSubmitting}
            loadingIndicator={`${t('auth.signIn')}...`}
          >
            {t('auth.signIn')}
          </AuthSubmitButton>

          <AuthSocialButtons />

          <AuthFooterLinks
            prefix={t('auth.dontHaveAccount')}
            links={[{ label: t('auth.signUp'), href: paths.auth.signUp }]}
          />
        </Stack>
      </Form>

      <AuthTrustRow />
    </AuthFormShell>
  );
}
