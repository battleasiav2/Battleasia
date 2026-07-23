import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Link, Stack, Alert, IconButton, Typography, InputAdornment } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthSubmitButton } from './auth-submit-button';
import { authAlertSx, authFieldSlotProps, authLinkSx } from './auth-form-styles';

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
      .min(6, { message: 'Password must be at least 6 characters!' }),
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
        placeholder="Example@domain.com"
        disabled={codeVerified}
        slotProps={authFieldSlotProps}
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
          <Alert severity="success" sx={{ mb: 2 }}>
            ✓ {t('auth.codeVerifiedSuccess')}
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

      <Stack direction="row" justifyContent="center" spacing={0.5}>
        <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.55) }}>
          {t('auth.rememberPassword')}
        </Typography>
        <Link component={RouterLink} href={paths.auth.signIn} sx={authLinkSx}>
          {t('auth.signIn')}
        </Link>
      </Stack>
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
    </AuthFormShell>
  );
}
