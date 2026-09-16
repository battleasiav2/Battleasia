import { useState, useEffect } from 'react';

import { LoadingScreen } from './loading-screen';

// ----------------------------------------------------------------------

export type LostLightLoaderProps = {
  onComplete?: () => void;
  minDuration?: number;
};

/** First-paint overlay — same simple bar as every other page. */
export function LostLightLoader({ onComplete, minDuration = 420 }: LostLightLoaderProps) {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let hasShown = false;
    try {
      hasShown = !!sessionStorage.getItem('ba_home_loader_shown');
    } catch {
      // ignore
    }

    const finish = () => {
      document.getElementById('boot-shell')?.remove();
      document.getElementById('boot-shell-css')?.remove();
      try {
        sessionStorage.setItem('ba_home_loader_shown', 'true');
      } catch {
        // ignore
      }
      setIsDone(true);
      onComplete?.();
    };

    if (hasShown) {
      finish();
      return undefined;
    }

    const t = window.setTimeout(finish, minDuration);
    return () => window.clearTimeout(t);
  }, [minDuration, onComplete]);

  if (isDone) return null;

  return (
    <LoadingScreen
      portal={false}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483640,
        minHeight: '100dvh',
      }}
    />
  );
}
