import { useMemo, useState, useEffect, useCallback } from 'react';
import {
    Box,
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
import { fNumber } from 'src/utils/format-number';
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
                    boxShadow: {
                        xs: `0 8px 20px rgba(0, 0, 0, 0.55)`,
                        md: `0 12px 32px rgba(0, 0, 0, 0.7), 0 0 20px ${safeAlpha(accentColor, 0.12)}`,
                    },
                    p: { xs: 1.5, sm: 2.25, md: 2.5 },
                    overflow: 'hidden',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        borderColor: safeAlpha(accentColor, 0.5),
                        boxShadow: {
                            xs: `0 8px 20px rgba(0, 0, 0, 0.55)`,
                            md: `0 14px 38px rgba(0, 0, 0, 0.75), 0 0 24px ${safeAlpha(accentColor, 0.22)}`,
                        },
                    },
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {/* Left Neon Laser Rail — muted on mobile (avoids harsh side glow) */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: { xs: '2px', md: '2.5px' },
                    bgcolor: safeAlpha(accentColor, 0.5),
                    opacity: { xs: 0.55, md: 0.85 },
                    boxShadow: {
                        xs: 'none',
                        md: `0 0 8px ${safeAlpha(accentColor, 0.28)}`,
                    },
                    transition: 'all 0.25s ease',
                    zIndex: 2,
                }}
            />

            {/* Corner Reticle Marks */}
            <Box
                aria-hidden
                sx={{
                    display: { xs: 'none', sm: 'block' },
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
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                            bgcolor: accentColor,
                            color: accentContrast,
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: {
                                xs: 'none',
                                md: `0 0 14px ${safeAlpha(accentColor, 0.45)}`,
                            },
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
                                display: { xs: 'none', sm: 'grid' },
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                bgcolor: safeAlpha(accentColor, 0.15),
                                border: `1.5px solid ${accentColor}`,
                                color: accentColor,
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
                    ? `linear-gradient(180deg, transparent 0%, ${safeAlpha(accentColor, 0.12)} 20%, ${safeAlpha(accentColor, 0.5)} 50%, ${safeAlpha(accentColor, 0.12)} 80%, transparent 100%)`
                    : `linear-gradient(90deg, transparent 0%, ${safeAlpha(accentColor, 0.12)} 20%, ${safeAlpha(accentColor, 0.5)} 50%, ${safeAlpha(accentColor, 0.12)} 80%, transparent 100%)`,
                boxShadow: {
                    xs: 'none',
                    md: `0 0 6px ${safeAlpha(accentColor, 0.18)}`,
                },
                opacity: { xs: 0.55, md: 0.75 },
            }}
        >
            <Box
                sx={{
                    width: { xs: 4, md: 5 },
                    height: { xs: 4, md: 5 },
                    bgcolor: safeAlpha(accentColor, 0.65),
                    borderRadius: '50%',
                    boxShadow: { xs: 'none', md: `0 0 6px ${safeAlpha(accentColor, 0.35)}` },
                    animation: `${coreGlowPulse} 2.5s ease-in-out infinite`,
                }}
            />
        </Box>
    );
}

// ----------------------------------------------------------------------
// Simple glass title — APK style, square corners (title left, LIVE right)
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
                borderRadius: 0,
                mb: 1.5,
                px: { xs: 1.5, sm: 1.85 },
                py: { xs: 1.2, sm: 1.35 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                clipPath: {
                    xs: 'none',
                    sm: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                },
                background: `linear-gradient(105deg, ${safeAlpha(accentColor, 0.12)} 0%, rgba(8, 12, 20, 0.94) 45%, rgba(12, 18, 28, 0.9) 100%)`,
                border: `1px solid ${safeAlpha(accentColor, 0.28)}`,
                boxShadow: `
                    inset 0 1px 0 ${alpha('#ffffff', 0.08)},
                    0 0 10px ${safeAlpha(accentColor, 0.1)},
                    0 4px 14px ${alpha('#000000', 0.4)}
                `,
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    bgcolor: safeAlpha(accentColor, 0.5),
                    boxShadow: `0 0 6px ${safeAlpha(accentColor, 0.28)}`,
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
                    textShadow: `0 0 8px ${safeAlpha(accentColor, 0.22)}`,
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
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                    bgcolor: alpha('#10b981', 0.14),
                    border: `1px solid ${alpha('#10b981', 0.45)}`,
                    boxShadow: `0 0 10px ${alpha('#10b981', 0.25)}`,
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

const PULSE_GAMES: Array<{ apiNames: string[]; shortKey: string }> = [
    { apiNames: ['PUBG Mobile'], shortKey: 'pubg' },
    { apiNames: ['Free Fire'], shortKey: 'freeFire' },
    { apiNames: ['Call of Duty Mobile', 'COD Mobile'], shortKey: 'cod' },
    { apiNames: ['Valorant Mobile', 'Valorant'], shortKey: 'valorant' },
    { apiNames: ['Mobile Legends'], shortKey: 'mlbb' },
];

function pulseLiveCountForGame(
    liveCountByGame: Record<string, number> | undefined,
    apiNames: string[]
) {
    if (!liveCountByGame) return 0;
    for (const name of apiNames) {
        if (typeof liveCountByGame[name] === 'number') return liveCountByGame[name];
    }
    return 0;
}

function PulseHeroTactical({
    badgeLabel,
    title,
    description,
    gamesCoveredLabel,
    gameShortLabels,
    liveCountByGame,
    liveSuffix,
    labels,
    stats,
    loading,
    lastUpdatedLabel,
}: {
    badgeLabel: string;
    title: string;
    description: string;
    gamesCoveredLabel: string;
    gameShortLabels: Record<string, string>;
    liveCountByGame?: Record<string, number>;
    liveSuffix: string;
    labels: PulseCardLabels;
    stats: PulseCardStats;
    loading?: boolean;
    lastUpdatedLabel?: string;
}) {
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';

    const gameChips = PULSE_GAMES.map((game) => {
        const short = gameShortLabels[game.shortKey] || game.shortKey.toUpperCase();
        const live = pulseLiveCountForGame(liveCountByGame, game.apiNames);
        return { key: game.shortKey, label: short, live };
    });

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
        <GlassApkCardShell
            accentColor={accentColor}
            statusText="TELEMETRY LINKED // REAL-TIME SYNC"
            refId="01"
        >
            <GlassSimpleTitle title={title} liveLabel={liveSuffix} accentColor={accentColor} />

            <Typography
                sx={{
                    mb: 0.75,
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.68rem', sm: '0.72rem' },
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: safeAlpha(accentColor, 0.75),
                }}
            >
                {`${badgeLabel} // TELEMETRY PROTOCOL`}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    mb: 1,
                    color: alpha('#ffffff', 0.72),
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    lineHeight: 1.45,
                    maxWidth: 720,
                }}
            >
                {description}
            </Typography>

            <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                spacing={0.75}
                sx={{ mb: lastUpdatedLabel ? 1 : 1.25, rowGap: 0.65 }}
            >
                <Typography
                    sx={{
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: alpha('#ffffff', 0.55),
                        mr: 0.25,
                    }}
                >
                    {gamesCoveredLabel}
                </Typography>
                {gameChips.map((chip) => (
                    <Box
                        key={chip.key}
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            px: 0.7,
                            py: 0.25,
                            borderRadius: '4px',
                            border: `1px solid ${safeAlpha(accentColor, 0.22)}`,
                            bgcolor: safeAlpha(accentColor, 0.06),
                            fontFamily: 'monospace',
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: alpha('#ffffff', 0.82),
                        }}
                    >
                        {chip.label}
                        <Box
                            component="span"
                            sx={{
                                color: chip.live > 0 ? safeAlpha(accentColor, 0.9) : alpha('#ffffff', 0.4),
                                fontWeight: 800,
                            }}
                        >
                            {chip.live}
                        </Box>
                    </Box>
                ))}
            </Stack>

            {lastUpdatedLabel ? (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{ mb: 1.25, minWidth: 0 }}
                >
                    <Iconify icon="solar:clock-circle-bold" width={14} sx={{ color: safeAlpha(accentColor, 0.7), flexShrink: 0 }} />
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

            {/* One merged stats strip — 4 metrics, no nested boxes */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    width: 1,
                    minWidth: 0,
                    border: `1px solid ${safeAlpha(accentColor, 0.2)}`,
                    background: `linear-gradient(180deg, ${safeAlpha(accentColor, 0.04)} 0%, rgba(6, 10, 18, 0.55) 100%)`,
                    clipPath: {
                        xs: 'none',
                        sm: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                    },
                }}
            >
                {statTiles.map((tile, idx) => (
                    <Box
                        key={tile.key}
                        sx={{
                            position: 'relative',
                            minWidth: 0,
                            px: { xs: 1.25, sm: 1.75 },
                            py: { xs: 1.35, sm: 1.6 },
                            borderRight: {
                                xs: idx % 2 === 0 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                                md: idx < 3 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
                            },
                            borderBottom: {
                                xs: idx < 2 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                                md: 'none',
                            },
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="flex-start"
                            justifyContent="space-between"
                            spacing={1}
                            sx={{ mb: 0.85 }}
                        >
                            <Typography
                                sx={{
                                    color: alpha('#ffffff', 0.65),
                                    fontSize: { xs: '0.62rem', sm: '0.7rem' },
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.25,
                                    minWidth: 0,
                                }}
                            >
                                {tile.label}
                            </Typography>
                            <Iconify
                                icon={tile.icon}
                                width={16}
                                sx={{ color: safeAlpha(accentColor, 0.72), flexShrink: 0 }}
                            />
                        </Stack>

                        {loading ? (
                            <Skeleton width="70%" height={28} />
                        ) : (
                            <Typography
                                sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 0.5,
                                    minWidth: 0,
                                    color: '#ffffff',
                                    fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.45rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.15,
                                    fontFamily: 'monospace',
                                    textShadow: tile.sparkle ? `0 0 8px ${safeAlpha(accentColor, 0.22)}` : 'none',
                                    '& > *': {
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    },
                                }}
                            >
                                {tile.value}
                                {tile.suffix ? (
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: accentColor,
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            fontWeight: 700,
                                            letterSpacing: 0.4,
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {tile.suffix}
                                    </Typography>
                                ) : null}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>
        </GlassApkCardShell>
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
// Leaderboard shell — Download-APK glass, square corners (content unchanged)
// ----------------------------------------------------------------------

function GlassApkCardShell({
    children,
    accentColor,
    statusText,
    refId,
}: {
    children: React.ReactNode;
    accentColor: string;
    statusText?: string;
    refId?: string;
}) {
    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 0,
                boxSizing: 'border-box',
                clipPath: {
                    xs: 'none',
                    sm: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                },
                background: `
                    radial-gradient(ellipse 80% 60% at 100% 0%, ${safeAlpha(accentColor, 0.06)} 0%, transparent 55%),
                    linear-gradient(145deg, ${safeAlpha(accentColor, 0.05)} 0%, rgba(6, 10, 18, 0.96) 38%, rgba(10, 14, 24, 0.92) 100%)
                `,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${safeAlpha(accentColor, 0.22)}`,
                boxShadow: `
                    inset 0 1px 0 ${alpha('#ffffff', 0.08)},
                    inset 0 0 40px ${safeAlpha(accentColor, 0.02)},
                    0 0 16px ${safeAlpha(accentColor, 0.06)},
                    0 12px 32px ${alpha('#000000', 0.55)}
                `,
                p: { xs: 1.5, sm: 2.25, md: 2.5 },
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-140%',
                    width: '55%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)',
                    transform: 'skewX(-20deg)',
                    transition: 'left 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: 'none',
                    zIndex: 1,
                },
                '&:hover': {
                    borderColor: safeAlpha(accentColor, 0.35),
                    boxShadow: `
                        inset 0 0 20px ${safeAlpha(accentColor, 0.06)},
                        0 0 20px ${safeAlpha(accentColor, 0.12)},
                        0 14px 36px ${alpha('#000000', 0.6)}
                    `,
                    '&::before': { left: '160%' },
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
                    boxShadow: `0 0 8px ${safeAlpha(accentColor, 0.25)}`,
                    zIndex: 2,
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 2, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>

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
                        position: 'relative',
                        zIndex: 2,
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
    const accentColor = theme.palette.primary.main || '#cbfb24';
    const accentContrast = theme.palette.primary.contrastText || '#081401';

    return (
        <GlassApkCardShell accentColor={accentColor}>
            <GlassSimpleTitle title={title} liveLabel={liveLabel} accentColor={accentColor} />

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
                                                bgcolor: isTop1 ? safeAlpha(accentColor, 0.75) : rankBg,
                                                border: `1px solid ${safeAlpha(rankColor, 0.4)}`,
                                                color: isTop1 ? accentContrast : rankColor,
                                                fontWeight: 900,
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                boxShadow: isTop1 ? `0 0 6px ${safeAlpha(accentColor, 0.25)}` : 'none',
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
                                                boxShadow: isTop1 ? `0 0 6px ${safeAlpha(accentColor, 0.2)}` : 'none',
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
                                                    color: isTop1 ? safeAlpha(accentColor, 0.85) : '#ffffff',
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
        </GlassApkCardShell>
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
    const isPrize = variant === 'prize';

    const handleJoin = () => {
        if (!matchPath) return;
        if (!isLoggedIn) {
            router.push(signInWithReturn(matchPath));
            return;
        }
        router.push(matchPath);
    };

    const maxPlayers = match.totalPlayer || 100;
    const currentPlayers = match.participantsCount || 0;
    const capacityPct = Math.min(100, Math.round((currentPlayers / maxPlayers) * 100));

    const capacityColor = full
        ? '#ef4444'
        : capacityPct > 70
          ? '#f59e0b'
          : '#10b981';

    const accent = isPrize ? 'var(--ba-gold)' : '#ef4444';

    return (
        <Box
            sx={{
                position: 'relative',
                py: { xs: 1, sm: 1.1 },
                px: { xs: 1, sm: 1.15 },
                mb: isLast ? 0 : 0.75,
                borderRadius: '8px',
                bgcolor: alpha('#0a0c10', 0.55),
                border: `1px solid ${alpha('#ffffff', 0.07)}`,
                boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.04)}`,
                overflow: 'hidden',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    borderRadius: 1,
                    bgcolor: accent,
                    boxShadow: `0 0 8px ${alpha(isPrize ? '#f5c518' : '#ef4444', 0.45)}`,
                },
                '&:hover': {
                    bgcolor: alpha('#10141c', 0.72),
                    borderColor: isPrize ? goldAlpha(0.35) : alpha('#ef4444', 0.28),
                },
            }}
        >
            <Stack spacing={0.75} sx={{ pl: 0.75 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                >
                    <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ minWidth: 0 }}>
                            <Box
                                component="span"
                                sx={{
                                    px: 0.6,
                                    py: 0.1,
                                    borderRadius: '3px',
                                    bgcolor: isPrize ? goldAlpha(0.12) : alpha('#ef4444', 0.12),
                                    border: `1px solid ${isPrize ? goldAlpha(0.32) : alpha('#ef4444', 0.28)}`,
                                    fontSize: 9,
                                    fontWeight: 800,
                                    letterSpacing: 0.4,
                                    textTransform: 'uppercase',
                                    color: isPrize ? 'var(--ba-gold)' : '#ef4444',
                                    lineHeight: 1.25,
                                    flexShrink: 0,
                                }}
                            >
                                {match.gameName || 'Match'}
                            </Box>
                            {variant === 'ongoing' && <LivePulseDot color="red" size={5} />}
                            <Typography
                                sx={{
                                    flexShrink: 0,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: HOME_TEXT_MUTED,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                #{index + 1}/{total}
                            </Typography>
                        </Stack>

                        <Typography
                            sx={{
                                color: '#ffffff',
                                fontSize: { xs: '0.82rem', sm: '0.88rem' },
                                fontWeight: 700,
                                lineHeight: 1.25,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {match.matchName}
                        </Typography>
                    </Stack>

                    {isPrize ? (
                        <Stack alignItems="flex-end" spacing={0.15} sx={{ flexShrink: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase',
                                    color: goldAlpha(0.75),
                                }}
                            >
                                {t('home.dashboard.prizeEst')}
                            </Typography>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
                                <CoinValue value={match.prizeEstimate || 0} size={14} />
                            </Box>
                        </Stack>
                    ) : null}
                </Stack>

                <Box
                    sx={{
                        width: 1,
                        height: 2,
                        bgcolor: alpha('#ffffff', 0.06),
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            width: `${capacityPct}%`,
                            height: '100%',
                            bgcolor: capacityColor,
                            boxShadow: `0 0 6px ${capacityColor}`,
                            transition: 'width 0.45s ease',
                        }}
                    />
                </Box>

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                >
                    <Typography
                        sx={{
                            color: HOME_TEXT_MUTED,
                            fontSize: { xs: '0.7rem', sm: '0.74rem' },
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.35,
                            minWidth: 0,
                            lineHeight: 1.3,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        <Box component="span" sx={{ color: capacityColor, fontWeight: 700 }}>
                            {match.participantsCount}/{match.totalPlayer || '∞'}
                        </Box>
                        <Box component="span" sx={{ opacity: 0.45 }}>
                            ·
                        </Box>
                        {t('home.dashboard.entry')}
                        {match.entryFee ? (
                            <CoinValue value={match.entryFee} size={12} />
                        ) : (
                            <Box component="span" sx={{ color: HOME_TEXT_SECONDARY, fontWeight: 700 }}>
                                {t('home.dashboard.free')}
                            </Box>
                        )}
                        {!isPrize && match.prizeEstimate ? (
                            <>
                                <Box component="span" sx={{ opacity: 0.45 }}>
                                    ·
                                </Box>
                                {t('home.dashboard.prizeEst')}
                                <CoinValue value={match.prizeEstimate} size={12} />
                            </>
                        ) : null}
                    </Typography>

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
                                minWidth: { xs: 72, sm: 82 },
                                minHeight: 28,
                                height: 28,
                                px: 1.15,
                                borderRadius: '6px',
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                                color: 'var(--ba-gold-ink) !important',
                                background:
                                    'linear-gradient(135deg, var(--ba-gold-light) 0%, var(--ba-gold) 55%, var(--ba-gold-dark) 100%) !important',
                                border: '1px solid var(--ba-gold-light)',
                                boxShadow: `0 2px 10px ${goldAlpha(0.28)}`,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                '&:hover': {
                                    boxShadow: `0 4px 14px ${goldAlpha(0.45)}`,
                                    transform: 'translateY(-1px)',
                                },
                                '&.Mui-disabled': {
                                    background: `${alpha('#ffffff', 0.08)} !important`,
                                    color: `${alpha('#ffffff', 0.35)} !important`,
                                    borderColor: alpha('#ffffff', 0.1),
                                    boxShadow: 'none',
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
    const theme = useTheme();
    const accentColor = theme.palette.primary.main || '#cbfb24';

    const count = matches.length;
    const tilesToRender = matches.slice(0, TARGET_MATCH_TILES);

    return (
        <GlassApkCardShell accentColor={accentColor}>
            <GlassSimpleTitle title={title} liveLabel={liveLabel} accentColor={accentColor} />

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
                    <Box sx={{ pt: 0.35 }}>
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
        </GlassApkCardShell>
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
                        gamesCoveredLabel={t('home.dashboard.gamesCoveredLabel')}
                        gameShortLabels={{
                            pubg: t('home.dashboard.gamesCoveredShort.pubg'),
                            freeFire: t('home.dashboard.gamesCoveredShort.freeFire'),
                            cod: t('home.dashboard.gamesCoveredShort.cod'),
                            valorant: t('home.dashboard.gamesCoveredShort.valorant'),
                            mlbb: t('home.dashboard.gamesCoveredShort.mlbb'),
                        }}
                        liveCountByGame={data?.liveCountByGame}
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
                                ...homeMobileScrollItemSx,
                                flex: { xs: '0 0 100%', md: '1 1 0' },
                                minWidth: { xs: 0, md: 0 },
                                maxWidth: { xs: '100%', md: 'none' },
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
                                liveLabel={t('home.dashboard.live')}
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
