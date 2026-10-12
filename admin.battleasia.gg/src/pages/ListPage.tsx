import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { api, unwrapPage, explainError } from '../lib/api';
import { can } from '../lib/auth';
import { LISTS } from '../lib/catalog';
import { cell, downloadCsv, downloadExcel, pick, rangeFor, rowId, shortUserAgent, toCsv } from '../lib/format';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

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

function linkedUserId(pathname: string, row: Record<string, unknown>) {
  if (pathname === '/users/list') return rowId(row);
  const direct = String(row.userId || '');
  if (direct) return direct;
  const referrer = row.referrer;
  if (referrer && typeof referrer === 'object' && '_id' in referrer) {
    return String((referrer as { _id?: string })._id || '');
  }
  return '';
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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const pageSize = 50;

  async function loadRows(nextPage = page) {
    if (!spec) return;
    const range = rangeFor(chip, { from, to });
    const params = new URLSearchParams({ limit: String(pageSize), page: String(nextPage) });
    if (search.trim().length >= 2) params.set('search', search.trim());
    if (range.startDate) params.set('startDate', range.startDate);
    if (range.endDate) params.set('endDate', range.endDate);
    const path = spec.api.includes('?') ? `${spec.api}&${params}` : `${spec.api}?${params}`;
    const pageData = unwrapPage<Record<string, unknown>>(await api(path));
    setError('');
    setRows(pageData.rows);
    setTotal(pageData.total);
  }

  useEffect(() => {
    if (!spec) return;
    const timer = window.setTimeout(() => {
      void loadRows().catch((err) => {
        setRows([]);
        setTotal(0);
        const msg = explainError(err, t('list.loadFail'));
        setError(msg);
        toast(msg, 'err');
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [spec, search, chip, from, to, page, t]);

  const cols = useMemo(() => (spec?.columns || []).filter((c) => !hidden[c]), [spec, hidden]);

  async function saveCategory() {
    const name = catName.trim();
    const slug = catSlug.trim().toLowerCase();
    if (!name || !slug) {
      toast(t('feed.needCategory'), 'err');
      return;
    }
    try {
      await api('/api/v3/feed/categories', { method: 'POST', body: JSON.stringify({ name, slug }) });
      toast(t('feed.categorySaved'), 'ok');
      setCatName('');
      setCatSlug('');
      await loadRows();
    } catch (err) {
      toast(explainError(err, t('feed.categoryFail')), 'err');
    }
  }

  async function setReportStatus(reportId: string, status: 'reviewed' | 'dismissed') {
    try {
      await api(`/api/v2/social/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast(t('feed.reportUpdated'), 'ok');
      await loadRows();
    } catch (err) {
      toast(explainError(err, t('feed.reportFail')), 'err');
    }
  }

  async function deleteReel(reelId: string) {
    if (!window.confirm(t('feed.confirmDeleteReel'))) return;
    try {
      await api(`/api/v2/social/reels/${reelId}`, { method: 'DELETE' });
      toast(t('feed.reelDeleted'), 'ok');
      await loadRows();
    } catch (err) {
      toast(explainError(err, t('feed.reelFail')), 'err');
    }
  }

  async function revokeSession(sessionId: string) {
    if (!window.confirm(t('sessions.confirmOne'))) return;
    try {
      await api(`/api/v3/users/sessions/${sessionId}`, { method: 'DELETE' });
      toast(t('sessions.revoked'), 'ok');
      await loadRows();
    } catch (err) {
      toast(explainError(err, t('sessions.fail')), 'err');
    }
  }

  async function revokeUser(userId: string) {
    if (!window.confirm(t('sessions.confirmUser'))) return;
    try {
      await api(`/api/v3/users/sessions/user/${userId}`, { method: 'DELETE' });
      toast(t('sessions.revoked'), 'ok');
      await loadRows();
    } catch (err) {
      toast(explainError(err, t('sessions.fail')), 'err');
    }
  }

  async function runBulk(kind: 'disable' | 'enable' | 'hide' | 'publish') {
    if (!spec) return;
    if (!selected.length) {
      toast(t('list.needSelect'), 'err');
      return;
    }
    const needsReason = kind === 'disable' || kind === 'hide';
    if (needsReason && !reason.trim()) {
      toast(t('list.needReason'), 'err');
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
      toast(t('list.bulkOk'), 'ok');
      setSelected([]);
      setReason('');
      setSearch((s) => s);
      const range = rangeFor(chip, { from, to });
      const params = new URLSearchParams({ limit: String(pageSize), page: String(page) });
      if (search.trim().length >= 2) params.set('search', search.trim());
      if (range.startDate) params.set('startDate', range.startDate);
      if (range.endDate) params.set('endDate', range.endDate);
      const path = spec.api.includes('?') ? `${spec.api}&${params}` : `${spec.api}?${params}`;
      const pageData = unwrapPage<Record<string, unknown>>(await api(path));
      setRows(pageData.rows);
      setTotal(pageData.total);
    } catch (err) {
      toast(explainError(err, t('list.bulkFail')), 'err');
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
            <strong>{total || rows.length}</strong>
            <small>{t('list.rows')}</small>
          </p>
        ) : null}
      </header>
      {location.pathname === '/games/matches' && can('matches.create') ? (
        <p>
          <Link className="btn btn-primary" to="/games/matches/new">
            {t('list.newMatch')}
          </Link>
        </p>
      ) : null}
      {location.pathname === '/games/list' && can('matches.create') ? (
        <p>
          <Link className="btn btn-primary" to="/games/list/new">
            {t('list.newGame')}
          </Link>
        </p>
      ) : null}
      {location.pathname === '/feed/categories' && can('feed.edit') ? (
        <form
          className="table-tools"
          onSubmit={(e) => {
            e.preventDefault();
            void saveCategory();
          }}
        >
          <input value={catName} placeholder={t('feed.categoryName')} onChange={(e) => setCatName(e.target.value)} />
          <input value={catSlug} placeholder={t('feed.categorySlug')} onChange={(e) => setCatSlug(e.target.value)} />
          <button className="btn btn-primary" type="submit">
            {t('feed.addCategory')}
          </button>
        </form>
      ) : null}
      {location.pathname === '/users/role' && can('users.edit') ? (
        <p>
          <Link className="btn btn-primary" to="/users/role/new">
            {t('roles.new')}
          </Link>
        </p>
      ) : null}
      {typeof (location.state as { flash?: unknown } | null)?.flash === 'string' ? (
        <p className="form-ok">{(location.state as { flash: string }).flash}</p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="dash-stage list-stage">
      <div className="table-tools">
        <input value={search} placeholder={t('list.search')} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {RANGES.map(([id, key]) => (
          <button key={id} type="button" className={`chip ${chip === id ? 'on' : ''}`} onClick={() => { setChip(id); setPage(1); }}>
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
              setPage(1);
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
                {location.pathname === '/games/participants-history' ? <th>{t('list.result')}</th> : null}
                {location.pathname === '/feed/social-reports' || location.pathname === '/feed/reels-moderation' ? <th>{t('sessions.actions')}</th> : null}
                {location.pathname === '/users/list' || location.pathname === '/users/role' ? <th>{t('list.edit')}</th> : null}
                {location.pathname === '/users/online' ? <th>{t('sessions.actions')}</th> : null}
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
                    {cols.map((col) => {
                      const uid = linkedUserId(location.pathname, row);
                      if (col === 'username' && uid && location.pathname !== '/users/role') {
                        return (
                          <td key={col}>
                            <Link to={`/users/list/${uid}/edit`}>{cell(pick(row, col))}</Link>
                          </td>
                        );
                      }
                      if (col === 'name' && location.pathname === '/games/list' && id) {
                        return (
                          <td key={col}>
                            {can('matches.edit') ? (
                              <Link to={`/games/list/${id}/edit`}>{cell(pick(row, col))}</Link>
                            ) : (
                              cell(pick(row, col))
                            )}
                          </td>
                        );
                      }
                      if (col === 'matchName') {
                        const matchId = location.pathname === '/games/matches' ? id : String(row.matchId || '');
                        if (matchId) {
                          return (
                            <td key={col}>
                              {can('matches.edit') ? (
                                <Link to={`/games/matches/${matchId}/edit`}>{cell(pick(row, col)) || '—'}</Link>
                              ) : (
                                cell(pick(row, col)) || '—'
                              )}
                            </td>
                          );
                        }
                      }
                      if (col === 'useragent') {
                        return <td key={col} title={String(pick(row, col) || '')}>{shortUserAgent(pick(row, col))}</td>;
                      }
                      return <td key={col}>{cell(pick(row, col))}</td>;
                    })}
                    {location.pathname === '/games/matches' && id ? (
                      <td>
                        {can('matches.edit') ? <Link to={`/games/matches/${id}/edit`}>{t('list.edit')}</Link> : null}
                        {can('matches.edit') && can('matches.result') ? ' · ' : null}
                        {can('matches.result') ? <Link to={`/games/matches/${id}/result`}>{t('list.result')}</Link> : null}
                      </td>
                    ) : null}
                    {location.pathname === '/games/list' && id ? (
                      <td>
                        {can('matches.edit') ? <Link to={`/games/list/${id}/edit`}>{t('list.edit')}</Link> : null}
                      </td>
                    ) : null}
                    {location.pathname === '/games/participants-history' && row.matchId && can('matches.result') ? (
                      <td>
                        <Link to={`/games/matches/${String(row.matchId)}/result`}>{t('list.result')}</Link>
                      </td>
                    ) : null}
                    {location.pathname === '/users/list' && id ? (
                      <td>
                        <Link to={`/users/list/${id}/edit`}>{t('list.edit')}</Link>
                      </td>
                    ) : null}
                    {location.pathname === '/users/role' && id ? (
                      <td>
                        <Link to={`/users/role/${id}/edit`}>{t('list.edit')}</Link>
                      </td>
                    ) : null}
                    {location.pathname === '/users/online' && id ? (
                      <td className="row-actions">
                        {can('users.edit') ? (
                          <>
                            <button type="button" className="btn btn-ghost" onClick={() => void revokeSession(id)}>
                              {t('sessions.revoke')}
                            </button>
                            {linkedUserId(location.pathname, row) ? (
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => void revokeUser(linkedUserId(location.pathname, row))}
                              >
                                {t('sessions.revokeUser')}
                              </button>
                            ) : null}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    ) : null}
                    {location.pathname === '/feed/social-reports' && id && can('feed.edit') ? (
                      <td className="row-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => void setReportStatus(id, 'reviewed')}>
                          {t('feed.review')}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => void setReportStatus(id, 'dismissed')}>
                          {t('feed.dismiss')}
                        </button>
                      </td>
                    ) : null}
                    {location.pathname === '/feed/reels-moderation' && id && can('feed.edit') ? (
                      <td>
                        <button type="button" className="btn btn-ghost" onClick={() => void deleteReel(id)}>
                          {t('feed.deleteReel')}
                        </button>
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
      {rows && total > pageSize ? (
        <div className="list-pager">
          <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            {t('list.prev')}
          </button>
          <span>
            {t('list.page')} {page} / {Math.max(1, Math.ceil(total / pageSize))}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('list.next')}
          </button>
        </div>
      ) : null}
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
