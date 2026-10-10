import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMe } from '../../lib/auth';
import { fetchMatchHistory, fetchProfile, type PublicProfile } from '../../lib/social';
import { useI18n } from '../../lib/i18n';

type HistRow = Record<string, unknown>;

function formatWhen(value?: unknown) {
  if (!value) return '';
  return new Date(String(value)).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function StatsPage() {
  const { t } = useI18n();
  useHudPage();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [history, setHistory] = useState<HistRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    setError('');
    Promise.all([
      fetchMe().then((me) => fetchProfile(me.id || '')),
      fetchMatchHistory(),
    ])
      .then(([prof, rows]) => {
        if (!live) return;
        setProfile(prof);
        setHistory(rows as HistRow[]);
      })
      .catch((err) => {
        if (!live) return;
        setError(isApiError(err) ? err.message : t('stats.offline'));
        setHistory([]);
      });
    return () => {
      live = false;
    };
  }, [t]);

  const g = profile?.gamingStats;

  const bac = useMemo(() => {
    const list = history || [];
    let paid = 0;
    let won = 0;
    for (const row of list) {
      paid += num(row.entryFee ?? (row.match as { entryFee?: number } | undefined)?.entryFee);
      won += num(row.winnings ?? row.amountWon);
    }
    return { paid, won, net: won - paid, played: list.length };
  }, [history]);

  const recent = useMemo(() => {
    const list = [...(history || [])];
    list.sort((a, b) => {
      const ta = new Date(String(a.matchSchedule || a.createdAt || 0)).getTime();
      const tb = new Date(String(b.matchSchedule || b.createdAt || 0)).getTime();
      return tb - ta;
    });
    return list.slice(0, 12);
  }, [history]);

  const loading = history === null && !error;

  return (
    <main className="play-main orders-hub">
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
      {loading ? <div className="match-row skeleton" /> : null}

      {!loading ? (
        <>
          <section className="match-facts" aria-label={t('stats.career')}>
            <article>
              <small>{t('stats.matches')}</small>
              <strong>{g?.totalMatches ?? bac.played}</strong>
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

          <section className="room-card stats-bac-panel">
            <div className="dm-thread-head">
              <h2>{t('stats.bacSummary')}</h2>
              <Link className="btn btn-ghost" to="/user/account/my-matches">
                {t('stats.viewAll')}
              </Link>
            </div>
            <div className="match-facts stats-bac-facts">
              <article>
                <small>{t('stats.paid')}</small>
                <strong>
                  <CoinValue value={bac.paid} />
                </strong>
              </article>
              <article>
                <small>{t('stats.won')}</small>
                <strong>
                  <CoinValue value={bac.won} />
                </strong>
              </article>
              <article>
                <small>{t('stats.net')}</small>
                <strong className={bac.net >= 0 ? 'is-in' : 'is-out'}>
                  <CoinValue value={bac.net} />
                </strong>
              </article>
            </div>
          </section>

          <section className="room-card">
            <div className="dm-thread-head">
              <h2>{t('stats.recent')}</h2>
            </div>
            {recent.length === 0 ? (
              <div className="play-empty">
                <p>{t('matches.emptyLead')}</p>
                <Link className="btn btn-primary" to="/user/play">
                  {t('nav.play')}
                </Link>
              </div>
            ) : (
              <ul className="hist-feed orders-feed">
                {recent.map((row) => {
                  const id = String(row.matchId || row.id);
                  const won = num(row.winnings ?? row.amountWon);
                  const paid = num(row.entryFee);
                  const when = row.matchSchedule || row.createdAt || row.joinedAt;
                  return (
                    <li key={id}>
                      <Link className="hist-item hist-item-link" to={`/user/play/${id}/result`}>
                        <div className="hist-item-main">
                          <span className="hist-pill hist-pill-game">{String(row.gameName || t('matches.match'))}</span>
                          <strong>{String(row.matchName || id)}</strong>
                          <small>
                            {t('matches.rank')} {String(row.rank ?? '—')} · {t('matches.kills')} {String(row.kills ?? 0)}
                            {when ? ` · ${formatWhen(when)}` : ''}
                            {' · '}
                            {t('stats.paid')} {paid}
                          </small>
                        </div>
                        <div className={`hist-amt ${won > 0 ? 'is-in' : ''}`}>
                          <span>
                            <CoinValue value={won} />
                          </span>
                          <small>{t('stats.won')}</small>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
