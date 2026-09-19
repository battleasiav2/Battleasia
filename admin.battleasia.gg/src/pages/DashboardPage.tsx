import { useEffect, useState } from 'react';
import { CoinValue } from '../components/CoinValue';
import { api, isApiError, unwrapData } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Dash = {
  totalUsers?: number;
  totalMatches?: number;
  receivedPayment?: { total?: number };
  withdraw?: { total?: number };
  tournamentProfit?: { total?: number };
};

type Ops = {
  health?: 'ok' | 'degraded' | 'down';
  replica?: boolean;
  fcmConfigured?: boolean;
  sentryConfigured?: boolean;
  backupEncryptConfigured?: boolean;
  backupOffsiteConfigured?: boolean;
  lastBackup?: { at?: string; file?: string; encrypted?: boolean; uploaded?: boolean } | null;
  highValueWithdrawBac?: number;
};

function tone(on: boolean | undefined) {
  return on ? 'ok' : 'off';
}

export function DashboardPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Dash | null>(null);
  const [ops, setOps] = useState<Ops | null>(null);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState('');

  useEffect(() => {
    api('/api/v3/dashboard')
      .then((payload) => setData(unwrapData<Dash>(payload)))
      .catch((err) => setError(isApiError(err) ? err.message : t('dash.offline')));
    api('/api/v3/integrity/ops')
      .then((payload) => setOps(unwrapData<Ops>(payload)))
      .catch(() => setOps(null));
    api('/api/v3/integrity/ledger')
      .then((payload) => {
        const row = unwrapData<{ results?: Array<{ alert?: boolean; amount?: number; reserve?: number }> }>(payload);
        const hit = row?.results?.find((r) => r.alert);
        if (hit) setAlert(t('dash.ledgerAlert'));
      })
      .catch(() => undefined);
  }, []);

  const apiOk = ops?.health === 'ok';

  return (
    <main className="admin-body">
      <header className="dash-head dash-head-row">
        <div>
          <p className="dash-eyebrow">{t('dash.eyebrow')}</p>
          <h1>{t('dash.title')}</h1>
          <p className="admin-lead">{t('dash.lead')}</p>
        </div>
        <p className="dash-count">
          <strong>{data?.totalUsers ?? '—'}</strong>
          <small>{t('dash.users')}</small>
        </p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {alert ? <p className="form-error">{alert}</p> : null}

      <div className="dash-stage">
      <section className="ops-rail" aria-label={t('dash.eyebrow')}>
        <article className={`ops-item ${tone(apiOk)}`}>
          <span className={`ops-dot ${tone(apiOk)}`} />
          <div>
            <small>{t('dash.api')}</small>
            <b>{apiOk ? t('dash.healthy') : t('dash.down')}</b>
          </div>
        </article>
        <article className={`ops-item ${tone(ops?.replica)}`}>
          <span className={`ops-dot ${tone(ops?.replica)}`} />
          <div>
            <small>{t('dash.mongo')}</small>
            <b>{ops?.replica ? t('dash.replica') : t('dash.standalone')}</b>
          </div>
        </article>
        <article className={`ops-item ${tone(ops?.fcmConfigured)}`}>
          <span className={`ops-dot ${tone(ops?.fcmConfigured)}`} />
          <div>
            <small>{t('dash.fcm')}</small>
            <b>{ops?.fcmConfigured ? t('dash.on') : t('dash.off')}</b>
          </div>
        </article>
        <article className={`ops-item ${tone(ops?.sentryConfigured)}`}>
          <span className={`ops-dot ${tone(ops?.sentryConfigured)}`} />
          <div>
            <small>{t('dash.sentry')}</small>
            <b>{ops?.sentryConfigured ? t('dash.on') : t('dash.off')}</b>
          </div>
        </article>
        <article className={`ops-item ${tone(ops?.backupEncryptConfigured)}`}>
          <span className={`ops-dot ${tone(ops?.backupEncryptConfigured)}`} />
          <div>
            <small>{t('dash.backup')}</small>
            <b>{ops?.backupEncryptConfigured ? t('dash.on') : t('dash.off')}</b>
          </div>
        </article>
        <article className={`ops-item ${tone(ops?.backupOffsiteConfigured)}`}>
          <span className={`ops-dot ${tone(ops?.backupOffsiteConfigured)}`} />
          <div>
            <small>{t('dash.offsite')}</small>
            <b>{ops?.backupOffsiteConfigured ? t('dash.on') : t('dash.off')}</b>
          </div>
        </article>
        <article className={`ops-item ${tone(Boolean(ops?.lastBackup?.at))}`}>
          <span className={`ops-dot ${tone(Boolean(ops?.lastBackup?.at))}`} />
          <div>
            <small>{t('dash.dump')}</small>
            <b>{ops?.lastBackup?.at ? new Date(ops.lastBackup.at).toLocaleString() : t('dash.none')}</b>
          </div>
        </article>
        <article className="ops-item ok">
          <span className="ops-dot ok" />
          <div>
            <small>{t('dash.highValue')}</small>
            <b>≥ {ops?.highValueWithdrawBac ?? 1000} BAC</b>
          </div>
        </article>
      </section>

      <section className="stat-grid">
        <article className="stat-card featured">
          <span className="stat-mark profit" aria-hidden />
          <small>{t('dash.profit')}</small>
          <strong>
            <CoinValue value={data?.tournamentProfit?.total ?? 0} size={28} />
          </strong>
        </article>
        <article className="stat-card">
          <span className="stat-mark users" aria-hidden />
          <small>{t('dash.users')}</small>
          <strong>{data?.totalUsers ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-mark matches" aria-hidden />
          <small>{t('dash.matches')}</small>
          <strong>{data?.totalMatches ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-mark in" aria-hidden />
          <small>{t('dash.received')}</small>
          <strong>
            <CoinValue value={data?.receivedPayment?.total ?? 0} size={22} />
          </strong>
        </article>
        <article className="stat-card">
          <span className="stat-mark out" aria-hidden />
          <small>{t('dash.withdrawn')}</small>
          <strong>
            <CoinValue value={data?.withdraw?.total ?? 0} size={22} />
          </strong>
        </article>
      </section>
      </div>
    </main>
  );
}
