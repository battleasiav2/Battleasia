import { useEffect } from 'react';

const SEL = '.play-card, .match-row, .result-row, .room-card';

export function Spotlight() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    function move(e: PointerEvent) {
      const el = (e.target as HTMLElement | null)?.closest(SEL) as HTMLElement | null;
      if (!el) return;
      const box = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${((e.clientX - box.left) / box.width) * 100}%`);
      el.style.setProperty('--spot-y', `${((e.clientY - box.top) / box.height) * 100}%`);
    }
    document.addEventListener('pointermove', move, { passive: true });
    return () => document.removeEventListener('pointermove', move);
  }, []);
  return null;
}
