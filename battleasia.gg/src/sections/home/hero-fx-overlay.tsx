import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';
const GOLD_SOFT = '#ffe08a';
const LIVE_GREEN = '#22c55e';
const FIRE_ORANGE = '#ff6a12';
const FIRE_CORE = '#ff3b00';
const FIRE_TIP = '#ffd56a';

/**
 * Performance rules for this overlay:
 * - Animate only transform + opacity (composited)
 * - Never animate CSS filter: blur() on large layers
 * - Prefer soft radial gradients over live blur
 * - Mobile: fewer layers; desktop: richer but still CSS-only
 * - Lazy-loaded from home view — never blocks LCP
 */

const rayBreath = keyframes`
  0%, 100% { opacity: 0.18; transform: translate3d(0, 0, 0) scaleY(1); }
  50% { opacity: 0.36; transform: translate3d(0.5%, -0.5%, 0) scaleY(1.025); }
`;

const goldSweep = keyframes`
  0% { transform: translate3d(-60%, 0, 0) skewX(-16deg); opacity: 0; }
  14% { opacity: 0.5; }
  32% { opacity: 0.2; }
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
  0%, 100% { opacity: 0.72; }
  50% { opacity: 0.88; }
`;

const atmosphereShift = keyframes`
  0%, 100% { opacity: 0.38; transform: translate3d(0, 0, 0); }
  50% { opacity: 0.52; transform: translate3d(-0.8%, 0.3%, 0); }
`;

const moteFloat = keyframes`
  0% { transform: translate3d(0, 6px, 0); opacity: 0; }
  25% { opacity: 0.7; }
  100% { transform: translate3d(var(--dx), -36px, 0); opacity: 0; }
`;

const flarePulse = keyframes`
  0%, 100% { opacity: 0.26; transform: scale(0.94); }
  50% { opacity: 0.48; transform: scale(1.04); }
`;

const edgeGlow = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.48; }
`;

/** Soft radar / scan sweep — gaming HUD feel, GPU cheap */
const scanSweep = keyframes`
  0% { transform: translate3d(-30%, 0, 0); opacity: 0; }
  12% { opacity: 0.55; }
  45% { opacity: 0.2; }
  60%, 100% { transform: translate3d(130%, 0, 0); opacity: 0; }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.72); }
`;

const liveRing = keyframes`
  0% { opacity: 0.55; transform: scale(0.85); }
  70% { opacity: 0; transform: scale(1.55); }
  100% { opacity: 0; transform: scale(1.55); }
`;

const bracketPulse = keyframes`
  0%, 100% { opacity: 0.28; }
  50% { opacity: 0.72; }
`;

const emberRise = keyframes`
  0% { transform: translate3d(0, 0, 0) scale(0.55); opacity: 0; }
  12% { opacity: 0.9; }
  100% { transform: translate3d(var(--dx), var(--rise, -220px), 0) scale(0.35); opacity: 0; }
`;

const fireBedPulse = keyframes`
  0%, 100% { opacity: 0.55; transform: translate3d(0, 0, 0) scaleY(1); }
  50% { opacity: 0.85; transform: translate3d(0, -2%, 0) scaleY(1.08); }
`;

const flameLick = keyframes`
  0% { transform: translate3d(0, 18%, 0) scaleY(0.72) scaleX(0.92); opacity: 0; }
  14% { opacity: var(--peak, 0.7); }
  55% { opacity: calc(var(--peak, 0.7) * 0.55); }
  100% { transform: translate3d(var(--dx), -42%, 0) scaleY(1.18) scaleX(0.78); opacity: 0; }
`;

/** Fewer, softer orbs — gradient falloff only, no live blur */
const BOKEH = [
  { top: '20%', left: '14%', size: 140, dx: '28px', dy: '-36px', delay: '0s', duration: '16s', peak: 0.2, color: GOLD },
  { top: '36%', left: '70%', size: 160, dx: '-40px', dy: '-24px', delay: '2.5s', duration: '18s', peak: 0.16, color: GOLD_SOFT },
  { top: '62%', left: '28%', size: 110, dx: '22px', dy: '-48px', delay: '5s', duration: '15s', peak: 0.18, color: '#ffffff' },
] as const;

const MOTES = [
  { top: '28%', left: '20%', dx: '14px', delay: '0s', duration: '8s' },
  { top: '42%', left: '58%', dx: '-12px', delay: '1.5s', duration: '9s' },
  { top: '58%', left: '34%', dx: '18px', delay: '3s', duration: '7.5s' },
  { top: '36%', left: '82%', dx: '-14px', delay: '0.8s', duration: '10s' },
] as const;

const EMBERS = [
  { left: '8%', delay: '0s', duration: '4.2s', dx: '10px', size: 3, rise: '-240px' },
  { left: '18%', delay: '0.7s', duration: '5s', dx: '-14px', size: 2, rise: '-280px' },
  { left: '32%', delay: '1.4s', duration: '4.6s', dx: '16px', size: 3, rise: '-260px' },
  { left: '46%', delay: '0.3s', duration: '3.8s', dx: '-8px', size: 2, rise: '-220px' },
  { left: '58%', delay: '1.1s', duration: '4.8s', dx: '12px', size: 4, rise: '-300px' },
  { left: '72%', delay: '0.9s', duration: '5.2s', dx: '-16px', size: 2, rise: '-250px' },
  { left: '84%', delay: '1.8s', duration: '4.4s', dx: '8px', size: 3, rise: '-270px' },
  { left: '92%', delay: '0.5s', duration: '5.4s', dx: '-10px', size: 2, rise: '-230px' },
] as const;

const FLAMES = [
  { left: '6%', width: 72, height: 160, delay: '0s', duration: '2.4s', dx: '8px', peak: 0.55 },
  { left: '22%', width: 96, height: 210, delay: '0.4s', duration: '2.8s', dx: '-10px', peak: 0.7 },
  { left: '38%', width: 80, height: 180, delay: '0.9s', duration: '2.2s', dx: '12px', peak: 0.62 },
  { left: '52%', width: 110, height: 230, delay: '0.2s', duration: '3s', dx: '-8px', peak: 0.75 },
  { left: '68%', width: 88, height: 190, delay: '0.7s', duration: '2.5s', dx: '10px', peak: 0.58 },
  { left: '82%', width: 74, height: 165, delay: '1.1s', duration: '2.7s', dx: '-12px', peak: 0.5 },
] as const;

function cornerBracket(position: 'tl' | 'tr' | 'bl' | 'br') {
  const base = {
    position: 'absolute' as const,
    width: { xs: 18, md: 28 },
    height: { xs: 18, md: 28 },
    borderColor: alpha(GOLD, 0.55),
    animation: `${bracketPulse} 3.2s ease-in-out infinite`,
    pointerEvents: 'none' as const,
  };
  if (position === 'tl') return { ...base, top: { xs: 10, md: 18 }, left: { xs: 10, md: 18 }, borderTop: '1.5px solid', borderLeft: '1.5px solid' };
  if (position === 'tr') return { ...base, top: { xs: 10, md: 18 }, right: { xs: 10, md: 18 }, borderTop: '1.5px solid', borderRight: '1.5px solid', animationDelay: '0.4s' };
  if (position === 'bl') return { ...base, bottom: { xs: 10, md: 18 }, left: { xs: 10, md: 18 }, borderBottom: '1.5px solid', borderLeft: '1.5px solid', animationDelay: '0.8s' };
  return { ...base, bottom: { xs: 10, md: 18 }, right: { xs: 10, md: 18 }, borderBottom: '1.5px solid', borderRight: '1.5px solid', animationDelay: '1.2s' };
}

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
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {/* Atmosphere — all breakpoints, very light */}
      <Box
        sx={{
          position: 'absolute',
          inset: '-4%',
          background: `
            radial-gradient(ellipse 55% 40% at 32% 42%, ${alpha(GOLD, 0.1)} 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 72% 28%, ${alpha('#ffffff', 0.04)} 0%, transparent 55%)
          `,
          animation: `${atmosphereShift} 16s ease-in-out infinite`,
          willChange: 'transform, opacity',
        }}
      />

      {/* Live HUD pill — top-left gaming “live” cue */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 14, md: 22 },
          left: { xs: 14, md: 24 },
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1,
          py: 0.4,
          borderRadius: 0.5,
          bgcolor: alpha('#000000', 0.55),
          border: `1px solid ${alpha(GOLD, 0.28)}`,
        }}
      >
        <Box sx={{ position: 'relative', width: 8, height: 8 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              bgcolor: LIVE_GREEN,
              boxShadow: `0 0 8px ${alpha(LIVE_GREEN, 0.85)}`,
              animation: `${livePulse} 1.6s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              border: `1px solid ${alpha(LIVE_GREEN, 0.7)}`,
              animation: `${liveRing} 1.6s ease-out infinite`,
            }}
          />
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: { xs: 9, md: 10 },
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: alpha('#ffffff', 0.88),
            lineHeight: 1,
          }}
        >
          Live Arena
        </Box>
      </Box>

      {/* Corner HUD brackets */}
      <Box sx={cornerBracket('tl')} />
      <Box sx={cornerBracket('tr')} />
      <Box sx={cornerBracket('bl')} />
      <Box sx={cornerBracket('br')} />

      {/* Horizontal scan sweep — tournament HUD vibe */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '38%', md: '42%' },
          left: 0,
          width: '22%',
          height: { xs: 1, md: 1.5 },
          background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.55)}, ${alpha('#ffffff', 0.35)}, transparent)`,
          boxShadow: `0 0 12px ${alpha(GOLD, 0.25)}`,
          animation: `${scanSweep} 7.5s 1.2s ease-in-out infinite`,
          willChange: 'transform, opacity',
        }}
      />

      {/* Fire bed — rising flames + sparks (CSS only) */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: { xs: '42%', md: '48%' },
          overflow: 'hidden',
          mixBlendMode: 'screen',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '-8%',
            right: '-8%',
            bottom: '-18%',
            height: { xs: '70%', md: '78%' },
            background: `
              radial-gradient(ellipse 80% 70% at 50% 100%, ${alpha(FIRE_CORE, 0.42)} 0%, transparent 62%),
              radial-gradient(ellipse 50% 55% at 28% 100%, ${alpha(FIRE_ORANGE, 0.32)} 0%, transparent 58%),
              radial-gradient(ellipse 46% 52% at 74% 100%, ${alpha(FIRE_TIP, 0.22)} 0%, transparent 55%)
            `,
            animation: `${fireBedPulse} 2.4s ease-in-out infinite`,
            willChange: 'transform, opacity',
          }}
        />

        {FLAMES.map((flame, i) => (
          <Box
            key={`flame-${i}`}
            sx={{
              position: 'absolute',
              left: flame.left,
              bottom: '-6%',
              width: { xs: flame.width * 0.72, md: flame.width },
              height: { xs: flame.height * 0.78, md: flame.height },
              borderRadius: '50% 50% 42% 42%',
              background: `
                radial-gradient(ellipse 70% 90% at 50% 88%,
                  ${alpha(FIRE_TIP, 0.85)} 0%,
                  ${alpha(FIRE_ORANGE, 0.55)} 28%,
                  ${alpha(FIRE_CORE, 0.28)} 58%,
                  transparent 78%
                )
              `,
              '--dx': flame.dx,
              '--peak': flame.peak,
              animation: `${flameLick} ${flame.duration} ${flame.delay} ease-out infinite`,
              willChange: 'transform, opacity',
              display: { xs: i % 2 === 0 ? 'block' : 'none', md: 'block' },
            }}
          />
        ))}
      </Box>

      {/* Sparks rising from fire */}
      {EMBERS.map((ember, i) => (
        <Box
          key={`ember-${i}`}
          sx={{
            position: 'absolute',
            left: ember.left,
            bottom: { xs: '10%', md: '12%' },
            width: ember.size,
            height: ember.size,
            borderRadius: '50%',
            bgcolor: i % 2 === 0 ? FIRE_TIP : FIRE_ORANGE,
            boxShadow: `0 0 8px ${alpha(FIRE_ORANGE, 0.8)}`,
            '--dx': ember.dx,
            '--rise': ember.rise,
            animation: `${emberRise} ${ember.duration} ${ember.delay} infinite linear`,
            willChange: 'transform, opacity',
            display: { xs: i < 5 ? 'block' : 'none', md: 'block' },
          }}
        />
      ))}

      {/* Desktop-only richer layers */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', inset: 0 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '-12%',
            left: '10%',
            width: '52%',
            height: '85%',
            background: `
              linear-gradient(168deg,
                ${alpha(GOLD_SOFT, 0.12)} 0%,
                ${alpha(GOLD, 0.04)} 30%,
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
                ${alpha('#ffffff', 0.07)} 0%,
                ${alpha(GOLD, 0.035)} 38%,
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
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `
              radial-gradient(circle,
                ${alpha('#ffffff', 0.3)} 0%,
                ${alpha(GOLD_SOFT, 0.14)} 28%,
                ${alpha(GOLD, 0.04)} 52%,
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
            width: '26%',
            height: '115%',
            background: `linear-gradient(90deg,
              transparent 0%,
              ${alpha('#ffffff', 0.02)} 32%,
              ${alpha(GOLD, 0.14)} 50%,
              ${alpha(GOLD_SOFT, 0.07)} 58%,
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
              background: `radial-gradient(circle, ${alpha(orb.color, 0.4)} 0%, ${alpha(orb.color, 0.1)} 35%, transparent 70%)`,
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
              radial-gradient(ellipse 72% 62% at 38% 45%, transparent 38%, ${alpha('#000000', 0.42)} 100%),
              linear-gradient(90deg, ${alpha('#000000', 0.1)} 0%, transparent 30%, transparent 72%, ${alpha('#000000', 0.2)} 100%)
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
            background: `linear-gradient(90deg, transparent, ${alpha(GOLD, 0.45)}, transparent)`,
            boxShadow: `0 0 16px ${alpha(GOLD, 0.25)}`,
            animation: `${edgeGlow} 6s ease-in-out infinite`,
          }}
        />
      </Box>
    </Box>
  );
}
