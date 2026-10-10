import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureException } from '../lib/sentry';

type Props = { children: ReactNode };
type State = { crashed: boolean };

const COPY: Record<string, { title: string; lead: string; reload: string }> = {
  en: {
    title: 'Something broke',
    lead: 'Reload the page. If it keeps happening, write support@battleasia.gg',
    reload: 'Reload',
  },
  bn: {
    title: 'কিছু একটা ভেঙেছে',
    lead: 'পেজ রিলোড করুন। বারবার হলে support@battleasia.gg-এ লিখুন',
    reload: 'রিলোড',
  },
  zh: {
    title: '出了点问题',
    lead: '请刷新页面。若反复出现，请写信给 support@battleasia.gg',
    reload: '刷新',
  },
  hi: {
    title: 'कुछ टूट गया',
    lead: 'पेज रीलोड करें। बार-बार हो तो support@battleasia.gg लिखें',
    reload: 'रीलोड',
  },
  ur: {
    title: 'کچھ ٹوٹ گیا',
    lead: 'صفحہ ری لوڈ کریں۔ بار بار ہو تو support@battleasia.gg لکھیں',
    reload: 'ری لوڈ',
  },
};

function crashCopy() {
  try {
    const raw = localStorage.getItem('ba-lang') || 'en';
    return COPY[raw] || COPY.en;
  } catch {
    return COPY.en;
  }
}

const RELOAD_KEY = 'ba-bundle-reload';

function isStaleBundleError(error: unknown) {
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String(error || '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk|Loading CSS chunk|Unable to preload CSS|dynamically imported module/i.test(msg);
}

/** After a deploy the open tab still asks for the old script. Reload once instead of the crash screen. */
export function reloadIfStaleBundle(error?: unknown) {
  if (error != null && !isStaleBundleError(error)) return false;
  try {
    if (sessionStorage.getItem(RELOAD_KEY) === '1') return false;
    sessionStorage.setItem(RELOAD_KEY, '1');
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (reloadIfStaleBundle(error)) return;
    captureException({ message: error.message, extra: info.componentStack });
  }

  render() {
    if (this.state.crashed) {
      const copy = crashCopy();
      return (
        <div className="crash-screen">
          <h1>{copy.title}</h1>
          <p>{copy.lead}</p>
          <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
            {copy.reload}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
