import { memo, useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import { useSettingsContext } from 'src/components/settings';
import { resolveAccentId, getAccentPalette } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
}

interface ClickWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const TacticalCursor = memo(function TacticalCursor() {
  const settings = useSettingsContext();
  const accentId = resolveAccentId(settings?.state?.primaryColor);
  const palette = getAccentPalette(accentId);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isDown, setIsDown] = useState(false);

  // Mouse coords & physics refs for 60-120fps direct GPU rendering
  const mouse = useRef({ x: -100, y: -100, prevX: -100, prevY: -100, vx: 0, vy: 0, visible: false });
  const reticle = useRef({ x: -100, y: -100, angle: 0 });
  const particles = useRef<Particle[]>([]);
  const clickWaves = useRef<ClickWave[]>([]);
  const lastSpawnTime = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // Colors ref to avoid stale closures inside requestAnimationFrame
  const colorsRef = useRef({
    gold: palette.gold,
    goldLight: palette.goldLight,
    rgb: palette.rgb,
    lightRgb: palette.lightRgb,
  });

  useEffect(() => {
    colorsRef.current = {
      gold: palette.gold,
      goldLight: palette.goldLight,
      rgb: palette.rgb,
      lightRgb: palette.lightRgb,
    };
  }, [palette]);

  useEffect(() => {
    // Only enable on pointer-fine desktop environments
    if (typeof window === 'undefined') return () => {};
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (isTouch) return () => {};

    setEnabled(true);
    document.body.classList.add('tactical-cursor-active');

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastSpawnTime.current);

      const dx = e.clientX - mouse.current.x;
      const dy = e.clientY - mouse.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      mouse.current.prevX = mouse.current.x;
      mouse.current.prevY = mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.vx = dx;
      mouse.current.vy = dy;
      mouse.current.visible = true;

      // Update 0ms core dot directly for instantaneous hardware response
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        coreRef.current.style.opacity = '1';
      }

      // Spawn motion trail embers when moving fast
      if (speed > 8 && dt > 18 && particles.current.length < 50) {
        lastSpawnTime.current = now;
        const count = speed > 35 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const spread = (Math.random() - 0.5) * 8;
          particles.current.push({
            x: e.clientX + spread,
            y: e.clientY + spread,
            vx: -dx * 0.12 + (Math.random() - 0.5) * 1.5,
            vy: -dy * 0.12 + (Math.random() - 0.5) * 1.5 - 0.3,
            size: Math.random() * 2.6 + 1.2,
            alpha: 0.85,
            maxLife: Math.random() * 22 + 18,
            life: 0,
            color: Math.random() > 0.4 ? colorsRef.current.gold : colorsRef.current.goldLight,
          });
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsDown(true);
      const { x, y } = mouse.current;

      // Trigger expanding shockwave ripple
      clickWaves.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 42,
        alpha: 0.9,
        color: colorsRef.current.gold,
      });

      // Burst of kinetic sparks
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.4;
        const velocity = Math.random() * 3.5 + 2;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 2.8 + 1.5,
          alpha: 1,
          maxLife: Math.random() * 26 + 20,
          life: 0,
          color: i % 2 === 0 ? colorsRef.current.gold : '#ffffff',
        });
      }
    };

    const onMouseUp = () => {
      setIsDown(false);
    };

    const onMouseLeave = () => {
      mouse.current.visible = false;
      if (coreRef.current) coreRef.current.style.opacity = '0';
      if (reticleRef.current) reticleRef.current.style.opacity = '0';
    };

    const onMouseEnter = () => {
      mouse.current.visible = true;
      if (coreRef.current) coreRef.current.style.opacity = '1';
      if (reticleRef.current) reticleRef.current.style.opacity = '1';
    };

    // Target lock detection on interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isTextInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTextInput) {
        setIsText(true);
        setIsLocked(false);
        return;
      }
      setIsText(false);

      const clickable = target.closest<HTMLElement>(
        'a, button, [role="button"], [role="tab"], [role="menuitem"], .cursor-pointer, [data-interactive]'
      );

      setIsLocked(Boolean(clickable));
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Main animation loop: Physics spring, 3D tilt, canvas particles
    const loop = () => {
      // 1. Smooth reticle spring interpolation
      const targetX = mouse.current.x;
      const targetY = mouse.current.y;
      const dx = targetX - reticle.current.x;
      const dy = targetY - reticle.current.y;

      // Spring coefficient (0.22 for snappy tactical feel)
      reticle.current.x += dx * 0.22;
      reticle.current.y += dy * 0.22;

      // 3D velocity tilt & dynamic aerodynamic stretch
      const speed = Math.sqrt(mouse.current.vx * mouse.current.vx + mouse.current.vy * mouse.current.vy);
      const tiltX = Math.max(-24, Math.min(24, -mouse.current.vy * 0.45));
      const tiltY = Math.max(-24, Math.min(24, mouse.current.vx * 0.45));
      const scale = isDown ? 0.78 : isLocked ? 1.32 : Math.min(1.22, 1 + speed * 0.005);

      // Natural idle gyro rotation
      reticle.current.angle += isLocked ? 1.8 : 0.4;
      if (reticle.current.angle >= 360) reticle.current.angle = 0;

      if (reticleRef.current && mouse.current.visible) {
        reticleRef.current.style.transform = `translate3d(${reticle.current.x}px, ${reticle.current.y}px, 0) translate(-50%, -50%) perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(${reticle.current.angle}deg) scale(${scale})`;
        reticleRef.current.style.opacity = isText ? '0.25' : '1';
      }

      // Smooth decay on mouse velocity
      mouse.current.vx *= 0.82;
      mouse.current.vy *= 0.82;

      // 2. Render Canvas: Particle embers & shockwave pulses
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Render Shockwaves
          for (let i = clickWaves.current.length - 1; i >= 0; i--) {
            const wave = clickWaves.current[i];
            wave.radius += 2.2;
            wave.alpha = Math.max(0, 1 - wave.radius / wave.maxRadius);

            ctx.save();
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 1.6;
            ctx.globalAlpha = wave.alpha * 0.85;
            ctx.shadowColor = wave.color;
            ctx.shadowBlur = 10;
            ctx.stroke();

            // Inner sub-ring for tactical shockwave depth
            if (wave.radius > 12) {
              ctx.beginPath();
              ctx.arc(wave.x, wave.y, wave.radius * 0.65, 0, Math.PI * 2);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.globalAlpha = wave.alpha * 0.45;
              ctx.stroke();
            }
            ctx.restore();

            if (wave.radius >= wave.maxRadius) {
              clickWaves.current.splice(i, 1);
            }
          }

          // Render Particle Sparks
          for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life++;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
            p.size *= 0.96;

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();

            if (p.life >= p.maxLife || p.size < 0.3) {
              particles.current.splice(i, 1);
            }
          }
        }
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.body.classList.remove('tactical-cursor-active');
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isDown, isLocked, isText]);

  if (!enabled) return null;

  return (
    <>
      {/* High Performance Canvas Particle Layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2147483644,
        }}
      />

      {/* Layer 1: Zero-latency Micro Core Dot (Tracks hardware coords 1:1) */}
      <Box
        ref={coreRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          mt: '-3px',
          ml: '-3px',
          borderRadius: '50%',
          bgcolor: palette.goldLight,
          boxShadow: `0 0 6px #ffffff, 0 0 12px ${palette.gold}, 0 0 20px rgba(${palette.rgb}, 0.85)`,
          pointerEvents: 'none',
          zIndex: 2147483646,
          opacity: 0,
          transition: 'opacity 0.2s ease, width 0.15s ease, height 0.15s ease',
          willChange: 'transform',
        }}
      />

      {/* Layer 2: 3D Inertial Gyroscope Hologram Reticle */}
      <Box
        ref={reticleRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isLocked ? 48 : 34,
          height: isLocked ? 48 : 34,
          pointerEvents: 'none',
          zIndex: 2147483645,
          opacity: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), height 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        {/* Futuristic SVG Targeting Reticle with Brackets & HUD Ticks */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            filter: `drop-shadow(0 0 4px rgba(${palette.rgb}, 0.8))`,
          }}
        >
          {/* Top-Left Bracket */}
          <path
            d="M 6 15 L 6 6 L 15 6"
            stroke={isLocked ? palette.goldLight : palette.gold}
            strokeWidth={isLocked ? '2' : '1.5'}
            strokeLinecap="square"
          />
          {/* Top-Right Bracket */}
          <path
            d="M 33 6 L 42 6 L 42 15"
            stroke={isLocked ? palette.goldLight : palette.gold}
            strokeWidth={isLocked ? '2' : '1.5'}
            strokeLinecap="square"
          />
          {/* Bottom-Left Bracket */}
          <path
            d="M 6 33 L 6 42 L 15 42"
            stroke={isLocked ? palette.goldLight : palette.gold}
            strokeWidth={isLocked ? '2' : '1.5'}
            strokeLinecap="square"
          />
          {/* Bottom-Right Bracket */}
          <path
            d="M 33 42 L 42 42 L 42 33"
            stroke={isLocked ? palette.goldLight : palette.gold}
            strokeWidth={isLocked ? '2' : '1.5'}
            strokeLinecap="square"
          />

          {/* Precision Cardinal Ticks */}
          <line x1="24" y1="2" x2="24" y2="5" stroke={palette.gold} strokeWidth="1.2" />
          <line x1="24" y1="43" x2="24" y2="46" stroke={palette.gold} strokeWidth="1.2" />
          <line x1="2" y1="24" x2="5" y2="24" stroke={palette.gold} strokeWidth="1.2" />
          <line x1="43" y1="24" x2="46" y2="24" stroke={palette.gold} strokeWidth="1.2" />

          {/* Segmented Center Reticle Circle */}
          <circle
            cx="24"
            cy="24"
            r="12"
            stroke={isLocked ? palette.goldLight : palette.gold}
            strokeWidth="1"
            strokeDasharray={isLocked ? '6 4' : '2 6'}
            opacity={isLocked ? 0.95 : 0.45}
          />
        </svg>
      </Box>
    </>
  );
});
