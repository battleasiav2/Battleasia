import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { ASSETS } from '../../lib/assets';
import { readSessionUser } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import {
  fetchBusinessWallets,
  fetchChannels,
  fetchMyDeposits,
  fetchShopPacks,
  firstChannelWithWallet,
  submitDeposit,
  walletChannelId,
  type BizWallet,
  type PayChannel,
  type ShopPack,
} from '../../lib/wallet';

/** ShopItem.symbol is the coin ticker (BAC); pack price is fiat (BDT). */
function packFiatPrefix(symbol?: string) {
  if (!symbol || symbol === 'BAC' || symbol === 'BDT') return '৳';
  return `${symbol} `;
}

export function ShopPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const user = readSessionUser();
  const [packs, setPacks] = useState<ShopPack[] | null>(null);
  const [channels, setChannels] = useState<PayChannel[]>([]);
  const [wallets, setWallets] = useState<BizWallet[]>([]);
  const [pending, setPending] = useState<Record<string, unknown>[]>([]);
  const [rejected, setRejected] = useState<Record<string, unknown>[]>([]);
  const [doneAmt, setDoneAmt] = useState(0);
  const [fieldErr, setFieldErr] = useState('');
  const [pack, setPack] = useState<ShopPack | null>(null);
  const [channelId, setChannelId] = useState('');
  const [trx, setTrx] = useState('');
  const [fromAddr, setFromAddr] = useState('');
  const [busy, setBusy] = useState(false);
  const [idem, setIdem] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');

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
    Promise.all([fetchShopPacks(), fetchChannels(), fetchMyDeposits(), fetchBusinessWallets()])
      .then(([p, c, d, w]) => {
        if (!live) return;
        setPacks(p);
        setChannels(c);
        setWallets(w);
        setPending(d.filter((row) => String(row.status) === 'pending'));
        setRejected(d.filter((row) => String(row.status) === 'rejected'));
        setChannelId(firstChannelWithWallet(c, w));
      })
      .catch((err) => {
        if (!live) return;
        setPacks([]);
        setError(isApiError(err) ? err.message : t('errors.shopOffline'));
      });
    return () => {
      live = false;
    };
  }, [t]);

  const wallet = useMemo(
    () => wallets.find((row) => walletChannelId(row) === channelId),
    [channelId, wallets]
  );
  const channel = useMemo(() => channels.find((c) => c.id === channelId), [channelId, channels]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pack) {
      toast(t('shop.pickPack'));
      return;
    }
    if (!channelId || !wallet) {
      toast(t('shop.pickChannel'));
      return;
    }
    if (!trx.trim()) {
      setFieldErr(t('shop.trxRequired'));
      return;
    }
    if (!navigator.onLine) {
      setFieldErr(t('net.offline'));
      return;
    }
    setFieldErr('');
    setBusy(true);
    try {
      await submitDeposit(
        {
          coin_amount: pack.amount,
          payment_amount: pack.price,
          payment_channel: channelId,
          transaction_id: trx.trim(),
          to_wallet_address: wallet?.wallet_address || '',
          from_address: fromAddr.trim(),
          payment_currency: wallet?.currency_type || 'BDT',
          user_email: user?.email || '',
          username: user?.username || '',
        },
        idem
      );
      toast(t('shop.depositOk'));
      setDoneAmt(pack.amount);
      setTrx('');
      setFromAddr('');
      setIdem(crypto.randomUUID());
      const rows = await fetchMyDeposits();
      setPending(rows.filter((row) => String(row.status) === 'pending'));
      setRejected(rows.filter((row) => String(row.status) === 'rejected'));
    } catch (err) {
      toast(isApiError(err) && err.status === 409 ? t('shop.already') : isApiError(err) ? err.message : t('shop.depositFail'));
      if (isApiError(err) && err.status === 409) setFieldErr(t('shop.already'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="play-main shop-buy">
      <header className="play-head shop-buy-head">
        <div>
          <p className="eyebrow">{t('nav.shop')}</p>
          <h1>{t('shop.title')}</h1>
          <p className="play-lead">{t('shop.lead')}</p>
        </div>
        <div className="shop-buy-tools">
          {packs && packs.length > 0 ? (
            <p className="play-count">
              <strong>{packs.length}</strong>
              <small>{t('shop.packs')}</small>
            </p>
          ) : null}
          <div className="match-actions shop-buy-actions">
            <Link className="btn btn-ghost" to="/user/wallet">
              {t('nav.wallet')}
            </Link>
            <Link className="btn btn-ghost" to="/user/withdrawal">
              {t('nav.withdraw')}
            </Link>
          </div>
        </div>
      </header>
      {pending.length ? (
        <div className="wallet-pending shop-buy-pending">
          <span className="match-status is-upcoming">{t('shop.pendingTitle')}</span>
          <p>
            {pending.length} {pending.length === 1 ? t('shop.pendingOne') : t('shop.pending')}
          </p>
        </div>
      ) : null}
      {rejected[0] ? (
        <div className="money-alert danger">
          <strong>{t('shop.rejectedTitle')}</strong>
          <p>{String(rejected[0].rejection_reason || rejected[0].reason || t('shop.resubmit'))}</p>
        </div>
      ) : null}
      {doneAmt ? (
        <div className="money-alert">
          <strong>{t('shop.done')}</strong>
          <p>
            <CoinValue value={doneAmt} /> · <Link to="/user/wallet?tab=history">{t('shop.viewHist')}</Link>
          </p>
        </div>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="hub-stage shop-buy-stage">
      <div className="shop-buy-packs">
      {packs === null ? (
        <div className="play-grid shop-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="play-card skeleton" key={i} />
          ))}
        </div>
      ) : packs.length === 0 ? (
        <div className="play-empty">
          <div className="play-empty-art" aria-hidden />
          <h2>{t('shop.noPacks')}</h2>
          <p>{t('shop.noPacksLead')}</p>
          <Link className="btn btn-primary" to="/user/wallet">
            {t('shop.openWallet')}
          </Link>
        </div>
      ) : (
        <div className="play-grid shop-grid">
          {packs.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`play-card ${pack?.id === item.id ? 'is-selected' : ''}`}
              onClick={() => setPack(item)}
            >
              <div className="play-card-art">
                <img className="shop-pack-coin" src={ASSETS.coin} alt="" width={40} height={40} decoding="async" />
                {item.discountPercent ? <span className="shop-off">{item.discountPercent}{t('shop.off')}</span> : null}
              </div>
              <div className="play-card-meta">
                <strong>
                  <CoinValue value={item.amount} size={14} />
                </strong>
                <small>
                  {packFiatPrefix(item.symbol)}
                  {item.price}
                </small>
                <span className="play-card-go">{pack?.id === item.id ? t('shop.selected') : t('shop.select')}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>

      <section className="room-card shop-buy-pay">
        <h2>{t('shop.pay')}</h2>
        {packs !== null && channels.length === 0 ? (
          <div className="play-empty">
            <h2>{t('shop.paused')}</h2>
            <p>{t('shop.pausedLead')}</p>
          </div>
        ) : (
        <form className="money-form" onSubmit={onSubmit}>
          {pack ? (
            <div className="xfer-break pack-break">
              <div>
                <small>{t('shop.selected')}</small>
                <strong>
                  <CoinValue value={pack.amount} />
                </strong>
              </div>
              <div>
                <small>{t('shop.youPay')}</small>
                <strong>
                  {packFiatPrefix(pack.symbol)}
                  {pack.price}
                </strong>
              </div>
            </div>
          ) : (
            <p className="play-muted">{t('shop.pickPack')}</p>
          )}
          <div className="field">
            {t('wallet.channel')}
            <div className="money-tabs">
              {channels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={channelId === c.id ? 'active' : ''}
                  onClick={() => setChannelId(c.id)}
                >
                  {c.channel_name}
                </button>
              ))}
            </div>
          </div>
          {wallet ? (
            <div className="pay-box">
              <p>
                {t('shop.sendTo')} <b>{channel?.channel_name}</b> · {wallet.currency_type}
              </p>
              <div className="pay-copy">
                <p className="pay-addr">{wallet.wallet_address}</p>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(wallet.wallet_address);
                    toast(t('shop.addrCopied'));
                  }}
                >
                  {t('shop.copyAddr')}
                </button>
              </div>
              {wallet.qr_code ? (
                <img src={wallet.qr_code} alt="Payment QR" width={160} height={160} />
              ) : null}
            </div>
          ) : (
            <p className="play-muted">{t('shop.noWallet')}</p>
          )}
          <label className="field">
            {t('shop.from')}
            <input value={fromAddr} onChange={(e) => setFromAddr(e.target.value)} maxLength={120} />
          </label>
          <label className="field">
            {t('shop.trx')}
            <input
              value={trx}
              onChange={(e) => setTrx(e.target.value)}
              onBlur={(e) => setTrx(e.target.value.trim())}
              maxLength={80}
              required
            />
          </label>
          {fieldErr ? <p className="field-error">{fieldErr}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={busy || !pack || !channelId || !wallet || !navigator.onLine}>
            {busy ? t('wallet.submitting') : pack ? `${t('shop.submitN')} ${pack.amount} BAC` : t('shop.pickPack')}
          </button>
        </form>
        )}
      </section>
      </div>
    </main>
  );
}
