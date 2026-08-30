import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';

import { Box, Link, Alert, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { loginAction } from 'src/store/reducers/auth';

import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthTrustRow } from './auth-trust-row';
import { AuthSubmitButton } from './auth-submit-button';
import { authAlertSx, authCardFooterSx, authFieldSlotProps, authLinkSx, AUTH_TEXT_MUTED } from './auth-form-styles';

// ----------------------------------------------------------------------

export type EmailVerificationSchemaType = zod.infer<typeof EmailVerificationSchema>;

export const EmailVerificationSchema = zod.object({
  code: zod
    .string()
    .min(1, { message: 'Verification code is required!' })
    .length(6, { message: 'Code must be exactly 6 digits!' }),
});

// ----------------------------------------------------------------------

export function EmailVerificationView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { verifyEmailSignupApi, resendVerificationCodeApi } = useApi();
  const { t } = useTranslate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const email = searchParams.get('email') || '';

  // Redirect to signup if email is missing
  useEffect(() => {
    if (!email || email.trim() === '') {
      const timer = setTimeout(() => {
        router.push(paths.auth.signUp);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [email, router]);

  const defaultValues: EmailVerificationSchemaType = {
    code: '',
  };

  const methods = useForm<EmailVerificationSchemaType>({
    resolver: zodResolver(EmailVerificationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendCode = async () => {
    if (!email) {
      setErrorMessage('Email address is missing. Please sign up again.');
      return;
    }

    try {
      setResendLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await resendVerificationCodeApi(email);

      if (res.data?.status) {
        setSuccessMessage('Verification code has been resent to your email!');
        setTimeLeft(900); // Reset timer to 15 minutes
        setCanResend(false);
      } else {
        throw new Error(res.data?.message || 'Failed to resend code');
      }
    } catch (error: any) {
      const feedbackMessage =
        error?.response?.data?.message || error?.message || 'Failed to resend code';
      setErrorMessage(feedbackMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!email) {
        throw new Error('Email address is missing. Please sign up again.');
      }

      const res = await verifyEmailSignupApi(email, data.code);

      if (res.data?.status && res.data?.emailVerified) {
        const { session, user } = res.data;
        
        // Store session after successful verification
        if (session?.accessToken && user) {
          dispatch(
            loginAction({
              user,
              session: { accessToken: session.accessToken },
              balance: { balance: user?.balance || 0 },
            })
          );

          // Wait for Redux Persist to complete localStorage save
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Redirect to user play page
          router.push(paths.user.play);
        } else {
          throw new Error('Session or user data is missing from response');
        }
      } else {
        throw new Error(res.data?.message || 'Invalid verification code');
      }
    } catch (error: any) {
      const feedbackMessage =
        error?.response?.data?.message || error?.message || 'Invalid verification code';
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Stack spacing={3}>
      <Field.Text
        name="code"
        label={t('auth.verificationCode6Digits')}
        placeholder={t('auth.enter6DigitCode')}
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            sx: {
              ...authFieldSlotProps.input.sx,
              letterSpacing: '0.5em',
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            },
            inputProps: { maxLength: 6 },
          },
        }}
      />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: AUTH_TEXT_MUTED, mb: 1 }}>
          {timeLeft > 0 ? (
            <>{t('auth.timeRemaining')}: <strong>{formatTime(timeLeft)}</strong></>
          ) : (
            t('auth.codeExpired')
          )}
        </Typography>

        <Link
          component="button"
          type="button"
          onClick={handleResendCode}
          sx={{
            ...authLinkSx,
            border: 'none',
            background: 'none',
            cursor: canResend && email && !resendLoading ? 'pointer' : 'not-allowed',
            opacity: canResend && email && !resendLoading ? 1 : 0.5,
            fontSize: 13,
          }}
        >
          {resendLoading ? `${t('common.sending')}...` : canResend ? t('auth.resendCode') : t('auth.resendAfterTimer')}
        </Link>
      </Box>

      <AuthSubmitButton loading={isSubmitting} loadingIndicator={`${t('auth.verifying')}...`}>
        {t('auth.verifyEmail')}
      </AuthSubmitButton>
    </Stack>
  );

  if (!email || email.trim() === '') {
    return (
      <AuthFormShell title={t('auth.emailRequired')} description={t('auth.emailMissingRedirect')}>
        <Alert severity="error" sx={{ ...authAlertSx, mb: 2.5 }}>
          {t('auth.emailMissingSignUp')}
        </Alert>
        <AuthSubmitButton type="button" onClick={() => router.push(paths.auth.signUp)}>
          {t('auth.goToSignUp')}
        </AuthSubmitButton>
        <Box sx={authCardFooterSx}>
          <AuthTrustRow insideCard />
        </Box>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title={t('auth.verifyYourEmail')}
      description={
        <>
          {t('auth.sentVerificationCode')} <strong>{email}</strong>
          <br />
          {t('auth.checkEmailEnterCode')}
        </>
      }
    >
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 2.5 }}>
          {errorMessage}
        </Alert>
      )}

      {!!successMessage && (
        <Alert severity="success" sx={{ ...authAlertSx, mb: 2.5 }}>
          {successMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: AUTH_TEXT_MUTED, fontSize: 13 }}>
          {t('auth.didntReceiveEmail')}{' '}
          <Link component={RouterLink} href={paths.auth.signUp} sx={authLinkSx}>
            {t('auth.signUpAgain')}
          </Link>
        </Typography>
      </Box>

      <Box sx={authCardFooterSx}>
        <AuthTrustRow insideCard />
      </Box>
    </AuthFormShell>
  );
}
