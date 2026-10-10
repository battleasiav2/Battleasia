import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PayPicks } from '../../components/PayBrand';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { ASSETS } from '../../lib/assets';
import { readSessionUser } from '../../lib/auth';
import { formatWhen, isCredit, rowCategory, rowLabel, type HistFilter } from '../../lib/history';
import { useI18n } from '../../lib/i18n';
import {
  cancelWithdraw,
  fetchBalanceHistory,
  fetchCoinRates,
  fetchWithdrawable,
  fiatFor,
  submitWithdraw,
  type CoinRate,
  type HistoryRow,
  type WithdrawableInfo,
} from '../../lib/wallet';

type ShellCtx = { setBalance: (n: number) => void };

const FIATS = [
  { code: 'USD', flag: 'us' },
  { code: 'BDT', flag: 'bd' },
  { code: 'INR', flag: 'in' },
  { code: 'PKR', flag: 'pk' },
] as const;

const PAGE_SIZES = [10, 25, 50];

function money(n: number | null) {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function bacText(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tableWhen(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return formatWhen(value);
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function typeView(cat: HistFilter) {
  if (cat === 'game') return { key: 'wallet.typeBet', cls: 'bet' };
  if (cat === 'withdraw') return { key: 'wallet.typeWithdraw', cls: 'wd' };
  if (cat === 'transfer') return { key: 'wallet.typeTransfer', cls: 'xfer' };
  return { key: 'wallet.typeEarn', cls: 'earn' };
}

function Flag({ code }: { code: string }) {
  if (code === 'us') {
    return (
      <svg className="wal-flag" viewBox="0 0 19 10" aria-hidden>
        <rect width="19" height="10" fill="#bf0a30" />
        <rect y="1.54" width="19" height="1.54" fill="#fff" />
        <rect y="4.62" width="19" height="1.54" fill="#fff" />
        <rect y="7.69" width="19" height="1.54" fill="#fff" />
        <rect width="7.6" height="5.4" fill="#002868" />
      </svg>
    );
  }
  const src =
    code === 'bd'
      ? '/assets/flags/bd.webp'
      : code === 'in'
        ? '/assets/flags/in.gif'
        : '/assets/flags/pk.gif';
  return <img className="wal-flag" src={src} width={18} height={12} alt="" />;
}

export function WalletPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const { setBalance } = useOutletContext<ShellCtx>();
  const [params, setParams] = useSearchParams();
  const sessionBal = Number(readSessionUser()?.balance) || 0;
  const [info, setInfo] = useState<WithdrawableInfo | null>(null);
  const [rates, setRates] = useState<CoinRate[]>([]);
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('bkash');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [requestOpen, setRequestOpen] = useState(() => params.get('withdraw') === '1');
  const [idem, setIdem] = useState(() => crypto.randomUUID());
  const [cancelBusy, setCancelBusy] = useState(false);
  const [doneAmt, setDoneAmt] = useState(0);
  const [fieldErr, setFieldErr] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilt, setTypeFilt] = useState<HistFilter | 'all'>('all');
  const [dense, setDense] = useState(false);
  const [menu, setMenu] = useState<'columns' | 'filters' | null>(null);
  const [showStatus, setShowStatus] = useState(true);
  const [showDesc, setShowDesc] = useState(true);
  const [showAfter, setShowAfter] = useState(true);
  const [newestFirst, setNewestFirst] = useState(true);

  const balance = info?.balance ?? sessionBal;

  useEffect(() => {
    return register({
      quickJoin: () => toast(t('wallet.openPlay')),
      copyRoom: () => toast(t('play.roomSoon')),
      ready: () => toast(t('play.joinLobby')),
      leave: () => toast(t('play.notInMatch')),
      matchDetails: () => toast(t('play.openMatch')),
      openChat: () => toast(t('play.joinChat')),
      share: async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('play.copied'));
      },
      leaderboard: () => toast(t('play.results')),
    });
  }, [register, t, toast]);

  useEffect(() => {
    let live = true;
    Promise.all([fetchWithdrawable(), fetchCoinRates(), fetchBalanceHistory()])
      .then(([w, r, h]) => {
        if (!live) return;
        setInfo(w);
        setRates(r);
        setRows(h);
        if (w?.balance != null) setBalance(w.balance);
      })
      .catch((err) => {
        if (!live) return;
        setError(isApiError(err) ? err.message : t('errors.walletOffline'));
        setRows([]);
      });
    return () => {
      live = false;
    };
  }, [setBalance, t]);

  useEffect(() => {
    function onBal(e: Event) {
      const next = Number((e as CustomEvent<number>).detail);
      if (!Number.isFinite(next)) return;
      setInfo((prev) => (prev ? { ...prev, balance: next } : prev));
      setBalance(next);
    }
    window.addEventListener('ba-balance', onBal);
    return () => window.removeEventListener('ba-balance', onBal);
  }, [setBalance]);

  useEffect(() => {
    if (params.get('withdraw') === '1') setRequestOpen(true);
  }, [params]);

  useEffect(() => {
    if (!requestOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) closeRequest();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const withdrawable = info?.withdrawableAmount ?? 0;
  const pendingId = info?.pendingWithdrawalId || '';
  const pendingAmt = info?.pendingWithdrawalAmount ?? 0;
  const maxAmt = Number(amount) || 0;

  const filtered = useMemo(() => {
    const list = rows || [];
    const needle = q.trim().toLowerCase();
    const next = list.filter((row) => {
      const cat = rowCategory(row);
      if (typeFilt === 'deposit') {
        if (cat !== 'deposit' && cat !== 'claim') return false;
      } else if (typeFilt !== 'all' && cat !== typeFilt) return false;
      if (!needle) return true;
      const blob = `${typeView(cat).key} ${rowLabel(row)} ${row.amount} ${row.balanceAfter ?? ''}`.toLowerCase();
      return blob.includes(needle) || t(typeView(cat).key).toLowerCase().includes(needle);
    });
    next.sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return newestFirst ? tb - ta : ta - tb;
    });
    return next;
  }, [rows, q, typeFilt, newestFirst, t]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const from = filtered.length === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(filtered.length, (safePage + 1) * pageSize);

  function closeRequest() {
    setRequestOpen(false);
    setConfirm(false);
    setFieldErr('');
    if (params.get('withdraw')) {
      const next = new URLSearchParams(params);
      next.delete('withdraw');
      setParams(next, { replace: true });
    }
  }

  function openRequest() {
    setRequestOpen(true);
    setConfirm(false);
    setFieldErr('');
  }

  async function doWithdraw() {
    if (busy) return;
    setBusy(true);
    try {
      await submitWithdraw(
        {
          coin_amount: maxAmt,
          wallet_address: address.trim(),
          wallet_type: walletType,
          currency_type: walletType === 'crypto' ? 'USDT' : 'BDT',
        },
        idem
      );
      toast(t('wallet.submitted'));
      setDoneAmt(maxAmt);
      setAmount('');
      setAddress('');
      setFieldErr('');
      setIdem(crypto.randomUUID());
      closeRequest();
      const next = await fetchWithdrawable();
      setInfo(next);
      setRows(await fetchBalanceHistory());
      if (next?.balance != null) setBalance(next.balance);
    } catch (err) {
      toast(isApiError(err) ? err.message : t('wallet.submitFail'));
    } finally {
      setBusy(false);
    }
  }

  async function doCancelPending() {
    if (!pendingId || cancelBusy) return;
    setCancelBusy(true);
    try {
      const result = await cancelWithdraw(pendingId);
      toast(t('wallet.cancelWithdrawOk'));
      const next = await fetchWithdrawable();
      setInfo(next);
      setRows(await fetchBalanceHistory());
      if (typeof result?.balance === 'number') setBalance(result.balance);
      else if (next?.balance != null) setBalance(next.balance);
    } catch (err) {
      toast(isApiError(err) ? err.message : t('wallet.cancelWithdrawFail'));
    } finally {
      setCancelBusy(false);
    }
  }

  function askWithdraw(e: FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setFieldErr(t('wallet.addressRequired'));
      return;
    }
    if (maxAmt <= 0) {
      setFieldErr(t('wallet.enterAmount'));
      return;
    }
    if (maxAmt > withdrawable) {
      setFieldErr(`${t('wallet.max')}: ${withdrawable} BAC`);
      return;
    }
    setFieldErr('');
    setConfirm(true);
  }

  function exportCsv() {
    const header = ['Type', 'Status', 'Description', 'Amount', 'Balance After', 'Date'];
    const lines = filtered.map((row) => {
      const cat = rowCategory(row);
      const credit = isCredit(row);
      const cells = [
        t(typeView(cat).key),
        t('wallet.completed'),
        rowLabel(row),
        `${credit ? '+' : '-'}${Math.abs(Number(row.amount) || 0)}`,
        String(row.balanceAfter ?? ''),
        tableWhen(row.createdAt),
      ];
      return cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const colCount = 3 + Number(showStatus) + Number(showDesc) + Number(showAfter);

  return (
    <main className="play-main wal-page">
      {error ? <p className="form-error">{error}</p> : null}
      {doneAmt ? (
        <div className="wal-done">
          <strong>{t('wallet.done')}</strong>
          <span>
            {bacText(doneAmt)} BAC · {t('wallet.submitted')}
          </span>
        </div>
      ) : null}

      <section className="wal-cards">
        <article className="wal-card">
          <h2>{t('wallet.total')}</h2>
          <p className="wal-gold">
            <img src={ASSETS.coin} width={28} height={28} alt="" />
            <span>{bacText(balance)} BAC</span>
          </p>
          <ul className="wal-fiats">
            {FIATS.map((fiat) => (
              <li key={fiat.code}>
                <span>
                  <Flag code={fiat.flag} />
                  {fiat.code}
                </span>
                <b>{money(fiatFor(balance, rates, fiat.code))}</b>
              </li>
            ))}
          </ul>
        </article>

        <article className="wal-card">
          <h2>{t('wallet.withdrawable')}</h2>
          <p className="wal-gold">
            <img src={ASSETS.coin} width={28} height={28} alt="" />
            <span>{bacText(withdrawable)} BAC</span>
          </p>
          <p className="wal-formula">{t('wallet.formula')}</p>
          {info?.hasPendingWithdrawal ? (
            <div className="wal-pending-block">
              <p className="wal-pending">
                {t('wallet.pending')}
                {pendingAmt > 0 ? ` · ${bacText(pendingAmt)} BAC` : ''}
              </p>
              <p className="wal-pending-hint">{t('wallet.cancelWithdrawLead')}</p>
              <button
                className="wal-cancel-wd"
                type="button"
                disabled={cancelBusy || !pendingId || !navigator.onLine}
                onClick={() => void doCancelPending()}
              >
                {cancelBusy ? t('wallet.submitting') : t('wallet.cancelWithdraw')}
              </button>
            </div>
          ) : null}
          <button
            className="wal-request"
            type="button"
            disabled={Boolean(info?.hasPendingWithdrawal) || withdrawable <= 0}
            onClick={openRequest}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path
                d="M12 19V6M12 6l-5 5M12 6l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('wallet.request')}
          </button>
        </article>
      </section>

      <section className="wal-history">
        <h2>{t('wallet.history')}</h2>
        <div className="wal-tools">
          <div className="wal-tools-left">
            <div className="wal-tool-wrap">
              <button type="button" className={menu === 'columns' ? 'is-on' : ''} onClick={() => setMenu(menu === 'columns' ? null : 'columns')}>
                {t('wallet.columns')}
              </button>
              {menu === 'columns' ? (
                <div className="wal-pop" role="menu">
                  <label>
                    <input type="checkbox" checked={showStatus} onChange={(e) => setShowStatus(e.target.checked)} />
                    {t('wallet.colStatus')}
                  </label>
                  <label>
                    <input type="checkbox" checked={showDesc} onChange={(e) => setShowDesc(e.target.checked)} />
                    {t('wallet.colDesc')}
                  </label>
                  <label>
                    <input type="checkbox" checked={showAfter} onChange={(e) => setShowAfter(e.target.checked)} />
                    {t('wallet.colAfter')}
                  </label>
                </div>
              ) : null}
            </div>
            <div className="wal-tool-wrap">
              <button type="button" className={menu === 'filters' ? 'is-on' : ''} onClick={() => setMenu(menu === 'filters' ? null : 'filters')}>
                {t('wallet.filters')}
              </button>
              {menu === 'filters' ? (
                <div className="wal-pop" role="menu">
                  {(
                    [
                      ['all', 'wallet.filtAll'],
                      ['game', 'wallet.typeBet'],
                      ['deposit', 'wallet.typeEarn'],
                      ['withdraw', 'wallet.typeWithdraw'],
                      ['transfer', 'wallet.typeTransfer'],
                    ] as const
                  ).map(([id, key]) => (
                    <button
                      key={id}
                      type="button"
                      className={typeFilt === id ? 'is-on' : ''}
                      onClick={() => {
                        setTypeFilt(id);
                        setPage(0);
                        setMenu(null);
                      }}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className={dense ? 'is-on' : ''} onClick={() => setDense((v) => !v)}>
              {t('wallet.density')}
            </button>
            <button type="button" onClick={exportCsv} disabled={filtered.length === 0}>
              {t('wallet.export')}
            </button>
          </div>
          <label className="wal-search">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              placeholder={t('wallet.search')}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </label>
        </div>

        <div className={`wal-table-wrap${dense ? ' is-dense' : ''}`}>
          <table className="wal-table">
            <thead>
              <tr>
                <th>{t('wallet.colType')}</th>
                {showStatus ? <th>{t('wallet.colStatus')}</th> : null}
                {showDesc ? <th>{t('wallet.colDesc')}</th> : null}
                <th>{t('wallet.colAmount')}</th>
                {showAfter ? <th>{t('wallet.colAfter')}</th> : null}
                <th>
                  <button type="button" className="wal-sort" onClick={() => setNewestFirst((v) => !v)}>
                    {t('wallet.colWhen')}
                    <span aria-hidden>{newestFirst ? '▼' : '▲'}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={colCount} className="wal-empty">
                    {t('wallet.loading')}
                  </td>
                </tr>
              ) : slice.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="wal-empty">
                    {t('wallet.emptyHist')}
                  </td>
                </tr>
              ) : (
                slice.map((row) => {
                  const credit = isCredit(row);
                  const cat = rowCategory(row);
                  const view = typeView(cat);
                  const amt = Math.abs(Number(row.amount) || 0);
                  return (
                    <tr key={row.id}>
                      <td>
                        <span className={`wal-pill wal-pill-${view.cls}`}>{t(view.key)}</span>
                      </td>
                      {showStatus ? (
                        <td>
                          <span className="wal-pill wal-pill-ok">{t('wallet.completed')}</span>
                        </td>
                      ) : null}
                      {showDesc ? <td>{rowLabel(row)}</td> : null}
                      <td className={credit ? 'wal-in' : 'wal-out'}>
                        <span className="wal-amt">
                          <img src={ASSETS.coin} width={16} height={16} alt="" />
                          {credit ? '+' : '−'}
                          {bacText(amt)} BAC
                        </span>
                      </td>
                      {showAfter ? (
                        <td>
                          <span className="wal-amt">
                            <img src={ASSETS.coin} width={16} height={16} alt="" />
                            {bacText(row.balanceAfter ?? 0)} BAC
                          </span>
                        </td>
                      ) : null}
                      <td className="wal-when">{tableWhen(row.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="wal-pager">
          <label>
            {t('wallet.rows')}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span>
            {from}–{to} of {filtered.length}
          </span>
          <div>
            <button type="button" disabled={safePage <= 0} onClick={() => setPage(0)} aria-label="First">
              «
            </button>
            <button type="button" disabled={safePage <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Previous">
              ‹
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Next"
            >
              ›
            </button>
            <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage(pageCount - 1)} aria-label="Last">
              »
            </button>
          </div>
        </footer>
      </section>

      {requestOpen ? (
        <div className="sec-pay-back" role="presentation">
          <button className="sec-pay-dismiss" type="button" aria-label={t('common.close')} onClick={closeRequest} />
          <div className="sec-pay wal-dialog" role="dialog" aria-labelledby="wd-title">
            <h2 id="wd-title">{confirm ? t('wallet.confirm') : t('wallet.request')}</h2>
            {confirm ? (
              <div className="wal-confirm">
                <p>
                  {bacText(maxAmt)} BAC · {walletType} · {address.trim()}
                </p>
                <p className="sec-muted">{t('wallet.confirmLead')}</p>
                <div className="sec-actions">
                  <button className="sec-cancel" type="button" onClick={() => setConfirm(false)}>
                    {t('wallet.cancel')}
                  </button>
                  <button className="sec-confirm" type="button" disabled={busy} onClick={() => void doWithdraw()}>
                    {busy ? t('wallet.submitting') : t('wallet.request')}
                  </button>
                </div>
              </div>
            ) : (
              <form className="wal-form" onSubmit={askWithdraw}>
                <label className="field">
                  {t('wallet.amount')}
                  <input type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
                </label>
                <label className="field">
                  {t('wallet.channel')}
                  <PayPicks value={walletType} onChange={setWalletType} />
                </label>
                <label className="field">
                  {t('wallet.dest')}
                  <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={120} />
                </label>
                <p className="sec-muted">
                  {t('wallet.max')}: {bacText(withdrawable)} BAC
                </p>
                {fieldErr ? <p className="field-error">{fieldErr}</p> : null}
                <div className="sec-actions">
                  <button className="sec-cancel" type="button" onClick={closeRequest}>
                    {t('wallet.cancel')}
                  </button>
                  <button className="sec-confirm" type="submit" disabled={busy || withdrawable <= 0 || !navigator.onLine}>
                    {t('wallet.request')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
