import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { readSessionUser } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import {
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

export function WalletPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const { setBalance } = useOutletContext<ShellCtx>();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'history' ? 'history' : 'overview';
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

  const usd = useMemo(() => fiatFor(balance, rates, 'USD'), [balance, rates]);
  const bdt = useMemo(() => fiatFor(balance, rates, 'BDT'), [balance, rates]);
  const withdrawable = info?.withdrawableAmount ?? 0;
  const maxAmt = Number(amount) || 0;

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
    } catch (err) {
      toast(isApiError(err) ? err.message : t('wallet.submitFail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="play-main">
      <p className="eyebrow">{t('nav.wallet')}</p>
      <h1>{t('wallet.title')}</h1>
      <div className="money-tabs">
        <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setParams({})}>
          {t('wallet.overview')}
        </button>
        <button
          type="button"
          className={tab === 'history' ? 'active' : ''}
          onClick={() => setParams({ tab: 'history' })}
        >
          {t('wallet.history')}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {tab === 'overview' ? (
        <>
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
            <section className="match-facts">
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
          <p className="play-muted">{t('wallet.rule')}</p>
          {info && balance > withdrawable ? (
            <p className="play-muted">
              {t('wallet.lockedWhy')} <CoinValue value={balance - withdrawable} />
              {info.totalMatchBets ? ` · ${t('wallet.locked')} ${info.totalMatchBets} BAC` : ''}.
            </p>
          ) : null}
          {doneAmt ? (
            <div className="money-alert">
              <strong>{t('wallet.done')}</strong>
              <p>
                <CoinValue value={doneAmt} /> ·{' '}
                <button type="button" className="text-link" onClick={() => setParams({ tab: 'history' })}>
                  {t('wallet.viewHist')}
                </button>
              </p>
            </div>
          ) : null}
          <div className="match-actions">
            <Link className="btn btn-primary" to="/user/shop">
              {t('wallet.buy')}
            </Link>
            <Link className="btn btn-ghost" to="/user/transfer">
              {t('nav.transfer')}
            </Link>
          </div>
          <section className="room-card">
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
        </>
      ) : rows === null ? (
        <div className="match-row skeleton" />
      ) : rows.length === 0 ? (
        <div className="play-empty">
          <h2>{t('wallet.emptyHist')}</h2>
          <p>{t('wallet.emptyHistLead')}</p>
          <Link className="btn btn-primary" to="/user/shop">
            {t('wallet.buy')}
          </Link>
        </div>
      ) : (
        <div className="result-table">
          <div className="result-head">
            <span>{t('wallet.when')}</span>
            <span>{t('wallet.type')}</span>
            <span>{t('wallet.amountCol')}</span>
            <span>{t('wallet.balanceCol')}</span>
          </div>
          {rows.map((row) => (
            <div className="result-row" key={row.id}>
              <span>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</span>
              <span>{row.type}</span>
              <span>
                <CoinValue value={row.amount} />
              </span>
              <span>
                <CoinValue value={row.balanceAfter ?? 0} />
              </span>
            </div>
          ))}
        </div>
      )}

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
