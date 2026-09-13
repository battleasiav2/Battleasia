import React from 'react';

import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { goldAlpha } from 'src/theme/accent-presets';
import { startAppDownload } from 'src/utils/app-download-url';

// ----------------------------------------------------------------------

const deckEnter = keyframes`
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const floatDeck3d = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const slashDraw = keyframes`
  0% { transform: scaleX(0); opacity: 0; }
  40% { opacity: 1; }
  100% { transform: scaleX(1); opacity: 1; }
`;

type Hero3dDeckProps = {
  logoSrc: string;
  downloadHref?: string;
  downloadFileName?: string;
  showDownload?: boolean;
};

export function Hero3dDeck({
  logoSrc,
  downloadHref = '/api/uploads/app/BattleAsia.apk',
  downloadFileName = 'BattleAsia.apk',
  showDownload = true,
}: Hero3dDeckProps) {
  const { t } = useTranslate();

  const handleScrollToTournaments = () => {
    const el = document.getElementById('games') || document.getElementById('tournaments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const titleSize = {
    xs: 'clamp(2rem, 8.5vw, 2.45rem)',
    sm: 'clamp(2.75rem, 7vw, 3.35rem)',
    md: 'clamp(2.85rem, 4.6vw, 3.75rem)',
    lg: 'clamp(3.1rem, 4.2vw, 4.25rem)',
  } as const;

  return (
    <Stack
      spacing={{ xs: 1.25, sm: 1.75, md: 2 }}
      sx={{
        position: 'relative',
        zIndex: 2,
        width: { xs: '100%', md: 'auto' },
        maxWidth: { xs: '100%', sm: 480, md: 'min(520px, calc(100vw - 64px))', lg: 'min(560px, calc(100vw - 96px))' },
        minWidth: 0,
        boxSizing: 'border-box',
        alignItems: { xs: 'stretch', md: 'flex-end' },
        textAlign: { xs: 'center', md: 'right' },
        animation: `${deckEnter} 0.9s cubic-bezier(0.16, 1, 0.3, 1) both, ${floatDeck3d} 8s 1s ease-in-out infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      {/* 3D Cyber Signal Pill */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          alignSelf: { xs: 'center', md: 'flex-end' },
          px: 1.5,
          py: 0.5,
          borderRadius: '20px',
          bgcolor: alpha('#060a10', 0.82),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${goldAlpha(0.35)}`,
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'var(--ba-gold)',
          }}
        />
        <Typography
          sx={{
            fontSize: { xs: 10, sm: 11 },
            fontWeight: 800,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: 'var(--ba-gold-light)',
            lineHeight: 1,
          }}
        >
          {t('common.brandTagline')}
        </Typography>
      </Stack>

      {/* Signature arena wordmark — chrome BATTLE + gold ASIA */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', md: 'flex-end' },
          minHeight: { xs: 56, sm: 88, md: 104 },
        }}
      >
        <Typography
          component="h1"
          aria-label="Battle Asia"
          sx={{
            position: 'relative',
            zIndex: 1,
            m: 0,
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: { xs: 'center', md: 'flex-end' },
            columnGap: { xs: 1, sm: 1.25, md: 1.5 },
            rowGap: 0,
            lineHeight: 0.88,
            userSelect: 'none',
            boxSizing: 'border-box',
          }}
        >
          <Box
            component="span"
            sx={{
              position: 'relative',
              zIndex: 1,
              fontFamily: `'Barlow', sans-serif`,
              fontWeight: 800,
              fontSize: titleSize,
              letterSpacing: { xs: '-0.02em', md: '-0.03em' },
              textTransform: 'uppercase',
              color: '#f1f5f9',
              textShadow: '0 2px 12px rgba(0,0,0,0.65)',
            }}
          >
            Battle
          </Box>

          <Box
            component="span"
            sx={{
              position: 'relative',
              zIndex: 1,
              fontFamily: `'Barlow', sans-serif`,
              fontWeight: 800,
              fontSize: titleSize,
              letterSpacing: { xs: '-0.02em', md: '-0.03em' },
              textTransform: 'uppercase',
              color: 'var(--ba-gold)',
            }}
          >
            Asia
          </Box>
        </Typography>

        {/* Underline under ASIA */}
        <Box
          aria-hidden
          sx={{
            mt: { xs: 0.75, md: 1 },
            width: { xs: 88, sm: 120, md: 148 },
            height: 2,
            alignSelf: { xs: 'center', md: 'flex-end' },
            mr: { md: 0.5 },
            borderRadius: 1,
            bgcolor: 'var(--ba-gold)',
            boxShadow: 'none',
            transformOrigin: { xs: 'center', md: 'right' },
            animation: `${slashDraw} 0.9s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />

        {/* Keep logo asset for preload / SEO crawlers that expect the image path */}
        <Box
          component="img"
          src={logoSrc}
          alt=""
          aria-hidden
          loading="eager"
          decoding="async"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* 3D Glass Tactical Subtitle Panel */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          borderRadius: '8px',
          bgcolor: alpha('#06090e', 0.7),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${alpha('#ffffff', 0.08)}`,
          borderRight: { md: `3px solid var(--ba-gold)` },
          borderLeft: { xs: `3px solid var(--ba-gold)`, md: `1px solid ${alpha('#ffffff', 0.08)}` },
          boxShadow: 'none',
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 12.5, sm: 14, md: 15 },
            color: alpha('#ffffff', 0.92),
            lineHeight: 1.5,
            fontWeight: 500,
            overflowWrap: 'anywhere',
          }}
        >
          {t('home.subtitle')}
        </Typography>
      </Box>

      {/* 3D Cyber Action Deck with High-Impact Creative Hover Effects */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        useFlexGap
        sx={{
          width: '100%',
          maxWidth: '100%',
          justifyContent: { xs: 'center', md: 'flex-end' },
          flexWrap: 'wrap',
          pt: { xs: 0.75, sm: 0.5 },
          pb: { xs: 0.5, md: 0 },
          boxSizing: 'border-box',
          flexShrink: 0,
          position: 'relative',
          zIndex: 4,
        }}
      >
        {/* Pulse-simple CTAs */}
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
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              minHeight: { xs: 40, sm: 42 },
              px: { xs: 1.75, sm: 2.25 },
              width: { xs: 1, sm: 'auto' },
              minWidth: { sm: 180 },
              borderRadius: '4px',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: 'none',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
              '&:hover': {
                bgcolor: goldAlpha(0.12),
                borderColor: goldAlpha(0.45),
              },
            }}
          >
            <Iconify icon="solar:download-bold" width={18} sx={{ color: 'var(--ba-gold, #cbfb24)' }} />
            <Typography
              sx={{
                fontSize: { xs: 12.5, sm: 13.5 },
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.9),
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {t('home.downloadApkButton')}
            </Typography>
          </ButtonBase>
        )}

        <ButtonBase
          onClick={handleScrollToTournaments}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            minHeight: { xs: 40, sm: 42 },
            px: { xs: 1.75, sm: 2.25 },
            width: { xs: 1, sm: 'auto' },
            minWidth: { sm: 170 },
            borderRadius: '4px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'none',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            '&:hover': {
              bgcolor: goldAlpha(0.12),
              borderColor: goldAlpha(0.45),
            },
          }}
        >
          <Iconify icon="solar:gamepad-bold" width={18} sx={{ color: 'var(--ba-gold, #cbfb24)' }} />
          <Typography
            sx={{
              fontSize: { xs: 12.5, sm: 13.5 },
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: alpha('#ffffff', 0.9),
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {t('home.playYourGame.enterArena')}
          </Typography>
        </ButtonBase>
      </Stack>

      {/* 3D Tactical Trust Badges */}
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1.25 }}
        flexWrap="wrap"
        useFlexGap
        justifyContent={{ xs: 'center', md: 'flex-end' }}
        sx={{ pt: 1 }}
      >
        {[
          { icon: 'solar:shield-check-bold-duotone', label: t('auth.featureSecure') },
          { icon: 'solar:cup-star-bold-duotone', label: t('auth.featureFairPlay') },
          { icon: 'solar:wallet-money-bold-duotone', label: t('auth.featureCashPrizes') },
        ].map((item, idx) => (
          <Stack
            key={idx}
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              px: 1.25,
              py: 0.6,
              borderRadius: '6px',
              bgcolor: alpha('#06090e', 0.72),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              boxShadow: 'none',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                borderColor: goldAlpha(0.45),
                bgcolor: alpha('#06090e', 0.9),
                boxShadow: 'none',
              },
            }}
          >
            <Iconify icon={item.icon} width={14} sx={{ color: 'var(--ba-gold)', flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                color: alpha('#ffffff', 0.8),
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
