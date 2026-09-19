import { useEffect, useRef, useState } from 'react';

type Props = { className?: string; priority?: boolean };

/** Live site hero loop — behavior from HeroVideoBanner; Aurora layout/vignette stays in CSS. */
const HERO_VIDEO = '/assets/hero/hero-loop.mp4';
const HERO_POSTER = '/assets/hero/hero-live-poster.webp';

export function HeroVideo({ className, priority = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const skipVideo = Boolean(conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g');
    if (skipVideo) return;

    const root = wrapRef.current;
    if (!root) return;

    let armed = 0;
    const startLoad = () => setLoadVideo(true);
    const arm = () => {
      if (armed) return;
      // Always wait for first paint / idle so the poster stays LCP
      const delay = priority ? 1800 : 900;
      const ric = window.requestIdleCallback?.bind(window);
      armed = ric ? ric(startLoad, { timeout: delay + 400 }) : window.setTimeout(startLoad, delay);
    };

    if (priority) {
      arm();
      return () => {
        if (armed) {
          window.cancelIdleCallback?.(armed);
          window.clearTimeout(armed);
        }
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.08)) arm();
      },
      { threshold: [0.08, 0.2] },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      if (armed) {
        window.cancelIdleCallback?.(armed);
        window.clearTimeout(armed);
      }
    };
  }, [priority]);

  useEffect(() => {
    if (!loadVideo) return;
    const video = videoRef.current;
    const root = wrapRef.current;
    if (!video || !root) return;

    // Same autoplay contract as live HeroVideoBanner (iOS needs attrs before play)
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      const promise = video.play();
      if (promise === undefined) {
        setPlay(true);
        return;
      }
      promise
        .then(() => setPlay(true))
        .catch(() => {
          setPlay(false);
          const onGesture = () => {
            video.play().then(() => setPlay(true)).catch(() => undefined);
            window.removeEventListener('click', onGesture);
            window.removeEventListener('touchstart', onGesture);
          };
          window.addEventListener('click', onGesture, { once: true });
          window.addEventListener('touchstart', onGesture, { once: true });
        });
    };

    if (video.readyState >= 2) tryPlay();
    else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
      video.load();
    }

    const vis = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        if (!on) video.pause();
        else void video.play().then(() => setPlay(true)).catch(() => undefined);
      },
      { threshold: 0.08 },
    );
    vis.observe(root);

    const onDoc = () => {
      if (document.hidden) video.pause();
      else void video.play().then(() => setPlay(true)).catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onDoc);

    return () => {
      vis.disconnect();
      document.removeEventListener('visibilitychange', onDoc);
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [loadVideo]);

  return (
    <div className={className} ref={wrapRef}>
      <img
        className="hero-poster"
        src={HERO_POSTER}
        width={1920}
        height={1080}
        alt=""
        fetchPriority={priority ? 'high' : 'low'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      {loadVideo ? (
        <video
          ref={videoRef}
          className={play ? 'hero-video is-on' : 'hero-video'}
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          onError={() => setPlay(false)}
        />
      ) : null}
      <div className="hero-vignette" />
    </div>
  );
}
