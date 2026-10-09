import { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { api, explainError, unwrapData, unwrapList } from '../lib/api';
import { INTEGRITY } from '../lib/catalog';
import { cell, downloadCsv, downloadExcel, pick, rowId, toCsv } from '../lib/format';
import { useI18n } from '../lib/i18n';

type Ctx = { toast: (m: string, kind?: 'ok' | 'err') => void };

export function IntegrityPage() {
  const { t } = useI18n();
  const { toast } = useOutletContext<Ctx>();
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
        setError(explainError(err, 'Integrity API not mounted yet'));
      });
  }, [spec]);

  async function act(url: string, status: string, id: string, okText: string, failText: string) {
    try {
      await api(url, { method: 'PATCH', body: JSON.stringify({ status }) });
      setError('');
      setRows((prev) => prev.map((r) => (rowId(r) === id ? { ...r, status } : r)));
      toast(okText, 'ok');
    } catch (err) {
      const msg = explainError(err, failText);
      setError(msg);
      toast(msg, 'err');
    }
  }

  function fail(msg: string) {
    setError(msg);
    toast(msg, 'err');
  }

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
                const n = Number(reserve);
                if (!Number.isFinite(n)) {
                  fail('Reserve must be a number');
                  return;
                }
                try {
                  await api('/api/v3/integrity/reserve', { method: 'PUT', body: JSON.stringify({ reserveBac: n }) });
                  const payload = await api(`${spec.api}?limit=50`);
                  setRows(unwrapList<Record<string, unknown>>(payload));
                  setError('');
                  toast('Reserve saved', 'ok');
                } catch (err) {
                  fail(explainError(err, 'Could not set reserve'));
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
                const n = Number(highValue);
                if (!Number.isFinite(n) || n <= 0) {
                  fail('High-value limit must be above 0');
                  return;
                }
                try {
                  await api('/api/v3/integrity/high-value', {
                    method: 'PUT',
                    body: JSON.stringify({ highValueWithdrawBac: n }),
                  });
                  setError('');
                  toast('High-value limit saved', 'ok');
                } catch (err) {
                  fail(explainError(err, 'Could not set high-value threshold'));
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
                        onClick={() =>
                          void act(`/api/v3/integrity/kyc/${rowId(row)}`, 'approved', rowId(row), 'KYC approved', t('integrity.approveFail'))
                        }
                      >
                        {t('integrity.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          void act(`/api/v3/integrity/kyc/${rowId(row)}`, 'rejected', rowId(row), 'KYC rejected', t('integrity.rejectFail'))
                        }
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
                        onClick={() =>
                          void act(
                            `/api/v3/integrity/fraud-holds/${rowId(row)}`,
                            'released',
                            rowId(row),
                            'Hold released',
                            t('integrity.releaseFail'),
                          )
                        }
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
                        onClick={() =>
                          void act(
                            `/api/v3/integrity/match-reports/${rowId(row)}`,
                            'reviewed',
                            rowId(row),
                            'Report reviewed',
                            t('integrity.approveFail'),
                          )
                        }
                      >
                        {t('integrity.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          void act(
                            `/api/v3/integrity/match-reports/${rowId(row)}`,
                            'dismissed',
                            rowId(row),
                            'Report dismissed',
                            t('integrity.rejectFail'),
                          )
                        }
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
                        onClick={() =>
                          void act(
                            `/api/v3/integrity/disputes/${rowId(row)}`,
                            'resolved',
                            rowId(row),
                            'Dispute resolved',
                            t('integrity.releaseFail'),
                          )
                        }
                      >
                        {t('integrity.release')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          void act(
                            `/api/v3/integrity/disputes/${rowId(row)}`,
                            'rejected',
                            rowId(row),
                            'Dispute rejected',
                            t('integrity.rejectFail'),
                          )
                        }
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
                        onClick={() =>
                          void act(`/api/v3/integrity/ocr/${rowId(row)}`, 'accepted', rowId(row), 'OCR accepted', t('integrity.approveFail'))
                        }
                      >
                        {t('integrity.approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          void act(`/api/v3/integrity/ocr/${rowId(row)}`, 'rejected', rowId(row), 'OCR rejected', t('integrity.rejectFail'))
                        }
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
