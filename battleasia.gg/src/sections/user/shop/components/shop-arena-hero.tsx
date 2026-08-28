import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { HOME_GOLD, HOME_ROW_LINE, HomeBlurPanel } from 'src/sections/home/home-blur-panel';
import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurns = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.07) translate3d(-1.2%, -0.8%, 0); }
  100% { transform: scale(1) translate3d(0, 0, 0); }
`;

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
        // Mobile: no negative pull (header + overflow:clip was cutting the badge)
        mt: { xs: 0, sm: -2, md: -3 },
        mb: { xs: 3, md: 4 },
        // Mobile grows past minHeight if needed; desktop keeps flex-end panel
        minHeight: { xs: 380, sm: 500, md: 560 },
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-end' },
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

      </Box>

      <Stack
        spacing={{ xs: 1.5, md: 2 }}
        sx={{
          position: 'relative',
          zIndex: 3,
          width: 1,
          px: { xs: 3, sm: 4, md: 6 },
          pt: { xs: 2.5, sm: 5, md: 5 },
          pb: { xs: 3.5, md: 5 },
          maxWidth: { md: 760 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Typography
            sx={{
              fontSize: { xs: 11, md: 12 },
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: alpha(GOLD, 0.92),
              lineHeight: 1.3,
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
              py: 0.45,
              border: `1px solid ${alpha(GOLD, 0.32)}`,
              bgcolor: alpha('#000000', 0.5),
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:shield-check-bold" width={12} sx={{ color: GOLD }} />
            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#ffffff', lineHeight: 1.2 }}>
              {verifiedLabel}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, sm: 44, md: 58 },
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: { md: 0.5 },
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 13.5, md: 16 },
            lineHeight: 1.55,
            color: alpha('#ffffff', 0.5),
            maxWidth: 560,
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

        <HomeBlurPanel sx={{ p: 0, alignSelf: 'flex-start' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
            {stats.map((stat, index) => (
              <Box
                key={stat.label}
                sx={{
                  px: { xs: 1.5, md: 2 },
                  py: 1.5,
                  borderTop: `2px solid ${HOME_GOLD}`,
                  minWidth: { xs: 88, md: 108 },
                  ...(index > 0 ? { borderLeft: HOME_ROW_LINE } : {}),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.7,
                    textTransform: 'uppercase',
                    color: alpha('#fff', 0.55),
                    lineHeight: 1.25,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  className="font-tr"
                  sx={{ mt: 0.5, fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}
                >
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </HomeBlurPanel>
      </Stack>
    </Box>
  );
}
