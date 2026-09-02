import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { HOME_GOLD, HOME_ROW_LINE, HomeBlurPanel } from 'src/sections/home/home-blur-panel';
import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user/user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

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
        width: { xs: '100%', sm: 'auto' },
        // Mobile: skip negative bleed — UserPageShell overflow:clip was clipping badge/edges
        mx: { xs: 0, sm: -3, md: -4 },
        mt: { xs: 0, sm: -2, md: -3 },
        mb: { xs: 3, md: 4 },
        minHeight: { xs: 'auto', sm: 500, md: 560 },
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-end' },
        overflow: 'hidden',
        bgcolor: '#000000',
        borderTop: `1px solid ${goldAlpha(0.16)}`,
        borderBottom: `1px solid ${goldAlpha(0.16)}`,
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
              radial-gradient(ellipse 55% 40% at 18% 22%, ${goldAlpha(0.14)} 0%, transparent 60%)
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
              color: goldAlpha(0.92),
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
              border: `1px solid ${goldAlpha(0.32)}`,
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
            fontSize: { xs: 24, sm: 44, md: 58 },
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: { md: 0.5 },
            color: '#ffffff',
            textTransform: 'uppercase',
            wordBreak: 'break-word',
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
            alignSelf: { xs: 'stretch', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' },
            px: { xs: 2.75, md: 3.5 },
            py: 1.2,
            fontSize: { xs: 12, sm: 13 },
            whiteSpace: { xs: 'normal', sm: 'nowrap' },
          }}
        >
          {ctaLabel}
        </Button>

        <HomeBlurPanel sx={{ p: 0, alignSelf: { xs: 'stretch', sm: 'flex-start' }, width: { xs: '100%', sm: 'auto' }, maxWidth: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
              width: 1,
            }}
          >
            {stats.map((stat, index) => (
              <Box
                key={stat.label}
                sx={{
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: { xs: 1.25, md: 1.5 },
                  borderTop: `2px solid ${HOME_GOLD}`,
                  minWidth: 0,
                  ...(index > 0 ? { borderLeft: HOME_ROW_LINE } : {}),
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 9, sm: 10 },
                    fontWeight: 700,
                    letterSpacing: { xs: 0.4, sm: 0.7 },
                    textTransform: 'uppercase',
                    color: alpha('#fff', 0.55),
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  className="font-tr"
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: 16, sm: 18, md: 22 },
                    fontWeight: 800,
                    color: '#fff',
                    lineHeight: 1.1,
                    wordBreak: 'break-word',
                  }}
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
