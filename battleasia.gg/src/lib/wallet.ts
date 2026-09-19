import { api, newIdempotencyKey, readAccessToken, readRefreshToken, unwrapData, unwrapList } from './api';
import { isSignedIn } from './auth';
import { withThemeQuery } from './theme';

/** Shop origin — local Vite/Docker on 8083, prod shop.battleasia.gg */
export const SHOP_URL =
  (import.meta.env.VITE_BAC_SHOP_URL as string | undefined) ||
  (import.meta.env.DEV ? 'http://localhost:8083' : 'https://shop.battleasia.gg');

function shopOrigin() {
  try {
    return new URL(SHOP_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost').origin;
  } catch {
    return SHOP_URL.replace(/\/$/, '');
  }
}

function shopPath(path: string) {
  return withThemeQuery(`${shopOrigin()}${path.startsWith('/') ? path : `/${path}`}`);
}

/** Pass player session to shop via hash (ports/domains don't share sessionStorage). */
function withSessionHandoff(url: string) {
  const access = readAccessToken();
  const refresh = readRefreshToken();
  if (!access && !refresh) return url;
  const hash = new URLSearchParams();
  if (access) hash.set('ba_a', access);
  if (refresh) hash.set('ba_r', refresh);
  const base = url.split('#')[0];
  return `${base}#${hash.toString()}`;
}

/** Shop entry — hand off session when signed in; otherwise sign-in without forced reauth. */
export function getBacShopEntryUrl(returnTo = '/user/shop') {
  const dest = returnTo.startsWith('/user') ? returnTo : '/user/shop';
  if (isSignedIn() && (readAccessToken() || readRefreshToken())) {
    return withSessionHandoff(shopPath(dest));
  }
  const target = encodeURIComponent(dest);
  return withThemeQuery(`${shopOrigin()}/auth/sign-in?returnTo=${target}`);
}

export function getBacShopTransferUrl() {
  return withSessionHandoff(shopPath('/user/transfer'));
}

export function getBacShopWalletUrl() {
  return withSessionHandoff(shopPath('/user/wallet'));
}

export function getBacShopWithdrawalUrl() {
  return withSessionHandoff(shopPath('/user/withdrawal'));
}

export function openBacShop(path: 'entry' | 'shop' | 'transfer' | 'wallet' | 'withdrawal' = 'entry') {
  const href =
    path === 'transfer'
      ? getBacShopTransferUrl()
      : path === 'wallet'
        ? getBacShopWalletUrl()
        : path === 'withdrawal'
          ? getBacShopWithdrawalUrl()
          : path === 'shop'
            ? withSessionHandoff(shopPath('/user/shop'))
            : getBacShopEntryUrl();
  window.open(href, '_blank', 'noopener,noreferrer');
}

export type WithdrawableInfo = {
  withdrawableAmount: number;
  hasPendingWithdrawal: boolean;
  totalMatchBets: number;
  alreadyWithdrawn: number;
  balance: number;
  pendingWithdrawalId?: string | null;
};

export type HistoryRow = {
  id: string;
  _id?: string;
  amount: number;
  type: string;
  balanceBefore?: number;
  balanceAfter?: number;
  detail?: Record<string, unknown>;
  createdAt?: string;
};

export type ShopPack = {
  id: string;
  _id?: string;
  amount: number;
  badge?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  symbol?: string;
  paymentOptions?: string[];
  image?: string;
};

export type CoinRate = {
  id?: string;
  region?: string;
  currency: string;
  rate: number;
};

export type PayChannel = {
  id: string;
  _id?: string;
  channel_name: string;
  description?: string;
  icon?: string;
};

export type BizWallet = {
  id: string;
  _id?: string;
  wallet_address: string;
  currency_type?: string;
  qr_code?: string;
  channel_id?: { _id?: string; channel_name?: string } | string;
};

export type TransferSettings = {
  enabled: boolean;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
};

export type TransferRow = {
  id: string;
  direction?: string;
  senderUsername?: string;
  recipientUsername?: string;
  counterpartyUsername?: string;
  amount: number;
  feeAmount?: number;
  totalDebited?: number;
  note?: string;
  createdAt?: string;
};

function nid(item: { id?: string; _id?: string }) {
  return item.id || item._id || '';
}

export async function fetchWithdrawable() {
  const payload = await api('/api/v2/users/withdrawable-amount');
  return unwrapData<WithdrawableInfo>(payload);
}

export async function fetchBalanceHistory(page = 1) {
  const payload = await api(`/api/v2/users/balance-history?page=${page}&limit=20`);
  return unwrapList<HistoryRow>(payload).map((row) => ({ ...row, id: nid(row) }));
}

export async function fetchShopPacks() {
  const payload = await api('/api/v4/shop/items?limit=24');
  return unwrapList<ShopPack>(payload).map((row) => ({ ...row, id: nid(row) }));
}

export async function fetchCoinRates() {
  const payload = await api('/api/v4/shop/coins/public');
  const data = unwrapData<CoinRate[] | { results?: CoinRate[] }>(payload);
  const list = Array.isArray(data) ? data : data?.results || [];
  return list;
}

export async function fetchChannels() {
  const payload = await api('/api/v4/payments/payment-channels/public?limit=20');
  return unwrapList<PayChannel>(payload).map((row) => ({ ...row, id: nid(row) }));
}

export async function fetchBusinessWallets(channelId?: string) {
  const q = channelId ? `?channelId=${encodeURIComponent(channelId)}&limit=20` : '?limit=20';
  const payload = await api(`/api/v4/payments/business-wallets/public${q}`);
  return unwrapList<BizWallet>(payload).map((row) => ({ ...row, id: nid(row) }));
}

export function walletChannelId(wallet: BizWallet) {
  const channel = wallet.channel_id;
  if (!channel) return '';
  if (typeof channel === 'string') return channel;
  return channel._id || '';
}

export function firstChannelWithWallet(channels: PayChannel[], wallets: BizWallet[]) {
  const ids = new Set(wallets.map(walletChannelId).filter(Boolean));
  return channels.find((channel) => ids.has(channel.id))?.id || channels[0]?.id || '';
}

export async function submitDeposit(body: Record<string, string | number>, key = newIdempotencyKey()) {
  const payload = await api('/api/v4/payments/deposit-history/submit', {
    method: 'POST',
    body: JSON.stringify(body),
    idempotencyKey: key,
  });
  return unwrapData(payload);
}

export async function submitWithdraw(body: Record<string, string | number>, key = newIdempotencyKey()) {
  const payload = await api('/api/v4/payments/withdrawal-history/submit', {
    method: 'POST',
    body: JSON.stringify(body),
    idempotencyKey: key,
  });
  return unwrapData(payload);
}

export async function fetchMyDeposits() {
  const payload = await api('/api/v4/payments/deposit-history/my-history?limit=10');
  return unwrapList<Record<string, unknown>>(payload);
}

export async function fetchTransferSettings() {
  const payload = await api('/api/v2/users/transfer/settings');
  return unwrapData<TransferSettings>(payload);
}

export async function sendTip(recipientUsername: string, amount: number, key = newIdempotencyKey()) {
  const payload = await api('/api/v2/users/tip', {
    method: 'POST',
    body: JSON.stringify({ recipientUsername, amount }),
    idempotencyKey: key,
  });
  return unwrapData<TransferRow>(payload);
}

export async function sendTransfer(
  recipientUsername: string,
  amount: number,
  note: string,
  key = newIdempotencyKey()
) {
  const payload = await api('/api/v2/users/transfer', {
    method: 'POST',
    body: JSON.stringify({ recipientUsername, amount, note: note.slice(0, 200) }),
    idempotencyKey: key,
  });
  return unwrapData<TransferRow>(payload);
}

export async function fetchTransferHistory() {
  const payload = await api('/api/v2/users/transfer/history?limit=20');
  return unwrapList<TransferRow>(payload).map((row) => ({ ...row, id: nid(row) }));
}

export function fiatFor(balance: number, rates: CoinRate[], currency: string) {
  const rate = rates.find((r) => r.currency?.toUpperCase() === currency.toUpperCase());
  if (!rate || !rate.rate) return null;
  return balance * rate.rate;
}
