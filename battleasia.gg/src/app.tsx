import 'src/global.css';

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

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
  useDismissBootShell();

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

/** Dismiss static LCP boot shell after React has painted (fixed overlay → no CLS). */
function useDismissBootShell() {
  useEffect(() => {
    const shell = document.getElementById('boot-shell');
    if (!shell || shell.hasAttribute('hidden')) return undefined;

    let cancelled = false;
    const dismiss = () => {
      if (cancelled) return;
      shell.setAttribute('hidden', '');
      document.getElementById('boot-shell-css')?.remove();
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('touchstart', dismiss);
    };

    window.addEventListener('pointerdown', dismiss, { once: true, passive: true });
    window.addEventListener('keydown', dismiss, { once: true });
    window.addEventListener('touchstart', dismiss, { once: true, passive: true });
    // Short hold for first paint; long enough that hero is often ready underneath
    const fallback = window.setTimeout(dismiss, 1600);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('touchstart', dismiss);
    };
  }, []);
}
