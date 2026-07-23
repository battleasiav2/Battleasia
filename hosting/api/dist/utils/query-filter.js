/**
 * Prevent MongoDB operator injection via query params (e.g. ?status[$ne]=x).
 */
export function safeQueryString(value) {
    if (value == null)
        return undefined;
    if (typeof value === 'object')
        return undefined;
    const str = String(value).trim();
    return str || undefined;
}
export function safeQueryStatus(value, allowed) {
    const str = safeQueryString(value);
    if (!str)
        return undefined;
    return allowed.includes(str) ? str : undefined;
}
export function safeObjectId(value) {
    const str = safeQueryString(value);
    if (!str || !/^[a-f\d]{24}$/i.test(str))
        return undefined;
    return str;
}
export const DEPOSIT_STATUSES = ['pending', 'completed', 'rejected'];
export const WITHDRAWAL_STATUSES = ['pending', 'processing', 'completed', 'rejected'];
export const ORDER_STATUSES = ['pending', 'completed', 'cancelled'];
export const FEED_STATUSES = ['published', 'draft'];
export const SHOP_ITEM_STATUSES = ['available', 'soldout'];
export const CONVERSATION_STATUSES = ['open', 'pending', 'closed'];
