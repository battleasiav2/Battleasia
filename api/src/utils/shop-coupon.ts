import { ShopCoupon, type IShopCoupon } from '../models/ShopCoupon.js';

export class CouponError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export type CouponQuote = {
  code: string;
  kind: 'off' | 'bonus';
  value: number;
  label: string;
  bonusCoins: number;
};

const DEFAULTS: Array<Pick<IShopCoupon, 'code' | 'kind' | 'value' | 'label' | 'minCoins'>> = [
  { code: 'SAVE10', kind: 'off', value: 10, label: '10% off', minCoins: 0 },
  { code: 'EXTRA20', kind: 'bonus', value: 20, label: '+20% BAC', minCoins: 20 },
];

let seeded = false;

export function normalizeCouponCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export async function ensureShopCoupons() {
  if (seeded) return;
  seeded = true;
  await Promise.all(
    DEFAULTS.map((row) =>
      ShopCoupon.updateOne(
        { code: row.code },
        { $setOnInsert: { ...row, maxUses: 0, usedCount: 0, active: true, expiresAt: null } },
        { upsert: true }
      )
    )
  );
}

function bonusCoins(kind: IShopCoupon['kind'], value: number, coinAmount: number) {
  if (kind !== 'bonus') return 0;
  return Math.floor((Math.max(coinAmount, 0) * value) / 100);
}

function toQuote(coupon: IShopCoupon, coinAmount: number): CouponQuote {
  const coins = bonusCoins(coupon.kind, coupon.value, coinAmount);
  return {
    code: coupon.code,
    kind: coupon.kind,
    value: coupon.value,
    label: coupon.label || (coupon.kind === 'off' ? `${coupon.value}% off` : `+${coins} BAC`),
    bonusCoins: coins,
  };
}

function assertUsable(coupon: IShopCoupon, coinAmount: number, now = new Date()) {
  if (!coupon.active) throw new CouponError('Coupon is not active');
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
    throw new CouponError('Coupon expired');
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new CouponError('Coupon is used up');
  }
  if (coinAmount < Math.max(coupon.minCoins, 0)) {
    throw new CouponError(`This pack needs at least ${coupon.minCoins} BAC`);
  }
}

export async function quoteCoupon(rawCode: string, coinAmount: number) {
  const code = normalizeCouponCode(rawCode);
  if (!code) throw new CouponError('Enter a coupon code');
  if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
    throw new CouponError('Pick a coin pack first');
  }
  await ensureShopCoupons();
  const coupon = await ShopCoupon.findOne({ code });
  if (!coupon) throw new CouponError('Coupon not found', 404);
  assertUsable(coupon, coinAmount);
  return toQuote(coupon, coinAmount);
}

/** Holds one use until the deposit is rejected. */
export async function reserveCoupon(rawCode: string, coinAmount: number) {
  const preview = await quoteCoupon(rawCode, coinAmount);
  const now = new Date();
  const updated = await ShopCoupon.findOneAndUpdate(
    {
      code: preview.code,
      active: true,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $or: [{ maxUses: 0 }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }] },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  if (!updated) throw new CouponError('Coupon is used up');
  if (coinAmount < Math.max(updated.minCoins, 0)) {
    await releaseCoupon(preview.code);
    throw new CouponError(`This pack needs at least ${updated.minCoins} BAC`);
  }
  return toQuote(updated, coinAmount);
}

export async function releaseCoupon(code: string) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return;
  await ShopCoupon.updateOne({ code: normalized, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
}

export function discountedPay(amount: number, quote: CouponQuote | null) {
  const base = Number(amount) || 0;
  if (!quote || quote.kind !== 'off') return Math.round(base * 100) / 100;
  const cut = Math.min(Math.max(quote.value, 0), 90) / 100;
  return Math.round(base * (1 - cut) * 100) / 100;
}
