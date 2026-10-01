import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, unwrapUser } from '../../lib/api';
import { captureAuthPayload, markSignedIn, safeReturnTo, type AuthUser } from '../../lib/auth';
import { registerPushToken } from '../../lib/push';
import { useI18n } from '../../lib/i18n';

export function OAuthFinishPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const access = hash.get('access') || '';
    const refresh = hash.get('refresh') || '';
    const returnTo = hash.get('returnTo');
    window.history.replaceState(null, '', '/auth/oauth');
    if (!access) {
      navigate('/auth/sign-in?oauth=failed', { replace: true });
      return;
    }
    captureAuthPayload({
      token: access,
      refreshToken: refresh,
      session: { accessToken: access, refreshToken: refresh },
    });
    let cancelled = false;
    api('/api/v2/users/me')
      .then((payload) => {
        if (cancelled) return;
        markSignedIn(unwrapUser<AuthUser>(payload));
        void registerPushToken('web');
        navigate(safeReturnTo(returnTo), { replace: true });
      })
      .catch(() => {
        if (!cancelled) navigate('/auth/sign-in?oauth=failed', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="signin-page">
      <p className="signin-note">{t('auth.oauthWorking')}</p>
    </div>
  );
}
