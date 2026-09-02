import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';

import LoadingButton from '@mui/lab/LoadingButton';
import { alpha } from '@mui/material/styles';
import {
    Box,
    Chip,
    Alert,
    Stack,
    Dialog,
    Select,
    MenuItem,
    InputLabel,
    Typography,
    DialogTitle,
    FormControl,
    DialogActions,
    DialogContent,
} from '@mui/material';

import useApi from 'src/hooks/use-api';

import { GAME_SERVERS } from 'src/global-config';
import { useDispatch, useSelector } from 'src/store';
import { userAction, balanceAction } from 'src/store/reducers/auth';
import {
    UserGlassCard,
    UserPageTitle,
    UserActionButton,
    USER_COLORS,
    userMutedTextSx,
    userGoldButtonSx,
    userGlassDialogPaperSx,
    userSelectMenuProps,
    getUserChipSx, goldAlpha } from 'src/layouts/user';

import { getDefaultGlassTokens, getGlassInnerSx, getGlassShellSx } from 'src/components/battle-glass-card';

import { toast } from 'react-hot-toast';
import { Form, Field } from 'src/components/hook-form';
import { fDateTime } from 'src/utils/format-time';
import { useTranslate } from 'src/locales/use-locales';
import { pubgIdZodSchema } from 'src/utils/pubg-id';
import { authFieldSlotProps } from 'src/sections/auth/auth-form-styles';


// ----------------------------------------------------------------------


export const ProfileEditSchema = zod.object({
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
    referralCode: zod.string().optional(),
    twitterLink: zod
        .string()
        .optional()
        .refine((val) => !val || val.trim() === '' || /^https?:\/\/.+/.test(val), {
            message: 'Twitter link must be a valid URL',
        }),
    facebookLink: zod
        .string()
        .optional()
        .refine((val) => !val || val.trim() === '' || /^https?:\/\/.+/.test(val), {
            message: 'Facebook link must be a valid URL',
        }),
    instagramLink: zod
        .string()
        .optional()
        .refine((val) => !val || val.trim() === '' || /^https?:\/\/.+/.test(val), {
            message: 'Instagram link must be a valid URL',
        }),
});

export type ProfileEditSchemaType = zod.infer<typeof ProfileEditSchema>;

// ----------------------------------------------------------------------

type ProfileContentProps = {
    pendingAvatarFile: File | null;
    onAvatarSaved?: () => void;
};

export function ProfileContent({ pendingAvatarFile, onAvatarSaved }: ProfileContentProps) {
    const { t } = useTranslate();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { updateProfileApi, activatePremiumApi, getPremiumDetailsApi } = useApi();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
    const [premiumLoading, setPremiumLoading] = useState(false);
    const [premiumDuration, setPremiumDuration] = useState(0);
    const [premiumPrice, setPremiumPrice] = useState(0);

    // Construct mobile number with country code for the phone input
    const getDefaultMobile = () => {
        if (user?.countryCode && user?.mobileNo) {
            return `+${user.countryCode}${user.mobileNo}`;
        }
        return '';
    };

    const defaultValues: ProfileEditSchemaType = {
        inGameUserName: user?.username || '',
        mobile: getDefaultMobile(),
        pubgId: user?.pubgId || '',
        gameServer: user?.gameServer || '',
        email: user?.email || '',
        referralCode: user?.referralCode || '',
        twitterLink: user?.twitterLink || '',
        facebookLink: user?.facebookLink || '',
        instagramLink: user?.instagramLink || '',
    };

    const methods = useForm<ProfileEditSchemaType>({
        resolver: zodResolver(ProfileEditSchema),
        defaultValues,
        values: {
            inGameUserName: user?.username || '',
            mobile: getDefaultMobile(),
            pubgId: user?.pubgId || '',
            gameServer: user?.gameServer || '',
            email: user?.email || '',
            referralCode: user?.referralCode || '',
            twitterLink: user?.twitterLink || '',
            facebookLink: user?.facebookLink || '',
            instagramLink: user?.instagramLink || '',
        },
    });

    const {
        handleSubmit,
        control,
        reset,
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
                    setErrorMessage(t('profile.errors.invalidPhoneNumber'));
                    return;
                }

                try {
                    const phoneNumber = parsePhoneNumber(data.mobile);
                    if (phoneNumber && phoneNumber.isValid()) {
                        countryCode = phoneNumber.countryCallingCode || '';
                        mobileNo = phoneNumber.nationalNumber || '';

                        // Validate that country code was extracted
                        if (!countryCode || countryCode.trim() === '') {
                            setErrorMessage(t('profile.errors.unableToExtractCountryCode'));
                            return;
                        }

                        // Validate that mobile number was extracted
                        if (!mobileNo || mobileNo.trim() === '') {
                            setErrorMessage(t('profile.errors.unableToExtractMobile'));
                            return;
                        }
                    } else {
                        setErrorMessage(t('profile.errors.invalidPhoneFormat'));
                        return;
                    }
                } catch {
                    setErrorMessage(t('profile.errors.invalidPhoneWithCountryCode'));
                    return;
                }
            } else {
                setErrorMessage(t('profile.errors.phoneRequired'));
                return;
            }

            let avatarUrl = user?.avatar || '';

            if (pendingAvatarFile) {
                // Convert file to base64 data URL
                avatarUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error(t('profile.errors.failedToUploadAvatar')));
                    reader.readAsDataURL(pendingAvatarFile);
                });
            }

            const payload = {
                username: data.inGameUserName,
                email: data.email,
                countryCode,
                mobileNo,
                pubgId: data.pubgId,
                gameServer: data.gameServer,
                referralCode: data.referralCode,
                twitterLink: data.twitterLink || '',
                facebookLink: data.facebookLink || '',
                instagramLink: data.instagramLink || '',
                avatar: avatarUrl,
            };

            const response = await updateProfileApi(payload);
            const responseData = response?.data;

            if (!responseData?.status) {
                const apiMessage =
                    responseData?.message || t('profile.errors.failedToUpdateProfile');
                throw new Error(apiMessage);
            }

            const updatedUser = responseData?.user || payload;

            dispatch(
                userAction({
                    _id: updatedUser._id || user?._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    pubgId: updatedUser.pubgId,
                    gameServer: updatedUser.gameServer,
                    referralCode: updatedUser.referralCode,
                    countryCode: updatedUser.countryCode,
                    mobileNo: updatedUser.mobileNo,
                    avatar: updatedUser.avatar || avatarUrl,
                    twitterLink: updatedUser.twitterLink,
                    facebookLink: updatedUser.facebookLink,
                    instagramLink: updatedUser.instagramLink,
                })
            );

            if (pendingAvatarFile) {
                onAvatarSaved?.();
            }

            reset({
                inGameUserName: updatedUser.username || '',
                mobile: data.mobile,
                pubgId: updatedUser.pubgId || '',
                gameServer: updatedUser.gameServer || '',
                email: updatedUser.email || '',
                referralCode: updatedUser.referralCode || '',
                twitterLink: updatedUser.twitterLink || '',
                facebookLink: updatedUser.facebookLink || '',
                instagramLink: updatedUser.instagramLink || '',
            });

            toast.success(responseData?.message || t('profile.profileUpdatedSuccess'));
        } catch (error) {
            console.error(error);
            const errorMsg =
                (error as any)?.response?.data?.message ||
                (error as Error)?.message ||
                t('profile.errors.failedToUpdateProfile');
            setErrorMessage(errorMsg);
        }
    });

    const getPremium = async () => {
        const response = await getPremiumDetailsApi();
        const responseData = response?.data;
        if (responseData?.status) {
            setPremiumDuration(responseData?.premium?.premiumDuration);
            setPremiumPrice(responseData?.premium?.premiumPrice);
        }
    };
    useEffect(() => {
        getPremium();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isPremiumActive =
        !!user?.isPremium && (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt).getTime() > Date.now());
    const premiumExpiresAt = user?.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;

    const handleActivatePremium = async () => {
        try {
            setPremiumLoading(true);
            const response = await activatePremiumApi();
            const responseUser = response?.data?.user;
            if (responseUser) {
                dispatch(userAction({ ...responseUser }));
                if (typeof responseUser.balance === 'number') {
                    dispatch(balanceAction(responseUser.balance));
                }
            }
            toast.success(t('profile.premiumActivatedSuccess'));
            setPremiumDialogOpen(false);
        } catch {
            console.error('Activate premium failed');
            // toast.error(msg, { id: 'activate-premium-failed' });
        } finally {
            setPremiumLoading(false);
        }
    };

    const tokens = getDefaultGlassTokens();

    return (
        <UserGlassCard noPadding sx={{ height: 1 }}>
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box
                sx={getGlassShellSx(tokens, {
                    mb: 3,
                    p: 2.5,
                    borderColor: goldAlpha(0.28),
                })}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                            <Typography className="font-tr" sx={{ fontSize: 20, fontWeight: 800, color: USER_COLORS.gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {t('profile.premiumMembership')}
                            </Typography>
                            <Chip
                                label={isPremiumActive ? t('common.active') : t('common.inactive')}
                                size="small"
                                sx={getUserChipSx(isPremiumActive ? 'success' : 'neutral')}
                            />
                        </Stack>
                        <Typography variant="body2" sx={{ ...userMutedTextSx, mb: 1.5 }}>
                            {t('profile.premiumDescription')}
                        </Typography>
                        <Stack spacing={0.5} sx={userMutedTextSx}>
                            <Typography variant="body2">• {t('profile.premiumBadge')}</Typography>
                            <Typography variant="body2">• {t('profile.earlyAccess')}</Typography>
                            <Typography variant="body2">• {t('profile.monthlyEvents')}</Typography>
                            {isPremiumActive && premiumExpiresAt && (
                                <Typography variant="body2" sx={{ color: USER_COLORS.success, fontWeight: 600 }}>
                                    {t('profile.expiresOn')} {fDateTime(premiumExpiresAt)}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                        <UserActionButton
                            actionVariant={isPremiumActive ? 'ghost' : 'gold'}
                            onClick={() => setPremiumDialogOpen(true)}
                            disabled={premiumLoading}
                            fullWidth
                        >
                            {isPremiumActive ? t('profile.extendPremium') : t('profile.getPremium')}
                        </UserActionButton>
                    </Stack>
                </Stack>
            </Box>

            <UserPageTitle
                title={t('profile.editProfile')}
                subtitle={t('profile.updateProfileInfo')}
                sx={{ mb: 2.5 }}
            />

            <Box sx={getGlassInnerSx(tokens, { p: { xs: 2, md: 2.5 } })}>
            {!!errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        bgcolor: alpha(USER_COLORS.error, 0.12),
                        color: USER_COLORS.textPrimary,
                        border: `1px solid ${alpha(USER_COLORS.error, 0.3)}`,
                        '& .MuiAlert-icon': { color: USER_COLORS.error },
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                    <Field.Text
                        name="inGameUserName"
                        label={
                            <>
                                {t('auth.inGameUserName')} <Box component="span" sx={{ color: USER_COLORS.error }}>*</Box>
                            </>
                        }
                        slotProps={authFieldSlotProps}
                    />

                    <Field.Phone
                        name="mobile"
                        label={
                            <>
                                {t('auth.countryCodeMobile')} <Box component="span" sx={{ color: USER_COLORS.error }}>*</Box>
                            </>
                        }
                        slotProps={{ ...authFieldSlotProps, inputLabel: { ...authFieldSlotProps.inputLabel, shrink: true } }}
                    />

                    <Field.Text
                        name="pubgId"
                        label={
                            <>
                                {t('auth.enterPubgId')} <Box component="span" sx={{ color: USER_COLORS.error }}>*</Box>
                            </>
                        }
                        slotProps={authFieldSlotProps}
                    />

                    <FormControl fullWidth>
                        <InputLabel
                            shrink
                            sx={{
                                position: 'relative',
                                transform: 'none',
                                fontSize: 12,
                                fontWeight: 600,
                                letterSpacing: 0.4,
                                color: alpha('#ffffff', 0.82),
                                mb: 0.75,
                                textTransform: 'uppercase',
                            }}
                        >
                            {t('auth.gameServer')} <Box component="span" sx={{ color: USER_COLORS.error }}>*</Box>
                        </InputLabel>
                        <Controller
                            name="gameServer"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <>
                                    <Select
                                        {...field}
                                        displayEmpty
                                        error={!!error}
                                        MenuProps={userSelectMenuProps}
                                        sx={{
                                            color: USER_COLORS.textPrimary,
                                            bgcolor: alpha('#000000', 0.5),
                                            borderRadius: 0,
                                            minHeight: 48,
                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                            '& fieldset': { border: `1px solid ${alpha('#ffffff', 0.22)}` },
                                            '&:hover fieldset': { borderColor: alpha('#ffffff', 0.38) },
                                            '&.Mui-focused fieldset': { borderColor: USER_COLORS.gold },
                                            '& .MuiSelect-icon': { color: alpha('#ffffff', 0.65) },
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            {t('common.select')}
                                        </MenuItem>
                                        {GAME_SERVERS.map((server) => (
                                            <MenuItem key={server.value} value={server.value}>
                                                {server.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {error && (
                                        <Typography variant="caption" sx={{ color: USER_COLORS.error, mt: 0.5, ml: 1.5 }}>
                                            {error.message}
                                        </Typography>
                                    )}
                                </>
                            )}
                        />
                    </FormControl>

                    <Field.Text
                        name="email"
                        disabled
                        label={
                            <>
                                {t('auth.email')} <Box component="span" sx={{ color: USER_COLORS.error }}>*</Box>
                            </>
                        }
                        slotProps={authFieldSlotProps}
                    />

                    <Field.Text name="referralCode" label={t('profile.referralCodeOptional')} slotProps={authFieldSlotProps} />

                    <Field.Text
                        name="twitterLink"
                        label={t('profile.twitterLinkOptional')}
                        placeholder="https://twitter.com/username"
                        slotProps={authFieldSlotProps}
                    />
                    <Field.Text
                        name="facebookLink"
                        label={t('profile.facebookLinkOptional')}
                        placeholder="https://facebook.com/username"
                        slotProps={authFieldSlotProps}
                    />
                    <Field.Text
                        name="instagramLink"
                        label={t('profile.instagramLinkOptional')}
                        placeholder="https://instagram.com/username"
                        slotProps={authFieldSlotProps}
                    />

                    <LoadingButton
                        fullWidth
                        size="large"
                        type="submit"
                        loading={isSubmitting}
                        loadingIndicator={t('common.saving')}
                        sx={userGoldButtonSx}
                    >
                        {t('common.saveChanges')}
                    </LoadingButton>
                </Stack>
            </Form>
            </Box>

            <Dialog
                open={premiumDialogOpen}
                onClose={() => setPremiumDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: userGlassDialogPaperSx }}
            >
                <DialogTitle sx={{ color: USER_COLORS.textPrimary, fontWeight: 700 }}>
                    {t('profile.activatePremium')}
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: USER_COLORS.border }}>
                    <Typography variant="body2" sx={{ ...userMutedTextSx, mb: 1 }}>
                        {t('profile.premiumPaymentConfirm', { days: premiumDuration })}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: USER_COLORS.gold }}>
                        {t('profile.price')}: {premiumPrice} BAC
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ borderTop: `1px solid ${USER_COLORS.border}` }}>
                    <UserActionButton actionVariant="ghost" onClick={() => setPremiumDialogOpen(false)} disabled={premiumLoading}>
                        {t('common.cancel')}
                    </UserActionButton>
                    <LoadingButton
                        onClick={handleActivatePremium}
                        loading={premiumLoading}
                        sx={userGoldButtonSx}
                    >
                        {t('common.confirm')}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            </Box>
        </UserGlassCard>
    );
}

