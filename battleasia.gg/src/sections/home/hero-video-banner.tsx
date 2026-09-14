import { useEffect, useRef } from 'react';

import { Box } from '@mui/material';

import { LANDING_V2 } from './landing-v2-theme';

// ----------------------------------------------------------------------

export function HeroVideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

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
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: '58% center',
          filter: 'contrast(1.1) saturate(1.08) brightness(0.88)',
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
        preload="metadata"
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
          display: { xs: 'none', sm: 'block' },
          filter: 'contrast(1.1) saturate(1.08) brightness(0.88)',
          '@media (prefers-reduced-motion: reduce)': { display: 'none' },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: `
            radial-gradient(80% 70% at 72% 48%, transparent 0%, rgba(6,6,7,0.28) 42%, rgba(6,6,7,0.78) 100%),
            linear-gradient(90deg, rgba(6,6,7,0.82) 0%, rgba(6,6,7,0.35) 38%, rgba(6,6,7,0.2) 62%, rgba(6,6,7,0.55) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '36%',
          zIndex: 2,
          background: `linear-gradient(to top, ${LANDING_V2.ink} 4%, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
