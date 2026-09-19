import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, isApiError, unwrapData, unwrapList } from '../lib/api';
import { INTEGRITY } from '../lib/catalog';
import { cell, downloadCsv, downloadExcel, pick, rowId, toCsv } from '../lib/format';
import { useI18n } from '../lib/i18n';

export function IntegrityPage() {
  const { t } = useI18n();
  const spec = INTEGRITY[useLocation().pathname];
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');
  const [reserve, setReserve] = useState('');
  const [highValue, setHighValue] = useState('1000');

  useEffect(() => {
    if (!spec) return;
    api(`${spec.api}?limit=50`)
      .then((payload) => {
        const list = unwrapList<Record<string, unknown>>(payload);
        setRows(list);
        const first = list[0];
        if (first && spec.api.includes('/ledger') && first.reserve != null) setReserve(String(first.reserve));
        if (spec.api.includes('/ledger')) {
          api('/api/v3/integrity/ops')
            .then((ops) => {
              const n = Number(unwrapData<{ highValueWithdrawBac?: number }>(ops)?.highValueWithdrawBac);
              if (Number.isFinite(n) && n > 0) setHighValue(String(n));
            })
            .catch(() => undefined);
        }
      })
      .catch((err) => {
        setRows([]);
        setError(isApiError(err) ? err.message : 'Integrity API not mounted yet');
      });
  }, [spec]);

  if (!spec) {
    return (
      <main className="admin-body">
        <h1>{t('integrity.notFound')}</h1>
      </main>
    );
  }

  const cols = rows[0] ? Object.keys(rows[0]).filter((k) => k !== '__v' && k !== 'password').slice(0, 8) : ['id', 'status'];

  return (
    <main className="admin-body">
      <h1>{t(spec.title)}</h1>
      {rows[0]?.alert ? <p className="form-error">{t('integrity.liability')}</p> : null}
      <p className="admin-lead">{t('integrity.lead')}</p>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="table-tools">
        <button type="button" className="btn btn-ghost" onClick={() => downloadCsv(`${t(spec.title)}.csv`, toCsv(rows, cols))}>
          CSV
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => downloadExcel(`${t(spec.title)}.xls`, rows, cols)}>
          Excel
        </button>
        {spec.api.includes('/ledger') ? (
          <>
            <input value={reserve} onChange={(e) => setReserve(e.target.value)} placeholder="Reserve BAC" />
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await api('/api/v3/integrity/reserve', { method: 'PUT', body: JSON.stringify({ reserveBac: Number(reserve) }) });
                  const payload = await api(`${spec.api}?limit=50`);
                  setRows(unwrapList<Record<string, unknown>>(payload));
                } catch (err) {
                  setError(isApiError(err) ? err.message : 'Could not set reserve');
                }
              }}
            >
              {t('integrity.setReserve')}
            </button>
            <input value={highValue} onChange={(e) => setHighValue(e.target.value)} placeholder="High-value BAC" />
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await api('/api/v3/integrity/high-value', {
                    method: 'PUT',
                    body: JSON.stringify({ highValueWithdrawBac: Number(highValue) }),
                  });
                } catch (err) {
                  setError(isApiError(err) ? err.message : 'Could not set high-value threshold');
                }
              }}
            >
              Set high-value
            </button>
          </>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <div className="admin-empty">
          <h2>{t('integrity.empty')}</h2>
          <p>{t('integrity.emptyLead')}</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                {spec.api.includes('/kyc') ? <th>{t('integrity.action')}</th> : null}
                {spec.api.includes('/fraud-holds') ? <th>{t('integrity.action')}</th> : null}
                {spec.api.includes('/match-reports') ? <th>{t('integrity.action')}</th> : null}
                {spec.api.includes('/disputes') ? <th>{t('integrity.action')}</th> : null}
                {spec.api.includes('/ocr') ? <th>{t('integrity.action')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowId(row) || JSON.stringify(row).slice(0, 24)}>
                  {cols.map((c) => (
                    <td key={c}>{cell(pick(row, c))}</td>
                  ))}
                  {spec.api.includes('/kyc') ? (
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/kyc/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'approved' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'approved' } : r)));
                          } catch {
                            setError(t('integrity.approveFail'));
                          }
                        }}
                      >
                        {t('integrity.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/kyc/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'rejected' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'rejected' } : r)));
                          } catch {
                            setError(t('integrity.rejectFail'));
                          }
                        }}
                      >
                        {t('integrity.reject')}
                      </button>
                    </td>
                  ) : null}
                  {spec.api.includes('/fraud-holds') ? (
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/fraud-holds/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'released' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'released' } : r)));
                          } catch {
                            setError(t('integrity.releaseFail'));
                          }
                        }}
                      >
                        {t('integrity.release')}
                      </button>
                    </td>
                  ) : null}
                  {spec.api.includes('/match-reports') ? (
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/match-reports/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'reviewed' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'reviewed' } : r)));
                          } catch {
                            setError(t('integrity.approveFail'));
                          }
                        }}
                      >
                        {t('integrity.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/match-reports/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'dismissed' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'dismissed' } : r)));
                          } catch {
                            setError(t('integrity.rejectFail'));
                          }
                        }}
                      >
                        {t('integrity.reject')}
                      </button>
                    </td>
                  ) : null}
                  {spec.api.includes('/disputes') ? (
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/disputes/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'resolved' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'resolved' } : r)));
                          } catch {
                            setError(t('integrity.releaseFail'));
                          }
                        }}
                      >
                        {t('integrity.release')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/disputes/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'rejected' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'rejected' } : r)));
                          } catch {
                            setError(t('integrity.rejectFail'));
                          }
                        }}
                      >
                        {t('integrity.reject')}
                      </button>
                    </td>
                  ) : null}
                  {spec.api.includes('/ocr') ? (
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/ocr/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'accepted' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'accepted' } : r)));
                          } catch {
                            setError(t('integrity.approveFail'));
                          }
                        }}
                      >
                        {t('integrity.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={async () => {
                          try {
                            await api(`/api/v3/integrity/ocr/${rowId(row)}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'rejected' }),
                            });
                            setRows((prev) => prev.map((r) => (rowId(r) === rowId(row) ? { ...r, status: 'rejected' } : r)));
                          } catch {
                            setError(t('integrity.rejectFail'));
                          }
                        }}
                      >
                        {t('integrity.reject')}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
