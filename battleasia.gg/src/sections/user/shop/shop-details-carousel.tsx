import { useRef } from 'react';

import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Image } from 'src/components/image';
import { USER_COLORS } from 'src/layouts/user';
import { goldAlpha } from 'src/theme/accent-presets';
import {
  Carousel,
  useCarousel,
  CarouselThumb,
  CarouselThumbs,
  CarouselDotButtons,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';
import Autoplay from 'embla-carousel-autoplay';

// ----------------------------------------------------------------------

type Props = {
  images?: string[];
  name?: string;
};

const GOLD = USER_COLORS.gold;

export function ShopDetailsCarousel({ images, name }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const carousel = useCarousel(
    {
      thumbs: { slidesToShow: 'auto' },
      loop: true,
    },
    [autoplay.current]
  );

  const slides = images?.map((img) => ({ src: img })) || [];

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#04070d',
          border: `1px solid ${goldAlpha(0.25)}`,
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
          boxShadow: `0 12px 32px ${alpha('#000000', 0.8)}`,
        }}
      >
        <CarouselArrowNumberButtons
          {...carousel.arrows}
          options={carousel.options}
          totalSlides={carousel.dots.dotCount}
          selectedIndex={carousel.dots.selectedIndex + 1}
          sx={{
            right: 14,
            bottom: 14,
            position: 'absolute',
            display: { xs: 'none', sm: 'flex' },
            zIndex: 2,
            '& .MuiButtonBase-root': {
              bgcolor: alpha('#06090e', 0.85),
              color: GOLD,
              border: `1px solid ${goldAlpha(0.35)}`,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: goldAlpha(0.25),
                borderColor: GOLD,
                boxShadow: `0 0 14px ${goldAlpha(0.35)}`,
              },
            },
          }}
        />

        <Carousel carousel={carousel} sx={{ width: '100%' }}>
          {slides.map((slide) => (
            <Image
              key={slide.src}
              alt={name || slide.src}
              src={slide.src}
              ratio={isMobile ? '4/5' : '16/9'}
              sx={{
                cursor: 'pointer',
                width: '100%',
                maxHeight: isMobile ? 360 : 440,
                objectFit: 'cover',
                filter: 'contrast(1.05)',
              }}
            />
          ))}
        </Carousel>

        {/* Ambient Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              linear-gradient(180deg, transparent 40%, ${alpha('#030509', 0.8)} 100%),
              radial-gradient(ellipse 60% 40% at 50% 100%, ${goldAlpha(0.12)} 0%, transparent 70%)
            `,
          }}
        />

        {slides.length > 1 ? (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              display: { xs: 'flex', sm: 'none' },
              pointerEvents: 'auto',
            }}
          >
            <CarouselDotButtons
              {...carousel.dots}
              variant="rounded"
              slotProps={{
                dot: {
                  sx: {
                    width: 24,
                    height: 3,
                    bgcolor: GOLD,
                    boxShadow: `0 0 8px ${GOLD}`,
                    '&:not(.Mui-selected)': {
                      bgcolor: alpha('#ffffff', 0.3),
                      boxShadow: 'none',
                    },
                  },
                },
              }}
            />
          </Box>
        ) : null}
      </Box>

      {slides.length > 1 && !isMobile ? (
        <CarouselThumbs
          ref={carousel.thumbs.thumbsRef}
          options={carousel.options?.thumbs}
          slotProps={{ disableMask: true }}
          sx={{ width: '100%' }}
        >
          {slides.map((item, index) => (
            <CarouselThumb
              key={item.src}
              index={index}
              src={item.src}
              selected={index === carousel.thumbs.selectedIndex}
              onClick={() => carousel.thumbs.onClickThumb(index)}
              sx={{
                opacity: index === carousel.thumbs.selectedIndex ? 1 : 0.45,
                border:
                  index === carousel.thumbs.selectedIndex
                    ? `2px solid ${GOLD}`
                    : `1px solid ${alpha('#ffffff', 0.15)}`,
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                boxShadow:
                  index === carousel.thumbs.selectedIndex
                    ? `0 0 16px ${goldAlpha(0.35)}`
                    : 'none',
                transition: 'all 0.25s ease',
                '&:hover': { opacity: 1, borderColor: GOLD },
              }}
            />
          ))}
        </CarouselThumbs>
      ) : null}
    </Box>
  );
}

