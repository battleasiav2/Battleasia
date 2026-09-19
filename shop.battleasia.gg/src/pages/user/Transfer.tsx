import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { fetchMe, readSessionUser } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import {
  fetchTransferHistory,
  fetchTransferSettings,
  sendTransfer,
  type TransferRow,
  type TransferSettings,
} from '../../lib/wallet';

type ShellCtx = { setBalance: (n: number) => void };

export function TransferPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const { setBalance } = useOutletContext<ShellCtx>();
  const [settings, setSettings] = useState<TransferSettings | null>(null);
  const [rows, setRows] = useState<TransferRow[] | null>(null);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const [idem, setIdem] = useState(() => crypto.randomUUID());
  const [doneAmt, setDoneAmt] = useState(0);
  const [fieldErr, setFieldErr] = useState('');

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
    Promise.all([fetchTransferSettings(), fetchTransferHistory()])
      .then(([s, h]) => {
        if (!live) return;
        setSettings(s);
        setRows(h);
      })
      .catch((err) => {
        if (!live) return;
        setError(isApiError(err) ? err.message : t('xfer.offline'));
        setRows([]);
      });
    return () => {
      live = false;
    };
  }, [t]);

  const amt = Number(amount) || 0;
  const fee = useMemo(() => {
    if (!settings) return 0;
    return Math.round(amt * (settings.feePercent / 100) * 100) / 100;
  }, [amt, settings]);
  const total = Math.round((amt + fee) * 100) / 100;

  function dirLabel(dir?: string) {
    const d = (dir || '').toLowerCase();
    if (d === 'in' || d === 'received' || d === 'incoming') return t('xfer.in');
    if (d === 'out' || d === 'sent' || d === 'outgoing') return t('xfer.out');
    return dir || '—';
  }

  function dirTone(dir?: string) {
    const d = (dir || '').toLowerCase();
    if (d === 'in' || d === 'received' || d === 'incoming') return 'in';
    return 'out';
  }

  function whenLabel(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function validate() {
    if (!settings?.enabled) return t('xfer.disabled');
    if (!to.trim()) return t('xfer.needUser');
    const me = readSessionUser();
    const dest = to.trim().toLowerCase();
    if (dest && (dest === (me?.username || '').toLowerCase() || dest === (me?.email || '').toLowerCase())) {
      return t('xfer.self');
    }
    if (amt < (settings.minAmount || 0)) return `${t('xfer.min')} ${settings.minAmount} BAC`;
    if (amt > (settings.maxAmount || Infinity)) return `${t('xfer.max')} ${settings.maxAmount} BAC`;
    return '';
  }

  async function doSend() {
    setBusy(true);
    try {
      await sendTransfer(to.trim(), amt, note, idem);
      toast(t('xfer.ok'));
      setConfirm(false);
      setDoneAmt(amt);
      setAmount('');
      setNote('');
      setFieldErr('');
      setIdem(crypto.randomUUID());
      const me = await fetchMe();
      if (me?.balance != null) setBalance(Number(me.balance) || 0);
      setRows(await fetchTransferHistory());
    } catch (err) {
      toast(isApiError(err) ? err.message : t('xfer.fail'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="play-main">
      <header className="play-head">
        <div>
          <p className="eyebrow">{t('nav.transfer')}</p>
          <h1>{t('xfer.title')}</h1>
          <p className="play-lead">{t('xfer.lead')}</p>
        </div>
        {settings ? (
          <p className="play-count">
            <strong>{settings.feePercent}%</strong>
            <small>{t('xfer.feeHint')}</small>
          </p>
        ) : null}
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      {settings && !settings.enabled ? (
        <div className="play-empty">
          <h2>{t('xfer.off')}</h2>
          <p>{t('xfer.offLead')}</p>
          <Link className="btn btn-primary" to="/user/wallet">
            {t('shop.openWallet')}
          </Link>
        </div>
      ) : (
        <div className="hub-stage">
          <form
            className="money-form room-card"
            onSubmit={(e) => {
              e.preventDefault();
              const msg = validate();
              if (msg) {
                setFieldErr(msg);
                return;
              }
              setFieldErr('');
              setConfirm(true);
            }}
          >
            <h2>{t('xfer.sendTo')}</h2>
            <label className="field">
              {t('xfer.user')}
              <input value={to} onChange={(e) => setTo(e.target.value)} autoComplete="off" maxLength={32} />
            </label>
            <label className="field">
              {t('wallet.amount')}
              <input type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              {settings ? (
                <span className="field-hint">
                  {t('xfer.minHint')} {settings.minAmount} · {t('xfer.maxHint')} {settings.maxAmount}
                </span>
              ) : null}
            </label>
            <label className="field">
              {t('xfer.note')}
              <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
              <span className="field-hint">{note.length}/200</span>
            </label>
            <div className="xfer-break">
              <div>
                <small>{t('xfer.gets')}</small>
                <strong>
                  <CoinValue value={amt} />
                </strong>
              </div>
              <div>
                <small>{t('xfer.feeHint')}</small>
                <strong>
                  <CoinValue value={fee} />
                </strong>
              </div>
              <div>
                <small>{t('xfer.youPay')}</small>
                <strong>
                  <CoinValue value={total} />
                </strong>
              </div>
            </div>
            {fieldErr ? <p className="field-error">{fieldErr}</p> : null}
            {doneAmt ? (
              <div className="money-alert">
                <strong>{t('xfer.done')}</strong>
                <p>
                  <CoinValue value={doneAmt} /> · {t('xfer.viewHist')}
                </p>
              </div>
            ) : null}
            <button className="btn btn-primary" type="submit" disabled={busy || !settings || !navigator.onLine}>
              {t('xfer.continue')}
            </button>
          </form>
          <section className="room-card">
            <h2>{t('xfer.recent')}</h2>
            {rows === null ? (
              <div className="match-row skeleton" />
            ) : rows.length === 0 ? (
              <p className="play-muted">{t('xfer.none')}</p>
            ) : (
              <div className="xfer-list">
                {rows.map((row) => (
                  <article className="xfer-item" key={row.id}>
                    <div>
                      <b>{row.counterpartyUsername || '—'}</b>
                      <small>
                        <span className={`xfer-dir ${dirTone(row.direction)}`}>{dirLabel(row.direction)}</span>
                        {whenLabel(row.createdAt)}
                      </small>
                    </div>
                    <CoinValue value={row.amount} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {confirm ? (
        <div className="play-sheet" role="dialog" aria-labelledby="tf-title">
          <button className="play-sheet-bg" type="button" aria-label={t('common.close')} onClick={() => setConfirm(false)} />
          <div className="play-sheet-card">
            <h2 id="tf-title">{t('xfer.sendQ')}</h2>
            <p>
              {t('xfer.to')} <b>{to.trim()}</b>
            </p>
            <div className="xfer-break">
              <div>
                <small>{t('wallet.amountCol')}</small>
                <strong>
                  <CoinValue value={amt} />
                </strong>
              </div>
              <div>
                <small>{t('xfer.feeHint')}</small>
                <strong>
                  <CoinValue value={fee} />
                </strong>
              </div>
              <div>
                <small>{t('xfer.debit')}</small>
                <strong>
                  <CoinValue value={total} />
                </strong>
              </div>
            </div>
            <div className="match-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setConfirm(false)}>
                {t('wallet.cancel')}
              </button>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void doSend()}>
                {busy ? t('xfer.sending') : t('xfer.sendTo')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
