import { useEffect, useState } from 'react';
import { CoinValue } from '../../components/CoinValue';
import { useHudPage } from '../../hooks/useHudPage';
import { isApiError } from '../../lib/api';
import { fetchMe, readSessionUser } from '../../lib/auth';
import {
  claimReferralMilestone,
  fetchReferralCommissions,
  fetchReferralStats,
  fetchReferrals,
  type ReferralStats,
} from '../../lib/social';
import { useI18n } from '../../lib/i18n';

export function ReferralPage() {
  const { t } = useI18n();
  const { toast } = useHudPage();
  const [code, setCode] = useState(readSessionUser()?.referralCode || '');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [people, setPeople] = useState<Array<{ id: string; username: string; totalEarnings?: number; status?: string }>>([]);
  const [history, setHistory] = useState<Array<{ id: string; referredUsername?: string; commissionAmount?: number; createdAt?: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMe()
      .then((u) => {
        if (u.referralCode) setCode(u.referralCode);
      })
      .catch(() => undefined);
    Promise.all([fetchReferralStats(), fetchReferrals(), fetchReferralCommissions()])
      .then(([s, p, h]) => {
        setStats(s);
        setPeople(p);
        setHistory(h);
      })
      .catch((err) => setError(isApiError(err) ? err.message : t('ref.offline')));
  }, [t]);

  const link = `${window.location.origin}/auth/sign-up?ref=${encodeURIComponent(code || '')}`;

  function statusLabel(status?: string) {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'approved') return t('ref.active');
    if (s === 'pending' || s === 'invited') return t('ref.pending');
    if (s === 'inactive' || s === 'disabled') return t('ref.inactive');
    return status || '—';
  }

  function statusTone(status?: string) {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'approved') return 'in';
    if (s === 'pending' || s === 'invited') return 'out';
    return 'out';
  }

  function whenLabel(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  async function copy(text: string, ok: string) {
    await navigator.clipboard.writeText(text);
    toast(ok);
  }

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('ref.eyebrow')}</p>
          <h1>{t('ref.title')}</h1>
          <p className="play-lead">{t('ref.lead')}</p>
        </div>
        <p className="play-count">
          <strong>
            <CoinValue value={stats?.totalEarnings ?? 0} />
          </strong>
          <small>{t('ref.earned')}</small>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}

      {stats === null && !error ? <div className="match-row skeleton" /> : null}

      <section className="match-facts">
        <article>
          <small>{t('ref.network')}</small>
          <strong>{stats?.totalReferrals ?? '—'}</strong>
        </article>
        <article>
          <small>{t('ref.active')}</small>
          <strong>{stats?.activeReferrals ?? '—'}</strong>
        </article>
        <article>
          <small>{t('ref.rate')}</small>
          <strong>{stats ? `${stats.commissionRate}%` : '—'}</strong>
        </article>
        <article>
          <small>{t('ref.earned')}</small>
          <strong>
            <CoinValue value={stats?.totalEarnings ?? 0} />
          </strong>
        </article>
      </section>

      <div className="hub-stage">
        <section className="room-card">
          <h2>{t('ref.code')}</h2>
          <div className="pay-copy">
            <p className="pay-addr">{code || '—'}</p>
            <button className="btn btn-ghost" type="button" disabled={!code} onClick={() => void copy(code, t('ref.codeCopied'))}>
              {t('ref.copyCode')}
            </button>
          </div>
          <div className="pay-copy">
            <p className="pay-addr">{link}</p>
            <button className="btn btn-primary" type="button" disabled={!code} onClick={() => void copy(link, t('ref.copied'))}>
              {t('ref.copy')}
            </button>
          </div>
        </section>
        <section className="room-card">
          <h2>{t('ref.milestones')}</h2>
          {stats?.referralMilestones?.length ? (
            <ul className="roster">
              {stats.referralMilestones.map((m) => (
                <li key={m.key || String(m.target)}>
                  <span>
                    {m.target || m.key} {t('ref.invites')}
                    {m.claimed ? ` · ${t('ref.claimed')}` : ''}
                  </span>
                  {!m.claimed && m.key ? (
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={async () => {
                        try {
                          await claimReferralMilestone(m.key!);
                          toast(t('ref.claimOk'));
                          setStats(await fetchReferralStats());
                        } catch (err) {
                          toast(isApiError(err) ? err.message : t('ref.claimFail'));
                        }
                      }}
                    >
                      {t('ref.claim')}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="play-muted">{t('ref.noMilestones')}</p>
          )}
        </section>
      </div>

      <div className="hub-stage">
        <section className="room-card">
          <h2>{t('ref.network')}</h2>
          {people.length === 0 ? (
            <p className="play-muted">{t('ref.emptyLead')}</p>
          ) : (
            <div className="xfer-list">
              {people.map((p) => (
                <article className="xfer-item" key={p.id}>
                  <div>
                    <b>{p.username}</b>
                    <small>
                      <span className={`xfer-dir ${statusTone(p.status)}`}>{statusLabel(p.status)}</span>
                    </small>
                  </div>
                  <CoinValue value={p.totalEarnings || 0} />
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="room-card">
          <h2>{t('ref.history')}</h2>
          {history.length === 0 ? (
            <p className="play-muted">{t('ref.noHist')}</p>
          ) : (
            <div className="xfer-list">
              {history.map((h) => (
                <article className="xfer-item" key={h.id}>
                  <div>
                    <b>{h.referredUsername || '—'}</b>
                    <small>{whenLabel(h.createdAt)}</small>
                  </div>
                  <CoinValue value={h.commissionAmount || 0} />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
