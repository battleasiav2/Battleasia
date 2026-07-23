import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
// @mui
import { LoadingButton } from '@mui/lab';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Switch,
    FormControlLabel,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Box,
    Typography,
    Grid,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useApi from 'src/hooks/use-api';
import { useFileUpload } from 'src/hooks/use-file-upload';
import { usePermissions } from 'src/hooks/use-permissions';
import { PERMISSIONS } from 'src/constants/permissions';
import { useSelector } from 'src/store';
// config
import { API_URL, GAME_SERVERS } from 'src/config-global';
// components
import FormProvider, { RHFTextField, RHFPhoneInput, RHFUploadAvatar, RHFSelect } from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';
import { IUserRow } from 'src/types';
import { pubgIdYupSchema } from 'src/utils/pubg-id';

// ----------------------------------------------------------------------

export const PlayerSchema = Yup.object().shape({
    avatar: Yup.mixed<File | string>().nullable().optional(),
    username: Yup.string().required('Username is required!'),
    email: Yup.string().required('Email is required!').email('Email must be a valid email address!'),
    password: Yup.string()
        .nullable()
        .notRequired()
        .test('passwordLength', 'Password must be at least 8 characters!', (value) => !value || value.length >= 8),
    mobile: Yup.string().optional(),
    pubgId: pubgIdYupSchema,
    gameServer: Yup.string().optional(),
    referralCode: Yup.string().optional(),
    status: Yup.boolean().default(true),
    role: Yup.string().nullable().optional(),
});

type ISchemaType = Yup.InferType<typeof PlayerSchema>;

type IRole = {
    id: string;
    name: string;
    level: number;
};

type DialogMode = 'create' | 'edit';

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    mode?: DialogMode;
    player?: IUserRow | null;
    onSuccess?: () => void;
};

export function PlayerDialog({
    open,
    onClose,
    loading = false,
    mode = 'create',
    player = null,
    onSuccess,
}: Props) {
    const { createPlayerApi, updatePlayerApi, getChildRolesApi, getUserByIdApi } = useApi();
    const { hasPermission } = usePermissions();
    const { user: currentUser } = useSelector((state) => state.auth);
    const isEdit = mode === 'edit' && !!player;
    const [availableRoles, setAvailableRoles] = useState<IRole[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [playerRoleId, setPlayerRoleId] = useState<string | null>(null);

    const { uploadFile: uploadAvatarFile, deleteFile: deleteAvatarFile, uploading: uploadingAvatar } = useFileUpload({
        maxSize: 3145728, // 3MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        endpoint: 'api/v1/files/upload',
        fieldName: 'file',
        folder: 'avatar',
    });

    const defaultValues: ISchemaType = useMemo(
        () => ({
            avatar: null,
            username: '',
            email: '',
            password: '',
            mobile: '',
            pubgId: '',
            gameServer: '',
            referralCode: '',
            status: true,
            role: null,
        }),
        []
    );

    const methods = useForm<ISchemaType>({
        resolver: yupResolver(PlayerSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting },
        setValue,
        setError
    } = methods;

    // Load available child roles
    const loadAvailableRoles = useCallback(async () => {
        if (!open) return;

        setLoadingRoles(true);
        try {
            const response = await getChildRolesApi();
            if (response?.data?.status && response.data.data) {
                const formattedRoles = response.data.data.map((role: any) => ({
                    id: role.id || role._id,
                    name: role.name,
                    level: role.level || 0,
                }));
                setAvailableRoles(formattedRoles);
            }
        } catch (error) {
            console.error('Failed to load available roles:', error);
            setAvailableRoles([]);
        } finally {
            setLoadingRoles(false);
        }
    }, [open, getChildRolesApi]);

    useEffect(() => {
        loadAvailableRoles();
    }, [loadAvailableRoles]);

    const formatPhoneForInput = useCallback((countryCode?: string | null, mobileNo?: string | null) => {
        if (!countryCode) {
            return mobileNo || '';
        }
        return `+${countryCode}${mobileNo || ''}`;
    }, []);

    // Fetch player role when editing
    useEffect(() => {
        const fetchPlayerRole = async () => {
            if (!open || !isEdit || !player) {
                setPlayerRoleId(null);
                return;
            }

            try {
                const response = await getUserByIdApi(player.id);
                if (response?.data?.status && response.data.data) {
                    const userData = response.data.data;
                    const roleId = userData.role?.id || userData.role?._id || null;
                    setPlayerRoleId(roleId);
                }
            } catch (error) {
                console.error('Failed to fetch player role:', error);
                setPlayerRoleId(null);
            }
        };

        fetchPlayerRole();
    }, [open, isEdit, player, getUserByIdApi]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (isEdit && player) {
            reset({
                avatar: player.avatar ? `${API_URL}${player.avatar}` : null,
                username: player.username || '',
                email: player.email || '',
                password: '',
                mobile: formatPhoneForInput(player.countryCode, player.mobileNo),
                pubgId: player.pubgId || '',
                gameServer: player.gameServer || '',
                referralCode: player.referralCode || '',
                status: player.status ?? true,
                role: playerRoleId,
            });
        } else {
            reset(defaultValues);
        }
    }, [defaultValues, formatPhoneForInput, isEdit, open, player, playerRoleId, reset]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const onSubmitForm = handleSubmit(async (data) => {
        if (!isEdit && !data.password) {
            setError('password', { type: 'manual', message: 'Password is required!' });
            return;
        }

        // Upload avatar if a file is provided
        let avatarUrl = '';
        if (data.avatar instanceof File) {
            if (isEdit && player?.avatar) {
                await deleteAvatarFile(player.avatar);
            }
            const uploadedUrl = await uploadAvatarFile(data.avatar);
            if (!uploadedUrl) {
                toast.error('Failed to upload avatar image');
                return;
            }
            avatarUrl = uploadedUrl;
        } else if (typeof data.avatar === 'string') {
            avatarUrl = data.avatar;
            if (isEdit)
                avatarUrl = player?.avatar ?? "";
        }

        // Parse phone number to extract country code and mobile number
        let countryCode = '';
        let mobileNo = '';

        if (data.mobile) {
            // First validate the phone number
            if (!isValidPhoneNumber(data.mobile)) {
                toast.error('Please enter a valid phone number');
                return;
            }

            try {
                const phoneNumber = parsePhoneNumber(data.mobile);
                if (phoneNumber && phoneNumber.isValid()) {
                    countryCode = phoneNumber.countryCallingCode || '';
                    mobileNo = phoneNumber.nationalNumber || '';

                    // Validate that country code was extracted
                    if (!countryCode || countryCode.trim() === '') {
                        toast.error('Unable to extract country code from phone number. Please check your phone number format.');
                        return;
                    }

                    // Validate that mobile number was extracted
                    if (!mobileNo || mobileNo.trim() === '') {
                        toast.error('Unable to extract mobile number from phone number. Please check your phone number format.');
                        return;
                    }
                } else {
                    toast.error('Invalid phone number format. Please enter a valid phone number.');
                    return;
                }
            } catch (error) {
                toast.error('Invalid phone number format. Please enter a valid phone number with country code.');
                return;
            }
        }

        const payload: any = {
            username: data.username,
            email: data.email,
            password: data.password || '',
            pubgId: data.pubgId,
            gameServer: data.gameServer,
            referralCode: data.referralCode,
            status: data.status,
            avatar: avatarUrl,
            countryCode,
            mobileNo,
            role: data.role || null,
        };

        try {
            if (isEdit && player) {
                if (!hasPermission(PERMISSIONS.USERS.EDIT)) {
                    toast.error('You do not have permission to edit users');
                    return;
                }
                if (!payload.password) {
                    delete payload.password;
                }
                const response = await updatePlayerApi(player.id, payload);
                if (response?.data?.status) {
                    toast.success('Player updated successfully');
                    onSuccess?.();
                    handleClose();
                }
            } else {
                if (!hasPermission(PERMISSIONS.USERS.CREATE)) {
                    toast.error('You do not have permission to create users');
                    return;
                }
                if (!payload.password) {
                    toast.error('Password is required!');
                    return;
                }
                const response = await createPlayerApi(payload);
                if (response?.data?.status) {
                    toast.success('Player created successfully');
                    onSuccess?.();
                    handleClose();
                }
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save player');
        }
    });

    const handleDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('avatar', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );


    const dialogTitle = isEdit ? 'Edit Player' : 'Create New Player';
    const actionLabel = isEdit ? 'Save Changes' : 'Create';

    const renderForm = () => (
        <>
            <Stack spacing={2} sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <RHFUploadAvatar
                            name="avatar"
                            maxSize={10 * 1024 * 1024}
                            onDrop={handleDrop}
                            helperText={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 3,
                                        mx: 'auto',
                                        display: 'block',
                                        textAlign: 'center',
                                        color: 'text.disabled',
                                    }}
                                >
                                    Allowed *.jpeg, *.jpg, *.png, *.gif
                                    <br /> max size of {fData(10 * 1024 * 1024)}
                                </Typography>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                            <RHFTextField
                                name="username"
                                label="Username"
                                required
                                fullWidth
                            />
                            <RHFTextField
                                name="email"
                                label="Email"
                                type="email"
                                required
                                fullWidth
                            />
                            <RHFTextField
                                name="password"
                                label="Password"
                                type="password"
                                required={!isEdit}
                                helperText={isEdit ? 'Leave blank to keep the current password' : undefined}
                                fullWidth
                            />
                        </Stack>
                    </Grid>
                </Grid>
                <RHFPhoneInput
                    name="mobile"
                    label="Country Code & Mobile No"
                    fullWidth
                    required
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <RHFTextField
                    name="pubgId"
                    label="PUBG ID"
                    required
                    fullWidth
                />
                <FormControl fullWidth>
                    <InputLabel shrink>
                        Game Server <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </InputLabel>
                    <Controller
                        name="gameServer"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Select
                                    {...field}
                                    label="Game Server"
                                    displayEmpty
                                    error={!!error}
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
                <RHFTextField
                    name="referralCode"
                    label="Referral Code"
                    fullWidth
                />
                {availableRoles.length > 0 && (
                    <RHFSelect name="role" label="Role" fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    >
                        <MenuItem value="">None (Default Role)</MenuItem>
                        {availableRoles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                                {'  '.repeat(role.level)} {role.name}
                            </MenuItem>
                        ))}
                    </RHFSelect>
                )}
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Active Status"
                        />
                    )}
                />
            </Stack>
        </>
    );

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent dividers>
                <FormProvider methods={methods} onSubmit={onSubmitForm}>
                    {renderForm()}
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                    variant="contained"
                    onClick={onSubmitForm}
                    loading={loading || isSubmitting || uploadingAvatar}
                >
                    {actionLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

