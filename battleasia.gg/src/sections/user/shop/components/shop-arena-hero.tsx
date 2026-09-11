import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

import { GoToBacShopButton } from './go-to-bac-shop-button';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurns = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.08) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1) translate3d(0, 0, 0); }
`;

const pulseBadge = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;
// ----------------------------------------------------------------------

type ShopStat = {
  label: string;
  value: string;
  icon?: string;
};

type ShopArenaHeroProps = {
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  verifiedLabel: string;
  ctaLabel: string;
  ctaHref: string;
  stats: ShopStat[];
};

const STAT_ICONS = [
  'solar:wallet-money-bold-duotone',
  'solar:bolt-bold-duotone',
  'solar:clock-circle-bold-duotone',
];

/** High-Aesthetic Esports Cyberpunk Storefront Hero Banner */
export function ShopArenaHero({
  badge,
  title,
  description,
  imageUrl,
  verifiedLabel,
  ctaLabel,
  ctaHref,
  stats,
}: ShopArenaHeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: '100%', sm: 'auto' },
        mx: { xs: 0, sm: -3, md: -4 },
        mt: { xs: 0, sm: -2, md: -3 },
        mb: { xs: 3.5, md: 4.5 },
        minHeight: { xs: 'auto', sm: 520, md: 580 },
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-end' },
        overflow: 'hidden',
        bgcolor: '#030509',
        borderTop: `1px solid ${goldAlpha(0.3)}`,
        borderBottom: `1px solid ${goldAlpha(0.3)}`,
        boxShadow: `0 24px 60px ${alpha('#000000', 0.95)}`,
      }}
    >
      {/* Background Image & Multi-layer Overlays */}
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
          src={imageUrl}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center center',
            filter: 'contrast(1.08) brightness(0.9)',
            animation: `${kenBurns} 28s ease-in-out infinite`,
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

        {/* Ambient Radial & Vignette Gradient Stack */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 65% 50% at 20% 35%, ${goldAlpha(0.24)} 0%, transparent 65%),
              linear-gradient(90deg, ${alpha('#030509', 0.95)} 0%, ${alpha('#030509', 0.72)} 50%, ${alpha('#030509', 0.45)} 100%),
              linear-gradient(180deg, ${alpha('#030509', 0.6)} 0%, transparent 35%, ${alpha('#030509', 0.96)} 100%)
            `,
          }}
        />
      </Box>

      {/* Hero Content Stack */}
      <Stack
        spacing={{ xs: 2, md: 2.5 }}
        sx={{
          position: 'relative',
          zIndex: 3,
          width: 1,
          px: { xs: 3, sm: 4, md: 6 },
          pt: { xs: 3.5, sm: 6, md: 6 },
          pb: { xs: 4, md: 5.5 },
          maxWidth: { md: 820 },
        }}
      >
        {/* Top Cyber HUD Badges */}
        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
          {/* Badge 1: Store Type HUD Tag */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 0.6,
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
              {badge}
            </Typography>
          </Stack>

          {/* Badge 2: Verified Security Tag */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
            sx={{
              px: 1.25,
              py: 0.6,
              border: `1px solid ${goldAlpha(0.35)}`,
              bgcolor: goldAlpha(0.08),
              backdropFilter: 'blur(8px)',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:shield-check-bold" width={14} sx={{ color: GOLD }} />
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
              {verifiedLabel}
            </Typography>
          </Stack>
        </Stack>

        {/* Hero Title with Gold Gradient Text Effect */}
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, sm: 48, md: 62 },
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: { xs: 0.5, md: 1 },
            textTransform: 'uppercase',
            wordBreak: 'break-word',
            background: `linear-gradient(135deg, #FFFFFF 25%, ${goldAlpha(0.95)} 70%, ${GOLD} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 4px 16px ${alpha('#000000', 0.8)})`,
          }}
        >
          {title}
        </Typography>

        {/* Subtitle Description */}
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 14, md: 16.5 },
            lineHeight: 1.6,
            color: alpha('#ffffff', 0.72),
            maxWidth: 620,
            textShadow: `0 2px 8px ${alpha('#000000', 0.8)}`,
          }}
        >
          {description}
        </Typography>


        {/* Store CTA â€” shared solid gold pulse button */}
        <Box sx={{ mt: { xs: 0.5, md: 0.75 }, mb: { xs: 0.25, md: 0.5 } }}>
          <GoToBacShopButton label={ctaLabel} href={ctaHref} />
        </Box>

        {/* Telemetry stats â€” one strip, no separate boxes */}
        <Box
          sx={{
            pt: 1,
            width: 1,
            maxWidth: { md: 680 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
              width: 1,
              bgcolor: alpha('#06090e', 0.72),
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${goldAlpha(0.28)}`,
              borderTop: `2px solid ${GOLD}`,
              boxShadow: `0 8px 24px ${alpha('#000000', 0.5)}, inset 0 0 14px ${goldAlpha(0.05)}`,
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
            }}
          >
            {stats.map((stat, index) => {
              const iconName = stat.icon || STAT_ICONS[index % STAT_ICONS.length];
              return (
                <Box
                  key={stat.label}
                  sx={{
                    position: 'relative',
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 1.35, sm: 1.6 },
                    minWidth: 0,
                    borderRight:
                      index < stats.length - 1
                        ? `1px solid ${alpha('#ffffff', 0.1)}`
                        : 'none',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Iconify icon={iconName} width={16} sx={{ color: GOLD, flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontSize: { xs: 9.5, sm: 10.5 },
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: alpha('#ffffff', 0.6),
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Stack>

                  <Typography
                    className="font-tr"
                    sx={{
                      fontSize: { xs: 16, sm: 20, md: 22 },
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1.1,
                      wordBreak: 'break-word',
                      textShadow: `0 0 10px ${goldAlpha(0.3)}`,
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

