import { useMemo, useState, useEffect } from 'react';
import {
    Box,
    Card,
    Chip,
    Alert,
    Stack,
    Avatar,
    Divider,
    Skeleton,
    Container,
    Typography,
    LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { Image } from 'src/components/image';
import { fNumber, fShortenNumber } from 'src/utils/format-number';
import { getAvatarUrl } from 'src/utils/get-image-url';
import { useTranslate } from 'src/locales/use-locales';
import CoinValue from 'src/components/coin-value';
import {
    PulseCard,
    DEFAULT_GLASS_CARD_VARIANT,
    GlassPanelCard,
    GlassInnerTile,
    getDefaultGlassTokens,
    getGlassBadgeChipSx,
    getGlassInnerSx,
    GLASS_CARD_RADIUS_SM,
} from 'src/components/battle-glass-card';
import { socketService } from 'src/lib/socket';
import { HOME_GAME_ARTS } from './play-your-game-section';
import {
    homeMobileScrollGridSx,
    homeMobileScrollItemSx,
    homeMobileScrollFlexRowSx,
    homeMobileScrollFlexItemFullSx,
} from './home-horizontal-scroll';
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
                                    src={getAvatarUrl(player.avatar)}
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

type GlassTokens = ReturnType<typeof getDefaultGlassTokens>;

function DashboardMatchTile({
    match,
    index,
    total,
    variant,
    glassTokens,
    platformTotalWinnings,
}: {
    match: DashboardMatchSummary;
    index: number;
    total: number;
    variant: 'prize' | 'ongoing';
    glassTokens: GlassTokens;
    platformTotalWinnings?: number;
}) {
    const progressValue =
        variant === 'prize'
            ? Math.min(
                  100,
                  (match.prizeEstimate || 0) / Math.max(1, (platformTotalWinnings || 1) / 3) * 100
              )
            : Math.min(
                  100,
                  (match.participantsCount || 0) / Math.max(1, match.totalPlayer || 1) * 100
              );

    const progressCaption =
        variant === 'prize' ? (
            fShortenNumber(match.prizeEstimate || 0)
        ) : (
            <>
                Spots {match.participantsCount}/{match.totalPlayer || '∞'}
            </>
        );

    return (
        <GlassInnerTile>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                <Chip
                    size="small"
                    label={match.gameName || 'Match'}
                    sx={{ ...getGlassBadgeChipSx(glassTokens), fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: '#ffffff',
                        flex: 1,
                        minWidth: 0,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        fontWeight: 700,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {match.matchName}
                </Typography>
                <Chip
                    size="small"
                    label={`#${index + 1}/${total}`}
                    sx={{
                        flexShrink: 0,
                        ...getGlassBadgeChipSx(glassTokens),
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                    }}
                />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ mt: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{
                        flex: 1,
                        height: { xs: 6, sm: 8 },
                        borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
                        bgcolor: alpha('#ffffff', 0.08),
                        '& .MuiLinearProgress-bar': { bgcolor: glassTokens.stat.suffixColor },
                    }}
                />
                <Typography
                    variant="caption"
                    sx={{
                        minWidth: { xs: 70, sm: 110 },
                        textAlign: 'right',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        color: '#ffffff',
                    }}
                >
                    {progressCaption}
                </Typography>
            </Stack>
            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#ffffff', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {variant === 'prize' ? 'Entry: ' : 'Prize est. '}
                    {variant === 'prize' ? (
                        <CoinValue value={match.entryFee || 0} size={12} />
                    ) : (
                        <CoinValue value={match.prizeEstimate || 0} size={12} />
                    )}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: glassTokens.subtitleColor, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                    {variant === 'prize' ? (
                        <>
                            Spots: {match.participantsCount}/{match.totalPlayer || '∞'}
                        </>
                    ) : match.entryFee ? (
                        <>Entry <CoinValue value={match.entryFee || 0} size={12} /></>
                    ) : (
                        'Entry Free'
                    )}
                </Typography>
            </Stack>
        </GlassInnerTile>
    );
}

function DashboardMatchPanel({
    title,
    badgeLabel,
    matches,
    loading,
    variant,
    glassTokens,
    platformTotalWinnings,
    emptyLabel,
}: {
    title: string;
    badgeLabel: string;
    matches: DashboardMatchSummary[];
    loading?: boolean;
    variant: 'prize' | 'ongoing';
    glassTokens: GlassTokens;
    platformTotalWinnings?: number;
    emptyLabel: string;
}) {
    const count = matches.length;

    return (
        <GlassPanelCard>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="h6" sx={{ color: glassTokens.titleColor, fontSize: { xs: '0.95rem', sm: '1.25rem' }, fontWeight: 800 }}>
                    {title}
                </Typography>
                <Chip label={badgeLabel} size="small" sx={{ flexShrink: 0, ...getGlassBadgeChipSx(glassTokens) }} />
            </Stack>
            <Divider sx={{ mb: 2, borderColor: alpha('#ffffff', 0.1) }} />
            {loading ? (
                <Stack spacing={1.5}>
                    {Array.from({ length: variant === 'prize' ? 3 : 2 }).map((_, idx) => (
                        <Stack key={idx} spacing={0.5}>
                            <Skeleton width="80%" />
                            <LinearProgress />
                        </Stack>
                    ))}
                </Stack>
            ) : count ? (
                <Box sx={homeMobileScrollFlexRowSx}>
                    {matches.map((match, index) => (
                        <Box key={match.id || index} sx={homeMobileScrollFlexItemFullSx}>
                            <DashboardMatchTile
                                match={match}
                                index={index}
                                total={count}
                                variant={variant}
                                glassTokens={glassTokens}
                                platformTotalWinnings={platformTotalWinnings}
                            />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body2" sx={{ color: glassTokens.subtitleColor }}>
                    {emptyLabel}
                </Typography>
            )}
        </GlassPanelCard>
    );
}

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
        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.72) }}>
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
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.72) }}>
                    Prize est.
                </Typography>
                <Typography variant="subtitle2"><CoinValue value={match.prizeEstimate} size={14} /></Typography>
            </Stack>
            <Stack>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.72) }}>
                    Entry
                </Typography>
                <Typography variant="subtitle2">
                    {match.entryFee > 0 ? <CoinValue value={match.entryFee} size={14} /> : 'Free'}
                </Typography>
            </Stack>
            <Stack>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.72) }}>
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

    const loadStats = async () => {
        try {
            setState((prev) => ({ ...prev, loading: true, error: undefined }));
            let payload: PublicDashboardStats | undefined;

            try {
                const res = await api.getPublicDashboardStatsApi();
                payload = res?.data?.data || res?.data;
            } catch {
                // Fallback: same-origin (Vite/nginx proxy) or absolute API base
                const base = (CONFIG.serverUrl || '').replace(/\/$/, '');
                const url = `${base}/api/v3/public/dashboard`;
                const res = await fetch(url, {
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) {
                    throw new Error(`Dashboard stats HTTP ${res.status}`);
                }
                const json = await res.json();
                payload = json?.data || json;
            }

            if (payload?.platform) {
                setState({ loading: false, data: payload });
            } else {
                setState({ loading: false, data: null, error: 'Unable to load stats' });
            }
        } catch (error) {
            console.error('Failed to load landing stats', error);
            setState((prev) => ({
                ...prev,
                loading: false,
                error: 'Unable to load stats right now. Please try again shortly.',
            }));
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
                overflowX: 'hidden',
                bgcolor: '#0a0a0a',
                py: { xs: 4.5, md: 6 },
                color: '#f5f5f5',
                '&:before': {
                    content: "''",
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${HOME_GAME_ARTS[1]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    opacity: 0.16,
                    filter: 'grayscale(0.35) contrast(1.05)',
                    pointerEvents: 'none',
                    zIndex: 0,
                },
                '&:after': {
                    content: "''",
                    position: 'absolute',
                    inset: 0,
                    background: `
                        linear-gradient(180deg, ${alpha('#0a0a0a', 0.84)} 0%, ${alpha('#0a0a0a', 0.93)} 50%, #0a0a0a 100%),
                        radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha('#f5c518', 0.08)} 0%, transparent 55%)
                    `,
                    pointerEvents: 'none',
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

                    <Box
                        sx={homeMobileScrollGridSx(
                            {
                                xs: 'repeat(2, minmax(300px, 1fr))',
                                md: 'repeat(2, minmax(0, 1fr))',
                            },
                            { xs: 2, md: 2 }
                        )}
                    >
                        <Box sx={{ ...homeMobileScrollItemSx, minWidth: { xs: 300, md: 0 } }}>
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
                        </Box>
                        <Box sx={{ ...homeMobileScrollItemSx, minWidth: { xs: 300, md: 0 } }}>
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
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
                            gap: 2.5,
                        }}
                    >
                        <DashboardMatchPanel
                            title={t('home.dashboard.highPrizeBattles')}
                            badgeLabel={t('home.dashboard.topN')}
                            matches={data?.highPrizeMatches || []}
                            loading={loading}
                            variant="prize"
                            glassTokens={glassTokens}
                            platformTotalWinnings={data?.platform?.totalWinnings}
                            emptyLabel={t('home.dashboard.noHighPrizeMatches')}
                        />
                        <DashboardMatchPanel
                            title={t('home.dashboard.ongoingMatchesTitle')}
                            badgeLabel={
                                data?.ongoingMatches?.length
                                    ? `${data.ongoingMatches.length} ${t('home.dashboard.listed')}`
                                    : t('home.dashboard.upcoming')
                            }
                            matches={data?.ongoingMatches || []}
                            loading={loading}
                            variant="ongoing"
                            glassTokens={glassTokens}
                            emptyLabel={t('home.dashboard.noOngoingMatches')}
                        />
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

