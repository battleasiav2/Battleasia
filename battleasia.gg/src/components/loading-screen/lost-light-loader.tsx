import { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { resolveAccentId, getAccentPalette } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

export type LostLightLoaderProps = {
  onComplete?: () => void;
  minDuration?: number;
};

export function LostLightLoader({ onComplete, minDuration = 650 }: LostLightLoaderProps) {
  const settings = useSettingsContext();
  const accentId = resolveAccentId(settings.state.primaryColor);
  const palette = getAccentPalette(accentId);

  const [progress, setProgress] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const path = window.location.pathname || '';
    const isHome =
      path === '/' || path === '/index.html' || path === '' || path === '/dashboard';
    let hasShown = false;
    try {
      hasShown = !!sessionStorage.getItem('ba_home_loader_shown');
    } catch {
      // ignore
    }

    if (!isHome || hasShown) {
      setIsDone(true);
      document.getElementById('boot-shell')?.remove();
      document.getElementById('boot-shell-css')?.remove();
      onComplete?.();
      return undefined;
    }

    const bootProgressEl = document.getElementById('boot-loader-percent');
    let startVal = 0;
    if (bootProgressEl) {
      const match = bootProgressEl.innerText.match(/\d+/);
      if (match) startVal = Math.min(parseInt(match[0], 10), 60);
    }

    setProgress(startVal);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const t = Math.min(elapsed / minDuration, 1);
      const eased = 1 - (1 - t) ** 2;
      const current = Math.max(startVal, Math.min(100, eased * 100));
      setProgress(current);

      const bootPercent = document.getElementById('boot-loader-percent');
      const bootBar = document.getElementById('boot-loader-bar');
      if (bootPercent) bootPercent.textContent = `${Math.round(current)}%`;
      if (bootBar) bootBar.style.width = `${current}%`;

      if (t < 1) {
        rafRef.current = requestAnimationFrame(updateProgress);
        return;
      }

      setProgress(100);
      setIsDismissing(true);
      try {
        sessionStorage.setItem('ba_home_loader_shown', 'true');
      } catch {
        // ignore
      }

      const bootShell = document.getElementById('boot-shell');
      if (bootShell) {
        bootShell.style.opacity = '0';
        bootShell.style.transition = 'opacity 0.3s ease-out';
        window.setTimeout(() => {
          bootShell.remove();
          document.getElementById('boot-shell-css')?.remove();
        }, 320);
      }

      window.setTimeout(() => {
        setIsDone(true);
        onComplete?.();
      }, 320);
    };

    rafRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [minDuration, onComplete]);

  if (isDone) return null;

  const rounded = Math.round(progress);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483640,
        bgcolor: '#060607',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isDismissing ? 'none' : 'all',
        opacity: isDismissing ? 0 : 1,
        transition: 'opacity 0.3s ease-out',
        overflow: 'hidden',
        fontFamily: '"Satoshi", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Soft arena glow — matches home character aura */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: { xs: '90vw', sm: 520 },
          height: { xs: '90vw', sm: 520 },
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${palette.rgb}, 0.22) 0%, rgba(${palette.rgb}, 0.06) 42%, transparent 70%)`,
          animation: 'ba-loader-glow 2.8s ease-in-out infinite',
          '@keyframes ba-loader-glow': {
            '0%, 100%': { opacity: 0.7, transform: 'scale(0.96)' },
            '50%': { opacity: 1, transform: 'scale(1.04)' },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: { xs: 'min(86vw, 320px)', sm: 340 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 2.5, sm: 3 },
        }}
      >
        {/* Crest */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 112, sm: 128 },
            height: { xs: 112, sm: 128 },
            display: 'grid',
            placeItems: 'center',
            animation: 'ba-loader-float 2.6s ease-in-out infinite',
            '@keyframes ba-loader-float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-6px)' },
            },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              border: `1px solid rgba(${palette.rgb}, 0.28)`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(${palette.rgb}, 0.18)`,
            }}
          />
          <Box
            component="img"
            src="/logo/logo.webp"
            alt="BattleAsia"
            width={128}
            height={128}
            sx={{
              width: { xs: 96, sm: 112 },
              height: { xs: 96, sm: 112 },
              objectFit: 'contain',
              filter: `drop-shadow(0 12px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(${palette.rgb}, 0.35))`,
            }}
          />
        </Box>

        {/* Wordmark — home hero language */}
        <Box sx={{ textAlign: 'center', userSelect: 'none' }}>
          <Typography
            component="div"
            sx={{
              fontFamily: '"Clash Display", "Satoshi", "Barlow", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '1.85rem', sm: '2.15rem' },
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              color: '#f4f4f1',
            }}
          >
            Battle
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 1,
              mt: 0.35,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: '"Clash Display", "Satoshi", "Barlow", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '1.85rem', sm: '2.15rem' },
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: palette.gold,
              }}
            >
              Asia
            </Typography>
            <Box
              component="span"
              sx={{
                mt: 0.35,
                px: 0.75,
                py: 0.35,
                borderRadius: '8px',
                fontFamily: '"Clash Display", "Satoshi", sans-serif',
                fontWeight: 700,
                fontSize: '0.68rem',
                letterSpacing: '0.14em',
                color: palette.ink,
                background: `linear-gradient(180deg, ${palette.goldLight} 0%, ${palette.gold} 55%, ${palette.goldDark} 100%)`,
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: `0 3px 0 rgba(0,0,0,0.35), 0 8px 18px -10px rgba(${palette.rgb}, 0.55)`,
              }}
            >
              2.0
            </Box>
          </Box>
        </Box>

        {/* Glass progress rail */}
        <Box
          sx={{
            width: 1,
            mt: 0.5,
            px: 2,
            py: 1.75,
            borderRadius: '14px',
            bgcolor: 'rgba(22,22,24,0.55)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 20px 50px -30px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.1,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(244,244,241,0.45)',
              }}
            >
              Entering arena
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Clash Display", "Satoshi", sans-serif',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#ffffff',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {rounded}%
            </Typography>
          </Box>
          <Box
            sx={{
              width: 1,
              height: 3,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: 1,
                width: `${progress}%`,
                borderRadius: 2,
                background: `linear-gradient(90deg, rgba(${palette.rgb}, 0.35), ${palette.gold})`,
                boxShadow: `0 0 12px rgba(${palette.rgb}, 0.55)`,
                transition: 'width 0.05s linear',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
