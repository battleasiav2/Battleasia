export function extractHashtags(text: string) {
  const matches = text.match(/#[\w\u0980-\u09FF]+/g);
  return matches ? [...new Set(matches.map((t) => t.slice(1).toLowerCase()))] : [];
}

export function extractMentions(text: string) {
  const matches = text.match(/@[\w.]+/g);
  return matches ? [...new Set(matches.map((t) => t.slice(1).toLowerCase()))] : [];
}

/** Money POSTs must not mint a new Idempotency-Key after timeout until status is known. */
export function keepIdempotencyKey(status?: number) {
  return status === undefined || status >= 500;
}

export function splitCaption(text: string) {
  return text.split(/(#[\w\u0980-\u09FF]+|@[\w.]+)/g).filter(Boolean);
}
