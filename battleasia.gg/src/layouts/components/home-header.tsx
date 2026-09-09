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
import { Logo } from 'src/components/logo';
import { allLangs, useTranslate } from 'src/locales';

import { HeaderSection } from '../core/header-section';
import { LanguagePopover } from './language-popover';
import { AccentPopover } from './accent-popover';
import { SignInIconButton } from './sign-in-icon-button';
import { HeaderNav } from './header-nav';
import { accountMenuItems } from '../menu-items-config';
import {
  getHeaderBarSx,
  headerContainerSx,
  headerCenterAreaSx,
  headerLeftAreaSx,
  headerRightAreaSx,
} from './header-chrome';

// Logged-in chrome — keep simplebar / drawer JS off anonymous home LCP
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

export function HomeHeader({
  layoutQuery = 'lg',
  slotProps,
  slots,
  disableElevation = true,
}: HomeHeaderProps) {
  const { currentLang } = useTranslate();
  const isBengali = currentLang?.value === 'bn';
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { offsetTop: isHeaderScrolled } = useScrollOffsetTop();

  const headerSlotProps: HeaderSectionProps['slotProps'] = {
    container: {
      maxWidth: false,
      sx: {
        alignItems: 'center',
        justifyContent: { xs: 'space-between', lg: 'stretch' },
        ...headerContainerSx,
        px: { [layoutQuery]: 3 },
      },
    },
    centerArea: {
      sx: headerCenterAreaSx,
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
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1, sm: 1.25 }}
          sx={{
            ...headerLeftAreaSx,
            flexShrink: 0,
            minWidth: 0,
            height: 1,
            cursor: 'pointer',
          }}
        >
          <Logo
            disabled
            sx={{
              width: { xs: 52, sm: 56, md: 60 },
              height: { xs: 52, sm: 56, md: 60 },
              flexShrink: 0,
            }}
          />

          <Stack spacing={0.25} sx={{ minWidth: 0, position: 'relative' }}>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <Typography
                component="span"
                sx={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: isBengali
                    ? { xs: 16, sm: 18, md: 20 }
                    : { xs: 18, sm: 20, md: 23 },
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(180deg, #FFFFFF 15%, #E2E8F0 60%, #94A3B8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                }}
              >
                BATTLE
              </Typography>

              <Typography
                component="span"
                sx={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: isBengali
                    ? { xs: 16, sm: 18, md: 20 }
                    : { xs: 18, sm: 20, md: 23 },
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  background:
                    'linear-gradient(180deg, var(--ba-gold-light, #e2ff58) 0%, var(--ba-gold, #cbfb24) 60%, var(--ba-gold-dark, #9de006) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 8px rgba(var(--ba-gold-rgb), 0.45))',
                }}
              >
                ASIA
              </Typography>
            </Stack>

            <Box
              sx={{
                height: '2px',
                width: '65%',
                borderRadius: '1px',
                background:
                  'linear-gradient(90deg, var(--ba-gold) 0%, rgba(var(--ba-gold-rgb), 0.4) 70%, transparent 100%)',
                opacity: 0.6,
              }}
            />
          </Stack>
        </Stack>
      </RouterLink>
    ),
    centerArea: <HeaderNav />,
    rightArea: (
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          ...headerRightAreaSx,
          display: 'flex',
          height: 1,
          gap: { xs: 0.75, sm: 1.25 },
          justifyContent: 'flex-end',
        }}
      >
        {isLoggedIn ? (
          <Suspense fallback={null}>
            <NotificationsDrawer />
            <AccountDrawer data={accountMenuItems} />
          </Suspense>
        ) : (
          <SignInIconButton />
        )}

        <LanguagePopover data={allLangs} />
        <AccentPopover />
      </Stack>
    ),
    ...slots,
  };

  return (
    <HeaderSection
      disableOffset
      layoutQuery={layoutQuery}
      disableElevation={disableElevation}
      {...slotProps?.header}
      slots={{ ...headerSlots, ...slotProps?.header?.slots }}
      slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
      sx={{
        ...getHeaderBarSx(isHeaderScrolled),
        ...slotProps?.header?.sx,
      }}
    />
  );
}
