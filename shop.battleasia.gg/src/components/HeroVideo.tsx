import { useEffect, useRef, useState } from 'react';

type Props = { className?: string; priority?: boolean };

export function HeroVideo({ className, priority = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const later = window.setTimeout(() => {
      if (!reduce) setMotion(true);
      setLoadVideo(!reduce);
    }, reduce ? 0 : priority ? 2800 : 400);
    return () => window.clearTimeout(later);
  }, [priority]);

  useEffect(() => {
    if (!loadVideo) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const video = videoRef.current;
    if (!video) return;

    const start = () => {
      video
        .play()
        .then(() => setPlay(true))
        .catch(() => setPlay(false));
    };
    if (video.readyState >= 2) start();
    else video.addEventListener('loadeddata', start, { once: true });

    const onVis = () => {
      if (document.hidden) video.pause();
      else void video.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadVideo]);

  return (
    <div className={className}>
      <img
        className={`hero-poster${motion ? ' is-motion' : ''}`}
        src="/assets/hero/hero-poster-sm.webp"
        srcSet="/assets/hero/hero-poster-sm.webp 960w, /assets/hero/hero-poster.webp 1600w"
        sizes="100vw"
        width={1600}
        height={900}
        alt=""
        fetchPriority={priority ? 'high' : 'low'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      {loadVideo ? (
        <video
          ref={videoRef}
          className={play ? 'hero-video is-on' : 'hero-video'}
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          poster="/assets/hero/hero-poster.webp"
          onError={() => setPlay(false)}
        >
          <source src="/assets/hero/hero-loop.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="hero-vignette" />
    </div>
  );
}
