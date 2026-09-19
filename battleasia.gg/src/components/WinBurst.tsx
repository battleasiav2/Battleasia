export function WinBurst({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <div className="win-burst" aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ ['--i' as string]: i }} />
      ))}
    </div>
  );
}
