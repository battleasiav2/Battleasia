import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user';

import type { TicketCategory } from '../customer-support-types';

// ----------------------------------------------------------------------

const portalPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.08); opacity: 0.3; }
`;

type PortalChannel = {
  category: TicketCategory;
  title: string;
  code: string;
  desc: string;
  icon: string;
  accent: string;
  badge: string;
};

const CHANNELS: PortalChannel[] = [
  {
    category: 'payment',
    title: 'BAC Escrow & Payouts',
    code: 'CHANNEL_PAY_01',
    desc: 'Instant deposit verification, fast withdrawal queries, wallet balances & cryptographic escrow disputes.',
    icon: 'solar:wallet-money-bold-duotone',
    accent: '#f59e0b', // gold / amber
    badge: 'RAPID QUEUE · 3M',
  },
  {
    category: 'match',
    title: 'Match Disputes & Anti-Cheat',
    code: 'CHANNEL_TAC_02',
    desc: 'Match score arbitration, disconnect refunds, referee review & fair play anti-cheat appeals.',
    icon: 'solar:shield-check-bold-duotone',
    accent: '#ef4444', // red / combat
    badge: 'REFEREE ARBITRATION',
  },
  {
    category: 'account',
    title: 'Account Security Vault',
    code: 'CHANNEL_SEC_03',
    desc: '2FA authentication reset, credential recovery, biometric security & game UID link assistance.',
    icon: 'solar:lock-keyhole-minimalistic-bold-duotone',
    accent: '#3b82f6', // cyan / blue security
    badge: 'BIO-ENCRYPTED',
  },
  {
    category: 'other',
    title: 'VIP Hotline & Discord HQ',
    code: 'CHANNEL_VIP_04',
    desc: '24/7 priority comms, esports partnerships, tournament rules & verified Discord live support.',
    icon: 'solar:headphones-round-sound-bold-duotone',
    accent: '#10b981', // emerald
    badge: 'DIRECT HOTLINE',
  },
];

type SupportHubPortalsProps = {
  onSelectCategory: (category: TicketCategory) => void;
};

export function SupportHubPortals({ onSelectCategory }: SupportHubPortalsProps) {
  const theme = useTheme();
  const themeAccent = theme.palette.primary.main || USER_COLORS.gold;

  return (
    <Box sx={{ mb: 3.5 }}>
      {/* Header with tactical stencil tag */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            sx={{
              fontFamily: `'Barlow', 'Public Sans Variable', sans-serif`,
              fontSize: { xs: 15, sm: 17 },
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#ffffff',
            }}
          >
            TACTICAL DISPATCH CHANNELS
          </Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: alpha('#ffffff', 0.5), letterSpacing: 0.4 }}>
            Select a dedicated operative gateway for prioritized routing
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            alignItems: 'center',
            gap: 0.8,
            px: 1.25,
            py: 0.4,
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            bgcolor: alpha('#ffffff', 0.02),
            borderRadius: '4px',
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: themeAccent, boxShadow: `0 0 8px ${themeAccent}` }} />
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: alpha('#ffffff', 0.7), letterSpacing: 0.8 }}>
            4 ACTIVE RELAYS
          </Typography>
        </Box>
      </Box>

      {/* 4 Interactive 3D Perspective Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {CHANNELS.map((ch) => {
          const cardAccent = ch.accent;

          return (
            <ButtonBase
              key={ch.category}
              onClick={() => onSelectCategory(ch.category)}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                p: { xs: 2.2, md: 2.5 },
                borderRadius: '14px',
                bgcolor: '#0a0c10',
                border: `1px solid ${alpha(cardAccent, 0.25)}`,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                boxShadow: `
                  0 8px 24px -8px rgba(0, 0, 0, 0.8),
                  inset 0 1px 0 0 ${alpha('#ffffff', 0.08)}
                `,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at 100% 0%, ${alpha(cardAccent, 0.15)} 0%, transparent 65%)`,
                  pointerEvents: 'none',
                  zIndex: 0,
                },
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  borderColor: cardAccent,
                  boxShadow: `
                    0 16px 36px -10px rgba(0, 0, 0, 0.9),
                    0 0 28px -6px ${alpha(cardAccent, 0.4)},
                    inset 0 1px 0 0 ${alpha('#ffffff', 0.2)}
                  `,
                  '& .portal-icon': {
                    transform: 'scale(1.12) rotate(4deg)',
                    boxShadow: `0 0 24px ${alpha(cardAccent, 0.6)}`,
                  },
                  '& .portal-arrow': {
                    transform: 'translateX(4px)',
                    color: cardAccent,
                  },
                },
              }}
            >
              {/* Background ambient glow circle */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: cardAccent,
                  filter: 'blur(35px)',
                  pointerEvents: 'none',
                  animation: `${portalPulse} 4s ease-in-out infinite`,
                  zIndex: 0,
                }}
              />

              {/* Card Top: Tactical Code + Channel Badge */}
              <Box sx={{ width: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75, position: 'relative', zIndex: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: alpha('#ffffff', 0.45) }}>
                  {ch.code}
                </Typography>
                <Box
                  sx={{
                    px: 0.9,
                    py: 0.3,
                    borderRadius: '4px',
                    bgcolor: alpha(cardAccent, 0.12),
                    border: `1px solid ${alpha(cardAccent, 0.35)}`,
                  }}
                >
                  <Typography sx={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 0.8, color: cardAccent }}>
                    {ch.badge}
                  </Typography>
                </Box>
              </Box>

              {/* Floating 3D Glowing Icon */}
              <Box
                className="portal-icon"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(cardAccent, 0.15),
                  border: `1px solid ${alpha(cardAccent, 0.45)}`,
                  boxShadow: `0 0 14px ${alpha(cardAccent, 0.25)}`,
                  mb: 1.5,
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <Iconify icon={ch.icon} width={22} sx={{ color: cardAccent }} />
              </Box>

              {/* Channel Title */}
              <Typography
                sx={{
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: 0.4,
                  lineHeight: 1.2,
                  mb: 0.75,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {ch.title}
              </Typography>

              {/* Channel Description */}
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: alpha('#ffffff', 0.6),
                  lineHeight: 1.55,
                  mb: 2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {ch.desc}
              </Typography>

              {/* Card Footer: Open Gateway Action */}
              <Box
                sx={{
                  mt: 'auto',
                  pt: 1.2,
                  width: 1,
                  borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: cardAccent, textTransform: 'uppercase' }}>
                  DISPATCH TICKET
                </Typography>
                <Iconify
                  className="portal-arrow"
                  icon="solar:arrow-right-bold"
                  width={14}
                  sx={{ color: alpha('#ffffff', 0.4), transition: 'transform 0.2s ease, color 0.2s ease' }}
                />
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
