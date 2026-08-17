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
  Select,
  MenuItem,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import useApi from 'src/hooks/use-api';

import { dispatch } from 'src/store';
import { GAME_SERVERS } from 'src/global-config';
import { loginAction } from 'src/store/reducers/auth';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { AuthFormShell } from './auth-form-shell';
import { AuthTrustRow } from './auth-trust-row';
import { AuthSubmitButton } from './auth-submit-button';
import { AuthSocialButtons } from './auth-social-buttons';
import {
  authAlertSx,
  authFieldSlotProps,
  authLinkSx,
  authFooterTextSx,
  authPhoneInputSx,
  authSelectSx,
  authSelectMenuProps,
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
    // referralCode: zod.string().optional(),
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

// ----------------------------------------------------------------------

export function SignUpView() {
  const { registerApi } = useApi();

  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignUpSchemaType = {
    inGameUserName: '',
    mobile: '',
    pubgId: '',
    gameServer: '',
    email: '',
    // referralCode: '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      // Parse phone number to extract country code and mobile number
      let countryCode = '';
      let mobileNo = '';

      if (data.mobile) {
        // First validate the phone number
        if (!isValidPhoneNumber(data.mobile)) {
          setErrorMessage('Please enter a valid phone number');
          return;
        }

        try {
          const phoneNumber = parsePhoneNumber(data.mobile);
          if (phoneNumber && phoneNumber.isValid()) {
            countryCode = phoneNumber.countryCallingCode || '';
            mobileNo = phoneNumber.nationalNumber || '';

            // Validate that country code was extracted
            if (!countryCode || countryCode.trim() === '') {
              setErrorMessage('Unable to extract country code from phone number. Please check your phone number format.');
              return;
            }

            // Validate that mobile number was extracted
            if (!mobileNo || mobileNo.trim() === '') {
              setErrorMessage('Unable to extract mobile number from phone number. Please check your phone number format.');
              return;
            }
          } else {
            setErrorMessage('Invalid phone number format. Please enter a valid phone number.');
            return;
          }
        } catch {
          setErrorMessage('Invalid phone number format. Please enter a valid phone number with country code.');
          return;
        }
      } else {
        setErrorMessage('Phone number is required');
        return;
      }

      const registerData = {
        email: data.email,
        password: data.password,
        username: data.inGameUserName,
        countryCode,
        mobileNo,
        pubgId: data.pubgId,
        gameServer: data.gameServer,
        // referralCode: data.referralCode,
      };

      const res = await registerApi(registerData);

      const { status, session, user } = res.data;

      if (!status || !session?.accessToken) {
        throw new Error(res.data?.message || 'Access token not found in response');
      }

      dispatch(
        loginAction({
          user: user || { _id: '', email: data.email, username: data.inGameUserName },
          session: { accessToken: session.accessToken },
          balance: { balance: user?.balance || 0 },
        })
      );

    } catch (error: any) {
      console.error(error);
      const feedbackMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        columnGap: 1.75,
        rowGap: 1.75,
      }}
    >
      {/* In Game User Name */}
      <Field.Text
        name="inGameUserName"
        label={
          <>
            In Game User Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </>
        }
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:user-bold-duotone" width={20} sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Enter your PUBG ID */}
      <Field.Text
        name="pubgId"
        label={
          <>
            Enter your PUBG ID <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </>
        }
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:gamepad-bold-duotone" width={20} sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Mobile No with Country Code — full width */}
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Field.Phone
          name="mobile"
          label={
            <>
              Country Code & Mobile No <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </>
          }
          slotProps={{
            ...authFieldSlotProps,
            input: {
              ...authFieldSlotProps.input,
              sx: { ...authFieldSlotProps.input.sx, ...authPhoneInputSx },
            },
          }}
        />
      </Box>

      {/* Game Server */}
      <FormControl fullWidth>
        <InputLabel shrink sx={authFieldSlotProps.inputLabel.sx}>
          Game Server <Box component="span" sx={{ color: 'error.main' }}>*</Box>
        </InputLabel>
        <Controller
          name="gameServer"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <Select
                {...field}
                label={
                  <>
                    Game Server <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </>
                }
                displayEmpty
                error={!!error}
                sx={authSelectSx}
                MenuProps={authSelectMenuProps}
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                {GAME_SERVERS.map((server) => (
                  <MenuItem key={server.value} value={server.value}>
                    {server.label}
                  </MenuItem>
                ))}
              </Select>
              {error && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {error.message}
                </Typography>
              )}
            </>
          )}
        />
      </FormControl>

      {/* Email */}
      <Field.Text
        name="email"
        label={
          <>
            Email <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </>
        }
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:letter-bold-duotone" width={20} sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Password */}
      <Field.Text
        name="password"
        label={
          <>
            Password <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </>
        }
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:lock-password-bold-duotone" width={20} sx={{ color: '#ffffff' }} />
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

      {/* Confirm Password */}
      <Field.Text
        name="confirmPassword"
        label={
          <>
            Confirm Password <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </>
        }
        type={showConfirmPassword.value ? 'text' : 'password'}
        slotProps={{
          ...authFieldSlotProps,
          input: {
            ...authFieldSlotProps.input,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:lock-password-bold-duotone" width={20} sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showConfirmPassword.onToggle} edge="end" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  <Iconify
                    icon={showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ gridColumn: '1 / -1', mt: 0.5 }}>
        <AuthSubmitButton loading={isSubmitting} loadingIndicator="Create account...">
          Create account
        </AuthSubmitButton>
      </Box>

      <Box sx={{ gridColumn: '1 / -1' }}>
        <AuthSocialButtons />
      </Box>
    </Box>
  );

  return (
    <AuthFormShell
      wide
      title="Create your account"
      description={
        <>
          Already have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} sx={authLinkSx}>
            Sign In
          </Link>
        </>
      }
    >
      {!!errorMessage && (
        <Alert severity="error" sx={{ ...authAlertSx, mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Box sx={{ ...authFooterTextSx, mt: 2 }}>
        By signing up, I agree to{' '}
        <Link underline="always" sx={authLinkSx}>
          Terms of service
        </Link>{' '}
        and{' '}
        <Link underline="always" sx={authLinkSx}>
          Privacy policy
        </Link>
        .
      </Box>

      <AuthTrustRow />
    </AuthFormShell>
  );
}

