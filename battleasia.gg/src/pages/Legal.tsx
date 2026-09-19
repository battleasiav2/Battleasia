import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { LocaleSelect } from '../components/LocaleSelect';
import { ASSETS } from '../lib/assets';
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
    <div className="landing legal-page">
      <div className="landing-shell">
        <header className="topbar">
          <Link className="brand" to="/dashboard">
            <img src={ASSETS.logo} width={40} height={40} alt="BattleAsia" />
            <div className="brand-name">
              BATTLE ASIA <span>2.0</span>
            </div>
          </Link>
          <div className="top-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LocaleSelect />
            <Link className="btn btn-ghost" to="/dashboard">
              {t('legal.back')}
            </Link>
          </div>
        </header>
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
        <SiteFooter />
      </div>
    </div>
  );
}
