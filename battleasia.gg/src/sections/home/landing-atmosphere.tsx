import { Box } from '@mui/material';

type LandingAtmosphereProps = {
  src: string;
  opacity?: number;
};

/** Dark gaming photo + ink wash — keeps type readable without a flat black fill. */
export function LandingAtmosphere({ src, opacity = 0.52 }: LandingAtmosphereProps) {
  return (
    <>
      <Box
        component="img"
        src={src}
        alt=""
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: 'center 28%',
          opacity,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `linear-gradient(180deg, rgba(6,6,7,0.38) 0%, rgba(6,6,7,0.58) 48%, rgba(6,6,7,0.78) 100%)`,
        }}
      />
    </>
  );
}
