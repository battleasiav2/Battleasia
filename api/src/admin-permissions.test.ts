import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { CoinRate } from './models/CoinRate.js';
import { Role } from './models/Role.js';
import { ShopItem } from './models/ShopItem.js';
import { User } from './models/User.js';
import { WithdrawalHistory } from './models/WithdrawalHistory.js';
import { requireAdmin } from './middleware/admin.js';
import coingoRoutes from './routes/v4/payments/coingo.js';
import coinRateRoutes from './routes/v4/shop/coins.js';
import shopItemRoutes from './routes/v4/shop/items.js';
import withdrawalRoutes from './routes/v4/payments/withdrawal-history.js';
import usersListRoutes from './routes/v3/users/list.js';
import usersRolesRoutes from './routes/v3/users/roles.js';
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

describe('admin permission enforcement', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping admin permission tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-admin-perm-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    const app = express();
    app.use(express.json());
    app.use('/api/v3/users/list', requireAdmin, usersListRoutes);
    app.use('/api/v3/users/roles', requireAdmin, usersRolesRoutes);
    app.use('/api/v4/payments/withdrawal-history', withdrawalRoutes);
    app.use('/api/v4/payments/coingo', coingoRoutes);
    app.use('/api/v4/shop/items', shopItemRoutes);
    app.use('/api/v4/shop/coins', coinRateRoutes);
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

  function headers(userId: string) {
    return {
      Authorization: `Bearer ${signAccessToken(userId, 0)}`,
      'Content-Type': 'application/json',
    };
  }

  async function staff(name: string, type: 'admin' | 'official' | 'agent', permissions: string[]) {
    return User.create({
      email: `${name}@perm.test`,
      username: name,
      password: 'hashed',
      balance: 0,
      role: { type, name: type, permissions },
    });
  }

  it('denies an agent without permission on withdrawal approval and user deletion', async () => {
    const agent = await staff('agent-none', 'agent', []);
    const player = await User.create({
      email: 'keep-me@perm.test',
      username: 'keepme',
      password: 'hashed',
      balance: 20,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const approve = await fetch(`${base}/api/v4/payments/withdrawal-history/000000000000000000000099/approve`, {
      method: 'PATCH',
      headers: headers(String(agent._id)),
      body: '{}',
    });
    const approveBody = (await approve.json()) as { message?: string };
    assert.equal(approve.status, 403);
    assert.equal(approveBody.message, 'Permission denied');

    const remove = await fetch(`${base}/api/v3/users/list/${player._id}`, {
      method: 'DELETE',
      headers: headers(String(agent._id)),
    });
    const removeBody = (await remove.json()) as { message?: string };
    assert.equal(remove.status, 403);
    assert.equal(removeBody.message, 'Permission denied');
    assert.ok(await User.findById(player._id));

    const bulk = await fetch(`${base}/api/v3/users/list/bulk/all`, {
      method: 'DELETE',
      headers: headers(String(agent._id)),
    });
    assert.equal(bulk.status, 403);
    assert.ok(await User.findById(player._id));
  });

  it('lets payments.manage approve a withdrawal and still blocks user deletion', async () => {
    const agent = await staff('agent-pay', 'agent', ['payments.manage']);
    const player = await User.create({
      email: 'payer@perm.test',
      username: 'payer',
      password: 'hashed',
      balance: 40,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const withdrawal = await WithdrawalHistory.create({
      userId: player._id,
      username: player.username,
      user_email: player.email,
      coin_amount: 10,
      wallet_address: '01711111111',
      wallet_type: 'bkash',
      status: 'pending',
    });
    const approve = await fetch(`${base}/api/v4/payments/withdrawal-history/${withdrawal._id}/approve`, {
      method: 'PATCH',
      headers: { ...headers(String(agent._id)), 'Idempotency-Key': 'perm-approve-1' },
      body: '{}',
    });
    const approveBody = (await approve.json()) as { status?: boolean; data?: { status?: string } };
    assert.equal(approve.status, 200);
    assert.equal(approveBody.status, true);
    assert.equal(approveBody.data?.status, 'processing');

    const remove = await fetch(`${base}/api/v3/users/list/${player._id}`, {
      method: 'DELETE',
      headers: headers(String(agent._id)),
    });
    assert.equal(remove.status, 403);
    assert.ok(await User.findById(player._id));
  });

  it('stops an agent from creating or assigning an admin role', async () => {
    const agent = await staff('agent-edit', 'agent', ['users.edit']);
    const adminRole = await Role.create({
      name: 'Owner',
      type: 'admin',
      permissions: [],
    });
    const created = await fetch(`${base}/api/v3/users/roles`, {
      method: 'POST',
      headers: headers(String(agent._id)),
      body: JSON.stringify({ name: 'Fake Admin', type: 'admin', permissions: [] }),
    });
    assert.equal(created.status, 403);
    assert.equal(await Role.countDocuments({ name: 'Fake Admin' }), 0);

    const assigned = await fetch(`${base}/api/v3/users/list/${agent._id}`, {
      method: 'PUT',
      headers: headers(String(agent._id)),
      body: JSON.stringify({ role: String(adminRole._id) }),
    });
    assert.equal(assigned.status, 403);
    const fresh = await User.findById(agent._id);
    assert.equal(fresh?.role?.type, 'agent');
  });

  it('keeps the admin type full-access bypass and still refuses admin-user deletion', async () => {
    const admin = await staff('root-admin', 'admin', []);
    const player = await User.create({
      email: 'plain@perm.test',
      username: 'plainplayer',
      password: 'hashed',
      balance: 0,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const otherAdmin = await staff('other-admin', 'admin', []);
    const list = await fetch(`${base}/api/v3/users/list?limit=5`, { headers: headers(String(admin._id)) });
    assert.equal(list.status, 200);

    const removePlayer = await fetch(`${base}/api/v3/users/list/${player._id}`, {
      method: 'DELETE',
      headers: headers(String(admin._id)),
    });
    assert.equal(removePlayer.status, 200);
    assert.equal(await User.findById(player._id), null);

    const removeAdmin = await fetch(`${base}/api/v3/users/list/${otherAdmin._id}`, {
      method: 'DELETE',
      headers: headers(String(admin._id)),
    });
    const removeAdminBody = (await removeAdmin.json()) as { message?: string };
    assert.equal(removeAdmin.status, 403);
    assert.match(removeAdminBody.message || '', /admin/i);
    assert.ok(await User.findById(otherAdmin._id));
  });

  it('blocks shop.view from saving and allows shop.edit', async () => {
    const viewer = await staff('shop-view', 'agent', ['shop.view']);
    const editor = await staff('shop-edit', 'agent', ['shop.edit']);
    const item = await ShopItem.create({ amount: 100, price: 5, originalPrice: 5, symbol: 'BAC' });
    const denied = await fetch(`${base}/api/v4/shop/items/${item._id}`, {
      method: 'PUT',
      headers: headers(String(viewer._id)),
      body: JSON.stringify({ amount: 250 }),
    });
    assert.equal(denied.status, 403);
    assert.equal((await ShopItem.findById(item._id))?.amount, 100);

    const saved = await fetch(`${base}/api/v4/shop/items/${item._id}`, {
      method: 'PUT',
      headers: headers(String(editor._id)),
      body: JSON.stringify({ amount: 250 }),
    });
    assert.equal(saved.status, 200);
    assert.equal((await ShopItem.findById(item._id))?.amount, 250);
  });

  it('copies a role update only onto users assigned to that role', async () => {
    const admin = await staff('role-admin', 'admin', []);
    const clerkRole = await Role.create({
      name: 'Clerk',
      type: 'agent',
      permissions: ['users.view'],
    });
    const otherRole = await Role.create({
      name: 'Other',
      type: 'official',
      permissions: ['feed.view'],
    });
    const clerk = await User.create({
      email: 'clerk@perm.test',
      username: 'clerkuser',
      password: 'hashed',
      roleRef: clerkRole._id,
      role: { type: 'agent', name: 'Clerk', permissions: ['users.view'] },
    });
    const other = await User.create({
      email: 'other-role@perm.test',
      username: 'otherrole',
      password: 'hashed',
      roleRef: otherRole._id,
      role: { type: 'official', name: 'Other', permissions: ['feed.view'] },
    });

    const updated = await fetch(`${base}/api/v3/users/roles/${clerkRole._id}`, {
      method: 'PUT',
      headers: headers(String(admin._id)),
      body: JSON.stringify({
        name: 'Clerk Updated',
        type: 'official',
        permissions: ['users.view', 'payments.view'],
      }),
    });
    assert.equal(updated.status, 200);

    const synced = await User.findById(clerk._id);
    assert.equal(synced?.role?.name, 'Clerk Updated');
    assert.equal(synced?.role?.type, 'official');
    assert.deepEqual(synced?.role?.permissions, ['users.view', 'payments.view']);

    const untouched = await User.findById(other._id);
    assert.equal(untouched?.role?.name, 'Other');
    assert.equal(untouched?.role?.type, 'official');
    assert.deepEqual(untouched?.role?.permissions, ['feed.view']);
  });

  it('leaves player withdrawal submit and the Phase 1 payout block unchanged', async () => {
    const player = await User.create({
      email: 'player-route@perm.test',
      username: 'playerroute',
      password: 'hashed',
      balance: 5,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const submit = await fetch(`${base}/api/v4/payments/withdrawal-history/submit`, {
      method: 'POST',
      headers: { ...headers(String(player._id)), 'Idempotency-Key': 'player-submit-perm' },
      body: JSON.stringify({
        coin_amount: 1,
        wallet_address: '01722222222',
        wallet_type: 'bkash',
        currency_type: 'BDT',
      }),
    });
    const submitBody = (await submit.json()) as { message?: string };
    assert.notEqual(submitBody.message, 'Permission denied');
    assert.notEqual(submit.status, 401);

    const payout = await fetch(`${base}/api/v4/payments/coingo/payout`, {
      method: 'POST',
      headers: headers(String(player._id)),
      body: JSON.stringify({ coin_amount: 1 }),
    });
    const payoutBody = (await payout.json()) as { message?: string };
    assert.equal(payout.status, 400);
    assert.match(payoutBody.message || '', /Automated payout is not available/);
  });

  it('enforces shop.create, shop.edit, and shop.delete on coin rates', async () => {
    const viewer = await staff('rate-view', 'official', ['shop.view']);
    const creator = await staff('rate-create', 'agent', ['shop.create']);
    const editor = await staff('rate-edit', 'agent', ['shop.edit']);
    const remover = await staff('rate-delete', 'agent', ['shop.delete']);
    const body = { region: 'nepal', currency: 'NPR', rate: 3.5 };

    const deniedCreate = await fetch(`${base}/api/v4/shop/coins`, {
      method: 'POST',
      headers: headers(String(viewer._id)),
      body: JSON.stringify(body),
    });
    assert.equal(deniedCreate.status, 403);
    assert.equal(await CoinRate.countDocuments({ region: 'nepal', currency: 'NPR' }), 0);

    const created = await fetch(`${base}/api/v4/shop/coins`, {
      method: 'POST',
      headers: headers(String(creator._id)),
      body: JSON.stringify(body),
    });
    const createdBody = (await created.json()) as { status?: boolean; data?: { id?: string; rate?: number } };
    assert.equal(created.status, 201);
    assert.equal(createdBody.status, true);
    assert.equal(createdBody.data?.rate, 3.5);
    const rateId = String(createdBody.data?.id);
    assert.ok(rateId);

    const creatorEdit = await fetch(`${base}/api/v4/shop/coins/${rateId}`, {
      method: 'PUT',
      headers: headers(String(creator._id)),
      body: JSON.stringify({ rate: 9 }),
    });
    assert.equal(creatorEdit.status, 403);
    assert.equal((await CoinRate.findById(rateId))?.rate, 3.5);

    const viewerEdit = await fetch(`${base}/api/v4/shop/coins/${rateId}`, {
      method: 'PUT',
      headers: headers(String(viewer._id)),
      body: JSON.stringify({ rate: 9 }),
    });
    assert.equal(viewerEdit.status, 403);

    const edited = await fetch(`${base}/api/v4/shop/coins/${rateId}`, {
      method: 'PUT',
      headers: headers(String(editor._id)),
      body: JSON.stringify({ rate: 4.25 }),
    });
    const editedBody = (await edited.json()) as { data?: { rate?: number } };
    assert.equal(edited.status, 200);
    assert.equal(editedBody.data?.rate, 4.25);
    assert.equal((await CoinRate.findById(rateId))?.rate, 4.25);

    const editorDelete = await fetch(`${base}/api/v4/shop/coins/${rateId}`, {
      method: 'DELETE',
      headers: headers(String(editor._id)),
    });
    assert.equal(editorDelete.status, 403);
    assert.ok(await CoinRate.findById(rateId));

    const viewerDelete = await fetch(`${base}/api/v4/shop/coins/${rateId}`, {
      method: 'DELETE',
      headers: headers(String(viewer._id)),
    });
    assert.equal(viewerDelete.status, 403);

    const removed = await fetch(`${base}/api/v4/shop/coins/${rateId}`, {
      method: 'DELETE',
      headers: headers(String(remover._id)),
    });
    assert.equal(removed.status, 200);
    assert.equal(await CoinRate.findById(rateId), null);
  });

  it('rejects an official changing an existing role type to admin', async () => {
    const role = await Role.create({
      name: 'Desk',
      type: 'official',
      permissions: ['users.edit'],
    });
    const official = await User.create({
      email: 'desk-official@perm.test',
      username: 'deskofficial',
      password: 'hashed',
      roleRef: role._id,
      role: { type: 'official', name: 'Desk', permissions: ['users.edit'] },
    });

    const updated = await fetch(`${base}/api/v3/users/roles/${role._id}`, {
      method: 'PUT',
      headers: headers(String(official._id)),
      body: JSON.stringify({
        name: 'Desk Admin',
        type: 'admin',
        permissions: ['users.edit', 'users.delete'],
      }),
    });
    const updatedBody = (await updated.json()) as { message?: string };
    assert.equal(updated.status, 403);
    assert.equal(updatedBody.message, 'Permission denied');

    const saved = await Role.findById(role._id);
    assert.equal(saved?.type, 'official');
    assert.equal(saved?.name, 'Desk');
    assert.deepEqual(saved?.permissions, ['users.edit']);

    const actor = await User.findById(official._id);
    assert.equal(actor?.role?.type, 'official');
    assert.deepEqual(actor?.role?.permissions, ['users.edit']);
  });

  it('still requires the staff password for high-value withdrawal approval and completion', async () => {
    const password = 'staff-secret';
    const cashier = await User.create({
      email: 'cashier@perm.test',
      username: 'cashier',
      password: await bcrypt.hash(password, 4),
      balance: 0,
      role: { type: 'agent', name: 'agent', permissions: ['payments.manage'] },
    });
    const player = await User.create({
      email: 'high-player@perm.test',
      username: 'highplayer',
      password: 'hashed',
      balance: 2500,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const withdrawal = await WithdrawalHistory.create({
      userId: player._id,
      username: player.username,
      user_email: player.email,
      coin_amount: 1000,
      wallet_address: '01733333333',
      wallet_type: 'bkash',
      status: 'pending',
    });
    const approveUrl = `${base}/api/v4/payments/withdrawal-history/${withdrawal._id}/approve`;
    const completeUrl = `${base}/api/v4/payments/withdrawal-history/${withdrawal._id}/complete`;

    const missing = await fetch(approveUrl, {
      method: 'PATCH',
      headers: { ...headers(String(cashier._id)), 'Idempotency-Key': 'high-approve-missing' },
      body: '{}',
    });
    const missingBody = (await missing.json()) as { message?: string };
    assert.equal(missing.status, 403);
    assert.match(missingBody.message || '', /Password required/);
    assert.equal((await WithdrawalHistory.findById(withdrawal._id))?.status, 'pending');
    assert.equal((await User.findById(player._id))?.balance, 2500);

    const wrong = await fetch(approveUrl, {
      method: 'PATCH',
      headers: { ...headers(String(cashier._id)), 'Idempotency-Key': 'high-approve-wrong' },
      body: JSON.stringify({ password: 'not-the-password' }),
    });
    const wrongBody = (await wrong.json()) as { message?: string };
    assert.equal(wrong.status, 403);
    assert.match(wrongBody.message || '', /Password confirmation failed/);
    assert.equal((await WithdrawalHistory.findById(withdrawal._id))?.status, 'pending');
    assert.equal((await User.findById(player._id))?.balance, 2500);

    const approved = await fetch(approveUrl, {
      method: 'PATCH',
      headers: { ...headers(String(cashier._id)), 'Idempotency-Key': 'high-approve-ok' },
      body: JSON.stringify({ password }),
    });
    const approvedBody = (await approved.json()) as { status?: boolean; data?: { status?: string } };
    assert.equal(approved.status, 200);
    assert.equal(approvedBody.status, true);
    assert.equal(approvedBody.data?.status, 'processing');
    assert.equal((await User.findById(player._id))?.balance, 1500);

    const completeMissing = await fetch(completeUrl, {
      method: 'PATCH',
      headers: { ...headers(String(cashier._id)), 'Idempotency-Key': 'high-complete-missing' },
      body: '{}',
    });
    const completeMissingBody = (await completeMissing.json()) as { message?: string };
    assert.equal(completeMissing.status, 403);
    assert.match(completeMissingBody.message || '', /Password required/);
    assert.equal((await WithdrawalHistory.findById(withdrawal._id))?.status, 'processing');

    const completeWrong = await fetch(completeUrl, {
      method: 'PATCH',
      headers: { ...headers(String(cashier._id)), 'Idempotency-Key': 'high-complete-wrong' },
      body: JSON.stringify({ password: 'not-the-password' }),
    });
    assert.equal(completeWrong.status, 403);
    assert.equal((await WithdrawalHistory.findById(withdrawal._id))?.status, 'processing');

    const completed = await fetch(completeUrl, {
      method: 'PATCH',
      headers: { ...headers(String(cashier._id)), 'Idempotency-Key': 'high-complete-ok' },
      body: JSON.stringify({ password, transaction_hash: 'staff-ref-1' }),
    });
    const completedBody = (await completed.json()) as { status?: boolean; data?: { status?: string } };
    assert.equal(completed.status, 200);
    assert.equal(completedBody.status, true);
    assert.equal(completedBody.data?.status, 'completed');
    assert.equal((await User.findById(player._id))?.balance, 1500);
  });

  it('stops an official from adding permissions they do not hold to their own role', async () => {
    const role = await Role.create({
      name: 'Limited Desk',
      type: 'official',
      permissions: ['users.edit'],
    });
    const official = await User.create({
      email: 'self-edit@perm.test',
      username: 'selfedit',
      password: 'hashed',
      roleRef: role._id,
      role: { type: 'official', name: 'Limited Desk', permissions: ['users.edit'] },
    });
    const coworker = await User.create({
      email: 'coworker@perm.test',
      username: 'coworker',
      password: 'hashed',
      roleRef: role._id,
      role: { type: 'official', name: 'Limited Desk', permissions: ['users.edit'] },
    });

    const updated = await fetch(`${base}/api/v3/users/roles/${role._id}`, {
      method: 'PUT',
      headers: headers(String(official._id)),
      body: JSON.stringify({
        name: 'Limited Desk',
        type: 'official',
        permissions: ['users.edit', 'payments.manage'],
      }),
    });
    const updatedBody = (await updated.json()) as { message?: string };
    assert.equal(updated.status, 403);
    assert.equal(updatedBody.message, 'Permission denied');

    const saved = await Role.findById(role._id);
    assert.deepEqual(saved?.permissions, ['users.edit']);
    const fresh = await User.findById(official._id);
    const other = await User.findById(coworker._id);
    assert.deepEqual(fresh?.role?.permissions, ['users.edit']);
    assert.deepEqual(other?.role?.permissions, ['users.edit']);

    const payments = await fetch(`${base}/api/v4/payments/withdrawal-history`, {
      headers: headers(String(official._id)),
    });
    assert.equal(payments.status, 403);
  });

  it('stops an official from creating or assigning a role with permissions they do not hold', async () => {
    const official = await staff('grant-limit', 'official', ['users.edit']);
    const rich = await Role.create({
      name: 'Payments Desk',
      type: 'official',
      permissions: ['users.edit', 'payments.manage'],
    });
    const same = await Role.create({
      name: 'Edit Only',
      type: 'official',
      permissions: ['users.edit'],
    });
    const target = await User.create({
      email: 'assign-target@perm.test',
      username: 'assigntarget',
      password: 'hashed',
      role: { type: 'player', name: 'Player', permissions: [] },
    });

    const created = await fetch(`${base}/api/v3/users/roles`, {
      method: 'POST',
      headers: headers(String(official._id)),
      body: JSON.stringify({
        name: 'Self Granted',
        type: 'official',
        permissions: ['users.edit', 'payments.manage'],
      }),
    });
    assert.equal(created.status, 403);
    assert.equal(await Role.countDocuments({ name: 'Self Granted' }), 0);

    const assigned = await fetch(`${base}/api/v3/users/list/${target._id}`, {
      method: 'PUT',
      headers: headers(String(official._id)),
      body: JSON.stringify({ role: String(rich._id) }),
    });
    assert.equal(assigned.status, 403);
    const unchanged = await User.findById(target._id);
    assert.equal(unchanged?.role?.type, 'player');
    assert.deepEqual(unchanged?.role?.permissions, []);

    const allowed = await fetch(`${base}/api/v3/users/list/${target._id}`, {
      method: 'PUT',
      headers: headers(String(official._id)),
      body: JSON.stringify({ role: String(same._id) }),
    });
    assert.equal(allowed.status, 200);
    const moved = await User.findById(target._id);
    assert.equal(moved?.role?.type, 'official');
    assert.deepEqual(moved?.role?.permissions, ['users.edit']);
  });

  it('lets an admin grant permissions they do not personally list', async () => {
    const admin = await staff('perm-admin', 'admin', []);
    const role = await Role.create({
      name: 'Open Desk',
      type: 'official',
      permissions: ['users.edit'],
    });
    const member = await User.create({
      email: 'open-desk@perm.test',
      username: 'opendesk',
      password: 'hashed',
      roleRef: role._id,
      role: { type: 'official', name: 'Open Desk', permissions: ['users.edit'] },
    });

    const created = await fetch(`${base}/api/v3/users/roles`, {
      method: 'POST',
      headers: headers(String(admin._id)),
      body: JSON.stringify({
        name: 'Admin Granted',
        type: 'agent',
        permissions: ['payments.manage'],
      }),
    });
    const createdBody = (await created.json()) as { data?: { id?: string; _id?: string } };
    assert.equal(created.status, 201);
    const createdId = String(createdBody.data?.id || createdBody.data?._id);
    assert.ok(createdId);

    const updated = await fetch(`${base}/api/v3/users/roles/${role._id}`, {
      method: 'PUT',
      headers: headers(String(admin._id)),
      body: JSON.stringify({
        name: 'Open Desk',
        type: 'official',
        permissions: ['users.edit', 'payments.manage'],
      }),
    });
    assert.equal(updated.status, 200);
    const synced = await User.findById(member._id);
    assert.deepEqual(synced?.role?.permissions, ['users.edit', 'payments.manage']);

    const target = await User.create({
      email: 'admin-assign@perm.test',
      username: 'adminassign',
      password: 'hashed',
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const assigned = await fetch(`${base}/api/v3/users/list/${target._id}`, {
      method: 'PUT',
      headers: headers(String(admin._id)),
      body: JSON.stringify({ role: createdId }),
    });
    assert.equal(assigned.status, 200);
    const moved = await User.findById(target._id);
    assert.equal(moved?.role?.type, 'agent');
    assert.deepEqual(moved?.role?.permissions, ['payments.manage']);
  });
});
