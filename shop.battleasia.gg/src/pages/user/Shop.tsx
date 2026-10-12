import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinValue } from '../../components/CoinValue';
import { InboxField } from '../../components/InboxField';
import { PayBrand, payKindFromName } from '../../components/PayBrand';
import { useHud } from '../../contexts/HudContext';
import { isApiError } from '../../lib/api';
import { ASSETS } from '../../lib/assets';
import { readSessionUser } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import { mediaUrl } from '../../lib/media';
import {
  fetchBusinessWallets,
  fetchChannels,
  fetchCoinRates,
  fetchMyDeposits,
  fetchShopPacks,
  firstChannelWithWallet,
  applyShopCoupon,
  submitDeposit,
  walletChannelId,
  type BizWallet,
  type CoinRate,
  type PayChannel,
  type ShopPack,
} from '../../lib/wallet';

type AppliedCoupon = {
  code: string;
  kind: 'off' | 'bonus';
  value: number;
  label: string;
  bonusCoins: number;
};

/** Catalog price is USD ($0.05 per BAC before the pack discount). */
function usd(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function packPhoto(image?: string, cacheBust?: number) {
  const src = mediaUrl(image);
  if (!src || src.includes('currency.webp') || /bac-coin/i.test(src)) return '';
  if (!cacheBust) return src;
  return `${src}${src.includes('?') ? '&' : '?'}v=${cacheBust}`;
}

function packPayLabel(currency: string, amount: number) {
  if (currency === 'USDT' || currency === 'USD') return `${usd(amount)} USDT`;
  if (currency === 'BDT') return `৳${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `${amount} ${currency}`;
}

export function ShopPage() {
  const { t } = useI18n();
  const { toast, register } = useHud();
  const user = readSessionUser();
  const [packs, setPacks] = useState<ShopPack[] | null>(null);
  const [channels, setChannels] = useState<PayChannel[]>([]);
  const [wallets, setWallets] = useState<BizWallet[]>([]);
  const [rates, setRates] = useState<CoinRate[]>([]);
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
  const [fiatCode, setFiatCode] = useState('BDT');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proof, setProof] = useState(false);
  const [cryptoUntil, setCryptoUntil] = useState(0);
  const [cryptoLeft, setCryptoLeft] = useState(0);
  const [payFilter, setPayFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponErr, setCouponErr] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [packImgEpoch, setPackImgEpoch] = useState(0);

  const reloadCatalog = useCallback(async () => {
    try {
      const p = await fetchShopPacks();
      setPacks(p);
      setPackImgEpoch(Date.now());
    } catch (err) {
      setError(isApiError(err) ? err.message : t('errors.shopOffline'));
    }
  }, [t]);

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
      fetchShopPacks(),
      fetchChannels(),
      fetchMyDeposits(),
      fetchBusinessWallets(),
      fetchCoinRates().catch(() => [] as CoinRate[]),
    ])
      .then(([p, c, d, w, rateRows]) => {
        if (!live) return;
        setPacks(p);
        setPackImgEpoch(Date.now());
        setChannels(c);
        setWallets(w);
        setRates(rateRows);
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

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void reloadCatalog();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [reloadCatalog]);

  const wallet = useMemo(
    () => wallets.find((row) => walletChannelId(row) === channelId),
    [channelId, wallets]
  );
  const channel = useMemo(() => channels.find((c) => c.id === channelId), [channelId, channels]);
  const channelKind = channel ? payKindFromName(channel.channel_name) : null;
  const payCurrency = channelKind === 'crypto' ? 'USDT' : fiatCode;
  const payAmount = useMemo(() => {
    if (!pack) return 0;
    if (payCurrency === 'USDT' || payCurrency === 'USD') return pack.price;
    const pick = (code: string) => {
      const n = rates.find((row) => row.currency?.toUpperCase() === code)?.rate;
      return typeof n === 'number' && n > 0 ? n : 0;
    };
    const usdRate = pick('USDT') || pick('USD') || 0.05;
    const local = pick(payCurrency) || (payCurrency === 'BDT' ? 1 : 0);
    if (!local) return pack.price;
    return Math.round(pack.price * (local / usdRate) * 100) / 100;
  }, [pack, payCurrency, rates]);
  const dueAmount = useMemo(() => {
    if (!appliedCoupon || appliedCoupon.kind !== 'off') return payAmount;
    const cut = Math.min(Math.max(appliedCoupon.value, 0), 90) / 100;
    return Math.round(payAmount * (1 - cut) * 100) / 100;
  }, [appliedCoupon, payAmount]);
  const cryptoPay = channelKind === 'crypto';
  const cryptoExpired = cryptoPay && cryptoUntil > 0 && cryptoLeft <= 0;

  useEffect(() => {
    if (!proof || !cryptoPay || !cryptoUntil) return;
    const tick = () => setCryptoLeft(Math.max(0, cryptoUntil - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [proof, cryptoPay, cryptoUntil]);

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
    if (cryptoExpired) {
      setFieldErr(t('shop.cryptoExpired'));
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
          shop_item_id: pack.id,
          coin_amount: pack.amount,
          payment_amount: payAmount,
          payment_channel: channelId,
          transaction_id: trx.trim(),
          to_wallet_address: wallet?.wallet_address || '',
          from_address: fromAddr.trim(),
          payment_currency: payCurrency,
          user_email: user?.email || '',
          username: user?.username || '',
          ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
        },
        idem
      );
      toast(t('shop.depositOk'));
      setDoneAmt(pack.amount + (appliedCoupon?.bonusCoins || 0));
      setTrx('');
      setFromAddr('');
      setProof(false);
      setDialogOpen(false);
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

  function openBuy(item: ShopPack) {
    setPack(item);
    setProof(false);
    setFieldErr('');
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponErr('');
    if (payFilter) setChannelId(payFilter);
    setDialogOpen(true);
  }

  async function onApplyCoupon() {
    if (!pack) return;
    const code = couponInput.trim();
    if (!code) {
      setCouponErr(t('shop.couponNeed'));
      return;
    }
    setCouponBusy(true);
    setCouponErr('');
    try {
      const quote = await applyShopCoupon(code, pack.amount);
      setAppliedCoupon(quote);
      setCouponInput(quote.code);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponErr(isApiError(err) ? err.message : t('shop.couponFail'));
    } finally {
      setCouponBusy(false);
    }
  }

  function clearShopFilters() {
    setPayFilter('');
    setMinPrice('');
    setMaxPrice('');
  }

  const shown = useMemo(() => {
    const list = packs || [];
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const picked = channels.find((row) => row.id === payFilter);
    const pickedName = picked?.channel_name?.toLowerCase() || '';
    const pickedKind = picked ? payKindFromName(picked.channel_name) : null;
    return list.filter((item) => {
      if (payFilter && item.paymentOptions?.length) {
        const hit = item.paymentOptions.some((option) => {
          const name = option.toLowerCase();
          return name === pickedName || (pickedKind != null && name.includes(pickedKind));
        });
        if (!hit) return false;
      }
      if (minPrice.trim() && Number.isFinite(min) && item.price < min) return false;
      if (maxPrice.trim() && Number.isFinite(max) && item.price > max) return false;
      return true;
    });
  }, [packs, payFilter, minPrice, maxPrice, channels]);

  function closeBuy() {
    if (busy) return;
    setDialogOpen(false);
    setProof(false);
    setCryptoUntil(0);
  }

  useEffect(() => {
    if (!dialogOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeBuy();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogOpen, busy]);

  const quoteRates = ['BDT', 'INR', 'PKR']
    .map((code) => {
      const row = rates.find((rate) => rate.currency?.toUpperCase() === code);
      return row && row.rate > 0 ? { code, rate: row.rate } : null;
    })
    .filter((row): row is { code: string; rate: number } => !!row);

  function channelHint(name: string) {
    const n = name.toLowerCase();
    if (n.includes('usdt') || n.includes('crypto') || n.includes('tether')) return 'cryptocurrency';
    if (n.includes('nagad')) return 'nagad wallet';
    if (n.includes('bkash')) return 'bkash wallet';
    return '';
  }

  const flags: Record<string, string> = { BDT: '🇧🇩', INR: '🇮🇳', PKR: '🇵🇰' };

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
              <strong>{shown.length}</strong>
              <small>{t('shop.packs')}</small>
            </p>
          ) : null}
          <div className="match-actions shop-buy-actions">
            <Link className="btn btn-ghost" to="/user/wallet">
              {t('nav.wallet')}
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
      <div className="shop-buy-layout">
      <section className="shop-filter" aria-label={t('shop.filterPayment')}>
        <span className="visually-hidden">{t('shop.filterPayment')}</span>
        <select
          className={payFilter ? 'has-value' : ''}
          aria-label={t('shop.filterPayment')}
          value={payFilter}
          onChange={(e) => {
            const next = e.target.value;
            setPayFilter(next);
            if (next) setChannelId(next);
          }}
        >
          <option value="">{t('shop.choosePayment')}</option>
          {channels.map((row) => (
            <option key={row.id} value={row.id}>
              {row.channel_name}
            </option>
          ))}
        </select>
        <span className="visually-hidden">{t('shop.filterAmount')}</span>
        <div className="shop-filter-range">
          <InboxField
            label={t('shop.min')}
            placeholder={t('shop.min')}
            inputMode="decimal"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <InboxField
            label={t('shop.max')}
            placeholder={t('shop.max')}
            inputMode="decimal"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <button className="shop-filter-clear" type="button" onClick={clearShopFilters}>
          {t('shop.clear')}
        </button>
      </section>
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
      ) : shown.length === 0 ? (
        <div className="play-empty">
          <h2>{t('shop.noMatch')}</h2>
          <p>{t('shop.noMatchLead')}</p>
          <button className="btn btn-ghost" type="button" onClick={clearShopFilters}>
            {t('shop.clear')}
          </button>
        </div>
      ) : (
        <div className="play-grid shop-grid">
          {shown.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`shop-pack ${dialogOpen && pack?.id === item.id ? 'is-selected' : ''}`}
              onClick={() => openBuy(item)}
            >
              {item.discountPercent ? (
                <span className="shop-pack-off">
                  {item.discountPercent}
                  {t('shop.off')}
                </span>
              ) : null}
              <div className="shop-pack-inner">
                <div className="shop-pack-art" aria-hidden>
                  <span className="shop-pack-glow" />
                  {packPhoto(item.image, packImgEpoch) ? (
                    <img
                      className="shop-pack-photo"
                      src={packPhoto(item.image, packImgEpoch)}
                      alt=""
                      width={128}
                      height={128}
                      decoding="async"
                    />
                  ) : (
                    <img className="shop-pack-hero-coin" src={ASSETS.coin} alt="" width={128} height={128} decoding="async" />
                  )}
                </div>
                <h3 className="shop-pack-title">{Number(item.amount).toLocaleString()} BAC</h3>
                <div className="shop-pack-rule" aria-hidden>
                  <span className="shop-pack-rule-gem" />
                </div>
                <p className="shop-pack-price">
                  <span className="shop-pack-price-main">{usd(item.price)}</span>
                  {item.originalPrice != null && item.originalPrice > item.price ? (
                    <s>{usd(item.originalPrice)}</s>
                  ) : null}
                </p>
                <span className="shop-pack-cta">
                  <svg className="shop-pack-cta-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 .001 3.999A2 2 0 0 0 17 18zM6.2 2h14.5l-1.4 7H7.4L5.8 2zm-1.1-.5L2 4v2h2.2l2.4 12h11.4l2.3-12H6.3L5.1 1.5z"
                    />
                  </svg>
                  {t('shop.select')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>
      </div>
      </div>
      {dialogOpen && pack ? (
        <div className="sec-pay-back" onClick={closeBuy}>
          <div
            className="sec-pay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sec-pay-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="sec-pay-title">{proof ? t('shop.pay') : t('shop.buyDialogTitle')}</h2>
            {proof ? (
              <form className="sec-proof" onSubmit={onSubmit}>
                <div className="xfer-break pack-break">
                  <div>
                    <small>{t('shop.selected')}</small>
                    <strong>
                      <CoinValue value={pack.amount} />
                    </strong>
                  </div>
                  <div>
                    <small>{t('shop.youPay')}</small>
                    <strong>{packPayLabel(payCurrency, dueAmount)}</strong>
                  </div>
                </div>
                {wallet && cryptoPay ? (
                  <div className={`crypto-pay${cryptoExpired ? ' is-expired' : ''}`}>
                    <div className="crypto-timer">
                      <span>{t('shop.cryptoTimer')}</span>
                      <strong>
                        {String(Math.floor(cryptoLeft / 60000)).padStart(2, '0')}:
                        {String(Math.floor((cryptoLeft % 60000) / 1000)).padStart(2, '0')}
                      </strong>
                    </div>
                    {wallet.qr_code ? (
                      <img className="crypto-qr" src={mediaUrl(wallet.qr_code)} alt="" width={200} height={200} />
                    ) : (
                      <p className="sec-muted">{t('shop.cryptoNoQr')}</p>
                    )}
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
                    <ul className="crypto-rules">
                      <li>{t('shop.cryptoRuleNet')}</li>
                      <li>{t('shop.cryptoRuleExact')}</li>
                      <li>{t('shop.cryptoRuleFee')}</li>
                      <li>{t('shop.cryptoRuleOnce')}</li>
                      <li>{t('shop.cryptoRuleTime')}</li>
                    </ul>
                    {cryptoExpired ? <p className="sec-coupon-err">{t('shop.cryptoExpired')}</p> : null}
                  </div>
                ) : wallet ? (
                  <div className="pay-box">
                    <p>
                      {t('shop.sendTo')} <b>{channel?.channel_name}</b> · {payCurrency}
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
                  </div>
                ) : (
                  <p className="sec-muted">{t('shop.noWallet')}</p>
                )}
                <InboxField
                  label={t('shop.from')}
                  placeholder={t('shop.fromPh')}
                  value={fromAddr}
                  onChange={(e) => setFromAddr(e.target.value)}
                  maxLength={120}
                />
                <InboxField
                  label={t('shop.trx')}
                  placeholder={t('shop.trxPh')}
                  value={trx}
                  onChange={(e) => setTrx(e.target.value)}
                  onBlur={(e) => setTrx(e.target.value.trim())}
                  maxLength={80}
                  required
                />
                {fieldErr ? <p className="field-error">{fieldErr}</p> : null}
                <div className="sec-actions">
                  <button className="sec-cancel" type="button" onClick={() => setProof(false)}>
                    {t('shop.dialogBack')}
                  </button>
                  <button className="sec-confirm" type="submit" disabled={busy || cryptoExpired || !channelId || !wallet || !navigator.onLine}>
                    {busy ? t('wallet.submitting') : t('shop.submitDep')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="sec-pay-grid">
                <div>
                  <div className="sec-card">
                    <p className="sec-label">{t('shop.playerEmail')}</p>
                    <p className="sec-email">{user?.email || '—'}</p>
                  </div>
                  <div className="sec-card">
                    <p className="sec-label">{t('shop.coupon')}</p>
                    {appliedCoupon ? (
                      <div className="sec-coupon-on">
                        <span>
                          <b>{appliedCoupon.code}</b>
                          <small>{appliedCoupon.label}</small>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponInput('');
                            setCouponErr('');
                          }}
                        >
                          {t('shop.couponRemove')}
                        </button>
                      </div>
                    ) : (
                      <form
                        className="sec-coupon"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void onApplyCoupon();
                        }}
                      >
                        <input
                          value={couponInput}
                          placeholder={t('shop.couponPh')}
                          maxLength={20}
                          autoComplete="off"
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        />
                        <button type="submit" disabled={couponBusy}>
                          {couponBusy ? '…' : t('shop.couponApply')}
                        </button>
                      </form>
                    )}
                    {couponErr ? <p className="sec-coupon-err">{couponErr}</p> : null}
                  </div>
                  <div className="sec-channels">
                    <h3>{t('shop.channelsTitle')}</h3>
                    <div className="sec-channel-row">
                    {channels.map((c) => {
                      const kind = payKindFromName(c.channel_name);
                      const on = channelId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`sec-ch${on ? ' is-on' : ''}`}
                          aria-pressed={on}
                          onClick={() => setChannelId(c.id)}
                        >
                          {kind ? <PayBrand kind={kind} /> : <span className="pay-brand" />}
                          <span>
                            <b>{c.channel_name}</b>
                            {channelHint(c.channel_name) ? <small>{channelHint(c.channel_name)}</small> : null}
                          </span>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </div>
                <div className="sec-side">
                  <h3>{t('shop.orderSummary')}</h3>
                  <div className="sec-summary">
                    <img src={ASSETS.coin} alt="" width={54} height={54} />
                    <div>
                      <small>{t('shop.coinsLabel')}</small>
                      <strong>{Number(pack.amount).toLocaleString()}</strong>
                    </div>
                  </div>
                  <h3>{t('shop.ratesTitle')}</h3>
                  {quoteRates.map((row) => (
                    <div className="sec-rate" key={row.code}>
                      <span>
                        <i aria-hidden>{flags[row.code] || '•'}</i>
                        {row.code}
                      </span>
                      <b>
                        {row.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                        {t('shop.perCoin')}
                      </b>
                    </div>
                  ))}
                  {channelKind !== 'crypto' ? (
                    <label className="field">
                      <span className="visually-hidden">{t('shop.selectCurrency')}</span>
                      <select
                        aria-label={t('shop.selectCurrency')}
                        value={fiatCode}
                        onChange={(e) => setFiatCode(e.target.value)}
                      >
                        {['BDT', 'INR', 'PKR'].map((code) => (
                          <option key={code} value={code}>
                            {flags[code]} {code}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="sec-muted">USDT</p>
                  )}
                  <div className="sec-actions">
                    <button className="sec-cancel" type="button" onClick={closeBuy}>
                      {t('shop.dialogCancel')}
                    </button>
                    <button
                      className="sec-confirm"
                      type="button"
                      disabled={!channelId || !wallet}
                      onClick={() => {
                        if (!wallet) {
                          toast(t('shop.noWallet'));
                          return;
                        }
                        setFieldErr('');
                        if (channelKind === 'crypto') {
                          const until = Date.now() + 15 * 60 * 1000;
                          setCryptoUntil(until);
                          setCryptoLeft(15 * 60 * 1000);
                        } else {
                          setCryptoUntil(0);
                        }
                        setProof(true);
                      }}
                    >
                      {t('shop.confirmPay')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
