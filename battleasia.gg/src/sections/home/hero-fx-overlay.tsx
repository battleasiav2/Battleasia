import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';
const GOLD_SOFT = '#ffe08a';

/** Slow volumetric beams breathing through the scene */
const rayBreath = keyframes`
  0%, 100% { opacity: 0.18; transform: translate3d(0, 0, 0) scaleY(1); }
  50% { opacity: 0.42; transform: translate3d(1%, -1%, 0) scaleY(1.04); }
`;

/** Wide gold light sweep — premium brand flash */
const goldSweep = keyframes`
  0% { transform: translateX(-60%) skewX(-18deg); opacity: 0; }
  12% { opacity: 0.7; }
  28% { opacity: 0.35; }
  45% { opacity: 0; }
  100% { transform: translateX(160%) skewX(-18deg); opacity: 0; }
`;

/** Soft bokeh orbs drifting across depth */
const bokehDrift = keyframes`
  0% { transform: translate3d(0, 0, 0) scale(0.85); opacity: 0; }
  18% { opacity: var(--peak, 0.55); }
  70% { opacity: calc(var(--peak, 0.55) * 0.55); }
  100% { transform: translate3d(var(--dx), var(--dy), 0) scale(1.15); opacity: 0; }
`;

/** Cinematic vignette — draws eye to subject */
const vignettePulse = keyframes`
  0%, 100% { opacity: 0.72; }
  50% { opacity: 0.92; }
`;

/** Horizon heat / atmosphere shimmer */
const atmosphereShift = keyframes`
  0%, 100% { opacity: 0.35; transform: translate3d(0, 0, 0); }
  50% { opacity: 0.55; transform: translate3d(-1.5%, 0.5%, 0); }
`;

/** Fine dust motes catching light */
const moteFloat = keyframes`
  0% { transform: translate3d(0, 8px, 0); opacity: 0; }
  20% { opacity: 0.85; }
  80% { opacity: 0.4; }
  100% { transform: translate3d(var(--dx), -40px, 0); opacity: 0; }
`;

/** Soft lens flare pulse near light source */
const flarePulse = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.92); }
  50% { opacity: 0.55; transform: scale(1.08); }
`;

/** Edge light crawl — subtle premium frame */
const edgeGlow = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.55; }
`;

const BOKEH = [
  { top: '18%', left: '12%', size: 90, dx: '40px', dy: '-50px', delay: '0s', duration: '14s', peak: 0.28, color: GOLD },
  { top: '32%', left: '68%', size: 120, dx: '-55px', dy: '-30px', delay: '2s', duration: '16s', peak: 0.22, color: GOLD_SOFT },
  { top: '58%', left: '22%', size: 70, dx: '30px', dy: '-70px', delay: '4s', duration: '13s', peak: 0.3, color: '#ffffff' },
  { top: '45%', left: '80%', size: 100, dx: '-40px', dy: '20px', delay: '1s', duration: '15s', peak: 0.2, color: GOLD },
  { top: '70%', left: '48%', size: 80, dx: '25px', dy: '-55px', delay: '3.5s', duration: '12s', peak: 0.25, color: GOLD_SOFT },
  { top: '22%', left: '42%', size: 55, dx: '-20px', dy: '35px', delay: '5s', duration: '11s', peak: 0.32, color: '#ffffff' },
] as const;

const MOTES = [
  { top: '25%', left: '18%', dx: '18px', delay: '0s', duration: '7s' },
  { top: '40%', left: '55%', dx: '-14px', delay: '1.2s', duration: '8s' },
  { top: '55%', left: '30%', dx: '22px', delay: '2.4s', duration: '6.5s' },
  { top: '35%', left: '78%', dx: '-18px', delay: '0.6s', duration: '9s' },
  { top: '62%', left: '62%', dx: '12px', delay: '3.1s', duration: '7.5s' },
  { top: '28%', left: '88%', dx: '-10px', delay: '4s', duration: '8.5s' },
  { top: '72%', left: '12%', dx: '16px', delay: '1.8s', duration: '10s' },
  { top: '48%', left: '42%', dx: '-20px', delay: '5s', duration: '7s' },
] as const;

// ----------------------------------------------------------------------

/**
 * Full-bleed cinematic FX for the home hero — volumetric light, gold sweep,
 * soft bokeh, and atmosphere. Desktop-first; skipped on phones / reduced motion.
 */
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
        display: { xs: 'none', md: 'block' },
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {/* Warm atmospheric wash over the drop zone */}
      <Box
        sx={{
          position: 'absolute',
          inset: '-5%',
          background: `
            radial-gradient(ellipse 55% 40% at 32% 42%, ${alpha(GOLD, 0.14)} 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 72% 28%, ${alpha('#ffffff', 0.06)} 0%, transparent 55%)
          `,
          animation: `${atmosphereShift} 14s ease-in-out infinite`,
        }}
      />

      {/* Volumetric god rays from upper sky */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '8%',
          width: '55%',
          height: '90%',
          background: `
            linear-gradient(168deg,
              ${alpha(GOLD_SOFT, 0.16)} 0%,
              ${alpha(GOLD, 0.06)} 28%,
              transparent 58%
            )
          `,
          clipPath: 'polygon(38% 0%, 62% 0%, 95% 100%, 5% 100%)',
          filter: 'blur(2px)',
          mixBlendMode: 'screen',
          animation: `${rayBreath} 9s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '22%',
          width: '38%',
          height: '75%',
          background: `
            linear-gradient(172deg,
              ${alpha('#ffffff', 0.1)} 0%,
              ${alpha(GOLD, 0.05)} 35%,
              transparent 65%
            )
          `,
          clipPath: 'polygon(42% 0%, 58% 0%, 88% 100%, 12% 100%)',
          filter: 'blur(3px)',
          mixBlendMode: 'screen',
          animation: `${rayBreath} 11s ease-in-out infinite`,
          animationDelay: '1.8s',
        }}
      />

      {/* Soft lens flare near parachute / sky light */}
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          left: '28%',
          width: { md: 180, lg: 220 },
          height: { md: 180, lg: 220 },
          borderRadius: '50%',
          background: `
            radial-gradient(circle,
              ${alpha('#ffffff', 0.45)} 0%,
              ${alpha(GOLD_SOFT, 0.22)} 22%,
              ${alpha(GOLD, 0.08)} 45%,
              transparent 70%
            )
          `,
          mixBlendMode: 'screen',
          animation: `${flarePulse} 6.5s ease-in-out infinite`,
        }}
      />

      {/* Signature gold brand sweep */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: 0,
          width: '32%',
          height: '120%',
          background: `linear-gradient(90deg,
            transparent 0%,
            ${alpha('#ffffff', 0.03)} 30%,
            ${alpha(GOLD, 0.2)} 48%,
            ${alpha(GOLD_SOFT, 0.12)} 55%,
            ${alpha('#ffffff', 0.04)} 70%,
            transparent 100%)`,
          filter: 'blur(14px)',
          mixBlendMode: 'screen',
          animation: `${goldSweep} 11s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          animationDelay: '1.2s',
        }}
      />

      {/* Large soft bokeh — depth & luxury */}
      {BOKEH.map((orb, i) => (
        <Box
          key={`bokeh-${i}`}
          sx={{
            position: 'absolute',
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(orb.color, 0.55)} 0%, transparent 68%)`,
            filter: 'blur(18px)',
            mixBlendMode: 'screen',
            '--dx': orb.dx,
            '--dy': orb.dy,
            '--peak': orb.peak,
            animation: `${bokehDrift} ${orb.duration} ${orb.delay} ease-in-out infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Fine light motes */}
      {MOTES.map((mote, i) => (
        <Box
          key={`mote-${i}`}
          sx={{
            position: 'absolute',
            top: mote.top,
            left: mote.left,
            width: 2,
            height: 2,
            borderRadius: '50%',
            bgcolor: alpha('#ffffff', 0.9),
            boxShadow: `0 0 6px ${alpha(GOLD, 0.7)}, 0 0 12px ${alpha(GOLD_SOFT, 0.35)}`,
            '--dx': mote.dx,
            animation: `${moteFloat} ${mote.duration} ${mote.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Cinematic vignette */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 72% 62% at 38% 45%, transparent 35%, ${alpha('#000000', 0.5)} 100%),
            linear-gradient(90deg, ${alpha('#000000', 0.15)} 0%, transparent 28%, transparent 70%, ${alpha('#000000', 0.28)} 100%)
          `,
          animation: `${vignettePulse} 10s ease-in-out infinite`,
        }}
      />

      {/* Subtle bottom gold rim light */}
      <Box
        sx={{
          position: 'absolute',
          left: '15%',
          right: '15%',
          bottom: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.55)}, transparent)`,
          boxShadow: `0 0 24px ${alpha(GOLD, 0.35)}`,
          animation: `${edgeGlow} 5s ease-in-out infinite`,
        }}
      />
    </Box>
  );
}
