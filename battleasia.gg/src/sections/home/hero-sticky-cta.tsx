import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { HeroMeshButtons } from 'src/components/mesh-buttons';

type HeroStickyCtaProps = {
  playNowLabel?: string;
  playNowHref?: string;
  downloadLabel?: string;
  downloadHref?: string;
  downloadFileName?: string;
  showDownload?: boolean;
  showPlayNow?: boolean;
};

/** Mobile-only sticky CTAs after hero scrolls away */
export function HeroStickyCta({
  playNowLabel,
  playNowHref,
  downloadLabel,
  downloadHref,
  downloadFileName,
  showDownload = true,
  showPlayNow = true,
}: HeroStickyCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('home');
    if (!hero) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        px: 1.5,
        pt: 1,
        pb: 'max(10px, env(safe-area-inset-bottom))',
        bgcolor: alpha('#141414', 0.96),
        borderTop: `1px solid ${alpha('#f5c518', 0.28)}`,
        boxShadow: `0 -8px 24px ${alpha('#000000', 0.45)}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <HeroMeshButtons
        playNowLabel={playNowLabel}
        playNowHref={playNowHref}
        downloadLabel={downloadLabel}
        downloadHref={downloadHref}
        downloadFileName={downloadFileName}
        showDownload={showDownload}
        showPlayNow={showPlayNow}
      />
    </Box>
  );
}
