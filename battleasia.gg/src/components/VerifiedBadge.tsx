export function VerifiedBadge({ on }: { on?: boolean }) {
  if (!on) return null;
  return (
    <span className="verified-badge" title="Verified">
      ✓
    </span>
  );
}
