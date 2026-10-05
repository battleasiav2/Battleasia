import { useEffect, useRef } from 'react';

const VIDEO = '/assets/fw/hero-pubg.mp4';
const POSTER = '/assets/fw/hero-poster.jpg';

/** Zip hero: poster + video as direct children of `.hero-bg`, then `is-video-ready`. */
export function ZipHeroBg() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = wrap?.querySelector('video');
    if (!wrap || !video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const skip = reduced || Boolean(conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g');
    if (skip) return;

    const mark = () => wrap.classList.add('is-video-ready', 'is-video-playing');
    const clear = () => wrap.classList.remove('is-video-ready', 'is-video-playing');
    const tryPlay = () => {
      const play = video.play();
      if (play && typeof play.then === 'function') play.then(mark).catch(() => undefined);
    };

    video.addEventListener('loadeddata', mark);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('playing', mark);
    video.addEventListener('error', clear);
    if (video.readyState >= 2) tryPlay();

    const hero = wrap.closest('.hero');
    const io = hero
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) tryPlay();
            else video.pause();
          },
          { threshold: 0.08 },
        )
      : null;
    if (hero && io) io.observe(hero);

    return () => {
      video.removeEventListener('loadeddata', mark);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('playing', mark);
      video.removeEventListener('error', clear);
      io?.disconnect();
    };
  }, []);

  return (
    <div className="hero-bg" id="hero-bg" ref={wrapRef}>
      <video
        className="hero-media hero-video"
        src={VIDEO}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        poster={POSTER}
        aria-hidden
      />
      <img
        className="hero-media hero-poster"
        src={POSTER}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
