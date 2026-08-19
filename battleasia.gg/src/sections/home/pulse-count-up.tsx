import { useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';

type PulseCountUpProps = {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  sx?: object;
};

/** Below-fold count-up — rAF only, no Framer on the critical path */
export function PulseCountUp({
  value,
  duration = 1200,
  decimals = 0,
  suffix,
  sx,
}: PulseCountUpProps) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    started.current = false;
    setDisplay(0);
  }, [value]);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const from = 0;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(from + (value - from) * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [duration, value]);

  const formatted =
    decimals > 0
      ? display.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(display).toLocaleString();

  return (
    <Typography
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.5,
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        ...sx,
      }}
    >
      <span ref={anchorRef}>{formatted}</span>
      {suffix ? (
        <Typography
          component="span"
          sx={{
            fontSize: '0.62em',
            fontWeight: 600,
            color: 'inherit',
            opacity: 0.85,
          }}
        >
          {suffix}
        </Typography>
      ) : null}
    </Typography>
  );
}
