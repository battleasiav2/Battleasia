import type { IDepositHistory } from '../models/DepositHistory.js';
import type { IPaymentChannel } from '../models/PaymentChannel.js';

export function serializeDeposit(
  deposit: IDepositHistory,
  channel?: IPaymentChannel | null
) {
  const ch = channel as (IPaymentChannel & { _id: { toString(): string } }) | null;
  return {
    _id: deposit._id.toString(),
    user_email: deposit.user_email,
    username: deposit.username,
    transaction_id: deposit.transaction_id,
    coin_amount: deposit.coin_amount,
    payment_currency: deposit.payment_currency,
    payment_amount: deposit.payment_amount,
    from_address: deposit.from_address,
    payment_channel: ch
      ? { _id: ch._id.toString(), channel_name: ch.channel_name, icon: ch.icon || '' }
      : { _id: deposit.payment_channel?.toString() || '', channel_name: '', icon: '' },
    to_wallet_address: deposit.to_wallet_address,
    status: deposit.status,
    created_at: deposit.createdAt,
    updated_at: deposit.updatedAt,
    processed_at: deposit.processed_at,
    processed_by: deposit.processed_by?.toString(),
    rejection_reason: deposit.rejection_reason || '',
    notes: deposit.notes || '',
  };
}

export function serializeWithdrawal(withdrawal: import('../models/WithdrawalHistory.js').IWithdrawalHistory) {
  return {
    _id: withdrawal._id.toString(),
    user_email: withdrawal.user_email,
    username: withdrawal.username,
    coin_amount: withdrawal.coin_amount,
    wallet_type: withdrawal.wallet_type,
    wallet_address: withdrawal.wallet_address,
    currency_type: withdrawal.currency_type,
    currency_amount: withdrawal.currency_amount,
    description: withdrawal.description || '',
    status: withdrawal.status,
    created_at: withdrawal.createdAt,
    updated_at: withdrawal.updatedAt,
    processed_at: withdrawal.processed_at,
    processed_by: withdrawal.processed_by?.toString(),
    rejection_reason: withdrawal.rejection_reason || '',
    notes: withdrawal.notes || '',
    transaction_hash: withdrawal.transaction_hash || '',
  };
}

export function serializeShopItem(item: import('../models/ShopItem.js').IShopItem) {
  return {
    _id: item._id.toString(),
    id: item._id.toString(),
    amount: item.amount,
    badge: item.badge,
    price: item.price,
    originalPrice: item.originalPrice,
    discountPercent: item.discountPercent,
    symbol: item.symbol,
    paymentOptions: item.paymentOptions,
    image: item.image || '',
    isActive: item.isActive,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function serializeCoinRate(rate: import('../models/CoinRate.js').ICoinRate) {
  return {
    _id: rate._id.toString(),
    id: rate._id.toString(),
    region: rate.region,
    currency: rate.currency,
    rate: rate.rate,
    isActive: rate.isActive,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
  };
}
