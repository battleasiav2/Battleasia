import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { useCallback, useEffect, useMemo } from 'react';
import useApi from 'src/hooks/use-api';
import { useFileUpload } from 'src/hooks/use-file-upload';
// config
import { API_URL } from 'src/config-global';
// components
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { fData } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export const GameSchema = Yup.object().shape({
    name: Yup.string().required('Game name is required!'),
    packageName: Yup.string().required('Package name is required!'),
    image: Yup.mixed<File | string>().nullable().optional(),
    logo: Yup.mixed<File | string>().nullable().optional(),
    canCreateChallenge: Yup.boolean().default(true),
    status: Yup.string().oneOf(['active', 'inactive']).required('Status is required!'),
    comingSoon: Yup.boolean().default(false),
    idPrefix: Yup.string().required('ID prefix is required!').max(10, 'ID prefix must be 10 characters or less'),
    rules: Yup.string().optional(),
});

type ISchemaType = Yup.InferType<typeof GameSchema>;

type DialogMode = 'create' | 'edit';

export interface IGameRow {
    id: string;
    name: string;
    packageName: string;
    image?: string;
    logo?: string;
    canCreateChallenge: boolean;
    status: 'active' | 'inactive';
    comingSoon: boolean;
    idPrefix: string;
    rules?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    mode?: DialogMode;
    game?: IGameRow | null;
    onSuccess?: () => void;
};

export function GameDialog({
    open,
    onClose,
    loading = false,
    mode = 'create',
    game = null,
    onSuccess,
}: Props) {
    const { createGameApi, updateGameApi } = useApi();
    const isEdit = mode === 'edit' && !!game;

    const { uploadFile: uploadImageFile, deleteFile: deleteImageFile, uploading: uploadingImage } = useFileUpload({
        maxSize: 3145728, // 3MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        endpoint: 'api/v1/files/upload',
        fieldName: 'file',
        folder: 'games',
    });

    const { uploadFile: uploadLogoFile, deleteFile: deleteLogoFile, uploading: uploadingLogo } = useFileUpload({
        maxSize: 3145728, // 3MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        endpoint: 'api/v1/files/upload',
        fieldName: 'file',
        folder: 'games',
    });

    const defaultValues: ISchemaType = useMemo(
        () => ({
            name: '',
            packageName: '',
            image: null,
            logo: null,
            canCreateChallenge: true,
            status: 'active',
            comingSoon: false,
            idPrefix: '',
            rules: '',
        }),
        []
    );

    const methods = useForm<ISchemaType>({
        resolver: yupResolver(GameSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting },
        setValue,
    } = methods;

    useEffect(() => {
        if (!open) {
            return;
        }

        if (isEdit && game) {
            reset({
                name: game.name || '',
                packageName: game.packageName || '',
                image: game.image ? `${API_URL}${game.image}` : null,
                logo: game.logo ? `${API_URL}${game.logo}` : null,
                canCreateChallenge: game.canCreateChallenge ?? true,
                status: game.status === 'active' ? 'active' : 'inactive',
                comingSoon: game.comingSoon ?? false,
                idPrefix: game.idPrefix || '',
                rules: game.rules || '',
            });
        } else {
            reset(defaultValues);
        }
    }, [defaultValues, isEdit, open, game, reset]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const onSubmitForm = handleSubmit(async (data) => {
        // Upload image if a file is provided
        let imageUrl = '';
        if (data.image instanceof File) {
            if (isEdit && game?.image) {
                await deleteImageFile(game.image);
            }
            const uploadedUrl = await uploadImageFile(data.image);
            if (!uploadedUrl) {
                toast.error('Failed to upload game image');
                return;
            }
            imageUrl = uploadedUrl;
        } else if (typeof data.image === 'string') {
            if (isEdit) {
                imageUrl = game?.image ?? '';
            } else {
                imageUrl = data.image;
            }
        }

        // Upload logo if a file is provided
        let logoUrl = '';
        if (data.logo instanceof File) {
            if (isEdit && game?.logo) {
                await deleteLogoFile(game.logo);
            }
            const uploadedUrl = await uploadLogoFile(data.logo);
            if (!uploadedUrl) {
                toast.error('Failed to upload game logo');
                return;
            }
            logoUrl = uploadedUrl;
        } else if (typeof data.logo === 'string') {
            if (isEdit) {
                logoUrl = game?.logo ?? '';
            } else {
                logoUrl = data.logo;
            }
        }

        const payload: any = {
            name: data.name,
            packageName: data.packageName,
            image: imageUrl,
            logo: logoUrl,
            canCreateChallenge: data.canCreateChallenge,
            status: data.status === 'active',
            comingSoon: data.comingSoon,
            idPrefix: data.idPrefix.toUpperCase(),
            rules: data.rules || '',
        };

        try {
            if (isEdit && game) {
                const response = await updateGameApi(game.id, payload);
                if (response?.data?.status) {
                    toast.success('Game updated successfully');
                    onSuccess?.();
                    handleClose();
                }
            } else {
                const response = await createGameApi(payload);
                if (response?.data?.status) {
                    toast.success('Game created successfully');
                    onSuccess?.();
                    handleClose();
                }
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to save game');
        }
    });

    const handleDropImage = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('image', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );

    const handleDropLogo = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('logo', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );

    const dialogTitle = isEdit ? 'Edit Game' : 'Create New Game';
    const actionLabel = isEdit ? 'Save Changes' : 'Create';

    const renderForm = () => (
        <>
            <Stack spacing={2} sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <RHFTextField
                            name="name"
                            label="Game Name"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RHFTextField
                            name="packageName"
                            label="Package Name"
                            required
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <RHFUploadAvatar
                            name="image"
                            maxSize={10 * 1024 * 1024}
                            onDrop={handleDropImage}
                            rounded="square"
                            sx={{
                                width: 1,
                            }}
                            helperText={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.5,
                                        mx: 'auto',
                                        display: 'block',
                                        textAlign: 'center',
                                        color: 'text.disabled',
                                    }}
                                >
                                    Game Image
                                </Typography>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RHFUploadAvatar
                            name="logo"
                            maxSize={10 * 1024 * 1024}
                            onDrop={handleDropLogo}
                            rounded="square"
                            sx={{
                                width: 1,
                            }}
                            helperText={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.5,
                                        mx: 'auto',
                                        display: 'block',
                                        textAlign: 'center',
                                        color: 'text.disabled',
                                    }}
                                >
                                    Game Logo
                                </Typography>
                            }
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <RHFTextField
                            name="idPrefix"
                            label="ID Prefix"
                            required
                            fullWidth
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                            helperText="Will be converted to uppercase"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel shrink>Status</InputLabel>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Select
                                            {...field}
                                            label="Status"
                                            error={!!error}
                                        >
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
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
                    </Grid>
                </Grid>

                <RHFTextField
                    name="rules"
                    label="Rules"
                    fullWidth
                    multiline
                    rows={4}
                />

                <Stack direction="row" spacing={3}>
                    <Controller
                        name="canCreateChallenge"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Switch {...field} checked={field.value} />}
                                label="Can Create Challenge"
                            />
                        )}
                    />
                    <Controller
                        name="comingSoon"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Switch {...field} checked={field.value} />}
                                label="Coming Soon"
                            />
                        )}
                    />
                </Stack>
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
                    loading={loading || isSubmitting || uploadingImage || uploadingLogo}
                >
                    {actionLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

