import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { Box, IconButton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { HOME_GOLD } from './home-blur-panel';

type HomeChunkCarouselProps = {
  pages: ReactNode[];
  /** Hide arrows/dots when only one page */
  hideNavWhenSingle?: boolean;
};

export function HomeChunkCarousel({ pages, hideNavWhenSingle = true }: HomeChunkCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const pageCount = pages.length;
  const showNav = !(hideNavWhenSingle && pageCount <= 1);

  const scrollToPage = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, pageCount - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
    setActivePage(clamped);
  }, [pageCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || pageCount <= 1) return undefined;

    const onScroll = () => {
      const width = track.clientWidth || 1;
      setActivePage(Math.round(track.scrollLeft / width));
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [pageCount]);

  if (!pageCount) return null;

  return (
    <Stack spacing={1}>
      <Box
        ref={trackRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {pages.map((page, index) => (
          <Box
            key={index}
            sx={{
              flex: '0 0 100%',
              minWidth: 0,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
          >
            {page}
          </Box>
        ))}
      </Box>

      {showNav ? (
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <IconButton
            size="small"
            aria-label="Previous"
            disabled={activePage <= 0}
            onClick={() => scrollToPage(activePage - 1)}
            sx={{
              width: 28,
              height: 28,
              color: HOME_GOLD,
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              bgcolor: alpha('#000000', 0.35),
              '&.Mui-disabled': { opacity: 0.35 },
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          </IconButton>

          <Stack direction="row" spacing={0.75} alignItems="center">
            {pages.map((_, index) => (
              <Box
                key={index}
                component="button"
                type="button"
                aria-label={`Page ${index + 1}`}
                aria-current={index === activePage ? 'true' : undefined}
                onClick={() => scrollToPage(index)}
                sx={{
                  width: index === activePage ? 18 : 6,
                  height: 6,
                  p: 0,
                  border: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                  bgcolor: index === activePage ? HOME_GOLD : alpha('#ffffff', 0.22),
                  transition: 'width 0.2s ease, background-color 0.2s ease',
                }}
              />
            ))}
          </Stack>

          <IconButton
            size="small"
            aria-label="Next"
            disabled={activePage >= pageCount - 1}
            onClick={() => scrollToPage(activePage + 1)}
            sx={{
              width: 28,
              height: 28,
              color: HOME_GOLD,
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              bgcolor: alpha('#000000', 0.35),
              '&.Mui-disabled': { opacity: 0.35 },
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
          </IconButton>
        </Stack>
      ) : null}
    </Stack>
  );
}

/** Split a list into fixed-size pages for carousel slides */
export function chunkItems<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    pages.push(items.slice(i, i + chunkSize));
  }
  return pages.length ? pages : [[]];
}
