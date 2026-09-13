import { useMemo, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
    Box,
    Stack,
    Avatar,
    Button,
    Skeleton,
    Container,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { goldAlpha } from 'src/theme/accent-presets';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSelector } from 'src/store';
import { fNumber } from 'src/utils/format-number';
import { getAvatarUrl } from 'src/utils/get-image-url';
import { signInWithReturn } from 'src/utils/auth-return';
import { useTranslate } from 'src/locales/use-locales';
import CoinValue from 'src/components/coin-value';
import { Iconify } from 'src/components/iconify';
import type { PulseCardStats, PulseCardLabels } from 'src/components/battle-glass-card';
import { socketService } from 'src/lib/socket';
import { AnimatedCoinValue } from './animated-coin-value';
import { PulseCountUp } from './pulse-count-up';
import {
    formatPulseLastUpdated,
    sanitizePublicDashboardData,
} from './pulse-dashboard-utils';
import { HOME_TEXT_MUTED } from './home-blur-panel';
import { LivePulseDot } from './live-pulse-dot';
import type {
    DashboardTopPlayer,
    PublicDashboardStats,
    DashboardMatchSummary,
} from 'src/types';

type SectionState = {
    loading: boolean;
    data: PublicDashboardStats | null;
};

// ----------------------------------------------------------------------
// Safe Alpha helper for CSS variables and hex colors
// ----------------------------------------------------------------------

function safeAlpha(color: string, opacity: number): string {
    if (!color) return `rgba(var(--ba-gold-rgb, 245, 197, 24), ${opacity})`;
    if (color.includes('--ba-gold-light')) {
        return `rgba(var(--ba-gold-light-rgb, 251, 191, 36), ${opacity})`;
    }
    if (color.includes('--ba-gold-dark')) {
        return `rgba(var(--ba-gold-dark-rgb, 217, 119, 6), ${opacity})`;
    }
    if (color.startsWith('var(')) {
        return `rgba(var(--ba-gold-rgb, 245, 197, 24), ${opacity})`;
    }
    try {
        return alpha(color, opacity);
    } catch {
        return `rgba(var(--ba-gold-rgb, 245, 197, 24), ${opacity})`;
    }
}

// ----------------------------------------------------------------------
// Pulse-flat card panel — dark surface, thin border, no clip/glow
// ----------------------------------------------------------------------

function CyberCardPanel({
    children,
    glowColor,
    accentBorder = false,
    sx,
}: {
    children: React.ReactNode;
    glowColor?: string;
    accentBorder?: boolean;
    sx?: any;
}) {
    const theme = useTheme();
    const accentColor = glowColor || theme.palette.primary.main || '#cbfb24';

    return (
        <Box
            sx={[
                {
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    bgcolor: '#161618',
                    border: `1px solid ${accentBorder ? safeAlpha(accentColor, 0.35) : alpha('#ffffff', 0.08)}`,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    p: { xs: 1.5, sm: 2.25, md: 2.5 },
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        borderColor: safeAlpha(accentColor, 0.4),
                    },
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: safeAlpha(accentColor, 0.45),
                    zIndex: 2,
                }}
            />

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        </Box>
    );
}

// ----------------------------------------------------------------------
// Reusable Tactical Card Header (Matching Reference Codex Design)
// ----------------------------------------------------------------------

function TacticalCardHeader({
    id,
    badge,
    title,
    hint,
    rightIcon,
    statusBadge,
    accentColor,
    accentContrast,
}: {
    id: string;
    badge: string;
    title: string;
    hint?: string;
    rightIcon?: string;
    statusBadge?: React.ReactNode;
    accentColor: string;
    accentContrast: string;
}) {
    return (
        <Box sx={{ width: 1 }}>
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ width: 1 }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                        sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            borderRadius: '4px',
                            bgcolor: accentColor,
                            color: accentContrast,
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: 'none',
                            flexShrink: 0,
                        }}
                    >
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 900 }}>
                            {id}
                        </Typography>
                    </Box>

                    {/* Question / Title Text & Badge */}
                    <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <Typography
                            noWrap
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: { xs: 8.5, sm: 9.5 },
                                fontWeight: 800,
                                letterSpacing: { xs: 0.6, sm: 1.2 },
                                color: accentColor,
                                textTransform: 'uppercase',
                                lineHeight: 1.2,
                                mb: 0.3,
                                maxWidth: '100%',
                            }}
                        >
                            {badge}
                        </Typography>

                        <Typography
                            className="font-tr"
                            sx={{
                                fontSize: { xs: 13, sm: 14, md: 15 },
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                color: '#ffffff',
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                            }}
                        >
                            {title}
                        </Typography>

                        {hint ? (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: HOME_TEXT_MUTED,
                                    fontSize: { xs: '0.78rem', sm: '0.82rem' },
                                    display: 'block',
                                    mt: 0.2,
                                    lineHeight: 1.35,
                                }}
                            >
                                {hint}
                            </Typography>
                        ) : null}
                    </Box>
                </Stack>

                {/* Right: Status badge & Holographic Circular Icon */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, pt: 0.2 }}>
                    {statusBadge}
                    {rightIcon ? (
                        <Box
                            sx={{
                                display: { xs: 'none', sm: 'grid' },
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                bgcolor: safeAlpha(accentColor, 0.1),
                                border: `1px solid ${safeAlpha(accentColor, 0.45)}`,
                                color: accentColor,
                                placeItems: 'center',
                                flexShrink: 0,
                                boxShadow: 'none',
                            }}
                        >
                            <Iconify icon={rightIcon} width={16} />
                        </Box>
                    ) : null}
                </Stack>
            </Stack>

            {/* Dashed Divider Line */}
            <Box
                sx={{
                    height: '1px',
                    borderTop: `1px dashed ${safeAlpha(accentColor, 0.3)}`,
                    mt: 1.6,
                    mb: 1.6,
                }}
            />
        </Box>
    );
}

/** Flat split rule between leaderboard columns */
function DashboardSplitGoldRule({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
    const isVertical = orientation === 'vertical';
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';

    return (
        <Box
            aria-hidden
            sx={{
                display: isVertical ? { xs: 'none', md: 'flex' } : { xs: 'flex', md: 'none' },
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'stretch',
                flexShrink: 0,
                mx: isVertical ? { md: 2, lg: 2.5 } : 'auto',
                my: isVertical ? 0 : 2,
                width: isVertical ? '2px' : '100%',
                maxWidth: isVertical ? '2px' : 280,
                minHeight: isVertical ? 160 : '2px',
                position: 'relative',
                background: isVertical
                    ? `linear-gradient(180deg, transparent 0%, ${safeAlpha(accentColor, 0.2)} 20%, ${safeAlpha(accentColor, 0.4)} 50%, ${safeAlpha(accentColor, 0.2)} 80%, transparent 100%)`
                    : `linear-gradient(90deg, transparent 0%, ${safeAlpha(accentColor, 0.2)} 20%, ${safeAlpha(accentColor, 0.4)} 50%, ${safeAlpha(accentColor, 0.2)} 80%, transparent 100%)`,
                boxShadow: 'none',
                opacity: 0.7,
            }}
        >
            <Box
                sx={{
                    width: 4,
                    height: 4,
                    bgcolor: safeAlpha(accentColor, 0.55),
                    borderRadius: '50%',
                    boxShadow: 'none',
                }}
            />
        </Box>
    );
}

// ----------------------------------------------------------------------
// Simple title bar — flat Pulse style
// ----------------------------------------------------------------------

function GlassSimpleTitle({
    title,
    liveLabel,
    accentColor,
}: {
    title: string;
    liveLabel: string;
    accentColor: string;
}) {
    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '6px',
                mb: 1.5,
                px: { xs: 1.5, sm: 1.85 },
                py: { xs: 1.2, sm: 1.35 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                bgcolor: '#161618',
                border: `1px solid ${safeAlpha(accentColor, 0.28)}`,
                boxShadow: 'none',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: safeAlpha(accentColor, 0.5),
                },
            }}
        >
            <Typography
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: { xs: 13, sm: 14, md: 15 },
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    lineHeight: 1.2,
                    minWidth: 0,
                }}
            >
                {title}
            </Typography>
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.65}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    flexShrink: 0,
                    px: 0.9,
                    py: 0.4,
                    borderRadius: '4px',
                    bgcolor: alpha('#10b981', 0.12),
                    border: `1px solid ${alpha('#10b981', 0.4)}`,
                    boxShadow: 'none',
                }}
            >
                <LivePulseDot color="green" size={7} />
                <Typography
                    sx={{
                        fontSize: { xs: '0.68rem', sm: '0.72rem' },
                        fontWeight: 800,
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        color: '#34d399',
                        fontFamily: 'monospace',
                    }}
                >
                    {liveLabel}
                </Typography>
            </Stack>
        </Box>
    );
}

// ----------------------------------------------------------------------
// Redesigned Pulse Hero Terminal
// ----------------------------------------------------------------------

function PulseHeroTactical({
    title,
    description,
    liveSuffix,
    labels,
    stats,
    loading,
    lastUpdatedLabel,
}: {
    title: string;
    description: string;
    liveSuffix: string;
    labels: PulseCardLabels;
    stats: PulseCardStats;
    loading?: boolean;
    lastUpdatedLabel?: string;
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#f5c518';

    const statRows = [
        {
            key: 'winnings',
            label: labels.platformTotalWinnings,
            value: stats.totalWinnings,
            suffix: undefined as string | undefined,
            icon: 'solar:wallet-money-bold',
        },
        {
            key: 'matches',
            label: labels.processedMatches,
            value: stats.processedMatches,
            suffix: undefined as string | undefined,
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
            suffix: undefined as string | undefined,
            icon: 'solar:user-plus-rounded-bold',
        },
    ];

    const renderStatRow = (row: (typeof statRows)[number]) => (
        <Stack
            key={row.key}
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.5, sm: 1.75 }}
            sx={{ minWidth: 0 }}
        >
            <Box
                sx={{
                    width: { xs: 44, sm: 48 },
                    height: { xs: 44, sm: 48 },
                    flexShrink: 0,
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: safeAlpha(accentColor, 0.08),
                    border: `1px solid ${safeAlpha(accentColor, 0.28)}`,
                    color: accentColor,
                    boxShadow: 'none',
                }}
            >
                <Iconify icon={row.icon} width={22} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    sx={{
                        color: alpha('#ffffff', 0.5),
                        fontSize: { xs: 11, sm: 12 },
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        mb: 0.4,
                    }}
                >
                    {row.label}
                </Typography>

                {loading ? (
                    <Skeleton width="48%" height={30} sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
                ) : (
                    <Typography
                        sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 0.65,
                            color: '#ffffff',
                            fontSize: { xs: '1.45rem', sm: '1.65rem', md: '1.75rem' },
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                            '& > *': { minWidth: 0 },
                        }}
                    >
                        {row.value}
                        {row.suffix ? (
                            <Typography
                                component="span"
                                sx={{
                                    color: accentColor,
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    fontWeight: 700,
                                    letterSpacing: 0.4,
                                    textTransform: 'lowercase',
                                }}
                            >
                                {row.suffix}
                            </Typography>
                        ) : null}
                    </Typography>
                )}
            </Box>
        </Stack>
    );

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: { xs: '12px', sm: '14px' },
                boxSizing: 'border-box',
                p: { xs: 2.25, sm: 3, md: 3.5 },
                bgcolor: '#161618',
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                boxShadow: 'none',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' },
                    gap: { xs: 0, md: 3.5 },
                    alignItems: 'stretch',
                }}
            >
                {/* Left — copy / identity */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minWidth: 0,
                        pr: { md: 1 },
                        pb: { xs: 2.25, md: 0 },
                        borderBottom: {
                            xs: `1px solid ${safeAlpha(accentColor, 0.18)}`,
                            md: 'none',
                        },
                        borderRight: {
                            xs: 'none',
                            md: `1px solid ${safeAlpha(accentColor, 0.18)}`,
                        },
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={0.85} sx={{ mb: 1.5 }}>
                        <LivePulseDot color="green" size={8} />
                        <Typography
                            sx={{
                                fontSize: { xs: 11, sm: 12 },
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: alpha('#ffffff', 0.55),
                            }}
                        >
                            Live Dashboard
                        </Typography>
                    </Stack>

                    <Typography
                        className="font-tr"
                        sx={{
                            fontSize: { xs: 26, sm: 34, md: 38 },
                            fontWeight: 900,
                            letterSpacing: { xs: '0.02em', sm: '0.04em' },
                            textTransform: 'uppercase',
                            color: '#ffffff',
                            lineHeight: 1.05,
                            mb: 1.25,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            color: alpha('#ffffff', 0.62),
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            lineHeight: 1.55,
                            maxWidth: { xs: '100%', md: 420 },
                            mb: 0.85,
                        }}
                    >
                        {description}
                    </Typography>

                    {lastUpdatedLabel ? (
                        <Typography
                            sx={{
                                color: alpha('#ffffff', 0.38),
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                fontWeight: 500,
                            }}
                        >
                            {lastUpdatedLabel}
                        </Typography>
                    ) : null}
                </Box>

                {/* Right — stats fill the split */}
                <Box
                    sx={{
                        minWidth: 0,
                        pl: { md: 0.5 },
                        pt: { xs: 2.25, md: 0 },
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr' },
                        gap: { xs: 2, sm: 2.25, md: 2.35 },
                        alignContent: 'center',
                    }}
                >
                    {statRows.map(renderStatRow)}
                </Box>
            </Box>
        </Box>
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

// ----------------------------------------------------------------------
// Leaderboard shell — flat Pulse card
// ----------------------------------------------------------------------

function GlassApkCardShell({
    children,
    accentColor,
}: {
    children: React.ReactNode;
    accentColor: string;
}) {
    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '8px',
                boxSizing: 'border-box',
                bgcolor: '#161618',
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                boxShadow: 'none',
                p: { xs: 1.5, sm: 2.25, md: 2.5 },
                transition: 'border-color 0.2s ease',
                '&:hover': {
                    borderColor: safeAlpha(accentColor, 0.35),
                },
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: safeAlpha(accentColor, 0.45),
                    zIndex: 2,
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 2, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        </Box>
    );
}

function PlayerListCardTactical({
    title,
    liveLabel = 'LIVE',
    players,
    loading,
    metricKey,
    translations,
}: {
    title: string;
    liveLabel?: string;
    players: DashboardTopPlayer[];
    loading?: boolean;
    metricKey: 'totalWinnings' | 'winRate' | 'totalKills' | 'averageScore';
    translations: {
        noDataYet: string;
        lastPlayed: string;
        winnings: string;
        kills: string;
        winRate: string;
        avgScore: string;
    };
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#f5c518';
    const accentContrast = theme.palette.primary.contrastText || '#0a0a0a';

    const metricLabel =
        metricKey === 'totalWinnings'
            ? translations.winnings
            : metricKey === 'winRate'
              ? translations.winRate
              : metricKey === 'totalKills'
                ? translations.kills
                : translations.avgScore;

    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: { xs: '12px', sm: '14px' },
                boxSizing: 'border-box',
                p: { xs: 1.5, sm: 2 },
                bgcolor: '#161618',
                border: `1px solid ${alpha('#ffffff', 0.08)}`,
                boxShadow: 'none',
            }}
        >
            {/* Header — title + LIVE pill */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ mb: 1.75 }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: 13, sm: 14 },
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </Typography>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.65}
                    sx={{
                        flexShrink: 0,
                        px: 1,
                        py: 0.45,
                        borderRadius: '999px',
                        bgcolor: alpha('#10b981', 0.12),
                        border: `1px solid ${alpha('#10b981', 0.4)}`,
                    }}
                >
                    <LivePulseDot color="green" size={7} />
                    <Typography
                        sx={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: 1.1,
                            textTransform: 'uppercase',
                            color: '#34d399',
                        }}
                    >
                        {liveLabel}
                    </Typography>
                </Stack>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0 }}>
                {loading ? (
                    <Stack spacing={1}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <Skeleton
                                key={idx}
                                variant="rounded"
                                height={68}
                                sx={{ borderRadius: '12px', bgcolor: alpha('#ffffff', 0.04) }}
                            />
                        ))}
                    </Stack>
                ) : players.length === 0 ? (
                    <Typography variant="body2" sx={{ color: HOME_TEXT_MUTED, py: 3, textAlign: 'center' }}>
                        {translations.noDataYet}
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {players.map((player, idx) => {
                            const rank = idx + 1;
                            const isTop1 = rank === 1;

                            const metricValue = (() => {
                                switch (metricKey) {
                                    case 'totalWinnings':
                                        return (
                                            <CoinValue
                                                value={player.totalWinnings || 0}
                                                size={16}
                                                textSx={{
                                                    fontWeight: 800,
                                                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                    color: isTop1 ? accentColor : '#ffffff',
                                                }}
                                            />
                                        );
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
                                    spacing={1.25}
                                    alignItems="center"
                                    sx={{
                                        px: { xs: 1.15, sm: 1.35 },
                                        py: { xs: 1.1, sm: 1.2 },
                                        borderRadius: '12px',
                                        bgcolor: alpha('#ffffff', isTop1 ? 0.05 : 0.03),
                                        border: `1px solid ${
                                            isTop1
                                                ? safeAlpha(accentColor, 0.4)
                                                : alpha('#ffffff', 0.08)
                                        }`,
                                        boxShadow: 'none',
                                        transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha('#ffffff', 0.06),
                                            borderColor: safeAlpha(accentColor, 0.35),
                                        },
                                    }}
                                >
                                    {/* Rank badge */}
                                    <Box
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            flexShrink: 0,
                                            borderRadius: '8px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: isTop1 ? accentColor : alpha('#ffffff', 0.04),
                                            border: isTop1
                                                ? 'none'
                                                : `1px solid ${alpha('#ffffff', 0.14)}`,
                                            color: isTop1 ? accentContrast : alpha('#ffffff', 0.7),
                                            fontWeight: 900,
                                            fontSize: 12,
                                            letterSpacing: 0.2,
                                            boxShadow: 'none',
                                        }}
                                    >
                                        #{rank}
                                    </Box>

                                    <Avatar
                                        src={getAvatarUrl(player.avatar)}
                                        alt={player.username}
                                        sx={{
                                            width: { xs: 40, sm: 44 },
                                            height: { xs: 40, sm: 44 },
                                            flexShrink: 0,
                                            bgcolor: '#0a0a0a',
                                            color: '#e2e8f0',
                                            fontWeight: 700,
                                            fontSize: 14,
                                            border: `1.5px solid ${
                                                isTop1
                                                    ? safeAlpha(accentColor, 0.55)
                                                    : alpha('#ffffff', 0.12)
                                            }`,
                                        }}
                                    >
                                        {player.username?.[0]?.toUpperCase() || '?'}
                                    </Avatar>

                                    <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
                                        <Typography
                                            noWrap
                                            sx={{
                                                color: '#ffffff',
                                                fontSize: { xs: 13.5, sm: 15 },
                                                fontWeight: 800,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {player.username}
                                        </Typography>
                                        <Typography
                                            noWrap
                                            sx={{
                                                color: alpha('#ffffff', 0.45),
                                                fontSize: { xs: 11, sm: 12 },
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {translations.lastPlayed}: {formatDateTime(player.lastPlayed)}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        alignItems="flex-end"
                                        spacing={0.2}
                                        sx={{ flexShrink: 0, minWidth: 72 }}
                                    >
                                        {typeof metricValue === 'string' || typeof metricValue === 'number' ? (
                                            <Typography
                                                sx={{
                                                    color: isTop1 ? accentColor : '#ffffff',
                                                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                    fontWeight: 800,
                                                    fontVariantNumeric: 'tabular-nums',
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {metricValue}
                                            </Typography>
                                        ) : (
                                            metricValue
                                        )}
                                        <Typography
                                            sx={{
                                                color: alpha('#ffffff', 0.42),
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: 0.6,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {metricLabel}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}

const TARGET_MATCH_TILES = 3;

function isRealMatchId(id: string | undefined) {
    return Boolean(id) && !String(id).startsWith('demo-');
}

function isMatchFull(match: DashboardMatchSummary) {
    const cap = match.totalPlayer || 0;
    return cap > 0 && match.participantsCount >= cap;
}

// ----------------------------------------------------------------------
// Pulse-simple match tile — quiet glass card + brand Play button
// ----------------------------------------------------------------------

function DashboardMatchTileTactical({
    match,
}: {
    match: DashboardMatchSummary;
    index: number;
    variant: 'prize' | 'ongoing';
}) {
    const { t } = useTranslate();
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const full = isMatchFull(match);
    const matchPath = isRealMatchId(match.id) ? paths.user.match(match.id) : '';
    const showJoin = Boolean(matchPath);
    const gameLabel = match.gameName || 'Match';

    const handleJoin = () => {
        if (!matchPath) return;
        if (!isLoggedIn) {
            router.push(signInWithReturn(matchPath));
            return;
        }
        router.push(matchPath);
    };

    const rows: Array<{ label: string; value: ReactNode; accent?: boolean }> = [
        {
            label: t('home.dashboard.spots'),
            value: `${fNumber(match.participantsCount || 0)}${match.totalPlayer ? ` / ${fNumber(match.totalPlayer)}` : ''}`,
        },
        {
            label: t('home.dashboard.entry'),
            value: match.entryFee ? <CoinValue value={match.entryFee} size={12} /> : t('home.dashboard.free'),
        },
        {
            label: t('home.dashboard.prizeEst'),
            value: match.prizeEstimate ? <CoinValue value={match.prizeEstimate} size={12} /> : '—',
            accent: true,
        },
    ];

    return (
        <Box
            sx={{
                minWidth: 0,
                width: 1,
                height: 1,
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.1, sm: 1.4, md: 1.6 },
                borderRadius: '12px',
                bgcolor: alpha('#06090e', 0.82),
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `1px solid ${goldAlpha(0.28)}`,
                boxShadow: 'none',
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={0.75}
                sx={{ mb: 1 }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: 9, sm: 10 },
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: alpha('#ffffff', 0.5),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {gameLabel}
                </Typography>
                <Typography
                    sx={{
                        fontSize: { xs: 9, sm: 10 },
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#22c55e',
                        flexShrink: 0,
                    }}
                >
                    {t('home.dashboard.live').toUpperCase()}
                </Typography>
            </Stack>

            <Typography
                sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.78rem', sm: '0.92rem', md: '1rem' },
                    fontWeight: 800,
                    lineHeight: 1.3,
                    mb: { xs: 1, sm: 1.15 },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {match.matchName}
            </Typography>

            <Stack
                spacing={{ xs: 0.55, sm: 0.7 }}
                sx={{
                    mb: { xs: 1.1, sm: 1.25 },
                    pb: { xs: 1.1, sm: 1.25 },
                    borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
                }}
            >
                {rows.map((row) => (
                    <Stack
                        key={row.label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={0.75}
                        sx={{ minWidth: 0 }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: 9, sm: 11 },
                                color: alpha('#ffffff', 0.55),
                                fontWeight: 600,
                                flexShrink: 0,
                            }}
                        >
                            {row.label}
                        </Typography>
                        <Box
                            sx={{
                                fontSize: { xs: 11, sm: 13, md: 14 },
                                fontWeight: 800,
                                color: row.accent ? 'var(--ba-gold)' : '#ffffff',
                                fontVariantNumeric: 'tabular-nums',
                                textAlign: 'right',
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {row.value}
                        </Box>
                    </Stack>
                ))}
            </Stack>

            {showJoin ? (
                <Button
                    fullWidth
                    variant="outlined"
                    disableElevation
                    disabled={full}
                    onClick={handleJoin}
                    aria-label={
                        full
                            ? t('home.dashboard.matchFull')
                            : isLoggedIn
                              ? t('home.dashboard.joinNow')
                              : t('home.dashboard.signInToJoin')
                    }
                    sx={{
                        mt: 'auto',
                        minHeight: { xs: 28, sm: 34 },
                        py: 0.45,
                        borderRadius: '4px',
                        fontSize: { xs: 9, sm: 10.5 },
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: `${goldAlpha(0.92)} !important`,
                        bgcolor: `${goldAlpha(0.14)} !important`,
                        border: `1px solid ${goldAlpha(0.28)} !important`,
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: `${goldAlpha(0.22)} !important`,
                            borderColor: `${goldAlpha(0.42)} !important`,
                            color: `var(--ba-gold) !important`,
                            boxShadow: 'none',
                        },
                        '&.Mui-disabled': {
                            bgcolor: `${alpha('#ffffff', 0.03)} !important`,
                            color: `${alpha('#ffffff', 0.32)} !important`,
                            borderColor: `${alpha('#ffffff', 0.08)} !important`,
                        },
                    }}
                >
                    {full ? t('home.dashboard.matchFull') : t('home.dashboard.joinNow')}
                </Button>
            ) : (
                <Box sx={{ mt: 'auto', minHeight: { xs: 28, sm: 34 } }} />
            )}
        </Box>
    );
}

// ----------------------------------------------------------------------
// Match panel — Pulse shell + 3 simple cards in one line
// ----------------------------------------------------------------------

function DashboardMatchPanelTactical({
    title,
    liveLabel = 'LIVE',
    matches,
    loading,
    variant,
    emptyLabel,
}: {
    title: string;
    liveLabel?: string;
    matches: DashboardMatchSummary[];
    loading?: boolean;
    variant: 'prize' | 'ongoing';
    emptyLabel: string;
}) {
    const count = matches.length;
    const tilesToRender = matches.slice(0, TARGET_MATCH_TILES);

    return (
        <Box
            sx={{
                position: 'relative',
                p: { xs: 1.15, sm: 1.5, md: 1.85 },
                borderRadius: '12px',
                bgcolor: alpha('#06090e', 0.72),
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${goldAlpha(0.28)}`,
                boxShadow: 'none',
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: { xs: 1.1, sm: 1.35 } }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: 11, sm: 13, md: 14 },
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        lineHeight: 1.2,
                        minWidth: 0,
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    sx={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#22c55e',
                    }}
                >
                    {liveLabel}
                </Typography>
            </Stack>

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        gap: { xs: 1, md: 1.35 },
                        overflowX: { xs: 'auto', md: 'visible' },
                        scrollSnapType: { xs: 'x mandatory', md: 'none' },
                        WebkitOverflowScrolling: 'touch',
                        pb: { xs: 0.5, md: 0 },
                        mx: { xs: -0.25, md: 0 },
                        px: { xs: 0.25, md: 0 },
                        '&::-webkit-scrollbar': { height: 3 },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: goldAlpha(0.35),
                            borderRadius: 0,
                        },
                        // Desktop: 3 equal columns
                        '@media (min-width: 900px)': {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            overflowX: 'visible',
                        },
                    }}
                >
                    {Array.from({ length: TARGET_MATCH_TILES }).map((_, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                flex: { xs: '0 0 calc((100% - 8px) / 2)', md: '1 1 0' },
                                minWidth: { xs: 'calc((100% - 8px) / 2)', md: 0 },
                                scrollSnapAlign: 'start',
                                p: 1.25,
                                borderRadius: '12px',
                                border: `1px solid ${goldAlpha(0.2)}`,
                                bgcolor: alpha('#06090e', 0.5),
                            }}
                        >
                            <Skeleton width="40%" height={12} sx={{ mb: 1 }} />
                            <Skeleton width="88%" height={16} sx={{ mb: 1.25 }} />
                            <Skeleton width="100%" height={10} sx={{ mb: 0.5 }} />
                            <Skeleton width="100%" height={10} sx={{ mb: 1 }} />
                            <Skeleton width="100%" height={32} sx={{ borderRadius: '8px' }} />
                        </Box>
                    ))}
                </Box>
            ) : count ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        gap: { xs: 1, md: 1.35 },
                        overflowX: { xs: 'auto', md: 'visible' },
                        scrollSnapType: { xs: 'x mandatory', md: 'none' },
                        WebkitOverflowScrolling: 'touch',
                        pb: { xs: 0.5, md: 0 },
                        mx: { xs: -0.25, md: 0 },
                        px: { xs: 0.25, md: 0 },
                        '&::-webkit-scrollbar': { height: 3 },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: goldAlpha(0.35),
                            borderRadius: 0,
                        },
                        '@media (min-width: 900px)': {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            overflowX: 'visible',
                        },
                    }}
                >
                    {tilesToRender.map((match, index) => (
                        <Box
                            key={match.id || index}
                            sx={{
                                flex: { xs: '0 0 calc((100% - 8px) / 2)', md: '1 1 0' },
                                minWidth: { xs: 'calc((100% - 8px) / 2)', md: 0 },
                                maxWidth: { md: 'none' },
                                scrollSnapAlign: 'start',
                                height: 1,
                                display: 'flex',
                            }}
                        >
                            <DashboardMatchTileTactical
                                match={match}
                                index={index}
                                variant={variant}
                            />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body2" sx={{ color: HOME_TEXT_MUTED, py: 2.5, textAlign: 'center' }}>
                    {emptyLabel}
                </Typography>
            )}
        </Box>
    );
}

// ----------------------------------------------------------------------
// Main Exported Component: LandingDashboardSection
// ----------------------------------------------------------------------

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
            setState((prev) => ({ ...prev, loading: true }));
            let payload: PublicDashboardStats | undefined;

            try {
                const res = await api.getPublicDashboardStatsApi();
                payload = res?.data?.data || res?.data;
            } catch {
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
            setState({ loading: false, data: null });
        } catch (loadError) {
            console.error('Failed to load landing stats', loadError);
            setState({ loading: false, data: null });
        }
    };

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
        let pollTimer: ReturnType<typeof setTimeout> | null = null;
        let stopped = false;

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
                refreshStats();
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

    const { loading, data } = state;

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
            totalWinnings: <AnimatedCoinValue value={data.platform.totalWinnings || 0} size={16} />,
            processedMatches: <PulseCountUp value={data.platform.processedMatches || 0} />,
            ongoingMatches: <PulseCountUp value={data.platform.ongoingMatches || 0} />,
            todayJoinedUsers: <PulseCountUp value={data.platform.todayJoinedUsers || 0} />,
        };
    }, [data]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastUpdatedAt, t, refreshTick]);

    return (
        <Box
            id="public-dashboard"
            sx={{
                position: 'relative',
                overflowX: 'clip',
                overflowY: 'visible',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                bgcolor: '#07080b',
                pt: { xs: 3.5, md: 5 },
                pb: { xs: 2, md: 2.5 },
                color: '#f5f5f5',
            }}
        >
            <Box
                component="img"
                src="/assets/images/hero/hero-pubg-wide.webp"
                alt=""
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
                sx={{
                    position: 'absolute',
                    inset: 0,
                    width: 1,
                    height: 1,
                    objectFit: 'cover',
                    objectPosition: 'center 22%',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    background: `
                        linear-gradient(180deg, rgba(7, 8, 11, 0.42) 0%, rgba(7, 8, 11, 0.58) 42%, rgba(7, 8, 11, 0.82) 100%),
                        linear-gradient(90deg, rgba(7, 8, 11, 0.55) 0%, transparent 22%, transparent 78%, rgba(7, 8, 11, 0.55) 100%)
                    `,
                }}
            />
            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: '100%',
                    px: { xs: 1.5, sm: 2, md: 3 },
                    boxSizing: 'border-box',
                }}
            >
                <Stack spacing={{ xs: 3.5, sm: 4, md: 4.5 }}>
                    {/* Hero Pulse Command Terminal */}
                    <PulseHeroTactical
                        title={t('home.dashboard.battleAsiaPulse')}
                        description={t('home.dashboard.pulseDescription')}
                        liveSuffix={t('home.dashboard.live')}
                        labels={pulseLabels}
                        stats={stats}
                        loading={loading}
                        lastUpdatedLabel={lastUpdatedLabel}
                    />

                    {/* Leaderboards (Top Profit & Top Players) — mobile side-scroll pair */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            gap: { xs: 1.25, md: 0 },
                            overflowX: { xs: 'auto', md: 'visible' },
                            overflowY: 'hidden',
                            scrollSnapType: { xs: 'x mandatory', md: 'none' },
                            WebkitOverflowScrolling: 'touch',
                            pt: { xs: 0.5, md: 0 },
                            pb: { xs: 1.5, md: 0 },
                            px: { xs: 0.5, md: 0 },
                            '&::-webkit-scrollbar': { height: 4 },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: goldAlpha(0.35),
                                borderRadius: 0,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                flex: { xs: '0 0 100%', md: '1 1 0' },
                                minWidth: { xs: '100%', md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
                                scrollSnapAlign: 'start',
                            }}
                        >
                            <PlayerListCardTactical
                                title={t('home.dashboard.topProfitGenerators')}
                                liveLabel={t('home.dashboard.live')}
                                players={data?.topProfitPlayers || []}
                                loading={loading}
                                metricKey="totalWinnings"
                                translations={{
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
                                flex: { xs: '0 0 100%', md: '1 1 0' },
                                minWidth: { xs: '100%', md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
                                scrollSnapAlign: 'start',
                            }}
                        >
                            <PlayerListCardTactical
                                title={t('home.dashboard.topPlayers')}
                                liveLabel={t('home.dashboard.live')}
                                players={data?.topPlayers || []}
                                loading={loading}
                                metricKey="totalKills"
                                translations={{
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

                    {/* Warzone Match Panels — mobile: side-scroll the 2 sections */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            gap: { xs: 1.25, md: 2.5 },
                            overflowX: { xs: 'auto', md: 'visible' },
                            overflowY: 'hidden',
                            scrollSnapType: { xs: 'x mandatory', md: 'none' },
                            WebkitOverflowScrolling: 'touch',
                            pb: { xs: 1.5, md: 0 },
                            px: { xs: 0.5, md: 0 },
                            '&::-webkit-scrollbar': { height: 4 },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: goldAlpha(0.35),
                                borderRadius: 0,
                            },
                            // Desktop: stack sections vertically
                            '@media (min-width: 900px)': {
                                flexDirection: 'column',
                                overflowX: 'visible',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                flex: { xs: '0 0 100%', md: '1 1 auto' },
                                minWidth: { xs: '100%', md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
                                scrollSnapAlign: 'start',
                            }}
                        >
                            <DashboardMatchPanelTactical
                                title={t('home.dashboard.highPrizeBattles')}
                                liveLabel={t('home.dashboard.live')}
                                matches={data?.highPrizeMatches || []}
                                loading={loading}
                                variant="prize"
                                emptyLabel={t('home.dashboard.noHighPrizeMatches')}
                            />
                        </Box>

                        <Box
                            sx={{
                                flex: { xs: '0 0 100%', md: '1 1 auto' },
                                minWidth: { xs: '100%', md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
                                scrollSnapAlign: 'start',
                            }}
                        >
                            <DashboardMatchPanelTactical
                                title={t('home.dashboard.ongoingMatchesTitle')}
                                liveLabel={t('home.dashboard.live')}
                                matches={data?.ongoingMatches || []}
                                loading={loading}
                                variant="ongoing"
                                emptyLabel={t('home.dashboard.noOngoingMatches')}
                            />
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default LandingDashboardSection;
