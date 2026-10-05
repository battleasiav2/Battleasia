import { useEffect, useState } from 'react';

const CHIPS = ['#E5C558', '#D4E82A', '#5EEAD4', '#F472B6'] as const;
const KEY = 'ba-landing-accent';

function paint(color: string) {
  const root = document.querySelector<HTMLElement>('.landing-fw');
  if (!root) return;
  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-dim', `color-mix(in srgb, ${color} 18%, transparent)`);
}

export function ZipAccentChips() {
  const [active, setActive] = useState<string>(CHIPS[0]);

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    const color = CHIPS.includes(saved as (typeof CHIPS)[number]) ? (saved as (typeof CHIPS)[number]) : CHIPS[0];
    setActive(color);
    paint(color);
  }, []);

  return (
    <div className="accent-chips" aria-label="Accent color">
      {CHIPS.map((color) => (
        <button
          key={color}
          type="button"
          className={`accent-chip${active === color ? ' is-active' : ''}`}
          data-color={color}
          title={color}
          onClick={() => {
            setActive(color);
            paint(color);
            sessionStorage.setItem(KEY, color);
          }}
        />
      ))}
    </div>
  );
}
