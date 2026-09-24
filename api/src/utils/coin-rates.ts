import { CoinRate } from '../models/CoinRate.js';

/** Fiat units per 1 BAC. Base rule: 1 BAC = 1 BDT; others ≈ FX from BDT (admin-editable). */
export const DEFAULT_COIN_RATES: Array<{
  region: string;
  currency: string;
  rate: number;
  isBase?: boolean;
}> = [
  { region: 'bangladesh', currency: 'BDT', rate: 1, isBase: true },
  { region: 'india', currency: 'INR', rate: 0.77 },
  { region: 'pakistan', currency: 'PKR', rate: 2.5 },
  { region: 'nepal', currency: 'NPR', rate: 1.23 },
  { region: 'sri-lanka', currency: 'LKR', rate: 2.5 },
  { region: 'malaysia', currency: 'MYR', rate: 0.037 },
  { region: 'indonesia', currency: 'IDR', rate: 133 },
  { region: 'philippines', currency: 'PHP', rate: 0.48 },
  { region: 'vietnam', currency: 'VND', rate: 213 },
  { region: 'thailand', currency: 'THB', rate: 0.29 },
  { region: 'uae', currency: 'AED', rate: 0.031 },
  { region: 'saudi', currency: 'SAR', rate: 0.031 },
  { region: 'global', currency: 'USD', rate: 0.0083 },
  { region: 'global', currency: 'EUR', rate: 0.0077 },
  { region: 'global', currency: 'GBP', rate: 0.0065 },
];

/**
 * Ensure country rates exist. Always pins BDT to 1 BAC = 1 BDT.
 * Missing currencies are created from defaults; existing non-BDT rates are left for admin.
 */
export async function ensureCoinRates() {
  let created = 0;
  let updated = 0;

  for (const row of DEFAULT_COIN_RATES) {
    const currency = row.currency.toUpperCase();
    const region = row.region.toLowerCase();
    const existing = await CoinRate.findOne({ region, currency });

    if (!existing) {
      await CoinRate.create({
        region,
        currency,
        rate: row.rate,
        isActive: true,
      });
      created += 1;
      continue;
    }

    // Base lock: 1 BAC = 1 BDT
    if (currency === 'BDT' && existing.rate !== 1) {
      existing.rate = 1;
      existing.isActive = true;
      await existing.save();
      updated += 1;
    }
  }

  // Also fix any other BDT row (wrong region naming)
  const bdtRows = await CoinRate.find({ currency: 'BDT' });
  for (const row of bdtRows) {
    if (row.rate !== 1) {
      row.rate = 1;
      row.isActive = true;
      await row.save();
      updated += 1;
    }
  }

  if (created || updated) {
    console.log(`Coin rates ensured (1 BAC = 1 BDT): created=${created}, updated=${updated}`);
  }
}
