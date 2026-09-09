import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const scanLaser = keyframes`
  0% { transform: translateY(-10%); opacity: 0; }
  15% { opacity: 0.8; }
  85% { opacity: 0.8; }
  100% { transform: translateY(110%); opacity: 0; }
`;

const reticleRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const reticlePulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.45; }
  50% { transform: scale(1.08); opacity: 0.85; }
`;

const fireflyDrift = keyframes`
  0% {
    transform: translate3d(0, 0, 0) scale(0.8);
    opacity: 0.1;
  }
  25% {
    opacity: var(--peak, 0.7);
  }
  50% {
    transform: translate3d(var(--dx, 20px), var(--dy, -30px), 15px) scale(1.2);
    opacity: var(--peak, 0.7);
  }
  75% {
    opacity: calc(var(--peak, 0.7) * 0.5);
  }
  100% {
    transform: translate3d(calc(var(--dx, 20px) * 1.8), calc(var(--dy, -30px) * 1.8), 30px) scale(0.9);
    opacity: 0;
  }
`;

const gridScroll = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 60px; }
`;

const bracketPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
`;

const telemetryFlicker = keyframes`
  0%, 100% { opacity: 0.6; }
  45% { opacity: 0.6; }
  46% { opacity: 0.2; }
  48% { opacity: 0.7; }
  72% { opacity: 0.6; }
  73% { opacity: 0.1; }
  74% { opacity: 0.8; }
`;

// Glowing fireflies matched to the video's misty forest fireflies
const PARTICLES = [
  { top: '22%', left: '15%', size: 4, dx: '32px', dy: '-40px', delay: '0s', duration: '8s', peak: 0.75, color: '#cbfb24' },
  { top: '35%', left: '28%', size: 3, dx: '-24px', dy: '-50px', delay: '2s', duration: '9s', peak: 0.85, color: '#f5c518' },
  { top: '48%', left: '18%', size: 5, dx: '18px', dy: '-60px', delay: '1s', duration: '7s', peak: 0.9, color: '#38bdf8' },
  { top: '65%', left: '32%', size: 3, dx: '-20px', dy: '-45px', delay: '3.5s', duration: '8.5s', peak: 0.8, color: '#cbfb24' },
  { top: '30%', left: '55%', size: 4, dx: '25px', dy: '-35px', delay: '4s', duration: '10s', peak: 0.65, color: '#fb7185' },
  { top: '55%', left: '72%', size: 3, dx: '-30px', dy: '-50px', delay: '1.5s', duration: '8s', peak: 0.7, color: '#f5c518' },
  { top: '75%', left: '60%', size: 5, dx: '20px', dy: '-40px', delay: '5s', duration: '9.5s', peak: 0.85, color: '#34d399' },
  { top: '20%', left: '82%', size: 4, dx: '-16px', dy: '-30px', delay: '2.5s', duration: '7.5s', peak: 0.75, color: '#cbfb24' },
  { top: '40%', left: '88%', size: 3, dx: '-22px', dy: '-45px', delay: '0.5s', duration: '8.8s', peak: 0.65, color: '#38bdf8' },
];

function cornerBracket(position: 'tl' | 'tr' | 'bl' | 'br') {
  const base = {
    position: 'absolute' as const,
    width: { xs: 20, md: 32 },
    height: { xs: 20, md: 32 },
    borderColor: 'var(--ba-gold)',
    animation: `${bracketPulse} 3.5s ease-in-out infinite`,
    pointerEvents: 'none' as const,
    filter: 'drop-shadow(0 0 6px var(--ba-gold))',
  };
  if (position === 'tl') return { ...base, top: { xs: 12, md: 24 }, left: { xs: 12, md: 24 }, borderTop: '2px solid', borderLeft: '2px solid' };
  if (position === 'tr') return { ...base, top: { xs: 12, md: 24 }, right: { xs: 12, md: 24 }, borderTop: '2px solid', borderRight: '2px solid', animationDelay: '0.5s' };
  if (position === 'bl') return { ...base, bottom: { xs: 12, md: 24 }, left: { xs: 12, md: 24 }, borderBottom: '2px solid', borderLeft: '2px solid', animationDelay: '1s' };
  return { ...base, bottom: { xs: 12, md: 24 }, right: { xs: 12, md: 24 }, borderBottom: '2px solid', borderRight: '2px solid', animationDelay: '1.5s' };
}

// ----------------------------------------------------------------------

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
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {/* 3D Isometric Cyber Horizon Floor Grid */}
      <Box
        sx={{
          position: 'absolute',
          left: '-25%',
          right: '-25%',
          bottom: '-15%',
          height: { xs: '38%', md: '45%' },
          transform: 'perspective(450px) rotateX(68deg)',
          transformOrigin: 'bottom center',
          background: `
            linear-gradient(90deg, ${goldAlpha(0.12)} 1px, transparent 1px),
            linear-gradient(0deg, ${goldAlpha(0.12)} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          animation: `${gridScroll} 6s linear infinite`,
          maskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0.95) 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Cyber Reticles / Corner Tech Cuts */}
      <Box sx={cornerBracket('tl')} />
      <Box sx={cornerBracket('tr')} />
      <Box sx={cornerBracket('bl')} />
      <Box sx={cornerBracket('br')} />

      {/* Floating Tactical Targeting Reticle (Desktop) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: '24%',
          left: '22%',
          width: 80,
          height: 80,
          pointerEvents: 'none',
          animation: `${reticlePulse} 4s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${goldAlpha(0.35)}`,
            animation: `${reticleRotate} 24s linear infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: '25%',
            borderRadius: '50%',
            border: `1px solid ${goldAlpha(0.55)}`,
          }}
        />
        {/* Crosshair lines */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            height: 1,
            bgcolor: goldAlpha(0.5),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '10%',
            bottom: '10%',
            width: 1,
            bgcolor: goldAlpha(0.5),
          }}
        />
      </Box>

      {/* Military Telemetry Coordinate HUD (Top Left) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: 32,
          left: 64,
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 700,
          color: goldAlpha(0.75),
          letterSpacing: 1.5,
          textShadow: `0 0 8px ${goldAlpha(0.5)}`,
          animation: `${telemetryFlicker} 8s infinite`,
        }}
      >
        CAM 01 • SEC ALPHA • 120 FPS • COMBAT ARMED
      </Box>

      {/* Laser Scanline Beam Sweep */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${goldAlpha(0.4)} 20%, #ffffff 50%, ${goldAlpha(0.4)} 80%, transparent 100%)`,
          boxShadow: `0 0 15px 1px ${goldAlpha(0.8)}`,
          animation: `${scanLaser} 8s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* High-tech Sub-Pixel Scanlines */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />

      {/* Glowing 3D Ambient Fireflies / Spark Particles */}
      {PARTICLES.map((p, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            bgcolor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${goldAlpha(0.6)}`,
            '--dx': p.dx,
            '--dy': p.dy,
            '--peak': p.peak,
            animation: `${fireflyDrift} ${p.duration} ${p.delay} ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </Box>
  );
}
