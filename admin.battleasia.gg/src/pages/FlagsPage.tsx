import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, isApiError, unwrapData } from '../lib/api';
import { can } from '../lib/auth';
import { useI18n } from '../lib/i18n';

const P1_KEYS: Array<[string, string]> = [
  ['igVictoryAutoPost', 'Victory auto-post'],
  ['igHighlights', 'Match highlights + story poll/quiz'],
  ['igGameFeed', 'Per-game feed'],
  ['igMessageRequests', 'Message requests'],
  ['igPinnedPosts', 'Pinned posts'],
  ['squadChat', 'Squad chat extras'],
  ['kycBeforeWithdraw', 'KYC before withdraw'],
  ['cashbackDays', 'Cashback days'],
  ['playerTip', 'Player tips'],
];

const P2_KEYS: Array<[string, string]> = [
  ['igForYou', 'For You feed'],
  ['voiceNotes', 'DM voice notes'],
  ['watchParty', 'Watch party'],
  ['liveGifting', 'Live + gifting'],
  ['clans', 'Clans / wars'],
  ['fantasy', 'Fantasy'],
  ['oneVone', '1v1 duels'],
  ['customizationStore', 'Customization store'],
  ['ocrResults', 'OCR results'],
  ['creatorLeaderboard', 'Creator leaderboard'],
];

type Velocity = {
  enabled: boolean;
  windowMinutes: number;
  maxWithdrawals: number;
  maxTransfers: number;
  maxJoins: number;
};

const VELOCITY_OFF: Velocity = {
  enabled: false,
  windowMinutes: 15,
  maxWithdrawals: 5,
  maxTransfers: 8,
  maxJoins: 30,
};

export function FlagsPage() {
  const { t } = useI18n();
  const [p1, setP1] = useState<Record<string, boolean>>({});
  const [p2, setP2] = useState<Record<string, boolean>>({});
  const [velocity, setVelocity] = useState<Velocity>(VELOCITY_OFF);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([
      api('/api/v2/app-settings/p1'),
      api('/api/v2/app-settings/p2'),
      api('/api/v2/app-settings/velocity').catch(() => ({ data: VELOCITY_OFF })),
    ])
      .then(([a, b, c]) => {
        setP1({ ...unwrapData<Record<string, boolean>>(a) });
        setP2({ ...unwrapData<Record<string, boolean>>(b) });
        setVelocity({ ...VELOCITY_OFF, ...unwrapData<Partial<Velocity>>(c) });
      })
      .catch((err) => setError(isApiError(err) ? err.message : 'Could not load flags'));
  }, []);

  if (!can('engagement.edit')) return <Navigate to="/403" replace />;

  async function save(which: 'p1' | 'p2', next: Record<string, boolean>) {
    setBusy(true);
    try {
      await api(`/api/v2/app-settings/${which}`, { method: 'PUT', body: JSON.stringify(next) });
      setToast('Saved');
      window.setTimeout(() => setToast(''), 1600);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function saveVelocity(next: Velocity) {
    setBusy(true);
    try {
      const payload = await api('/api/v2/app-settings/velocity', { method: 'PUT', body: JSON.stringify(next) });
      setVelocity({ ...VELOCITY_OFF, ...unwrapData<Partial<Velocity>>(payload) });
      setToast('Saved');
      window.setTimeout(() => setToast(''), 1600);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-body">
      <header className="dash-head">
        <p className="dash-eyebrow">{t('nav.system')}</p>
        <h1>Feature flags</h1>
        <p className="admin-lead">P1 and P2 are on. Flip any off here. Velocity hold stays off. P2 is lobby, gifts, and labs — not a live camera.</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {toast ? <p className="play-muted">{toast}</p> : null}

      <section className="dash-stage">
        <h2>P1</h2>
        <ul className="flag-list">
          {P1_KEYS.map(([key, label]) => (
            <li key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(p1[key])}
                  disabled={busy}
                  onChange={(e) => {
                    const next = { ...p1, [key]: e.target.checked };
                    setP1(next);
                    void save('p1', next);
                  }}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-stage" style={{ marginTop: 16 }}>
        <h2>Velocity hold</h2>
        <p className="admin-lead">Too-fast withdraw / transfer / join opens a fraud hold. Player sees Under review. Off until you enable it.</p>
        <form
          className="money-form"
          onSubmit={(e) => {
            e.preventDefault();
            void saveVelocity(velocity);
          }}
        >
          <label className="chip">
            <input
              type="checkbox"
              checked={velocity.enabled}
              disabled={busy}
              onChange={(e) => setVelocity((v) => ({ ...v, enabled: e.target.checked }))}
            />
            Enable velocity hold
          </label>
          <label className="field">
            Window (minutes)
            <input
              type="number"
              min={1}
              max={1440}
              value={velocity.windowMinutes}
              onChange={(e) => setVelocity((v) => ({ ...v, windowMinutes: Number(e.target.value) }))}
            />
          </label>
          <label className="field">
            Max withdrawals
            <input
              type="number"
              min={1}
              max={100}
              value={velocity.maxWithdrawals}
              onChange={(e) => setVelocity((v) => ({ ...v, maxWithdrawals: Number(e.target.value) }))}
            />
          </label>
          <label className="field">
            Max transfers / tips
            <input
              type="number"
              min={1}
              max={100}
              value={velocity.maxTransfers}
              onChange={(e) => setVelocity((v) => ({ ...v, maxTransfers: Number(e.target.value) }))}
            />
          </label>
          <label className="field">
            Max joins
            <input
              type="number"
              min={1}
              max={200}
              value={velocity.maxJoins}
              onChange={(e) => setVelocity((v) => ({ ...v, maxJoins: Number(e.target.value) }))}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Save velocity
          </button>
        </form>
      </section>

      <section className="dash-stage" style={{ marginTop: 16 }}>
        <h2>P2</h2>
        <ul className="flag-list">
          {P2_KEYS.map(([key, label]) => (
            <li key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(p2[key])}
                  disabled={busy}
                  onChange={(e) => {
                    const next = { ...p2, [key]: e.target.checked };
                    setP2(next);
                    void save('p2', next);
                  }}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
