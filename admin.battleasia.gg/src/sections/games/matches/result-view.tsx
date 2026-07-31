import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
import { IMatchRow } from 'src/types';
import useApi from 'src/hooks/use-api';
import { paths } from 'src/routes/paths';
import { useFileUpload } from 'src/hooks/use-file-upload';
import Carousel, { CarouselDots, CarouselArrows, useCarousel } from 'src/components/carousel';
import { API_URL } from 'src/config-global';
import Image from 'src/components/image';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency } from 'src/utils/format-number';
import { assetPath } from 'src/utils/asset-path';

// Coin Icon Component
const CoinIcon = ({ sx }: { sx?: any }) => (
    <Box
        component="img"
        src={assetPath('/assets/images/currency.webp')}
        alt="coin"
        sx={{
            width: '1em',
            height: '1em',
            display: 'inline-block',
            verticalAlign: 'middle',
            ml: 0.5,
            ...sx
        }}
    />
);

// Helper function to format currency without $ symbol
const formatCoinAmount = (amount: number) =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Dynamic schema based on team type
type MatchResultEntryForm = {
    id: string;
    pubgId: string;
    playerName: string;
    avatar?: string;
    status: 'winner' | 'lose';
    placement: number;
    kills: number;
    points?: number;
    placePoint?: number;
    winPrize?: number;
    bonus?: number;
};

// Schema for result media (description and screenshots)
const createResultMediaSchema = () =>
    Yup.object().shape({
        resultDescription: Yup.string().nullable(),
        screenshots: Yup.array().of(Yup.mixed()).optional(),
    });

// Schema for entries
const createEntriesSchema = () =>
    Yup.object().shape({
        results: Yup.array()
            .of(
                Yup.object().shape({
                    id: Yup.string().required('ID is required!'),
                    pubgId: Yup.string().required('PUBG ID is required!'),
                    playerName: Yup.string().required('Player name is required!'),
                    status: Yup.mixed<'winner' | 'lose'>().oneOf(['winner', 'lose']).default('winner'),
                    placement: Yup.number()
                        .typeError('Placement must be a number')
                        .min(0, 'Placement must be at least 0')
                        .max(100, 'Placement cannot exceed 100')
                        .required('Placement is required!'),
                    kills: Yup.number()
                        .typeError('Kills must be a number')
                        .min(0, 'Kills cannot be negative')
                        .required('Kills is required!'),
                    placePoint: Yup.number()
                        .typeError('Place Point must be a number')
                        .min(0, 'Place Point cannot be negative')
                        .optional(),
                    winPrize: Yup.number()
                        .typeError('Win Prize must be a number')
                        .min(0, 'Win Prize cannot be negative')
                        .optional(),
                    bonus: Yup.number()
                        .typeError('Bonus must be a number')
                        .min(0, 'Bonus cannot be negative')
                        .optional(),
                })
            )
            .min(1, 'At least one result entry is required!')
            .required('Results are required!'),
    });

type IResultMediaSchemaType = {
    resultDescription?: string | null;
    screenshots?: any[];
};

type IEntriesSchemaType = {
    results: MatchResultEntryForm[];
};

type Props = {
    match: IMatchRow | null;
    onCancel?: () => void;
};

export function MatchResultForm({ match, onCancel }: Props) {
    const { updateMatchResultApi, updateMatchEntriesApi, getMatchParticipantsApi, deleteFileApi, distributeMatchWinningsApi, refundMatchEntriesApi } = useApi();

    const {
        uploadFiles: uploadScreenshotFiles,
        uploading: uploadingScreenshots,
    } = useFileUpload({
        endpoint: 'api/v1/files/upload',
        fieldName: 'file',
        folder: 'matches',
    });

    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; url: string | null }>({
        open: false,
        url: null,
    });
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
    const [distributingWinnings, setDistributingWinnings] = useState(false);
    const [refunding, setRefunding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form for result media (description and screenshots)
    const resultMediaDefaultValues: IResultMediaSchemaType = useMemo(
        () => ({
            resultDescription: '',
            screenshots: [],
        }),
        []
    );

    const resultMediaMethods = useForm<IResultMediaSchemaType>({
        resolver: yupResolver(createResultMediaSchema()),
        defaultValues: resultMediaDefaultValues,
    });

    const {
        handleSubmit: handleSubmitMedia,
        setValue: setValueMedia,
        getValues: getValuesMedia,
        watch: watchMedia,
        formState: { isSubmitting: isSubmittingMedia },
    } = resultMediaMethods;

    const screenshots = watchMedia('screenshots');

    const carousel = useCarousel({
        slidesToShow: 1,
        slidesToScroll: 1,
        ...CarouselDots({
            rounded: true,
            sx: { mt: 3 },
        }),
    });

    const screenshotUrls = useMemo(
        () =>
            screenshots
                ?.map((file) => {
                    if (typeof file === 'string') {
                        return file;
                    }
                    if (file instanceof File) {
                        const fileWithPreview = file as File & { preview?: string };
                        if (fileWithPreview.preview) {
                            return fileWithPreview.preview;
                        }
                        return URL.createObjectURL(file);
                    }
                    return null;
                })
                .filter((url): url is string => Boolean(url)),
        [screenshots]
    );

    // Form for entries
    const entriesDefaultValues: IEntriesSchemaType = useMemo(
        () => ({
            results: [] as MatchResultEntryForm[],
        }),
        []
    );

    const entriesMethods = useForm<IEntriesSchemaType>({
        resolver: yupResolver(createEntriesSchema()),
        defaultValues: entriesDefaultValues,
    });

    const {
        handleSubmit: handleSubmitEntries,
        reset: resetEntries,
        formState: { errors: entriesErrors, isSubmitting: isSubmittingEntries },
    } = entriesMethods;

    const watchedResults = entriesMethods.watch('results');

    // Prize pool summary using the correct formula:
    //   totalIncome    = totalPlayers × entryFee
    //   prizePool      = totalIncome × (1 - platformFee%)
    // Prize pool summary
    //
    // Classic mode:
    //   loserCount = totalPlayer - winnerTeamSize
    //   perKill    = prizePool / loserCount  (auto-calculated)
    //   killMoneyPool = prizePool
    //
    // TDM mode:
    //   winnerTotalKills = sum of kills for placement===1 entries
    //   perKill    = prizePool / winnerTotalKills  (auto-calculated)
    //   e.g. 4 players × 100 entry − 5% fee = 380 prizePool
    //        winner kills = 40 → perKill = 380/40 = 9.5
    const prizePoolSummary = useMemo(() => {
        const totalPlayers = Number(match?.totalPlayer) || 0;
        const entryFee = Number(match?.entryFee) || 0;
        const feePercent = Number(match?.platformFeePercent ?? 5);
        const teamType = match?.teamType || 'squad';
        const gameMode = match?.gameMode || 'classic';

        let winnerTeamSize = 4;
        if (teamType === 'solo') winnerTeamSize = 1;
        else if (teamType === 'duo') winnerTeamSize = 2;

        const totalIncome = totalPlayers * entryFee;
        const platformFeeAmount = totalIncome * (feePercent / 100);
        const prizePool = totalIncome - platformFeeAmount;
        const killMoneyPool = prizePool;

        let perKill: number;
        let loserCount: number = 0;
        let winnerTotalKills: number = 0;

        if (gameMode === 'classic') {
            loserCount = totalPlayers - winnerTeamSize;
            perKill = loserCount > 0 ? Math.round((prizePool / loserCount) * 100) / 100 : 0;
        } else {
            // TDM: use match.perKill (admin-set fixed value) as the per-kill rate
            // winnerTotalKills is still collected for display purposes only
            if (Array.isArray(watchedResults)) {
                winnerTotalKills = watchedResults
                    .filter((r) => Number(r?.placement) === 1)
                    .reduce((sum, r) => sum + (Number(r?.kills) || 0), 0);
            }
            perKill = Math.round((Number(match?.perKill) || 0) * 100) / 100;
        }

        return {
            gameMode,
            totalIncome,
            platformFeeAmount,
            prizePool,
            winnerTeamSize,
            loserCount,
            winnerTotalKills,
            killMoneyPool,
            perKill,
            feePercent,
            entryFee,
        };
    }, [match, watchedResults]);

    const winningEntries = useMemo(() => {
        if (!Array.isArray(watchedResults)) {
            return [];
        }
        return watchedResults.filter((result) => Number(result?.placement) === 1);
    }, [watchedResults]);

    // Filter results based on search query
    const filteredResults = useMemo(() => {
        if (!Array.isArray(watchedResults)) {
            return [];
        }
        if (!searchQuery.trim()) {
            return watchedResults;
        }
        const query = searchQuery.toLowerCase();
        return watchedResults.filter((result) => {
            const playerName = (result?.playerName || '').toLowerCase();
            const pubgId = (result?.pubgId || '').toLowerCase();
            return playerName.includes(query) || pubgId.includes(query);
        });
    }, [watchedResults, searchQuery]);


    useEffect(() => {
        const fetchParticipants = async () => {
            if (!match?.id) {
                return;
            }
            try {
                setParticipantsLoading(true);
                const response = await getMatchParticipantsApi(match.id, { page: 1, limit: 500 });
                if (response?.data?.status && response.data.data?.participants) {
                    const participants = response.data.data.participants;

                    resetEntries({
                        results: participants.map((p: any) => {
                            const placement = p.placement || 0;
                            const kills = p.kills || 0;
                            const placePoint = placement > 0 ? 101 - placement : 0;
                            return {
                                id: p.id || p._id,
                                pubgId: p.pubgId,
                                playerName: p.username,
                                avatar: p.avatar || '',
                                status: p.status || 'winner',
                                placement,
                                kills,
                                points: p.points || 0,
                                placePoint: p.placePoint ?? placePoint,
                                winPrize: p.winPrize ?? 0,
                                bonus: p.bonus ?? 0,
                            };
                        }),
                    });
                }
            } catch (error: any) {
                console.error('Failed to load participants:', error);
                toast.error(error?.response?.data?.message || 'Failed to load participants');
            } finally {
                setParticipantsLoading(false);
            }
        };

        fetchParticipants();
    }, [getMatchParticipantsApi, match?.id, match?.entryFee, match?.perKill, resetEntries]);

    useEffect(() => {
        if (match) {
            setValueMedia('resultDescription', match.resultDescription || '');
            setValueMedia('screenshots', match.resultScreenshots || []);
        }
    }, [setValueMedia, match]);

    useEffect(() => {
        carousel.onSetNav();
    }, [carousel]);


    const handleDropScreenshots = useCallback(
        (acceptedFiles: File[]) => {
            const filesWithPreview = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );
            const currentFiles = (getValuesMedia('screenshots') as (File | string)[]) || [];
            setValueMedia('screenshots', [...currentFiles, ...filesWithPreview], { shouldValidate: true });
        },
        [getValuesMedia, setValueMedia]
    );

    const handleDeleteScreenshotClick = useCallback((url: string) => {
        setConfirmDelete({ open: true, url });
    }, []);

    const handleDeleteScreenshotConfirm = useCallback(async () => {
        if (!confirmDelete.url || !match) {
            return;
        }

        try {
            setDeletingUrl(confirmDelete.url);

            // Remove from form state
            const currentScreenshots = (getValuesMedia('screenshots') as (File | string)[]) || [];

            // Check if the deleted URL is from a string (already uploaded) or File preview
            const isStringUrl = currentScreenshots.some((file) => typeof file === 'string' && file === confirmDelete.url);

            const updatedScreenshots = currentScreenshots.filter((file) => {
                if (typeof file === 'string') {
                    return file !== confirmDelete.url;
                }
                if (file instanceof File) {
                    const fileWithPreview = file as File & { preview?: string };
                    if (fileWithPreview.preview) {
                        return fileWithPreview.preview !== confirmDelete.url;
                    }
                    return true;
                }
                return true;
            });
            setValueMedia('screenshots', updatedScreenshots, { shouldValidate: true });

            // Only call API if we're deleting a string URL (already uploaded file)
            if (isStringUrl) {
                const isFullUrl = confirmDelete.url.startsWith('http://') || confirmDelete.url.startsWith('https://');
                const hasUploadPath = confirmDelete.url.includes('/upload/') || confirmDelete.url.startsWith('/upload/');

                if (!isFullUrl && hasUploadPath) {
                    try {
                        await deleteFileApi(confirmDelete.url);
                        const stringUrls = updatedScreenshots.filter((file): file is string => typeof file === 'string');
                        const payload = {
                            resultDescription: getValuesMedia('resultDescription') || '',
                            screenshots: stringUrls,
                        };

                        await updateMatchResultApi(match.id, payload);
                    } catch (deleteError) {
                        console.warn('File deletion warning:', deleteError);
                    }
                }
            }
            toast.success('Screenshot deleted successfully');
            setConfirmDelete({ open: false, url: null });
        } catch (error: any) {
            console.error('Failed to delete screenshot:', error);
            toast.error(error?.message || error?.response?.data?.message || 'Failed to delete screenshot');
        } finally {
            setDeletingUrl(null);
        }
    }, [confirmDelete.url, match, deleteFileApi, getValuesMedia, setValueMedia, updateMatchResultApi]);

    const handleUpdateMedia = handleSubmitMedia(async (data) => {
        if (!match) {
            toast.error('Match not found');
            return;
        }

        try {
            const screenshotFiles = Array.isArray(data.screenshots) ? data.screenshots : [];
            const existingUrls = screenshotFiles.filter((file): file is string => typeof file === 'string');
            const newFiles = screenshotFiles.filter((file): file is File => file instanceof File);
            const uploadedUrls = newFiles.length ? await uploadScreenshotFiles(newFiles) : [];
            const urls = [...existingUrls, ...uploadedUrls];

            const payload = {
                resultDescription: data.resultDescription || '',
                screenshots: urls.filter(Boolean),
            };

            const response = await updateMatchResultApi(match.id, payload);

            if (response?.data?.status) {
                toast.success('Match media updated successfully');
            }
        } catch (error: any) {
            console.error('Failed to update match media:', error);
            toast.error(error?.message || error?.response?.data?.message || 'Failed to update match media');
        }

    });

    const handleUpdateEntries = handleSubmitEntries(async (data) => {
        if (!match) {
            toast.error('Match not found');
            return;
        }
        try {
            const resultsWithPoints = data.results.map((result: MatchResultEntryForm) => {
                const status = result.status || 'winner';
                const isWinner = status !== 'lose';

                // If winner but placement is 0/unset, default to 1 so the backend
                // recognises them as a winner (backend uses placement===1)
                const rawPlacement = Number(result.placement) || 0;
                const placementValue = isWinner && rawPlacement === 0 ? 1 : (rawPlacement || null);

                const killValue = Number(result.kills) || 0;
                const placePointValue = isWinner ? Number(result.placePoint) || 0 : 0;
                const winPrizeValue = isWinner ? Number(result.winPrize) || 0 : 0;
                const bonusValue = isWinner ? Number(result.bonus) || 0 : 0;
                const manualPoints = Number(result.points);

                let placementPoints = 0;
                if (isWinner && placementValue) {
                    placementPoints = 101 - placementValue;
                }
                const killPoints = isWinner ? killValue * (match.perKill || 0) : 0;
                const calculatedPoints = placementPoints + killPoints;

                return {
                    participantId: result.id,
                    status,
                    placement: placementValue,
                    kills: killValue,
                    points: Number.isFinite(manualPoints) && manualPoints > 0 ? manualPoints : Math.round(calculatedPoints * 100) / 100,
                    placePoint: placePointValue,
                    winPrize: winPrizeValue,
                    bonus: bonusValue,
                };
            });

            const response = await updateMatchEntriesApi(match.id, resultsWithPoints);

            if (response?.data?.status) {
                toast.success('Entries saved successfully');
            }
        } catch (error: any) {
            console.error('Failed to update entries:', error);
            toast.error(error?.message || error?.response?.data?.message || 'Failed to save entries');
        }
    });

    // Calculate winnings for each participant
    // Classic: perKill = prizePool / loserCount, only winners (status=winner) earn kills × perKill
    // TDM:     perKill = match.perKill (admin preset), only winners (status=winner) earn kills × perKill
    const calculateParticipantWinnings = useCallback((result: MatchResultEntryForm) => {
        const kills = Number(result.kills) || 0;
        const isWinner = result.status !== 'lose';

        const perKill = prizePoolSummary.perKill;
        const killWin = isWinner ? kills * perKill : 0;
        const winPrize = Number(result.winPrize) ?? 0;
        const bonus = Number(result.bonus) ?? 0;

        const totalWin = killWin + winPrize + bonus;

        return {
            killWin,
            winPrize,
            bonus,
            totalWin,
        };
    }, [prizePoolSummary.perKill]);

    const handleDistributeWinnings = useCallback(async () => {
        if (!match?.id) {
            toast.error('Match not found');
            return;
        }

        if (!watchedResults || watchedResults.length === 0) {
            toast.error('No participants to distribute winnings to');
            return;
        }

        try {
            setDistributingWinnings(true);
            const response = await distributeMatchWinningsApi(match.id);

            if (response?.data?.status) {
                toast.success('Winnings distributed successfully to all participants');
                // Optionally refresh participants data
                const participantsResponse = await getMatchParticipantsApi(match.id, { page: 1, limit: 500 });
                if (participantsResponse?.data?.status && participantsResponse.data.data?.participants) {
                    resetEntries({
                        results: participantsResponse.data.data.participants.map((p: any) => ({
                            id: p.id || p._id,
                            pubgId: p.pubgId,
                            playerName: p.username,
                            avatar: p.avatar || '',
                            status: p.status || 'winner',
                            placement: p.placement || 0,
                            kills: p.kills || 0,
                            points: p.points || 0,
                            placePoint: p.placePoint || 0,
                            winPrize: p.winPrize || 0,
                            bonus: p.bonus || 0,
                        })),
                    });
                }
            }
        } catch (error: any) {
            console.error('Failed to distribute winnings:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to distribute winnings');
        } finally {
            setDistributingWinnings(false);
        }
    }, [match?.id, watchedResults, distributeMatchWinningsApi, getMatchParticipantsApi, resetEntries]);

    const handleRefund = useCallback(async () => {
        if (!match?.id) return;
        // eslint-disable-next-line no-alert
        if (!window.confirm('Refund entry fees to all participants?')) return;
        setRefunding(true);
        try {
            const response = await refundMatchEntriesApi(match.id);
            if (response?.data?.status) {
                toast.success(`Refund complete: ${response.data.data?.refunded ?? 0} participant(s) processed`);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Refund failed');
        } finally {
            setRefunding(false);
        }
    }, [match?.id, refundMatchEntriesApi]);

    const hasResultsEntered = useMemo(() => {
        if (!Array.isArray(watchedResults) || watchedResults.length === 0) return false;
        return watchedResults.some(
            (r) => Number(r?.kills) > 0 || Number(r?.winPrize) > 0 || Number(r?.bonus) > 0
        );
    }, [watchedResults]);

    if (!match) {
        return (
            <Alert severity="warning">
                Match data not available. Please navigate from the matches list and try again.
            </Alert>
        );
    }

    return (
        <Stack spacing={3}>
            {/* Result Media Card */}
            <Card>
                <CardHeader
                    title="Result Media"
                    subheader={`Match: ${match.matchName} · Room #${match.roomId}`}
                />
                <CardContent>
                    <FormProvider methods={resultMediaMethods} onSubmit={handleUpdateMedia}>
                        <Stack spacing={3}>
                            <Grid container spacing={2}>
                                {screenshotUrls && screenshotUrls.length > 0 && (
                                    <Grid item xs={12} md={6}>
                                        <Box position="relative">
                                            <CarouselArrows
                                                filled
                                                shape="rounded"
                                                onNext={carousel.onNext}
                                                onPrev={carousel.onPrev}
                                                leftButtonProps={{ sx: { left: 8 } }}
                                                rightButtonProps={{ sx: { right: 8 } }}
                                            >
                                                <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
                                                    {screenshotUrls?.map((url, index) => {
                                                        const isFullUrl = url.startsWith('http://') || url.startsWith('https://');
                                                        const hasUploadPath = url.includes('/upload/') || url.startsWith('/upload/');

                                                        let imageUrl = url;
                                                        if (!isFullUrl && hasUploadPath) {
                                                            imageUrl = `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
                                                        }

                                                        return (
                                                            <Box
                                                                key={index}
                                                                sx={{
                                                                    position: 'relative',
                                                                    width: '100%',
                                                                    height: 400,
                                                                }}
                                                            >
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={`Screenshot ${index + 1}`}
                                                                    sx={{
                                                                        width: '100%',
                                                                        height: 400,
                                                                        objectFit: 'contain',
                                                                        borderRadius: 2,
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    onClick={() => handleDeleteScreenshotClick(url)}
                                                                    disabled={deletingUrl === url}
                                                                    color="error"
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 8,
                                                                        right: 8,
                                                                    }}
                                                                >
                                                                    <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                                                </IconButton>
                                                            </Box>
                                                        );
                                                    })}
                                                </Carousel>
                                            </CarouselArrows>
                                        </Box>
                                    </Grid>
                                )}
                                <Grid item xs={12} md={6}>
                                    <RHFUpload
                                        name="screenshots"
                                        multiple
                                        maxSize={5 * 1024 * 1024}
                                        onDrop={handleDropScreenshots}
                                        helperText="Upload match result screenshots (JPG, PNG, GIF, WEBP)"
                                        sx={{
                                            p: 1,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <RHFTextField
                                        name="resultDescription"
                                        label="Result Description"
                                        placeholder="Add any notes or description about this result..."
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>

                            <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                {onCancel && (
                                    <Button variant="outlined" color="inherit" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                )}
                                <LoadingButton
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleUpdateMedia}
                                    loading={isSubmittingMedia || uploadingScreenshots}
                                    disabled={uploadingScreenshots}
                                >
                                    Update Media
                                </LoadingButton>
                            </Stack>
                        </Stack>
                    </FormProvider>
                </CardContent>
            </Card>

            {/* Match Entries Card */}
            <Card>
                <CardHeader
                    title="Match Entries"
                    subheader={`${match.teamType?.toUpperCase()} Match · Per Kill: ${match?.perKill ?? 0} coins · Platform Fee: ${match?.platformFeePercent ?? 5}%`}
                />
                <CardContent>
                    {/* ── Prize Pool Breakdown ── */}
                    <Box sx={{ p: 2, mb: 3, bgcolor: 'background.neutral', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" gutterBottom>Prize Pool Breakdown</Typography>
                        <Grid container spacing={1.5}>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="caption" color="text.secondary">Total Income</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="body2" fontWeight="bold">{formatCoinAmount(prizePoolSummary.totalIncome)}</Typography>
                                    <CoinIcon />
                                </Stack>
                                <Typography variant="caption" color="text.disabled">{match.totalPlayer} × {match.entryFee}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="caption" color="text.secondary">Platform Fee ({prizePoolSummary.feePercent}%)</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="body2" color="error.main">−{formatCoinAmount(prizePoolSummary.platformFeeAmount)}</Typography>
                                    <CoinIcon />
                                </Stack>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="caption" color="text.secondary">Prize Pool</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="body2" fontWeight="bold">{formatCoinAmount(prizePoolSummary.prizePool)}</Typography>
                                    <CoinIcon />
                                </Stack>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="caption" color="text.secondary">Kill Money Pool</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="body2" fontWeight="bold" color="success.main">{formatCoinAmount(prizePoolSummary.killMoneyPool)}</Typography>
                                    <CoinIcon />
                                </Stack>
                                {prizePoolSummary.gameMode === 'classic' && (
                                    <Typography variant="caption" color="text.disabled">= Prize Pool</Typography>
                                )}
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="caption" color="text.secondary">
                                    Per Kill
                                    {prizePoolSummary.gameMode === 'classic'
                                        ? ` (÷${prizePoolSummary.loserCount} losers)`
                                        : ` (÷${prizePoolSummary.winnerTotalKills} W.kills)`}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                        {formatCoinAmount(prizePoolSummary.perKill)}
                                    </Typography>
                                    <CoinIcon />
                                </Stack>
                                {prizePoolSummary.gameMode === 'classic' ? (
                                    <Typography variant="caption" color="text.disabled">
                                        {formatCoinAmount(prizePoolSummary.prizePool)} ÷ {prizePoolSummary.loserCount}
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="text.disabled">
                                        {formatCoinAmount(prizePoolSummary.prizePool)} ÷ {prizePoolSummary.winnerTotalKills}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Box>

                    <FormProvider methods={entriesMethods} onSubmit={handleUpdateEntries}>
                        <Stack spacing={3}>
                            {participantsLoading && (
                                <Box sx={{ py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {!participantsLoading && watchedResults.length > 0 && (
                                <>
                                    {winningEntries.length > 0 && (
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'background.neutral',
                                                borderRadius: 1,
                                                mb: 2,
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                                <Typography variant="body2" color="text.secondary">
                                                    Winners: <strong>{winningEntries.length}</strong>
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    )}
                                    <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <Typography variant="body2">Search:</Typography>
                                        <TextField
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            size="small"
                                            sx={{ width: 300 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="eva:search-fill" width={20} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Stack>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Sr No.</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Game ID</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>User Name</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Player Status</TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Killed</TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        Kill Win <CoinIcon />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        Win Prize <CoinIcon />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        Bonus <CoinIcon />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        TOTAL WIN <CoinIcon />
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredResults.map((rowField, index) => {
                                                    // Find the original index in watchedResults
                                                    const originalIndex = watchedResults.findIndex((r) => r.id === rowField.id);
                                                    const status = entriesMethods.watch(`results.${originalIndex}.status`) || 'winner';
                                                    const isLoser = status === 'lose';
                                                    const placement = Number(entriesMethods.watch(`results.${originalIndex}.placement`)) || 0;
                                                    const kills = Number(entriesMethods.watch(`results.${originalIndex}.kills`)) || 0;
                                                    const placePoint = Number(entriesMethods.watch(`results.${originalIndex}.placePoint`)) || 0;
                                                    const winPrize = Number(entriesMethods.watch(`results.${originalIndex}.winPrize`)) || 0;
                                                    const bonus = Number(entriesMethods.watch(`results.${originalIndex}.bonus`)) || 0;
                                                    const winnings = calculateParticipantWinnings({
                                                        ...rowField,
                                                        status: status as 'winner' | 'lose',
                                                        placement,
                                                        kills,
                                                        placePoint,
                                                        winPrize,
                                                        bonus,
                                                    });

                                                    return (
                                                        <TableRow key={rowField.id} sx={isLoser ? { bgcolor: 'grey.100' } : undefined}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {rowField.pubgId || '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: 1 }}>
                                                                    <Avatar
                                                                        src={rowField.avatar ? `${API_URL}${rowField.avatar}` : undefined}
                                                                        alt={rowField.playerName}
                                                                        sx={{ width: 32, height: 32 }}
                                                                    >
                                                                        {rowField.playerName?.[0]?.toUpperCase()}
                                                                    </Avatar>
                                                                    <Stack minWidth={0}>
                                                                        <Typography variant="subtitle2" noWrap>
                                                                            {rowField.playerName || 'Unnamed Player'}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell>
                                                                <RHFSelect name={`results.${originalIndex}.status`} size="small" sx={{ width: 140 }}>
                                                                    <MenuItem value="winner">Winner</MenuItem>
                                                                    <MenuItem value="lose">Loser</MenuItem>
                                                                </RHFSelect>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <RHFTextField
                                                                    name={`results.${originalIndex}.kills`}
                                                                    type="number"
                                                                    size="small"
                                                                    inputProps={{ min: 0 }}
                                                                    sx={{ width: 80 }}
                                                                    InputProps={isLoser ? { sx: { bgcolor: 'grey.300' } } : undefined}
                                                                />
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    bgcolor: 'grey.100',
                                                                    fontWeight: 'medium'
                                                                }}
                                                            >
                                                                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                                                                    <Typography variant="body2">
                                                                        {formatCoinAmount(winnings.killWin)}
                                                                    </Typography>
                                                                    <CoinIcon />
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <RHFTextField
                                                                    name={`results.${originalIndex}.winPrize`}
                                                                    type="number"
                                                                    size="small"
                                                                    inputProps={{ min: 0, step: 0.01 }}
                                                                    sx={{ width: 100 }}
                                                                    disabled={isLoser}
                                                                    InputProps={isLoser ? { sx: { bgcolor: 'grey.300' } } : undefined}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <RHFTextField
                                                                    name={`results.${originalIndex}.bonus`}
                                                                    type="number"
                                                                    size="small"
                                                                    inputProps={{ min: 0, step: 0.01 }}
                                                                    sx={{ width: 100 }}
                                                                    disabled={isLoser}
                                                                    InputProps={isLoser ? { sx: { bgcolor: 'grey.300' } } : undefined}
                                                                />
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    bgcolor: 'grey.100',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        {formatCoinAmount(winnings.totalWin)}
                                                                    </Typography>
                                                                    <CoinIcon />
                                                                </Stack>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}

                            {!participantsLoading && filteredResults.length === 0 && watchedResults.length > 0 && (
                                <Box
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No participants found matching your search.
                                    </Typography>
                                </Box>
                            )}

                            {!participantsLoading && watchedResults.length === 0 && (
                                <Box
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No participants found for this match.
                                    </Typography>
                                </Box>
                            )}

                            {/* {entriesMethods.formState.errors.results && (
                                <Typography variant="caption" color="error">
                                    {entriesMethods.formState.errors.results[0]?.pubgId?.message}
                                </Typography>
                            )} */}

                            <Stack spacing={1}>
                                <Stack direction="row" spacing={2}>
                                    <LoadingButton
                                        variant="outlined"
                                        color="inherit"
                                        onClick={onCancel}
                                        fullWidth
                                    >
                                        Cancel
                                    </LoadingButton>
                                    {!hasResultsEntered && (
                                        <LoadingButton
                                            variant="outlined"
                                            color="error"
                                            loading={refunding}
                                            onClick={handleRefund}
                                            fullWidth
                                        >
                                            Refund
                                        </LoadingButton>
                                    )}
                                    <LoadingButton
                                        variant="contained"
                                        onClick={handleUpdateEntries}
                                        loading={isSubmittingEntries}
                                        disabled={watchedResults.length === 0}
                                        fullWidth
                                    >
                                        {match.status === 'complete' ? 'Update' : 'Apply'}
                                    </LoadingButton>
                                </Stack>
                                {!hasResultsEntered && (
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                                        * Refund: Only when match is cancelled
                                    </Typography>
                                )}
                            </Stack>
                                    {/* <LoadingButton
                    variant="contained"
                    color="success"
                    onClick={handleDistributeWinnings}
                    loading={distributingWinnings}
                    disabled={watchedResults.length === 0 || distributingWinnings}
                    startIcon={<Iconify icon="solar:wallet-money-bold" />}
                  >
                    Distribute Winnings
                  </LoadingButton> */}
                        </Stack>
                    </FormProvider>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, url: null })}
                title="Delete screenshot?"
                content="This action cannot be undone. The screenshot will be permanently deleted."
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteScreenshotConfirm}
                        disabled={!!deletingUrl}
                    >
                        Delete
                    </Button>
                }
            />
        </Stack>
    );
}

type LocationState = {
    match?: IMatchRow;
};

export function MatchResultView() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const initialMatch = state?.match ?? null;

    const { getMatchByIdApi } = useApi();

    const [match, setMatch] = useState<IMatchRow | null>(initialMatch);
    const [loading, setLoading] = useState(!initialMatch);

    useEffect(() => {
        if (!matchId || initialMatch) {
            return;
        }

        const fetchMatch = async () => {
            try {
                setLoading(true);
                const response = await getMatchByIdApi(matchId);
                if (response?.data?.status && response.data.data) {
                    const data = response.data.data;
                    setMatch({
                        ...data,
                        id: data.id || data._id,
                    });
                } else {
                    toast.error('Failed to load match');
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to load match');
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [matchId, initialMatch, getMatchByIdApi]);

    const handleCancel = useCallback(() => {
        navigate(paths.games.matches);
    }, [navigate]);

    return (
        <Container maxWidth="lg">
            <Stack spacing={3}>
                {loading ? (
                    <Box sx={{ py: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MatchResultForm match={match} onCancel={handleCancel} />
                )}
            </Stack>
        </Container>
    );
}

