import { useRef } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Image } from 'src/components/image';
import { USER_COLORS } from 'src/layouts/user';
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
    <Box>
      <Box
        sx={{
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CarouselArrowNumberButtons
          {...carousel.arrows}
          options={carousel.options}
          totalSlides={carousel.dots.dotCount}
          selectedIndex={carousel.dots.selectedIndex + 1}
          sx={{
            right: 12,
            bottom: 12,
            position: 'absolute',
            display: { xs: 'none', sm: 'flex' },
            zIndex: 2,
            '& .MuiButtonBase-root': {
              bgcolor: alpha('#000000', 0.65),
              color: USER_COLORS.gold,
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              '&:hover': { bgcolor: alpha('#000000', 0.85) },
            },
          }}
        />

        <Carousel carousel={carousel} sx={{ borderRadius: 0, width: '100%' }}>
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
              }}
            />
          ))}
        </Carousel>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(180deg, transparent 50%, ${alpha('#000000', 0.45)} 100%)`,
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
                    width: 22,
                    height: 3,
                    bgcolor: USER_COLORS.gold,
                    '&:not(.Mui-selected)': {
                      bgcolor: alpha('#ffffff', 0.25),
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
                opacity: index === carousel.thumbs.selectedIndex ? 1 : 0.55,
                border:
                  index === carousel.thumbs.selectedIndex
                    ? `2px solid ${USER_COLORS.gold}`
                    : `2px solid ${alpha('#ffffff', 0.1)}`,
                borderRadius: 0,
                transition: 'opacity 0.25s ease, border-color 0.25s ease',
                '&:hover': { opacity: 1 },
              }}
            />
          ))}
        </CarouselThumbs>
      ) : null}
    </Box>
  );
}
