import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { I18nProvider } from './lib/i18n';
import { bootSentry } from './lib/sentry';

bootSentry();
try {
  const lang = localStorage.getItem('ba-lang');
  if (lang) document.documentElement.lang = lang;
} catch {
  /* ignore */
}
document.getElementById('boot-shell')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>
);
