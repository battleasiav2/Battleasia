import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ZipAmount } from './landing/ZipMedia';
import { useI18n } from '../lib/i18n';
import type { PulseMatch } from '../lib/dashboard';
import { guestPlayHref } from '../lib/landingAuth';

function matchJoinHref(id: string, signedIn: boolean) {
  const play = '/user/play';
  if (!id || id.startsWith('demo-') || id.startsWith('live-fake-')) {
    return signedIn ? play : guestPlayHref(play);
  }
  const path = `/user/play/${id}/detail`;
  if (signedIn) return path;
  return guestPlayHref(path);
}

function isFull(m: PulseMatch) {
  const cap = m.totalPlayer || 0;
  return cap > 0 && m.participantsCount >= cap;
}

export function MatchBattleRail({
  prizeMatches,
  liveMatches,
  signedIn,
}: {
  prizeMatches: PulseMatch[];
  liveMatches: PulseMatch[];
  signedIn: boolean;
}) {
  const { t } = useI18n();
  const [variant, setVariant] = useState<'prize' | 'ongoing'>('prize');
  const matches = variant === 'prize' ? prizeMatches : liveMatches;
  const railRef = useRef<HTMLDivElement>(null);
  const playHref = signedIn ? '/user/play' : guestPlayHref('/user/play');

  const scroll = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector('.match-card') as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 16 : 280;
    rail.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  return (
    <section className="section" aria-labelledby="match-title">
      <div className="container">
        <div className="section-head reveal-group reveal-group-direct">
          <h2 id="match-title" className="reveal">
            {variant === 'prize' ? t('pulse.highPrizeBattles') : t('pulse.liveBattles')}
          </h2>
          <p className="lead reveal">{t('pulse.matchRailLead')}</p>
        </div>
        <div className="match-tabs reveal">
          <button
            type="button"
            className={`match-tab${variant === 'prize' ? ' is-active' : ''}`}
            onClick={() => setVariant('prize')}
          >
            {t('pulse.highPrizeBattles')}
          </button>
          <button
            type="button"
            className={`match-tab${variant === 'ongoing' ? ' is-active' : ''}`}
            onClick={() => setVariant('ongoing')}
          >
            {t('pulse.liveBattles')}
          </button>
          <span className="tab-underline" aria-hidden />
        </div>
        <div className="match-rail-wrap">
          <button type="button" className="rail-nav rail-prev" aria-label={t('rail.prev')} onClick={() => scroll(-1)}>
            ‹
          </button>
          {matches.length ? (
            <div className="match-rail reveal-group reveal-group-direct" ref={railRef} key={variant}>
              {matches.slice(0, 5).map((m) => {
                const cap = m.totalPlayer || 0;
                const filled = m.participantsCount || 0;
                const pct = cap > 0 ? Math.min(100, Math.round((filled / Math.max(cap, 1)) * 100)) : 0;
                const full = isFull(m);
                const finished = m.status === 'complete';
                const href = matchJoinHref(m.id, signedIn);
                const status = full
                  ? t('pulse.matchFull')
                  : finished
                    ? t('pulse.complete')
                    : m.status === 'active' || variant !== 'ongoing'
                      ? t('pulse.open')
                      : t('pulse.live');

                const inner = (
                  <>
                    <h4>{m.matchName}</h4>
                    <p className="match-meta">{m.gameName || 'Match'}</p>
                    <div className="match-bar" data-pct={pct}>
                      <span />
                    </div>
                    <div className="match-foot">
                      <span>
                        {t('pulse.entry')}: {m.entryFee > 0 ? <ZipAmount value={m.entryFee} /> : t('pulse.free')}
                      </span>
                      <span>
                        {t('pulse.prizeEst')}: {m.prizeEstimate > 0 ? <ZipAmount value={m.prizeEstimate} /> : '—'}
                      </span>
                    </div>
                    <div className="match-foot" style={{ marginTop: 8 }}>
                      <span>{status}</span>
                      <span>
                        {filled}/{cap || '—'}
                      </span>
                    </div>
                  </>
                );

                if (href && !full && !finished) {
                  return (
                    <Link key={m.id} className="match-card card reveal" to={href}>
                      {inner}
                    </Link>
                  );
                }
                if (href && finished) {
                  return (
                    <Link key={m.id} className="match-card card reveal" to={href}>
                      {inner}
                    </Link>
                  );
                }
                return (
                  <article key={m.id} className="match-card card reveal">
                    {inner}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-muted" style={{ padding: '24px 0' }}>
              {t('pulse.empty')}
            </p>
          )}
          <button type="button" className="rail-nav rail-next" aria-label={t('rail.next')} onClick={() => scroll(1)}>
            ›
          </button>
        </div>
        <p style={{ marginTop: 16 }}>
          <Link className="text-link" to={playHref}>
            {t('pulse.viewAll')} →
          </Link>
        </p>
      </div>
    </section>
  );
}
