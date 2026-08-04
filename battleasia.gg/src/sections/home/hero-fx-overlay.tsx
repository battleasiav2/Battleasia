import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';
const CYAN = '#38bdf8';

const streakShoot = keyframes`
  0% { transform: translateX(-40%) translateY(12%) rotate(-16deg); opacity: 0; }
  18% { opacity: 0.65; }
  100% { transform: translateX(125vw) translateY(-28%) rotate(-16deg); opacity: 0; }
`;

const radarPulse = keyframes`
  0% { transform: scale(0.3); opacity: 0.45; }
  70% { opacity: 0.12; }
  100% { transform: scale(1.7); opacity: 0; }
`;

const orbFloat = keyframes`
  0% { transform: translate3d(0, 10vh, 0) scale(0.6); opacity: 0; }
  15% { opacity: 0.75; }
  70% { opacity: 0.4; }
  100% { transform: translate3d(var(--drift), -105vh, 0) scale(1.1); opacity: 0; }
`;

const sparkTwinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.4); }
  40% { opacity: 0.9; transform: scale(1.15); }
  70% { opacity: 0.3; transform: scale(0.8); }
`;

const bracketPulse = keyframes`
  0%, 100% { opacity: 0.28; border-color: ${alpha(GOLD, 0.28)}; }
  50% { opacity: 0.8; border-color: ${alpha(GOLD, 0.7)}; }
`;

const reticleSpin = keyframes`
  0% { transform: rotate(0deg); opacity: 0.18; }
  50% { opacity: 0.42; }
  100% { transform: rotate(360deg); opacity: 0.18; }
`;

const glowBreath = keyframes`
  0%, 100% { opacity: 0.22; }
  50% { opacity: 0.48; }
`;

const gridScroll = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 48px; }
`;

/** Soft premium light flare drifting across the scene */
const lightFlare = keyframes`
  0% { transform: translateX(-40%) rotate(18deg); opacity: 0; }
  20% { opacity: 0.55; }
  50% { opacity: 0.35; }
  80% { opacity: 0.5; }
  100% { transform: translateX(120%) rotate(18deg); opacity: 0; }
`;

/** Subtle vignette pulse — cinematic depth */
const vignettePulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.85; }
`;

const dustDrift = keyframes`
  0% { transform: translate3d(0, 0, 0); opacity: 0; }
  20% { opacity: 0.6; }
  80% { opacity: 0.35; }
  100% { transform: translate3d(var(--dx), var(--dy), 0); opacity: 0; }
`;

const ENERGY_ORBS = [
  { left: '6%', size: 8, delay: '0s', duration: '12s', drift: '22px', color: GOLD },
  { left: '16%', size: 13, delay: '1.4s', duration: '15s', drift: '-18px', color: CYAN },
  { left: '27%', size: 7, delay: '3.2s', duration: '11s', drift: '28px', color: GOLD },
  { left: '39%', size: 16, delay: '0.6s', duration: '17s', drift: '-12px', color: '#ffffff' },
  { left: '52%', size: 9, delay: '4.5s', duration: '13s', drift: '20px', color: GOLD },
  { left: '64%', size: 14, delay: '2s', duration: '16s', drift: '-24px', color: CYAN },
  { left: '74%', size: 8, delay: '5.8s', duration: '12s', drift: '16px', color: GOLD },
  { left: '84%', size: 11, delay: '1s', duration: '14s', drift: '-20px', color: '#ffffff' },
  { left: '93%', size: 8, delay: '3.8s', duration: '13s', drift: '14px', color: CYAN },
  { left: '48%', size: 10, delay: '6.2s', duration: '15s', drift: '18px', color: '#ffffff' },
] as const;

const SPARKS = [
  { top: '18%', left: '12%', delay: '0s' },
  { top: '28%', left: '72%', delay: '1.2s' },
  { top: '42%', left: '38%', delay: '2.4s' },
  { top: '55%', left: '86%', delay: '0.8s' },
  { top: '68%', left: '22%', delay: '3.1s' },
  { top: '22%', left: '54%', delay: '4s' },
  { top: '75%', left: '64%', delay: '1.7s' },
] as const;

const STREAKS = [
  { top: '28%', delay: '1.5s', duration: '6.5s', color: GOLD },
  { top: '58%', delay: '4.5s', duration: '7s', color: CYAN },
] as const;

const DUST = [
  { top: '30%', left: '20%', dx: '40px', dy: '-60px', delay: '0s', duration: '9s' },
  { top: '45%', left: '70%', dx: '-35px', dy: '-50px', delay: '2s', duration: '11s' },
  { top: '60%', left: '40%', dx: '28px', dy: '-70px', delay: '4s', duration: '10s' },
  { top: '25%', left: '85%', dx: '-22px', dy: '-45px', delay: '1s', duration: '8s' },
  { top: '70%', left: '15%', dx: '32px', dy: '-55px', delay: '3.5s', duration: '12s' },
] as const;

function cornerBracket(position: 'tl' | 'tr' | 'bl' | 'br') {
  const base = {
    position: 'absolute' as const,
    width: { xs: 32, md: 48 },
    height: { xs: 32, md: 48 },
    borderColor: alpha(GOLD, 0.5),
    animation: `${bracketPulse} 3.6s ease-in-out infinite`,
    pointerEvents: 'none' as const,
  };

  if (position === 'tl') {
    return { ...base, top: { xs: 12, md: 20 }, left: { xs: 12, md: 20 }, borderTop: '2px solid', borderLeft: '2px solid' };
  }
  if (position === 'tr') {
    return { ...base, top: { xs: 12, md: 20 }, right: { xs: 12, md: 20 }, borderTop: '2px solid', borderRight: '2px solid', animationDelay: '0.4s' };
  }
  if (position === 'bl') {
    return { ...base, bottom: { xs: 12, md: 20 }, left: { xs: 12, md: 20 }, borderBottom: '2px solid', borderLeft: '2px solid', animationDelay: '0.8s' };
  }
  return { ...base, bottom: { xs: 12, md: 20 }, right: { xs: 12, md: 20 }, borderBottom: '2px solid', borderRight: '2px solid', animationDelay: '1.2s' };
}

// ----------------------------------------------------------------------

/** Full-bleed gaming FX overlay for the home hero image only. */
export function HeroFxOverlay() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
        // Phones: skip continuous FX — biggest source of hero jank
        display: { xs: 'none', md: 'block' },
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {/* Soft tactical grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: `
            linear-gradient(${alpha(GOLD, 0.3)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(GOLD, 0.2)} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
          animation: `${gridScroll} 12s linear infinite`,
        }}
      />

      {/* Cinematic vignette pulse */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 75% 65% at 50% 45%, transparent 40%, ${alpha('#000000', 0.45)} 100%)`,
          animation: `${vignettePulse} 8s ease-in-out infinite`,
        }}
      />

      {/* Premium soft light flare (replaces hard scan bar) */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: 0,
          width: { xs: '35%', md: '28%' },
          height: '140%',
          background: `linear-gradient(90deg,
            transparent 0%,
            ${alpha('#ffffff', 0.04)} 35%,
            ${alpha(GOLD, 0.12)} 50%,
            ${alpha('#ffffff', 0.05)} 65%,
            transparent 100%)`,
          filter: 'blur(10px)',
          animation: `${lightFlare} 18s ease-in-out infinite`,
        }}
      />

      {/* Breathing gold/cyan glow pockets */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 180, md: 240 },
          height: { xs: 180, md: 240 },
          top: '12%',
          left: '8%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(GOLD, 0.18)} 0%, transparent 70%)`,
          // Avoid nested CSS filters (blur + animated opacity = expensive)
          animation: `${glowBreath} 7s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 160, md: 200 },
          height: { xs: 160, md: 200 },
          bottom: '18%',
          right: '10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(CYAN, 0.12)} 0%, transparent 70%)`,
          animation: `${glowBreath} 9s ease-in-out infinite`,
          animationDelay: '1.5s',
        }}
      />

      {/* Soft diagonal energy streaks (fewer, slower) */}
      {STREAKS.map((streak, i) => (
        <Box
          key={`streak-${i}`}
          sx={{
            position: 'absolute',
            top: streak.top,
            left: 0,
            width: { xs: 100, md: 150 },
            height: 1.5,
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${alpha(streak.color, 0.85)}, transparent)`,
            boxShadow: `0 0 12px ${alpha(streak.color, 0.45)}`,
            animation: `${streakShoot} ${streak.duration} ${streak.delay} infinite linear`,
          }}
        />
      ))}

      {/* Floating dust motes */}
      {DUST.map((dust, i) => (
        <Box
          key={`dust-${i}`}
          sx={{
            position: 'absolute',
            top: dust.top,
            left: dust.left,
            width: 2,
            height: 2,
            borderRadius: '50%',
            bgcolor: alpha('#ffffff', 0.7),
            boxShadow: `0 0 6px ${alpha(GOLD, 0.4)}`,
            '--dx': dust.dx,
            '--dy': dust.dy,
            animation: `${dustDrift} ${dust.duration} ${dust.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Radar rings — softer */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: '6%', md: '14%' },
          top: { xs: '28%', md: '32%' },
          width: { xs: 120, md: 200 },
          height: { xs: 120, md: 200 },
          opacity: 0.75,
        }}
      >
        {[0, 1, 2].map((ring) => (
          <Box
            key={`radar-${ring}`}
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `1px solid ${alpha(GOLD, 0.35)}`,
              boxShadow: `inset 0 0 16px ${alpha(GOLD, 0.06)}`,
              animation: `${radarPulse} 5s ease-out infinite`,
              animationDelay: `${ring * 1.65}s`,
            }}
          />
        ))}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: { xs: 42, md: 56 },
            height: { xs: 42, md: 56 },
            ml: { xs: '-21px', md: '-28px' },
            mt: { xs: '-21px', md: '-28px' },
            borderRadius: '50%',
            border: `1px dashed ${alpha(CYAN, 0.4)}`,
            animation: `${reticleSpin} 16s linear infinite`,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              background: alpha(GOLD, 0.4),
            },
            '&::before': {
              left: '50%',
              top: 4,
              bottom: 4,
              width: 1,
              ml: '-0.5px',
            },
            '&::after': {
              top: '50%',
              left: 4,
              right: 4,
              height: 1,
              mt: '-0.5px',
            },
          }}
        />
      </Box>

      {/* Rising energy orbs */}
      {ENERGY_ORBS.map((orb, index) => (
        <Box
          key={`orb-${index}`}
          sx={{
            position: 'absolute',
            left: orb.left,
            bottom: '-6%',
            width: orb.size,
            height: orb.size,
            '--drift': orb.drift,
            animation: `${orbFloat} ${orb.duration} ${orb.delay} infinite linear`,
            willChange: 'transform, opacity',
          }}
        >
          <Box
            sx={{
              width: 1,
              height: 1,
              borderRadius: '50%',
              border: `1px solid ${alpha(orb.color, 0.5)}`,
              background: `radial-gradient(circle at 32% 28%, ${alpha('#ffffff', 0.65)} 0%, ${alpha(orb.color, 0.3)} 42%, ${alpha(orb.color, 0.04)} 100%)`,
              boxShadow: `0 0 12px ${alpha(orb.color, 0.4)}, 0 0 24px ${alpha(orb.color, 0.14)}`,
            }}
          />
        </Box>
      ))}

      {/* Twinkling sparks */}
      {SPARKS.map((spark, i) => (
        <Box
          key={`spark-${i}`}
          sx={{
            position: 'absolute',
            top: spark.top,
            left: spark.left,
            width: 2.5,
            height: 2.5,
            borderRadius: '50%',
            bgcolor: GOLD,
            boxShadow: `0 0 8px ${GOLD}, 0 0 14px ${alpha(GOLD, 0.5)}`,
            animation: `${sparkTwinkle} 3.2s ${spark.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* HUD corner brackets */}
      <Box sx={cornerBracket('tl')} />
      <Box sx={cornerBracket('tr')} />
      <Box sx={cornerBracket('bl')} />
      <Box sx={cornerBracket('br')} />
    </Box>
  );
}
