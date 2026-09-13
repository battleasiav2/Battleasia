import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

import { GoToBacShopButton } from './go-to-bac-shop-button';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

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

/** Compact Pulse shop hero — stays inside the page shell on PC + mobile. */
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
        width: 1,
        mb: { xs: 2.5, md: 3.5 },
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: '#161618',
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 1,
          minHeight: { xs: 220, sm: 260, md: 300 },
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt=""
          width={1600}
          height={700}
          loading="lazy"
          decoding="async"
          sx={{
            position: 'absolute',
            inset: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, rgba(7, 8, 11, 0.82) 0%, rgba(7, 8, 11, 0.45) 58%, rgba(7, 8, 11, 0.28) 100%),
              linear-gradient(180deg, rgba(7, 8, 11, 0.2) 0%, rgba(7, 8, 11, 0.72) 100%)
            `,
          }}
        />

        <Stack
          spacing={1.5}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: 1,
            px: { xs: 2, sm: 2.5, md: 3 },
            py: { xs: 2, sm: 2.5, md: 3 },
            maxWidth: 720,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                px: 1.25,
                py: 0.45,
                borderRadius: '8px',
                bgcolor: alpha('#000000', 0.45),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: alpha('#ffffff', 0.82),
                }}
              >
                {badge}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                px: 1.1,
                py: 0.45,
                borderRadius: '8px',
                bgcolor: goldAlpha(0.12),
                border: `1px solid ${goldAlpha(0.32)}`,
              }}
            >
              <Iconify icon="solar:shield-check-bold" width={13} sx={{ color: GOLD }} />
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: GOLD,
                  textTransform: 'uppercase',
                }}
              >
                {verifiedLabel}
              </Typography>
            </Stack>
          </Stack>

          <Typography
            sx={{
              fontSize: { xs: 22, sm: 28, md: 34 },
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: '#ffffff',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 13, md: 14.5 },
              lineHeight: 1.55,
              color: alpha('#ffffff', 0.72),
              maxWidth: 560,
            }}
          >
            {description}
          </Typography>

          <Box>
            <GoToBacShopButton label={ctaLabel} href={ctaHref} size="compact" />
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: `repeat(${stats.length}, minmax(0, 1fr))` },
          borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
        }}
      >
        {stats.map((stat, index) => {
          const iconName = stat.icon || STAT_ICONS[index % STAT_ICONS.length];
          return (
            <Box
              key={stat.label}
              sx={{
                px: { xs: 1.75, sm: 2 },
                py: { xs: 1.25, sm: 1.5 },
                minWidth: 0,
                borderRight: {
                  xs: 'none',
                  sm: index < stats.length - 1 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                },
                borderBottom: {
                  xs: index < stats.length - 1 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
                  sm: 'none',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.35 }}>
                <Iconify icon={iconName} width={14} sx={{ color: GOLD, flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: alpha('#ffffff', 0.55),
                  }}
                >
                  {stat.label}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: { xs: 15, sm: 17 }, fontWeight: 800, color: '#ffffff' }}>
                {stat.value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
