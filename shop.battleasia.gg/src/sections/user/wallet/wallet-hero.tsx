import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS, USER_IMAGES } from 'src/layouts/user';
import { BattleGoldDivider } from 'src/components/battle-gold-divider/battle-gold-divider';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const goldAlpha = (opacity: number) => alpha(USER_COLORS.gold, opacity);

const kenBurns = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.06) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1) translate3d(0, 0, 0); }
`;

const pulseBadge = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
`;

type WalletHeroProps = {
  title?: string;
  badge?: string;
  subtitle?: string;
  action?: ReactNode;
  chipLabel?: string;
  chipIcon?: string;
};

export function WalletHero({
  title,
  badge,
  subtitle,
  action,
  chipLabel,
  chipIcon = 'solar:wallet-money-bold',
}: WalletHeroProps) {
  const { t } = useTranslate();

  const displayTitle = title || t('wallet.title') || 'BAC WALLET & ASSET HUB';
  const displayBadge = badge || t('wallet.badge') || 'ASSET MATRIX';
  const displaySubtitle = subtitle || t('wallet.subtitle') || 'Real-time coin ledger, instant withdrawal requests & multi-fiat valuation';

  return (
    <Box
      className="shop-animate-fade-in"
      sx={{
        position: 'relative',
        width: { xs: '100%', sm: 'auto' },
        mx: { xs: 0, sm: -3, md: -4 },
        mt: { xs: -1.5, sm: -3, md: -4 },
        mb: { xs: 3.5, md: 4.5 },
        minHeight: { xs: 'auto', sm: 340, md: 360 },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: '#030509',
        borderTop: `1px solid ${goldAlpha(0.3)}`,
        borderBottom: `1px solid ${goldAlpha(0.3)}`,
        boxShadow: `0 24px 60px ${alpha('#000000', 0.95)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Corner HUD Brackets */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          width: 20,
          height: 20,
          borderTop: `2px solid ${goldAlpha(0.6)}`,
          borderLeft: `2px solid ${goldAlpha(0.6)}`,
          zIndex: 4,
          pointerEvents: 'none',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 20,
          height: 20,
          borderTop: `2px solid ${goldAlpha(0.6)}`,
          borderRight: `2px solid ${goldAlpha(0.6)}`,
          zIndex: 4,
          pointerEvents: 'none',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          width: 20,
          height: 20,
          borderBottom: `2px solid ${goldAlpha(0.6)}`,
          borderLeft: `2px solid ${goldAlpha(0.6)}`,
          zIndex: 4,
          pointerEvents: 'none',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          width: 20,
          height: 20,
          borderBottom: `2px solid ${goldAlpha(0.6)}`,
          borderRight: `2px solid ${goldAlpha(0.6)}`,
          zIndex: 4,
          pointerEvents: 'none',
          display: { xs: 'none', sm: 'block' },
        }}
      />

      {/* Background Image & Overlays */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <Box
          component="img"
          src={USER_IMAGES.pageBg}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center center',
            filter: 'contrast(1.1) brightness(0.8)',
            animation: `${kenBurns} 30s ease-in-out infinite`,
            willChange: 'transform',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />

        {/* Diagonal Scanline Cyber Mesh */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${alpha('#ffffff', 0.015)} 0px,
              ${alpha('#ffffff', 0.015)} 2px,
              transparent 2px,
              transparent 8px
            )`,
            pointerEvents: 'none',
          }}
        />

        {/* Ambient Radial & Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 60% 50% at 20% 40%, ${goldAlpha(0.25)} 0%, transparent 65%),
              linear-gradient(90deg, ${alpha('#030509', 0.96)} 0%, ${alpha('#030509', 0.8)} 50%, ${alpha('#030509', 0.5)} 100%),
              linear-gradient(180deg, ${alpha('#030509', 0.5)} 0%, transparent 40%, ${alpha('#030509', 0.95)} 100%)
            `,
          }}
        />
      </Box>

      {/* Hero Content */}
      <Stack
        spacing={{ xs: 1.75, md: 2 }}
        sx={{
          position: 'relative',
          zIndex: 3,
          width: 1,
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 3.5, sm: 4.5, md: 5 },
          maxWidth: { md: 850 },
        }}
      >
        {/* Badges */}
        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 0.5,
              bgcolor: alpha('#000000', 0.65),
              border: `1px solid ${goldAlpha(0.4)}`,
              boxShadow: `0 4px 14px ${alpha('#000000', 0.5)}, inset 0 0 10px ${goldAlpha(0.08)}`,
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                animation: `${pulseBadge} 2s infinite ease-in-out`,
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: 10, md: 11 },
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: goldAlpha(0.95),
                lineHeight: 1.2,
              }}
            >
              {displayBadge}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
            sx={{
              px: 1.25,
              py: 0.5,
              border: `1px solid ${goldAlpha(0.35)}`,
              bgcolor: goldAlpha(0.08),
              backdropFilter: 'blur(8px)',
              flexShrink: 0,
            }}
          >
            <Iconify icon={chipIcon} width={14} sx={{ color: GOLD }} />
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: '#ffffff',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              {chipLabel || 'BAC MATRIX'}
            </Typography>
          </Stack>
        </Stack>

        {/* Hero Title */}
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 26, sm: 40, md: 48 },
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: { xs: 0.5, md: 1 },
            textTransform: 'uppercase',
            wordBreak: 'break-word',
            background: `linear-gradient(135deg, #FFFFFF 25%, ${goldAlpha(0.95)} 70%, ${GOLD} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 4px 16px ${alpha('#000000', 0.8)})`,
          }}
        >
          {displayTitle}
        </Typography>

        {/* Subtitle */}
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 13, md: 15 },
            lineHeight: 1.55,
            color: alpha('#ffffff', 0.72),
            maxWidth: 620,
            textShadow: `0 2px 8px ${alpha('#000000', 0.8)}`,
          }}
        >
          {displaySubtitle}
        </Typography>

        <BattleGoldDivider variant="hero" sx={{ width: { xs: 140, md: 190 }, my: 0.5 }} />

        {action && <Box sx={{ pt: 0.5 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}

