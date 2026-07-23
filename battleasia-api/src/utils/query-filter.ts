/**
 * Prevent MongoDB operator injection via query params (e.g. ?status[$ne]=x).
 */
export function safeQueryString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'object') return undefined;
  const str = String(value).trim();
  return str || undefined;
}

export function safeQueryStatus(value: unknown, allowed: readonly string[]): string | undefined {
  const str = safeQueryString(value);
  if (!str) return undefined;
  return allowed.includes(str) ? str : undefined;
}

export function safeObjectId(value: unknown): string | undefined {
  const str = safeQueryString(value);
  if (!str || !/^[a-f\d]{24}$/i.test(str)) return undefined;
  return str;
}

export const DEPOSIT_STATUSES = ['pending', 'completed', 'rejected'] as const;
export const WITHDRAWAL_STATUSES = ['pending', 'processing', 'completed', 'rejected'] as const;
export const ORDER_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export const FEED_STATUSES = ['published', 'draft'] as const;
export const SHOP_ITEM_STATUSES = ['available', 'soldout'] as const;
export const CONVERSATION_STATUSES = ['open', 'pending', 'closed'] as const;
