import { useMemo, useState, useEffect } from 'react';
import {
    Box,
    Card,
    Chip,
    Grid,
    Alert,
    Stack,
    Avatar,
    Divider,
    Skeleton,
    Container,
    IconButton,
    Typography,
    LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
// icon arrow left and right
// need to icon from project used already
import { Iconify } from 'src/components/iconify/iconify';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { toast } from 'react-hot-toast';
import { Image } from 'src/components/image';
import { fNumber, fShortenNumber } from 'src/utils/format-number';
import { useTranslate } from 'src/locales/use-locales';
import CoinValue from 'src/components/coin-value';
import {
    PulseCard,
    DEFAULT_GLASS_CARD_VARIANT,
    GlassPanelCard,
    GlassInnerTile,
    getDefaultGlassTokens,
    getGlassBadgeChipSx,
    getGlassIconButtonSx,
    getGlassInnerSx,
    GLASS_CARD_RADIUS_SM,
} from 'src/components/battle-glass-card';
import { socketService } from 'src/lib/socket';
import type {
    DashboardTopPlayer,
    PublicDashboardStats,
    DashboardMatchSummary,
} from 'src/types';

type SectionState = {
    loading: boolean;
    data: PublicDashboardStats | null;
    error?: string;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const PlayerListCard = ({
    title,
    hint,
    players,
    loading,
    metricKey,
    translations,
}: {
    title: string;
    hint: string;
    players: DashboardTopPlayer[];
    loading?: boolean;
    metricKey: 'totalWinnings' | 'winRate' | 'totalKills' | 'averageScore';
    translations: {
        live: string;
        noDataYet: string;
        lastPlayed: string;
        winnings: string;
        kills: string;
        winRate: string;
        avgScore: string;
    };
}) => {
    const tokens = getDefaultGlassTokens();

    return (
    <GlassPanelCard>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" sx={{ color: tokens.titleColor, fontSize: { xs: '0.95rem', sm: '1.25rem' }, fontWeight: 800, wordBreak: 'break-word' }}>{title}</Typography>
                <Typography variant="caption" sx={{ color: tokens.subtitleColor, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {hint}
                </Typography>
            </Stack>
            <Chip size="small" label={translations.live} sx={{ flexShrink: 0, ...getGlassBadgeChipSx(tokens) }} />
        </Stack>
        <Divider sx={{ mb: 2, borderColor: alpha('#ffffff', 0.1) }} />
        {loading ? (
            <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="circular" width={40} height={40} />
                        <Stack sx={{ flex: 1 }}>
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                        </Stack>
                        <Skeleton width={80} />
                    </Stack>
                ))}
            </Stack>
        ) : (
            <Stack spacing={1.5}>
                {players.length === 0 ? (
                    <Typography variant="body2" sx={{ color: tokens.subtitleColor }}>
                        {translations.noDataYet}
                    </Typography>
                ) : (
                    players.map((player, idx) => {
                        const metricValue = (() => {
                            switch (metricKey) {
                                case 'totalWinnings':
                                    return <CoinValue value={player.totalWinnings || 0} size={14} />;
                                case 'winRate':
                                    return `${fNumber(player.winRate || 0)}%`;
                                case 'totalKills':
                                    return fNumber(player.totalKills || 0);
                                case 'averageScore':
                                default:
                                    return fNumber(player.averageScore || 0);
                            }
                        })();
                        return (
                            <Stack
                                key={`${player.userId}-${idx}`}
                                direction="row"
                                spacing={{ xs: 1, sm: 1.5 }}
                                alignItems="center"
                                sx={getGlassInnerSx(tokens, {
                                    p: { xs: 0.75, sm: 1 },
                                    borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
                                })}
                            >
                                <Avatar
                                    src={player.avatar || ''}
                                    alt={player.username}
                                    sx={{
                                        width: { xs: 32, sm: 42 },
                                        height: { xs: 32, sm: 42 },
                                        bgcolor: alpha('#0ea5e9', 0.2),
                                        color: '#e2e8f0',
                                        fontWeight: 700,
                                        fontSize: { xs: '0.75rem', sm: '1rem' },
                                        flexShrink: 0,
                                    }}
                                >
                                    {player.username?.[0]?.toUpperCase() || '?'}
                                </Avatar>
                                <Stack sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <Typography variant="subtitle2" noWrap sx={{ color: '#ffffff', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{player.username}</Typography>
                                    <Typography variant="caption" noWrap sx={{ color: tokens.subtitleColor, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                                        {translations.lastPlayed}: {formatDateTime(player.lastPlayed)}
                                    </Typography>
                                </Stack>
                                <Stack spacing={0.25} sx={{ textAlign: 'right', flexShrink: 0 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#ffffff', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{metricValue}</Typography>
                                    <Typography variant="caption" noWrap sx={{ color: tokens.stat.labelColor, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                                        {metricKey === 'totalWinnings'
                                            ? translations.winnings
                                            : metricKey === 'winRate'
                                                ? translations.winRate
                                                : metricKey === 'totalKills'
                                                    ? translations.kills
                                                    : translations.avgScore}
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    })
                )}
            </Stack>
        )}
    </GlassPanelCard>
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MatchCard = ({
    match,
    highlight,
}: {
    match: DashboardMatchSummary;
    highlight?: boolean;
}) => (
    <Card
        sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: (theme) => alpha('#0b1224', 0.9),
            border: (theme) =>
                highlight
                    ? `1px solid ${alpha(theme.palette.warning.main, 0.5)}`
                    : `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            boxShadow: (theme) =>
                highlight
                    ? `0 16px 40px ${alpha(theme.palette.warning.main, 0.18)}`
                    : `0 10px 26px ${alpha(theme.palette.primary.main, 0.12)}`,
            backdropFilter: 'blur(8px)',
        }}
    >
        <Stack direction="row" spacing={1} alignItems="center">
            <Chip
                label={match.status}
                size="small"
                color={match.status === 'start' ? 'warning' : 'success'}
                variant="filled"
            />
            {match.gameName ? (
                <Chip label={match.gameName} size="small" variant="outlined" />
            ) : null}
        </Stack>

        <Typography variant="subtitle1">{match.matchName}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Starts: {formatDateTime(match.matchSchedule as unknown as string)}
        </Typography>

        {match.banner ? (
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
            >
                <Image
                    alt={match.matchName}
                    src={CONFIG.serverUrl + match.banner}
                    ratio="16/9"
                />
            </Box>
        ) : null}

        <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
            <Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Prize est.
                </Typography>
                <Typography variant="subtitle2"><CoinValue value={match.prizeEstimate} size={14} /></Typography>
            </Stack>
            <Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Entry
                </Typography>
                <Typography variant="subtitle2">
                    {match.entryFee > 0 ? <CoinValue value={match.entryFee} size={14} /> : 'Free'}
                </Typography>
            </Stack>
            <Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Spots
                </Typography>
                <Typography variant="subtitle2">
                    {match.participantsCount}/{match.totalPlayer || '∞'}
                </Typography>
            </Stack>
        </Stack>
    </Card>
);

export function LandingDashboardSection() {
    const { t } = useTranslate();
    const api = useApi();
    const [state, setState] = useState<SectionState>({ loading: true, data: null });
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [ongoingIndex, setOngoingIndex] = useState(0);

    const loadStats = async () => {
        try {
            setState((prev) => ({ ...prev, loading: true, error: undefined }));
            const res = await api.getPublicDashboardStatsApi();
            const payload: PublicDashboardStats | undefined = res?.data?.data || res?.data;
            if (payload?.platform) {
                setState({ loading: false, data: payload });
            } else {
                setState({ loading: false, data: null, error: 'Unable to load stats' });
            }
        } catch (error) {
            console.error('Failed to load landing stats', error);
            toast.error('Failed to load live stats');
            setState((prev) => ({ ...prev, loading: false, error: 'Unable to load stats' }));
        }
    };

    // Silently refresh data (no loading spinner) for real-time updates
    const refreshStats = async () => {
        try {
            const res = await api.getPublicDashboardStatsApi();
            const payload: PublicDashboardStats | undefined = res?.data?.data || res?.data;
            if (payload?.platform) {
                setState((prev) => ({ ...prev, data: payload }));
            }
        } catch (error) {
            console.error('Failed to refresh landing stats', error);
        }
    };

    useEffect(() => {
        loadStats();

        // Connect an anonymous socket so the dashboard can receive global events
        // (no auth token needed — the server now allows public connections).
        socketService.connectPublic(CONFIG.serverUrl);

        // Re-fetch leaderboard whenever match results change and balances are updated.
        const handleDashboardUpdate = () => {
            refreshStats();
        };
        socketService.onDashboardStatsUpdated(handleDashboardUpdate);

        // Fallback: periodic refresh every 60 s in case the socket is unavailable.
        const pollInterval = setInterval(refreshStats, 60_000);

        return () => {
            socketService.offDashboardStatsUpdated(handleDashboardUpdate);
            socketService.disconnectPublic();
            clearInterval(pollInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { loading, data, error } = state;

    useEffect(() => {
        setCarouselIndex(0);
    }, [data?.highPrizeMatches?.length]);

    useEffect(() => {
        setOngoingIndex(0);
    }, [data?.ongoingMatches?.length]);


    const stats = useMemo(() => {
        if (!data?.platform) {
            return {
                totalWinnings: '—',
                processedMatches: '—',
                ongoingMatches: '—',
            };
        }
        return {
            totalWinnings: <CoinValue value={data.platform.totalWinnings || 0} size={24} />,
            processedMatches: fNumber(data.platform.processedMatches || 0),
            ongoingMatches: fNumber(data.platform.ongoingMatches || 0),
        };
    }, [data]);

    const pulseLabels = useMemo(
        () => ({
            platformTotalWinnings: t('home.dashboard.platformTotalWinnings'),
            processedMatches: t('home.dashboard.processedMatches'),
            ongoingMatches: t('home.dashboard.ongoingMatches'),
        }),
        [t]
    );

    const glassTokens = useMemo(() => getDefaultGlassTokens(), []);

    return (
        <Box
            id="public-dashboard"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#000000',
                py: { xs: 4, md: 5 },
                color: '#f5f5f5',
                '&:before': {
                    content: "''",
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url(/assets/images/dashboard-pubg-black.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 0,
                },
                '&:after': {
                    content: "''",
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, ${alpha('#000000', 0.55)} 0%, ${alpha('#000000', 0.35)} 45%, ${alpha('#000000', 0.72)} 100%)`,
                    zIndex: 0,
                },
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Stack spacing={3.5}>
                    <PulseCard
                        variant={DEFAULT_GLASS_CARD_VARIANT}
                        badgeLabel={t('home.dashboard.liveDashboardChip')}
                        title={t('home.dashboard.battleAsiaPulse')}
                        description={t('home.dashboard.pulseDescription')}
                        liveSuffix={t('home.dashboard.live')}
                        labels={pulseLabels}
                        stats={stats}
                        loading={loading}
                    />

                    {error && !loading ? <Alert severity="warning">{error}</Alert> : null}

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <PlayerListCard
                                title={t('home.dashboard.topProfitGenerators')}
                                hint={t('home.dashboard.mostWinningsHint')}
                                players={data?.topProfitPlayers || []}
                                loading={loading}
                                metricKey="totalWinnings"
                                translations={{
                                    live: t('home.dashboard.live'),
                                    noDataYet: t('home.dashboard.noDataYet'),
                                    lastPlayed: t('home.dashboard.lastPlayed'),
                                    winnings: t('home.dashboard.winnings'),
                                    kills: t('home.dashboard.kills'),
                                    winRate: t('home.dashboard.winRate'),
                                    avgScore: t('home.dashboard.avgScore'),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <PlayerListCard
                                title={t('home.dashboard.topPlayers')}
                                hint={t('home.dashboard.topPlayersHint')}
                                players={data?.topPlayers || []}
                                loading={loading}
                                metricKey="totalKills"
                                translations={{
                                    live: t('home.dashboard.live'),
                                    noDataYet: t('home.dashboard.noDataYet'),
                                    lastPlayed: t('home.dashboard.lastPlayed'),
                                    winnings: t('home.dashboard.winnings'),
                                    kills: t('home.dashboard.kills'),
                                    winRate: t('home.dashboard.winRate'),
                                    avgScore: t('home.dashboard.avgScore'),
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={5}>
                            <GlassPanelCard>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ color: glassTokens.titleColor, fontSize: { xs: '0.95rem', sm: '1.25rem' }, fontWeight: 800 }}>{t('home.dashboard.highPrizeBattles')}</Typography>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setCarouselIndex((prev) =>
                                                        data?.highPrizeMatches?.length
                                                            ? (prev - 1 + data.highPrizeMatches.length) % data.highPrizeMatches.length
                                                            : 0
                                                    )
                                                }
                                                sx={getGlassIconButtonSx()}
                                            >
                                                <Iconify icon="solar:alt-arrow-left-line-duotone" width={20} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setCarouselIndex((prev) =>
                                                        data?.highPrizeMatches?.length ? (prev + 1) % data.highPrizeMatches.length : 0
                                                    )
                                                }
                                                sx={getGlassIconButtonSx()}
                                            >
                                                <Iconify icon="solar:alt-arrow-right-line-duotone" width={20} />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                    <Chip label={t('home.dashboard.topN')} size="small" sx={{ flexShrink: 0, ...getGlassBadgeChipSx(glassTokens) }} />
                                </Stack>
                                <Divider sx={{ mb: 2, borderColor: alpha('#ffffff', 0.1) }} />
                                {loading ? (
                                    <Stack spacing={1.5}>
                                        {Array.from({ length: 3 }).map((_, idx) => (
                                            <Stack key={idx} spacing={0.5}>
                                                <Skeleton width="80%" />
                                                <LinearProgress />
                                            </Stack>
                                        ))}
                                    </Stack>
                                ) : data?.highPrizeMatches?.length ? (
                                    <Box>
                                        <GlassInnerTile key={data.highPrizeMatches[carouselIndex]?.id || carouselIndex}>
                                            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                <Chip 
                                                    size="small" 
                                                    label={data.highPrizeMatches[carouselIndex]?.gameName || 'Match'} 
                                                    sx={{ ...getGlassBadgeChipSx(glassTokens), fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                                                />
                                                <Typography 
                                                    variant="subtitle2" 
                                                    noWrap 
                                                    sx={{ 
                                                        color: '#ffffff',
                                                        flex: 1, 
                                                        minWidth: 0,
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                >
                                                    {data.highPrizeMatches[carouselIndex]?.matchName}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={`#${carouselIndex + 1}/${data.highPrizeMatches.length}`}
                                                    sx={{ 
                                                        flexShrink: 0,
                                                        ...getGlassBadgeChipSx(glassTokens),
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                        height: { xs: 20, sm: 24 }
                                                    }}
                                                />
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ mt: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(
                                                        100,
                                                        (data.highPrizeMatches[carouselIndex]?.prizeEstimate ||
                                                            0) /
                                                        Math.max(1, (data?.platform?.totalWinnings || 1) / 3) *
                                                        100
                                                    )}
                                                    sx={{ flex: 1, height: { xs: 6, sm: 8 }, borderRadius: `${GLASS_CARD_RADIUS_SM}px`, bgcolor: alpha('#ffffff', 0.08), '& .MuiLinearProgress-bar': { bgcolor: glassTokens.stat.suffixColor } }}
                                                />
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        minWidth: { xs: 70, sm: 90 }, 
                                                        textAlign: 'right',
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {fShortenNumber(data.highPrizeMatches[carouselIndex]?.prizeEstimate || 0)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: '#ffffff',
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                                    }}
                                                >
                                                    Entry: <CoinValue value={data.highPrizeMatches[carouselIndex]?.entryFee || 0} size={12} />
                                                </Typography>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: glassTokens.subtitleColor,
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                                    }}
                                                >
                                                    Spots: {data.highPrizeMatches[carouselIndex]?.participantsCount}/
                                                    {data.highPrizeMatches[carouselIndex]?.totalPlayer || '∞'}
                                                </Typography>
                                            </Stack>
                                        </GlassInnerTile>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ color: glassTokens.subtitleColor }}>
                                        {t('home.dashboard.noHighPrizeMatches')}
                                    </Typography>
                                )}
                            </GlassPanelCard>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <GlassPanelCard>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ color: glassTokens.titleColor, fontSize: { xs: '0.95rem', sm: '1.25rem' }, fontWeight: 800 }}>{t('home.dashboard.ongoingMatchesTitle')}</Typography>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setOngoingIndex((prev) =>
                                                        data?.ongoingMatches?.length
                                                            ? (prev - 1 + data.ongoingMatches.length) % data.ongoingMatches.length
                                                            : 0
                                                    )
                                                }
                                                sx={getGlassIconButtonSx()}
                                            >
                                                <Iconify icon="solar:alt-arrow-left-line-duotone" width={20} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setOngoingIndex((prev) =>
                                                        data?.ongoingMatches?.length ? (prev + 1) % data.ongoingMatches.length : 0
                                                    )
                                                }
                                                sx={getGlassIconButtonSx()}
                                            >
                                                <Iconify icon="solar:alt-arrow-right-line-duotone" width={20} />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                    <Chip
                                        label={data?.ongoingMatches?.length ? `${data.ongoingMatches.length} ${t('home.dashboard.listed')}` : t('home.dashboard.upcoming')}
                                        size="small"
                                        sx={{ flexShrink: 0, ...getGlassBadgeChipSx(glassTokens), fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                                    />
                                </Stack>
                                <Divider sx={{ my: 1.5, borderColor: alpha('#ffffff', 0.1) }} />
                                {loading ? (
                                    <Stack spacing={1.5}>
                                        {Array.from({ length: 2 }).map((_, idx) => (
                                            <GlassInnerTile key={idx}>
                                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: `${GLASS_CARD_RADIUS_SM}px`, mb: 1 }} />
                                                <Skeleton width="70%" />
                                                <Skeleton width="40%" />
                                            </GlassInnerTile>
                                        ))}
                                    </Stack>
                                ) : data?.ongoingMatches?.length ? (
                                    <Box sx={{ position: 'relative' }}>
                                        <GlassInnerTile key={data.ongoingMatches[ongoingIndex]?.id || ongoingIndex}>
                                            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                <Chip 
                                                    size="small" 
                                                    label={data.ongoingMatches[ongoingIndex]?.gameName || 'Match'} 
                                                    sx={{ ...getGlassBadgeChipSx(glassTokens), fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                                                />
                                                <Typography 
                                                    variant="subtitle2" 
                                                    noWrap
                                                    sx={{ 
                                                        color: '#ffffff',
                                                        flex: 1, 
                                                        minWidth: 0,
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                >
                                                    {data.ongoingMatches[ongoingIndex]?.matchName}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={`#${ongoingIndex + 1}/${data.ongoingMatches.length}`}
                                                    sx={{ 
                                                        flexShrink: 0,
                                                        ...getGlassBadgeChipSx(glassTokens),
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                        height: { xs: 20, sm: 24 }
                                                    }}
                                                />
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ mt: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(
                                                        100,
                                                        (data.ongoingMatches[ongoingIndex]?.participantsCount || 0) /
                                                        Math.max(1, data.ongoingMatches[ongoingIndex]?.totalPlayer || 1) *
                                                        100
                                                    )}
                                                    sx={{ flex: 1, height: { xs: 6, sm: 8 }, borderRadius: `${GLASS_CARD_RADIUS_SM}px`, bgcolor: alpha('#ffffff', 0.08), '& .MuiLinearProgress-bar': { bgcolor: glassTokens.stat.suffixColor } }}
                                                />
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        minWidth: { xs: 90, sm: 110 }, 
                                                        textAlign: 'right',
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    Spots {data.ongoingMatches[ongoingIndex]?.participantsCount}/
                                                    {data.ongoingMatches[ongoingIndex]?.totalPlayer || '∞'}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: '#ffffff',
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                                    }}
                                                >
                                                    Prize est. <CoinValue value={data.ongoingMatches[ongoingIndex]?.prizeEstimate || 0} size={12} />
                                                </Typography>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: glassTokens.subtitleColor,
                                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                                    }}
                                                >
                                                    Entry {data.ongoingMatches[ongoingIndex]?.entryFee ? <CoinValue value={data.ongoingMatches[ongoingIndex]?.entryFee || 0} size={12} /> : 'Free'}
                                                </Typography>
                                            </Stack>
                                        </GlassInnerTile>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ color: glassTokens.subtitleColor }}>
                                        {t('home.dashboard.noOngoingMatches')}
                                    </Typography>
                                )}
                            </GlassPanelCard>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}

