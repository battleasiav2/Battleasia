import { useEffect, useState, type ReactNode } from 'react';

import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import CoinValue from 'src/components/coin-value';
import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales/use-locales';
import { startAppDownload } from 'src/utils/app-download-url';
import { fNumber } from 'src/utils/format-number';

import {
  LANDING_V2,
  landingGhostBtnSx,
  landingPanelSx,
  landingPrimaryBtnSx,
} from './landing-v2-theme';
import { LivePulseDot } from './live-pulse-dot';

// ----------------------------------------------------------------------

const deckEnter = keyframes`
  0% { opacity: 0; transform: translateY(22px); }
  100% { opacity: 1; transform: translateY(0); }
`;

type Hero3dDeckProps = {
  logoSrc: string;
  downloadHref?: string;
  downloadFileName?: string;
  showDownload?: boolean;
};

type HeroHudStats = {
  liveNow: number | null;
  prizePool: number | null;
  online: number | null;
};

/** Clean modern depth — no chunky emboss stack */
const WHITE_WORD_SHADOW = `
  0 1px 0 rgba(255,255,255,0.18),
  0 10px 28px rgba(0,0,0,0.45),
  0 2px 0 rgba(0,0,0,0.35)
`;

export function Hero3dDeck({
  logoSrc,
  downloadHref = '/api/uploads/app/BattleAsia.apk',
  downloadFileName = 'BattleAsia.apk',
  showDownload = true,
}: Hero3dDeckProps) {
  const { t } = useTranslate();
  const [hud, setHud] = useState<HeroHudStats>({
    liveNow: null,
    prizePool: null,
    online: null,
  });

  useEffect(() => {
    const base = (CONFIG.serverUrl || '').replace(/\/$/, '');
    fetch(`${base}/api/v3/public/dashboard`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const platform = json?.data?.platform || json?.platform;
        if (!platform) return;
        setHud({
          liveNow: Number(platform.ongoingMatches) || 0,
          prizePool: Number(platform.totalWinnings) || 0,
          online: Number(platform.todayJoinedUsers) || 0,
        });
      })
      .catch(() => {});
  }, []);

  const handleEnterArena = () => {
    const el =
      document.getElementById('public-dashboard') ||
      document.getElementById('games') ||
      document.getElementById('tournaments');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Modern geometric hero lockup
  const wordSx = {
    position: 'relative' as const,
    display: 'block',
    fontFamily: LANDING_V2.heroDisplay,
    fontWeight: 800,
    fontSize: { xs: 'clamp(2.55rem, 13.5vw, 4rem)', md: 'clamp(3rem, 6.4vw, 5.6rem)' },
    lineHeight: 0.92,
    letterSpacing: '-0.045em',
    textTransform: 'uppercase' as const,
    transform: 'none',
    transformOrigin: 'left bottom',
  };

  return (
    <Stack
      spacing={0}
      sx={{
        position: 'relative',
        zIndex: 2,
        // Zip `.hero-inner`
        width: '100%',
        maxWidth: 720,
        minWidth: 0,
        boxSizing: 'border-box',
        alignItems: 'flex-start',
        textAlign: 'left',
        animation: `${deckEnter} 0.85s ${LANDING_V2.ease} both`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Box
        component="h1"
        aria-label="Battle Asia 2.0"
        className="hero-wordmark"
        sx={{
          m: 0,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          userSelect: 'none',
        }}
      >
        <Box className="hero-word" component="span" sx={{ ...wordSx, color: '#f7f7f4', textShadow: WHITE_WORD_SHADOW }}>
          BATTLE
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(8px, 1.2vw, 14px)',
          }}
        >
          <Box
            className="hero-word"
            component="span"
            sx={{
              ...wordSx,
              background:
                'linear-gradient(180deg, #f3ff9a 0%, var(--ba-gold, #cbfb24) 42%, #9cc410 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.45)) drop-shadow(0 0 22px rgba(var(--ba-gold-rgb, 203,251,36), 0.28))',
            }}
          >
            ASIA
          </Box>

          {/* Zip `.hero-ver` */}
          <Box
            component="span"
            sx={{
              fontFamily: LANDING_V2.heroDisplay,
              fontWeight: 800,
              fontSize: { xs: '0.68rem', md: 'clamp(0.68rem, 1.1vw, 0.92rem)' },
              letterSpacing: '0.14em',
              color: 'var(--ba-gold-ink, #081401)',
              background: 'linear-gradient(180deg, #f3ff8c 0%, var(--ba-gold, #cbfb24) 48%, #8fb410 100%)',
              border: '1px solid rgba(255,255,255,0.28)',
              padding: '0.38em 0.62em',
              borderRadius: '999px',
              marginTop: { xs: '0.42em', md: '0.5em' },
              lineHeight: 1,
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.35),
                0 8px 18px -10px rgba(var(--ba-gold-rgb, 203,251,36), 0.55)
              `,
            }}
          >
            2.0
          </Box>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: '22px',
          maxWidth: '34ch',
          fontFamily: LANDING_V2.sans,
          fontWeight: 500,
          fontSize: { xs: '1.05rem', md: 'clamp(1.05rem, 1.7vw, 1.32rem)' },
          color: 'rgba(244,244,241,0.86)',
          lineHeight: 1.5,
        }}
      >
        {t('home.subtitle')}
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        useFlexGap
        sx={{
          mt: '32px',
          width: 1,
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          '& > *': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        {showDownload && (
          <ButtonBase
            component="a"
            href={downloadHref}
            download={downloadFileName}
            onClick={(event) => {
              event.preventDefault();
              startAppDownload(downloadHref, downloadFileName);
            }}
            sx={{
              ...landingGhostBtnSx,
              minHeight: 48,
              px: 2.75,
              fontSize: '0.82rem',
              gap: 1.25,
            }}
          >
            <Iconify icon="solar:download-bold" width={17} />
            {t('home.downloadApkButton')}
          </ButtonBase>
        )}

        <ButtonBase
          onClick={handleEnterArena}
          sx={{
            ...landingPrimaryBtnSx,
            minHeight: 52,
            px: 3.5,
            fontSize: '0.86rem',
            gap: 1.25,
          }}
        >
          {t('home.playYourGame.enterArena')}
          <Iconify icon="solar:arrow-right-bold" width={18} />
        </ButtonBase>
      </Stack>

      {/* Zip `.hero-hud` — hidden below ~1100px */}
      <Box
        component="aside"
        aria-label="Live arena stats"
        sx={{
          ...landingPanelSx,
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'stretch',
          mt: '36px',
          width: 'min(100%, 520px)',
          overflow: 'hidden',
          borderRadius: '14px',
          gap: 0,
          p: 0,
        }}
      >
        <HudCell
          label={t('home.dashboard.liveNow')}
          value={hud.liveNow != null ? fNumber(hud.liveNow) : '—'}
          live
        />
        <Box sx={{ width: '1px', bgcolor: LANDING_V2.hair, my: 1.25, flex: '0 0 1px' }} />
        <HudCell
          label={t('match.prizePool')}
          value={
            hud.prizePool != null ? (
              <CoinValue
                value={hud.prizePool}
                size={15}
                textSx={{
                  fontFamily: LANDING_V2.display,
                  fontWeight: 600,
                  fontSize: '1.12rem',
                  color: '#ffffff',
                }}
              />
            ) : (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontFamily: LANDING_V2.display,
                  fontWeight: 600,
                  fontSize: '1.12rem',
                  color: '#ffffff',
                }}
              >
                <Box
                  component="img"
                  src={CONFIG.currencyIcon}
                  alt=""
                  sx={{ width: 15, height: 15, flexShrink: 0 }}
                />
                {String(CONFIG.homeStats.prizeMoney).replace(/^\$/, '')}
              </Box>
            )
          }
        />
        <Box sx={{ width: '1px', bgcolor: LANDING_V2.hair, my: 1.25, flex: '0 0 1px' }} />
        <HudCell
          label={t('home.dashboard.todayJoinUsers')}
          value={hud.online != null ? fNumber(hud.online) : CONFIG.homeStats.activePlayers}
        />
      </Box>

      <Box
        component="img"
        src={logoSrc}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        sx={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
    </Stack>
  );
}

function HudCell({
  label,
  value,
  live,
}: {
  label: string;
  value: ReactNode;
  live?: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        px: 2,
        py: 1.75,
        justifyContent: 'center',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.62rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: LANDING_V2.faint,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: LANDING_V2.display,
          fontWeight: 600,
          fontSize: '1.12rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.9,
          color: '#ffffff',
          minWidth: 0,
        }}
      >
        {live ? <LivePulseDot size={7} /> : null}
        {value}
      </Typography>
    </Box>
  );
}
