import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import '../styles/landing-5173.css';

const SECTIONS: Record<'privacy' | 'terms' | 'notFound', string[]> = {
  privacy: ['who', 'accounts', 'matches', 'payments', 'social', 'sharing', 'requests'],
  terms: ['who', 'play', 'rooms', 'bac', 'earn', 'results', 'referral', 'eligibility'],
  notFound: [],
};

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'notFound' }) {
  const { t } = useI18n();
  const sections = SECTIONS[kind];
  return (
    <div className="ba5173">
      <div className="site-shell">
        <header className="topbar legal-top">
          <div className="wrap nav-inner">
            <Link className="brand" to="/">
              <img src="/assets/logo-battleasia.png" alt="BattleAsia" className="brand-logo" width={44} height={44} />
              <span>Battle Asia</span>
            </Link>
            <Link className="btn btn-ghost legal-back" to="/">
              <ArrowLeft size={16} />
              {t('legal.back')}
            </Link>
          </div>
        </header>
        <main className="legal-main">
          <p className="legal-kicker">{t('legal.eyebrow')}</p>
          <h1 className="legal-title">{t(`legal.${kind}Title`)}</h1>
          <p className="legal-lead">{t(`legal.${kind}Body`)}</p>
          {kind !== 'notFound' ? <p className="legal-intro">{t(`legal.${kind}Intro`)}</p> : null}
          {sections.length ? (
            <div className="legal-cards">
              {sections.map((id) => (
                <section className="legal-card" key={id}>
                  <h2>{t(`legal.${kind}.${id}`)}</h2>
                  <p>{t(`legal.${kind}.${id}Body`)}</p>
                </section>
              ))}
            </div>
          ) : (
            <div className="legal-cards">
              <section className="legal-card">
                <h2>{t('legal.notFoundTitle')}</h2>
                <p>{t('legal.notFoundBody')}</p>
                <Link className="btn btn-primary legal-home" to="/">
                  {t('legal.home')}
                </Link>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
