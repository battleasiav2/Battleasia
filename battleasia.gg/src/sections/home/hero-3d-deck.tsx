import { useEffect, useState } from 'react';

import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
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

  const wordSx = {
    position: 'relative' as const,
    display: 'block',
    fontFamily: LANDING_V2.display,
    fontWeight: 700,
    fontSize: { xs: 'clamp(2.45rem, 14vw, 4.2rem)', md: 'clamp(2.5rem, 7vw, 6.2rem)' },
    lineHeight: 0.86,
    letterSpacing: '-0.05em',
    textTransform: 'uppercase' as const,
    transform: { xs: 'rotateX(8deg)', md: 'rotateX(10deg)' },
    transformOrigin: 'left bottom',
  };

  return (
    <Stack
      spacing={0}
      sx={{
        position: 'relative',
        zIndex: 2,
        width: { xs: '100%', md: 'auto' },
        maxWidth: { xs: '100%', md: 720 },
        minWidth: 0,
        boxSizing: 'border-box',
        alignItems: 'flex-start',
        textAlign: 'left',
        perspective: 1100,
        animation: `${deckEnter} 0.85s ${LANDING_V2.ease} both`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          '& .hero-word': { transform: 'none' },
        },
      }}
    >
      <Box
        component="h1"
        aria-label="Battle Asia 2.0"
        className="landing-display"
        sx={{
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          transformStyle: 'preserve-3d',
          userSelect: 'none',
        }}
      >
        <Box
          className="hero-word"
          component="span"
          sx={{
            ...wordSx,
            color: '#f7f7f4',
            textShadow: `
              0 1px 0 #fff,
              0 2px 0 #d8d8d3,
              1px 3px 0 #2a2a2e,
              2px 5px 0 #1c1c20,
              3px 7px 0 #121216,
              5px 10px 0 #0a0a0c,
              10px 20px 26px rgba(0,0,0,0.5)
            `,
          }}
        >
          BATTLE
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: { xs: 1, md: 'clamp(8px, 1.2vw, 14px)' },
          }}
        >
          <Box
            className="hero-word"
            component="span"
            sx={{
              ...wordSx,
              color: 'var(--ba-gold)',
              textShadow: `
                0 1px 0 #f6ffb0,
                0 2px 0 #a8dc14,
                1px 3px 0 #4a5c0a,
                2px 5px 0 #323e08,
                3px 7px 0 #1e2604,
                5px 10px 0 #101402,
                0 0 32px rgba(var(--ba-gold-rgb, 203,251,36), 0.4),
                10px 20px 26px rgba(0,0,0,0.45)
              `,
            }}
          >
            ASIA
          </Box>
          <Box
            component="span"
            sx={{
              mt: { xs: '0.28em', md: '0.22em' },
              px: '0.58em',
              py: '0.32em',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.28)',
              fontFamily: LANDING_V2.display,
              fontWeight: 700,
              fontSize: { xs: '0.7rem', md: 'clamp(0.7rem, 1.25vw, 1.02rem)' },
              letterSpacing: '0.16em',
              color: LANDING_V2.goldInk,
              lineHeight: 1,
              background: `linear-gradient(180deg, #f3ff8c 0%, var(--ba-gold) 48%, #8fb410 100%)`,
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.4),
                0 3px 0 #4a5c0a,
                0 10px 20px -10px rgba(var(--ba-gold-rgb, 203,251,36), 0.55)
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
          lineHeight: 1.45,
        }}
      >
        {t('home.subtitle')}
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        useFlexGap
        sx={{
          mt: 4,
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

      <Box
        component="aside"
        aria-label="Live arena stats"
        sx={{
          ...landingPanelSx,
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'stretch',
          mt: 4.5,
          width: 'min(100%, 520px)',
          overflow: 'hidden',
          borderRadius: '14px',
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
            hud.prizePool != null ? `$${fNumber(hud.prizePool)}` : CONFIG.homeStats.prizeMoney
          }
          gold
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
  gold,
}: {
  label: string;
  value: string;
  live?: boolean;
  gold?: boolean;
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
          color: gold ? 'var(--ba-gold)' : LANDING_V2.text,
          minWidth: 0,
        }}
      >
        {live ? <LivePulseDot size={7} /> : null}
        {value}
      </Typography>
    </Box>
  );
}
