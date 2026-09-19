import { Link } from 'react-router-dom';
import { LocaleSelect } from '../components/LocaleSelect';
import { ASSETS } from '../lib/assets';
import { useI18n } from '../lib/i18n';

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'notFound' }) {
  const { t } = useI18n();
  return (
    <div className="auth-shell" style={{ padding: 40 }}>
      <header className="topbar" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Link className="brand" to="/auth/sign-in">
          <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
          <div className="brand-name">
            BATTLE ASIA <span>2.0</span>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LocaleSelect />
          <Link className="btn btn-ghost" to="/auth/sign-in">
            {t('legal.back')}
          </Link>
        </div>
      </header>
      <article className="legal-body">
        <h1>{t(`legal.${kind}Title`)}</h1>
        <p>{t(`legal.${kind}Body`)}</p>
      </article>
    </div>
  );
}
