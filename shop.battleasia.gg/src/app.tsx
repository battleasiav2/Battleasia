import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { ApiProvider } from 'src/contexts/ApiContext';
import { SocketProvider } from 'src/contexts/SocketContext';
import { themeConfig, ThemeProvider } from 'src/theme';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import { defaultSettings, SettingsProvider } from 'src/components/settings';
import { DeferredSettingsDrawer } from 'src/components/settings/deferred-settings-drawer';
import { Toaster } from 'react-hot-toast';

import { AuthConsumer } from './utils/authcheck';
import { ProgressBar } from 'src/components/progress-bar';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <ApiProvider>
      <SocketProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider
            noSsr
            defaultMode={themeConfig.defaultMode}
            modeStorageKey={themeConfig.modeStorageKey}
          >
            <MotionLazy>
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  duration: 4000,
                }}
              />
              <ProgressBar />
              <DeferredSettingsDrawer defaultSettings={defaultSettings} />
              <AuthConsumer>{children}</AuthConsumer>
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </SocketProvider>
    </ApiProvider>
  );
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
