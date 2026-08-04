import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';
const GOLD_SOFT = '#ffe08a';

/**
 * Performance rules for this overlay:
 * - Animate only transform + opacity (composited)
 * - Never animate CSS filter: blur() on large layers
 * - Prefer soft radial gradients over live blur
 */

const rayBreath = keyframes`
  0%, 100% { opacity: 0.2; transform: translate3d(0, 0, 0) scaleY(1); }
  50% { opacity: 0.4; transform: translate3d(0.6%, -0.6%, 0) scaleY(1.03); }
`;

const goldSweep = keyframes`
  0% { transform: translate3d(-60%, 0, 0) skewX(-16deg); opacity: 0; }
  14% { opacity: 0.55; }
  32% { opacity: 0.22; }
  48% { opacity: 0; }
  100% { transform: translate3d(160%, 0, 0) skewX(-16deg); opacity: 0; }
`;

const bokehDrift = keyframes`
  0% { transform: translate3d(0, 0, 0) scale(0.9); opacity: 0; }
  20% { opacity: var(--peak, 0.4); }
  75% { opacity: calc(var(--peak, 0.4) * 0.5); }
  100% { transform: translate3d(var(--dx), var(--dy), 0) scale(1.08); opacity: 0; }
`;

const vignettePulse = keyframes`
  0%, 100% { opacity: 0.75; }
  50% { opacity: 0.9; }
`;

const atmosphereShift = keyframes`
  0%, 100% { opacity: 0.4; transform: translate3d(0, 0, 0); }
  50% { opacity: 0.55; transform: translate3d(-1%, 0.4%, 0); }
`;

const moteFloat = keyframes`
  0% { transform: translate3d(0, 6px, 0); opacity: 0; }
  25% { opacity: 0.75; }
  100% { transform: translate3d(var(--dx), -36px, 0); opacity: 0; }
`;

const flarePulse = keyframes`
  0%, 100% { opacity: 0.28; transform: scale(0.94); }
  50% { opacity: 0.5; transform: scale(1.05); }
`;

const edgeGlow = keyframes`
  0%, 100% { opacity: 0.22; }
  50% { opacity: 0.5; }
`;

/** Fewer, softer orbs — gradient falloff only, no live blur */
const BOKEH = [
  { top: '20%', left: '14%', size: 140, dx: '28px', dy: '-36px', delay: '0s', duration: '16s', peak: 0.22, color: GOLD },
  { top: '36%', left: '70%', size: 160, dx: '-40px', dy: '-24px', delay: '2.5s', duration: '18s', peak: 0.18, color: GOLD_SOFT },
  { top: '62%', left: '28%', size: 110, dx: '22px', dy: '-48px', delay: '5s', duration: '15s', peak: 0.2, color: '#ffffff' },
  { top: '48%', left: '78%', size: 130, dx: '-28px', dy: '16px', delay: '1.2s', duration: '17s', peak: 0.16, color: GOLD },
] as const;

const MOTES = [
  { top: '28%', left: '20%', dx: '14px', delay: '0s', duration: '8s' },
  { top: '42%', left: '58%', dx: '-12px', delay: '1.5s', duration: '9s' },
  { top: '58%', left: '34%', dx: '18px', delay: '3s', duration: '7.5s' },
  { top: '36%', left: '82%', dx: '-14px', delay: '0.8s', duration: '10s' },
  { top: '68%', left: '64%', dx: '10px', delay: '4s', duration: '8.5s' },
] as const;

// ----------------------------------------------------------------------

/** Full-bleed cinematic FX — premium look, GPU-friendly motion only. */
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
        contain: 'strict',
        display: { xs: 'none', md: 'block' },
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: '-4%',
          background: `
            radial-gradient(ellipse 55% 40% at 32% 42%, ${alpha(GOLD, 0.12)} 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 72% 28%, ${alpha('#ffffff', 0.05)} 0%, transparent 55%)
          `,
          animation: `${atmosphereShift} 16s ease-in-out infinite`,
          willChange: 'transform, opacity',
        }}
      />

      {/* God rays — soft gradients only (no blur filter) */}
      <Box
        sx={{
          position: 'absolute',
          top: '-12%',
          left: '10%',
          width: '52%',
          height: '85%',
          background: `
            linear-gradient(168deg,
              ${alpha(GOLD_SOFT, 0.14)} 0%,
              ${alpha(GOLD, 0.05)} 30%,
              transparent 62%
            )
          `,
          clipPath: 'polygon(40% 0%, 60% 0%, 92% 100%, 8% 100%)',
          mixBlendMode: 'screen',
          animation: `${rayBreath} 10s ease-in-out infinite`,
          willChange: 'transform, opacity',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '-8%',
          left: '24%',
          width: '34%',
          height: '70%',
          background: `
            linear-gradient(172deg,
              ${alpha('#ffffff', 0.08)} 0%,
              ${alpha(GOLD, 0.04)} 38%,
              transparent 68%
            )
          `,
          clipPath: 'polygon(44% 0%, 56% 0%, 85% 100%, 15% 100%)',
          mixBlendMode: 'screen',
          animation: `${rayBreath} 12s ease-in-out infinite`,
          animationDelay: '2s',
          willChange: 'transform, opacity',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '30%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `
            radial-gradient(circle,
              ${alpha('#ffffff', 0.35)} 0%,
              ${alpha(GOLD_SOFT, 0.16)} 28%,
              ${alpha(GOLD, 0.05)} 52%,
              transparent 72%
            )
          `,
          mixBlendMode: 'screen',
          animation: `${flarePulse} 7s ease-in-out infinite`,
          willChange: 'transform, opacity',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '-8%',
          left: 0,
          width: '28%',
          height: '115%',
          background: `linear-gradient(90deg,
            transparent 0%,
            ${alpha('#ffffff', 0.02)} 32%,
            ${alpha(GOLD, 0.16)} 50%,
            ${alpha(GOLD_SOFT, 0.08)} 58%,
            transparent 100%)`,
          mixBlendMode: 'screen',
          animation: `${goldSweep} 12s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          animationDelay: '1.5s',
          willChange: 'transform, opacity',
        }}
      />

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
            // Soft edge via gradient — avoids animated blur()
            background: `radial-gradient(circle, ${alpha(orb.color, 0.45)} 0%, ${alpha(orb.color, 0.12)} 35%, transparent 70%)`,
            mixBlendMode: 'screen',
            '--dx': orb.dx,
            '--dy': orb.dy,
            '--peak': orb.peak,
            animation: `${bokehDrift} ${orb.duration} ${orb.delay} ease-in-out infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

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
            bgcolor: alpha('#ffffff', 0.85),
            boxShadow: `0 0 5px ${alpha(GOLD, 0.55)}`,
            '--dx': mote.dx,
            animation: `${moteFloat} ${mote.duration} ${mote.delay} ease-in-out infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 72% 62% at 38% 45%, transparent 38%, ${alpha('#000000', 0.48)} 100%),
            linear-gradient(90deg, ${alpha('#000000', 0.12)} 0%, transparent 30%, transparent 72%, ${alpha('#000000', 0.24)} 100%)
          `,
          animation: `${vignettePulse} 12s ease-in-out infinite`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: '18%',
          right: '18%',
          bottom: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.5)}, transparent)`,
          boxShadow: `0 0 18px ${alpha(GOLD, 0.28)}`,
          animation: `${edgeGlow} 6s ease-in-out infinite`,
        }}
      />
    </Box>
  );
}
