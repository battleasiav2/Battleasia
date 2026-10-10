import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { PayPicks } from '../../components/PayBrand';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import {
  cancelWithdraw,
  fetchCoingoCapabilities,
  fetchMyWithdrawals,
  fetchWithdrawable,
  submitCoingoPayout,
  submitWithdraw,
  type WithdrawableInfo,
} from '../../lib/wallet';

export function WithdrawalPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const [info, setInfo] = useState<WithdrawableInfo | null>(null);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('bkash');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const [idem, setIdem] = useState(() => crypto.randomUUID());
  const [doneAmt, setDoneAmt] = useState(0);
  const [fieldErr, setFieldErr] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [coingoChecklist, setCoingoChecklist] = useState<string[]>([]);
  const [coingoMock, setCoingoMock] = useState(false);
  const maxAmt = Number(amount) || 0;
  const withdrawable = info?.withdrawableAmount ?? 0;
  const pendingId = info?.pendingWithdrawalId || '';
  const pendingAmt = info?.pendingWithdrawalAmount ?? 0;

  useEffect(() => {
    return register({
      share: async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('play.copied'));
      },
    });
  }, [register, t, toast]);

  useEffect(() => {
    Promise.all([fetchWithdrawable(), fetchMyWithdrawals(), fetchCoingoCapabilities()])
      .then(([w, h, cap]) => {
        setInfo(w);
        setRows(h);
        if (cap) {
          setCoingoMock(Boolean(cap.mockMode));
          setCoingoChecklist(Array.isArray(cap.checklist) ? cap.checklist : []);
        }
      })
      .catch((err) => setError(isApiError(err) ? err.message : t('wd.offline')));
  }, [t]);

  async function doWithdraw() {
    setBusy(true);
    try {
      try {
        await submitCoingoPayout(
          {
            amount: maxAmt,
            walletNumber: address.trim(),
            walletType,
            currency_type: 'BDT',
          },
          idem
        );
      } catch {
        await submitWithdraw(
          {
            coin_amount: maxAmt,
            wallet_address: address.trim(),
            wallet_type: walletType,
            currency_type: 'BDT',
          },
          idem
        );
      }
      toast(t('wd.ok'));
      setConfirm(false);
      setDoneAmt(maxAmt);
      setAmount('');
      setAddress('');
      setFieldErr('');
      setIdem(crypto.randomUUID());
      setInfo(await fetchWithdrawable());
      setRows(await fetchMyWithdrawals());
    } catch (err) {
      toast(isApiError(err) ? err.message : t('wd.fail'));
    } finally {
      setBusy(false);
    }
  }

  async function doCancelPending() {
    if (!pendingId) return;
    setCancelBusy(true);
    try {
      const result = await cancelWithdraw(pendingId);
      toast(t('wallet.cancelWithdrawOk'));
      setDoneAmt(0);
      setInfo(await fetchWithdrawable());
      setRows(await fetchMyWithdrawals());
      void result;
    } catch (err) {
      toast(isApiError(err) ? err.message : t('wallet.cancelWithdrawFail'));
    } finally {
      setCancelBusy(false);
    }
  }

  return (
    <main className="play-main wd-hub">
      <header className="play-head wd-hub-head">
        <div>
          <p className="eyebrow">{t('nav.withdraw')}</p>
          <h1>{t('wd.title')}</h1>
        </div>
        <section className="match-facts wd-hub-facts">
          <article>
            <small>{t('wallet.withdrawable')}</small>
            <strong>
              <CoinValue value={withdrawable} />
            </strong>
          </article>
          <article>
            <small>{t('wallet.balanceCol')}</small>
            <strong>
              <CoinValue value={info?.balance ?? 0} />
            </strong>
          </article>
        </section>
      </header>

      {error ? <p className="form-error">{error}</p> : null}
      {coingoChecklist.length ? (
        <section className="room-card wd-coingo-note" aria-label={t('wd.coingoCheckTitle')}>
          <h2>{coingoMock ? t('wd.coingoMockTitle') : t('wd.coingoCheckTitle')}</h2>
          <ul>
            {coingoChecklist.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {info && (info.balance ?? 0) > withdrawable ? (
        <p className="play-muted wd-hub-note">
          {t('wallet.lockedWhy')} <CoinValue value={(info.balance ?? 0) - withdrawable} />.
        </p>
      ) : null}
      {doneAmt ? (
        <div className="money-alert">
          <strong>{t('wallet.done')}</strong>
          <p>
            <CoinValue value={doneAmt} />
          </p>
        </div>
      ) : null}

      <div className="hub-stage wd-hub-stage">
        <section className="room-card wd-hub-form">
          <h2>{t('wallet.withdraw')}</h2>
          {info?.hasPendingWithdrawal ? (
            <div className="money-alert">
              <strong>{t('shop.pendingTitle')}</strong>
              <p>
                {t('wd.pending')}{' '}
                {pendingAmt > 0 ? (
                  <>
                    (<CoinValue value={pendingAmt} />)
                  </>
                ) : null}
              </p>
              <p className="play-muted">{t('wallet.cancelWithdrawLead')}</p>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={cancelBusy || !pendingId || !navigator.onLine}
                onClick={() => void doCancelPending()}
              >
                {cancelBusy ? t('wallet.submitting') : t('wallet.cancelWithdraw')}
              </button>
            </div>
          ) : (
            <form
              className="money-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!address.trim()) {
                  setFieldErr(t('wd.needNum'));
                  return;
                }
                if (maxAmt <= 0 || maxAmt > withdrawable) {
                  setFieldErr(`${t('wallet.max')}: ${withdrawable} BAC`);
                  return;
                }
                setFieldErr('');
                setConfirm(true);
              }}
            >
              <label className="field">
                {t('wallet.amount')}
                <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
              <label className="field">
                {t('wallet.channel')}
                <PayPicks value={walletType} onChange={setWalletType} />
              </label>
              <label className="field">
                {t('wd.dest')}
                <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={120} />
              </label>
              {fieldErr ? <p className="field-error">{fieldErr}</p> : null}
              <button className="btn btn-primary" type="submit" disabled={busy || withdrawable <= 0 || !navigator.onLine}>
                {t('wd.request')}
              </button>
            </form>
          )}
        </section>

        <section className="room-card wd-hub-recent">
          <h2>{t('wallet.history')}</h2>
          {rows.length === 0 ? (
            <div className="play-empty">
              <h2>{t('wd.none')}</h2>
              <Link className="btn btn-primary" to="/user/shop">
                {t('wallet.buy')}
              </Link>
            </div>
          ) : (
            <div className="result-table wd-hub-table">
              {rows.map((row) => (
                <div className="result-row" key={String(row._id || row.id)}>
                  <span>{String(row.status || '')}</span>
                  <span>{String(row.wallet_type || '')}</span>
                  <span>
                    <CoinValue value={Number(row.coin_amount) || 0} />
                  </span>
                  <span>{row.created_at ? new Date(String(row.created_at)).toLocaleString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {confirm ? (
        <div className="play-sheet" role="dialog">
          <button className="play-sheet-bg" type="button" aria-label={t('common.close')} onClick={() => setConfirm(false)} />
          <div className="play-sheet-card">
            <h2>
              {t('wallet.confirm')} {maxAmt} BAC
            </h2>
            <p>{t('wd.confirmLead')}</p>
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
