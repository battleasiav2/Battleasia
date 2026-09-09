import { Box, Chip, Stack, Avatar, Button, IconButton, Typography, CircularProgress } from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { USER_COLORS, getUserChipSx, userMutedTextSx } from 'src/layouts/user';

import { ADMIN_PARTICIPANT } from '../customer-support-constants';

// ----------------------------------------------------------------------

const radarSweep = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const pulseBeacon = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
`;

type SupportChatHeaderProps = {
  onlineLabel: string;
  loading: boolean;
  onRefresh: () => void;
  title?: string;
  category?: string;
  status?: string;
  onBack?: () => void;
  onCloseTicket?: () => void;
  closing?: boolean;
};

export function SupportChatHeader({
  onlineLabel,
  loading,
  onRefresh,
  title,
  category,
  status,
  onBack,
  onCloseTicket,
  closing,
}: SupportChatHeaderProps) {
  const theme = useTheme();
  const themeAccent = theme.palette.primary.main || USER_COLORS.gold;
  const isClosed = status === 'closed';

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 1.75, sm: 2.25 },
        bgcolor: '#090b10',
        borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        overflow: 'hidden',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${themeAccent}, transparent)`,
        },
      }}
    >
      {/* Animated Radar Scanning Line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${themeAccent}, transparent)`,
          animation: `${radarSweep} 3s linear infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Back button */}
      {onBack && (
        <IconButton
          onClick={onBack}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '6px',
            bgcolor: alpha('#ffffff', 0.05),
            border: `1px solid ${alpha('#ffffff', 0.12)}`,
            color: themeAccent,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(themeAccent, 0.15),
              borderColor: themeAccent,
            },
          }}
        >
          <Iconify icon="solar:arrow-left-bold" width={18} />
        </IconButton>
      )}

      {/* HQ Avatar */}
      <Box sx={{ position: 'relative' }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            borderRadius: '8px',
            bgcolor: alpha(themeAccent, 0.15),
            border: `1.5px solid ${themeAccent}`,
            color: themeAccent,
            fontWeight: 900,
          }}
        >
          <Iconify icon="solar:headphones-round-sound-bold" width={22} />
        </Avatar>

        {!isClosed && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              border: '2px solid #090b10',
              animation: `${pulseBeacon} 2s infinite`,
            }}
          />
        )}
      </Box>

      {/* Title & Transmission Telemetry */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            sx={{
              fontFamily: `'Barlow', 'Public Sans Variable', sans-serif`,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: { xs: 14.5, sm: 16 },
              letterSpacing: 0.3,
            }}
            noWrap
          >
            {title || ADMIN_PARTICIPANT.name}
          </Typography>
          <Box
            sx={{
              display: { xs: 'none', sm: 'inline-block' },
              px: 0.6,
              py: 0.2,
              borderRadius: '3px',
              bgcolor: alpha(themeAccent, 0.12),
              border: `1px solid ${alpha(themeAccent, 0.3)}`,
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 800, color: themeAccent }}>
              ENCRYPTED COMMS
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.4 }}>
          {!isClosed && (
            <Typography sx={{ ...userMutedTextSx, fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span style={{ color: '#22c55e', fontWeight: 800 }}>●</span> {onlineLabel} · HQ Tactical Officer
            </Typography>
          )}

          {category && (
            <Chip
              label={category.toUpperCase()}
              size="small"
              sx={{
                height: 19,
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 0.6,
                borderRadius: '4px',
                ...getUserChipSx('gold'),
              }}
            />
          )}

          {status && (
            <Chip
              label={status.toUpperCase()}
              size="small"
              sx={{
                height: 19,
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 0.6,
                borderRadius: '4px',
                ...getUserChipSx(status === 'closed' ? 'neutral' : status === 'pending' ? 'info' : 'success'),
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Actions: Refresh & Close */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={loading}
          sx={{
            color: alpha('#ffffff', 0.6),
            borderRadius: '6px',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            '&:hover': { color: '#ffffff', borderColor: alpha('#ffffff', 0.3) },
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: themeAccent }} />
          ) : (
            <Iconify icon="solar:restart-bold" width={16} />
          )}
        </IconButton>

        {onCloseTicket && !isClosed && (
          <Button
            size="small"
            onClick={onCloseTicket}
            disabled={closing || loading}
            startIcon={<Iconify icon="solar:close-circle-bold" width={15} />}
            sx={{
              clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              bgcolor: alpha('#ef4444', 0.12),
              border: `1px solid ${alpha('#ef4444', 0.4)}`,
              color: '#ef4444',
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#ef4444',
                color: '#ffffff',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
              },
            }}
          >
            {closing ? 'Ending…' : 'End Transmission'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
