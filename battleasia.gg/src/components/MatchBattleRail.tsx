import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from './CoinValue';
import { useI18n } from '../lib/i18n';
import type { PulseMatch } from '../lib/dashboard';

function matchJoinHref(id: string, signedIn: boolean) {
  const play = '/user/play';
  if (!id || id.startsWith('demo-') || id.startsWith('live-fake-')) {
    return signedIn ? play : `/auth/sign-in?returnTo=${encodeURIComponent(play)}`;
  }
  const path = `/user/play/${id}/detail`;
  if (signedIn) return path;
  return `/auth/sign-in?returnTo=${encodeURIComponent(path)}`;
}

function isFull(m: PulseMatch) {
  const cap = m.totalPlayer || 0;
  return cap > 0 && m.participantsCount >= cap;
}

export function MatchBattleRail({
  title,
  matches,
  signedIn,
  variant = 'prize',
}: {
  title: string;
  matches: PulseMatch[];
  signedIn: boolean;
  variant?: 'prize' | 'ongoing';
}) {
  const { t } = useI18n();
  const railRef = useRef<HTMLDivElement>(null);
  const playHref = signedIn ? '/user/play' : `/auth/sign-in?returnTo=${encodeURIComponent('/user/play')}`;

  const scroll = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector('.battle-card') as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 12 : 220;
    rail.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  return (
    <section className={`battle-rail battle-rail-${variant}`} aria-label={title}>
      <div className="battle-rail-head">
        <h2>{title}</h2>
        <div className="battle-rail-nav">
          <button type="button" aria-label={t('rail.prev')} onClick={() => scroll(-1)}>
            ‹
          </button>
          <button type="button" aria-label={t('rail.next')} onClick={() => scroll(1)}>
            ›
          </button>
        </div>
      </div>

      {matches.length ? (
        <div className="battle-rail-track" ref={railRef}>
          {matches.slice(0, 8).map((m) => {
            const cap = m.totalPlayer || 0;
            const filled = m.participantsCount || 0;
            const pct = cap > 0 ? Math.min(100, Math.round((filled / Math.max(cap, 1)) * 100)) : 0;
            const full = isFull(m);
            const href = matchJoinHref(m.id, signedIn);
            const status = full
              ? t('pulse.matchFull')
              : variant === 'ongoing'
                ? t('pulse.live')
                : t('pulse.open');

            return (
              <article key={m.id} className="battle-card" data-match-card>
                <div className="battle-card-top">
                  <span className="battle-game">{m.gameName || 'Match'}</span>
                  <span className={`battle-status${full ? ' is-full' : ''}`}>
                    <i className="battle-status-dot" />
                    {status}
                  </span>
                </div>
                <h3 className="battle-title">{m.matchName}</h3>
                <div className="battle-spots">
                  <span>
                    {t('pulse.spots')} · {filled} / {cap || '—'}
                  </span>
                  <span className="battle-meter" aria-hidden>
                    <i style={{ width: `${pct}%` }} />
                  </span>
                </div>
                <div className="battle-stats">
                  <div>
                    <small>{t('pulse.entry')}</small>
                    <b>
                      {m.entryFee > 0 ? <CoinValue value={m.entryFee} size={16} /> : t('pulse.free')}
                    </b>
                  </div>
                  <div>
                    <small>{t('pulse.prizeEst')}</small>
                    <b>
                      {m.prizeEstimate > 0 ? <CoinValue value={m.prizeEstimate} size={16} /> : '—'}
                    </b>
                  </div>
                </div>
                {href ? (
                  full ? (
                    <span className="battle-play is-full">{t('pulse.matchFull')}</span>
                  ) : (
                    <Link
                      className="battle-play"
                      to={href}
                      aria-label={signedIn ? t('pulse.playNow') : t('pulse.signInToJoin')}
                    >
                      {t('pulse.playNow')} <span aria-hidden>→</span>
                    </Link>
                  )
                ) : (
                  <span className="battle-play is-full">—</span>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="battle-empty">{t('pulse.empty')}</p>
      )}

      <Link className="battle-view-all" to={playHref}>
        {t('pulse.viewAll')} →
      </Link>
    </section>
  );
}
