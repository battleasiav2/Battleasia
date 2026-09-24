import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { readSessionUser } from '../../lib/auth';
import {
  formatWhen,
  isCredit,
  rowCategory,
  rowLabel,
  statusTone,
  type HistFilter,
} from '../../lib/history';
import { useI18n } from '../../lib/i18n';
import {
  fetchBalanceHistory,
  fetchCoinRates,
  fetchMyDeposits,
  fetchMyWithdrawals,
  fetchWithdrawable,
  fiatFor,
  submitWithdraw,
  type CoinRate,
  type HistoryRow,
  type WithdrawableInfo,
} from '../../lib/wallet';

type ShellCtx = { setBalance: (n: number) => void };

const FILTERS: Array<{ id: HistFilter; key: string }> = [
  { id: 'all', key: 'wallet.filtAll' },
  { id: 'deposit', key: 'wallet.filtDeposit' },
  { id: 'withdraw', key: 'wallet.filtWithdraw' },
  { id: 'game', key: 'wallet.filtGame' },
  { id: 'claim', key: 'wallet.filtClaim' },
  { id: 'transfer', key: 'wallet.filtTransfer' },
];

export function WalletPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const { setBalance } = useOutletContext<ShellCtx>();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'history' ? 'history' : params.get('tab') === 'orders' ? 'orders' : 'overview';
  const filt = (params.get('filt') as HistFilter) || 'all';
  const orderTab = params.get('orders') === 'out' ? 'out' : 'in';
  const sessionBal = Number(readSessionUser()?.balance) || 0;
  const [info, setInfo] = useState<WithdrawableInfo | null>(null);
  const [rates, setRates] = useState<CoinRate[]>([]);
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [deposits, setDeposits] = useState<Array<Record<string, unknown>> | null>(null);
  const [withdrawals, setWithdrawals] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('bkash');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [idem, setIdem] = useState(() => crypto.randomUUID());
  const [doneAmt, setDoneAmt] = useState(0);
  const [fieldErr, setFieldErr] = useState('');

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
    Promise.all([
      fetchWithdrawable(),
      fetchCoinRates(),
      fetchBalanceHistory(),
      fetchMyDeposits(),
      fetchMyWithdrawals(),
    ])
      .then(([w, r, h, d, out]) => {
        if (!live) return;
        setInfo(w);
        setRates(r);
        setRows(h);
        setDeposits(d);
        setWithdrawals(out);
        if (w?.balance != null) setBalance(w.balance);
      })
      .catch((err) => {
        if (!live) return;
        setError(isApiError(err) ? err.message : t('errors.walletOffline'));
        setRows([]);
        setDeposits([]);
        setWithdrawals([]);
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

  const usd = useMemo(() => fiatFor(balance, rates, 'USD'), [balance, rates]);
  const bdt = useMemo(() => fiatFor(balance, rates, 'BDT'), [balance, rates]);
  const withdrawable = info?.withdrawableAmount ?? 0;
  const maxAmt = Number(amount) || 0;

  const filtered = useMemo(() => {
    if (!rows) return [];
    if (filt === 'all') return rows;
    return rows.filter((row) => rowCategory(row) === filt);
  }, [rows, filt]);

  async function doWithdraw() {
    if (busy) return;
    setBusy(true);
    try {
      await submitWithdraw(
        {
          coin_amount: maxAmt,
          wallet_address: address.trim(),
          wallet_type: walletType,
          currency_type: 'BDT',
        },
        idem
      );
      toast(t('wallet.submitted'));
      setConfirm(false);
      setDoneAmt(maxAmt);
      setAmount('');
      setAddress('');
      setFieldErr('');
      setIdem(crypto.randomUUID());
      const next = await fetchWithdrawable();
      setInfo(next);
      setRows(await fetchBalanceHistory());
      setWithdrawals(await fetchMyWithdrawals());
    } catch (err) {
      toast(isApiError(err) ? err.message : t('wallet.submitFail'));
    } finally {
      setBusy(false);
    }
  }

  function setTab(next: string, extra: Record<string, string> = {}) {
    if (next === 'overview') setParams(extra);
    else setParams({ tab: next, ...extra });
  }

  const orderRows = orderTab === 'out' ? withdrawals : deposits;

  return (
    <main className="play-main wallet-hub">
      <header className="play-head wallet-hub-head">
        <div>
          <p className="eyebrow">{t('nav.wallet')}</p>
          <h1>{t('wallet.title')}</h1>
        </div>
        <div className="money-tabs wallet-hub-tabs">
          <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
            {t('wallet.overview')}
          </button>
          <button type="button" className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
            {t('wallet.history')}
          </button>
          <button type="button" className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            {t('wallet.orders')}
          </button>
        </div>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      {tab === 'overview' ? (
        <div className="hub-stage wallet-hub-stage">
          <div className="wallet-hub-summary">
            {info === null && !error ? <div className="match-row skeleton" /> : null}
            {balance === 0 && info ? (
              <div className="play-empty">
                <div className="play-empty-art" aria-hidden />
                <h2>{t('wallet.empty')}</h2>
                <p>{t('wallet.emptyLead')}</p>
                <Link className="btn btn-primary" to="/user/shop">
                  {t('wallet.buy')}
                </Link>
              </div>
            ) : (
              <section className="match-facts wallet-hub-facts">
                <article>
                  <small>{t('wallet.total')}</small>
                  <strong>
                    <CoinValue value={balance} />
                  </strong>
                </article>
                <article>
                  <small>{t('wallet.withdrawable')}</small>
                  <strong>
                    <CoinValue value={withdrawable} />
                  </strong>
                </article>
                <article>
                  <small>USD</small>
                  <strong>{usd == null ? '—' : usd.toFixed(2)}</strong>
                </article>
                <article>
                  <small>BDT</small>
                  <strong>{bdt == null ? '—' : bdt.toFixed(0)}</strong>
                </article>
              </section>
            )}
            <p className="play-muted wallet-hub-note">{t('wallet.rule')}</p>
            {info && balance > withdrawable ? (
              <p className="play-muted wallet-hub-note">
                {t('wallet.lockedWhy')} <CoinValue value={balance - withdrawable} />
                {info.totalMatchBets ? ` · ${t('wallet.locked')} ${info.totalMatchBets} BAC` : ''}.
              </p>
            ) : null}
            {doneAmt ? (
              <div className="money-alert">
                <strong>{t('wallet.done')}</strong>
                <p>
                  <CoinValue value={doneAmt} /> ·{' '}
                  <button type="button" className="text-link" onClick={() => setTab('history')}>
                    {t('wallet.viewHist')}
                  </button>
                </p>
              </div>
            ) : null}
            <div className="match-actions wallet-hub-actions">
              <Link className="btn btn-primary" to="/user/shop">
                {t('wallet.buy')}
              </Link>
              <Link className="btn btn-ghost" to="/user/transfer">
                {t('nav.transfer')}
              </Link>
            </div>
          </div>

          <section className="room-card wallet-hub-pay">
            <h2>{t('wallet.withdraw')}</h2>
            {info?.hasPendingWithdrawal ? (
              <p className="play-muted">{t('wallet.pending')}</p>
            ) : (
              <form
                className="money-form"
                onSubmit={(e) => {
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
                }}
              >
                <label className="field">
                  {t('wallet.amount')}
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </label>
                <label className="field">
                  {t('wallet.channel')}
                  <select value={walletType} onChange={(e) => setWalletType(e.target.value)}>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </label>
                <label className="field">
                  {t('wallet.dest')}
                  <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={120} />
                </label>
                {fieldErr ? <p className="field-error">{fieldErr}</p> : null}
                <button className="btn btn-primary" type="submit" disabled={busy || withdrawable <= 0 || !navigator.onLine}>
                  {t('wallet.request')}
                </button>
              </form>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'history' ? (
        <div className="hist-panel">
          <div className="hist-filters" role="tablist" aria-label={t('wallet.history')}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filt === f.id}
                className={filt === f.id ? 'active' : ''}
                onClick={() => setTab('history', { filt: f.id })}
              >
                {t(f.key)}
              </button>
            ))}
          </div>
          {rows === null ? (
            <div className="match-row skeleton" />
          ) : filtered.length === 0 ? (
            <div className="play-empty">
              <h2>{t('wallet.emptyHist')}</h2>
              <p>{t('wallet.emptyHistLead')}</p>
              <Link className="btn btn-primary" to="/user/shop">
                {t('wallet.buy')}
              </Link>
            </div>
          ) : (
            <ul className="hist-feed">
              {filtered.map((row) => {
                const credit = isCredit(row);
                const cat = rowCategory(row);
                return (
                  <li key={row.id} className={`hist-item hist-${cat}`}>
                    <div className="hist-item-main">
                      <span className={`hist-pill hist-pill-${cat}`}>
                        {cat === 'deposit'
                          ? t('wallet.filtDeposit')
                          : cat === 'withdraw'
                            ? t('wallet.filtWithdraw')
                            : cat === 'game'
                              ? t('wallet.filtGame')
                              : cat === 'claim'
                                ? t('wallet.filtClaim')
                                : cat === 'transfer'
                                  ? t('wallet.filtTransfer')
                                  : cat}
                      </span>
                      <strong>{rowLabel(row)}</strong>
                      <small>{formatWhen(row.createdAt)}</small>
                    </div>
                    <div className={`hist-amt ${credit ? 'is-in' : 'is-out'}`}>
                      <span>
                        {credit ? '+' : '−'}
                        <CoinValue value={Math.abs(Number(row.amount) || 0)} />
                      </span>
                      <small>
                        {t('wallet.balanceCol')} <CoinValue value={row.balanceAfter ?? 0} />
                      </small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {tab === 'orders' ? (
        <div className="hist-panel">
          <div className="hist-filters">
            <button
              type="button"
              className={orderTab === 'in' ? 'active' : ''}
              onClick={() => setTab('orders', { orders: 'in' })}
            >
              {t('wallet.filtDeposit')}
            </button>
            <button
              type="button"
              className={orderTab === 'out' ? 'active' : ''}
              onClick={() => setTab('orders', { orders: 'out' })}
            >
              {t('wallet.filtWithdraw')}
            </button>
          </div>
          {orderRows === null ? (
            <div className="match-row skeleton" />
          ) : orderRows.length === 0 ? (
            <div className="play-empty">
              <h2>{t('wallet.emptyOrders')}</h2>
              <p>{t('wallet.emptyOrdersLead')}</p>
            </div>
          ) : (
            <ul className="hist-feed">
              {orderRows.map((row) => {
                const id = String(row._id || row.id);
                const status = String(row.status || '');
                const tone = statusTone(status);
                const amt = Number(row.coin_amount ?? row.amount) || 0;
                const when = String(row.created_at || row.createdAt || '');
                const trx = String(row.transaction_id || row.wallet_address || '');
                return (
                  <li key={id} className="hist-item">
                    <div className="hist-item-main">
                      <span className={`hist-status hist-status-${tone}`}>{status || '—'}</span>
                      <strong>
                        <CoinValue value={amt} />
                      </strong>
                      <small>
                        {formatWhen(when)}
                        {trx ? ` · ${trx}` : ''}
                      </small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {confirm ? (
        <div className="play-sheet" role="dialog" aria-labelledby="wd-title">
          <button className="play-sheet-bg" type="button" aria-label={t('common.close')} onClick={() => setConfirm(false)} />
          <div className="play-sheet-card">
            <h2 id="wd-title">
              {t('wallet.confirm')} {maxAmt} BAC
            </h2>
            <p>{t('wallet.confirmLead')}</p>
            <div className="match-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setConfirm(false)}>
                {t('wallet.cancel')}
              </button>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void doWithdraw()}>
                {busy ? t('wallet.submitting') : `${t('wallet.withdraw')} ${maxAmt} BAC`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
