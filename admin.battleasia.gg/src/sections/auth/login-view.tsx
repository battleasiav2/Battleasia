import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// store
import { dispatch } from 'src/store';
import { loginAction } from 'src/store/reducers/auth';
import useApi from 'src/hooks/use-api';
// routes
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useSearchParams, useRouter } from 'src/routes/hooks';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
    const router = useRouter();
    const { loginApi, verifyOtpApi } = useApi();

    const [errorMsg, setErrorMsg] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const password = useBoolean();

    const LoginSchema = Yup.object().shape({
        email: Yup.string().required('Email is required').email('Email must be a valid email address'),
        password: Yup.string().required('Password is required'),
    });

    const OtpSchema = Yup.object().shape({
        code: Yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
    });

    const loginMethods = useForm({
        resolver: yupResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const otpMethods = useForm({
        resolver: yupResolver(OtpSchema),
        defaultValues: {
            code: '',
        },
    });

    const onSubmitLogin = loginMethods.handleSubmit(async (data) => {
        setErrorMsg('');
        try {
            const res = await loginApi?.(data.email, data.password);
            if (res?.data?.otpRequired) {
                setCredentials({ email: data.email, password: data.password });
                setOtpStep(true);
                return;
            }
            setErrorMsg('Login failed. Please check your email and password.');
        } catch (error: any) {
            setErrorMsg(error?.response?.data?.message || error?.message || 'Login failed.');
        }
    });

    const onSubmitOtp = otpMethods.handleSubmit(async (data) => {
        setErrorMsg('');
        try {
            const res = await verifyOtpApi?.(credentials.email, credentials.password, data.code);
            if (!res?.data?.session?.accessToken) {
                setErrorMsg('OTP verification failed.');
                return;
            }
            dispatch(loginAction(res.data));
            router.push(returnTo || PATH_AFTER_LOGIN);
        } catch (error: any) {
            setErrorMsg(error?.response?.data?.message || error?.message || 'OTP verification failed.');
        }
    });

    if (otpStep) {
        return (
            <FormProvider methods={otpMethods} onSubmit={onSubmitOtp}>
                <Stack spacing={2} sx={{ mb: 5 }}>
                    <Typography variant="h4">Verify OTP</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter the 6-digit code sent for {credentials.email}
                    </Typography>
                </Stack>

                <Stack spacing={2.5}>
                    {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                    <RHFTextField name="code" label="OTP code" inputProps={{ maxLength: 6 }} />

                    <LoadingButton
                        fullWidth
                        color="inherit"
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={otpMethods.formState.isSubmitting}
                    >
                        Verify & Sign In
                    </LoadingButton>

                    <LoadingButton
                        fullWidth
                        color="inherit"
                        size="large"
                        variant="outlined"
                        onClick={() => {
                            setOtpStep(false);
                            setErrorMsg('');
                        }}
                    >
                        Back
                    </LoadingButton>
                </Stack>
            </FormProvider>
        );
    }

    return (
        <FormProvider methods={loginMethods} onSubmit={onSubmitLogin}>
            <Stack spacing={2} sx={{ mb: 5 }}>
                <Typography variant="h4">Sign in to Admin</Typography>
            </Stack>

            <Stack spacing={2.5}>
                {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                <RHFTextField name="email" label="Email address" />

                <RHFTextField
                    name="password"
                    label="Password"
                    type={password.value ? 'text' : 'password'}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={password.onToggle} edge="end">
                                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
                    Forgot password?
                </Link>

                <LoadingButton
                    fullWidth
                    color="inherit"
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={loginMethods.formState.isSubmitting}
                >
                    Continue
                </LoadingButton>
            </Stack>
        </FormProvider>
    );
}
