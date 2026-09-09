import { lazy, Suspense, useEffect } from 'react';

import { Box } from '@mui/material';
import { alpha, useTheme, keyframes, type Breakpoint } from '@mui/material/styles';

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

const scanlineDown = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(1000%); }
`;

const gridPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.58; }
`;

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

  const accentColor = theme.palette.primary.main || '#cbfb24';

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
          bgcolor: '#06070a',
          backgroundImage: `url(${AUTH_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          overflowX: 'clip',
          overflowY: 'visible',
          minHeight: {
            xs: 'calc(100dvh - var(--layout-header-mobile-height, 56px))',
            md: 'calc(100dvh - var(--layout-header-desktop-height, 60px))',
          },
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, ${alpha('#06070a', 0.65)} 0%, ${alpha('#080a0f', 0.45)} 48%, ${alpha('#06070a', 0.65)} 100%),
              radial-gradient(ellipse 70% 45% at 50% 0%, ${goldAlpha(0.12)} 0%, transparent 55%)
            `,
            zIndex: 0,
          },
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha('#06070a', 0.35)} 0%, transparent 40%, ${alpha('#06070a', 0.75)} 100%)`,
            zIndex: 0,
          },
        },
      ]}
    >
      {/* Cyber Grid Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${alpha('#ffffff', 0.03)} 1px, transparent 1px),
            linear-gradient(to bottom, ${alpha('#ffffff', 0.03)} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000000 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000000 35%, transparent 100%)',
          animation: `${gridPulse} 8s ease-in-out infinite`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Sweeping Laser Scanline */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${alpha(accentColor, 0.75)} 50%, transparent 100%)`,
          animation: `${scanlineDown} 9s linear infinite`,
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.4,
        }}
      />

      {/* Ambient Neon Back-glow Aura */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: { xs: 260, md: 440 },
          height: { xs: 260, md: 440 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(accentColor, 0.12)} 0%, transparent 70%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: { xs: 280, md: 460 },
          height: { xs: 280, md: 460 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#38bdf8', 0.08)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <AuthSplitSection
        layoutQuery={layoutQuery}
        {...slotProps?.section}
        sx={{
          position: 'relative',
          zIndex: 3,
          minHeight: { xs: 'auto', md: 'calc(100dvh - var(--layout-header-desktop-height, 60px))' },
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
              xs: `linear-gradient(180deg, ${alpha('#06070a', 0.55)} 0%, ${alpha('#06070a', 0.72)} 100%)`,
              md: `linear-gradient(90deg, ${alpha('#06070a', 0.28)} 0%, ${alpha('#06070a', 0.58)} 55%, ${alpha('#06070a', 0.7)} 100%)`,
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
        '--layout-header-desktop-height': '60px',
        '--layout-header-mobile-height': '56px',
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
