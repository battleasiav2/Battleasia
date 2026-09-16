import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Link, Stack, Alert, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthTrustRow } from './auth-trust-row';
import { AuthFooterLinks } from './auth-footer-links';
import { AuthSubmitButton } from './auth-submit-button';
import { authAlertSx, authCardFooterSx, authFieldSlotPropsCompact, authLinkSx } from './auth-form-styles';

// ----------------------------------------------------------------------

export type ForgotPasswordSchemaType = zod.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

export function ForgotPasswordView() {
  const { forgotPasswordApi } = useApi();
  const { t } = useTranslate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await forgotPasswordApi(data.email);

      if (res.data?.status) {
        setSuccessMessage(t('auth.resetCodeSentSuccess'));
      } else {
        throw new Error(res.data?.message || 'Failed to send reset code');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'An error occurred');
    }
  });

  return (
    <Box sx={{ width: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AuthFormShell
        compact
        progress={100}
        title={t('auth.forgotPasswordTitle')}
        description={t('auth.forgotPasswordDescription')}
      >
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 1.5 }}>
          {errorMessage}
        </Alert>
      )}

      {!!successMessage && (
        <Alert severity="success" sx={{ ...authAlertSx, mb: 1.5 }}>
          {successMessage}
          <Box sx={{ mt: 1.25 }}>
            <Link component={RouterLink} href={paths.auth.resetPassword} sx={authLinkSx}>
              {t('auth.clickToEnterCode')}
            </Link>
          </Box>
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={1.25}>
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

          <AuthSubmitButton loading={isSubmitting} loadingIndicator={`${t('common.sending')}...`}>
            {t('auth.sendResetCode')}
          </AuthSubmitButton>

          <AuthFooterLinks
            prefix={t('auth.rememberPassword')}
            links={[{ label: t('auth.signIn'), href: paths.auth.signIn }]}
          />
        </Stack>
      </Form>

        <Box sx={authCardFooterSx}>
          <AuthTrustRow insideCard />
        </Box>
      </AuthFormShell>
    </Box>
  );
}
