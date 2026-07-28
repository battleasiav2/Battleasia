import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { USER_COLORS } from './user-theme';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurnsSoft = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bracketPulse = keyframes`
  0%, 100% { opacity: 0.28; }
  50% { opacity: 0.8; }
`;

function corner(position: 'tl' | 'tr' | 'bl' | 'br') {
  const base = {
    position: 'absolute' as const,
    width: { xs: 18, md: 26 },
    height: { xs: 18, md: 26 },
    borderColor: alpha(GOLD, 0.55),
    animation: `${bracketPulse} 3.6s ease-in-out infinite`,
    pointerEvents: 'none' as const,
    zIndex: 2,
  };

  if (position === 'tl') {
    return { ...base, top: 10, left: 10, borderTop: '2px solid', borderLeft: '2px solid' };
  }
  if (position === 'tr') {
    return { ...base, top: 10, right: 10, borderTop: '2px solid', borderRight: '2px solid', animationDelay: '0.4s' };
  }
  if (position === 'bl') {
    return { ...base, bottom: 10, left: 10, borderBottom: '2px solid', borderLeft: '2px solid', animationDelay: '0.8s' };
  }
  return { ...base, bottom: 10, right: 10, borderBottom: '2px solid', borderRight: '2px solid', animationDelay: '1.2s' };
}

// ----------------------------------------------------------------------

export type UserArenaStripProps = {
  badge: string;
  title: string;
  imageUrl: string;
  chip?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  /** Bleed to shell edges like Play/Shop (default true) */
  fullBleed?: boolean;
};

/**
 * Slim black/gold arena strip for account hubs.
 * Use instead of inset glass heroes + duplicate UserPageTitle.
 */
export function UserArenaStrip({
  badge,
  title,
  imageUrl,
  chip,
  subtitle,
  action,
  fullBleed = true,
}: UserArenaStripProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: fullBleed ? 'auto' : 1,
        mx: fullBleed ? { xs: -2, sm: -3, md: -4 } : 0,
        mt: fullBleed ? { xs: -4, sm: -5, md: -6 } : 0,
        mb: { xs: 2.5, md: 3.5 },
        minHeight: { xs: 168, md: 200 },
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        bgcolor: '#000000',
        borderTop: `1px solid ${alpha(GOLD, 0.14)}`,
        borderBottom: `1px solid ${alpha(GOLD, 0.14)}`,
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
          objectPosition: 'center top',
          animation: `${kenBurnsSoft} 24s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.88)} 0%, ${alpha('#000000', 0.55)} 50%, ${alpha('#000000', 0.4)} 100%),
            linear-gradient(180deg, ${alpha('#000000', 0.45)} 0%, transparent 40%, ${alpha('#000000', 0.88)} 100%),
            radial-gradient(ellipse 50% 40% at 15% 30%, ${alpha(GOLD, 0.1)} 0%, transparent 60%)
          `,
        }}
      />

      <Box sx={corner('tl')} />
      <Box sx={corner('tr')} />
      <Box sx={corner('bl')} />
      <Box sx={corner('br')} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          position: 'relative',
          zIndex: 3,
          width: 1,
          px: { xs: 2.5, sm: 3.5, md: 4.5 },
          py: { xs: 2.25, md: 2.75 },
        }}
      >
        <Box sx={{ minWidth: 0, maxWidth: { md: '70%' } }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: alpha(GOLD, 0.9),
              mb: 0.75,
            }}
          >
            {badge}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography
              className="font-tr"
              sx={{
                fontSize: { xs: 24, sm: 30, md: 36 },
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                color: '#ffffff',
                lineHeight: 1.05,
                textShadow: `0 2px 16px ${alpha('#000000', 0.85)}`,
              }}
            >
              {title}
            </Typography>
            {chip}
          </Stack>

          {subtitle ? (
            <Typography
              className="font-tr"
              sx={{
                mt: 1,
                fontSize: { xs: 13, md: 14 },
                lineHeight: 1.5,
                color: alpha('#ffffff', 0.75),
                maxWidth: 560,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}

          <BattleGoldDivider variant="title" sx={{ mt: 1.25, width: { xs: 120, md: 160 } }} />
        </Box>

        {action ? (
          <Box sx={{ flexShrink: 0, display: { xs: 'none', md: 'block' } }}>{action}</Box>
        ) : null}
      </Stack>
    </Box>
  );
}

/** Compact gold chip for arena strips */
export function UserArenaChip({
  icon,
  label,
}: {
  icon?: ReactNode;
  label: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 1,
        py: 0.4,
        border: `1px solid ${alpha(GOLD, 0.35)}`,
        bgcolor: alpha('#000000', 0.5),
        backdropFilter: 'blur(6px)',
      }}
    >
      {icon}
      <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: GOLD }}>{label}</Typography>
    </Stack>
  );
}
