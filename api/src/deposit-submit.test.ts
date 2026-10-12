import assert from 'node:assert/strict';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { CoinRate } from './models/CoinRate.js';
import { DepositHistory } from './models/DepositHistory.js';
import { LedgerEntry } from './models/LedgerEntry.js';
import { PaymentChannel } from './models/PaymentChannel.js';
import { ShopItem } from './models/ShopItem.js';
import { User } from './models/User.js';
import depositRoutes from './routes/v4/payments/deposit-history.js';
import { signAccessToken } from './utils/jwt.js';

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

describe('deposit submission amount and idempotency', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';
  let playerToken = '';
  let adminToken = '';
  let playerId = '';
  let channelId = '';
  let packId = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping deposit submission tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-deposit-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());
    await DepositHistory.syncIndexes();

    const player = await User.create({
      email: 'depositor@test.local',
      username: 'depositor',
      password: 'hashed',
      balance: 0,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const admin = await User.create({
      email: 'deposit-admin@test.local',
      username: 'depositadmin',
      password: 'hashed',
      balance: 0,
      role: { type: 'admin', name: 'admin', permissions: [] },
    });
    playerId = String(player._id);
    playerToken = signAccessToken(playerId, 0);
    adminToken = signAccessToken(String(admin._id), 0);

    const channel = await PaymentChannel.create({ channel_name: 'bKash', enabled: true });
    channelId = String(channel._id);
    const pack = await ShopItem.create({
      amount: 100,
      price: 5,
      originalPrice: 5,
      symbol: 'BAC',
      isActive: true,
      status: 'available',
    });
    packId = String(pack._id);
    await CoinRate.create({ region: 'bangladesh', currency: 'BDT', rate: 1, isActive: true });
    await CoinRate.create({ region: 'global', currency: 'USD', rate: 0.05, isActive: true });

    const app = express();
    app.use(express.json());
    app.use('/api/v4/payments/deposit-history', depositRoutes);
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

  function submit(body: Record<string, unknown>, key: string, token = playerToken) {
    return fetch(`${base}/api/v4/payments/deposit-history/submit`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'idempotency-key': key,
      },
      body: JSON.stringify({
        shop_item_id: packId,
        payment_channel: channelId,
        payment_currency: 'BDT',
        transaction_id: `trx-${key}`,
        coin_amount: 100,
        payment_amount: 100,
        ...body,
      }),
    });
  }

  it('stores the catalog pack amount and does not credit the wallet when the client tampers the amount', async () => {
    const response = await submit(
      { coin_amount: 1_000_000, payment_amount: 0.01, transaction_id: 'trx-tamper' },
      'idem-tamper',
    );
    assert.equal(response.status, 201);
    const json = (await response.json()) as { data?: { coin_amount?: number; payment_amount?: number; status?: string } };
    assert.equal(json.data?.coin_amount, 100);
    assert.equal(json.data?.payment_amount, 100);
    assert.equal(json.data?.status, 'pending');
    const user = await User.findById(playerId);
    assert.equal(user?.balance, 0);
    const rows = await DepositHistory.find({ transaction_id: 'trx-tamper' });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.coin_amount, 100);
  });

  it('returns the original deposit for the same idempotency key and rejects a reused transaction id', async () => {
    const first = await submit({ transaction_id: 'trx-once', coin_amount: 100 }, 'idem-once');
    assert.equal(first.status, 201);
    const firstBody = (await first.json()) as { data?: { _id?: string; coin_amount?: number } };

    const replay = await submit({ transaction_id: 'trx-other', coin_amount: 1_000_000 }, 'idem-once');
    assert.equal(replay.status, 200);
    const replayBody = (await replay.json()) as { data?: { _id?: string; coin_amount?: number } };
    assert.equal(replayBody.data?._id, firstBody.data?._id);
    assert.equal(replayBody.data?.coin_amount, 100);
    assert.equal(await DepositHistory.countDocuments({ idempotencyKey: 'idem-once' }), 1);

    const reused = await submit({ transaction_id: 'trx-once', coin_amount: 100 }, 'idem-other');
    assert.equal(reused.status, 409);
    assert.equal(await DepositHistory.countDocuments({ transaction_id: 'trx-once' }), 1);
    const user = await User.findById(playerId);
    assert.equal(user?.balance, 0);
  });

  it('lets only one concurrent submission keep a transaction id', async () => {
    const responses = await Promise.all(
      [1, 2, 3, 4, 5, 6].map((n) => submit({ transaction_id: 'trx-race' }, `idem-race-${n}`)),
    );
    const statuses = responses.map((response) => response.status).sort();
    assert.deepEqual(statuses, [201, 409, 409, 409, 409, 409]);
    assert.equal(await DepositHistory.countDocuments({ transaction_id: 'trx-race' }), 1);
    const user = await User.findById(playerId);
    assert.equal(user?.balance, 0);

    const sameKey = await Promise.all([1, 2, 3, 4].map(() => submit({ transaction_id: 'trx-same-key' }, 'idem-same')));
    assert.ok(sameKey.every((response) => response.status === 200 || response.status === 201));
    assert.equal(await DepositHistory.countDocuments({ idempotencyKey: 'idem-same' }), 1);
  });

  it('credits the catalog amount once when an admin approves the deposit', async () => {
    const submitted = await submit({ transaction_id: 'trx-approve' }, 'idem-approve');
    assert.equal(submitted.status, 201);
    const body = (await submitted.json()) as { data?: { _id?: string } };
    const id = body.data?._id;
    assert.ok(id);

    const approve = await fetch(`${base}/api/v4/payments/deposit-history/${id}/approve`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminToken}`, 'idempotency-key': 'approve-once' },
    });
    assert.equal(approve.status, 200);
    const credited = await User.findById(playerId);
    assert.equal(credited?.balance, 100);

    const again = await fetch(`${base}/api/v4/payments/deposit-history/${id}/approve`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminToken}`, 'idempotency-key': 'approve-twice' },
    });
    assert.equal(again.status, 400);
    const still = await User.findById(playerId);
    assert.equal(still?.balance, 100);
    assert.equal(await LedgerEntry.countDocuments({ refType: 'deposit_approve', refId: id }), 1);
  });
});
