import { useEffect, useRef } from 'react';

const CIRC = 283;

type Props = {
  live: number;
  cap: number;
};

export function ArenaSeatsRing({ live, cap }: Props) {
  const fgRef = useRef<SVGCircleElement>(null);
  const pct = cap > 0 ? Math.min(1, live / cap) : 0;

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const offset = CIRC * (1 - pct);
    fg.style.strokeDashoffset = String(offset);
  }, [pct]);

  return (
    <svg className="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="bg" cx="50" cy="50" r="45" />
      <circle ref={fgRef} className="fg" cx="50" cy="50" r="45" style={{ strokeDashoffset: CIRC }} />
    </svg>
  );
}
