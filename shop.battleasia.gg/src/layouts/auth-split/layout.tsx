import { useEffect, useState } from 'react';
import { merge } from 'es-toolkit';

import { Alert } from '@mui/material';
import { alpha, useTheme, type Breakpoint } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useSelector, useDispatch } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';

import { AuthSplitSection } from './section';
import { AUTH_BG_IMAGE } from 'src/sections/auth/auth-form-styles';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';

import type { AuthSplitSectionProps } from './section';
import type { AuthSplitContentProps } from './content';
import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';

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
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [reauthDone, setReauthDone] = useState(() => searchParams.get('reauth') !== '1');

  // Main app / Docker / domain entry: always force a fresh shop login.
  // Clear shop Redux only — do NOT hit API logout (same-domain `/store`
  // shares the auth cookie with the main app).
  useEffect(() => {
    if (searchParams.get('reauth') !== '1') {
      setReauthDone(true);
      return;
    }

    dispatch(logoutAction());
    try {
      localStorage.removeItem('persist:battleasia-shop');
    } catch {
      // ignore storage errors
    }
    router.replace(paths.auth.signIn);
    setReauthDone(true);
  }, [dispatch, router, searchParams]);

  useEffect(() => {
    if (reauthDone && isLoggedIn) {
      router.replace(paths.user.shop);
    }
  }, [isLoggedIn, reauthDone, router]);

  if (!reauthDone || isLoggedIn) {
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
          [theme.breakpoints.up(layoutQuery)]: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }),
        ...(Array.isArray(slotProps?.main?.sx)
          ? (slotProps?.main?.sx ?? [])
          : [slotProps?.main?.sx]),
        {
          bgcolor: '#0a0a0a',
          backgroundImage: `url(${AUTH_BG_IMAGE})`,
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
              radial-gradient(ellipse 55% 50% at 50% 45%, ${alpha(GOLD, 0.12)} 0%, transparent 62%),
              linear-gradient(180deg, ${alpha('#070708', 0.9)} 0%, ${alpha('#070708', 0.95)} 100%)
            `,
            zIndex: 0,
          },
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, ${alpha('#050506', 0.85)} 100%)`,
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
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'flex-start', md: 'center' },
          overflow: 'auto',
          py: { xs: 3, md: 4 },
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
      cssVars={{ '--layout-auth-content-width': '620px', ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
