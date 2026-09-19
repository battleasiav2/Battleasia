import { describe, expect, it } from 'vitest';
import { newIdempotencyKey } from './api';
import { mapPulse } from './dashboard';
import { extractHashtags, extractMentions, keepIdempotencyKey, splitCaption } from './text';

describe('mapPulse', () => {
  it('reads nested platform counts and stays at 0 when empty', () => {
    const empty = mapPulse({});
    expect(empty).toMatchObject({ todayJoins: 0, winnings: 0, ongoing: 0 });
    expect(empty.ongoingMatches).toHaveLength(5);
    expect(
      mapPulse({
        data: { platform: { todayJoinedUsers: 4, processedMatches: 9, ongoingMatches: 2, totalWinnings: 150 } },
      }),
    ).toMatchObject({ todayJoins: 4, matches: 9, ongoing: 2, winnings: 150 });
  });
});

describe('idempotency', () => {
  it('emits unique keys', () => {
    expect(newIdempotencyKey()).not.toBe(newIdempotencyKey());
  });

  it('keeps the same key after timeout or 5xx until the money POST status is known', () => {
    expect(keepIdempotencyKey(undefined)).toBe(true);
    expect(keepIdempotencyKey(503)).toBe(true);
    expect(keepIdempotencyKey(409)).toBe(false);
    expect(keepIdempotencyKey(200)).toBe(false);
  });
});

describe('caption parse', () => {
  it('extracts unique hashtags and mentions', () => {
    expect(extractHashtags('won #PUBG #pubg dinner @AsiaChamp')).toEqual(['pubg']);
    expect(extractMentions('gg @AsiaChamp @asia.champ')).toEqual(['asiachamp', 'asia.champ']);
    expect(splitCaption('#squad drop')).toEqual(['#squad', ' drop']);
  });
});
