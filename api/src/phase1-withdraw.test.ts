import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { BalanceHistory } from './models/BalanceHistory.js';
import { CoingoTransaction } from './models/CoingoTransaction.js';
import { LedgerEntry } from './models/LedgerEntry.js';
import { User } from './models/User.js';
import { WithdrawalHistory } from './models/WithdrawalHistory.js';
import coingoRoutes from './routes/v4/payments/coingo.js';
import v3CoinRoutes from './routes/v3/shop/coins.js';
import withdrawalRoutes from './routes/v4/payments/withdrawal-history.js';
import { signAccessToken } from './utils/jwt.js';
import {
  approveWithdrawMoney,
  completeWithdrawMoney,
  refundWithdrawMoney,
} from './utils/money.js';

const repoRoot = path.resolve(process.cwd(), '..');

function readRepo(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('phase 1 client withdrawal calls', () => {
  it('shop wallet submits the manual withdrawal once', () => {
    const source = readRepo('shop.battleasia.gg/src/pages/user/Wallet.tsx');
    assert.equal(source.includes('submitCoingoPayout'), false);
    assert.equal(source.split('submitWithdraw(').length - 1, 1);
  });

  it('APK withdraw screens do not call Coingo before the manual request', () => {
    const shop = readRepo('battleasia-app/lib/presentation/screens/shop/shop_withdrawal_screen.dart');
    const sheet = readRepo('battleasia-app/lib/presentation/widgets/wallet/withdraw_sheet.dart');
    assert.equal(shop.includes('createCoingoPayout'), false);
    assert.equal(sheet.includes('createCoingoPayout'), false);
    assert.equal(shop.split('submitWithdrawal(').length - 1, 1);
    assert.equal(sheet.split('submitWithdrawal(').length - 1, 1);
  });

  it('APK manual submit accepts HTTP 200 and 201', () => {
    const source = readRepo('battleasia-app/lib/core/services/user_service.dart');
    assert.match(source, /response\.statusCode == 200 \|\| response\.statusCode == 201/);
  });
});

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

describe('phase 1 capabilities', () => {
  it('reports automated payout and collection as unavailable', async () => {
    const app = express();
    app.use('/api/v4/payments/coingo', coingoRoutes);
    const { server, base } = await listen(app);
    try {
      const response = await fetch(`${base}/api/v4/payments/coingo/capabilities`);
      const body = (await response.json()) as {
        status: boolean;
        data: { mockMode: boolean; automatedPayout: boolean; automatedCollection: boolean; checklist: string[] };
      };
      assert.equal(response.status, 200);
      assert.equal(body.status, true);
      assert.equal(body.data.mockMode, false);
      assert.equal(body.data.automatedPayout, false);
      assert.equal(body.data.automatedCollection, false);
      assert.match(body.data.checklist.join(' '), /not active/i);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});

describe('phase 1 withdrawal safety', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping Phase 1 database tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-phase1-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());
    await WithdrawalHistory.syncIndexes();

    const app = express();
    app.use(express.json());
    app.use('/api/v4/payments/coingo', coingoRoutes);
    app.use('/api/v3/shop/coins', v3CoinRoutes);
    app.use('/api/v4/payments/withdrawal-history', withdrawalRoutes);
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

  async function makeUser(n: number, balance: number, bets: number) {
    const user = await User.create({
      email: `phase1-${n}@test.local`,
      username: `phase1player${n}`,
      password: 'hashed',
      balance,
      kycStatus: 'approved',
      dateOfBirth: new Date('1990-01-01'),
    });
    if (bets > 0) {
      await BalanceHistory.create({
        userId: user._id,
        username: user.username,
        email: user.email,
        amount: bets,
        type: 'withdraw',
        balanceBefore: balance + bets,
        balanceAfter: balance,
        detail: { reason: 'match_entry_fee' },
      });
    }
    return user;
  }

  function authHeaders(userId: string, idempotencyKey?: string) {
    return {
      Authorization: `Bearer ${signAccessToken(userId, 0)}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    };
  }

  it('manual submit holds once, rejects a duplicate, and rejects insufficient withdrawable balance', async () => {
    const user = await makeUser(1, 100, 100);
    const headers = authHeaders(String(user._id), 'phase1-submit-1');
    const first = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        coin_amount: 25,
        wallet_address: '01700000000',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    const firstBody = (await first.json()) as { status: boolean; data: { status: string } };
    assert.equal(first.status, 200);
    assert.equal(firstBody.status, true);
    assert.equal(firstBody.data.status, 'pending');
    const held = await User.findById(user._id);
    assert.equal(held?.balance, 75);

    const second = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        coin_amount: 25,
        wallet_address: '01700000000',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    assert.equal(second.status, 400);
    const afterDuplicate = await User.findById(user._id);
    assert.equal(afterDuplicate?.balance, 75);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 1);

    const poor = await makeUser(2, 10, 100);
    const denied = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(poor._id), 'phase1-submit-poor'),
      body: JSON.stringify({
        coin_amount: 25,
        wallet_address: '01700000001',
        wallet_type: 'nagad',
        currency_type: 'BDT',
      }),
    });
    assert.equal(denied.status, 400);
    const poorFresh = await User.findById(poor._id);
    assert.equal(poorFresh?.balance, 10);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: poor._id }), 0);
  });

  it('does not hold BAC when automated payout or collection is requested', async () => {
    const user = await makeUser(3, 80, 100);
    const beforeCount = await WithdrawalHistory.countDocuments({ userId: user._id });
    const payout = await fetch(`${base}/api/v4/payments/coingo/payout`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'phase1-coingo'),
      body: JSON.stringify({ amount: 20, walletNumber: '01700000002', walletType: 'bkash', currency_type: 'BDT' }),
    });
    assert.equal(payout.status, 400);
    const v3 = await fetch(`${base}/api/v3/shop/coins/payout`, {
      method: 'POST',
      headers: authHeaders(String(user._id)),
      body: JSON.stringify({ amount: 20, walletNumber: '01700000002', walletType: 'bkash' }),
    });
    assert.equal(v3.status, 400);
    const collection = await fetch(`${base}/api/v4/payments/coingo/collection/start`, {
      method: 'POST',
      headers: authHeaders(String(user._id)),
      body: JSON.stringify({ amount: 20, walletNumber: '01700000002', walletType: 'bkash' }),
    });
    assert.equal(collection.status, 400);
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 80);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), beforeCount);
    assert.equal(await CoingoTransaction.countDocuments({ userId: user._id }), 0);
  });

  it('does not mark a pending Coingo payout successful when status is polled', async () => {
    const user = await makeUser(4, 40, 0);
    const tx = await CoingoTransaction.create({
      merchantSerialNo: `POUT-PHASE1-${Date.now()}`,
      userId: user._id,
      type: 'payout',
      amount: 15,
      walletNumber: '01700000003',
      walletType: 'bkash',
      status: 'pending',
      pollCount: 0,
    });
    const headers = authHeaders(String(user._id));
    const first = await fetch(`${base}/api/v4/payments/coingo/payout/${tx.merchantSerialNo}/status`, { headers });
    const second = await fetch(`${base}/api/v3/shop/coins/payout/${tx.merchantSerialNo}`, { headers });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    const saved = await CoingoTransaction.findById(tx._id);
    assert.equal(saved?.status, 'pending');
    assert.equal(saved?.pollCount, 0);
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 40);
  });

  it('approves and completes a held withdrawal without a second debit', async () => {
    const user = await makeUser(5, 100, 100);
    const response = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'phase1-complete'),
      body: JSON.stringify({
        coin_amount: 30,
        wallet_address: '01700000004',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as { data: { _id: string } };
    const approved = await approveWithdrawMoney({ withdrawalId: body.data._id, idempotencyKey: 'phase1-approve' });
    assert.equal(approved.balance, 70);
    const processing = await WithdrawalHistory.findById(body.data._id);
    assert.equal(processing?.status, 'processing');
    const completed = await completeWithdrawMoney({
      withdrawalId: body.data._id,
      transactionHash: 'staff-ref',
      idempotencyKey: 'phase1-complete-ledger',
    });
    assert.equal(completed.balance, 70);
    const done = await WithdrawalHistory.findById(body.data._id);
    assert.equal(done?.status, 'completed');
  });

  it('refunds a rejection once', async () => {
    const user = await makeUser(6, 90, 100);
    const response = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'phase1-reject'),
      body: JSON.stringify({
        coin_amount: 20,
        wallet_address: '01700000005',
        wallet_type: 'crypto',
        currency_type: 'USD',
      }),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as { data: { _id: string } };
    const refunded = await refundWithdrawMoney({ withdrawalId: body.data._id, idempotencyKey: 'phase1-refund' });
    assert.equal(refunded.balance, 90);
    const again = await refundWithdrawMoney({ withdrawalId: body.data._id, idempotencyKey: 'phase1-refund-2' });
    assert.equal(again.balance, 90);
    const rejected = await WithdrawalHistory.findById(body.data._id);
    assert.equal(rejected?.status, 'rejected');
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 90);
  });

  it('allows one open withdrawal, rejects another, and does not reserve funds twice for the same idempotency key', async () => {
    const user = await makeUser(7, 100, 200);
    const body = {
      coin_amount: 20,
      wallet_address: '01700000007',
      wallet_type: 'bkash',
      currency_type: 'BDT',
    };
    const first = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'open-once'),
      body: JSON.stringify(body),
    });
    assert.equal(first.status, 200);
    const replay = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'open-once'),
      body: JSON.stringify({ ...body, coin_amount: 30 }),
    });
    assert.equal(replay.status, 400);
    const other = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'open-other'),
      body: JSON.stringify(body),
    });
    assert.equal(other.status, 400);
    assert.equal((await User.findById(user._id))?.balance, 80);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id, status: { $in: ['pending', 'processing'] } }), 1);
    assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 1);

    const created = await WithdrawalHistory.findOne({ userId: user._id });
    await approveWithdrawMoney({ withdrawalId: String(created?._id) });
    const whileProcessing = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'open-while-processing'),
      body: JSON.stringify(body),
    });
    assert.equal(whileProcessing.status, 400);
    assert.equal((await User.findById(user._id))?.balance, 80);
    assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 1);

    await refundWithdrawMoney({ withdrawalId: String(created?._id), idempotencyKey: 'open-close' });
    assert.equal((await User.findById(user._id))?.balance, 100);
    const sameKeyAfterClose = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'open-once'),
      body: JSON.stringify(body),
    });
    assert.equal(sameKeyAfterClose.status, 200);
    assert.equal((await User.findById(user._id))?.balance, 100);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 1);

    const next = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'open-after-close'),
      body: JSON.stringify(body),
    });
    assert.equal(next.status, 200);
    assert.equal((await User.findById(user._id))?.balance, 80);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id, status: 'pending' }), 1);
    assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 2);
  });

  it('lets only one of several simultaneous submissions reserve funds', async () => {
    const user = await makeUser(8, 100, 200);
    const responses = await Promise.all(
      [1, 2, 3, 4].map((n) =>
        fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
          method: 'POST',
          headers: authHeaders(String(user._id), `race-${n}`),
          body: JSON.stringify({
            coin_amount: 15,
            wallet_address: '01700000008',
            wallet_type: 'bkash',
            currency_type: 'BDT',
          }),
        }),
      ),
    );
    const statuses = responses.map((response) => response.status).sort();
    assert.deepEqual(statuses, [200, 400, 400, 400]);
    assert.equal((await User.findById(user._id))?.balance, 85);
    assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 1);
    assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 1);
  });
});
