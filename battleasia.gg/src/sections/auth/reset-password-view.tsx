import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthTrustRow } from './auth-trust-row';
import { AuthFooterLinks } from './auth-footer-links';
import { AuthSubmitButton } from './auth-submit-button';
import { authAlertSx, authFieldSlotProps } from './auth-form-styles';

const FIELD_ICON_COLOR = '#f5c518';

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod
  .object({
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Email must be a valid email address!' }),
    code: zod
      .string()
      .min(1, { message: 'Verification code is required!' })
      .length(6, { message: 'Code must be exactly 6 digits!' }),
    newPassword: zod
      .string()
      .min(1, { message: 'Password is required!' })
      .min(8, { message: 'Password must be at least 8 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Confirm Password is required!' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const router = useRouter();
  const { verifyResetCodeApi, resetPasswordApi } = useApi();
  const { t } = useTranslate();

  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState<boolean>(false);

  const defaultValues: ResetPasswordSchemaType = {
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const emailValue = watch('email');
  const codeValue = watch('code');

  const handleVerifyCode = async () => {
    try {
      setErrorMessage(null);

      if (!emailValue || !codeValue) {
        setErrorMessage('Please enter both email and verification code');
        return;
      }

      const res = await verifyResetCodeApi(emailValue, codeValue);

      if (res.data?.status && res.data?.codeValid) {
        setCodeVerified(true);
      } else {
        throw new Error(res.data?.message || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error(error);
      const feedbackMessage =
        error?.response?.data?.message || error?.message || 'Invalid verification code';
      setErrorMessage(feedbackMessage);
      setCodeVerified(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      // First verify the code if not already verified
      if (!codeVerified) {
        const verifyRes = await verifyResetCodeApi(data.email, data.code);
        if (!verifyRes.data?.status || !verifyRes.data?.codeValid) {
          throw new Error('Invalid verification code');
        }
      }

      // Reset password
      const res = await resetPasswordApi(data.email, data.code, data.newPassword);

      if (res.data?.status) {
        // Success - redirect to login
        router.push(paths.auth.signIn);
      } else {
        throw new Error(res.data?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error(error);
      const feedbackMessage =
        error?.response?.data?.message || error?.message || 'An error occurred';
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label={t('auth.emailAddress')}
        placeholder={t('auth.emailPlaceholder')}
        disabled={codeVerified}
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:letter-bold-duotone" width={20} sx={{ color: FIELD_ICON_COLOR }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="code"
          label={t('auth.verificationCode6Digits')}
          placeholder={t('auth.enter6DigitCode')}
          disabled={codeVerified}
          slotProps={{
            ...authFieldSlotProps,
            input: {
              ...authFieldSlotProps.input,
              inputProps: { maxLength: 6 },
            },
          }}
        />

        {!codeVerified && (
          <AuthSubmitButton
            type="button"
            onClick={handleVerifyCode}
            disabled={!emailValue || !codeValue || codeValue.length !== 6}
          >
            {t('auth.verifyCode')}
          </AuthSubmitButton>
        )}

        {codeVerified && (
          <Alert severity="success" sx={{ ...authAlertSx, mb: 2 }}>
            {t('auth.codeVerifiedSuccess')}
          </Alert>
        )}
      </Box>

      {codeVerified && (
        <>
          <Field.Text
            name="newPassword"
            label={t('auth.newPassword')}
            placeholder={t('auth.passwordPlaceholder')}
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              ...authFieldSlotProps,
              input: {
                ...authFieldSlotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:lock-password-bold-duotone" width={20} sx={{ color: FIELD_ICON_COLOR }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end" sx={{ color: alpha('#fff', 0.7) }}>
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Text
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmYourPassword')}
            type={showConfirmPassword.value ? 'text' : 'password'}
            slotProps={{
              ...authFieldSlotProps,
              input: {
                ...authFieldSlotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:lock-password-bold-duotone" width={20} sx={{ color: FIELD_ICON_COLOR }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showConfirmPassword.onToggle} edge="end" sx={{ color: alpha('#fff', 0.7) }}>
                      <Iconify
                        icon={
                          showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <AuthSubmitButton loading={isSubmitting} loadingIndicator={`${t('auth.resetting')}...`}>
            {t('auth.resetPassword')}
          </AuthSubmitButton>
        </>
      )}

      <AuthFooterLinks
        prefix={t('auth.rememberPassword')}
        links={[{ label: t('auth.signIn'), href: paths.auth.signIn }]}
      />
    </Stack>
  );

  return (
    <AuthFormShell
      title={t('auth.resetYourPassword')}
      description={t('auth.resetPasswordDescription')}
    >
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 2.5 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <AuthTrustRow />
    </AuthFormShell>
  );
}
