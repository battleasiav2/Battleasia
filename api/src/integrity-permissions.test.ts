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
import { BusinessWallet } from './models/BusinessWallet.js';
import { Dispute } from './models/Dispute.js';
import { FraudHold } from './models/FraudHold.js';
import { KycRecord } from './models/KycRecord.js';
import { LabEntity } from './models/LabEntity.js';
import { MatchReport } from './models/MatchReport.js';
import { PaymentChannel } from './models/PaymentChannel.js';
import { User } from './models/User.js';
import channelRoutes from './routes/v4/payments/payment-channels.js';
import walletRoutes from './routes/v4/payments/business-wallets.js';
import integrityRoutes from './routes/v3/integrity.js';
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

describe('integrity view versus action permissions', { concurrency: 1 }, () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';
  const tokens: Record<string, string> = {};
  const ids: Record<string, string> = {};

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping integrity permission tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-integrity-perm-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    async function staff(name: string, type: 'admin' | 'official' | 'agent' | 'player', permissions: string[]) {
      const user = await User.create({
        email: `${name}@perm.test`,
        username: name,
        password: 'hashed',
        status: true,
        emailVerified: true,
        role: { type, name: type, permissions },
      });
      tokens[name] = signAccessToken(user._id.toString(), 0);
      return user;
    }

    await staff('full-admin', 'admin', []);
    await staff('view-pay', 'official', ['payments.view']);
    await staff('manage-pay', 'agent', ['payments.manage']);
    await staff('view-users', 'official', ['users.view']);
    await staff('edit-users', 'agent', ['users.edit']);
    await staff('view-matches', 'official', ['matches.view']);
    await staff('edit-matches', 'agent', ['matches.edit']);
    await staff('view-support', 'official', ['customer-support.view']);
    await staff('close-support', 'agent', ['customer-support.close']);
    const player = await staff('plain-player', 'player', []);

    const settings = await getAppSettings();
    settings.reserveBac = 10;
    settings.highValueWithdrawBac = 1000;
    await settings.save();

    const hold = await FraudHold.create({ userId: player._id, kind: 'withdraw', reason: 'review', status: 'open' });
    ids.hold = hold._id.toString();
    player.kycStatus = 'pending';
    await player.save();
    const kyc = await KycRecord.create({ userId: player._id, status: 'pending' });
    ids.kyc = kyc._id.toString();
    const report = await MatchReport.create({
      matchId: new mongoose.Types.ObjectId(),
      reporterId: player._id,
      targetUserId: player._id,
      reason: 'collusion',
      status: 'open',
    });
    ids.report = report._id.toString();
    const dispute = await Dispute.create({ userId: player._id, subject: 'score', status: 'open' });
    ids.dispute = dispute._id.toString();
    const ocr = await LabEntity.create({
      kind: 'ocr',
      title: 'result shot',
      hostId: player._id,
      hostName: 'plain-player',
      status: 'pending',
    });
    ids.ocr = ocr._id.toString();
    const channel = await PaymentChannel.create({ channel_name: 'desk', description: 'test' });
    ids.channel = channel._id.toString();
    const wallet = await BusinessWallet.create({
      channel_id: channel._id,
      wallet_address: 'keep-me',
      currency_type: 'BDT',
    });
    ids.wallet = wallet._id.toString();

    const app = express();
    app.use(express.json());
    app.use('/api/v3/integrity', integrityRoutes);
    app.use('/api/v4/payments/payment-channels', channelRoutes);
    app.use('/api/v4/payments/business-wallets', walletRoutes);
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

  function headers(name?: string) {
    const row: Record<string, string> = { 'Content-Type': 'application/json' };
    if (name) row.Authorization = `Bearer ${tokens[name]}`;
    return row;
  }

  async function send(name: string | undefined, method: string, url: string, body?: unknown) {
    return fetch(`${base}${url}`, {
      method,
      headers: headers(name),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  it('requires payments.manage to change the reserve threshold', async () => {
    const denied = await send('view-pay', 'PUT', '/api/v3/integrity/reserve', { reserveBac: 999 });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PUT', '/api/v3/integrity/reserve', { reserveBac: 999 });
    assert.equal(anon.status, 401);
    let settings = await getAppSettings();
    assert.equal(Number(settings.reserveBac), 10);

    const managed = await send('manage-pay', 'PUT', '/api/v3/integrity/reserve', { reserveBac: 40 });
    assert.equal(managed.status, 200);
    const admin = await send('full-admin', 'PUT', '/api/v3/integrity/reserve', { reserveBac: 55 });
    assert.equal(admin.status, 200);
    settings = await getAppSettings();
    assert.equal(Number(settings.reserveBac), 55);

    const listed = await send('view-pay', 'GET', '/api/v3/integrity/ledger');
    assert.equal(listed.status, 200);
  });

  it('requires payments.manage to change the high-value threshold', async () => {
    const denied = await send('view-pay', 'PUT', '/api/v3/integrity/high-value', { highValueWithdrawBac: 1 });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PUT', '/api/v3/integrity/high-value', { highValueWithdrawBac: 1 });
    assert.equal(anon.status, 401);
    let settings = await getAppSettings();
    assert.equal(Number(settings.highValueWithdrawBac), 1000);

    const managed = await send('manage-pay', 'PUT', '/api/v3/integrity/high-value', { highValueWithdrawBac: 2500 });
    assert.equal(managed.status, 200);
    const admin = await send('full-admin', 'PUT', '/api/v3/integrity/high-value', { highValueWithdrawBac: 3000 });
    assert.equal(admin.status, 200);
    settings = await getAppSettings();
    assert.equal(Number(settings.highValueWithdrawBac), 3000);
  });

  it('requires payments.manage to change a fraud hold', async () => {
    const denied = await send('view-pay', 'PATCH', `/api/v3/integrity/fraud-holds/${ids.hold}`, { status: 'released' });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PATCH', `/api/v3/integrity/fraud-holds/${ids.hold}`, { status: 'released' });
    assert.equal(anon.status, 401);
    let hold = await FraudHold.findById(ids.hold);
    assert.equal(hold?.status, 'open');

    const managed = await send('manage-pay', 'PATCH', `/api/v3/integrity/fraud-holds/${ids.hold}`, { status: 'released' });
    assert.equal(managed.status, 200);
    hold = await FraudHold.findById(ids.hold);
    assert.equal(hold?.status, 'released');

    const admin = await send('full-admin', 'PATCH', `/api/v3/integrity/fraud-holds/${ids.hold}`, { status: 'open' });
    assert.equal(admin.status, 200);
    hold = await FraudHold.findById(ids.hold);
    assert.equal(hold?.status, 'open');

    const listed = await send('view-pay', 'GET', '/api/v3/integrity/fraud-holds');
    assert.equal(listed.status, 200);
  });

  it('requires users.edit to change KYC status', async () => {
    const denied = await send('view-users', 'PATCH', `/api/v3/integrity/kyc/${ids.kyc}`, { status: 'approved' });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PATCH', `/api/v3/integrity/kyc/${ids.kyc}`, { status: 'approved' });
    assert.equal(anon.status, 401);
    let record = await KycRecord.findById(ids.kyc);
    assert.equal(record?.status, 'pending');

    const edited = await send('edit-users', 'PATCH', `/api/v3/integrity/kyc/${ids.kyc}`, { status: 'approved' });
    assert.equal(edited.status, 200);
    record = await KycRecord.findById(ids.kyc);
    assert.equal(record?.status, 'approved');

    const admin = await send('full-admin', 'PATCH', `/api/v3/integrity/kyc/${ids.kyc}`, { status: 'rejected' });
    assert.equal(admin.status, 200);
    record = await KycRecord.findById(ids.kyc);
    assert.equal(record?.status, 'rejected');

    const listed = await send('view-users', 'GET', '/api/v3/integrity/kyc');
    assert.equal(listed.status, 200);
  });

  it('requires matches.edit to change a match report', async () => {
    const denied = await send('view-matches', 'PATCH', `/api/v3/integrity/match-reports/${ids.report}`, { status: 'dismissed' });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PATCH', `/api/v3/integrity/match-reports/${ids.report}`, { status: 'dismissed' });
    assert.equal(anon.status, 401);
    let row = await MatchReport.findById(ids.report);
    assert.equal(row?.status, 'open');

    const edited = await send('edit-matches', 'PATCH', `/api/v3/integrity/match-reports/${ids.report}`, { status: 'reviewed' });
    assert.equal(edited.status, 200);
    const admin = await send('full-admin', 'PATCH', `/api/v3/integrity/match-reports/${ids.report}`, { status: 'dismissed' });
    assert.equal(admin.status, 200);
    row = await MatchReport.findById(ids.report);
    assert.equal(row?.status, 'dismissed');

    const listed = await send('view-matches', 'GET', '/api/v3/integrity/match-reports');
    assert.equal(listed.status, 200);
  });

  it('requires matches.edit to accept or reject OCR', async () => {
    const denied = await send('view-matches', 'PATCH', `/api/v3/integrity/ocr/${ids.ocr}`, { status: 'accepted' });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PATCH', `/api/v3/integrity/ocr/${ids.ocr}`, { status: 'accepted' });
    assert.equal(anon.status, 401);
    let row = await LabEntity.findById(ids.ocr);
    assert.equal(row?.status, 'pending');

    const edited = await send('edit-matches', 'PATCH', `/api/v3/integrity/ocr/${ids.ocr}`, { status: 'accepted' });
    assert.equal(edited.status, 200);
    const admin = await send('full-admin', 'PATCH', `/api/v3/integrity/ocr/${ids.ocr}`, { status: 'rejected' });
    assert.equal(admin.status, 200);
    row = await LabEntity.findById(ids.ocr);
    assert.equal(row?.status, 'rejected');

    const listed = await send('view-matches', 'GET', '/api/v3/integrity/ocr');
    assert.equal(listed.status, 200);
  });

  it('requires customer-support.close to change a dispute', async () => {
    const denied = await send('view-support', 'PATCH', `/api/v3/integrity/disputes/${ids.dispute}`, { status: 'resolved' });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PATCH', `/api/v3/integrity/disputes/${ids.dispute}`, { status: 'resolved' });
    assert.equal(anon.status, 401);
    let row = await Dispute.findById(ids.dispute);
    assert.equal(row?.status, 'open');

    const closed = await send('close-support', 'PATCH', `/api/v3/integrity/disputes/${ids.dispute}`, { status: 'resolved' });
    assert.equal(closed.status, 200);
    const admin = await send('full-admin', 'PATCH', `/api/v3/integrity/disputes/${ids.dispute}`, { status: 'rejected' });
    assert.equal(admin.status, 200);
    row = await Dispute.findById(ids.dispute);
    assert.equal(row?.status, 'rejected');

    const listed = await send('view-support', 'GET', '/api/v3/integrity/disputes');
    assert.equal(listed.status, 200);
  });

  it('requires payments.manage to create a payment channel and still lets viewers read', async () => {
    const denied = await send('view-pay', 'POST', '/api/v4/payments/payment-channels', { channel_name: 'blocked-channel' });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'POST', '/api/v4/payments/payment-channels', { channel_name: 'blocked-channel' });
    assert.equal(anon.status, 401);
    assert.equal(await PaymentChannel.countDocuments({ channel_name: 'blocked-channel' }), 0);

    const managed = await send('manage-pay', 'POST', '/api/v4/payments/payment-channels', { channel_name: 'managed-channel' });
    assert.equal(managed.status, 201);
    const admin = await send('full-admin', 'POST', '/api/v4/payments/payment-channels', { channel_name: 'admin-channel' });
    assert.equal(admin.status, 201);

    const listed = await send('view-pay', 'GET', '/api/v4/payments/payment-channels');
    assert.equal(listed.status, 200);
  });

  it('requires payments.manage to update a business wallet', async () => {
    const denied = await send('view-pay', 'PUT', `/api/v4/payments/business-wallets/${ids.wallet}`, {
      wallet_address: 'changed-by-viewer',
    });
    assert.equal(denied.status, 403);
    const anon = await send(undefined, 'PUT', `/api/v4/payments/business-wallets/${ids.wallet}`, {
      wallet_address: 'changed-by-anon',
    });
    assert.equal(anon.status, 401);
    let wallet = await BusinessWallet.findById(ids.wallet);
    assert.equal(wallet?.wallet_address, 'keep-me');

    const managed = await send('manage-pay', 'PUT', `/api/v4/payments/business-wallets/${ids.wallet}`, {
      wallet_address: 'managed-address',
    });
    assert.equal(managed.status, 200);
    const admin = await send('full-admin', 'PUT', `/api/v4/payments/business-wallets/${ids.wallet}`, {
      wallet_address: 'admin-address',
    });
    assert.equal(admin.status, 200);
    wallet = await BusinessWallet.findById(ids.wallet);
    assert.equal(wallet?.wallet_address, 'admin-address');

    const listed = await send('view-pay', 'GET', '/api/v4/payments/business-wallets');
    assert.equal(listed.status, 200);
  });
});
