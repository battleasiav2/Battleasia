import { z as zod } from 'zod';
import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';

import {
  Box,
  Link,
  Alert,
  Stack,
  Select,
  MenuItem,
  Checkbox,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import { dispatch } from 'src/store';
import { GAME_SERVERS } from 'src/global-config';
import { loginAction } from 'src/store/reducers/auth';

import { markShopSessionActive } from 'src/utils/shop-session';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthTrustRow } from './auth-trust-row';
import { AuthFooterLinks } from './auth-footer-links';
import { AuthSubmitButton } from './auth-submit-button';
import { AuthSocialButtons } from './auth-social-buttons';
import { AuthStepProgress } from './auth-step-progress';
import {
  authAlertSx,
  authBackLinkSx,
  authCardFooterSx,
  authFieldSlotPropsCompact,
  authLinkSx,
  authPhoneInputSx,
  authSelectMenuProps,
  authSelectSx,
} from './auth-form-styles';

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
    pubgId: zod
      .string()
      .min(1, { message: 'PUBG ID is required!' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Only letters, numbers, and underscores are allowed!',
      }),
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
    termsAccepted: zod.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service',
    }),
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
  const [step, setStep] = useState(1);

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
      termsAccepted: false,
    },
  });

  const { handleSubmit, control, trigger, formState: { isSubmitting } } = methods;

  const goNext = async () => {
    setErrorMessage(null);
    const valid = await trigger(['email', 'password', 'confirmPassword']);
    if (valid) setStep(2);
  };

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
      });

      const { status, session, user } = res.data;

      if (!status || !session?.accessToken) {
        throw new Error(res.data?.message || 'Registration failed');
      }

      dispatch(
        loginAction({
          user: user || { _id: '', email: data.email, username: data.inGameUserName },
          session: { accessToken: session.accessToken },
          balance: { balance: user?.balance || 0 },
        })
      );

      markShopSessionActive();

      router.push(paths.user.shop);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'An error occurred');
    }
  });

  const fieldIcon = (icon: string) => (
    <InputAdornment position="start">
      <Iconify icon={icon} width={16} sx={{ color: '#9CA3AF' }} />
    </InputAdornment>
  );

  const progress = step === 1 ? 50 : 100;
  const signupSteps = [
    { id: 1, title: t('auth.stepAccountInfo'), hint: t('auth.stepAccountHint') },
    { id: 2, title: t('auth.stepInGameInfo'), hint: t('auth.stepInGameHint') },
  ] as const;

  return (
    <Box sx={{ width: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AuthFormShell
        wide
        progress={progress}
        title={t('auth.createAccountTitle')}
        description={t('auth.signUpStepsDescription')}
        steps={<AuthStepProgress steps={signupSteps} currentStep={step} />}
      >
        {!!errorMessage && (
          <Alert severity="error" sx={{ ...authAlertSx, mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={1.75}>
            {step === 1 ? (
              <>
                <Field.Text
                  name="email"
                  label={t('auth.emailAddress')}
                  placeholder={t('auth.emailPlaceholder')}
                  slotProps={{
                    ...authFieldSlotPropsCompact,
                    input: {
                      ...authFieldSlotPropsCompact.input,
                      startAdornment: fieldIcon('solar:letter-bold-duotone'),
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
                      startAdornment: fieldIcon('solar:lock-password-bold-duotone'),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={showPassword.onToggle} edge="end" size="small" sx={{ color: '#9CA3AF' }}>
                            <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={16} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Field.Text
                  name="confirmPassword"
                  label={t('auth.confirmPassword')}
                  placeholder={t('auth.confirmPasswordHint')}
                  type={showConfirmPassword.value ? 'text' : 'password'}
                  slotProps={{
                    ...authFieldSlotPropsCompact,
                    input: {
                      ...authFieldSlotPropsCompact.input,
                      startAdornment: fieldIcon('solar:lock-password-bold-duotone'),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={showConfirmPassword.onToggle} edge="end" size="small" sx={{ color: '#9CA3AF' }}>
                            <Iconify icon={showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={16} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <AuthSubmitButton
                  type="button"
                  onClick={goNext}
                  startIcon={false}
                  endIcon={<Iconify icon="eva:arrow-forward-fill" width={16} />}
                >
                  {t('auth.continue')}
                </AuthSubmitButton>
              </>
            ) : (
              <>
                <Field.Text
                  name="inGameUserName"
                  label={t('auth.inGameUserName')}
                  placeholder={t('auth.inGameUserNamePlaceholder')}
                  slotProps={{
                    ...authFieldSlotPropsCompact,
                    input: {
                      ...authFieldSlotPropsCompact.input,
                      startAdornment: fieldIcon('solar:user-bold-duotone'),
                    },
                  }}
                />
                <Field.Text
                  name="pubgId"
                  label={t('auth.pubgId')}
                  placeholder={t('auth.pubgIdPlaceholder')}
                  slotProps={{
                    ...authFieldSlotPropsCompact,
                    input: {
                      ...authFieldSlotPropsCompact.input,
                      startAdornment: fieldIcon('solar:gamepad-bold-duotone'),
                    },
                  }}
                />
                <Field.Phone
                  name="mobile"
                  label={t('auth.countryCodeMobile')}
                  placeholder={t('auth.mobilePlaceholder')}
                  country="BD"
                  sx={authPhoneInputSx}
                  slotProps={{
                    inputLabel: authFieldSlotPropsCompact.inputLabel,
                    input: {
                      ...authFieldSlotPropsCompact.input,
                      sx: { ...authFieldSlotPropsCompact.input.sx, ...authPhoneInputSx },
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel shrink sx={authFieldSlotPropsCompact.inputLabel.sx}>
                    {t('auth.gameServer')}
                  </InputLabel>
                  <Controller
                    name="gameServer"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <Select {...field} displayEmpty error={!!error} MenuProps={authSelectMenuProps} sx={authSelectSx}>
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
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <FormControlLabel
                        sx={{ alignItems: 'flex-start', mx: 0, mt: 0.25 }}
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            size="small"
                            sx={{
                              color: alpha('#f5c518', 0.45),
                              mt: -0.25,
                              '&.Mui-checked': { color: '#f5c518' },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: 13, color: alpha('#fff', 0.55), lineHeight: 1.5 }}>
                            {t('auth.termsAgreement')}
                          </Typography>
                        }
                      />
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: -1, ml: 0.5 }}>
                          {error.message}
                        </Typography>
                      )}
                    </>
                  )}
                />
                <Link
                  component="button"
                  type="button"
                  onClick={() => setStep(1)}
                  sx={authBackLinkSx}
                >
                  <Iconify icon="eva:arrow-back-fill" width={14} />
                  {t('auth.back')}
                </Link>

                <AuthSubmitButton loading={isSubmitting}>{t('auth.createAccount')}</AuthSubmitButton>
              </>
            )}

            <AuthFooterLinks
              prefix={t('auth.alreadyHaveAccount')}
              links={[{ label: t('auth.signIn'), href: paths.auth.signIn }]}
            />
          </Stack>
        </Form>

        <Box sx={authCardFooterSx}>
          <AuthTrustRow insideCard />
        </Box>
      </AuthFormShell>

      <Box sx={{ width: 1, maxWidth: { xs: 1, sm: 420, md: 440 }, mt: 1.5 }}>
        <AuthSocialButtons />
      </Box>
    </Box>
  );
}
