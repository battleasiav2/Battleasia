import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decodeToken,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from './utils/jwt.js';

describe('jwt access / refresh', () => {
  it('signs an access token with typ and ver', () => {
    const token = signAccessToken('user-1', 3);
    const payload = verifyToken(token);
    assert.equal(payload?.userId, 'user-1');
    assert.equal(payload?.typ, 'access');
    assert.equal(payload?.ver, 3);
  });

  it('signs a refresh token that is not an access token', () => {
    const token = signRefreshToken('user-2', 1);
    const payload = verifyToken(token);
    assert.equal(payload?.typ, 'refresh');
    assert.equal(payload?.userId, 'user-2');
  });

  it('rejects a junk token', () => {
    assert.equal(verifyToken('not-a-jwt'), null);
    assert.equal(decodeToken('not-a-jwt'), null);
  });
});
