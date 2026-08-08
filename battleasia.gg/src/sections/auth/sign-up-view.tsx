import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';

import {
  Box,
  Link,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';
import { pubgIdZodSchema } from 'src/utils/pubg-id';

import { GAME_SERVERS } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AuthNavButtons } from 'src/components/mesh-buttons/auth-nav-buttons';

import { AuthFormShell } from './auth-form-shell';
import { AuthFooterLinks } from './auth-footer-links';
import { AuthSubmitButton } from './auth-submit-button';
import {
  authAlertSx,
  authFieldSlotPropsCompact,
  authLinkSx,
  authPhoneCountrySx,
  authPhoneInputSx,
  authSelectMenuProps,
  authSelectSx,
} from './auth-form-styles';

const REFERRAL_STORAGE_KEY = 'battleasia_ref';

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod
  .object({
    inGameUserName: zod
      .string()
      .min(1, { message: 'In Game User Name is required!' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Only letters, numbers, and underscores are allowed!',
      }),
    mobile: zod.string().min(1, { message: 'Mobile No is required!' }),
    pubgId: pubgIdZodSchema,
    gameServer: zod.string().min(1, { message: 'Game Server is required!' }),
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Email must be a valid email address!' }),
    password: zod
      .string()
      .min(1, { message: 'Password is required!' })
      .min(8, { message: 'Password must be at least 8 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Confirm Password is required!' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignUpView() {
  const router = useRouter();
  const { registerApi } = useApi();
  const { t } = useTranslate();
  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
  }, []);

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      inGameUserName: '',
      mobile: '',
      pubgId: '',
      gameServer: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      if (!data.mobile || !isValidPhoneNumber(data.mobile)) {
        setErrorMessage(t('auth.invalidPhone'));
        return;
      }

      const phoneNumber = parsePhoneNumber(data.mobile);
      const countryCode = phoneNumber?.countryCallingCode || '';
      const mobileNo = phoneNumber?.nationalNumber || '';

      if (!countryCode || !mobileNo) {
        setErrorMessage(t('auth.invalidPhone'));
        return;
      }

      const res = await registerApi({
        email: data.email,
        password: data.password,
        username: data.inGameUserName,
        countryCode,
        mobileNo,
        pubgId: data.pubgId,
        gameServer: data.gameServer,
        referredBy: localStorage.getItem(REFERRAL_STORAGE_KEY) || undefined,
      });

      const { status, emailVerificationRequired, email: responseEmail } = res.data;

      if (!status) {
        const errorData = res.data;
        if (errorData?.emailVerificationPending && errorData?.email) {
          router.push(`${paths.auth.emailVerification}?email=${encodeURIComponent(errorData.email)}`);
          return;
        }
        throw new Error(res.data?.message || 'Registration failed');
      }

      if (emailVerificationRequired) {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
        router.push(
          `${paths.auth.emailVerification}?email=${encodeURIComponent(responseEmail || data.email)}`
        );
        return;
      }

      throw new Error('Email verification is required for all new accounts');
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.emailVerificationPending && errorData?.email) {
        router.push(`${paths.auth.emailVerification}?email=${encodeURIComponent(errorData.email)}`);
        return;
      }
      setErrorMessage(error?.response?.data?.message || error?.message || 'An error occurred');
    }
  });

  const fieldIcon = (icon: string) => (
    <InputAdornment position="start">
      <Iconify icon={icon} width={18} sx={{ color: '#f5c518' }} />
    </InputAdornment>
  );

  const compactSelectSx = { ...authSelectSx, minHeight: 40, '& .MuiSelect-select': { py: 1 } };

  // Phone needs a taller row so the absolute-positioned country selector fits cleanly
  const phoneSlotProps = {
    inputLabel: authFieldSlotPropsCompact.inputLabel,
    input: {
      ...authFieldSlotPropsCompact.input,
      sx: { ...authFieldSlotPropsCompact.input.sx, minHeight: 44, '& input': { paddingTop: '9px', paddingBottom: '9px' } },
    },
  };

  return (
    <AuthFormShell wide title={t('auth.signUpTitle')} description={t('auth.signUpDescription')}>
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 2.5 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 1.5,
            rowGap: 1.5,
          }}
        >
          <Field.Text
            name="inGameUserName"
            label={t('auth.inGameUserName')}
            placeholder={t('auth.inGameUserNamePlaceholder')}
            slotProps={{
              ...authFieldSlotPropsCompact,
              input: { ...authFieldSlotPropsCompact.input, startAdornment: fieldIcon('solar:user-bold-duotone') },
            }}
          />

          <Field.Text
            name="pubgId"
            label={t('auth.enterPubgId')}
            placeholder={t('auth.pubgIdPlaceholder')}
            slotProps={{
              ...authFieldSlotPropsCompact,
              input: { ...authFieldSlotPropsCompact.input, startAdornment: fieldIcon('solar:gamepad-bold-duotone') },
            }}
          />

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Field.Phone
              name="mobile"
              label={t('auth.countryCodeMobile')}
              placeholder={t('auth.mobilePlaceholder')}
              country="BD"
              countrySelectorSx={authPhoneCountrySx}
              sx={authPhoneInputSx}
              slotProps={phoneSlotProps}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel shrink sx={authFieldSlotPropsCompact.inputLabel.sx}>
              {t('auth.gameServer')}
            </InputLabel>
            <Controller
              name="gameServer"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Select {...field} displayEmpty error={!!error} MenuProps={authSelectMenuProps} sx={compactSelectSx}>
                    <MenuItem value="" disabled>
                      {t('auth.select')}
                    </MenuItem>
                    {GAME_SERVERS.map((server) => (
                      <MenuItem key={server.value} value={server.value}>
                        {server.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 0.5 }}>
                      {error.message}
                    </Typography>
                  )}
                </>
              )}
            />
          </FormControl>

          <Field.Text
            name="email"
            label={t('auth.emailAddress')}
            placeholder={t('auth.emailPlaceholder')}
            slotProps={{
              ...authFieldSlotPropsCompact,
              input: { ...authFieldSlotPropsCompact.input, startAdornment: fieldIcon('solar:letter-bold-duotone') },
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
                startAdornment: fieldIcon('solar:lock-password-bold-duotone'),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end" size="small" sx={{ color: alpha('#fff', 0.7) }}>
                      <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
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
              ...authFieldSlotPropsCompact,
              input: {
                ...authFieldSlotPropsCompact.input,
                startAdornment: fieldIcon('solar:lock-password-bold-duotone'),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showConfirmPassword.onToggle} edge="end" size="small" sx={{ color: alpha('#fff', 0.7) }}>
                      <Iconify icon={showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ gridColumn: '1 / -1', mt: 0.25 }}>
            <AuthSubmitButton loading={isSubmitting} loadingIndicator={t('auth.creatingAccount')} sx={{ py: 1.1 }}>
              {t('auth.createAccount')}
            </AuthSubmitButton>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <AuthFooterLinks
              prefix={t('auth.alreadyHaveAccount')}
              links={[{ label: t('auth.signIn'), href: paths.auth.signIn }]}
            />
          </Box>
        </Box>
      </Form>

      <Box sx={{ mt: 2, textAlign: 'center', fontSize: 11, color: alpha('#fff', 0.5), lineHeight: 1.6 }}>
        {`${t('auth.termsAgreement')} `}
        <Link component={RouterLink} href={paths.termsOfService} sx={authLinkSx}>
          {t('auth.termsOfService')}
        </Link>
        {` ${t('auth.and')} `}
        <Link component={RouterLink} href={paths.privacyPolicy} sx={authLinkSx}>
          {t('auth.privacyPolicy')}
        </Link>
        .
      </Box>

      <AuthNavButtons compact homeLabel={t('footer.home')} joinLabel={t('home.joinNow')} />
    </AuthFormShell>
  );
}
