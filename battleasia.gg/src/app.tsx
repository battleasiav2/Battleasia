import 'src/global.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow/latin-800.css';
import '@fontsource/barlow/latin-900.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { ApiProvider } from 'src/contexts/ApiContext';
import { themeConfig, ThemeProvider } from 'src/theme';
import { I18nProvider, LocalizationProvider } from 'src/locales';

import { DeferredSettingsDrawer } from 'src/components/settings/deferred-settings-drawer';
import { DeferredSupportChat } from 'src/components/deferred-support-chat';
import { defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthConsumer } from './utils/authcheck';
import { LiveSyncProvider } from 'src/providers/live-sync-provider';
import { Toaster } from 'react-hot-toast';
import { LostLightLoader } from 'src/components/loading-screen';
import { TacticalCursor } from 'src/components/gaming-cursor';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('battleasia_ref', ref);
    }
  }, []);

  return (
    <I18nProvider>
      <ApiProvider>
        <LocalizationProvider>
          <SettingsProvider defaultSettings={defaultSettings}>
            <ThemeProvider
              noSsr
              defaultMode={themeConfig.defaultMode}
              modeStorageKey={themeConfig.modeStorageKey}
            >
              <TacticalCursor />
              <LostLightLoader />
              <DeferredSettingsDrawer defaultSettings={defaultSettings} />
              <AuthConsumer>
                <LiveSyncProvider>{children}</LiveSyncProvider>
              </AuthConsumer>
              <DeferredSupportChat />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                }}
              />
            </ThemeProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </ApiProvider>
    </I18nProvider>
  );
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
