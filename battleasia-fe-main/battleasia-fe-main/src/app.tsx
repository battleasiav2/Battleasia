import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { ApiProvider } from 'src/contexts/ApiContext';
import { themeConfig, ThemeProvider } from 'src/theme';
import { I18nProvider, LocalizationProvider } from 'src/locales';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthConsumer } from './utils/authcheck';
import { LiveSyncProvider } from 'src/providers/live-sync-provider';
// import { SocialLinksFab } from './components/social-links-fab';
import { SupportChat } from 'src/components/support-chat';
import { Toaster } from 'react-hot-toast';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  // Capture referral code from URL (?ref=xxx) and persist to localStorage
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
              <MotionLazy>
                {/* <ProgressBar /> */}
                <SettingsDrawer defaultSettings={defaultSettings} />
                <AuthConsumer>
                  <LiveSyncProvider>{children}</LiveSyncProvider>
                </AuthConsumer>
                {/* <SocialLinksFab /> */}
                <SupportChat />
              </MotionLazy>
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
// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
