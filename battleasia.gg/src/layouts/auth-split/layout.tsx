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

/** Zip `.auth-split` — ink + soft gold wash only (no photo BG). */
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
          // Zip `.auth-split::before`
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(70% 45% at 50% 0%, ${goldAlpha(0.06)} 0%, transparent 55%),
              linear-gradient(180deg, ${alpha('#060607', 0.18)} 0%, transparent 42%, ${alpha('#060607', 0.42)} 100%)
            `,
          },
        },
      ]}
    >
      {/* Zip: hero LEFT on desktop, hidden on mobile */}
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
        <Suspense fallback={<BoxMinHeight />}>
          <AuthHeroPanel />
        </Suspense>
      </AuthSplitContent>

      {/* Zip: form RIGHT on desktop, full-width first on mobile */}
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
      headerSection={
        <HomeHeader
          layoutQuery="lg"
          slotProps={{
            // Zip auth `.site-header.scrolled` — always ink glass (not transparent over white body)
            header: {
              ...slotProps?.header,
              sx: {
                bgcolor: 'rgba(6,6,7,0.94)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                ...(slotProps?.header?.sx &&
                typeof slotProps.header.sx === 'object' &&
                !Array.isArray(slotProps.header.sx)
                  ? slotProps.header.sx
                  : null),
              },
            },
          }}
        />
      }
      footerSection={null}
      cssVars={{
        '--layout-auth-content-width': '460px',
        '--layout-header-desktop-height': '72px',
        '--layout-header-mobile-height': '72px',
        // Fixed HomeHeader — zip `.auth-split { margin-top: 72px }`
        '--layout-main-margin-top': '72px',
        '--layout-main-mobile-margin-top': '72px',
        ...cssVars,
      }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}

function BoxMinHeight() {
  return <Box sx={{ minHeight: 420, width: 1 }} aria-hidden />;
}
