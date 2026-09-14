import type { Breakpoint } from '@mui/material/styles';
import type { HeaderSectionProps } from '../core/header-section';

import { lazy, Suspense } from 'react';
import { merge } from 'es-toolkit';
import { useScrollOffsetTop } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useSelector } from 'src/store';
import { allLangs } from 'src/locales';

import { HeaderSection } from '../core/header-section';
import { LanguagePopover } from './language-popover';
import { AccentPopover } from './accent-popover';
import { SignInIconButton } from './sign-in-icon-button';
import { HeaderNav } from './header-nav';
import { accountMenuItems } from '../menu-items-config';
import { LANDING_V2 } from 'src/sections/home/landing-v2-theme';
import { goldAlpha } from 'src/theme/accent-presets';

const AccountDrawer = lazy(() =>
  import('./account-drawer').then((m) => ({ default: m.AccountDrawer }))
);
const NotificationsDrawer = lazy(() =>
  import('./notifications-drawer').then((m) => ({ default: m.NotificationsDrawer }))
);

// ----------------------------------------------------------------------

export type HomeHeaderProps = {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
  };
  slots?: HeaderSectionProps['slots'];
  disableElevation?: boolean;
};

const zipControlSx = {
  minHeight: 48,
  height: 48,
  minWidth: 48,
  px: 0,
  borderRadius: 0,
  border: 'none',
  bgcolor: 'transparent',
  color: LANDING_V2.muted,
  boxShadow: 'none',
  '&:hover': {
    border: 'none',
    color: LANDING_V2.text,
    bgcolor: 'transparent',
  },
} as const;

export function HomeHeader({
  layoutQuery = 'lg',
  slotProps,
  slots,
  disableElevation = true,
}: HomeHeaderProps) {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { offsetTop: isHeaderScrolled } = useScrollOffsetTop();

  const headerSlotProps: HeaderSectionProps['slotProps'] = {
    container: {
      maxWidth: false,
      disableGutters: true,
      sx: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        display: 'flex',
        width: '100%',
        maxWidth: LANDING_V2.wrap,
        mx: 'auto',
        height: 72,
        minHeight: 72,
        px: { xs: 2.5, sm: 4, md: 5 },
        gap: { xs: 1.25, md: 2.5 },
        boxSizing: 'border-box',
      },
    },
    centerArea: {
      sx: {
        display: { xs: 'none', lg: 'flex' },
        flex: '0 1 auto',
        justifyContent: 'flex-start',
        width: 'auto',
        height: '100%',
      },
    },
  };

  const headerSlots: HeaderSectionProps['slots'] = {
    topArea: (
      <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
        This is an info Alert.
      </Alert>
    ),
    leftArea: (
      <RouterLink
        href="/"
        aria-label="BattleAsia 2.0 home"
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ flexShrink: 1, minWidth: 0, height: 1 }}
        >
          <Box
            component="img"
            src={LANDING_V2.assets.logo}
            alt=""
            width={36}
            height={36}
            sx={{
              width: { xs: 28, sm: 36 },
              height: { xs: 28, sm: 36 },
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
              flexShrink: 0,
            }}
          />
          <Typography
            component="span"
            sx={{
              fontFamily: LANDING_V2.display,
              fontWeight: 700,
              fontSize: { xs: '0.82rem', sm: '1.12rem' },
              letterSpacing: '0.02em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: LANDING_V2.text,
            }}
          >
            BATTLE
            <Box component="span" sx={{ color: 'var(--ba-gold)' }}>
              ASIA
            </Box>
            <Box
              component="sup"
              sx={{
                fontFamily: LANDING_V2.sans,
                fontSize: '0.48em',
                fontWeight: 700,
                color: LANDING_V2.muted,
                ml: 0.5,
                verticalAlign: 'super',
              }}
            >
              2.0
            </Box>
          </Typography>
        </Stack>
      </RouterLink>
    ),
    centerArea: <HeaderNav />,
    rightArea: (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{
          ml: 'auto',
          height: 1,
          flexShrink: 0,
        }}
      >
        <LanguagePopover
          landing
          data={allLangs}
          sx={{
            ...zipControlSx,
            width: 48,
            minWidth: 48,
            px: 0,
          }}
        />
        <AccentPopover landing />

        {isLoggedIn ? (
          <Suspense fallback={null}>
            <NotificationsDrawer
              sx={{
                ...zipControlSx,
                width: 48,
                minWidth: 48,
                height: 48,
                p: 0,
                backgroundImage: 'none',
                boxShadow: 'none',
                '&:hover': {
                  border: 'none',
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  transform: 'none',
                  '& .notif-bell': {
                    color: 'var(--ba-gold)',
                    filter: 'none',
                  },
                },
              }}
            />
            <AccountDrawer data={accountMenuItems} />
          </Suspense>
        ) : (
          <SignInIconButton
            hideIcon
            sx={{
              height: 44,
              minHeight: 44,
              minWidth: { xs: 72, sm: 'auto' },
              px: { xs: 1.5, sm: 2.25 },
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: LANDING_V2.text,
              border: `1px solid ${LANDING_V2.hair2}`,
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.03)',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'var(--ba-gold)',
                color: 'var(--ba-gold)',
                bgcolor: 'transparent',
              },
            }}
          />
        )}
      </Stack>
    ),
    ...slots,
  };

  return (
    <HeaderSection
      disableOffset
      position="fixed"
      layoutQuery={layoutQuery}
      disableElevation={disableElevation}
      {...slotProps?.header}
      slots={{ ...headerSlots, ...slotProps?.header?.slots }}
      slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
      sx={{
        bgcolor: isHeaderScrolled ? 'rgba(6,6,7,0.94)' : 'transparent',
        backdropFilter: isHeaderScrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: isHeaderScrolled ? 'blur(18px)' : 'none',
        boxShadow: 'none',
        border: 'none',
        transition: `background-color 0.4s ${LANDING_V2.ease}, backdrop-filter 0.4s ${LANDING_V2.ease}`,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '1px',
          pointerEvents: 'none',
          opacity: 1,
          visibility: 'visible',
          background: `linear-gradient(90deg, transparent, ${goldAlpha(0.24)} 18%, ${goldAlpha(0.24)} 82%, transparent)`,
        },
        ...slotProps?.header?.sx,
      }}
    />
  );
}
