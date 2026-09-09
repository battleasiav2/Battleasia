import React, { useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/routes/hooks';
import { NavSectionVertical } from 'src/components/nav-section';
//
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton } from '../_common';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const theme = useTheme();

  const { user } = useMockedUser();

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          pt: 3,
          px: 3,
          pb: 2,
          borderBottom:
            theme.palette.mode === 'dark'
              ? '1px solid rgba(245, 166, 35, 0.1)'
              : `1px dashed ${theme.palette.divider}`,
          mb: 1.5,
        }}
      >
        <Logo sx={{ width: 44, height: 'auto' }} />
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            Battle<Box component="span" sx={{ color: '#F5A623' }}>Asia</Box>
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'text.secondary',
              textTransform: 'uppercase',
            }}
          >
            ADMIN COMMAND // HQ
          </Typography>
        </Box>
      </Stack>

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.role || 'admin',
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      {/* Operational Telemetry Widget */}
      <Box sx={{ px: 2.5, pb: 3, pt: 2 }}>
        <Box
          sx={{
            p: 1.75,
            borderRadius: '10px',
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(245, 166, 35, 0.04)' : 'rgba(0,0,0,0.02)',
            border:
              theme.palette.mode === 'dark'
                ? '1px solid rgba(245, 166, 35, 0.16)'
                : `1px solid ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#22C55E',
                animation: 'radarBlip 2s infinite ease-in-out',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'success.main',
                letterSpacing: '0.08em',
              }}
            >
              SYS OPERATIONAL
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontFamily: 'monospace',
              fontSize: '0.64rem',
              color: 'text.secondary',
              letterSpacing: '0.04em',
            }}
          >
            PORT: 5050 · ASIA-SOUTH-1
          </Typography>
        </Box>
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            bgcolor:
              theme.palette.mode === 'dark' ? '#0A0E17' : theme.palette.background.default,
            borderRight:
              theme.palette.mode === 'dark'
                ? '1px solid rgba(245, 166, 35, 0.12)'
                : `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              bgcolor:
                theme.palette.mode === 'dark' ? '#0A0E17' : theme.palette.background.default,
              borderRight:
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(245, 166, 35, 0.12)'
                  : `dashed 1px ${theme.palette.divider}`,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
