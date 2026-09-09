import { useEffect, useRef } from 'react';

import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export function HeroVideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure muted state is recognized across all modern browsers for instant autoplay
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
        minHeight: { xs: 520, sm: 0 },
        overflow: 'hidden',
        bgcolor: '#000000',
        pointerEvents: 'none',
      }}
    >
      {/* 16:9 Full HD Video Canvas */}
      <Box
        component="video"
        ref={videoRef}
        src="/hero.mp4"
        poster="/hero-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%',
          minHeight: '100%',
          width: '100%',
          height: '100%',
          aspectRatio: '16 / 9',
          objectFit: 'cover',
          // Center stealth squad on mobile while keeping full tactical vista on desktop
          objectPosition: { xs: '38% center', sm: '42% center', md: 'center center' },
          pointerEvents: 'none',
          display: 'block',
          filter: 'contrast(1.06) brightness(0.94) saturate(1.12)',
        }}
      />

      {/* Atmospheric depth vignette tuned for 16:9 gaming cinematic */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: 'radial-gradient(ellipse 95% 80% at 42% 38%, transparent 15%, rgba(0, 0, 0, 0.68) 85%)',
            md: 'radial-gradient(ellipse 90% 75% at 38% 48%, transparent 25%, rgba(0, 0, 0, 0.65) 90%)',
          },
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Vertical fade to seamlessly dissolve into the header and dark body */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 22%, transparent 68%, #000000 100%),
            linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.4) 100%)
          `,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </Box>
  );
}
