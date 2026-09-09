import { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import { useSettingsContext } from 'src/components/settings';
import { resolveAccentId, getAccentPalette } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const PROTOCOL_TAG = '// PROTOCOL: BATTLEASIA_ESCORT_v2.0';
const SYSTEM_TAG = '// HIGH DEF 60FPS OPERATIVE SYSTEM';

export type LostLightLoaderProps = {
  onComplete?: () => void;
  minDuration?: number; // ms to ensure authentic gaming boot experience
};

export function LostLightLoader({ onComplete, minDuration = 800 }: LostLightLoaderProps) {
  const settings = useSettingsContext();
  const accentId = resolveAccentId(settings.state.primaryColor);
  const palette = getAccentPalette(accentId);

  const [progress, setProgress] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;
      setMouseParallax({ x: normX, y: normY, rawX: e.clientX, rawY: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const path = window.location.pathname || '';
    const isHome = path === '/' || path === '/index.html' || path === '';
    let hasShown = false;
    try {
      hasShown = !!sessionStorage.getItem('ba_home_loader_shown');
    } catch (e) {
      // Ignore storage errors
    }

    if (!isHome || hasShown) {
      setIsDone(true);
      const bootShell = document.getElementById('boot-shell');
      if (bootShell) bootShell.remove();
      document.getElementById('boot-shell-css')?.remove();
      onComplete?.();
      return () => {};
    }

    // Check if initial boot-shell already had progress
    const bootProgressEl = document.getElementById('boot-loader-percent');
    let startVal = 0;
    if (bootProgressEl) {
      const match = bootProgressEl.innerText.match(/\d+/);
      if (match) {
        startVal = Math.min(parseInt(match[0], 10), 65);
      }
    }

    setProgress(startVal);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressRatio = Math.min(elapsed / minDuration, 1);

      // Smooth custom easing: rapid surge -> tactical pause -> final completion
      let currentPercent: number;
      if (progressRatio < 0.4) {
        // Fast start 0 -> 45%
        currentPercent = (progressRatio / 0.4) * 45;
      } else if (progressRatio < 0.7) {
        // Steady asset initialization 45% -> 78%
        currentPercent = 45 + ((progressRatio - 0.4) / 0.3) * 33;
      } else {
        // Final lock 78% -> 100%
        currentPercent = 78 + ((progressRatio - 0.7) / 0.3) * 22;
      }

      currentPercent = Math.max(startVal, Math.min(100, currentPercent));
      setProgress(currentPercent);

      // Also sync boot shell if it exists so there's zero jump
      const bootPercent = document.getElementById('boot-loader-percent');
      const bootBar = document.getElementById('boot-loader-bar');
      const bootMoth = document.getElementById('boot-loader-moth');
      const rounded = Math.round(currentPercent);

      if (bootPercent) bootPercent.textContent = `${rounded}%`;
      if (bootBar) bootBar.style.width = `${currentPercent}%`;
      if (bootMoth) bootMoth.style.left = `${currentPercent}%`;

      if (progressRatio < 1) {
        rafRef.current = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        // Brief 60ms hold at 100% before dissolve
        setTimeout(() => {
          setIsDismissing(true);
          try {
            sessionStorage.setItem('ba_home_loader_shown', 'true');
          } catch (e) {
            // Ignore storage errors
          }

          // Dismiss boot shell if present
          const bootShell = document.getElementById('boot-shell');
          if (bootShell) {
            bootShell.style.opacity = '0';
            bootShell.style.transition = 'opacity 0.35s ease-out';
            setTimeout(() => {
              bootShell.remove();
              document.getElementById('boot-shell-css')?.remove();
            }, 380);
          }

          // Complete fade out
          setTimeout(() => {
            setIsDone(true);
            onComplete?.();
          }, 380);
        }, 60);
      }
    };

    rafRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [minDuration, onComplete]);

  if (isDone) return null;

  const rounded = Math.round(progress);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483640,
        bgcolor: '#000000',
        overflow: 'hidden',
        pointerEvents: isDismissing ? 'none' : 'all',
        opacity: isDismissing ? 0 : 1,
        transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image: loader.webp with 3D Mouse Parallax */}
      <Box
        component="img"
        src="/loader.webp"
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          // Fallback to optimized jpeg if webp isn't supported
          e.currentTarget.src = '/loader.jpeg';
        }}
        alt="BattleAsia Loading"
        sx={{
          position: 'absolute',
          inset: '-20px',
          width: 'calc(100% + 40px)',
          height: 'calc(100% + 40px)',
          objectFit: 'cover',
          objectPosition: 'center 48%',
          pointerEvents: 'none',
          userSelect: 'none',
          transform: `translate3d(${-mouseParallax.x * 14}px, ${-mouseParallax.y * 14}px, 0) scale(1.04)`,
          transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      />

      {/* Cinematic Vignette & Radial Edge Shadows */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 15%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.92) 85%, #000000 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 18%, transparent 80%, rgba(0,0,0,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Tactical Dynamic Flashlight Beam following Mouse */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            mouseParallax.rawX > 0
              ? `radial-gradient(circle 420px at ${mouseParallax.rawX}px ${mouseParallax.rawY}px, rgba(${palette.rgb}, 0.12) 0%, rgba(${palette.lightRgb}, 0.03) 45%, transparent 75%)`
              : 'none',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          transition: 'background 0.04s linear',
        }}
      />

      {/* Top Right Tactical Telemetry Tracker */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 26 },
          right: { xs: 16, sm: 34 },
          zIndex: 15,
          fontFamily: "'Barlow', monospace, sans-serif",
          fontSize: '10.5px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          color: 'rgba(255, 255, 255, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: palette.gold,
              boxShadow: `0 0 8px ${palette.gold}`,
              animation: 'telemetry-ping 1.8s ease-in-out infinite alternate',
              '@keyframes telemetry-ping': {
                '0%': { transform: 'scale(0.8)', opacity: 0.6 },
                '100%': { transform: 'scale(1.2)', opacity: 1 },
              },
            }}
          />
          <Box component="span" sx={{ color: palette.goldLight }}>
            RADAR: 360° ESCORT ACTIVE
          </Box>
        </Box>
        <Box sx={{ color: 'rgba(255, 255, 255, 0.42)', fontSize: '9.5px' }}>
          TRACKER_XY: [{Math.round(mouseParallax.rawX || 0)}, {Math.round(mouseParallax.rawY || 0)}]
        </Box>
      </Box>

      {/* Bottom Left Protocol Badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, sm: 26 },
          left: { xs: 16, sm: 34 },
          zIndex: 15,
          fontFamily: "'Barlow', monospace, sans-serif",
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: 'rgba(255, 255, 255, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.3,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Box sx={{ color: palette.gold, opacity: 0.88 }}>{PROTOCOL_TAG}</Box>
        <Box sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>{SYSTEM_TAG}</Box>
      </Box>

      {/* Center Tactical HUD Loading Widget with 3D Parallax Tilt */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          width: { xs: '84vw', sm: 380, md: 400 },
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          // Matches operative chest level in the reference image
          mt: { xs: '6vh', sm: '4vh' },
          transform: `perspective(900px) rotateX(${-mouseParallax.y * 6}deg) rotateY(${mouseParallax.x * 6}deg) translateZ(10px)`,
          transition: 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        {/* Progress Bar Track */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '2px',
            bgcolor: 'rgba(255, 255, 255, 0.18)',
            // End tick caps (left and right)
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: -2,
              width: '1px',
              height: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.35)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: -2,
              width: '1px',
              height: '6px',
              bgcolor: 'rgba(255, 255, 255, 0.35)',
            },
          }}
        >
          {/* Active Neon Laser Fill */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background: `linear-gradient(90deg, rgba(${palette.rgb}, 0.25) 0%, rgba(${palette.lightRgb}, 0.92) 70%, ${palette.gold} 100%)`,
              boxShadow: `0 0 10px rgba(${palette.rgb}, 0.9), 0 0 20px rgba(${palette.rgb}, 0.45), 0 0 35px rgba(${palette.rgb}, 0.2)`,
              transition: 'width 0.04s linear',
            }}
          >
            {/* Leading Laser Head Spark */}
            <Box
              sx={{
                position: 'absolute',
                right: -1,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '5px',
                borderRadius: '1px',
                bgcolor: '#ffffff',
                boxShadow: `0 0 8px #ffffff, 0 0 16px ${palette.gold}, 0 0 24px rgba(${palette.rgb}, 0.8)`,
              }}
            />
          </Box>

          {/* Bioluminescent Hovering Firefly / Tactical Pip */}
          <Box
            sx={{
              position: 'absolute',
              left: `${progress}%`,
              top: -8,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              transition: 'left 0.04s linear',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Radiant Ambient Aura Glow */}
            <Box
              sx={{
                position: 'absolute',
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: `radial-gradient(circle at center, rgba(${palette.rgb}, 0.75) 0%, rgba(${palette.lightRgb}, 0.35) 35%, rgba(${palette.rgb}, 0.12) 60%, transparent 75%)`,
                filter: `drop-shadow(0 0 16px rgba(${palette.rgb}, 0.9)) drop-shadow(0 0 32px rgba(${palette.rgb}, 0.5))`,
                animation: 'firefly-pulse 2.2s ease-in-out infinite alternate',
                '@keyframes firefly-pulse': {
                  '0%': { transform: 'scale(0.88)', opacity: 0.8 },
                  '100%': { transform: 'scale(1.14)', opacity: 1 },
                },
              }}
            />

            {/* Micro Embers floating upward */}
            <Box
              sx={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                bgcolor: palette.goldLight,
                boxShadow: `0 0 8px ${palette.goldLight}`,
                animation: 'ember-drift-1 1.8s ease-in-out infinite',
                '@keyframes ember-drift-1': {
                  '0%': { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
                  '50%': { opacity: 0.9 },
                  '100%': { transform: 'translate(-14px, -28px) scale(0.2)', opacity: 0 },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: '2.5px',
                height: '2.5px',
                borderRadius: '50%',
                bgcolor: palette.gold,
                boxShadow: `0 0 6px ${palette.gold}`,
                animation: 'ember-drift-2 2.3s ease-in-out infinite 0.6s',
                '@keyframes ember-drift-2': {
                  '0%': { transform: 'translate(0, 0) scale(0.8)', opacity: 0 },
                  '50%': { opacity: 0.85 },
                  '100%': { transform: 'translate(12px, -34px) scale(0.2)', opacity: 0 },
                },
              }}
            />

            {/* Tactical BattleAsia Shield Logo with Holographic Glow */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'logo-hover 2.4s ease-in-out infinite',
                '@keyframes logo-hover': {
                  '0%, 100%': {
                    transform: 'translateY(0) scale(1)',
                  },
                  '35%': {
                    transform: 'translateY(-4px) scale(1.06)',
                  },
                  '70%': {
                    transform: 'translateY(-1.5px) scale(0.98)',
                  },
                },
              }}
            >
              <Box
                component="img"
                src="/logo/logo.webp"
                alt="BattleAsia"
                sx={{
                  width: 32,
                  height: 32,
                  objectFit: 'contain',
                  filter: `drop-shadow(0 0 8px rgba(${palette.rgb}, 0.85)) drop-shadow(0 0 16px rgba(${palette.rgb}, 0.45)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))`,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Live Percentage Counter (Right-aligned under the bar) */}
        <Box
          sx={{
            mt: 1.75,
            textAlign: 'right',
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 700,
            fontSize: '13.5px',
            letterSpacing: '1.2px',
            color: 'rgba(255, 255, 255, 0.88)',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.95)',
            userSelect: 'none',
          }}
        >
          {rounded}%
        </Box>
      </Box>
    </Box>
  );
}
