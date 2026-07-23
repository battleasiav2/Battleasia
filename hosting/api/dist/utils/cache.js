const store = new Map();
export function getCached(key) {
    const entry = store.get(key);
    if (!entry)
        return null;
    if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return null;
    }
    return entry.data;
}
export function setCached(key, data, ttlMs) {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
}
export function invalidateCache(key) {
    store.delete(key);
}
