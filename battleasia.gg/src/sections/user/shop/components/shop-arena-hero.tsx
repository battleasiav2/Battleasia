import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurns = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.07) translate3d(-1.2%, -0.8%, 0); }
  100% { transform: scale(1) translate3d(0, 0, 0); }
`;

const bracketPulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.85; }
`;

const sparkTwinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.5); }
  40% { opacity: 0.9; transform: scale(1.15); }
  70% { opacity: 0.3; transform: scale(0.8); }
`;

const SPARKS = [
  { top: '18%', left: '14%', delay: '0s' },
  { top: '32%', left: '78%', delay: '1.4s' },
  { top: '58%', left: '42%', delay: '2.6s' },
  { top: '72%', left: '88%', delay: '0.9s' },
  { top: '44%', left: '8%', delay: '3.2s' },
] as const;

function bracketSx(position: 'tl' | 'tr' | 'bl' | 'br') {
  const base = {
    position: 'absolute' as const,
    width: { xs: 26, md: 40 },
    height: { xs: 26, md: 40 },
    borderColor: alpha(GOLD, 0.6),
    animation: `${bracketPulse} 3.6s ease-in-out infinite`,
    pointerEvents: 'none' as const,
    zIndex: 2,
  };

  if (position === 'tl') {
    return { ...base, top: 14, left: 14, borderTop: '2px solid', borderLeft: '2px solid' };
  }
  if (position === 'tr') {
    return { ...base, top: 14, right: 14, borderTop: '2px solid', borderRight: '2px solid', animationDelay: '0.4s' };
  }
  if (position === 'bl') {
    return { ...base, bottom: 14, left: 14, borderBottom: '2px solid', borderLeft: '2px solid', animationDelay: '0.8s' };
  }
  return { ...base, bottom: 14, right: 14, borderBottom: '2px solid', borderRight: '2px solid', animationDelay: '1.2s' };
}

// ----------------------------------------------------------------------

type ShopStat = {
  label: string;
  value: string;
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

/** Shop storefront hero — same black/gold arena language as Play. */
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
        width: 'auto',
        mx: { xs: -2, sm: -3, md: -4 },
        // Keep under header padding — negative pull was clipping the badge row
        mt: { xs: -1, sm: -2, md: -3 },
        mb: { xs: 3, md: 4 },
        minHeight: { xs: 460, sm: 500, md: 560 },
        display: 'flex',
        alignItems: 'flex-end',
        // Don't clip badge/title — media layers handle their own overflow
        overflow: 'visible',
        bgcolor: '#000000',
        borderTop: `1px solid ${alpha(GOLD, 0.16)}`,
        borderBottom: `1px solid ${alpha(GOLD, 0.16)}`,
      }}
    >
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
            animation: `${kenBurns} 28s ease-in-out infinite`,
            willChange: 'transform',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, ${alpha('#000000', 0.9)} 0%, ${alpha('#000000', 0.6)} 48%, ${alpha('#000000', 0.38)} 100%),
              linear-gradient(180deg, ${alpha('#000000', 0.55)} 0%, transparent 34%, ${alpha('#000000', 0.92)} 100%),
              radial-gradient(ellipse 55% 40% at 18% 22%, ${alpha(GOLD, 0.14)} 0%, transparent 60%)
            `,
          }}
        />

        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            '@media (prefers-reduced-motion: reduce)': { display: 'none' },
          }}
        >
          {SPARKS.map((spark, i) => (
            <Box
              key={`shop-spark-${i}`}
              sx={{
                position: 'absolute',
                top: spark.top,
                left: spark.left,
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: GOLD,
                boxShadow: `0 0 8px ${GOLD}`,
                animation: `${sparkTwinkle} 3s ${spark.delay} ease-in-out infinite`,
              }}
            />
          ))}
        </Box>

        <Box sx={bracketSx('tl')} />
        <Box sx={bracketSx('tr')} />
        <Box sx={bracketSx('bl')} />
        <Box sx={bracketSx('br')} />
      </Box>

      <Stack
        spacing={{ xs: 1.5, md: 2 }}
        sx={{
          position: 'relative',
          zIndex: 3,
          width: 1,
          px: { xs: 3, sm: 4, md: 6 },
          pt: { xs: 5, md: 5 },
          pb: { xs: 4, md: 5 },
          maxWidth: { md: 760 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: alpha(GOLD, 0.92),
            }}
          >
            {badge}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
            sx={{
              px: 1,
              py: 0.4,
              border: `1px solid ${alpha(GOLD, 0.32)}`,
              bgcolor: alpha('#000000', 0.5),
              backdropFilter: 'blur(6px)',
            }}
          >
            <Iconify icon="solar:shield-check-bold" width={12} sx={{ color: GOLD }} />
            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#ffffff' }}>
              {verifiedLabel}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 32, sm: 44, md: 58 },
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: { md: 0.5 },
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: `0 4px 28px ${alpha('#000000', 0.9)}, 0 0 40px ${alpha(GOLD, 0.14)}`,
          }}
        >
          {title}
        </Typography>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 13.5, md: 16 },
            lineHeight: 1.55,
            color: alpha('#ffffff', 0.82),
            maxWidth: 560,
            textShadow: `0 1px 8px ${alpha('#000000', 0.8)}`,
          }}
        >
          {description}
        </Typography>

        <BattleGoldDivider variant="hero" sx={{ width: { xs: 160, md: 220 } }} />

        <Button
          component="a"
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          disableElevation
          startIcon={<Iconify icon="solar:shop-bold" />}
          endIcon={<Iconify icon="solar:arrow-right-up-bold" width={16} />}
          sx={{
            ...userGoldButtonSx,
            alignSelf: 'flex-start',
            px: { xs: 2.75, md: 3.5 },
            py: 1.2,
            fontSize: 13,
          }}
        >
          {ctaLabel}
        </Button>

        <Stack
          direction="row"
          spacing={0}
          sx={{
            mt: { xs: 1, md: 1.5 },
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            bgcolor: alpha('#000000', 0.55),
            backdropFilter: 'blur(10px)',
            width: 'fit-content',
            maxWidth: 1,
            flexWrap: 'wrap',
          }}
        >
          {stats.map((stat, index) => (
            <Stack
              key={stat.label}
              sx={{
                px: { xs: 1.75, md: 2.5 },
                py: { xs: 1, md: 1.25 },
                borderLeft: index === 0 ? 'none' : `1px solid ${alpha('#ffffff', 0.1)}`,
                minWidth: { xs: 88, md: 108 },
              }}
            >
              <Typography
                className="font-tr"
                sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: GOLD, lineHeight: 1 }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.9,
                  textTransform: 'uppercase',
                  color: alpha('#ffffff', 0.6),
                }}
              >
                {stat.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
