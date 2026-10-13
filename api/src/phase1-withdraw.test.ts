import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it, mock } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { BalanceHistory } from './models/BalanceHistory.js';
import { CoinRate } from './models/CoinRate.js';
import { CoingoTransaction } from './models/CoingoTransaction.js';
import { LedgerEntry } from './models/LedgerEntry.js';
import { Notification } from './models/Notification.js';
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
import { setSocketServer } from './utils/socket.js';

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
    await CoinRate.create([
      { region: 'bangladesh', currency: 'BDT', rate: 1, isActive: true },
      { region: 'global', currency: 'USD', rate: 0.05, isActive: true },
    ]);

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

  it('returns the created withdrawal when the submit notice fails after the hold', async () => {
    const user = await makeUser(9, 100, 200);
    const create = mock.method(Notification, 'create', async () => {
      throw new Error('notification failed');
    });
    try {
      const response = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
        method: 'POST',
        headers: authHeaders(String(user._id), 'side-notice'),
        body: JSON.stringify({
          coin_amount: 20,
          wallet_address: '01700000009',
          wallet_type: 'bkash',
          currency_type: 'BDT',
        }),
      });
      const body = (await response.json()) as { status: boolean; message: string; data: { status: string; _id: string } };
      assert.equal(response.status, 200);
      assert.equal(body.status, true);
      assert.equal(body.message, 'Withdrawal request submitted successfully');
      assert.equal(body.data.status, 'pending');
      assert.equal((await User.findById(user._id))?.balance, 80);
      assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 1);
      assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 1);

      const again = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
        method: 'POST',
        headers: authHeaders(String(user._id), 'side-notice-again'),
        body: JSON.stringify({
          coin_amount: 20,
          wallet_address: '01700000009',
          wallet_type: 'bkash',
          currency_type: 'BDT',
        }),
      });
      assert.equal(again.status, 400);
      assert.equal((await User.findById(user._id))?.balance, 80);
      assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 1);
      assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 1);
    } finally {
      create.mock.restore();
    }
  });

  it('returns the created withdrawal when the socket emit fails after the hold', async () => {
    const user = await makeUser(10, 100, 200);
    setSocketServer({
      to() {
        return {
          emit() {
            throw new Error('socket failed');
          },
        };
      },
    } as never);
    try {
      const response = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
        method: 'POST',
        headers: authHeaders(String(user._id), 'side-socket'),
        body: JSON.stringify({
          coin_amount: 15,
          wallet_address: '01700000010',
          wallet_type: 'nagad',
          currency_type: 'BDT',
        }),
      });
      const body = (await response.json()) as { status: boolean; data: { status: string } };
      assert.equal(response.status, 200);
      assert.equal(body.status, true);
      assert.equal(body.data.status, 'pending');
      assert.equal((await User.findById(user._id))?.balance, 85);
      assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 1);
      assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 1);
    } finally {
      setSocketServer(null as never);
    }
  });

  it('does not report success when the hold transaction fails', async () => {
    const user = await makeUser(11, 100, 200);
    const originalFind = User.findById.bind(User);
    let calls = 0;
    const find = mock.method(User, 'findById', function (...args: Parameters<typeof User.findById>) {
      calls += 1;
      const query = originalFind(...args);
      if (calls < 3) return query;
      return {
        session(session: mongoose.ClientSession | null) {
          return query.session(session).then(async (doc) => {
            if (doc) doc.balance = 0;
            return doc;
          });
        },
      };
    });
    try {
      const response = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
        method: 'POST',
        headers: authHeaders(String(user._id), 'hold-fails'),
        body: JSON.stringify({
          coin_amount: 20,
          wallet_address: '01700000011',
          wallet_type: 'bkash',
          currency_type: 'BDT',
        }),
      });
      const body = (await response.json()) as { status: boolean; message: string };
      assert.equal(response.status, 400);
      assert.equal(body.status, false);
      assert.equal(body.message, 'Insufficient user balance');
      assert.equal((await User.findOne({ _id: user._id }))?.balance, 100);
      assert.equal(await WithdrawalHistory.countDocuments({ userId: user._id }), 0);
      assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'withdraw_hold' }), 0);
    } finally {
      find.mock.restore();
    }
  });

  it('stores the authenticated account when the client sends another identity', async () => {
    const user = await makeUser(12, 100, 200);
    const response = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'identity-spoof'),
      body: JSON.stringify({
        user_email: 'other-person@example.com',
        username: 'other-person',
        coin_amount: 15,
        wallet_address: '01700000012',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as { status: boolean; data: { _id: string; user_email: string; username: string } };
    assert.equal(body.status, true);
    assert.equal(body.data.user_email, user.email);
    assert.equal(body.data.username, user.username);
    const saved = await WithdrawalHistory.findById(body.data._id);
    assert.equal(saved?.userId.toString(), user._id.toString());
    assert.equal(saved?.user_email, user.email);
    assert.equal(saved?.username, user.username);
  });

  it('stores the server rate instead of a client fiat amount and rejects an unknown currency', async () => {
    const user = await makeUser(13, 100, 200);
    const tampered = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(user._id), 'fiat-tamper'),
      body: JSON.stringify({
        coin_amount: 20,
        wallet_address: '01700000013',
        wallet_type: 'bkash',
        currency_type: 'BDT',
        currency_amount: -999,
      }),
    });
    assert.equal(tampered.status, 200);
    const tamperedBody = (await tampered.json()) as { data: { _id: string; currency_amount: number } };
    assert.equal(tamperedBody.data.currency_amount, 20);
    const saved = await WithdrawalHistory.findById(tamperedBody.data._id);
    assert.equal(saved?.currency_amount, 20);

    const stranger = await makeUser(18, 50, 100);
    const unknown = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(stranger._id), 'fiat-unknown'),
      body: JSON.stringify({
        coin_amount: 5,
        wallet_address: '01700000018',
        wallet_type: 'bkash',
        currency_type: 'ZZZ',
        currency_amount: 5000,
      }),
    });
    const unknownBody = (await unknown.json()) as { status: boolean; message: string };
    assert.equal(unknown.status, 400);
    assert.equal(unknownBody.status, false);
    assert.equal(unknownBody.message, 'Unsupported currency');
    assert.equal(await WithdrawalHistory.countDocuments({ userId: stranger._id }), 0);
    assert.equal((await User.findById(stranger._id))?.balance, 50);
  });

  it('normalizes a fractional coin amount before the withdrawable check and hold', async () => {
    const bounded = await makeUser(14, 10, 100);
    const accepted = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(bounded._id), 'round-fit'),
      body: JSON.stringify({
        coin_amount: 10.004,
        wallet_address: '01700000014',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    assert.equal(accepted.status, 200);
    const acceptedBody = (await accepted.json()) as { data: { _id: string; coin_amount: number } };
    assert.equal(acceptedBody.data.coin_amount, 10);
    const acceptedRow = await WithdrawalHistory.findById(acceptedBody.data._id);
    assert.equal(acceptedRow?.coin_amount, 10);
    assert.equal((await User.findById(bounded._id))?.balance, 0);
    const acceptedHold = await LedgerEntry.findOne({ refType: 'withdraw_hold', refId: acceptedBody.data._id });
    assert.equal(acceptedHold?.amount, 10);

    const wide = await makeUser(15, 100, 200);
    const raised = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(wide._id), 'round-up'),
      body: JSON.stringify({
        coin_amount: 10.006,
        wallet_address: '01700000015',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    assert.equal(raised.status, 200);
    const raisedBody = (await raised.json()) as { data: { _id: string; coin_amount: number } };
    assert.equal(raisedBody.data.coin_amount, 10.01);
    const raisedRow = await WithdrawalHistory.findById(raisedBody.data._id);
    assert.equal(raisedRow?.coin_amount, 10.01);
    assert.equal((await User.findById(wide._id))?.balance, 89.99);
    const raisedHold = await LedgerEntry.findOne({ refType: 'withdraw_hold', refId: raisedBody.data._id });
    assert.equal(raisedHold?.amount, raisedRow?.coin_amount);
  });

  it('accepts a supported currency when the client omits fiat or sends zero', async () => {
    const omitted = await makeUser(16, 80, 200);
    const withoutFiat = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(omitted._id), 'fiat-omit'),
      body: JSON.stringify({
        coin_amount: 12,
        wallet_address: '01700000016',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    assert.equal(withoutFiat.status, 200);
    const withoutBody = (await withoutFiat.json()) as { data: { currency_amount: number; coin_amount: number } };
    assert.equal(withoutBody.data.coin_amount, 12);
    assert.equal(withoutBody.data.currency_amount, 12);

    const zeroed = await makeUser(17, 80, 200);
    const withZero = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: authHeaders(String(zeroed._id), 'fiat-zero'),
      body: JSON.stringify({
        coin_amount: 8,
        wallet_address: '01700000017',
        wallet_type: 'bkash',
        currency_type: 'BDT',
        currency_amount: 0,
      }),
    });
    assert.equal(withZero.status, 200);
    const zeroBody = (await withZero.json()) as { data: { currency_amount: number } };
    assert.equal(zeroBody.data.currency_amount, 8);
    assert.equal((await User.findById(zeroed._id))?.balance, 72);
  });
});
