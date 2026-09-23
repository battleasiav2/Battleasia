import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { useI18n } from '../../lib/i18n';
import {
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
  const maxAmt = Number(amount) || 0;
  const withdrawable = info?.withdrawableAmount ?? 0;

  useEffect(() => {
    return register({
      share: async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast(t('play.copied'));
      },
    });
  }, [register, t, toast]);

  useEffect(() => {
    Promise.all([fetchWithdrawable(), fetchMyWithdrawals()])
      .then(([w, h]) => {
        setInfo(w);
        setRows(h);
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
              <p>{t('wd.pending')}</p>
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
                <select value={walletType} onChange={(e) => setWalletType(e.target.value)}>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="crypto">Crypto</option>
                </select>
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
