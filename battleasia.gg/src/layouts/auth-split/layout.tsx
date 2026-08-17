import { lazy, Suspense, useEffect } from 'react';
import { merge } from 'es-toolkit';

import { Alert, Box, Button } from '@mui/material';
import { alpha, useTheme, type Breakpoint } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useSelector } from 'src/store';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { AuthSplitSection } from './section';
import { AuthSplitContent } from './content';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';

import type { AuthSplitSectionProps } from './section';
import type { AuthSplitContentProps } from './content';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

const AuthHeroPanel = lazy(() =>
  import('src/sections/auth/auth-hero-panel').then((m) => ({ default: m.AuthHeroPanel }))
);

// ----------------------------------------------------------------------

const GOLD = '#f5c518';
const AUTH_BG = '/assets/images/auth/auth-bg.webp';

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

export function AuthSplitLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthSplitLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslate();

  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = AUTH_BG;
    link.type = 'image/webp';
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(paths.user.play);
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: { maxWidth: false, sx: { px: { xs: 2, md: 3 } } },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <Button
          component={RouterLink}
          href={paths.dashboard.root}
          startIcon={<Iconify icon="solar:arrow-left-bold" width={12} />}
          sx={{
            minHeight: 26,
            height: 26,
            px: 1,
            py: 0,
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: 'none',
            lineHeight: 1,
            color: GOLD,
            bgcolor: alpha('#000000', 0.45),
            border: `1px solid ${alpha(GOLD, 0.4)}`,
            boxShadow: 'none',
            '& .MuiButton-startIcon': { mr: 0.5, ml: 0 },
            '&:hover': {
              bgcolor: alpha(GOLD, 0.12),
              borderColor: GOLD,
              boxShadow: `0 0 8px ${alpha(GOLD, 0.16)}`,
            },
          }}
        >
          {t('auth.backHome')}
        </Button>
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
            position: 'sticky',
            bgcolor: 'transparent',
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
          [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row' },
        }),
        ...(Array.isArray(slotProps?.main?.sx)
          ? (slotProps?.main?.sx ?? [])
          : [slotProps?.main?.sx]),
        {
          bgcolor: '#0a0a0a',
          backgroundImage: `url(${AUTH_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          minHeight: {
            xs: 'calc(100dvh - var(--layout-header-mobile-height, 36px))',
            md: 'calc(100dvh - var(--layout-header-desktop-height, 40px))',
          },
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, ${alpha('#0a0a0a', 0.9)} 0%, ${alpha('#0a0a0a', 0.7)} 48%, ${alpha('#0a0a0a', 0.82)} 100%),
              radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha(GOLD, 0.08)} 0%, transparent 55%)
            `,
            zIndex: 0,
          },
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha('#0a0a0a', 0.35)} 0%, transparent 40%, ${alpha('#0a0a0a', 0.88)} 100%)`,
            zIndex: 0,
          },
        },
      ]}
    >
      <AuthSplitSection
        layoutQuery={layoutQuery}
        {...slotProps?.section}
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: { xs: 'auto', md: 'calc(100dvh - var(--layout-header-desktop-height, 40px))' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'flex-start', md: 'center' },
          overflowY: 'visible',
          py: { xs: 2, md: 4 },
        }}
      >
        {children}
      </AuthSplitSection>
      <AuthSplitContent
        layoutQuery={layoutQuery}
        {...slotProps?.content}
        sx={{
          position: 'relative',
          zIndex: 1,
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: {
              xs: `linear-gradient(180deg, ${alpha('#0a0a0a', 0.55)} 0%, ${alpha('#0a0a0a', 0.72)} 100%)`,
              md: `linear-gradient(90deg, ${alpha('#0a0a0a', 0.28)} 0%, ${alpha('#0a0a0a', 0.58)} 55%, ${alpha('#0a0a0a', 0.7)} 100%)`,
            },
          },
        }}
      >
        <Suspense fallback={<BoxMinHeight />}>
          <AuthHeroPanel />
        </Suspense>
      </AuthSplitContent>
    </MainSection>
  );

  return (
    <LayoutSection
      headerSection={renderHeader()}
      footerSection={null}
      cssVars={{
        '--layout-auth-content-width': '620px',
        '--layout-header-desktop-height': '40px',
        '--layout-header-mobile-height': '36px',
        '--layout-main-margin-top': '0px',
        '--layout-main-mobile-margin-top': '0px',
        ...cssVars,
      }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}

function BoxMinHeight() {
  return <Box sx={{ minHeight: { xs: 180, md: 420 }, width: 1 }} aria-hidden />;
}
