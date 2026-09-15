import { lazy, Suspense, useEffect, useState } from 'react';
import { merge } from 'es-toolkit';

import { Box, Button, Stack } from '@mui/material';
import { alpha, useTheme, type Breakpoint } from '@mui/material/styles';

import axios from 'src/lib/axios';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useSelector, useDispatch } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';
import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';
import { goldAlpha } from 'src/theme/accent-presets';

import {
  clearShopPersistStorage,
  clearShopSession,
  hasShopSession,
} from 'src/utils/shop-session';

import { AuthSplitSection } from './section';
import { AuthSplitContent } from './content';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AUTH_BG_IMAGE } from 'src/sections/auth/auth-form-styles';
import { AccentPopover } from '../components/accent-popover';

import type { AuthSplitSectionProps } from './section';
import type { AuthSplitContentProps } from './content';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

const AuthHeroPanel = lazy(() =>
  import('src/sections/auth/auth-hero-panel').then((m) => ({ default: m.AuthHeroPanel }))
);

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type AuthSplitLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    section?: AuthSplitSectionProps;
    content?: AuthSplitContentProps;
  };
};

/** Match main-site zip auth — ink wash split + glass form (shop keeps reauth gate). */
export function AuthSplitLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthSplitLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { t } = useTranslate();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [reauthReady, setReauthReady] = useState(() => searchParams.get('reauth') !== '1');

  const mainAppUrl =
    (import.meta.env.VITE_MAIN_APP_URL as string | undefined) || 'https://battleasia.gg';

  useEffect(() => {
    if (searchParams.get('reauth') !== '1') {
      setReauthReady(true);
      return undefined;
    }

    let cancelled = false;

    const runReauth = async () => {
      clearShopSession();
      try {
        await axios.post('api/v2/users/logout');
      } catch {
        // ignore
      }
      dispatch(logoutAction());
      clearShopPersistStorage();

      if (cancelled) return;

      const next = new URL(window.location.href);
      next.searchParams.delete('reauth');
      router.replace(`${next.pathname}${next.search}${next.hash}`);
      setReauthReady(true);
    };

    void runReauth();
    return () => {
      cancelled = true;
    };
  }, [dispatch, router, searchParams]);

  useEffect(() => {
    if (!reauthReady || searchParams.get('reauth') === '1') return;
    if (isLoggedIn && hasShopSession()) {
      router.replace(paths.user.shop);
    }
  }, [isLoggedIn, reauthReady, router, searchParams]);

  if (!reauthReady) {
    return null;
  }

  if (isLoggedIn && hasShopSession()) {
    return null;
  }

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          px: { xs: 2, md: 3 },
          minHeight: 72,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      leftArea: (
        <Logo
          sx={{
            width: { xs: 72, sm: 80 },
            height: 'auto',
            '& img': { objectFit: 'contain', width: '100%', height: 'auto' },
          }}
        />
      ),
      rightArea: (
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccentPopover />
          <Button
            href={`${mainAppUrl.replace(/\/$/, '')}/`}
            startIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
            sx={{
              minHeight: 36,
              height: 36,
              px: 1.5,
              borderRadius: '10px',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              color: 'var(--ba-gold)',
              bgcolor: alpha('#000000', 0.35),
              border: `1px solid ${goldAlpha(0.35)}`,
              boxShadow: 'none',
              '& .MuiButton-startIcon': { mr: 0.75, ml: 0 },
              '&:hover': {
                bgcolor: goldAlpha(0.1),
                borderColor: 'var(--ba-gold)',
              },
            }}
          >
            {t('auth.backHome')}
          </Button>
        </Stack>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        disableOffset
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={[
          {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            bgcolor: 'rgba(6,6,7,0.94)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
            boxShadow: 'none',
          },
          ...(Array.isArray(slotProps?.header?.sx)
            ? (slotProps?.header?.sx ?? [])
            : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        () => ({
          [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row', alignItems: 'stretch' },
        }),
        ...(Array.isArray(slotProps?.main?.sx)
          ? (slotProps?.main?.sx ?? [])
          : [slotProps?.main?.sx]),
        {
          bgcolor: '#060607',
          position: 'relative',
          overflowX: 'clip',
          overflowY: 'visible',
          minHeight: {
            xs: 'calc(100svh - var(--layout-header-mobile-height, 72px))',
            md: 'calc(100svh - var(--layout-header-desktop-height, 72px))',
          },
          backgroundImage: `url(${AUTH_BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `
              linear-gradient(180deg, ${alpha('#060607', 0.55)} 0%, ${alpha('#060607', 0.72)} 45%, ${alpha('#060607', 0.88)} 100%),
              radial-gradient(70% 45% at 50% 0%, ${goldAlpha(0.1)} 0%, transparent 55%)
            `,
          },
        },
      ]}
    >
      <AuthSplitContent
        layoutQuery={layoutQuery}
        {...slotProps?.content}
        sx={{
          position: 'relative',
          zIndex: 3,
          display: { xs: 'none', [layoutQuery]: 'flex' },
          order: { [layoutQuery]: 0 },
          flex: { [layoutQuery]: '1 1 52%' },
          maxWidth: { [layoutQuery]: '52%' },
          alignItems: 'center',
          justifyContent: 'center',
          px: { md: '28px', lg: 5 },
          py: { md: 7 },
          '&::before': { display: 'none' },
        }}
      >
        <Suspense fallback={<Box sx={{ minHeight: 420, width: 1 }} aria-hidden />}>
          <AuthHeroPanel />
        </Suspense>
      </AuthSplitContent>

      <AuthSplitSection
        layoutQuery={layoutQuery}
        {...slotProps?.section}
        sx={{
          position: 'relative',
          zIndex: 3,
          order: { xs: 0, [layoutQuery]: 1 },
          flex: { xs: '1 1 auto', [layoutQuery]: '1 1 48%' },
          maxWidth: { [layoutQuery]: '48%' },
          minHeight: {
            xs: 'calc(100svh - var(--layout-header-mobile-height, 72px))',
            md: 'calc(100svh - var(--layout-header-desktop-height, 72px))',
          },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowX: 'clip',
          overflowY: 'visible',
          py: { xs: 3, md: 6 },
          px: { xs: 2.5, sm: 4, md: '28px' },
        }}
      >
        {children}
      </AuthSplitSection>
    </MainSection>
  );

  return (
    <LayoutSection
      headerSection={renderHeader()}
      footerSection={null}
      cssVars={{
        '--layout-auth-content-width': '460px',
        '--layout-header-desktop-height': '72px',
        '--layout-header-mobile-height': '72px',
        '--layout-main-margin-top': '72px',
        '--layout-main-mobile-margin-top': '72px',
        ...cssVars,
      }}
      sx={{
        bgcolor: '#060607',
        ...sx,
      }}
    >
      {renderMain()}
    </LayoutSection>
  );
}
