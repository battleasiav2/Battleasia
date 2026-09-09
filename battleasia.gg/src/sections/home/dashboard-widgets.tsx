import { useMemo, useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Stack,
    Avatar,
    Button,
    Skeleton,
    Container,
    Typography,
} from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';
import { goldAlpha } from 'src/theme/accent-presets';

import { CONFIG } from 'src/global-config';
import useApi from 'src/hooks/use-api';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSelector } from 'src/store';
import { fNumber, fShortenNumber } from 'src/utils/format-number';
import { getAvatarUrl } from 'src/utils/get-image-url';
import { signInWithReturn } from 'src/utils/auth-return';
import { useTranslate } from 'src/locales/use-locales';
import CoinValue from 'src/components/coin-value';
import { Iconify } from 'src/components/iconify';
import type { PulseCardStats, PulseCardLabels } from 'src/components/battle-glass-card';
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
import { HOME_ROW_LINE, HOME_TEXT_MUTED, HOME_TEXT_SECONDARY } from './home-blur-panel';
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
// Animations
// ----------------------------------------------------------------------

const radarSweep = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const laserSweepX = keyframes`
  0% { left: -100%; opacity: 0; }
  50% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
`;

const coreGlowPulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const rankShine = keyframes`
  0%, 100% { filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4)); }
  50% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.85)); }
`;

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
// ----------------------------------------------------------------------
// Cyber Panel Shell with Chamfered Corners and HUD Reticles
// Matching Reference Tactical Cyber Card Design
// ----------------------------------------------------------------------

function CyberCardPanel({
    children,
    glowColor,
    accentBorder = false,
    statusText,
    refId,
    sx,
}: {
    children: React.ReactNode;
    glowColor?: string;
    accentBorder?: boolean;
    statusText?: string;
    refId?: string;
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
                    clipPath: {
                        xs: 'none',
                        sm: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                    },
                    bgcolor: alpha('#090c12', 0.88),
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${accentBorder ? safeAlpha(accentColor, 0.4) : alpha('#ffffff', 0.1)}`,
                    boxShadow: `0 12px 32px rgba(0, 0, 0, 0.7), 0 0 20px ${safeAlpha(accentColor, 0.12)}`,
                    p: { xs: 1.5, sm: 2.25, md: 2.5 },
                    overflow: 'hidden',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        borderColor: safeAlpha(accentColor, 0.5),
                        boxShadow: `0 14px 38px rgba(0, 0, 0, 0.75), 0 0 24px ${safeAlpha(accentColor, 0.22)}`,
                    },
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {/* Left Neon Laser Rail */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3.5px',
                    bgcolor: accentColor,
                    boxShadow: `0 0 14px ${accentColor}`,
                    transition: 'all 0.25s ease',
                    zIndex: 2,
                }}
            />

            {/* Corner Reticle Marks */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    fontFamily: 'monospace',
                    fontSize: 9,
                    color: safeAlpha(accentColor, 0.65),
                    userSelect: 'none',
                    zIndex: 2,
                    letterSpacing: 1.5,
                }}
            >
                ⌜ ⌝
            </Box>

            {/* Main Card Content */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>

            {/* Bottom Protocol Enforcement Status Footer */}
            {statusText ? (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        mt: 2,
                        pt: 1.2,
                        borderTop: `1px solid ${alpha('#ffffff', 0.07)}`,
                        flexShrink: 0,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Box
                            sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                bgcolor: '#22c55e',
                                boxShadow: '0 0 8px #22c55e',
                                flexShrink: 0,
                            }}
                        />
                        <Typography
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: { xs: 9, sm: 9.5 },
                                color: '#22c55e',
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                            }}
                        >
                            {statusText}
                        </Typography>
                    </Stack>

                    {refId ? (
                        <Typography
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: { xs: 9, sm: 9.5 },
                                color: alpha('#ffffff', 0.35),
                                letterSpacing: 0.5,
                            }}
                        >
                            REF_ID: #{refId}
                        </Typography>
                    ) : null}
                </Stack>
            ) : null}
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
                {/* Left: Chamfered Index Badge + Title info */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                    {/* Chamfered Index Badge */}
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                            bgcolor: accentColor,
                            color: accentContrast,
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: `0 0 14px ${safeAlpha(accentColor, 0.45)}`,
                            flexShrink: 0,
                            transition: 'all 0.25s ease',
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
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                bgcolor: safeAlpha(accentColor, 0.15),
                                border: `1.5px solid ${accentColor}`,
                                color: accentColor,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                boxShadow: `0 0 12px ${safeAlpha(accentColor, 0.4)}`,
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

/** Animated cyber split rule with glowing center laser bead */
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
                width: isVertical ? 2 : 1,
                maxWidth: isVertical ? 2 : 280,
                minHeight: isVertical ? 160 : 2,
                position: 'relative',
                background: isVertical
                    ? `linear-gradient(180deg, transparent 0%, ${safeAlpha(accentColor, 0.25)} 20%, ${accentColor} 50%, ${safeAlpha(accentColor, 0.25)} 80%, transparent 100%)`
                    : `linear-gradient(90deg, transparent 0%, ${safeAlpha(accentColor, 0.25)} 20%, ${accentColor} 50%, ${safeAlpha(accentColor, 0.25)} 80%, transparent 100%)`,
                boxShadow: `0 0 12px ${safeAlpha(accentColor, 0.35)}`,
            }}
        >
            <Box
                sx={{
                    width: 6,
                    height: 6,
                    bgcolor: accentColor,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${accentColor}`,
                    animation: `${coreGlowPulse} 2.5s ease-in-out infinite`,
                }}
            />
        </Box>
    );
}

// ----------------------------------------------------------------------
// 3D Holographic Stat Pod (Mini Tactical Cyber Codex Card)
// ----------------------------------------------------------------------

function HolographicStatPod({
    index,
    label,
    value,
    suffix,
    icon,
    loading,
    color,
    sparkle = false,
}: {
    index?: string;
    label: string;
    value: React.ReactNode;
    suffix?: string;
    icon: string;
    loading?: boolean;
    color?: string;
    sparkle?: boolean;
}) {
    const theme = useTheme();
    const accentColor = color || theme.palette.primary.main || '#cbfb24';
    const accentContrast = theme.palette.primary.contrastText || '#081401';

    return (
        <Box
            sx={{
                position: 'relative',
                p: { xs: 1.1, sm: 1.7 },
                minHeight: { xs: 88, sm: 108 },
                height: '100%',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                bgcolor: alpha('#090d15', 0.85),
                borderRadius: '4px',
                border: `1px solid ${safeAlpha(accentColor, 0.25)}`,
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                boxShadow: `inset 0 0 18px ${safeAlpha(accentColor, 0.05)}, 0 4px 16px rgba(0, 0, 0, 0.4)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: safeAlpha(accentColor, 0.55),
                    bgcolor: alpha('#0f1522', 0.94),
                    boxShadow: `0 8px 24px ${safeAlpha(accentColor, 0.2)}, inset 0 0 16px ${safeAlpha(accentColor, 0.08)}`,
                },
            }}
        >
            {/* Left Micro Laser Rail */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    bgcolor: accentColor,
                    boxShadow: `0 0 10px ${accentColor}`,
                }}
            />

            {/* Corner Reticle Marks */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 4,
                    right: 6,
                    fontFamily: 'monospace',
                    fontSize: 8,
                    color: safeAlpha(accentColor, 0.5),
                    userSelect: 'none',
                    letterSpacing: 1,
                }}
            >
                ⌜ ⌝
            </Box>

            {loading ? (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pl: 0.5 }}>
                    <Skeleton variant="circular" width={36} height={36} />
                    <Stack spacing={0.75} sx={{ flex: 1 }}>
                        <Skeleton width="55%" />
                        <Skeleton width="40%" />
                    </Stack>
                </Stack>
            ) : (
                <Stack spacing={1} sx={{ pl: 0.5 }}>
                    {/* Header: Index Badge + Label + Right Icon Halo */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minWidth: 0, flex: 1 }}>
                            {index ? (
                                <Box
                                    sx={{
                                        px: 0.6,
                                        py: 0.15,
                                        clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                                        bgcolor: accentColor,
                                        color: accentContrast,
                                        fontFamily: 'monospace',
                                        fontSize: 9.5,
                                        fontWeight: 900,
                                        flexShrink: 0,
                                        boxShadow: `0 0 8px ${safeAlpha(accentColor, 0.35)}`,
                                    }}
                                >
                                    {index}
                                </Box>
                            ) : null}
                            <Typography
                                variant="overline"
                                sx={{
                                    letterSpacing: 0.6,
                                    color: alpha('#ffffff', 0.72),
                                    fontSize: { xs: '0.58rem', sm: '0.74rem' },
                                    lineHeight: 1.2,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                }}
                            >
                                {label}
                            </Typography>
                        </Stack>

                        {/* Right Circular Halo Icon */}
                        <Box
                            sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                bgcolor: safeAlpha(accentColor, 0.12),
                                border: `1px solid ${safeAlpha(accentColor, 0.35)}`,
                                color: accentColor,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                boxShadow: `0 0 8px ${safeAlpha(accentColor, 0.25)}`,
                            }}
                        >
                            <Iconify icon={icon} width={14} />
                        </Box>
                    </Stack>

                    {/* Value */}
                    <Typography
                        sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 0.5,
                            minWidth: 0,
                            color: '#ffffff',
                            fontSize: {
                                xs: 'clamp(1.1rem, 3.8vw, 1.3rem)',
                                sm: '1.4rem',
                                md: '1.55rem',
                            },
                            fontWeight: 800,
                            lineHeight: 1.15,
                            fontFamily: 'monospace',
                            textShadow: sparkle ? `0 0 14px ${safeAlpha(accentColor, 0.6)}` : 'none',
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
                                    color: accentColor,
                                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    fontFamily: 'monospace',
                                }}
                            >
                                {suffix}
                            </Typography>
                        ) : null}
                    </Typography>
                </Stack>
            )}
        </Box>
    );
}

// ----------------------------------------------------------------------
// Redesigned Pulse Hero Terminal
// ----------------------------------------------------------------------

function PulseHeroTactical({
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
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';
    const accentContrast = theme.palette.primary.contrastText || '#081401';

    const statTiles = [
        {
            key: 'winnings',
            label: labels.platformTotalWinnings,
            value: stats.totalWinnings,
            suffix: undefined,
            icon: 'solar:wallet-money-bold',
            color: accentColor,
            sparkle: true,
        },
        {
            key: 'matches',
            label: labels.processedMatches,
            value: stats.processedMatches,
            suffix: undefined,
            icon: 'solar:medal-ribbon-star-bold',
            color: accentColor,
            sparkle: false,
        },
        {
            key: 'live',
            label: labels.ongoingMatches,
            value: stats.ongoingMatches,
            suffix: liveSuffix,
            icon: 'solar:play-bold',
            color: accentColor,
            sparkle: true,
        },
        {
            key: 'joined',
            label: labels.todayJoinedUsers,
            value: stats.todayJoinedUsers,
            suffix: undefined,
            icon: 'solar:user-plus-rounded-bold',
            color: accentColor,
            sparkle: false,
        },
    ] as const;

    return (
        <CyberCardPanel
            accentBorder
            glowColor={accentColor}
            statusText="TELEMETRY LINKED // REAL-TIME SYNC"
            refId="01"
        >
            {/* Ambient Holographic Radar Circle in background */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: '-50%',
                    right: { xs: '-40%', md: '-20%' },
                    width: { xs: 280, md: 520 },
                    height: { xs: 280, md: 520 },
                    borderRadius: '50%',
                    border: `1px dashed ${safeAlpha(accentColor, 0.12)}`,
                    pointerEvents: 'none',
                    animation: `${radarSweep} 30s linear infinite`,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 40,
                        borderRadius: '50%',
                        border: `1px solid ${safeAlpha(accentColor, 0.08)}`,
                    },
                }}
            />

            {/* Tactical Card Header matching reference codex card */}
            <TacticalCardHeader
                id="01"
                badge={`${badgeLabel} // TELEMETRY PROTOCOL`}
                title={title}
                hint={description}
                rightIcon="solar:radar-bold"
                accentColor={accentColor}
                accentContrast={accentContrast}
                statusBadge={
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.8}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            px: 1,
                            py: 0.35,
                            borderRadius: '3px',
                            bgcolor: safeAlpha(accentColor, 0.1),
                            border: `1px solid ${safeAlpha(accentColor, 0.3)}`,
                            flexShrink: 0,
                        }}
                    >
                        <LivePulseDot color="green" size={7} />
                        <Typography
                            sx={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                letterSpacing: 1.2,
                                textTransform: 'uppercase',
                                color: accentColor,
                                fontFamily: 'monospace',
                            }}
                        >
                            STREAM ONLINE
                        </Typography>
                    </Stack>
                }
            />

            <Grid container spacing={{ xs: 2, md: 3.5 }} alignItems="center" sx={{ position: 'relative', zIndex: 1, flex: 1, width: '100%', maxWidth: '100%', m: 0 }}>
                <Grid item xs={12} md={5} sx={{ minWidth: 0, maxWidth: '100%' }}>
                    <Stack spacing={2} sx={{ minWidth: 0, maxWidth: '100%' }}>
                        {/* Description */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: alpha('#ffffff', 0.78),
                                fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                                lineHeight: 1.65,
                                letterSpacing: 0.2,
                                maxWidth: '100%',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {description}
                        </Typography>

                        {/* Last updated timestamp */}
                        {lastUpdatedLabel ? (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.9}
                                sx={{
                                    py: 0.75,
                                    px: 1.25,
                                    width: 'fit-content',
                                    borderRadius: '4px',
                                    bgcolor: alpha('#ffffff', 0.04),
                                    border: `1px solid ${alpha('#ffffff', 0.08)}`,
                                }}
                            >
                                <Iconify icon="solar:clock-circle-bold" width={14} sx={{ color: accentColor }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: HOME_TEXT_MUTED,
                                        fontWeight: 600,
                                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                        lineHeight: 1.4,
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {lastUpdatedLabel}
                                </Typography>
                            </Stack>
                        ) : null}
                    </Stack>
                </Grid>

                {/* 4 Pods Grid */}
                <Grid item xs={12} md={7} sx={{ minWidth: 0, maxWidth: '100%' }}>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ width: '100%', m: 0 }}>
                        {statTiles.map((tile, idx) => (
                            <Grid key={tile.key} item xs={6} sx={{ display: 'flex', minWidth: 0, maxWidth: '50%' }}>
                                <Box sx={{ width: 1, minWidth: 0, maxWidth: '100%' }}>
                                    <HolographicStatPod
                                        index={`0${idx + 1}`}
                                        label={tile.label}
                                        value={tile.value}
                                        suffix={tile.suffix}
                                        icon={tile.icon}
                                        loading={loading}
                                        color={tile.color}
                                        sparkle={tile.sparkle}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </CyberCardPanel>
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
// Redesigned Top Players Matrix (Operative Dossier Leaderboard)
// ----------------------------------------------------------------------

function PlayerListCardTactical({
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
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';
    const accentContrast = theme.palette.primary.contrastText || '#081401';
    const isWinnings = metricKey === 'totalWinnings';
    const cardId = isWinnings ? '02' : '03';
    const cardBadge = isWinnings ? 'HIGH ROLLER ARCHIVE // EARNINGS' : 'COMBAT OPERATIVES // ELITE STATS';
    const cardIcon = isWinnings ? 'solar:cup-star-bold' : 'solar:target-bold';
    const statusText = isWinnings ? 'SETTLEMENT VERIFIED // LIVE PAYOUTS' : 'COMBAT TELEMETRY // ARBITRATION ACTIVE';

    return (
        <CyberCardPanel
            glowColor={accentColor}
            accentBorder
            statusText={statusText}
            refId={cardId}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <TacticalCardHeader
                id={cardId}
                badge={cardBadge}
                title={title}
                hint={hint}
                rightIcon={cardIcon}
                accentColor={accentColor}
                accentContrast={accentContrast}
                statusBadge={
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.6}
                        sx={{
                            px: 0.9,
                            py: 0.35,
                            borderRadius: '3px',
                            bgcolor: alpha('#10b981', 0.12),
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                        }}
                    >
                        <LivePulseDot color="green" size={6} />
                        <Typography
                            sx={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                color: '#10b981',
                                lineHeight: 1.3,
                                fontFamily: 'monospace',
                            }}
                        >
                            {translations.live}
                        </Typography>
                    </Stack>
                }
            />

            <Box sx={{ flex: 1 }}>
                {loading ? (
                    <Stack spacing={1} sx={{ pt: 1 }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <Stack
                                key={idx}
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                sx={{
                                    py: 1,
                                    borderBottom: idx < 4 ? HOME_ROW_LINE : 'none',
                                }}
                            >
                                <Skeleton variant="rounded" width={28} height={28} />
                                <Skeleton variant="circular" width={36} height={36} />
                                <Stack sx={{ flex: 1 }}>
                                    <Skeleton width="60%" />
                                    <Skeleton width="40%" />
                                </Stack>
                                <Skeleton width={70} />
                            </Stack>
                        ))}
                    </Stack>
                ) : (
                    <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                        {players.length === 0 ? (
                            <Typography variant="body2" sx={{ color: HOME_TEXT_MUTED, py: 3, textAlign: 'center' }}>
                                {translations.noDataYet}
                            </Typography>
                        ) : (
                            players.map((player, idx) => {
                                const rank = idx + 1;
                                const isTop1 = rank === 1;
                                const isTop2 = rank === 2;
                                const isTop3 = rank === 3;

                                const rankColor = isTop1
                                    ? accentColor
                                    : isTop2
                                      ? '#cbd5e1'
                                      : isTop3
                                        ? safeAlpha(accentColor, 0.7)
                                        : alpha('#ffffff', 0.45);

                                const rankBg = isTop1
                                    ? safeAlpha(accentColor, 0.18)
                                    : isTop2
                                      ? alpha('#cbd5e1', 0.12)
                                      : isTop3
                                        ? safeAlpha(accentColor, 0.08)
                                        : alpha('#ffffff', 0.04);

                                const metricValue = (() => {
                                    switch (metricKey) {
                                        case 'totalWinnings':
                                            return <CoinValue value={player.totalWinnings || 0} size={15} />;
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
                                        sx={{
                                            position: 'relative',
                                            py: { xs: 1.1, sm: 1.15 },
                                            px: { xs: 1, sm: 1.25 },
                                            borderRadius: '4px',
                                            border: isTop1 ? `1px solid ${safeAlpha(accentColor, 0.4)}` : `1px solid transparent`,
                                            bgcolor: isTop1
                                                ? safeAlpha(accentColor, 0.07)
                                                : isTop2
                                                  ? alpha('#cbd5e1', 0.03)
                                                  : isTop3
                                                    ? safeAlpha(accentColor, 0.04)
                                                    : 'transparent',
                                            borderBottom: idx < players.length - 1 && !isTop1 ? HOME_ROW_LINE : undefined,
                                            transition: 'all 0.2s ease',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '50%',
                                                height: '100%',
                                                background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.08)}, transparent)`,
                                                pointerEvents: 'none',
                                            },
                                            '&:hover': {
                                                bgcolor: alpha('#ffffff', 0.05),
                                                borderColor: safeAlpha(rankColor, 0.4),
                                                transform: 'translateX(3px)',
                                                '&::before': {
                                                    animation: `${laserSweepX} 0.6s ease forwards`,
                                                },
                                            },
                                        }}
                                    >
                                        {/* Rank Badge with Chamfered Polygon */}
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)',
                                                bgcolor: isTop1 ? accentColor : rankBg,
                                                border: `1px solid ${safeAlpha(rankColor, 0.4)}`,
                                                color: isTop1 ? accentContrast : rankColor,
                                                fontWeight: 900,
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                boxShadow: isTop1 ? `0 0 10px ${safeAlpha(accentColor, 0.4)}` : 'none',
                                                animation: isTop1 ? `${rankShine} 3s ease-in-out infinite` : 'none',
                                            }}
                                        >
                                            #{rank}
                                        </Box>

                                        {/* Avatar */}
                                        <Avatar
                                            src={getAvatarUrl(player.avatar)}
                                            alt={player.username}
                                            sx={{
                                                width: { xs: 34, sm: 36 },
                                                height: { xs: 34, sm: 36 },
                                                bgcolor: alpha('#0ea5e9', 0.16),
                                                color: '#e2e8f0',
                                                fontWeight: 700,
                                                fontSize: { xs: '0.7rem', sm: '0.82rem' },
                                                flexShrink: 0,
                                                border: `1.5px solid ${safeAlpha(rankColor, 0.5)}`,
                                                boxShadow: isTop1 ? `0 0 10px ${safeAlpha(accentColor, 0.35)}` : 'none',
                                            }}
                                        >
                                            {player.username?.[0]?.toUpperCase() || '?'}
                                        </Avatar>

                                        {/* Player Details */}
                                        <Stack sx={{ flex: 1, minWidth: 0, overflow: 'hidden', gap: 0.2 }}>
                                            <Typography
                                                variant="subtitle2"
                                                noWrap
                                                sx={{
                                                    color: '#ffffff',
                                                    fontSize: { xs: '0.825rem', sm: '0.9rem' },
                                                    fontWeight: 700,
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {player.username}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                noWrap
                                                sx={{
                                                    color: HOME_TEXT_MUTED,
                                                    fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                    lineHeight: 1.4,
                                                    fontFamily: 'monospace',
                                                }}
                                            >
                                                {translations.lastPlayed}: {formatDateTime(player.lastPlayed)}
                                            </Typography>
                                        </Stack>

                                        {/* Metric Result */}
                                        <Stack spacing={0.2} sx={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: isTop1 ? accentColor : '#ffffff',
                                                    fontSize: { xs: '0.85rem', sm: '0.92rem' },
                                                    fontWeight: 800,
                                                    fontVariantNumeric: 'tabular-nums',
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {metricValue}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                noWrap
                                                sx={{
                                                    color: alpha('#ffffff', 0.55),
                                                    fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                    lineHeight: 1.35,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.4,
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
                            })
                        )}
                    </Stack>
                )}
            </Box>
        </CyberCardPanel>
    );
}

const TARGET_MATCH_TILES = 5;

function isRealMatchId(id: string | undefined) {
    return Boolean(id) && !String(id).startsWith('demo-');
}

function isMatchFull(match: DashboardMatchSummary) {
    const cap = match.totalPlayer || 0;
    return cap > 0 && match.participantsCount >= cap;
}

// ----------------------------------------------------------------------
// Redesigned Match Tile with Capacity Gauge and Chamfered CTA
// ----------------------------------------------------------------------

function DashboardMatchTileTactical({
    match,
    index,
    total,
    variant,
    isLast,
}: {
    match: DashboardMatchSummary;
    index: number;
    total: number;
    variant: 'prize' | 'ongoing';
    isLast?: boolean;
}) {
    const { t } = useTranslate();
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const full = isMatchFull(match);
    const matchPath = isRealMatchId(match.id) ? paths.user.match(match.id) : '';
    const showJoin = Boolean(matchPath);

    const handleJoin = () => {
        if (!matchPath) return;
        if (!isLoggedIn) {
            router.push(signInWithReturn(matchPath));
            return;
        }
        router.push(matchPath);
    };

    // Calculate capacity percent
    const maxPlayers = match.totalPlayer || 100;
    const currentPlayers = match.participantsCount || 0;
    const capacityPct = Math.min(100, Math.round((currentPlayers / maxPlayers) * 100));

    const capacityColor = full
        ? '#ef4444'
        : capacityPct > 70
          ? '#f59e0b'
          : '#10b981';

    return (
        <Box
            sx={{
                py: { xs: 1.35, sm: 1.4 },
                px: { xs: 1, sm: 1.25 },
                borderRadius: '4px',
                borderBottom: isLast ? 'none' : HOME_ROW_LINE,
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': {
                    bgcolor: alpha('#ffffff', 0.04),
                    transform: 'translateX(3px)',
                },
            }}
        >
            <Stack spacing={1}>
                {/* Header line: Game tag + Match Name + Rank Index */}
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                >
                    <Stack spacing={0.3} sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Box
                                component="span"
                                sx={{
                                    px: 0.75,
                                    py: 0.15,
                                    borderRadius: '2px',
                                    bgcolor: variant === 'ongoing' ? alpha('#ef4444', 0.15) : alpha('#f59e0b', 0.15),
                                    border: `1px solid ${variant === 'ongoing' ? alpha('#ef4444', 0.3) : alpha('#f59e0b', 0.3)}`,
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase',
                                    color: variant === 'ongoing' ? '#ef4444' : 'var(--ba-gold)',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.2,
                                }}
                            >
                                {match.gameName || 'Match'}
                            </Box>
                            {variant === 'ongoing' && (
                                <LivePulseDot color="red" size={5} />
                            )}
                        </Stack>

                        <Typography
                            sx={{
                                color: '#ffffff',
                                fontSize: { xs: '0.88rem', sm: '0.95rem' },
                                fontWeight: 700,
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: { xs: 2, sm: 1 },
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {match.matchName}
                        </Typography>
                    </Stack>

                    <Typography
                        sx={{
                            flexShrink: 0,
                            fontSize: { xs: '0.72rem', sm: '0.78rem' },
                            fontWeight: 800,
                            color: HOME_TEXT_MUTED,
                            fontVariantNumeric: 'tabular-nums',
                            fontFamily: 'monospace',
                            lineHeight: 1.3,
                            pt: 0.15,
                        }}
                    >
                        #{index + 1}/{total}
                    </Typography>
                </Stack>

                {/* Capacity segmented meter */}
                <Box sx={{ width: 1 }}>
                    <Box
                        sx={{
                            width: 1,
                            height: 3,
                            bgcolor: alpha('#ffffff', 0.08),
                            borderRadius: '2px',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                width: `${capacityPct}%`,
                                height: '100%',
                                bgcolor: capacityColor,
                                boxShadow: `0 0 8px ${capacityColor}`,
                                transition: 'width 0.5s ease',
                            }}
                        />
                    </Box>
                </Box>

                {/* Lower line: Spots, Entry, Prize, and CTA Button */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                >
                    <Stack spacing={0.2} sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                color: HOME_TEXT_SECONDARY,
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.4,
                                minWidth: 0,
                                lineHeight: 1.4,
                            }}
                        >
                            {variant === 'prize' ? `${t('home.dashboard.entry')}:` : `${t('home.dashboard.prizeEst')}`}
                            {variant === 'prize' ? (
                                <CoinValue value={match.entryFee || 0} size={13} />
                            ) : (
                                <CoinValue value={match.prizeEstimate || 0} size={13} />
                            )}
                        </Typography>

                        <Typography
                            sx={{
                                color: HOME_TEXT_MUTED,
                                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.4,
                                fontVariantNumeric: 'tabular-nums',
                                lineHeight: 1.4,
                            }}
                        >
                            {variant === 'prize' ? (
                                <>
                                    {fShortenNumber(match.prizeEstimate || 0)} · {t('home.dashboard.spots')}:{' '}
                                    <Box component="span" sx={{ color: capacityColor, fontWeight: 700 }}>
                                        {match.participantsCount}/{match.totalPlayer || '∞'}
                                    </Box>
                                </>
                            ) : match.entryFee ? (
                                <>
                                    {t('home.dashboard.spots')}:{' '}
                                    <Box component="span" sx={{ color: capacityColor, fontWeight: 700 }}>
                                        {match.participantsCount}/{match.totalPlayer || '∞'}
                                    </Box>{' '}
                                    · {t('home.dashboard.entry')} <CoinValue value={match.entryFee || 0} size={13} />
                                </>
                            ) : (
                                <>
                                    {t('home.dashboard.spots')}:{' '}
                                    <Box component="span" sx={{ color: capacityColor, fontWeight: 700 }}>
                                        {match.participantsCount}/{match.totalPlayer || '∞'}
                                    </Box>{' '}
                                    · {t('home.dashboard.entry')} {t('home.dashboard.free')}
                                </>
                            )}
                        </Typography>
                    </Stack>

                    {showJoin ? (
                        <Button
                            variant="contained"
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
                                flexShrink: 0,
                                minWidth: { xs: 84, sm: 94 },
                                minHeight: 34,
                                height: 34,
                                px: 1.5,
                                borderRadius: '3px',
                                clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                color: 'var(--ba-gold-ink) !important',
                                background: 'linear-gradient(135deg, var(--ba-gold-light) 0%, var(--ba-gold) 50%, var(--ba-gold-dark) 100%) !important',
                                border: '1px solid var(--ba-gold-light)',
                                boxShadow: `0 2px 12px ${goldAlpha(0.3)}`,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '60%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    transform: 'skewX(-25deg)',
                                    transition: 'left 0.5s ease',
                                    pointerEvents: 'none',
                                },
                                '&:hover': {
                                    background: 'linear-gradient(135deg, var(--ba-gold-light) 0%, var(--ba-gold) 60%, var(--ba-gold-light) 100%) !important',
                                    boxShadow: `0 4px 18px ${goldAlpha(0.55)}`,
                                    transform: 'translateY(-1px)',
                                    '&::before': {
                                        left: '140%',
                                    },
                                },
                                '&.Mui-disabled': {
                                    background: `${alpha('#ffffff', 0.08)} !important`,
                                    color: `${alpha('#ffffff', 0.35)} !important`,
                                    borderColor: alpha('#ffffff', 0.1),
                                    boxShadow: 'none',
                                    clipPath: 'none',
                                    borderRadius: '3px',
                                },
                            }}
                        >
                            {full ? t('home.dashboard.matchFull') : t('home.dashboard.joinNow')}
                        </Button>
                    ) : null}
                </Stack>
            </Stack>
        </Box>
    );
}

// ----------------------------------------------------------------------
// Redesigned Match Panel
// ----------------------------------------------------------------------

function DashboardMatchPanelTactical({
    title,
    badgeLabel,
    matches,
    loading,
    variant,
    emptyLabel,
}: {
    title: string;
    badgeLabel: string;
    matches: DashboardMatchSummary[];
    loading?: boolean;
    variant: 'prize' | 'ongoing';
    emptyLabel: string;
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';
    const accentContrast = theme.palette.primary.contrastText || '#081401';
    const isPrize = variant === 'prize';
    const cardId = isPrize ? '04' : '05';
    const cardBadge = isPrize ? 'WARZONE BOUNTY // ESCROW POOLS' : 'SATELLITE BROADCAST // LIVE LOBBIES';
    const cardIcon = isPrize ? 'solar:crown-bold' : 'solar:fire-bold';
    const statusText = isPrize ? 'ESCROW LOCKED // GUARANTEED PRIZE' : 'SATELLITE RADAR // ACTIVE BROADCAST';

    const count = matches.length;
    const tilesToRender = matches.slice(0, TARGET_MATCH_TILES);
    const isOngoing = variant === 'ongoing';

    return (
        <CyberCardPanel
            glowColor={accentColor}
            accentBorder
            statusText={statusText}
            refId={cardId}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <TacticalCardHeader
                id={cardId}
                badge={cardBadge}
                title={title}
                rightIcon={cardIcon}
                accentColor={accentColor}
                accentContrast={accentContrast}
                statusBadge={
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.6}
                        sx={{
                            px: 0.9,
                            py: 0.35,
                            borderRadius: '3px',
                            bgcolor: isOngoing ? alpha('#ef4444', 0.12) : safeAlpha(accentColor, 0.12),
                            border: `1px solid ${isOngoing ? alpha('#ef4444', 0.3) : safeAlpha(accentColor, 0.3)}`,
                        }}
                    >
                        {isOngoing ? <LivePulseDot color="red" size={6} /> : null}
                        <Typography
                            sx={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                color: isOngoing ? '#ef4444' : accentColor,
                                lineHeight: 1.3,
                                fontFamily: 'monospace',
                            }}
                        >
                            {badgeLabel}
                        </Typography>
                    </Stack>
                }
            />

            <Box sx={{ flex: 1 }}>
                {loading ? (
                    <Stack spacing={1} sx={{ pt: 1 }}>
                        {Array.from({ length: TARGET_MATCH_TILES }).map((_, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    py: 1.2,
                                    borderBottom: idx < TARGET_MATCH_TILES - 1 ? HOME_ROW_LINE : 'none',
                                }}
                            >
                                <Skeleton width="78%" height={16} sx={{ mb: 0.75 }} />
                                <Skeleton width="55%" height={14} />
                            </Box>
                        ))}
                    </Stack>
                ) : count ? (
                    <Box sx={{ pt: 0.5 }}>
                        {tilesToRender.map((match, index) => (
                            <DashboardMatchTileTactical
                                key={match.id || index}
                                match={match}
                                index={index}
                                total={tilesToRender.length}
                                variant={variant}
                                isLast={index === tilesToRender.length - 1}
                            />
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" sx={{ color: HOME_TEXT_MUTED, py: 3, textAlign: 'center' }}>
                        {emptyLabel}
                    </Typography>
                )}
            </Box>
        </CyberCardPanel>
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
                py: { xs: 4, md: 6 },
                color: '#f5f5f5',
                '&:before': {
                    content: "''",
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px),
                        url(${HOME_GAME_ARTS[1]})
                    `,
                    backgroundSize: '40px 40px, 40px 40px, cover',
                    backgroundPosition: 'center center, center center, center top',
                    opacity: 0.18,
                    filter: 'grayscale(0.4) contrast(1.1)',
                    pointerEvents: 'none',
                    zIndex: 0,
                },
                '&:after': {
                    content: "''",
                    position: 'absolute',
                    inset: 0,
                    background: `
                        radial-gradient(circle at 15% 25%, ${goldAlpha(0.08)} 0%, transparent 45%),
                        radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
                        linear-gradient(180deg, #07080b 0%, rgba(7, 8, 11, 0.92) 50%, #07080b 100%)
                    `,
                    pointerEvents: 'none',
                    zIndex: 0,
                },
            }}
        >
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
                        badgeLabel={t('home.dashboard.liveDashboardChip')}
                        title={t('home.dashboard.battleAsiaPulse')}
                        description={t('home.dashboard.pulseDescription')}
                        liveSuffix={t('home.dashboard.live')}
                        labels={pulseLabels}
                        stats={stats}
                        loading={loading}
                        lastUpdatedLabel={lastUpdatedLabel}
                    />

                    {/* Leaderboards (Top Profit & Top Players) */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: { md: 'stretch' },
                            ...homeMobileScrollFlexRowSx,
                            overflowX: { xs: 'auto', md: 'visible' },
                            scrollSnapType: { xs: 'x mandatory', md: 'none' },
                            pt: { xs: 0.5, md: 0.5 },
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
                            <PlayerListCardTactical
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
                            <PlayerListCardTactical
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

                    {/* Warzone Match Panels (High Prize & Ongoing Matches) */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { md: 'stretch' },
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <DashboardMatchPanelTactical
                                title={t('home.dashboard.highPrizeBattles')}
                                badgeLabel={t('home.dashboard.topN')}
                                matches={data?.highPrizeMatches || []}
                                loading={loading}
                                variant="prize"
                                emptyLabel={t('home.dashboard.noHighPrizeMatches')}
                            />
                        </Box>

                        <DashboardSplitGoldRule orientation="horizontal" />
                        <DashboardSplitGoldRule orientation="vertical" />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <DashboardMatchPanelTactical
                                title={t('home.dashboard.ongoingMatchesTitle')}
                                badgeLabel={
                                    data?.ongoingMatches?.length
                                        ? `${data.ongoingMatches.length} ${t('home.dashboard.listed')}`
                                        : t('home.dashboard.upcoming')
                                }
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
