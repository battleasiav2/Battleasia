import { useEffect, useState } from 'react';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMe } from '../../lib/auth';
import { fetchProfile, type PublicProfile } from '../../lib/social';
import { useI18n } from '../../lib/i18n';

export function StatsPage() {
  const { t } = useI18n();
  useHudPage();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMe()
      .then((me) => fetchProfile(me.id || ''))
      .then(setProfile)
      .catch((err) => setError(isApiError(err) ? err.message : t('stats.offline')));
  }, []);

  const g = profile?.gamingStats;

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('stats.eyebrow')}</p>
          <h1>{t('stats.title')}</h1>
          <p className="play-lead">{t('stats.lead')}</p>
        </div>
        <p className="play-count">
          <strong>{g?.totalWins ?? 0}</strong>
          <small>{t('stats.wins')}</small>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {!profile && !error ? <div className="match-row skeleton" /> : null}
      <section className="match-facts">
        <article>
          <small>{t('stats.matches')}</small>
          <strong>{g?.totalMatches ?? 0}</strong>
        </article>
        <article>
          <small>{t('stats.wins')}</small>
          <strong>{g?.totalWins ?? 0}</strong>
        </article>
        <article>
          <small>{t('stats.kills')}</small>
          <strong>{g?.totalKills ?? 0}</strong>
        </article>
        <article>
          <small>{t('stats.losses')}</small>
          <strong>{g?.totalLosses ?? 0}</strong>
        </article>
      </section>
    </main>
  );
}
