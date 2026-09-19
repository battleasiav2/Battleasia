export function SpotBar({ used, total }: { used: number; total: number }) {
  const cap = Math.max(total, 1);
  const pct = Math.min(100, Math.round((used / cap) * 100));
  return (
    <span className="spot-bar" aria-hidden>
      <i style={{ width: `${pct}%` }} />
    </span>
  );
}
