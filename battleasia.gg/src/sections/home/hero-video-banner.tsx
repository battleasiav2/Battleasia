import { useEffect, useRef } from 'react';

import { Box } from '@mui/material';

import { LANDING_V2 } from './landing-v2-theme';

// ----------------------------------------------------------------------

/** Zip grading, slightly brighter so corners stay clean (not crushed black) */
const HERO_MEDIA_FILTER = 'contrast(1.08) saturate(1.06) brightness(0.97)';

export function HeroVideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    // iOS Safari: muted + playsInline must be set before play()
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const handleUserGesture = () => {
            video.play().catch(() => {});
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('touchstart', handleUserGesture);
          };
          window.addEventListener('click', handleUserGesture, { once: true });
          window.addEventListener('touchstart', handleUserGesture, { once: true });
        });
      }
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
      video.load();
    }

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: LANDING_V2.ink,
        pointerEvents: 'none',
      }}
    >
      <Box
        component="img"
        src={LANDING_V2.assets.heroPoster}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: '58% center',
          filter: HERO_MEDIA_FILTER,
        }}
      />

      <Box
        component="video"
        ref={videoRef}
        src={LANDING_V2.assets.heroVideo}
        poster={LANDING_V2.assets.heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '58% center',
          pointerEvents: 'none',
          display: 'block',
          filter: HERO_MEDIA_FILTER,
          '@media (prefers-reduced-motion: reduce)': { display: 'none' },
        }}
      />

      {/* Soft vignette — left wash for type; open corners so motion reads clean */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: `
            radial-gradient(92% 78% at 62% 46%, transparent 0%, transparent 52%, rgba(6,6,7,0.28) 82%, rgba(6,6,7,0.48) 100%),
            linear-gradient(90deg, rgba(6,6,7,0.58) 0%, rgba(6,6,7,0.2) 34%, transparent 58%, rgba(6,6,7,0.18) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Soft bottom blend — shorter so corners stay open */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '22%',
          zIndex: 2,
          background: `linear-gradient(to top, ${LANDING_V2.ink} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
