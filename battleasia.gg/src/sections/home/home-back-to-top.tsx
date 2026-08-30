import { useEffect, useState } from 'react';

import { Fab, Zoom } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { HOME_GOLD } from './home-blur-panel';

const SCROLL_THRESHOLD = 480;

export function HomeBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={visible}>
      <Fab
        size="medium"
        aria-label="Back to top"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: { xs: 88, md: 24 },
          zIndex: 1190,
          bgcolor: alpha('#161618', 0.92),
          color: HOME_GOLD,
          border: `1px solid ${alpha(HOME_GOLD, 0.45)}`,
          boxShadow: `0 8px 24px ${alpha('#000000', 0.45)}, 0 0 18px ${alpha(HOME_GOLD, 0.12)}`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          '&:hover': {
            bgcolor: alpha('#161618', 0.98),
            boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, 0 0 24px ${alpha(HOME_GOLD, 0.2)}`,
          },
        }}
      >
        <Iconify icon="eva:arrow-upward-fill" width={22} />
      </Fab>
    </Zoom>
  );
}
