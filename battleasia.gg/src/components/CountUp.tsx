import { useEffect, useState } from 'react';
import { CoinValue } from './CoinValue';

type Props = { value: number; size?: number };

export function CountUpCoin({ value, size }: Props) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === 0) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const from = shown;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      setShown(Math.round(from + (value - from) * t));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <CoinValue value={shown} size={size} />;
}

export function CountUpNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value === 0) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const from = shown;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      setShown(Math.round(from + (value - from) * t));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{shown.toLocaleString()}</>;
}
