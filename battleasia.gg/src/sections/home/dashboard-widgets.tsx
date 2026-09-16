import { useMemo, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
    Box,
    Stack,
    Avatar,
    Button,
    Skeleton,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { goldAlpha } from 'src/theme/accent-presets';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
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
import { LANDING_V2, landingPanelSx } from './landing-v2-theme';
import { LivePulseDot } from './live-pulse-dot';
import type {
    DashboardTopPlayer,
    PublicDashboardStats,
    DashboardMatchSummary,
} from 'src/types';

type PulseGameFilter = 'ALL' | 'PUBG' | 'FREE FIRE' | 'COD' | 'VALORANT' | 'MLBB';

const PULSE_GAME_FILTERS: Exclude<PulseGameFilter, 'ALL'>[] = [
    'PUBG',
    'FREE FIRE',
    'COD',
    'VALORANT',
    'MLBB',
];

function detectPulseGameFilter(gameName: string | undefined): Exclude<PulseGameFilter, 'ALL'> | null {
    const g = (gameName || '').toLowerCase();
    if (!g) return null;
    if (g.includes('pubg')) return 'PUBG';
    if (g.includes('free fire') || g.includes('freefire') || g === 'ff') return 'FREE FIRE';
    if (g.includes('cod') || g.includes('call of duty')) return 'COD';
    if (g.includes('valorant') || /\bval\b/.test(g)) return 'VALORANT';
    if (g.includes('mobile legends') || g.includes('mlbb') || g.includes('legend')) return 'MLBB';
    return null;
}

function matchPassesGameFilter(gameName: string | undefined, filter: PulseGameFilter): boolean {
    if (filter === 'ALL') return true;
    return detectPulseGameFilter(gameName) === filter;
}

/** Only chips for games that appear in live Pulse match rails (+ ALL). */
function presentPulseGameFilters(
    matches: { gameName?: string }[]
): Exclude<PulseGameFilter, 'ALL'>[] {
    const present = new Set<Exclude<PulseGameFilter, 'ALL'>>();
    matches.forEach((m) => {
        const id = detectPulseGameFilter(m.gameName);
        if (id) present.add(id);
    });
    return PULSE_GAME_FILTERS.filter((id) => present.has(id));
}

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
                    bgcolor: alpha('#161618', 0.42),
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${accentBorder ? safeAlpha(accentColor, 0.35) : alpha('#ffffff', 0.12)}`,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    p: { xs: 1.5, sm: 2.25, md: 2.5 },
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        bgcolor: alpha('#161618', 0.52),
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
                bgcolor: alpha('#161618', 0.4),
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
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
    gameFilter,
    onGameFilterChange,
    chipLabels,
    availableGames,
}: {
    title: string;
    description: string;
    liveSuffix: string;
    labels: PulseCardLabels;
    stats: PulseCardStats;
    loading?: boolean;
    lastUpdatedLabel?: string;
    gameFilter: PulseGameFilter;
    onGameFilterChange: (filter: PulseGameFilter) => void;
    chipLabels: { all: string; pubg: string; freeFire: string; cod: string; valorant: string; mlbb: string };
    availableGames: Exclude<PulseGameFilter, 'ALL'>[];
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';
    const accentInk = theme.palette.primary.contrastText || LANDING_V2.goldInk;

    const labelById: Record<Exclude<PulseGameFilter, 'ALL'>, string> = {
        PUBG: chipLabels.pubg,
        'FREE FIRE': chipLabels.freeFire,
        COD: chipLabels.cod,
        VALORANT: chipLabels.valorant,
        MLBB: chipLabels.mlbb,
    };

    const chips: { id: PulseGameFilter; label: string }[] = [
        { id: 'ALL', label: chipLabels.all },
        ...availableGames.map((id) => ({ id, label: labelById[id] })),
    ];

    const metrics = [
        {
            key: 'winnings',
            label: labels.platformTotalWinnings,
            value: stats.totalWinnings,
            gold: true,
            live: false,
        },
        {
            key: 'matches',
            label: labels.processedMatches,
            value: stats.processedMatches,
            gold: false,
            live: false,
        },
        {
            key: 'live',
            label: labels.ongoingMatches,
            value: stats.ongoingMatches,
            gold: false,
            live: true,
        },
        {
            key: 'joined',
            label: labels.todayJoinedUsers,
            value: stats.todayJoinedUsers,
            gold: false,
            live: false,
        },
    ];

    void liveSuffix;

    return (
        <Box
            sx={{
                ...landingPanelSx,
                p: { xs: 2.75, sm: 3.5, md: 'clamp(22px, 3.2vw, 40px)' },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: { xs: 2.5, md: 3.5 },
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                }}
            >
                <Box sx={{ maxWidth: '50ch', minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <LivePulseDot size={8} />
                        <Typography
                            sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: LANDING_V2.faint,
                            }}
                        >
                            {tLiveKicker(title)}
                        </Typography>
                    </Stack>

                    <Typography
                        component="h2"
                        className="landing-display"
                        sx={{
                            fontFamily: LANDING_V2.display,
                            fontWeight: 600,
                            fontSize: { xs: '1.85rem', sm: 'clamp(1.85rem, 4vw, 3.2rem)' },
                            lineHeight: 0.98,
                            letterSpacing: '-0.03em',
                            textTransform: 'uppercase',
                            color: LANDING_V2.text,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1.5,
                            color: LANDING_V2.muted,
                            fontSize: { xs: '0.95rem', md: '1.05rem' },
                            lineHeight: 1.5,
                        }}
                    >
                        {description}
                    </Typography>

                    {lastUpdatedLabel ? (
                        <Typography
                            sx={{
                                mt: 1,
                                color: LANDING_V2.faint,
                                fontSize: '0.78rem',
                                fontWeight: 500,
                            }}
                        >
                            {lastUpdatedLabel}
                        </Typography>
                    ) : null}
                </Box>

                <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={1}
                    role="tablist"
                    aria-label="Filter by game"
                    sx={{ pt: { md: 0.5 } }}
                >
                    {chips.map((chip) => {
                        const active = gameFilter === chip.id;
                        return (
                            <Box
                                key={chip.id}
                                component="button"
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => onGameFilterChange(chip.id)}
                                sx={{
                                    px: 1.75,
                                    py: 1.15,
                                    minHeight: 40,
                                    cursor: 'pointer',
                                    borderRadius: 999,
                                    border: '1px solid',
                                    borderColor: active ? accentColor : LANDING_V2.hair2,
                                    bgcolor: active ? accentColor : 'transparent',
                                    color: active ? accentInk : LANDING_V2.muted,
                                    fontWeight: 700,
                                    fontSize: 12,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    boxShadow: active
                                        ? `0 6px 20px -8px ${alpha(accentColor, 0.4)}`
                                        : 'none',
                                    transition: `background-color 0.25s ${LANDING_V2.ease}, color 0.25s ${LANDING_V2.ease}`,
                                    '&:hover': {
                                        color: active ? accentInk : LANDING_V2.text,
                                        borderColor: active ? accentColor : LANDING_V2.hairStrong,
                                    },
                                }}
                            >
                                {chip.label}
                            </Box>
                        );
                    })}
                </Stack>
            </Box>

            <Box
                sx={{
                    mt: { xs: 3, md: 3.5 },
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 1,
                    borderRadius: LANDING_V2.radiusSm,
                    overflow: 'hidden',
                    border: `1px solid ${LANDING_V2.hair}`,
                }}
            >
                {metrics.map((row) => (
                    <Box
                        key={row.key}
                        sx={{
                            bgcolor: 'rgba(10,10,12,0.62)',
                            p: { xs: 2.25, md: '22px 20px' },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.25,
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '0.64rem',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: LANDING_V2.faint,
                                fontWeight: 700,
                            }}
                        >
                            {row.label}
                        </Typography>
                        {loading ? (
                            <Skeleton width="55%" height={36} sx={{ bgcolor: alpha('#fff', 0.06) }} />
                        ) : (
                            <Typography
                                className="landing-display"
                                sx={{
                                    fontFamily: LANDING_V2.display,
                                    fontWeight: 600,
                                    fontSize: { xs: '1.5rem', md: 'clamp(1.5rem, 2.6vw, 2.25rem)' },
                                    lineHeight: 1,
                                    color: LANDING_V2.text,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    minWidth: 0,
                                    '& > *': { minWidth: 0 },
                                }}
                            >
                                {row.live ? <LivePulseDot size={8} /> : null}
                                {row.value}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

/** Zip kicker: LIVE — {title} */
function tLiveKicker(title: string) {
    return `LIVE — ${title}`.toUpperCase();
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
                bgcolor: alpha('#161618', 0.42),
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                boxShadow: 'none',
                p: { xs: 1.5, sm: 2.25, md: 2.5 },
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                    bgcolor: alpha('#161618', 0.52),
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

function HallRankMark({ rank, accentColor }: { rank: number; accentColor: string }) {
    if (rank === 1) {
        return <Iconify icon="solar:crown-bold" width={20} sx={{ color: accentColor }} />;
    }
    if (rank === 2) {
        return <Iconify icon="solar:medal-ribbons-star-bold" width={20} sx={{ color: '#c0c0c0' }} />;
    }
    if (rank === 3) {
        return <Iconify icon="solar:medal-star-bold" width={20} sx={{ color: '#cd7f32' }} />;
    }
    return (
        <Typography
            sx={{
                fontFamily: LANDING_V2.display,
                fontWeight: 700,
                fontSize: '0.9rem',
                color: LANDING_V2.faint,
                fontVariantNumeric: 'tabular-nums',
            }}
        >
            {String(rank).padStart(2, '0')}
        </Typography>
    );
}

function ViewExplorerLink({ href, label }: { href: string; label: string }) {
    return (
        <Typography
            component={RouterLink}
            href={href}
            sx={{
                mt: 1.75,
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontSize: '0.88rem',
                fontWeight: 500,
                color: 'rgba(212, 168, 120, 0.88)',
                textDecoration: 'none',
                transition: `color 0.25s ${LANDING_V2.ease}`,
                '&:hover': {
                    color: LANDING_V2.gold,
                    textDecoration: 'underline',
                },
            }}
        >
            {label}
            <Iconify icon="solar:arrow-right-linear" width={16} />
        </Typography>
    );
}

function PlayerListCardTactical({
    title,
    liveLabel = 'LIVE',
    players,
    loading,
    metricKey,
    translations,
    viewFullLabel,
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
        rank: string;
        player: string;
    };
    viewFullLabel: string;
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';

    const metricMeta =
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
                ...landingPanelSx,
                p: { xs: 2.5, sm: '22px 24px' },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ mb: 1.25 }}
            >
                <Typography
                    component="h3"
                    className="landing-display"
                    sx={{
                        fontFamily: LANDING_V2.display,
                        fontSize: '1.12rem',
                        fontWeight: 600,
                        color: LANDING_V2.text,
                        textTransform: 'uppercase',
                    }}
                >
                    {title}
                </Typography>
                <Box
                    sx={{
                        flexShrink: 0,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 999,
                        border: `1px solid ${LANDING_V2.hair}`,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: LANDING_V2.faint,
                    }}
                >
                    {liveLabel}
                </Box>
            </Stack>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '40px minmax(0, 1fr) auto',
                    gap: 1.25,
                    px: 0.5,
                    mb: 1,
                }}
            >
                {[translations.rank, translations.player, metricMeta].map((label) => (
                    <Typography
                        key={label}
                        sx={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: LANDING_V2.faint,
                            textAlign: label === metricMeta ? 'right' : 'left',
                        }}
                    >
                        {label}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
                {loading ? (
                    <Stack spacing={0} sx={{ pt: 0.5 }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <Skeleton
                                key={idx}
                                height={52}
                                sx={{
                                    bgcolor: alpha('#fff', 0.04),
                                    borderRadius: 0,
                                    borderBottom: `1px solid ${LANDING_V2.hair}`,
                                }}
                            />
                        ))}
                    </Stack>
                ) : players.length === 0 ? (
                    <Typography variant="body2" sx={{ color: HOME_TEXT_MUTED, py: 3, textAlign: 'center' }}>
                        {translations.noDataYet}
                    </Typography>
                ) : (
                    <Box
                        component="ol"
                        sx={{
                            listStyle: 'none',
                            m: 0,
                            p: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            borderTop: `1px solid ${LANDING_V2.hair}`,
                        }}
                    >
                        {players.slice(0, 5).map((player, idx) => {
                            const rank = idx + 1;
                            const avatarSrc = getAvatarUrl(player.avatar);
                            const metaBits = [
                                player.gamesPlayed != null ? `${fNumber(player.gamesPlayed)} matches` : null,
                                player.winRate != null ? `${fNumber(player.winRate)}% WR` : null,
                            ].filter(Boolean);
                            const metricValue = (() => {
                                switch (metricKey) {
                                    case 'totalWinnings':
                                        return (
                                            <CoinValue
                                                value={player.totalWinnings || 0}
                                                size={14}
                                                textSx={{
                                                    fontFamily: LANDING_V2.display,
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: '#ffffff',
                                                }}
                                            />
                                        );
                                    case 'winRate':
                                        return `${fNumber(player.winRate || 0)}%`;
                                    case 'totalKills':
                                        return fNumber(player.totalKills || 0);
                                    default:
                                        return fNumber(player.averageScore || 0);
                                }
                            })();

                            return (
                                <Box
                                    component="li"
                                    key={`${player.userId}-${idx}`}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '40px minmax(0, 1fr) auto',
                                        gap: 1.25,
                                        alignItems: 'center',
                                        px: 0.5,
                                        py: 1.2,
                                        borderBottom: `1px solid ${LANDING_V2.hair}`,
                                        bgcolor: 'transparent',
                                        transition: `background-color 0.2s ${LANDING_V2.ease}`,
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'grid', placeItems: 'center' }}>
                                        <HallRankMark rank={rank} accentColor={accentColor} />
                                    </Box>

                                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                                        <Avatar
                                            src={avatarSrc || undefined}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                flexShrink: 0,
                                                bgcolor: '#0a0a0a',
                                                border: `1px solid ${LANDING_V2.hair2}`,
                                                fontSize: 13,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {(player.username || '?').charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                noWrap
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.92rem',
                                                    color: LANDING_V2.text,
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {player.username || '—'}
                                            </Typography>
                                            {metaBits.length > 0 ? (
                                                <Typography
                                                    noWrap
                                                    sx={{
                                                        mt: 0.25,
                                                        fontSize: '0.72rem',
                                                        color: LANDING_V2.faint,
                                                    }}
                                                >
                                                    {metaBits.join(' · ')}
                                                </Typography>
                                            ) : null}
                                        </Box>
                                    </Stack>

                                    <Box
                                        sx={{
                                            fontFamily: LANDING_V2.display,
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            color: LANDING_V2.text,
                                            textAlign: 'right',
                                            justifySelf: 'end',
                                        }}
                                    >
                                        {metricValue}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            <ViewExplorerLink href={paths.user.account.leaderBoard} label={viewFullLabel} />
        </Box>
    );
}

const TARGET_MATCH_TILES = 12;

function isRealMatchId(id: string | undefined) {
    return Boolean(id) && !String(id).startsWith('demo-');
}

function isMatchFull(match: DashboardMatchSummary) {
    const cap = match.totalPlayer || 0;
    return cap > 0 && match.participantsCount >= cap;
}

// ----------------------------------------------------------------------
// Zip match tile
// ----------------------------------------------------------------------

function DashboardMatchTileTactical({
    match,
    variant,
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
    const isLive = variant === 'ongoing';
    const spotsFilled = match.participantsCount || 0;
    const spotsCap = match.totalPlayer || 0;
    const spotsPct =
        spotsCap > 0 ? Math.min(100, Math.round((spotsFilled / spotsCap) * 100)) : 0;

    const statusLabel = full
        ? t('home.dashboard.matchFull')
        : isLive
          ? t('home.dashboard.live').toUpperCase()
          : t('home.dashboard.matchStatusOpen').toUpperCase();

    const handleJoin = () => {
        if (!matchPath) return;
        if (!isLoggedIn) {
            router.push(signInWithReturn(matchPath));
            return;
        }
        router.push(matchPath);
    };

    return (
        <Box
            sx={{
                minWidth: 0,
                width: 1,
                height: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
                p: 2.5,
                borderRadius: '16px',
                bgcolor: LANDING_V2.panel,
                backdropFilter: `blur(${LANDING_V2.blur})`,
                WebkitBackdropFilter: `blur(${LANDING_V2.blur})`,
                border: `1px solid ${LANDING_V2.hair}`,
                // Same chrome for High Prize + Ongoing (zip `is-live` rail)
                boxShadow: 'inset 2px 0 0 var(--ba-gold), 0 30px 80px -44px #000',
                position: 'relative',
                overflow: 'hidden',
                transition: `transform 0.35s ${LANDING_V2.ease}, border-color 0.35s ease, box-shadow 0.35s ease`,
                '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: LANDING_V2.hair2,
                    boxShadow: 'inset 2px 0 0 var(--ba-gold), 0 28px 60px -28px #000',
                },
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography
                    sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: LANDING_V2.muted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                    }}
                >
                    {gameLabel}
                </Typography>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{
                        flexShrink: 0,
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ba-gold)',
                    }}
                >
                    <LivePulseDot size={7} />
                    {statusLabel}
                </Stack>
            </Stack>

            <Typography
                className="landing-display"
                sx={{
                    fontFamily: LANDING_V2.display,
                    fontWeight: 600,
                    fontSize: { xs: '1.05rem', sm: '1.18rem', md: '1.26rem' },
                    lineHeight: 1.05,
                    letterSpacing: '-0.01em',
                    color: LANDING_V2.text,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {match.matchName}
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px 16px',
                    py: 1.75,
                    borderTop: `1px solid ${LANDING_V2.hair}`,
                    borderBottom: `1px solid ${LANDING_V2.hair}`,
                }}
            >
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                        sx={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: LANDING_V2.faint,
                            fontWeight: 700,
                        }}
                    >
                        {t('home.dashboard.spots')} · {fNumber(spotsFilled)}
                        {spotsCap ? `/${fNumber(spotsCap)}` : ''}
                    </Typography>
                    <Box
                        sx={{
                            height: 3,
                            borderRadius: '4px',
                            bgcolor: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                width: `${spotsPct}%`,
                                height: 1,
                                bgcolor: 'var(--ba-gold)',
                                borderRadius: '4px',
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: LANDING_V2.faint,
                            fontWeight: 700,
                        }}
                    >
                        {t('home.dashboard.entry')}
                    </Typography>
                    <Box
                        sx={{
                            fontFamily: LANDING_V2.display,
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            color: LANDING_V2.text,
                            lineHeight: 1.1,
                        }}
                    >
                        {match.entryFee ? <CoinValue value={match.entryFee} size={14} /> : t('home.dashboard.free')}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: LANDING_V2.faint,
                            fontWeight: 700,
                        }}
                    >
                        {t('home.dashboard.prizeEst')}
                    </Typography>
                    <Box
                        sx={{
                            fontFamily: LANDING_V2.display,
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            color: LANDING_V2.text,
                            lineHeight: 1.1,
                        }}
                    >
                        {match.prizeEstimate ? <CoinValue value={match.prizeEstimate} size={14} /> : '—'}
                    </Box>
                </Box>
            </Box>

            {showJoin ? (
                <Button
                    fullWidth
                    variant="outlined"
                    disableElevation
                    disabled={full}
                    onClick={handleJoin}
                    endIcon={!full ? <Iconify icon="solar:arrow-right-bold" width={15} /> : undefined}
                    aria-label={
                        full
                            ? t('home.dashboard.matchFull')
                            : isLoggedIn
                              ? t('home.dashboard.joinNow')
                              : t('home.dashboard.signInToJoin')
                    }
                    sx={{
                        mt: 'auto',
                        minHeight: 44,
                        py: 1.5,
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--ba-gold) !important',
                        bgcolor: `${goldAlpha(0.14)} !important`,
                        border: `1px solid ${goldAlpha(0.24)} !important`,
                        boxShadow: 'none',
                        gap: 1,
                        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                        '&:hover': {
                            bgcolor: 'var(--ba-gold) !important',
                            color: 'var(--ba-gold-ink, #081401) !important',
                            borderColor: 'var(--ba-gold) !important',
                            boxShadow: 'none',
                        },
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(255,255,255,0.03) !important',
                            color: 'rgba(244,244,241,0.32) !important',
                            borderColor: 'rgba(255,255,255,0.08) !important',
                        },
                    }}
                >
                    {full ? t('home.dashboard.matchFull') : t('home.dashboard.joinNow')}
                </Button>
            ) : (
                <Box sx={{ mt: 'auto', minHeight: 44 }} />
            )}
        </Box>
    );
}

// ----------------------------------------------------------------------
// Zip horizontal rail + arrows
// ----------------------------------------------------------------------

function DashboardMatchPanelTactical({
    title,
    matches,
    loading,
    variant,
    emptyLabel,
    viewAllLabel,
}: {
    title: string;
    liveLabel?: string;
    matches: DashboardMatchSummary[];
    loading?: boolean;
    variant: 'prize' | 'ongoing';
    emptyLabel: string;
    viewAllLabel: string;
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';
    const railRef = useRef<HTMLDivElement | null>(null);
    const count = matches.length;
    const tilesToRender = matches.slice(0, TARGET_MATCH_TILES);

    const scrollRail = (dir: -1 | 1) => {
        const rail = railRef.current;
        if (!rail) return;
        const card = rail.querySelector('[data-match-card]') as HTMLElement | null;
        const step = card ? card.getBoundingClientRect().width + 18 : 320;
        rail.scrollBy({ left: step * dir, behavior: 'smooth' });
    };

    return (
        <Box sx={{ position: 'relative', width: 1, minWidth: 0, mt: { xs: 4, md: 5.5 } }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 2 }}
            >
                <Typography
                    component="h3"
                    className="landing-display"
                    sx={{
                        fontFamily: LANDING_V2.display,
                        fontWeight: 600,
                        fontSize: { xs: '1.3rem', sm: 'clamp(1.3rem, 2.4vw, 1.85rem)' },
                        color: LANDING_V2.text,
                        textTransform: 'uppercase',
                        lineHeight: 1.15,
                        minWidth: 0,
                    }}
                >
                    {title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Box
                        component="button"
                        type="button"
                        aria-label="Previous"
                        onClick={() => scrollRail(-1)}
                        sx={{
                            width: 40,
                            height: 40,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '10px',
                            border: `1px solid ${LANDING_V2.hair2}`,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            color: LANDING_V2.text,
                            cursor: 'pointer',
                            fontSize: 22,
                            lineHeight: 1,
                            '&:hover': { borderColor: accentColor, color: accentColor },
                        }}
                    >
                        ‹
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        aria-label="Next"
                        onClick={() => scrollRail(1)}
                        sx={{
                            width: 40,
                            height: 40,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '10px',
                            border: `1px solid ${LANDING_V2.hair2}`,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            color: LANDING_V2.text,
                            cursor: 'pointer',
                            fontSize: 22,
                            lineHeight: 1,
                            '&:hover': { borderColor: accentColor, color: accentColor },
                        }}
                    >
                        ›
                    </Box>
                </Stack>
            </Stack>

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        gap: '18px',
                        overflow: 'hidden',
                    }}
                >
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                flex: '0 0 calc((100% - 36px) / 3)',
                                minWidth: { xs: 'calc((100% - 14px) / 2.18)', md: 'calc((100% - 36px) / 3)' },
                                p: 2.5,
                                borderRadius: '16px',
                                bgcolor: alpha('#ffffff', 0.06),
                                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                            }}
                        >
                            <Skeleton width="40%" height={12} sx={{ mb: 1 }} />
                            <Skeleton width="88%" height={16} sx={{ mb: 1.25 }} />
                            <Skeleton width="100%" height={10} sx={{ mb: 0.5 }} />
                            <Skeleton width="100%" height={32} sx={{ borderRadius: '8px' }} />
                        </Box>
                    ))}
                </Box>
            ) : count ? (
                <Box
                    ref={railRef}
                    sx={{
                        display: 'flex',
                        gap: '18px',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        pb: 1,
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {tilesToRender.map((match, index) => (
                        <Box
                            key={match.id || index}
                            data-match-card
                            sx={{
                                flex: {
                                    xs: '0 0 calc((100% - 14px) / 2.18)',
                                    md: '0 0 calc((100% - 36px) / 3)',
                                },
                                minWidth: {
                                    xs: 'calc((100% - 14px) / 2.18)',
                                    md: 'calc((100% - 36px) / 3)',
                                },
                                scrollSnapAlign: 'start',
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

            <ViewExplorerLink href={paths.user.play} label={viewAllLabel} />
        </Box>
    );
}

// ----------------------------------------------------------------------

export function LandingDashboardSection() {
    const { t } = useTranslate();
    const api = useApi();
    const [state, setState] = useState<SectionState>({ loading: true, data: null });
    const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);
    const [gameFilter, setGameFilter] = useState<PulseGameFilter>('ALL');

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

    const filteredHighPrize = useMemo(
        () => (data?.highPrizeMatches || []).filter((m) => matchPassesGameFilter(m.gameName, gameFilter)),
        [data?.highPrizeMatches, gameFilter]
    );

    const filteredOngoing = useMemo(
        () => (data?.ongoingMatches || []).filter((m) => matchPassesGameFilter(m.gameName, gameFilter)),
        [data?.ongoingMatches, gameFilter]
    );

    const availableGames = useMemo(
        () =>
            presentPulseGameFilters([
                ...(data?.highPrizeMatches || []),
                ...(data?.ongoingMatches || []),
            ]),
        [data?.highPrizeMatches, data?.ongoingMatches]
    );

    useEffect(() => {
        if (gameFilter === 'ALL') return;
        if (!availableGames.includes(gameFilter)) {
            setGameFilter('ALL');
        }
    }, [availableGames, gameFilter]);

    const chipLabels = useMemo(
        () => ({
            all: 'ALL',
            pubg: t('home.dashboard.gamesCoveredShort.pubg'),
            freeFire: t('home.dashboard.gamesCoveredShort.freeFire'),
            cod: t('home.dashboard.gamesCoveredShort.cod'),
            valorant: t('home.dashboard.gamesCoveredShort.valorant'),
            mlbb: t('home.dashboard.gamesCoveredShort.mlbb'),
        }),
        [t]
    );

    const boardTranslations = useMemo(
        () => ({
            noDataYet: t('home.dashboard.noDataYet'),
            lastPlayed: t('home.dashboard.lastPlayed'),
            winnings: t('home.dashboard.winnings'),
            kills: t('home.dashboard.kills'),
            winRate: t('home.dashboard.winRate'),
            avgScore: t('home.dashboard.avgScore'),
            rank: t('leaderboard.rank'),
            player: t('leaderboard.player'),
        }),
        [t]
    );

    return (
        <Box
            id="public-dashboard"
            component="section"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                isolation: 'isolate',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                bgcolor: 'transparent',
                color: LANDING_V2.text,
                py: { xs: 9, sm: 11, md: 'clamp(72px, 10vw, 148px)' },
            }}
        >
            <Box
                component="img"
                src={LANDING_V2.assets.pulseBg}
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
                    objectPosition: 'center 30%',
                    opacity: 0.72,
                    filter: 'saturate(1.05)',
                    pointerEvents: 'none',
                    zIndex: -2,
                }}
            />
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                    background: `
                        radial-gradient(70% 55% at 50% 20%, transparent 0%, rgba(6,6,7,0.55) 82%),
                        linear-gradient(180deg, rgba(6,6,7,0.22) 0%, rgba(6,6,7,0.55) 100%)
                    `,
                }}
            />
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: LANDING_V2.wrap,
                    mx: 'auto',
                    px: { xs: 2.5, sm: 4, md: 5 },
                    boxSizing: 'border-box',
                }}
            >
                <PulseHeroTactical
                    title={t('home.dashboard.battleAsiaPulse')}
                    description={t('home.dashboard.pulseDescription')}
                    liveSuffix={t('home.dashboard.live')}
                    labels={pulseLabels}
                    stats={stats}
                    loading={loading}
                    lastUpdatedLabel={lastUpdatedLabel}
                    gameFilter={gameFilter}
                    onGameFilterChange={setGameFilter}
                    chipLabels={chipLabels}
                    availableGames={availableGames}
                />

                <Box
                    sx={{
                        mt: 2.25,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 2.25,
                        alignItems: 'stretch',
                    }}
                >
                    <PlayerListCardTactical
                        title={t('home.dashboard.topProfitGenerators')}
                        liveLabel={t('home.dashboard.live')}
                        players={data?.topProfitPlayers || []}
                        loading={loading}
                        metricKey="totalWinnings"
                        translations={boardTranslations}
                        viewFullLabel={t('leaderboard.viewFull')}
                    />
                    <PlayerListCardTactical
                        title={t('home.dashboard.topPlayers')}
                        liveLabel={t('home.dashboard.live')}
                        players={data?.topPlayers || []}
                        loading={loading}
                        metricKey="totalKills"
                        translations={boardTranslations}
                        viewFullLabel={t('leaderboard.viewFull')}
                    />
                </Box>

                <DashboardMatchPanelTactical
                    title={t('home.dashboard.highPrizeBattles')}
                    matches={filteredHighPrize}
                    loading={loading}
                    variant="prize"
                    emptyLabel={t('home.dashboard.noHighPrizeMatches')}
                    viewAllLabel={t('home.dashboard.viewAllMatches')}
                />

                <DashboardMatchPanelTactical
                    title={t('home.dashboard.ongoingMatchesTitle')}
                    matches={filteredOngoing}
                    loading={loading}
                    variant="ongoing"
                    emptyLabel={t('home.dashboard.noOngoingMatches')}
                    viewAllLabel={t('home.dashboard.viewAllMatches')}
                />
            </Box>
        </Box>
    );
}

export default LandingDashboardSection;
