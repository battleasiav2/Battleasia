import { useState } from 'react';

import { Box, Stack, Container, Typography, Grid2 as Grid } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

import { PLAY_YOUR_GAME_IMAGE_PATHS } from './home-game-arts';

// ----------------------------------------------------------------------
// KEYFRAME ANIMATIONS FOR CYBER GAMING EFFECTS
// ----------------------------------------------------------------------

const beaconPulse = keyframes`
  0% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(203, 251, 36, 0.7);
  }
  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 10px rgba(203, 251, 36, 0);
  }
  100% {
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(203, 251, 36, 0);
  }
`;

const radarRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const radarRotateRev = keyframes`
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
`;

const titleShimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const scanlineDown = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(1000%);
  }
`;

const laserSweep = keyframes`
  0% {
    transform: translateX(-120%) skewX(-20deg);
    opacity: 0;
  }
  30% {
    opacity: 0.6;
  }
  70% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(220%) skewX(-20deg);
    opacity: 0;
  }
`;

const operativeFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.015);
  }
`;

const tacticalGridPulse = keyframes`
  0%, 100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.55;
  }
`;

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

/** Animated Holographic Radar SVG Watermark */
function HolographicRadarBackdrop({ accentColor }: { accentColor: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: 320, sm: 460, md: 540 },
        height: { xs: 320, sm: 460, md: 540 },
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.28,
      }}
    >
      {/* Outer Rotating Compass Ring */}
      <Box
        component="svg"
        viewBox="0 0 400 400"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          animation: `${radarRotate} 45s linear infinite`,
        }}
      >
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          strokeDasharray="4 8 16 8"
          opacity="0.6"
        />
        <circle
          cx="200"
          cy="200"
          r="165"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeDasharray="2 12"
          opacity="0.3"
        />
        <circle
          cx="200"
          cy="200"
          r="135"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          strokeDasharray="24 6"
          opacity="0.5"
        />
        {/* Cardinal tick marks */}
        <line x1="200" y1="2" x2="200" y2="16" stroke={accentColor} strokeWidth="2" />
        <line x1="200" y1="384" x2="200" y2="398" stroke={accentColor} strokeWidth="2" />
        <line x1="2" y1="200" x2="16" y2="200" stroke={accentColor} strokeWidth="2" />
        <line x1="384" y1="200" x2="398" y2="200" stroke={accentColor} strokeWidth="2" />
      </Box>

      {/* Counter-rotating Inner Telemetry Ring */}
      <Box
        component="svg"
        viewBox="0 0 300 300"
        sx={{
          position: 'absolute',
          top: '12.5%',
          left: '12.5%',
          width: '75%',
          height: '75%',
          animation: `${radarRotateRev} 28s linear infinite`,
        }}
      >
        <circle
          cx="150"
          cy="150"
          r="110"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray="6 14"
          opacity="0.5"
        />
        <circle
          cx="150"
          cy="150"
          r="80"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3 8"
          opacity="0.4"
        />
        <line x1="150" y1="20" x2="150" y2="280" stroke={alpha(accentColor, 0.25)} strokeWidth="1" />
        <line x1="20" y1="150" x2="280" y2="150" stroke={alpha(accentColor, 0.25)} strokeWidth="1" />
      </Box>

      {/* Central Radar Pulse Blip */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: alpha(accentColor, 0.12),
          border: `1.5px solid ${accentColor}`,
          boxShadow: `0 0 20px ${alpha(accentColor, 0.6)}`,
          display: 'grid',
          placeItems: 'center',
          '&::after': {
            content: '""',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          },
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function AboutBattleAsiaSection() {
  const theme = useTheme();
  const { t } = useTranslate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const accentColor = theme.palette.primary.main || '#cbfb24';
  const accentContrast = theme.palette.primary.contrastText || '#081401';

  // Stat definitions using exact original values & translated labels
  const statCards = [
    {
      value: CONFIG.homeStats.activePlayers,
      label: t('home.stats.activePlayers'),
      icon: 'solar:users-group-rounded-bold-duotone',
      code: 'METRIC // 01',
      badge: 'LIVE OPERATIVES',
      tint: accentColor,
    },
    {
      value: CONFIG.homeStats.prizeMoney,
      label: t('home.stats.prizeMoney'),
      icon: 'solar:wallet-money-bold-duotone',
      code: 'METRIC // 02',
      badge: 'VERIFIED PAYOUTS',
      tint: '#f59e0b',
    },
    {
      value: CONFIG.homeStats.gamesSupported,
      label: t('home.stats.gamesSupported'),
      icon: 'solar:gamepad-minimalistic-bold-duotone',
      code: 'METRIC // 03',
      badge: 'TIER-1 ESPORTS',
      tint: '#38bdf8',
    },
    {
      value: CONFIG.homeStats.tournaments,
      label: t('home.stats.tournaments'),
      icon: 'solar:medal-ribbons-star-bold-duotone',
      code: 'METRIC // 04',
      badge: 'ALWAYS ACTIVE',
      tint: '#a855f7',
    },
  ] as const;

  // Paragraphs using exact original translated texts
  const paragraphs = [
    t('home.aboutDescription1'),
    t('home.aboutDescription2'),
    t('home.aboutDescription3'),
  ] as const;

  // Tactical classification metadata for each paragraph dossier
  const directives = [
    {
      index: '01',
      code: 'MISSION DIRECTIVE // PLATFORM',
      icon: 'solar:cup-star-bold-duotone',
      tag: 'GLOBAL ARENA',
    },
    {
      index: '02',
      code: 'MISSION DIRECTIVE // ECOSYSTEM',
      icon: 'solar:gamepad-bold-duotone',
      tag: 'MULTI-TITLE COMBAT',
    },
    {
      index: '03',
      code: 'MISSION DIRECTIVE // PROTOCOL',
      icon: 'solar:shield-check-bold-duotone',
      tag: 'FAIR PLAY & ESCROW',
    },
  ];

  return (
    <Box
      id="about-us"
      component="section"
      sx={{
        scrollMarginTop: { xs: '80px', md: '100px' },
        position: 'relative',
        overflowX: 'clip',
        overflowY: 'visible',
        bgcolor: '#050608',
        color: '#ffffff',
        py: { xs: 6, sm: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
        // Dual ambient glow aura: Primary accent top-left, cyan bottom-right
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '10%',
          width: { xs: 320, md: 540 },
          height: { xs: 320, md: 540 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accentColor, 0.12)} 0%, transparent 70%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: '5%',
          width: { xs: 320, md: 500 },
          height: { xs: 320, md: 500 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#38bdf8', 0.08)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Tactical Cyber Grid Background Lines */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${alpha('#ffffff', 0.03)} 1px, transparent 1px),
            linear-gradient(to bottom, ${alpha('#ffffff', 0.03)} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000000 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000000 35%, transparent 100%)',
          animation: `${tacticalGridPulse} 8s ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sweeping Laser Scanline Accent */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${alpha(accentColor, 0.8)} 50%, transparent 100%)`,
          animation: `${scanlineDown} 9s linear infinite`,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.4,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* ================================================================= */}
        {/* HEADER: BRAND PROTOCOL & TITLE */}
        {/* ================================================================= */}
        <Stack spacing={1.5} alignItems="center" sx={{ mb: { xs: 5, md: 7 }, textAlign: 'center' }}>
          {/* Tactical HUD Classification Pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2,
              py: 0.6,
              borderRadius: '999px',
              bgcolor: alpha(accentColor, 0.06),
              border: `1px solid ${alpha(accentColor, 0.25)}`,
              boxShadow: `0 0 16px ${alpha(accentColor, 0.15)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: accentColor,
                animation: `${beaconPulse} 2s infinite ease-in-out`,
              }}
            />
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: 10, sm: 11 },
                fontWeight: 800,
                letterSpacing: 2.8,
                color: accentColor,
                textTransform: 'uppercase',
              }}
            >
              {t('home.playYourGame.brandLabel')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: 10,
                color: alpha('#ffffff', 0.4),
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              [ PROTOCOL: HQ_SPEC ]
            </Typography>
          </Box>

          {/* Monumental Esports Title */}
          <Typography
            variant="h2"
            className="font-tr"
            sx={{
              fontSize: { xs: 26, sm: 36, md: 46 },
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: { xs: 1.5, md: 3 },
              lineHeight: 1.1,
              background: `linear-gradient(135deg, #ffffff 0%, #f1f5f9 35%, ${accentColor} 70%, #ffffff 100%)`,
              backgroundSize: '200% auto',
              animation: `${titleShimmer} 7s linear infinite`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 4px 20px ${alpha(accentColor, 0.3)})`,
            }}
          >
            {t('home.aboutBattleAsia')}
          </Typography>

          {/* Center Tactical Battle Divider */}
          <Box sx={{ width: '100%', maxWidth: 360, mt: 0.5 }}>
            <BattleGoldDivider variant="hero" showCenterGem />
          </Box>
        </Stack>

        {/* ================================================================= */}
        {/* MAIN BATTLEFRAME: 2-COLUMN TACTICAL LAYOUT */}
        {/* ================================================================= */}
        <Grid container spacing={{ xs: 3.5, md: 4.5 }} alignItems="stretch">
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: 3 INTERACTIVE CLASSIFIED DOSSIER CARDS (PARAGRAPHS) */}
          {/* ------------------------------------------------------------- */}
          <Grid size={{ xs: 12, md: 6.5 }}>
            <Stack spacing={2.25} sx={{ height: 1, justifyContent: 'space-between' }}>
              {paragraphs.map((paragraph, index) => {
                const directive = directives[index];
                const isHovered = hoveredCard === index;

                return (
                  <Box
                    key={directive.code}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      position: 'relative',
                      p: { xs: 2.2, sm: 2.6, md: 3 },
                      clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
                      bgcolor: isHovered ? alpha('#10141f', 0.95) : alpha('#0c0f17', 0.85),
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${isHovered ? alpha(accentColor, 0.45) : alpha('#ffffff', 0.08)}`,
                      boxShadow: isHovered
                        ? `0 12px 36px rgba(0,0,0,0.7), 0 0 24px ${alpha(accentColor, 0.18)}, inset 0 1px 0 ${alpha(accentColor, 0.3)}`
                        : '0 8px 24px rgba(0,0,0,0.5)',
                      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Left Animated Laser Rail Accent */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3.5px',
                        bgcolor: isHovered ? accentColor : alpha(accentColor, 0.2),
                        boxShadow: isHovered ? `0 0 14px ${accentColor}` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />

                    {/* Corner Reticle Brackets */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 8,
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: isHovered ? accentColor : alpha('#ffffff', 0.25),
                        transition: 'color 0.3s ease',
                        userSelect: 'none',
                      }}
                    >
                      ⌜ ⌝
                    </Box>

                    {/* Card Header Row */}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.6 }}>
                      {/* Hex/Chamfered Index Badge */}
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                          bgcolor: isHovered ? accentColor : alpha(accentColor, 0.12),
                          color: isHovered ? accentContrast : accentColor,
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: isHovered ? `0 0 16px ${alpha(accentColor, 0.5)}` : 'none',
                          transition: 'all 0.25s ease',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={directive.icon} width={18} />
                      </Box>

                      {/* Header Labels */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                          <Typography
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: 1.4,
                              color: isHovered ? accentColor : alpha('#ffffff', 0.8),
                              textTransform: 'uppercase',
                              transition: 'color 0.25s ease',
                            }}
                          >
                            {directive.code}
                          </Typography>
                          <Box
                            sx={{
                              px: 0.8,
                              py: 0.2,
                              borderRadius: '4px',
                              bgcolor: alpha('#ffffff', 0.05),
                              border: `1px solid ${alpha('#ffffff', 0.1)}`,
                              fontSize: 9,
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: alpha('#ffffff', 0.6),
                              letterSpacing: 0.8,
                            }}
                          >
                            {directive.tag}
                          </Box>
                        </Stack>
                      </Box>

                      {/* Index Digits */}
                      <Typography
                        sx={{
                          fontFamily: `'Barlow', sans-serif`,
                          fontSize: 22,
                          fontWeight: 900,
                          color: isHovered ? alpha(accentColor, 0.5) : alpha('#ffffff', 0.15),
                          transition: 'color 0.3s ease',
                          userSelect: 'none',
                        }}
                      >
                        {directive.index}
                      </Typography>
                    </Stack>

                    {/* Verbatim Paragraph Body */}
                    <Typography
                      className="font-tr"
                      sx={{
                        fontSize: { xs: 13.5, sm: 14.5, md: 15.5 },
                        lineHeight: { xs: 1.65, md: 1.75 },
                        color: isHovered ? '#ffffff' : alpha('#ffffff', 0.78),
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {paragraph}
                    </Typography>

                    {/* Subtle bottom scanline glow */}
                    {isHovered && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                          boxShadow: `0 0 10px ${accentColor}`,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Grid>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: 3D HOLOGRAPHIC TELEMETRY MATRIX (THE 4 STATS) */}
          {/* ------------------------------------------------------------- */}
          <Grid size={{ xs: 12, md: 5.5 }}>
            <Box
              sx={{
                position: 'relative',
                height: 1,
                minHeight: { xs: 380, md: 440 },
                borderRadius: '20px',
                p: { xs: 2.5, sm: 3 },
                bgcolor: alpha('#080a10', 0.8),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#ffffff', 0.1)}`,
                boxShadow: `0 16px 48px rgba(0,0,0,0.8), inset 0 1px 0 0 ${alpha('#ffffff', 0.08)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
              }}
            >
              {/* Animated Holographic Radar Centerpiece (pure CSS + SVG) */}
              <HolographicRadarBackdrop accentColor={accentColor} />

              {/* Translucent Operative Silhouette Watermark */}
              <Box
                component="img"
                src={PLAY_YOUR_GAME_IMAGE_PATHS.pubgMobile}
                alt="Operative Watermark"
                sx={{
                  position: 'absolute',
                  right: '-12%',
                  bottom: '-12%',
                  width: { xs: '65%', md: '75%' },
                  maxWidth: 380,
                  opacity: 0.12,
                  filter: 'grayscale(0.4) contrast(1.2)',
                  maskImage: 'radial-gradient(circle at 60% 60%, black 30%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at 60% 60%, black 30%, transparent 80%)',
                  animation: `${operativeFloat} 6s ease-in-out infinite`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Top Telemetry Header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ position: 'relative', zIndex: 1, mb: 2.5 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:radar-2-bold-duotone" width={18} sx={{ color: accentColor }} />
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 2,
                      color: accentColor,
                      textTransform: 'uppercase',
                    }}
                  >
                    PLATFORM METRICS // LIVE
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    px: 1.2,
                    py: 0.3,
                    borderRadius: '4px',
                    bgcolor: alpha('#22c55e', 0.12),
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#22c55e',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                  }}
                >
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#22c55e' }} />
                  SYNCED
                </Box>
              </Stack>

              {/* 2x2 Grid of 3D Holographic Stat Cores */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: { xs: 1.75, sm: 2 },
                  position: 'relative',
                  zIndex: 1,
                  flexGrow: 1,
                }}
              >
                {statCards.map((stat, idx) => {
                  const isHovered = hoveredStat === idx;

                  return (
                    <Box
                      key={stat.label}
                      onMouseEnter={() => setHoveredStat(idx)}
                      onMouseLeave={() => setHoveredStat(null)}
                      sx={{
                        position: 'relative',
                        p: { xs: 2, sm: 2.4 },
                        borderRadius: '14px',
                        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                        bgcolor: isHovered ? alpha('#141926', 0.95) : alpha('#0f131d', 0.82),
                        border: `1px solid ${isHovered ? alpha(stat.tint, 0.5) : alpha('#ffffff', 0.1)}`,
                        borderTop: `2px solid ${isHovered ? stat.tint : alpha(stat.tint, 0.45)}`,
                        boxShadow: isHovered
                          ? `0 12px 28px rgba(0,0,0,0.7), 0 0 20px ${alpha(stat.tint, 0.25)}`
                          : '0 6px 20px rgba(0,0,0,0.5)',
                        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Laser Sweep Reflection Effect on Hover */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '40%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.15)}, transparent)`,
                          transform: 'translateX(-120%) skewX(-20deg)',
                          animation: isHovered ? `${laserSweep} 1.2s infinite` : 'none',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Corner Reticle Markers */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 8,
                          fontFamily: 'monospace',
                          fontSize: 9,
                          color: isHovered ? stat.tint : alpha('#ffffff', 0.2),
                          userSelect: 'none',
                        }}
                      >
                        ⌜ ⌝
                      </Box>

                      {/* Top Metric Header */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            bgcolor: alpha(stat.tint, 0.12),
                            border: `1px solid ${alpha(stat.tint, 0.3)}`,
                            color: stat.tint,
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Iconify icon={stat.icon} width={16} />
                        </Box>

                        <Typography
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: 1,
                            color: alpha('#ffffff', 0.45),
                          }}
                        >
                          {stat.code}
                        </Typography>
                      </Stack>

                      {/* Massive Glowing Stat Metric */}
                      <Typography
                        className="font-tr"
                        sx={{
                          fontSize: { xs: 26, sm: 32, md: 36 },
                          fontWeight: 900,
                          lineHeight: 1.1,
                          letterSpacing: 0.5,
                          background: `linear-gradient(180deg, #ffffff 10%, ${stat.tint} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: `drop-shadow(0 2px 10px ${alpha(stat.tint, 0.4)})`,
                          my: 0.5,
                        }}
                      >
                        {stat.value}
                      </Typography>

                      {/* Verbatim Stat Label */}
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          className="font-tr"
                          sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: 700,
                            color: isHovered ? '#ffffff' : alpha('#ffffff', 0.72),
                            lineHeight: 1.3,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            transition: 'color 0.25s ease',
                          }}
                        >
                          {stat.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 9,
                            fontFamily: 'monospace',
                            color: stat.tint,
                            fontWeight: 700,
                            letterSpacing: 1,
                            mt: 0.4,
                            opacity: isHovered ? 1 : 0.7,
                          }}
                        >
                          ● {stat.badge}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Bottom Telemetry Footer Strip */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  mt: 2.5,
                  pt: 1.8,
                  borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                }}
              >
                <Typography sx={{ fontFamily: 'monospace', fontSize: 10, color: alpha('#ffffff', 0.4) }}>
                  SYS_ID: BA-CORE-092 · 60FPS
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 10, color: accentColor, fontWeight: 700 }}>
                  SECURE PLATFORM ENCRYPTION
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
