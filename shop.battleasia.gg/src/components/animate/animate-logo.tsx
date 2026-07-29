import type { Theme, SxProps } from '@mui/material/styles';

import { m } from 'framer-motion';
import { forwardRef } from 'react';

import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

import { Logo } from '../logo';
import { useImagePreloader } from 'src/hooks';
import { CONFIG } from 'src/global-config';

import type { LogoProps } from '../logo';

// ----------------------------------------------------------------------

export type AnimateLogoProps = React.ComponentProps<'div'> & {
  sx?: SxProps<Theme>;
  logo?: React.ReactNode;
  slotProps?: {
    logo?: LogoProps;
  };
};

export const AnimateLogoZoom = forwardRef<HTMLDivElement, AnimateLogoProps>((props, ref) => {
  const { logo, slotProps, sx, ...other } = props;

  // Preload logo image for better performance
  const logoImagePath = `${CONFIG.assetsDir}/logo/logo.webp`;
  const { isLoaded: isLogoLoaded } = useImagePreloader([logoImagePath], {
    delay: 0,
    continueOnError: true,
  });

  return (
    <LogoZoomRoot ref={ref} sx={sx} {...other}>
      <span>
        {logo ?? (
          isLogoLoaded ? (
            <Logo
              disabled
              {...slotProps?.logo}
              sx={[
                { width: 64, height: 64 },
                ...(Array.isArray(slotProps?.logo?.sx)
                  ? (slotProps?.logo?.sx ?? [])
                  : [slotProps?.logo?.sx]),
              ]}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'action.hover',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          )
        )}
      </span>
    </LogoZoomRoot>
  );
});

const LogoZoomRoot = styled('div')(() => ({
  width: 120,
  height: 120,
  alignItems: 'center',
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export const AnimateLogoRotate = forwardRef<HTMLDivElement, AnimateLogoProps>((props, ref) => {
  const { logo, sx, slotProps, ...other } = props;

  // Preload logo image for better performance
  const logoImagePath = `${CONFIG.assetsDir}/logo/logo.webp`;
  const { isLoaded: isLogoLoaded } = useImagePreloader([logoImagePath], {
    delay: 0,
    continueOnError: true,
  });

  return (
    <LogoRotateRoot ref={ref} sx={sx} {...other}>
      {logo ?? (
        isLogoLoaded ? (
          <Logo
            {...slotProps?.logo}
            sx={[
              { zIndex: 9, width: 40, height: 40 },
              ...(Array.isArray(slotProps?.logo?.sx)
                ? (slotProps?.logo?.sx ?? [])
                : [slotProps?.logo?.sx]),
            ]}
          />
        ) : (
          <Box
            sx={{
              zIndex: 9,
              width: 40,
              height: 40,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )
      )}

      <LogoRotateBackground
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
      />
    </LogoRotateRoot>
  );
});

const LogoRotateRoot = styled('div')(() => ({
  width: 96,
  height: 96,
  alignItems: 'center',
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
}));

const LogoRotateBackground = styled(m.span)(({ theme }) => ({
  width: '100%',
  height: '100%',
  opacity: 0.16,
  borderRadius: '50%',
  position: 'absolute',
  backgroundImage: `linear-gradient(135deg, transparent 50%, ${theme.vars.palette.primary.main} 100%)`,
  transition: theme.transitions.create(['opacity'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
}));
