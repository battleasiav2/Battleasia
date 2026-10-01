import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rememberShopRefresh } from '../../lib/api';
import { fetchMe, markShopGate, safeReturnTo } from '../../lib/auth';
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
    rememberShopRefresh({
      token: access,
      refreshToken: refresh,
      session: { accessToken: access, refreshToken: refresh },
    });
    let cancelled = false;
    fetchMe()
      .then((user) => {
        if (cancelled) return;
        markShopGate(user);
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
