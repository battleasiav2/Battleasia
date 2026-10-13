import assert from 'node:assert/strict';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { getAppSettings } from './models/AppSettings.js';
import { BalanceHistory } from './models/BalanceHistory.js';
import { LedgerEntry } from './models/LedgerEntry.js';
import { ReferralHistory } from './models/ReferralHistory.js';
import { User } from './models/User.js';
import { requireAdmin } from './middleware/admin.js';
import usersRoutes from './routes/v2/users.js';
import usersListRoutes from './routes/v3/users/list.js';
import { applyDepositBonusOnApproval } from './utils/engagement-deposit-bonus.js';
import { signAccessToken } from './utils/jwt.js';
import { MoneyError, moveWallet } from './utils/money.js';
import { processReferralCommission } from './utils/referral.js';

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

describe('atomic balance updates', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping balance atomicity tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-balance-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    const app = express();
    app.use(express.json());
    app.use('/api/v2/users', usersRoutes);
    app.use('/api/v3/users/list', requireAdmin, usersListRoutes);
    const listening = await listen(app);
    server = listening.server;
    base = listening.base;

    const settings = await getAppSettings();
    settings.premiumPrice = 40;
    settings.premiumDuration = 30;
    settings.commissionRate = 10;
    settings.p1.cashbackDays = true;
    settings.engagement.depositBonusDays.enabled = true;
    settings.engagement.depositBonusDays.percent = 10;
    settings.engagement.depositBonusDays.minDeposit = 0;
    settings.markModified('p1');
    settings.markModified('engagement');
    await settings.save();
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
    await mongoose.disconnect();
    if (replset) await replset.stop();
  });

  function headers(userId: string, idempotencyKey?: string) {
    return {
      Authorization: `Bearer ${signAccessToken(userId, 0)}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    };
  }

  async function player(name: string, balance: number, extra: Record<string, unknown> = {}) {
    return User.create({
      email: `${name}@balance.test`,
      username: name,
      password: 'hashed',
      balance,
      role: { type: 'player', name: 'Player', permissions: [] },
      ...extra,
    });
  }

  it('keeps a concurrent credit when another wallet update commits', async () => {
    const user = await player('race-credit', 80);
    await Promise.all([
      moveWallet({
        userId: user._id.toString(),
        amount: 25,
        direction: 'credit',
        otherAccount: 'platform:reserve',
        refType: 'admin_adjustment',
        refId: 'race-credit-a',
        reason: 'admin_adjustment',
        idempotencyKey: 'race-credit-a',
      }),
      moveWallet({
        userId: user._id.toString(),
        amount: 15,
        direction: 'debit',
        otherAccount: 'platform:reserve',
        refType: 'premium_activation',
        refId: 'race-credit-b',
        reason: 'premium_activation',
        idempotencyKey: 'race-credit-b',
      }),
    ]);
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 90);
    assert.equal(await LedgerEntry.countDocuments({ userId: user._id }), 2);
  });

  it('rejects an unauthorized or invalid admin balance change and does not debit past the balance', async () => {
    const editor = await player('balance-editor', 0, {
      role: { type: 'official', name: 'official', permissions: ['users.edit'] },
    });
    const viewer = await player('balance-viewer', 0, {
      role: { type: 'official', name: 'official', permissions: ['users.view'] },
    });
    const target = await player('balance-target', 30);

    const denied = await fetch(`${base}/api/v3/users/list/${target._id}/balance`, {
      method: 'PATCH',
      headers: headers(String(viewer._id)),
      body: JSON.stringify({ amount: 5, type: 'deposit' }),
    });
    assert.equal(denied.status, 403);

    const missing = await fetch(`${base}/api/v3/users/list/${target._id}/balance`, {
      method: 'PATCH',
      headers: headers(String(editor._id)),
      body: JSON.stringify({ amount: 0, type: 'deposit' }),
    });
    assert.equal(missing.status, 400);

    const overdraft = await fetch(`${base}/api/v3/users/list/${target._id}/balance`, {
      method: 'PATCH',
      headers: headers(String(editor._id)),
      body: JSON.stringify({ amount: 50, type: 'withdraw', note: 'too much' }),
    });
    const overdraftBody = (await overdraft.json()) as { message?: string };
    assert.equal(overdraft.status, 400);
    assert.equal(overdraftBody.message, 'Insufficient balance');
    assert.equal((await User.findById(target._id))?.balance, 30);
    assert.equal(await LedgerEntry.countDocuments({ userId: target._id, refType: 'admin_adjustment' }), 0);

    const credited = await fetch(`${base}/api/v3/users/list/${target._id}/balance`, {
      method: 'PATCH',
      headers: headers(String(editor._id), 'admin-credit-once'),
      body: JSON.stringify({ amount: 20, type: 'deposit', note: 'correction' }),
    });
    assert.equal(credited.status, 200);
    const again = await fetch(`${base}/api/v3/users/list/${target._id}/balance`, {
      method: 'PATCH',
      headers: headers(String(editor._id), 'admin-credit-once'),
      body: JSON.stringify({ amount: 20, type: 'deposit', note: 'correction' }),
    });
    assert.equal(again.status, 200);
    assert.equal((await User.findById(target._id))?.balance, 50);
    assert.equal(await LedgerEntry.countDocuments({ userId: target._id, refType: 'admin_adjustment' }), 1);
  });

  it('charges premium once and keeps a concurrent credit', async () => {
    const user = await player('premium-buyer', 100);
    const purchase = fetch(`${base}/api/v2/users/premium/activate`, {
      method: 'POST',
      headers: headers(String(user._id), 'premium-once'),
    });
    const credit = moveWallet({
      userId: user._id.toString(),
      amount: 30,
      direction: 'credit',
      otherAccount: 'platform:reserve',
      refType: 'admin_adjustment',
      refId: 'premium-race-credit',
      reason: 'admin_adjustment',
      idempotencyKey: 'premium-race-credit',
    });
    const [response] = await Promise.all([purchase, credit]);
    assert.equal(response.status, 200);
    const body = (await response.json()) as { user?: { isPremium?: boolean; balance?: number } };
    assert.equal(body.user?.isPremium, true);

    const replay = await fetch(`${base}/api/v2/users/premium/activate`, {
      method: 'POST',
      headers: headers(String(user._id), 'premium-once'),
    });
    assert.equal(replay.status, 200);
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 90);
    assert.equal(fresh?.isPremium, true);
    assert.equal(await LedgerEntry.countDocuments({ userId: user._id, refType: 'premium_activation' }), 1);

    const poor = await player('premium-poor', 10);
    const refused = await fetch(`${base}/api/v2/users/premium/activate`, {
      method: 'POST',
      headers: headers(String(poor._id)),
    });
    assert.equal(refused.status, 400);
    assert.equal((await User.findById(poor._id))?.balance, 10);
    assert.equal((await User.findById(poor._id))?.isPremium, false);
    assert.equal(await LedgerEntry.countDocuments({ userId: poor._id, refType: 'premium_activation' }), 0);
  });

  it('credits a referral commission once for the same deposit', async () => {
    const referrer = await player('referrer-one', 20);
    const depositor = await player('referred-one', 0, { referredBy: referrer._id });
    const depositId = new mongoose.Types.ObjectId();
    const input = {
      depositor,
      depositAmount: 100,
      depositId,
      depositSource: 'manual' as const,
    };

    await Promise.all([
      processReferralCommission(input),
      processReferralCommission(input),
      moveWallet({
        userId: referrer._id.toString(),
        amount: 15,
        direction: 'credit',
        otherAccount: 'platform:reserve',
        refType: 'admin_adjustment',
        refId: 'referral-race-credit',
        reason: 'admin_adjustment',
        idempotencyKey: 'referral-race-credit',
      }),
    ]);

    const fresh = await User.findById(referrer._id);
    assert.equal(fresh?.balance, 45);
    assert.equal(await LedgerEntry.countDocuments({ userId: referrer._id, refType: 'referral_commission' }), 1);
    assert.equal(await ReferralHistory.countDocuments({ referrerId: referrer._id, depositId }), 1);
  });

  it('credits a deposit bonus once for the same approved deposit', async () => {
    const user = await player('bonus-user', 30);
    const depositId = new mongoose.Types.ObjectId().toString();
    const first = await applyDepositBonusOnApproval({
      user,
      depositAmount: 100,
      depositId,
    });
    const second = await applyDepositBonusOnApproval({
      user,
      depositAmount: 100,
      depositId,
    });
    assert.equal(first.applied, true);
    assert.equal(first.bonusAmount, 10);
    assert.equal(second.applied, false);
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 40);
    const rows = await LedgerEntry.find({ userId: user._id, refType: 'engagement_deposit_bonus' });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.amount, 10);
    assert.equal(rows[0]?.creditAccount, `user:${user._id.toString()}:wallet`);
    assert.equal(rows[0]?.debitAccount, 'platform:reserve');
  });

  it('rolls the balance and ledger back together when the paired write fails', async () => {
    const user = await player('rollback-user', 40);
    await assert.rejects(
      () =>
        moveWallet({
          userId: user._id.toString(),
          amount: 12,
          direction: 'credit',
          otherAccount: 'platform:reserve',
          refType: 'admin_adjustment',
          refId: 'rollback-credit',
          reason: 'admin_adjustment',
          idempotencyKey: 'rollback-credit',
          alongside: async () => {
            throw new MoneyError('paired write failed');
          },
        }),
      /paired write failed/,
    );
    assert.equal((await User.findById(user._id))?.balance, 40);
    assert.equal(await LedgerEntry.countDocuments({ idempotencyKey: 'rollback-credit' }), 0);
    assert.equal(await BalanceHistory.countDocuments({ userId: user._id, 'detail.reason': 'admin_adjustment' }), 0);
  });
});
