import React from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// theme
import { bgBlur } from 'src/theme/css';
// utils
import { assetPath } from 'src/utils/asset-path';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
//
import { HEADER, NAV } from '../config-layout';
import {
  Searchbar,
  AccountPopover,
} from '../_common';

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2.5 }}>
          <Logo sx={{ height: 100, width: "auto" }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            BattleAsia
          </Typography>
        </Stack>
      )}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src={assetPath('/assets/icons/navbar/ic_menu_item.svg')} />
        </IconButton>
      )}

      <Searchbar />

      {lgUp && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.2}
          sx={{
            ml: 2.5,
            px: 1.5,
            py: 0.6,
            borderRadius: '6px',
            bgcolor: 'rgba(245, 166, 35, 0.06)',
            border: '1px solid rgba(245, 166, 35, 0.18)',
            boxShadow: '0 0 10px rgba(245, 166, 35, 0.06)',
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#22C55E',
              animation: 'radarBlip 2s infinite ease-in-out',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              color: 'warning.main',
            }}
          >
            COMMAND DECK // LIVE
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: '0.66rem',
              color: 'text.secondary',
              opacity: 0.8,
            }}
          >
            · 18MS
          </Typography>
        </Stack>
      )}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {/* <LanguagePopover />

        <NotificationsPopover />

        <ContactsPopover />

        <SettingsButton /> */}

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        borderBottom:
          theme.palette.mode === 'dark'
            ? '1px solid rgba(245, 166, 35, 0.12)'
            : `dashed 1px ${theme.palette.divider}`,
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(245, 166, 35, 0.8), #FFD066, rgba(245, 166, 35, 0.8), transparent)'
              : 'transparent',
          backgroundSize: '200% 100%',
          animation: 'laserSweep 4s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
