import { lazy, Suspense, useEffect } from 'react';
import { merge } from 'es-toolkit';

import { Alert, Box, useMediaQuery } from '@mui/material';
import { alpha, useTheme, type Breakpoint } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSelector } from 'src/store';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isLoggedIn } = useSelector((state) => state.auth);

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
      container: { maxWidth: false },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: null,
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
          { position: { [layoutQuery]: 'fixed' } },
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
          minHeight: '100vh',
          '&::before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, ${alpha('#0a0a0a', 0.88)} 0%, ${alpha('#0a0a0a', 0.62)} 48%, ${alpha('#0a0a0a', 0.78)} 100%),
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
          minHeight: { xs: '100vh', md: '100vh' },
          ...(isMobile && {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'auto',
            py: 3,
          }),
        }}
      >
        {children}
      </AuthSplitSection>
      {!isMobile && (
        <AuthSplitContent layoutQuery={layoutQuery} {...slotProps?.content} sx={{ position: 'relative', zIndex: 1 }}>
          <Suspense fallback={<BoxMinHeight />}>
            <AuthHeroPanel />
          </Suspense>
        </AuthSplitContent>
      )}
    </MainSection>
  );

  return (
    <LayoutSection
      headerSection={renderHeader()}
      footerSection={null}
      cssVars={{ '--layout-auth-content-width': '620px', ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}

function BoxMinHeight() {
  return <Box sx={{ minHeight: 420, width: 1 }} aria-hidden />;
}
