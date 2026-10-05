import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { LocaleSelect } from '../components/LocaleSelect';
import { useI18n } from '../lib/i18n';

const SECTIONS: Record<'privacy' | 'terms' | 'notFound', string[]> = {
  privacy: ['who', 'accounts', 'matches', 'payments', 'social', 'sharing', 'requests'],
  terms: ['who', 'play', 'rooms', 'bac', 'earn', 'results', 'referral', 'eligibility'],
  notFound: [],
};

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'notFound' }) {
  const { t } = useI18n();
  const sections = SECTIONS[kind];
  return (
    <div className="landing-fw grain legal-page">
        <header className="site-header">
          <div className="header-inner">
          <Link className="logo" to="/dashboard">
            <img src="/assets/fw/logo-battleasia.png" width={88} height={88} alt="BattleAsia" className="logo-img" />
            <span className="logo-text">Battle Asia</span>
          </Link>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LocaleSelect className="locale-select" />
            <Link className="btn btn-ghost" to="/dashboard">
              {t('legal.back')}
            </Link>
          </div>
          </div>
        </header>
        <main className="container" style={{ paddingBlock: '48px 80px' }}>
        <article className="legal-body">
          <header className="play-head">
            <div>
              <p className="eyebrow">{t('legal.eyebrow')}</p>
              <h1>{t(`legal.${kind}Title`)}</h1>
              <p className="play-lead">{t(`legal.${kind}Body`)}</p>
              {kind !== 'notFound' ? <p className="legal-intro">{t(`legal.${kind}Intro`)}</p> : null}
            </div>
          </header>
          {sections.length ? (
            <div className="legal-stack">
              {sections.map((id) => (
                <section key={id}>
                  <h2>{t(`legal.${kind}.${id}`)}</h2>
                  <p>{t(`legal.${kind}.${id}Body`)}</p>
                </section>
              ))}
            </div>
          ) : (
            <div className="play-empty">
              <h2>{t('legal.notFoundTitle')}</h2>
              <p>{t('legal.notFoundBody')}</p>
              <Link className="btn btn-primary" to="/dashboard">
                {t('legal.home')}
              </Link>
            </div>
          )}
        </article>
        </main>
        <SiteFooter />
    </div>
  );
}
