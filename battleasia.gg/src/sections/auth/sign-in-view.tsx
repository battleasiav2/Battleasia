import { Box, Link, Alert, Stack, Checkbox, IconButton, InputAdornment, FormControlLabel } from '@mui/material';
import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { safeAuthReturnPath } from 'src/utils/auth-return';

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
import { authLinkSx, authAlertSx, authCardFooterSx, AUTH_TEXT_SECONDARY, authFieldSlotPropsCompact } from './auth-form-styles';
import { goldAlpha } from 'src/theme/accent-presets';

const REMEMBER_EMAIL_KEY = 'ba_remember_email';

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }),
});

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push(safeAuthReturnPath(searchParams.get('returnTo')) || paths.user.play);
    } catch (error: any) {
      const responseData = error?.response?.data;
      if (responseData?.emailVerificationRequired) {
        const emailToUse = responseData?.email || data.email;
        if (emailToUse?.trim()) {
          router.push(`${paths.auth.emailVerification}?email=${encodeURIComponent(emailToUse)}`);
          return;
        }
      }
      setErrorMessage(error?.response?.data?.message || error?.message || 'An error occurred');
    }
  });

  return (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '@keyframes authViewEnter': {
          '0%': { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        animation: 'authViewEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards',
      }}
    >
      <AuthFormShell
        compact
        progress={100}
        title={t('auth.signInToAccount')}
        description={t('auth.signInDescription')}
      >
        {!!errorMessage && (
          <Alert severity="error" sx={{ ...authAlertSx, mb: 2 }}>
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
                ...authFieldSlotPropsCompact,
                input: {
                  ...authFieldSlotPropsCompact.input,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:letter-bold-duotone" width={18} sx={{ color: '#9CA3AF' }} />
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
                      <Iconify icon="solar:lock-password-bold-duotone" width={18} sx={{ color: '#9CA3AF' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showPassword.onToggle} edge="end" size="small" sx={{ color: '#9CA3AF' }}>
                        <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 24 }}>
              <FormControlLabel
                sx={{
                  mr: 0,
                  ml: -0.5,
                  my: 0,
                  '& .MuiFormControlLabel-label': { lineHeight: 1.4 },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    sx={{
                      color: goldAlpha(0.45),
                      p: 0.25,
                      mr: 0.75,
                      transition: 'all 0.2s ease',
                      '&.Mui-checked': {
                        color: 'var(--ba-gold)',
                        filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.6))',
                      },
                      '&:hover': {
                        bgcolor: goldAlpha(0.08),
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ fontSize: 13, fontWeight: 500, color: AUTH_TEXT_SECONDARY }}>
                    {t('auth.rememberMe')}
                  </Box>
                }
              />
              <Link
                component={RouterLink}
                href={paths.auth.forgotPassword}
                sx={{
                  ...authLinkSx,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    width: '100%',
                    height: '1.5px',
                    bgcolor: 'var(--ba-gold)',
                    opacity: 0.6,
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    transform: 'scaleX(0.9)',
                  },
                  '&:hover::after': {
                    opacity: 1,
                    transform: 'scaleX(1)',
                  },
                }}
              >
                {t('auth.forgotPassword')}
              </Link>
            </Stack>

            <AuthSubmitButton
              loading={isSubmitting}
              loadingIndicator={`${t('auth.signIn')}...`}
              startIcon={false}
              endIcon={<Iconify icon="solar:login-3-bold" width={18} />}
            >
              {t('auth.signIn')}
            </AuthSubmitButton>

            <AuthFooterLinks
              prefix={t('auth.newToBattleAsia')}
              links={[
                {
                  label: t('auth.createYourAccount'),
                  href: (() => {
                    const next = safeAuthReturnPath(searchParams.get('returnTo'));
                    return next
                      ? `${paths.auth.signUp}?returnTo=${encodeURIComponent(next)}`
                      : paths.auth.signUp;
                  })(),
                },
              ]}
            />
          </Stack>
        </Form>

        <Box sx={authCardFooterSx}>
          <AuthTrustRow insideCard />
        </Box>
      </AuthFormShell>

      <Box
        sx={{
          width: 1,
          maxWidth: { xs: 1, sm: 400, md: 420 },
          mt: 1.5,
          animation: 'authViewEnter 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both',
          '@keyframes authViewEnter': {
            '0%': { opacity: 0, transform: 'scale(1.1) translateY(-4px)', filter: 'blur(8px)' },
            '100%': { opacity: 1, transform: 'scale(1) translateY(0)', filter: 'blur(0px)' },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        <AuthSocialButtons />
      </Box>
    </Box>
  );
}
