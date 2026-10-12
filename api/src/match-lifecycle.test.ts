import assert from 'node:assert/strict';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { LedgerEntry } from './models/LedgerEntry.js';
import { Match } from './models/Match.js';
import { MatchParticipant } from './models/MatchParticipant.js';
import { User } from './models/User.js';
import { requireAdmin } from './middleware/admin.js';
import matchRoutes from './routes/v3/games/matches.js';
import { signAccessToken } from './utils/jwt.js';
import { joinPaidMatch } from './utils/money.js';

function listen(app: express.Express) {
  const server = http.createServer(app);
  return new Promise<{ server: http.Server; base: string }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Test server did not bind');
      resolve({ server, base: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function makeMatch(opts: { entryFee: number; matchType?: 'free' | 'paid'; status?: string }) {
  return Match.create({
    gameId: new mongoose.Types.ObjectId(),
    roomId: `room-${Date.now()}-${Math.random()}`,
    matchName: 'Lifecycle lobby',
    matchSchedule: new Date().toISOString(),
    entryFee: opts.entryFee,
    totalPlayer: 8,
    matchType: opts.matchType ?? 'paid',
    status: opts.status ?? 'active',
    map: 'Erangel',
    teamType: 'solo',
  });
}

describe('match cancel, delete, and complete money safety', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';
  let adminToken = '';
  let playerN = 0;

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping match lifecycle tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-match-life-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    const admin = await User.create({
      email: 'match-life-admin@test.local',
      username: 'matchlifeadmin',
      password: 'hashed',
      balance: 0,
      role: { type: 'admin', name: 'admin', permissions: [] },
    });
    adminToken = signAccessToken(String(admin._id), 0);

    const app = express();
    app.use(express.json());
    app.use('/api/v3/games/matches', requireAdmin, matchRoutes);
    const listening = await listen(app);
    server = listening.server;
    base = listening.base;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
    await mongoose.disconnect();
    if (replset) await replset.stop();
  });

  async function player(balance: number) {
    playerN += 1;
    return User.create({
      email: `life${playerN}@test.local`,
      username: `lifeplayer${playerN}`,
      password: 'hashed',
      pubgId: `lifepubg${playerN}`,
      balance,
    });
  }

  async function call(method: string, urlPath: string, body?: unknown) {
    const response = await fetch(`${base}${urlPath}`, {
      method,
      headers: {
        authorization: `Bearer ${adminToken}`,
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await response.json()) as { status?: boolean; message?: string; data?: { status?: string; entriesRefunded?: boolean; winningsDistributed?: boolean } };
    return { status: response.status, json };
  }

  it('refunds a paid entry once when a match is cancelled, including a retry', async () => {
    const user = await player(100);
    const match = await makeMatch({ entryFee: 25 });
    await joinPaidMatch({ userId: String(user._id), matchId: String(match._id), idempotencyKey: `join-cancel-${playerN}` });

    const first = await call('PUT', `/api/v3/games/matches/${match._id}`, { status: 'cancel' });
    assert.equal(first.status, 200);
    assert.equal(first.json.data?.status, 'cancel');
    const stored = await Match.findById(match._id);
    assert.equal(stored?.entriesRefunded, true);

    const after = await User.findById(user._id);
    assert.equal(after?.balance, 100);
    const participant = await MatchParticipant.findOne({ matchId: match._id, userId: user._id });
    assert.ok(participant);

    const second = await call('PUT', `/api/v3/games/matches/${match._id}`, { status: 'cancel' });
    assert.equal(second.status, 200);
    const retried = await User.findById(user._id);
    assert.equal(retried?.balance, 100);

    const refundAgain = await call('POST', `/api/v3/games/matches/${match._id}/refund`);
    assert.equal(refundAgain.status, 400);
    const reversals = await LedgerEntry.countDocuments({ refType: 'match_join_reversal', refId: String(match._id) });
    assert.equal(reversals, 1);
  });

  it('refuses to delete a paid match until the entry is refunded', async () => {
    const user = await player(80);
    const match = await makeMatch({ entryFee: 20 });
    await joinPaidMatch({ userId: String(user._id), matchId: String(match._id), idempotencyKey: `join-delete-${playerN}` });

    const blocked = await call('DELETE', `/api/v3/games/matches/${match._id}`);
    assert.equal(blocked.status, 400);
    assert.match(blocked.json.message || '', /Refund paid entries/);
    assert.ok(await Match.findById(match._id));
    assert.ok(await MatchParticipant.findOne({ matchId: match._id }));
    const stillHeld = await User.findById(user._id);
    assert.equal(stillHeld?.balance, 60);

    const cancelled = await call('PUT', `/api/v3/games/matches/${match._id}`, { status: 'cancel' });
    assert.equal(cancelled.status, 200);
    const refunded = await User.findById(user._id);
    assert.equal(refunded?.balance, 80);

    const removed = await call('DELETE', `/api/v3/games/matches/${match._id}`);
    assert.equal(removed.status, 200);
    assert.equal(await Match.findById(match._id), null);
    const missing = await call('DELETE', `/api/v3/games/matches/${match._id}`);
    assert.equal(missing.status, 404);
    const afterDelete = await User.findById(user._id);
    assert.equal(afterDelete?.balance, 80);
  });

  it('refuses to mark a paid match complete until prizes are distributed once', async () => {
    const user = await player(100);
    const match = await makeMatch({ entryFee: 25 });
    await joinPaidMatch({ userId: String(user._id), matchId: String(match._id), idempotencyKey: `join-pay-${playerN}` });
    const part = await MatchParticipant.findOne({ matchId: match._id, userId: user._id });
    match.results = [
      { participantId: part!._id, status: 'winner', winPrize: 18, bonus: 0, placePoint: 0, kills: 1, points: 0 },
    ];
    await match.save();

    const blocked = await call('PUT', `/api/v3/games/matches/${match._id}`, { status: 'complete' });
    assert.equal(blocked.status, 400);
    assert.match(blocked.json.message || '', /Distribute winnings/);
    const held = await User.findById(user._id);
    assert.equal(held?.balance, 75);
    const stillOpen = await Match.findById(match._id);
    assert.equal(stillOpen?.status, 'active');
    assert.equal(stillOpen?.winningsDistributed, false);

    const paid = await call('POST', `/api/v3/games/matches/${match._id}/distribute-winnings`);
    assert.equal(paid.status, 200);
    assert.equal(paid.json.data?.status, 'complete');
    const distributed = await Match.findById(match._id);
    assert.equal(distributed?.winningsDistributed, true);
    const credited = await User.findById(user._id);
    assert.equal(credited?.balance, 93);

    const again = await call('POST', `/api/v3/games/matches/${match._id}/distribute-winnings`);
    assert.equal(again.status, 400);
    const stillOnce = await User.findById(user._id);
    assert.equal(stillOnce?.balance, 93);

    const completed = await call('PUT', `/api/v3/games/matches/${match._id}`, { status: 'complete' });
    assert.equal(completed.status, 200);
    const cancelAfterPay = await call('PUT', `/api/v3/games/matches/${match._id}`, { status: 'cancel' });
    assert.equal(cancelAfterPay.status, 400);
    assert.match(cancelAfterPay.json.message || '', /Cannot refund after winnings/);
    const unchanged = await User.findById(user._id);
    assert.equal(unchanged?.balance, 93);
    const stored = await Match.findById(match._id);
    assert.equal(stored?.status, 'complete');
    assert.equal(stored?.winningsDistributed, true);
  });

  it('allows complete and delete only when a free match has nothing left to settle', async () => {
    const empty = await makeMatch({ entryFee: 0, matchType: 'free' });
    const completed = await call('PUT', `/api/v3/games/matches/${empty._id}`, { status: 'complete' });
    assert.equal(completed.status, 200);
    const removed = await call('DELETE', `/api/v3/games/matches/${empty._id}`);
    assert.equal(removed.status, 200);

    const prized = await makeMatch({ entryFee: 0, matchType: 'free' });
    prized.results = [
      {
        participantId: new mongoose.Types.ObjectId(),
        status: 'winner',
        winPrize: 10,
        bonus: 0,
        placePoint: 0,
        kills: 0,
        points: 0,
      },
    ];
    await prized.save();
    const blockedComplete = await call('PUT', `/api/v3/games/matches/${prized._id}`, { status: 'complete' });
    assert.equal(blockedComplete.status, 400);
    const blockedDelete = await call('DELETE', `/api/v3/games/matches/${prized._id}`);
    assert.equal(blockedDelete.status, 400);
    assert.ok(await Match.findById(prized._id));
  });
});
