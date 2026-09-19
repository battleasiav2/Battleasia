import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { api, isApiError, unwrapList } from '../lib/api';
import { can } from '../lib/auth';
import { LISTS } from '../lib/catalog';
import { cell, downloadCsv, downloadExcel, pick, rangeFor, rowId, toCsv } from '../lib/format';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string) => void };

const RANGES = [
  ['all', 'list.range.all'],
  ['today', 'list.range.today'],
  ['yesterday', 'list.range.yesterday'],
  ['7d', 'list.range.week'],
  ['month', 'list.range.month'],
  ['custom', 'list.range.custom'],
] as const;

function prettyCol(col: string) {
  return col
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bpubg\b/gi, 'PUBG')
    .replace(/\bid\b/gi, 'ID')
    .replace(/^./, (c) => c.toUpperCase());
}

export function ListPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
  const location = useLocation();
  const spec = LISTS[location.pathname];
  const [rows, setRows] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState('all');
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!spec) return;
    const timer = window.setTimeout(() => {
      const range = rangeFor(chip, { from, to });
      const params = new URLSearchParams({ limit: '50' });
      if (search.trim().length >= 2) params.set('search', search.trim());
      if (range.startDate) params.set('startDate', range.startDate);
      if (range.endDate) params.set('endDate', range.endDate);
      const path = spec.api.includes('?') ? `${spec.api}&${params}` : `${spec.api}?${params}`;
      api(path)
        .then((payload) => setRows(unwrapList<Record<string, unknown>>(payload)))
        .catch((err) => {
          setRows([]);
          setError(isApiError(err) ? err.message : t('list.loadFail'));
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [spec, search, chip, from, to, t]);

  const cols = useMemo(() => (spec?.columns || []).filter((c) => !hidden[c]), [spec, hidden]);

  async function runBulk(kind: 'disable' | 'enable' | 'hide' | 'publish') {
    if (!spec) return;
    if (!selected.length) {
      toast(t('list.needSelect'));
      return;
    }
    const needsReason = kind === 'disable' || kind === 'hide';
    if (needsReason && !reason.trim()) {
      toast(t('list.needReason'));
      return;
    }
    const confirmKey =
      kind === 'disable'
        ? 'list.confirmDisable'
        : kind === 'enable'
          ? 'list.confirmEnable'
          : kind === 'hide'
            ? 'list.confirmHide'
            : 'list.confirmPublish';
    if (!window.confirm(t(confirmKey))) return;
    try {
      if (kind === 'disable' || kind === 'enable') {
        await api('/api/v3/users/list/bulk/status', {
          method: 'PATCH',
          body: JSON.stringify({ ids: selected, status: kind === 'enable', reason: reason.trim() }),
        });
      } else {
        await api('/api/v3/feed/list/bulk', {
          method: 'PATCH',
          body: JSON.stringify({ ids: selected, status: kind === 'publish' ? 'published' : 'draft', reason: reason.trim() }),
        });
      }
      toast(t('list.bulkOk'));
      setSelected([]);
      setReason('');
      setSearch((s) => s);
      const range = rangeFor(chip, { from, to });
      const params = new URLSearchParams({ limit: '50' });
      if (search.trim().length >= 2) params.set('search', search.trim());
      if (range.startDate) params.set('startDate', range.startDate);
      if (range.endDate) params.set('endDate', range.endDate);
      const path = spec.api.includes('?') ? `${spec.api}&${params}` : `${spec.api}?${params}`;
      setRows(unwrapList<Record<string, unknown>>(await api(path)));
    } catch (err) {
      toast(isApiError(err) ? err.message : t('list.bulkFail'));
    }
  }

  if (!spec) {
    return (
      <main className="admin-body">
        <h1>{t('list.notFound')}</h1>
      </main>
    );
  }
  if (spec.perm && !can(spec.perm)) return <Navigate to="/403" replace />;

  return (
    <main className="admin-body">
      <header className="dash-head dash-head-row">
        <div>
          <p className="dash-eyebrow">{t('list.eyebrow')}</p>
          <h1>{t(spec.title)}</h1>
          <p className="admin-lead">{t('list.lead')}</p>
        </div>
        {rows ? (
          <p className="dash-count">
            <strong>{rows.length}</strong>
            <small>{t('list.rows')}</small>
          </p>
        ) : null}
      </header>
      {location.pathname === '/games/matches' ? (
        <p>
          <Link className="btn btn-primary" to="/games/matches/new">
            {t('list.newMatch')}
          </Link>
        </p>
      ) : null}
      {location.pathname === '/games/list' ? (
        <p>
          <Link className="btn btn-primary" to="/games/list/new">
            {t('list.newGame')}
          </Link>
        </p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage list-stage">
      <div className="table-tools">
        <input value={search} placeholder={t('list.search')} onChange={(e) => setSearch(e.target.value)} />
        {RANGES.map(([id, key]) => (
          <button key={id} type="button" className={`chip ${chip === id ? 'on' : ''}`} onClick={() => setChip(id)}>
            {t(key)}
          </button>
        ))}
        {chip === 'custom' ? (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label={t('list.from')} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label={t('list.to')} />
          </>
        ) : null}
        <button type="button" className="chip" onClick={() => setCompact((v) => !v)}>
          {compact ? t('list.comfort') : t('list.compact')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (rows) downloadCsv(`${t(spec.title)}.csv`, toCsv(rows, spec.columns));
          }}
        >
          {t('list.csv')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (rows) downloadExcel(`${t(spec.title)}.xls`, rows, spec.columns);
          }}
        >
          {t('list.excel')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          {t('list.print')}
        </button>
        <details className="col-pop">
          <summary className="chip">{t('list.columns')}</summary>
          <div className="col-pop-list">
            {spec.columns.map((col) => (
              <label key={col}>
                <input type="checkbox" checked={!hidden[col]} onChange={() => setHidden((h) => ({ ...h, [col]: !h[col] }))} />
                {prettyCol(col)}
              </label>
            ))}
          </div>
        </details>
      </div>
      {rows === null ? (
        <div className="stat-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="stat-card" key={i}><small>{t('list.loading')}</small><strong>…</strong></div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">
          <h2>{t('list.empty')}</h2>
          <p>{t('list.emptyLead')}</p>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setSearch('');
              setChip('all');
              setFrom('');
              setTo('');
            }}
          >
            {t('list.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className={`admin-table ${compact ? 'compact' : ''}`}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.length === rows.length}
                    onChange={(e) => setSelected(e.target.checked ? rows.map(rowId).filter(Boolean) : [])}
                    aria-label="Select all"
                  />
                </th>
                {cols.map((col) => (
                  <th key={col}>{prettyCol(col)}</th>
                ))}
                {location.pathname === '/games/matches' ? <th>{t('list.result')}</th> : null}
                {location.pathname === '/games/list' ? <th>{t('list.edit')}</th> : null}
                {location.pathname === '/customer-support/list' ? <th>{t('list.open')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = rowId(row);
                return (
                  <tr key={id || JSON.stringify(row).slice(0, 40)}>
                    <td>
                      <input type="checkbox" checked={selected.includes(id)} onChange={(e) => setSelected((cur) => (e.target.checked ? [...cur, id] : cur.filter((x) => x !== id)))} />
                    </td>
                    {cols.map((col) => (
                      <td key={col}>{cell(pick(row, col))}</td>
                    ))}
                    {location.pathname === '/games/matches' && id ? (
                      <td>
                        <Link to={`/games/matches/${id}/edit`}>{t('list.edit')}</Link>
                        {' · '}
                        <Link to={`/games/matches/${id}/result`}>{t('list.result')}</Link>
                      </td>
                    ) : null}
                    {location.pathname === '/games/list' && id ? (
                      <td>
                        <Link to={`/games/list/${id}/edit`}>{t('list.edit')}</Link>
                      </td>
                    ) : null}
                    {location.pathname === '/customer-support/list' && id ? (
                      <td>
                        <Link to={`/customer-support/${id}`}>{t('list.thread')}</Link>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
      {selected.length ? (
        <div className="bulk-bar">
          <span>{selected.length} {t('list.selected')}</span>
          <input value={reason} placeholder={t('list.rejectPh')} onChange={(e) => setReason(e.target.value)} />
          {location.pathname === '/users/list' ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => void runBulk('disable')}>
                {t('list.disable')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void runBulk('enable')}>
                {t('list.enable')}
              </button>
            </>
          ) : location.pathname === '/feed/list' ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => void runBulk('hide')}>
                {t('list.hide')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void runBulk('publish')}>
                {t('list.publish')}
              </button>
            </>
          ) : (
            <span className="admin-lead">{t('list.bulk')}</span>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => setSelected([])}>
            {t('list.clear')}
          </button>
        </div>
      ) : null}
    </main>
  );
}
