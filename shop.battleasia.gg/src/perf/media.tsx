import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export type PerfMediaProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** LCP / above-fold only */
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Optional AVIF/WebP sources — browser picks first supported */
  sources?: Array<{ srcSet: string; type: string }>;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number | string;
};

/**
 * CLS-safe media: always requires width/height (or use aspect via width/height ratio).
 * Prefer WebP/AVIF via `sources`. Never use for decorative LCP-blocking effects.
 */
export const PerfMedia = forwardRef<HTMLImageElement, PerfMediaProps>(function PerfMedia(
  {
    src,
    alt,
    width,
    height,
    priority = false,
    className,
    sizes,
    sources,
    objectFit = 'cover',
    borderRadius,
  },
  ref
) {
  const img = (
    <Box
      component="img"
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      className={className}
      sx={{
        display: 'block',
        width: '100%',
        height: 'auto',
        aspectRatio: `${width} / ${height}`,
        objectFit,
        borderRadius,
        bgcolor: alpha('#000', 0.2),
      }}
    />
  );

  if (!sources?.length) return img;

  return (
    <Box
      component="picture"
      sx={{
        display: 'block',
        width: 1,
        aspectRatio: `${width} / ${height}`,
        overflow: 'hidden',
        borderRadius,
      }}
    >
      {sources.map((s) => (
        <source key={s.type + s.srcSet} srcSet={s.srcSet} type={s.type} />
      ))}
      {img}
    </Box>
  );
});
