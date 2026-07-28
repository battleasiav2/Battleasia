import type { ReactNode } from 'react';

import { Box, Stack, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { BattleGoldDivider } from 'src/components/battle-gold-divider';
import { HOME_GAME_ARTS } from 'src/sections/home/play-your-game-section';

const GOLD = '#f5c518';

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  brandLabel?: string;
  artIndex?: number;
  children: ReactNode;
};

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#161618',
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        p: { xs: 2, md: 2.5 },
        boxShadow: `0 10px 28px ${alpha('#000000', 0.4)}`,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          borderColor: alpha(GOLD, 0.28),
          boxShadow: `0 14px 36px ${alpha('#000000', 0.55)}, 0 0 20px ${alpha(GOLD, 0.06)}`,
        },
      }}
    >
      <Box
        sx={{
          height: 2,
          width: 36,
          bgcolor: GOLD,
          mb: 1.5,
          boxShadow: `0 0 10px ${alpha(GOLD, 0.4)}`,
        }}
      />
      <Typography
        className="font-tr"
        sx={{
          fontSize: { xs: 16, md: 18 },
          fontWeight: 800,
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          mb: 1.25,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          color: alpha('#ffffff', 0.62),
          '& .MuiTypography-root': {
            color: alpha('#ffffff', 0.62),
            fontSize: { xs: 13, md: 14 },
            lineHeight: 1.7,
          },
          '& .MuiListItemText-primary': {
            color: alpha('#ffffff', 0.62),
            fontSize: { xs: 13, md: 14 },
            lineHeight: 1.65,
          },
          '& .MuiListItem-root': {
            py: 0.35,
            alignItems: 'flex-start',
            '&::before': {
              content: '"◆"',
              color: GOLD,
              fontSize: 8,
              mr: 1.25,
              mt: 0.85,
              flexShrink: 0,
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function LegalPageShell({
  title,
  updatedAt,
  brandLabel = 'BATTLE ASIA',
  artIndex = 0,
  children,
}: LegalPageShellProps) {
  const art = HOME_GAME_ARTS[artIndex % HOME_GAME_ARTS.length];

  return (
    <Box
      sx={{
        position: 'relative',
        overflowX: 'hidden',
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        py: { xs: 4.5, md: 6 },
        px: { xs: 2, md: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${art})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.16,
          filter: 'grayscale(0.35) contrast(1.05)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, ${alpha('#0a0a0a', 0.84)} 0%, ${alpha('#0a0a0a', 0.93)} 45%, #0a0a0a 100%),
            radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha(GOLD, 0.08)} 0%, transparent 55%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={{ xs: 2.5, md: 3.5 }}>
          <Stack spacing={1.25} alignItems="center" sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: 11, md: 12 },
                fontWeight: 700,
                letterSpacing: 2.5,
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              {brandLabel}
            </Typography>
            <Typography
              className="font-tr"
              sx={{
                fontSize: { xs: 22, sm: 30, md: 36 },
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: { xs: 0.8, md: 1.5 },
                color: '#ffffff',
                lineHeight: 1.15,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 12, sm: 13 },
                color: alpha('#ffffff', 0.45),
              }}
            >
              Last updated: {updatedAt}
            </Typography>
            <BattleGoldDivider variant="hero" sx={{ mt: 0.5 }} />
          </Stack>

          <Stack spacing={1.5}>{children}</Stack>
        </Stack>
      </Container>
    </Box>
  );
}
