import { useEffect, useState } from 'react';

const SLIDES = [
  '/images/battle-hero-pubg.webp?v=4',
  '/images/hero-freefire.webp?v=1',
  '/images/hero-cod.webp?v=1',
  '/images/hero-mlbb.webp?v=1',
  '/images/hero-valorant.webp?v=1',
];

const INTERVAL_MS = 10_000;

/** Five site-graded game stills. First frame is LCP; the rest load after idle. */
export function HeroSlides() {
  const [index, setIndex] = useState(0);
  const [rest, setRest] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const start = () => setRest(true);
    const ric = window.requestIdleCallback?.bind(window);
    const idle = ric ? ric(start, { timeout: 1800 }) : window.setTimeout(start, 1400);
    return () => {
      if (typeof idle === 'number') {
        window.cancelIdleCallback?.(idle);
        window.clearTimeout(idle);
      }
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((n) => (n + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hero-slides" aria-hidden="true">
      {SLIDES.map((src, i) =>
        i === 0 || rest ? (
          <img
            key={src}
            className={i === index ? 'is-on' : ''}
            src={src}
            alt=""
            width={1600}
            height={900}
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : null,
      )}
    </div>
  );
}
