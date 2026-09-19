type Props = { className?: string; priority?: boolean };

export function HeroVideo({ className, priority = false }: Props) {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={className}>
      <img
        className={reduce ? 'hero-poster is-still' : 'hero-poster'}
        src="/assets/hero/hero-poster.webp"
        width={1920}
        height={1080}
        alt="Nightfall Stadium aurora arena"
        fetchPriority={priority ? 'high' : 'low'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      <div className="hero-vignette" />
    </div>
  );
}
