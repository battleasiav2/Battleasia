import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import { API_URL } from 'src/config-global';
import useApi from 'src/hooks/use-api';
import { useFileUpload } from 'src/hooks/use-file-upload';
import FormProvider, { RHFSelect, RHFTextField, RHFUploadAvatar, RHFSwitch } from 'src/components/hook-form';
import { IMatchData } from 'src/contexts/type';
import { IMatchRow, IMatchStatus } from 'src/types';
import { assetPath } from 'src/utils/asset-path';

// ----------------------------------------------------------------------

const MatchSchema = Yup.object().shape({
    gameId: Yup.string().required('Game is required!'),
    gameMode: Yup.string().oneOf(['classic', 'tdm']).required('Game mode is required!'),
    roomId: Yup.string().required('Room ID is required!'),
    password: Yup.string().required('Password is required!'),
    matchName: Yup.string().required('Match name is required!'),
    matchUrl: Yup.string()
        .required('Match URL is required!')
        .transform((value) => {
            if (value && !/^https?:\/\//i.test(value)) {
                return `https://${value}`;
            }
            return value;
        }),
    matchSchedule: Yup.string().required('Match schedule is required!'),
    killRateType: Yup.string().oneOf(['automatic', 'manual']).required('Kill rate type is required!'),
    entryFee: Yup.number().typeError('Entry fee must be a number').min(0).required('Entry fee is required!'),
    totalPlayer: Yup.number().typeError('Total player must be a number').min(1).required('Total player is required!'),
    teamType: Yup.string().required('Team type is required!'),
    perKill: Yup.number().typeError('Per kill must be a number').min(1).required('Per kill is required!'),
    matchType: Yup.string().oneOf(['free', 'paid']).required('Match type is required!'),
    map: Yup.string().required('Map is required!'),
    totalKills: Yup.number()
        .typeError('Total kills must be a number')
        .min(1)
        .when('gameMode', {
            is: 'tdm',
            then: (schema) => schema.required('Total kills is required for TDM mode'),
            otherwise: (schema) => schema.optional(),
        }),
    banner: Yup.mixed<any>().nullable(),
    prizeDescription: Yup.string().nullable(),
    matchSponsor: Yup.string().nullable(),
    matchDescription: Yup.string().nullable(),
    matchPrivateDescription: Yup.string().nullable(),
    premiumOnly: Yup.boolean().default(false),
    platformFeePercent: Yup.number().typeError('Platform fee must be a number').min(0).max(100).default(5),
    status: Yup.string().oneOf(['active', 'deactive', 'start', 'complete', 'cancel']).default('active'),
});

type ISchemaType = Yup.InferType<typeof MatchSchema>;

type DialogMode = 'create' | 'edit';

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    mode?: DialogMode;
    match?: IMatchRow | null;
    onSuccess?: () => void;
};

const formatDateTimeLocal = (value?: string | Date | null) => {
    if (!value) {
        return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

// Classic maps
const CLASSIC_MAPS = [
    { name: 'Erangel' },
    { name: 'Rondo' },
    { name: 'Miramar' },
    { name: 'Nusa' },
    { name: 'Vikendi' },
    { name: 'Sanhok' },
    { name: 'Livik' },
    { name: 'Karakin' },
];

// TDM maps (placeholder - can be updated with actual TDM maps)
const TDM_MAPS = [
    { name: 'Warehouse' },
    { name: 'Hanger' },
    { name: 'Gun' },
];

export function MatchDialog({
    open,
    onClose,
    loading = false,
    mode = 'create',
    match = null,
    onSuccess,
}: Props) {
    const { createMatchApi, updateMatchApi, getGamesApi } = useApi();
    const isEdit = mode === 'edit' && !!match;

    const [gameOptions, setGameOptions] = useState<{ label: string; value: string }[]>([]);
    const isInitializingRef = useRef(false);

    const { uploadFile: uploadBannerFile, deleteFile: deleteBannerFile, uploading: uploadingBanner } = useFileUpload({
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        endpoint: 'api/v1/files/upload',
        fieldName: 'file',
        folder: 'matches',
    });

    const defaultValues: ISchemaType = useMemo(
        () => ({
            gameId: '',
            gameMode: 'classic',
            roomId: '',
            password: '',
            matchName: '',
            matchUrl: '',
            matchSchedule: '',
            killRateType: 'automatic',
            entryFee: 0,
            totalPlayer: 100,
            teamType: 'squad',
            perKill: 0,
            matchType: 'free',
            map: '',
            totalKills: undefined,
            banner: null,
            prizeDescription: '',
            matchSponsor: '',
            matchDescription: '',
            matchPrivateDescription: '',
            premiumOnly: false,
            platformFeePercent: 5,
            status: 'active',
        }),
        []
    );

    const methods = useForm<ISchemaType>({
        resolver: yupResolver(MatchSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        reset,
        resetField,
        setValue,
        watch,
        formState: { isSubmitting },
    } = methods;

    const killRateType = watch('killRateType');
    const gameMode = watch('gameMode');
    const teamType = watch('teamType');
    const selectedMap = watch('map');
    const totalPlayer = watch('totalPlayer');
    const entryFee = watch('entryFee');
    const totalKills = watch('totalKills');
    const platformFeePercent = watch('platformFeePercent');

    // Winner team size by team type (the number of players whose deposit is refunded)
    // Solo → 1 player, Duo → 2 players, Squad → 4 players
    const winnerTeamSize = useMemo(() => {
        if (teamType === 'solo') return 1;
        if (teamType === 'duo') return 2;
        return 4; // squad (default)
    }, [teamType]);

    const fetchGames = useCallback(async () => {
        try {
            const response = await getGamesApi({ page: 1, limit: 100 });
            if (response?.data?.status && response.data.data?.results) {
                const options = response.data.data.results.map((game: any) => ({
                    label: game.name,
                    value: game._id || game.id,
                }));
                setGameOptions(options);
            }
        } catch (error: any) {
            console.error('Failed to fetch games:', error);
            toast.error(error?.response?.data?.message || 'Failed to load games');
        }
    }, [getGamesApi]);

    useEffect(() => {
        if (open) {
            fetchGames();
        }
    }, [open, fetchGames]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (isEdit && match) {
            isInitializingRef.current = true;
            reset({
                gameId: match.gameId || '',
                gameMode: (match as any).gameMode || 'classic',
                roomId: match.roomId || '',
                password: match.password || '',
                matchName: match.matchName || '',
                matchUrl: match.matchUrl || '',
                matchSchedule: formatDateTimeLocal(match.matchSchedule),
                killRateType: match.killRateType || 'automatic',
                entryFee: match.entryFee ?? 0,
                totalPlayer: match.totalPlayer ?? 0,
                teamType: match.teamType || 'squad',
                perKill: match.perKill ?? 0,
                matchType: match.matchType || 'free',
                map: match.map || '',
                totalKills: (match as any).totalKills ?? undefined,
                banner: match.banner ? `${API_URL}${match.banner}` : null,
                prizeDescription: match.prizeDescription || '',
                matchSponsor: match.matchSponsor || '',
                matchDescription: match.matchDescription || '',
                matchPrivateDescription: match.matchPrivateDescription || '',
                premiumOnly: (match as any).premiumOnly || false,
                platformFeePercent: (match as any).platformFeePercent ?? 5,
                status: match.status ?? 'active',
            });
        } else {
            reset(defaultValues);
        }
    }, [defaultValues, isEdit, match, open, reset]);

    // Auto-set totalKills to 40 when TDM mode is selected
    // Classic mode: clear totalKills so the field appears empty
    useEffect(() => {
        if (gameMode === 'tdm') {
            setValue('totalKills', 40, { shouldValidate: true });
        } else {
            resetField('totalKills', { defaultValue: undefined });
        }
    }, [gameMode, setValue, resetField]);

    // Clear map selection when game mode changes (skip during edit initialization)
    useEffect(() => {
        if (isInitializingRef.current) {
            isInitializingRef.current = false;
            return;
        }
        if (gameMode) {
            setValue('map', '', { shouldValidate: false });
            if (gameMode === 'classic') {
                setValue('totalPlayer', 100, { shouldValidate: false });
            }
        }
    }, [gameMode, setValue]);

    // Auto-set map banner when map is selected
    useEffect(() => {
        if (selectedMap) {
            setValue('banner', `/assets/images/map/${selectedMap}.webp`, { shouldValidate: false });
        }
    }, [selectedMap, setValue]);

    // Auto-calculate per kill when kill rate type is automatic
    //
    // Classic mode:
    //   loserCount = totalPlayer - winnerTeamSize
    //   perKill    = prizePool / loserCount
    //
    // TDM mode:
    //   perKill    = prizePool / totalKills (winner total kills, fixed at 40 for TDM)
    //   e.g. 4 players × 100 entry − 5% fee = 380 prizePool, 40 kills → perKill = 9.5
    useEffect(() => {
        if (killRateType !== 'automatic') return;

        const players = Number(totalPlayer) || 0;
        const fee = Number(entryFee) || 0;
        const feePercent = Number(platformFeePercent) || 5;

        const totalIncome = players * fee;
        const platformFeeAmount = totalIncome * (feePercent / 100);
        const prizePool = totalIncome - platformFeeAmount;

        let perKillCalc = 0;
        if (gameMode === 'tdm') {
            // TDM: prizePool ÷ total kills (fixed 40)
            const kills = 40;
            perKillCalc = kills > 0 ? prizePool / kills : 0;
        } else {
            // Classic: prizePool ÷ loserCount
            const loserCount = players - winnerTeamSize;
            perKillCalc = loserCount > 0 ? prizePool / loserCount : 0;
        }

        setValue('perKill', Number(perKillCalc.toFixed(2)), { shouldValidate: true });
    }, [killRateType, totalPlayer, entryFee, totalKills, gameMode, platformFeePercent, winnerTeamSize, setValue]);

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const handleDropBanner = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                const newFile = Object.assign(file, {
                    preview: URL.createObjectURL(file),
                });
                setValue('banner', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );

    const onSubmitForm = handleSubmit(async (data) => {
        let bannerUrl = '';

        if (data.banner instanceof File) {
            if (isEdit && match?.banner) {
                await deleteBannerFile(match.banner);
            }
            const uploadedUrl = await uploadBannerFile(data.banner);
            if (!uploadedUrl) {
                toast.error('Failed to upload banner');
                return;
            }
            bannerUrl = uploadedUrl;
        } else if (typeof data.banner === 'string' && data.banner) {
            if (data.banner.startsWith('/assets/images/map/')) {
                bannerUrl = data.banner;
            } else if (isEdit) {
                bannerUrl = match?.banner ?? data.banner;
            } else {
                bannerUrl = data.banner;
            }
        } else if (isEdit && match?.banner) {
            bannerUrl = match.banner;
        }

        const payload: IMatchData & { gameMode?: string; totalKills?: number | null } = {
            gameId: data.gameId,
            gameMode: data.gameMode,
            roomId: data.roomId,
            password: data.password,
            matchName: data.matchName,
            matchUrl: data.matchUrl,
            matchSchedule: new Date(data.matchSchedule).toISOString(),
            killRateType: data.killRateType,
            entryFee: Number(data.entryFee) ?? 0,
            totalPlayer: Number(data.totalPlayer) ?? 0,
            teamType: data.teamType,
            perKill: Number(data.perKill ?? 0),
            matchType: data.matchType,
            map: data.map,
            totalKills: (() => {
                if (data.gameMode === 'tdm') return data.totalKills ?? 40;
                if (data.totalKills) return Number(data.totalKills);
                return undefined;
            })(),
            banner: bannerUrl,
            prizeDescription: data.prizeDescription || '',
            matchSponsor: data.matchSponsor || '',
            matchDescription: data.matchDescription || '',
            matchPrivateDescription: data.matchPrivateDescription || '',
            premiumOnly: data.premiumOnly || false,
            platformFeePercent: Number(data.platformFeePercent ?? 5),
            status: data.status as IMatchStatus,
        };

        try {
            if (isEdit && match) {
                const response = await updateMatchApi(match.id, payload);
                if (response?.data?.status) {
                    toast.success('Match updated successfully');
                    onSuccess?.();
                    handleClose();
                }
            } else {
                const response = await createMatchApi(payload);
                if (response?.data?.status) {
                    toast.success('Match created successfully');
                    onSuccess?.();
                    handleClose();
                }
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.response?.data || 'Failed to save match');
        }
    });

    const dialogTitle = isEdit ? 'Edit Match' : 'Create Match';
    const actionLabel = isEdit ? 'Save Changes' : 'Create';

    const renderForm = () => {
        const availableMaps = gameMode === 'tdm' ? TDM_MAPS : CLASSIC_MAPS;
        const isTDM = gameMode === 'tdm';

        return (
            <Stack spacing={3} sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <RHFSelect name="gameId" label="Game" required>
                            <MenuItem value="">
                                <em>Select Game</em>
                            </MenuItem>
                            {gameOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </RHFSelect>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <RHFSelect name="gameMode" label="Game Mode" required>
                            <MenuItem value="classic">Classic</MenuItem>
                            <MenuItem value="tdm">Team Death Match (TDM)</MenuItem>
                        </RHFSelect>
                    </Grid>

                    {/* Left column: Map dropdown + image preview */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                            <RHFSelect name="map" label="Map" required>
                                <MenuItem value="">
                                    <em>Select Map</em>
                                </MenuItem>
                                {availableMaps.map((mapOption) => (
                                    <MenuItem key={mapOption.name} value={mapOption.name}>
                                        {mapOption.name}
                                    </MenuItem>
                                ))}
                            </RHFSelect>

                            {/* Map image preview — fixed 300px height */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 300,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.neutral',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                {selectedMap ? (
                                    <Box
                                        component="img"
                                        src={assetPath(`/assets/images/map/${selectedMap}.webp`)}
                                        alt={selectedMap}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.disabled">
                                        Select a map to preview
                                    </Typography>
                                )}
                                {selectedMap && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            px: 1.5,
                                            py: 0.5,
                                            bgcolor: 'rgba(0,0,0,0.55)',
                                        }}
                                    >
                                        <Typography variant="caption" fontWeight={700} color="white">
                                            {selectedMap}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Right column: Total Kills + Total Player + Player Mode + Room ID + Password — fills same height as left column */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2} sx={{ height: '100%', justifyContent: 'space-between' }}>
                            {isTDM ? (
                                <RHFTextField
                                    name="totalKills"
                                    label="Total Kills"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    fullWidth
                                    disabled
                                    helperText="Fixed at 40 kills for TDM mode"
                                />
                            ) : (
                                <RHFTextField
                                    name="totalKills"
                                    label="Total Kills (Classic)"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    disabled
                                    helperText={`Auto: loserCount = totalPlayer (${Number(totalPlayer) || 0}) − winnerTeamSize (${winnerTeamSize}) = ${Math.max(0, (Number(totalPlayer) || 0) - winnerTeamSize)}`}
                                />
                            )}

                            <RHFTextField
                                name="totalPlayer"
                                label="Total Player"
                                type="number"
                                inputProps={{ min: 1 }}
                                required
                                fullWidth
                            />

                            <RHFSelect name="teamType" label="Player Mode" required>
                                <MenuItem value="solo">Solo</MenuItem>
                                <MenuItem value="duo">Duo</MenuItem>
                                <MenuItem value="squad">Squad</MenuItem>
                            </RHFSelect>

                            <RHFTextField name="roomId" label="Room ID" required fullWidth />

                            <RHFTextField name="password" label="Password" required fullWidth />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <RHFTextField name="matchName" label="Match/Event Name" required fullWidth />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <RHFTextField
                            name="matchUrl"
                            label="Match URL"
                            required
                            fullWidth
                            helperText="https:// will be added automatically if omitted"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RHFTextField
                            name="matchSchedule"
                            label="Match Schedule"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <RHFSelect name="killRateType" label="Set Kill Rate" required>
                            <MenuItem value="automatic">Automatic</MenuItem>
                            <MenuItem value="manual">Manual</MenuItem>
                        </RHFSelect>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RHFSelect name="matchType" label="Match Type" required>
                            <MenuItem value="free">Free</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                        </RHFSelect>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <RHFTextField
                            name="entryFee"
                            label="Entry Fee"
                            type="number"
                            inputProps={{ min: 0 }}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <RHFTextField
                            name="platformFeePercent"
                            label="Platform Fee (%)"
                            type="number"
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            fullWidth
                            helperText="Percentage of total income kept by platform"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {(() => {
                            let perKillHelperText: string | undefined;
                            if (killRateType === 'automatic') {
                                const players = Number(totalPlayer) || 0;
                                const fee = Number(entryFee) || 0;
                                const feePercent = Number(platformFeePercent) || 5;
                                const totalIncome = players * fee;
                                const prizePool = totalIncome * (1 - feePercent / 100);

                                if (gameMode === 'tdm') {
                                    const kills = 40;
                                    const computed = kills > 0 ? prizePool / kills : 0;
                                    perKillHelperText = `Auto: prizePool ÷ 40 kills = ${prizePool.toFixed(2)} ÷ 40 = ${computed.toFixed(2)}  [${feePercent}% fee]`;
                                } else {
                                    const loserCount = players - winnerTeamSize;
                                    const computed = loserCount > 0 ? prizePool / loserCount : 0;
                                    perKillHelperText = `Auto: prizePool ÷ loserCount = ${prizePool.toFixed(2)} ÷ ${loserCount} = ${computed.toFixed(2)}  [${feePercent}% fee, loserCount = ${players} − ${winnerTeamSize}]`;
                                }
                            } else {
                                perKillHelperText = 'Enter the coin reward per kill manually';
                            }
                            return (
                                <RHFTextField
                                    name="perKill"
                                    label="Per Kill"
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                    disabled={killRateType === 'automatic'}
                                    helperText={perKillHelperText}
                                />
                            );
                        })()}
                    </Grid>
                    <Grid item xs={12} md={4} display="flex" alignItems="center">
                        <RHFSwitch name="premiumOnly" label="Premium Only" helperText="Only premium members can join this match" />
                    </Grid>

                </Grid>
                <Stack display="flex" flexDirection="row" spacing={2} width="100%">
                    <Grid item xs={12} md={6} width="100%">
                        <RHFUploadAvatar
                            name="banner"
                            maxSize={5 * 1024 * 1024}
                            onDrop={handleDropBanner}
                            sx={{ width: 1 }}
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
                                    Upload Banner (Recommended 1000x500)
                                </Typography>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={6} width="100%">
                        <RHFTextField name="prizeDescription" label="Prize Description" fullWidth multiline rows={5} />
                    </Grid>
                </Stack>

                <RHFTextField name="matchSponsor" label="Match Sponsor" fullWidth multiline rows={3} />
                <RHFTextField name="matchDescription" label="Match Description" fullWidth multiline rows={4} />
                <RHFTextField
                    name="matchPrivateDescription"
                    label="Match Private Description (Visible to joined players)"
                    fullWidth
                    multiline
                    rows={4}
                />

                <RHFSelect name="status" label="Match Status" required>
                    <MenuItem value="start">Start</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="deactive">Deactive</MenuItem>
                    <MenuItem value="complete">Complete</MenuItem>
                    <MenuItem value="cancel">Cancel</MenuItem>
                </RHFSelect>
            </Stack>
        );
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent dividers sx={{ overflowY: 'auto' }}>
                <FormProvider methods={methods} onSubmit={onSubmitForm}>
                    {renderForm()}
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                    variant="contained"
                    onClick={onSubmitForm}
                    loading={loading || isSubmitting || uploadingBanner}
                >
                    {actionLabel}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}


