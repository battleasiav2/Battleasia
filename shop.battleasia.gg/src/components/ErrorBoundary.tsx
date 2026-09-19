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

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException({ message: error.message, extra: info.componentStack });
  }

  render() {
    if (this.state.crashed) {
      const copy = crashCopy();
      return (
        <div className="auth-shell" style={{ padding: 40 }}>
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
