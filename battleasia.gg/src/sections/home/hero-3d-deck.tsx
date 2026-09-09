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

const titleShimmer = keyframes`
  0% { background-position: 120% 50%; }
  100% { background-position: -40% 50%; }
`;

const asiaPulse = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(var(--ba-gold-rgb), 0.45));
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 22px rgba(var(--ba-gold-rgb), 0.85)) drop-shadow(0 0 40px rgba(var(--ba-gold-rgb), 0.4));
    opacity: 1;
  }
`;

const slashDraw = keyframes`
  0% { transform: scaleX(0); opacity: 0; }
  40% { opacity: 1; }
  100% { transform: scaleX(1); opacity: 1; }
`;

const ghostDrift = keyframes`
  0%, 100% { transform: translate(0, 0); opacity: 0.35; }
  33% { transform: translate(2px, -1px); opacity: 0.55; }
  66% { transform: translate(-2px, 1px); opacity: 0.4; }
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
    xs: 'clamp(2.35rem, 9vw, 2.75rem)',
    sm: 'clamp(2.75rem, 7vw, 3.35rem)',
    md: 'clamp(2.85rem, 4.6vw, 3.75rem)',
    lg: 'clamp(3.1rem, 4.2vw, 4.25rem)',
  } as const;

  return (
    <Stack
      spacing={{ xs: 1.5, sm: 1.75, md: 2 }}
      sx={{
        position: 'relative',
        zIndex: 2,
        width: { xs: '100%', md: 'auto' },
        maxWidth: { xs: '100%', sm: 480, md: 'min(520px, calc(100vw - 64px))', lg: 'min(560px, calc(100vw - 96px))' },
        minWidth: 0,
        boxSizing: 'border-box',
        alignItems: { xs: 'center', md: 'flex-end' },
        textAlign: { xs: 'center', md: 'right' },
        // Keep 3D float mild so perspective + parent overflow:hidden don't clip the right edge.
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
          px: 1.5,
          py: 0.5,
          borderRadius: '20px',
          bgcolor: alpha('#060a10', 0.82),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${goldAlpha(0.4)}`,
          boxShadow: `0 0 16px ${goldAlpha(0.15)}, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'var(--ba-gold)',
            boxShadow: `0 0 10px var(--ba-gold)`,
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
          minHeight: { xs: 72, sm: 88, md: 104 },
        }}
      >
        {/* Soft gold bloom behind the mark */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: '42%',
            right: { xs: '50%', md: 0 },
            transform: { xs: 'translate(50%, -50%)', md: 'translateY(-50%)' },
            width: { xs: 220, sm: 280, md: 300 },
            height: { xs: 70, sm: 90, md: 100 },
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${goldAlpha(0.35)} 0%, transparent 70%)`,
            filter: 'blur(22px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

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
          {/* Chromatic ghost layers */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: { xs: 'center', md: 'flex-end' },
              columnGap: { xs: 1, sm: 1.25, md: 1.5 },
              color: alpha('#38bdf8', 0.35),
              fontFamily: `'Barlow', sans-serif`,
              fontWeight: 800,
              fontSize: titleSize,
              letterSpacing: { xs: '-0.02em', md: '-0.03em' },
              textTransform: 'uppercase',
              transform: 'translate(-2px, 1px)',
              animation: `${ghostDrift} 5s ease-in-out infinite`,
              pointerEvents: 'none',
              zIndex: 0,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.2 },
            }}
          >
            <Box component="span">Battle</Box>
            <Box component="span">Asia</Box>
          </Box>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: { xs: 'center', md: 'flex-end' },
              columnGap: { xs: 1, sm: 1.25, md: 1.5 },
              color: alpha('#fb7185', 0.28),
              fontFamily: `'Barlow', sans-serif`,
              fontWeight: 800,
              fontSize: titleSize,
              letterSpacing: { xs: '-0.02em', md: '-0.03em' },
              textTransform: 'uppercase',
              transform: 'translate(2px, -1px)',
              animation: `${ghostDrift} 5s ease-in-out infinite reverse`,
              pointerEvents: 'none',
              zIndex: 0,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.15 },
            }}
          >
            <Box component="span">Battle</Box>
            <Box component="span">Asia</Box>
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
              backgroundImage: `
                linear-gradient(
                  115deg,
                  #9ca3af 0%,
                  #f8fafc 18%,
                  #e2e8f0 32%,
                  #ffffff 48%,
                  #cbd5e1 62%,
                  #f1f5f9 78%,
                  #94a3b8 100%
                )
              `,
              backgroundSize: '220% 100%',
              animation: `${titleShimmer} 7s linear infinite`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `
                drop-shadow(0 10px 18px rgba(0,0,0,0.85))
                drop-shadow(0 0 18px rgba(255,255,255,0.18))
              `,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                backgroundPosition: '50% 50%',
              },
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
              backgroundImage: `
                linear-gradient(
                  125deg,
                  var(--ba-gold-dark) 0%,
                  var(--ba-gold) 28%,
                  #fff4b0 48%,
                  var(--ba-gold-light) 62%,
                  var(--ba-gold) 82%,
                  var(--ba-gold-dark) 100%
                )
              `,
              backgroundSize: '200% 100%',
              animation: `${titleShimmer} 5.5s linear infinite, ${asiaPulse} 3.2s ease-in-out infinite`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                backgroundPosition: '40% 50%',
                filter: `drop-shadow(0 0 12px ${goldAlpha(0.55)})`,
              },
            }}
          >
            Asia
          </Box>
        </Typography>

        {/* Kinetic gold underline under ASIA */}
        <Box
          aria-hidden
          sx={{
            mt: { xs: 0.75, md: 1 },
            width: { xs: 88, sm: 120, md: 148 },
            height: 3,
            alignSelf: { xs: 'center', md: 'flex-end' },
            mr: { md: 0.5 },
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent, var(--ba-gold), #fff4b0, var(--ba-gold), transparent)`,
            boxShadow: `0 0 14px ${goldAlpha(0.7)}`,
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
          boxShadow: `0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 12.5, sm: 14, md: 15 },
            color: alpha('#ffffff', 0.92),
            lineHeight: 1.5,
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            overflowWrap: 'anywhere',
          }}
        >
          {t('home.subtitle')}
        </Typography>
      </Box>

      {/* 3D Cyber Action Deck with High-Impact Creative Hover Effects */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        useFlexGap
        sx={{
          width: '100%',
          maxWidth: '100%',
          justifyContent: { xs: 'center', md: 'flex-end' },
          flexWrap: 'wrap',
          pt: 0.5,
          boxSizing: 'border-box',
        }}
      >
        {/* Primary 3D Tactical Cyber Download Button (Active State matching screenshot) */}
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
              position: 'relative',
              overflow: 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minHeight: { xs: 48, sm: 52 },
              px: { xs: 2, sm: 2.5 },
              py: 1.2,
              width: { xs: 1, sm: 'auto' },
              minWidth: { sm: 215 },
              borderRadius: '8px',
              clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
              background: `linear-gradient(90deg, ${goldAlpha(0.2)} 0%, rgba(10, 14, 22, 0.85) 100%)`,
              border: `1px solid ${goldAlpha(0.55)}`,
              boxShadow: `0 0 20px ${goldAlpha(0.3)}, 0 4px 12px rgba(0, 0, 0, 0.35)`,
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-140%',
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
                transform: 'skewX(-20deg)',
                transition: 'left 0.6s ease',
                pointerEvents: 'none',
              },
              '&:hover': {
                bgcolor: goldAlpha(0.25),
                borderColor: 'var(--ba-gold, #f5c518)',
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 24px ${goldAlpha(0.45)}`,
                '&::before': {
                  left: '160%',
                },
                '& .btn-icon-pod': {
                  bgcolor: goldAlpha(0.3),
                  borderColor: 'var(--ba-gold, #f5c518)',
                  transform: 'scale(1.06)',
                  boxShadow: `0 0 18px ${goldAlpha(0.4)}`,
                },
                '& .btn-label': {
                  color: 'var(--ba-gold-light, #ffd84d)',
                },
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {/* Active Glowing Left Strip */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3.5,
                bgcolor: 'var(--ba-gold, #f5c518)',
                boxShadow: '0 0 14px var(--ba-gold, #f5c518)',
                zIndex: 2,
              }}
            />

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, zIndex: 1 }}>
              {/* Standalone Icon Pod */}
              <Box
                className="btn-icon-pod"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: goldAlpha(0.2),
                  border: `1px solid ${goldAlpha(0.45)}`,
                  color: 'var(--ba-gold, #f5c518)',
                  boxShadow: `0 0 14px ${goldAlpha(0.25)}`,
                  transition: 'all 0.22s ease',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:download-bold" width={20} />
              </Box>

              {/* Standalone Label */}
              <Typography
                className="btn-label"
                sx={{
                  fontSize: { xs: 13.5, sm: 14.5 },
                  fontWeight: 900,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  textShadow: `0 0 12px ${goldAlpha(0.5)}`,
                  transition: 'color 0.2s ease',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('home.downloadApkButton')}
              </Typography>
            </Stack>
          </ButtonBase>
        )}

        {/* Secondary 3D Tactical Cyber Button: Explore Arena */}
        <ButtonBase
          onClick={handleScrollToTournaments}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: { xs: 48, sm: 52 },
            px: { xs: 2, sm: 2.5 },
            py: 1.2,
            width: { xs: 1, sm: 'auto' },
            minWidth: { sm: 200 },
            borderRadius: '8px',
            clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
            bgcolor: 'rgba(12, 17, 26, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-140%',
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
              transform: 'skewX(-20deg)',
              transition: 'left 0.6s ease',
              pointerEvents: 'none',
            },
            '&:hover': {
              bgcolor: goldAlpha(0.15),
              borderColor: goldAlpha(0.6),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 18px ${goldAlpha(0.3)}`,
              '&::before': {
                left: '160%',
              },
              '& .btn-left-strip': {
                opacity: 1,
              },
              '& .btn-icon-pod': {
                color: 'var(--ba-gold, #f5c518)',
                bgcolor: goldAlpha(0.22),
                borderColor: goldAlpha(0.55),
                boxShadow: `0 0 14px ${goldAlpha(0.25)}`,
                transform: 'scale(1.06)',
              },
              '& .btn-label': {
                color: 'var(--ba-gold-light, #ffd84d)',
              },
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {/* Hover Glow Left Strip */}
          <Box
            className="btn-left-strip"
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3.5,
              bgcolor: 'var(--ba-gold, #f5c518)',
              boxShadow: '0 0 14px var(--ba-gold, #f5c518)',
              opacity: 0,
              transition: 'opacity 0.22s ease',
              zIndex: 2,
            }}
          />

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, zIndex: 1 }}>
            {/* Standalone Icon Pod */}
            <Box
              className="btn-icon-pod"
              sx={{
                width: 38,
                height: 38,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                transition: 'all 0.22s ease',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:gamepad-bold" width={20} />
            </Box>

            {/* Standalone Label */}
            <Typography
              className="btn-label"
              sx={{
                fontSize: { xs: 13.5, sm: 14.5 },
                fontWeight: 900,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.9),
                transition: 'color 0.2s ease',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {t('home.playYourGame.enterArena')}
            </Typography>
          </Stack>
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
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'var(--ba-gold)',
                bgcolor: alpha('#06090e', 0.9),
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 20px rgba(0,0,0,0.6), 0 0 14px ${goldAlpha(0.3)}`,
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
