import { useMemo, useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Alert,
    Stack,
    Avatar,
    Skeleton,
    Container,
    Typography,
    LinearProgress,
    Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { fNumber, fShortenNumber } from 'src/utils/format-number';
import { getAvatarUrl } from 'src/utils/get-image-url';
import { useTranslate } from 'src/locales/use-locales';
import CoinValue from 'src/components/coin-value';
import { Iconify } from 'src/components/iconify';
import type { PulseCardLabels, PulseCardStats } from 'src/components/battle-glass-card';
import { getDefaultGlassTokens } from 'src/components/battle-glass-card';
import { socketService } from 'src/lib/socket';
import { HOME_GAME_ARTS } from './home-game-arts';
import {
    homeMobileScrollItemSx,
    homeMobileScrollFlexRowSx,
} from './home-horizontal-scroll';
import { AnimatedCoinValue } from './animated-coin-value';
import { PulseCountUp } from './pulse-count-up';
import {
    formatPulseLastUpdated,
    sanitizePublicDashboardData,
} from './pulse-dashboard-utils';
import { HOME_GOLD, HOME_ROW_LINE, HomeBlurPanel } from './home-blur-panel';
import { chunkItems, HomeChunkCarousel } from './home-chunk-carousel';
import { LivePulseDot } from './live-pulse-dot';
import { HOME_MUTED_TEXT, HOME_MUTED_TEXT_DIM, homePremiumPanelGlowSx } from './home-tokens';
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

/** Simple gaming split — one gold beam, fade ends, soft glow */
function DashboardSplitGoldRule({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
    const isVertical = orientation === 'vertical';

    return (
        <Box
            aria-hidden
            sx={{
                display: isVertical ? { xs: 'none', md: 'block' } : { xs: 'block', md: 'none' },
                alignSelf: 'stretch',
                flexShrink: 0,
                mx: isVertical ? { md: 2.5, lg: 3.5 } : 'auto',
                my: isVertical ? 0 : 2.5,
                width: isVertical ? 2 : 1,
                maxWidth: isVertical ? 2 : 220,
                minHeight: isVertical ? 140 : 2,
                background: isVertical
                    ? `linear-gradient(180deg,
                        transparent 0%,
                        ${alpha(HOME_GOLD, 0.2)} 10%,
                        ${HOME_GOLD} 50%,
                        ${alpha(HOME_GOLD, 0.2)} 90%,
                        transparent 100%)`
                    : `linear-gradient(90deg,
                        transparent 0%,
                        ${alpha(HOME_GOLD, 0.2)} 10%,
                        ${HOME_GOLD} 50%,
                        ${alpha(HOME_GOLD, 0.2)} 90%,
                        transparent 100%)`,
                boxShadow: `0 0 12px ${alpha(HOME_GOLD, 0.22)}`,
                clipPath: isVertical
                    ? 'polygon(0 0, 100% 3%, 100% 97%, 0 100%)'
                    : 'polygon(0 0, 97% 0, 100% 100%, 3% 100%)',
            }}
        />
    );
}

function FlatPulseStat({
    label,
    value,
    suffix,
    icon,
    loading,
}: {
    label: string;
    value: React.ReactNode;
    suffix?: string;
    icon: string;
    loading?: boolean;
}) {
    const tokens = getDefaultGlassTokens();

    return (
        <Box
            sx={{
                p: { xs: 1.25, sm: 1.5 },
                minHeight: { xs: 90, sm: 100 },
                height: '100%',
                borderTop: `2px solid ${HOME_GOLD}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            {loading ? (
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Skeleton variant="circular" width={36} height={36} />
                    <Stack spacing={0.75} sx={{ flex: 1 }}>
                        <Skeleton width="55%" />
                        <Skeleton width="40%" />
                    </Stack>
                </Stack>
            ) : (
                <Stack direction="row" spacing={1.1} alignItems="center">
                    <Box
                        sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: HOME_GOLD,
                        }}
                    >
                        <Iconify icon={icon} width={20} />
                    </Box>
                    <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                letterSpacing: 0.7,
                                color: tokens.stat.labelColor,
                                fontSize: { xs: '0.55rem', sm: '0.64rem' },
                                lineHeight: 1.25,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                wordBreak: 'break-word',
                            }}
                        >
                            {label}
                        </Typography>
                        <Typography
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                gap: 0.5,
                                minWidth: 0,
                                color: tokens.stat.valueColor,
                                fontSize: {
                                    xs: 'clamp(0.92rem, 3.6vw, 1.15rem)',
                                    sm: '1.28rem',
                                    md: '1.42rem',
                                },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                '& > *': {
                                    minWidth: 0,
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                            }}
                        >
                            {value}
                            {suffix ? (
                                <Typography
                                    component="span"
                                    sx={{
                                        color: tokens.stat.suffixColor,
                                        fontSize: { xs: '0.62rem', sm: '0.72rem' },
                                        fontWeight: 600,
                                    }}
                                >
                                    {suffix}
                                </Typography>
                            ) : null}
                        </Typography>
                    </Stack>
                </Stack>
            )}
        </Box>
    );
}

function PulseHeroFlat({
    badgeLabel,
    title,
    description,
    liveSuffix,
    labels,
    stats,
    loading,
    lastUpdatedLabel,
}: {
    badgeLabel: string;
    title: string;
    description: string;
    liveSuffix: string;
    labels: PulseCardLabels;
    stats: PulseCardStats;
    loading?: boolean;
    lastUpdatedLabel?: string;
}) {
    const tokens = getDefaultGlassTokens();

    const statTiles = [
        {
            key: 'winnings',
            label: labels.platformTotalWinnings,
            value: stats.totalWinnings,
            suffix: undefined,
            icon: 'solar:wallet-money-bold',
        },
        {
            key: 'matches',
            label: labels.processedMatches,
            value: stats.processedMatches,
            suffix: undefined,
            icon: 'solar:medal-ribbon-star-bold',
        },
        {
            key: 'live',
            label: labels.ongoingMatches,
            value: stats.ongoingMatches,
            suffix: liveSuffix,
            icon: 'solar:play-bold',
        },
        {
            key: 'joined',
            label: labels.todayJoinedUsers,
            value: stats.todayJoinedUsers,
            suffix: undefined,
            icon: 'solar:user-plus-rounded-bold',
        },
    ] as const;

    return (
        <HomeBlurPanel>
            <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="center">
                <Grid item xs={12} md={5}>
                    <Stack spacing={1.25}>
                        <Stack direction="row" alignItems="center" spacing={0.85}>
                            <LivePulseDot color="gold" size={7} />
                            <Typography
                                sx={{
                                    fontSize: { xs: '0.68rem', sm: '0.76rem' },
                                    fontWeight: 700,
                                    letterSpacing: 0.75,
                                    textTransform: 'uppercase',
                                    color: alpha(HOME_GOLD, 0.92),
                                }}
                            >
                                {badgeLabel}
                            </Typography>
                        </Stack>
                        <Typography
                            variant="h3"
                            sx={{
                                color: tokens.titleColor,
                                fontSize: { xs: '1.45rem', sm: '1.75rem', md: '2.1rem' },
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: { xs: 0.6, md: 1.1 },
                                wordBreak: 'break-word',
                                lineHeight: 1.1,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: tokens.subtitleColor,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                lineHeight: 1.55,
                                maxWidth: 480,
                            }}
                        >
                            {description}
                        </Typography>
                        {lastUpdatedLabel ? (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: HOME_MUTED_TEXT_DIM,
                                    fontWeight: 600,
                                    letterSpacing: 0.3,
                                    fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                }}
                            >
                                {lastUpdatedLabel}
                            </Typography>
                        ) : null}
                    </Stack>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Grid container spacing={1.25}>
                        {statTiles.map((tile) => (
                            <Grid key={tile.key} item xs={6} sx={{ display: 'flex' }}>
                                <Box sx={{ width: 1 }}>
                                    <FlatPulseStat
                                        label={tile.label}
                                        value={tile.value}
                                        suffix={tile.suffix}
                                        icon={tile.icon}
                                        loading={loading}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </HomeBlurPanel>
    );
}

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
    <HomeBlurPanel sx={homePremiumPanelGlowSx}>
        <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ mb: 1.25, flexWrap: 'wrap', gap: 0.75 }}
        >
            <Stack spacing={0.45} sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: tokens.titleColor,
                        fontSize: { xs: '1rem', sm: '1.15rem' },
                        fontWeight: 800,
                        wordBreak: 'break-word',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: HOME_MUTED_TEXT,
                        fontSize: { xs: '0.72rem', sm: '0.82rem' },
                        lineHeight: 1.5,
                    }}
                >
                    {hint}
                </Typography>
            </Stack>
            <LivePulseDot label={translations.live} color="green" />
        </Stack>
        <Box sx={{ borderTop: HOME_ROW_LINE }}>
        {loading ? (
            <Stack spacing={0}>
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Stack
                        key={idx}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                            py: { xs: 0.85, sm: 0.95 },
                            borderBottom: idx < 2 ? HOME_ROW_LINE : 'none',
                        }}
                    >
                        <Skeleton variant="circular" width={34} height={34} />
                        <Stack sx={{ flex: 1 }}>
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                        </Stack>
                        <Skeleton width={80} />
                    </Stack>
                ))}
            </Stack>
        ) : (
            players.length === 0 ? (
                <Typography variant="body2" sx={{ color: HOME_MUTED_TEXT, py: 2 }}>
                    {translations.noDataYet}
                </Typography>
            ) : (
                <HomeChunkCarousel
                    pages={chunkItems(players, 3).map((pagePlayers, pageIndex) => (
                        <Stack key={pageIndex} spacing={0}>
                            {pagePlayers.map((player, idx) => {
                                const globalIdx = pageIndex * 3 + idx;
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
                                        key={`${player.userId}-${globalIdx}`}
                                        direction="row"
                                        spacing={{ xs: 1, sm: 1.5 }}
                                        alignItems="center"
                                        sx={{
                                            py: { xs: 0.85, sm: 0.95 },
                                            borderBottom: idx < pagePlayers.length - 1 ? HOME_ROW_LINE : 'none',
                                            transition: 'background-color 0.15s ease',
                                            '&:hover': {
                                                bgcolor: alpha('#ffffff', 0.03),
                                            },
                                        }}
                                    >
                                        <Avatar
                                            src={getAvatarUrl(player.avatar)}
                                            alt={player.username}
                                            sx={{
                                                width: { xs: 32, sm: 36 },
                                                height: { xs: 32, sm: 36 },
                                                bgcolor: alpha('#0ea5e9', 0.16),
                                                color: '#e2e8f0',
                                                fontWeight: 700,
                                                fontSize: { xs: '0.7rem', sm: '0.82rem' },
                                                flexShrink: 0,
                                            }}
                                        >
                                            {player.username?.[0]?.toUpperCase() || '?'}
                                        </Avatar>
                                        <Stack sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                            <Typography
                                                variant="subtitle2"
                                                noWrap
                                                sx={{
                                                    color: '#ffffff',
                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {player.username}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                noWrap
                                                sx={{
                                                    color: HOME_MUTED_TEXT_DIM,
                                                    fontSize: { xs: '0.68rem', sm: '0.76rem' },
                                                }}
                                            >
                                                {translations.lastPlayed}: {formatDateTime(player.lastPlayed)}
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={0.2} sx={{ textAlign: 'right', flexShrink: 0 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: '#ffffff',
                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                    fontWeight: 700,
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {metricValue}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                noWrap
                                                sx={{
                                                    color: HOME_MUTED_TEXT_DIM,
                                                    fontSize: { xs: '0.62rem', sm: '0.7rem' },
                                                }}
                                            >
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
                            })}
                        </Stack>
                    ))}
                />
            )
        )}
        </Box>
    </HomeBlurPanel>
    );
};

type GlassTokens = ReturnType<typeof getDefaultGlassTokens>;

const TARGET_MATCH_TILES = 3;

function DashboardMatchTile({
    match,
    index,
    total,
    variant,
    isLast,
    platformTotalWinnings,
}: {
    match: DashboardMatchSummary;
    index: number;
    total: number;
    variant: 'prize' | 'ongoing';
    isLast?: boolean;
    platformTotalWinnings?: number;
}) {
    const { t } = useTranslate();
    const progressValue =
        variant === 'prize'
            ? Math.min(
                  100,
                  ((match.prizeEstimate || 0) / Math.max(1, (platformTotalWinnings || 1) / 3)) * 100
              )
            : Math.min(
                  100,
                  ((match.participantsCount || 0) / Math.max(1, match.totalPlayer || 1)) * 100
              );

    const progressCaption =
        variant === 'prize' ? (
            fShortenNumber(match.prizeEstimate || 0)
        ) : (
            <>
                {t('home.dashboard.spots')} {match.participantsCount}/{match.totalPlayer || '∞'}
            </>
        );

    return (
        <Box
            sx={{
                py: { xs: 1.1, sm: 1.25 },
                px: { xs: 0.5, sm: 0.75 },
                borderBottom: isLast ? 'none' : HOME_ROW_LINE,
                borderLeft: variant === 'ongoing' ? `2px solid ${alpha(HOME_GOLD, 0.35)}` : 'none',
                bgcolor: variant === 'ongoing' ? alpha(HOME_GOLD, 0.03) : 'transparent',
                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    bgcolor: alpha(HOME_GOLD, 0.05),
                    boxShadow: `inset 0 0 18px ${alpha(HOME_GOLD, 0.06)}`,
                },
            }}
        >
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                <Typography
                    noWrap
                    sx={{
                        flexShrink: 0,
                        maxWidth: { xs: 72, sm: 84 },
                        fontSize: { xs: '0.58rem', sm: '0.62rem' },
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        color: alpha(HOME_GOLD, 0.85),
                    }}
                >
                    {match.gameName || 'Match'}
                </Typography>
                <Typography
                    noWrap
                    sx={{
                        color: '#ffffff',
                        flex: 1,
                        minWidth: 0,
                        fontSize: { xs: '0.74rem', sm: '0.82rem' },
                        fontWeight: 700,
                        lineHeight: 1.25,
                    }}
                >
                    {match.matchName}
                </Typography>
                <Typography
                    sx={{
                        flexShrink: 0,
                        fontSize: { xs: '0.58rem', sm: '0.62rem' },
                        fontWeight: 700,
                        color: HOME_MUTED_TEXT_DIM,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    #{index + 1}/{total}
                </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.55, minWidth: 0 }}>
                <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 0.5,
                        bgcolor: alpha('#ffffff', 0.08),
                        '& .MuiLinearProgress-bar': {
                            bgcolor: HOME_GOLD,
                            borderRadius: 0.5,
                        },
                    }}
                />
                <Typography
                    sx={{
                        flexShrink: 0,
                        minWidth: { xs: 36, sm: 44 },
                        textAlign: 'right',
                        fontSize: { xs: '0.64rem', sm: '0.7rem' },
                        fontWeight: 700,
                        color: HOME_MUTED_TEXT,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.2,
                    }}
                >
                    {progressCaption}
                </Typography>
            </Stack>

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ mt: 0.4, minWidth: 0 }}
            >
                <Typography
                    noWrap
                    sx={{
                        color: HOME_MUTED_TEXT,
                        fontSize: { xs: '0.64rem', sm: '0.7rem' },
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.35,
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    {variant === 'prize' ? `${t('home.dashboard.entry')}:` : `${t('home.dashboard.prizeEst')}`}
                    {variant === 'prize' ? (
                        <CoinValue value={match.entryFee || 0} size={11} />
                    ) : (
                        <CoinValue value={match.prizeEstimate || 0} size={11} />
                    )}
                </Typography>

                <Typography
                    noWrap
                    sx={{
                        color: HOME_MUTED_TEXT_DIM,
                        fontSize: { xs: '0.64rem', sm: '0.7rem' },
                        fontWeight: 600,
                        textAlign: 'right',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.35,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {variant === 'prize' ? (
                        <>
                            {t('home.dashboard.spots')}: {match.participantsCount}/{match.totalPlayer || '∞'}
                        </>
                    ) : match.entryFee ? (
                        <>
                            {t('home.dashboard.entry')} <CoinValue value={match.entryFee || 0} size={11} />
                        </>
                    ) : (
                        `${t('home.dashboard.entry')} ${t('home.dashboard.free')}`
                    )}
                </Typography>
            </Stack>
        </Box>
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
    const matchPages = chunkItems(matches, TARGET_MATCH_TILES);

    return (
        <HomeBlurPanel sx={homePremiumPanelGlowSx}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.25, flexWrap: 'wrap', gap: 0.75 }}
            >
                <Stack direction="row" alignItems="center" spacing={0.85} sx={{ minWidth: 0 }}>
                    {variant === 'ongoing' ? <LivePulseDot color="green" size={7} /> : null}
                    <Typography
                        variant="h6"
                        sx={{
                            color: glassTokens.titleColor,
                            fontSize: { xs: '0.95rem', sm: '1.15rem' },
                            fontWeight: 800,
                        }}
                    >
                        {title}
                    </Typography>
                </Stack>
                <Typography
                    sx={{
                        flexShrink: 0,
                        fontSize: { xs: '0.62rem', sm: '0.68rem' },
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        color: alpha(HOME_GOLD, 0.88),
                    }}
                >
                    {badgeLabel}
                </Typography>
            </Stack>
            <Box sx={{ borderTop: HOME_ROW_LINE }}>
                {loading ? (
                    <Stack spacing={0}>
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    py: 1.1,
                                    borderBottom: idx < 2 ? HOME_ROW_LINE : 'none',
                                }}
                            >
                                <Skeleton width="78%" height={14} sx={{ mb: 0.75 }} />
                                <Skeleton width="100%" height={4} sx={{ borderRadius: 0.5 }} />
                            </Box>
                        ))}
                    </Stack>
                ) : count ? (
                    <HomeChunkCarousel
                        pages={matchPages.map((pageMatches, pageIndex) => (
                            <Box key={pageIndex}>
                                {pageMatches.map((match, index) => {
                                    const globalIndex = pageIndex * TARGET_MATCH_TILES + index;
                                    return (
                                        <DashboardMatchTile
                                            key={match.id || `${pageIndex}-${index}`}
                                            match={match}
                                            index={globalIndex}
                                            total={count}
                                            variant={variant}
                                            isLast={index === pageMatches.length - 1}
                                            platformTotalWinnings={platformTotalWinnings}
                                        />
                                    );
                                })}
                            </Box>
                        ))}
                    />
                ) : (
                    <Typography variant="body2" sx={{ color: HOME_MUTED_TEXT, py: 2 }}>
                        {emptyLabel}
                    </Typography>
                )}
            </Box>
        </HomeBlurPanel>
    );
}

export function LandingDashboardSection() {
    const { t } = useTranslate();
    const api = useApi();
    const [state, setState] = useState<SectionState>({ loading: true, data: null });
    const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    const applyPayload = useCallback((payload: PublicDashboardStats | undefined) => {
        if (!payload?.platform) return false;
        setState({ loading: false, data: sanitizePublicDashboardData(payload) });
        setLastUpdatedAt(Date.now());
        return true;
    }, []);

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

            if (applyPayload(payload)) {
                return;
            }
            setState({ loading: false, data: null, error: t('home.dashboard.loadFailed') });
        } catch (error) {
            console.error('Failed to load landing stats', error);
            setState((prev) => ({
                ...prev,
                loading: false,
                error: t('home.dashboard.loadFailedRetry'),
            }));
        }
    };

    // Silently refresh data (no loading spinner) for real-time updates
    const refreshStats = async () => {
        try {
            const res = await api.getPublicDashboardStatsApi();
            const payload: PublicDashboardStats | undefined = res?.data?.data || res?.data;
            applyPayload(payload);
        } catch (error) {
            console.error('Failed to refresh landing stats', error);
        }
    };

    useEffect(() => {
        // Scalability: a live socket + polling are only held while the tab is
        // actually visible. Backgrounded / idle tabs (the vast majority at any
        // moment) keep NO socket and do NO polling, so millions of anonymous
        // visitors cost the server almost nothing when they are not looking.
        let pollTimer: ReturnType<typeof setTimeout> | null = null;
        let stopped = false;

        // Fallback poll only — jittered so clients never sync into a thundering herd.
        const POLL_BASE_MS = 90_000;
        const POLL_JITTER_MS = 30_000;

        const stopPolling = () => {
            if (pollTimer) {
                clearTimeout(pollTimer);
                pollTimer = null;
            }
        };

        const scheduleNextPoll = () => {
            if (stopped || document.hidden) return;
            const delay = POLL_BASE_MS + Math.random() * POLL_JITTER_MS;
            pollTimer = setTimeout(async () => {
                await refreshStats();
                scheduleNextPoll();
            }, delay);
        };

        const handleDashboardUpdate = () => {
            refreshStats();
        };

        const startLive = () => {
            // Anonymous socket for global events (no auth token needed).
            socketService.connectPublic(CONFIG.serverUrl);
            socketService.onDashboardStatsUpdated(handleDashboardUpdate);
            stopPolling();
            scheduleNextPoll();
        };

        const stopLive = () => {
            socketService.offDashboardStatsUpdated(handleDashboardUpdate);
            socketService.disconnectPublic();
            stopPolling();
        };

        const handleVisibility = () => {
            if (document.hidden) {
                stopLive();
            } else {
                refreshStats(); // instant catch-up when the user returns
                startLive();
            }
        };

        loadStats();
        if (!document.hidden) {
            startLive();
        }
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            stopped = true;
            document.removeEventListener('visibilitychange', handleVisibility);
            stopLive();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!lastUpdatedAt) return undefined;
        const timer = window.setInterval(() => setRefreshTick((v) => v + 1), 1000);
        return () => window.clearInterval(timer);
    }, [lastUpdatedAt]);

    const { loading, data, error } = state;

    const stats = useMemo(() => {
        if (!data?.platform) {
            return {
                totalWinnings: '—',
                processedMatches: '—',
                ongoingMatches: '—',
                todayJoinedUsers: '—',
            };
        }
        return {
            totalWinnings: <AnimatedCoinValue value={data.platform.totalWinnings || 0} size={15} />,
            processedMatches: <PulseCountUp value={data.platform.processedMatches || 0} />,
            ongoingMatches: <PulseCountUp value={data.platform.ongoingMatches || 0} />,
            todayJoinedUsers: <PulseCountUp value={data.platform.todayJoinedUsers || 0} />,
        };
    }, [data, t]);

    const pulseLabels = useMemo(
        () => ({
            platformTotalWinnings: t('home.dashboard.platformTotalWinnings'),
            processedMatches: t('home.dashboard.processedMatches'),
            ongoingMatches: t('home.dashboard.ongoingMatches'),
            todayJoinedUsers: t('home.dashboard.todayJoinUsers'),
        }),
        [t]
    );

    const lastUpdatedLabel = useMemo(() => {
        if (!lastUpdatedAt) return '';
        const seconds = Math.max(0, Math.floor((Date.now() - lastUpdatedAt) / 1000));
        return t('home.dashboard.lastUpdated', {
            time: formatPulseLastUpdated(seconds),
        });
    }, [lastUpdatedAt, t, refreshTick]);

    const glassTokens = useMemo(() => getDefaultGlassTokens(), []);

    return (
        <Box
            id="public-dashboard"
            sx={{
                position: 'relative',
                overflowX: 'clip',
                overflowY: 'visible',
                bgcolor: '#0a0a0a',
                py: { xs: 3.25, md: 5 },
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
                <Stack spacing={{ xs: 3.25, md: 4 }}>
                    <PulseHeroFlat
                        badgeLabel={t('home.dashboard.liveDashboardChip')}
                        title={t('home.dashboard.battleAsiaPulse')}
                        description={t('home.dashboard.pulseDescription')}
                        liveSuffix={t('home.dashboard.live')}
                        labels={pulseLabels}
                        stats={stats}
                        loading={loading}
                        lastUpdatedLabel={lastUpdatedLabel}
                    />

                    {error && !loading ? (
                        <Alert
                            severity="warning"
                            action={
                                <Button color="inherit" size="small" onClick={loadStats}>
                                    {t('home.dashboard.retry')}
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    ) : null}

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: { md: 'stretch' },
                            gap: { xs: 0, md: 0 },
                            pt: { xs: 0.5, md: 1 },
                            ...homeMobileScrollFlexRowSx,
                            overflowX: { xs: 'auto', md: 'visible' },
                            scrollSnapType: { xs: 'x mandatory', md: 'none' },
                            pb: { xs: 1.5, md: 0 },
                            px: { xs: 0, md: 0 },
                        }}
                    >
                        <Box
                            sx={{
                                ...homeMobileScrollItemSx,
                                flex: { xs: '0 0 100%', md: '1 1 0' },
                                minWidth: { xs: 0, md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
                            }}
                        >
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
                        <DashboardSplitGoldRule orientation="vertical" />
                        <Box
                            sx={{
                                ...homeMobileScrollItemSx,
                                flex: { xs: '0 0 100%', md: '1 1 0' },
                                minWidth: { xs: 0, md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
                            }}
                        >
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
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { md: 'stretch' },
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
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
                        </Box>
                        <DashboardSplitGoldRule orientation="horizontal" />
                        <DashboardSplitGoldRule orientation="vertical" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
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
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

