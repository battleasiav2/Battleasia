import { useEffect, useRef } from 'react';

import { Box } from '@mui/material';

type ParticleKind = 'ember' | 'spark' | 'smoke';

type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  wobble: number;
  wobbleSpeed: number;
  hue: number;
};

/**
 * Left-city fire: canvas embers + smoke.
 * Lazy-mounted from HeroFxOverlay — never on the LCP path.
 * Transform-free canvas dots (no shadowBlur, no filters).
 */
export function HeroEmberField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const emberCount = isMobile ? 36 : 68;
    const sparkCount = isMobile ? 14 : 24;
    const smokeCount = isMobile ? 12 : 22;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;

    const particles: Particle[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const spawnBand = () => {
      // City fire sits on the left third of the hero art.
      const xMax = width * (isMobile ? 0.62 : 0.48);
      return {
        x: rand(width * 0.02, xMax),
        y: rand(height * 0.62, height * 0.98),
      };
    };

    const makeParticle = (kind: ParticleKind): Particle => {
      const origin = spawnBand();
      if (kind === 'smoke') {
        return {
          kind,
          x: origin.x,
          y: origin.y,
          vx: rand(-0.16, 0.3),
          vy: rand(-0.28, -0.58),
          size: rand(18, isMobile ? 34 : 46),
          life: rand(0, 1),
          maxLife: rand(4.8, 8.2),
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.006, 0.016),
          hue: 0,
        };
      }
      if (kind === 'spark') {
        return {
          kind,
          x: origin.x,
          y: origin.y,
          vx: rand(-0.4, 0.5),
          vy: rand(-1.35, -2.4),
          size: rand(1.1, 1.8),
          life: rand(0, 1),
          maxLife: rand(1.6, 2.8),
          wobble: rand(0, Math.PI * 2),
          wobbleSpeed: rand(0.02, 0.05),
          hue: rand(32, 48),
        };
      }
      return {
        kind,
        x: origin.x,
        y: origin.y,
        vx: rand(-0.22, 0.34),
        vy: rand(-0.62, -1.28),
        size: rand(1.8, 3.6),
        life: rand(0, 1),
        maxLife: rand(2.6, 5.2),
        wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.012, 0.03),
        hue: rand(16, 36),
      };
    };

    const seed = () => {
      particles.length = 0;
      for (let i = 0; i < emberCount; i += 1) particles.push(makeParticle('ember'));
      for (let i = 0; i < sparkCount; i += 1) particles.push(makeParticle('spark'));
      for (let i = 0; i < smokeCount; i += 1) particles.push(makeParticle('smoke'));
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const recycle = (p: Particle) => {
      const next = makeParticle(p.kind);
      p.x = next.x;
      p.y = next.y;
      p.vx = next.vx;
      p.vy = next.vy;
      p.size = next.size;
      p.life = 0;
      p.maxLife = next.maxLife;
      p.wobble = next.wobble;
      p.wobbleSpeed = next.wobbleSpeed;
      p.hue = next.hue;
    };

    const draw = () => {
      if (!running) return;
      raf = window.requestAnimationFrame(draw);
      if (!visible || document.hidden) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.life += 0.016;
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * (p.kind === 'smoke' ? 0.28 : 0.12);
        p.y += p.vy;

        if (p.life >= p.maxLife || p.y < height * 0.08 || p.x < -40 || p.x > width * 0.72) {
          recycle(p);
          continue;
        }

        const t = p.life / p.maxLife;
        const fade = t < 0.12 ? t / 0.12 : t > 0.62 ? 1 - (t - 0.62) / 0.38 : 1;

        if (p.kind === 'smoke') {
          const alpha = 0.09 * fade;
          ctx.beginPath();
          ctx.fillStyle = `rgba(196, 176, 154, ${alpha})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        const alpha = (p.kind === 'spark' ? 0.95 : 0.88) * fade;
        const light = p.kind === 'spark' ? 68 : 56;
        if (p.kind === 'spark') {
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 100%, ${light}%, ${alpha})`;
          ctx.ellipse(p.x, p.y, p.size * 0.55, p.size * 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${light}%, ${alpha * 0.35})`;
        ctx.arc(p.x, p.y, p.size * 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${light}%, ${alpha})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(parent);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          display: 'block',
          mixBlendMode: 'plus-lighter',
        }}
      />
    </Box>
  );
}
