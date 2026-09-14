import { lazy, Suspense, useEffect } from 'react';

import { Box } from '@mui/material';
import { alpha, useTheme, type Breakpoint } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSelector } from 'src/store';

import { AuthSplitSection } from './section';
import { AuthSplitContent } from './content';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { HomeHeader } from '../components/home-header';

import type { AuthSplitSectionProps } from './section';
import type { AuthSplitContentProps } from './content';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';
import { goldAlpha } from 'src/theme/accent-presets';

const AuthHeroPanel = lazy(() =>
  import('src/sections/auth/auth-hero-panel').then((m) => ({ default: m.AuthHeroPanel }))
);

// ----------------------------------------------------------------------

const AUTH_BG = '/auth-background.jpeg';

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

  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = AUTH_BG;
    link.type = 'image/jpeg';
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
          bgcolor: '#060607',
          backgroundImage: `url(${AUTH_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          overflowX: 'clip',
          overflowY: 'visible',
          minHeight: {
            xs: 'calc(100dvh - var(--layout-header-mobile-height, 72px))',
            md: 'calc(100dvh - var(--layout-header-desktop-height, 72px))',
          },
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, ${alpha('#060607', 0.28)} 0%, ${alpha('#0b0b0d', 0.16)} 48%, ${alpha('#060607', 0.28)} 100%),
              radial-gradient(ellipse 70% 45% at 50% 0%, ${goldAlpha(0.08)} 0%, transparent 55%)
            `,
            zIndex: 0,
          },
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha('#060607', 0.18)} 0%, transparent 42%, ${alpha('#060607', 0.42)} 100%)`,
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
          zIndex: 3,
          minHeight: { xs: 'auto', md: 'calc(100dvh - var(--layout-header-desktop-height, 72px))' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'flex-start', md: 'center' },
          overflowX: 'clip',
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
          zIndex: 3,
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: {
              xs: `linear-gradient(180deg, ${alpha('#060607', 0.22)} 0%, ${alpha('#060607', 0.38)} 100%)`,
              md: `linear-gradient(90deg, ${alpha('#060607', 0.12)} 0%, ${alpha('#060607', 0.28)} 55%, ${alpha('#060607', 0.4)} 100%)`,
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
      headerSection={
        <HomeHeader
          layoutQuery="lg"
          slotProps={slotProps?.header ? { header: slotProps.header } : undefined}
        />
      }
      footerSection={null}
      cssVars={{
        '--layout-auth-content-width': '620px',
        '--layout-header-desktop-height': '72px',
        '--layout-header-mobile-height': '72px',
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
