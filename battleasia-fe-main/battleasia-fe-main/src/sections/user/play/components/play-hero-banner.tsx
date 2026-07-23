import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import {
  GLASS_CARD_RADIUS,
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';
import { Carousel, useCarousel, CarouselSlide, CarouselDotButtons, CarouselArrowFloatButtons } from 'src/components/carousel';

import { USER_COLORS } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

type BannerSlide = {
  title: string;
  description: string;
  imageUrl: string;
};

type PlayHeroBannerProps = {
  slides: BannerSlide[];
  onWatchLive?: () => void;
};

export function PlayHeroBanner({ slides, onWatchLive }: PlayHeroBannerProps) {
  const carousel = useCarousel({ loop: true, align: 'start' });
  const tokens = getDefaultGlassTokens();

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        position: 'relative',
        width: '100%',
        height: { xs: 300, sm: 360, md: 420 },
        mb: { xs: 3, md: 4 },
        p: 0,
        overflow: 'hidden',
      })}
    >
      <Carousel carousel={carousel}>
        {slides.map((slide, index) => (
          <CarouselSlide key={index}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 300, sm: 360, md: 420 },
                backgroundImage: `url(${slide.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `
                    linear-gradient(90deg, ${alpha('#000000', 0.88)} 0%, ${alpha('#000000', 0.45)} 48%, transparent 100%),
                    linear-gradient(180deg, transparent 40%, ${alpha('#000000', 0.75)} 100%)
                  `,
                }}
              />

              <Stack
                spacing={2}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: { xs: 2.5, md: 4 },
                  zIndex: 1,
                  maxWidth: { md: '62%' },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.8,
                    textTransform: 'uppercase',
                    color: alpha(USER_COLORS.gold, 0.9),
                  }}
                >
                  Live Arena
                </Typography>

                <Typography
                  className="font-tr"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: { xs: 28, sm: 36, md: 48 },
                    lineHeight: 1.05,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    textShadow: `0 4px 24px ${alpha('#000000', 0.8)}`,
                  }}
                >
                  {slide.title}
                </Typography>

                <Typography
                  className="font-tr"
                  sx={{
                    color: alpha('#ffffff', 0.78),
                    fontSize: { xs: 14, md: 16 },
                    lineHeight: 1.55,
                    maxWidth: 480,
                  }}
                >
                  {slide.description}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:play-bold" />}
                    onClick={onWatchLive}
                    sx={{
                      background: USER_COLORS.goldGradient,
                      color: '#111111',
                      px: 3,
                      py: 1.1,
                      fontWeight: 800,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      borderRadius: 0,
                      boxShadow: `0 6px 20px ${alpha('#f59e0b', 0.35)}`,
                      '&:hover': {
                        background: USER_COLORS.goldGradientHover,
                      },
                    }}
                  >
                    Watch Live
                  </Button>

                  <Box sx={getGlassBadgeChipSx(tokens)}>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 0.5 }}>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: USER_COLORS.success,
                          boxShadow: `0 0 8px ${alpha(USER_COLORS.success, 0.8)}`,
                          animation: 'livePulse 1.8s ease-in-out infinite',
                          '@keyframes livePulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.45 },
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>
                        LIVE
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </CarouselSlide>
        ))}
      </Carousel>

      <CarouselArrowFloatButtons
        {...carousel.arrows}
        options={carousel.options}
        slotProps={{
          prevBtn: {
            svgIcon: <Iconify icon="solar:alt-arrow-left-bold" />,
            sx: {
              bgcolor: alpha('#000000', 0.65),
              border: `1px solid ${alpha('#ffffff', 0.15)}`,
              ml: 1.5,
              '&:hover': { bgcolor: alpha('#000000', 0.9) },
            },
          },
          nextBtn: {
            svgIcon: <Iconify icon="solar:alt-arrow-right-bold" />,
            sx: {
              bgcolor: alpha('#000000', 0.65),
              border: `1px solid ${alpha('#ffffff', 0.15)}`,
              mr: 1.5,
              '&:hover': { bgcolor: alpha('#000000', 0.9) },
            },
          },
        }}
      />

      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
        <CarouselDotButtons
          {...carousel.dots}
          variant="rounded"
          slotProps={{
            dot: {
              sx: {
                width: 24,
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
    </Box>
  );
}
