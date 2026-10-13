import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { requireAdmin } from './middleware/admin.js';
import { SupportConversation } from './models/SupportConversation.js';
import { SupportMessage } from './models/SupportMessage.js';
import { User } from './models/User.js';
import filesRoutes, { resolveUploadTarget } from './routes/v1/files.js';
import appSettingsRoutes from './routes/v2/app-settings.js';
import supportRoutes from './routes/v2/customer-support.js';
import integrityRoutes from './routes/v3/integrity.js';
import { signAccessToken } from './utils/jwt.js';
import { uploadsRoot } from './utils/uploads-path.js';

const MAIL_SECRET = 'mailbox-secret-value';
const OAUTH_SECRET = 'oauth-client-secret-value';

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

describe('staff settings authorization', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';
  const tokens: Record<string, string> = {};
  let outsideFile = '';
  let insideFile = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping staff settings tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-staff-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    async function staff(name: string, type: 'admin' | 'official' | 'agent' | 'player', permissions: string[]) {
      const user = await User.create({
        email: `${name}@staff.test`,
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
    await staff('official-support', 'official', ['customer-support.view', 'customer-support.close']);
    await staff('official-flags', 'official', ['engagement.edit']);
    await staff('official-none', 'official', []);
    const player = await staff('plain-player', 'player', []);

    const conversation = await SupportConversation.create({
      userId: player._id,
      subject: 'Keep this ticket',
      category: 'other',
      status: 'open',
    });
    await SupportMessage.create({
      conversationId: conversation._id,
      body: 'Please keep this message',
      senderId: player._id,
      senderName: 'plain-player',
    });
    tokens.conversationId = conversation._id.toString();

    const folder = path.join(uploadsRoot, 'staff-settings');
    mkdirSync(folder, { recursive: true });
    insideFile = path.join(folder, `note-${process.pid}.txt`);
    fs.writeFileSync(insideFile, 'inside');
    outsideFile = path.join(path.dirname(uploadsRoot), `staff-outside-${process.pid}.txt`);
    fs.writeFileSync(outsideFile, 'outside');

    const app = express();
    app.use(express.json());
    app.use('/api/v1/files', filesRoutes);
    app.use('/api/v2/app-settings', appSettingsRoutes);
    app.use('/api/v2/customer-support', supportRoutes);
    app.use('/api/v3/integrity', requireAdmin, integrityRoutes);
    const listening = await listen(app);
    server = listening.server;
    base = listening.base;
  });

  after(async () => {
    if (insideFile && fs.existsSync(insideFile)) fs.unlinkSync(insideFile);
    if (outsideFile && fs.existsSync(outsideFile)) fs.unlinkSync(outsideFile);
    if (server) {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
    await mongoose.disconnect();
    if (replset) await replset.stop();
  });

  function auth(name: string) {
    return { Authorization: `Bearer ${tokens[name]}`, 'Content-Type': 'application/json' };
  }

  it('keeps upload targets inside the uploads directory', () => {
    const inside = resolveUploadTarget('/uploads/staff-settings/note.txt');
    assert.ok(inside);
    assert.equal(inside.startsWith(path.resolve(uploadsRoot) + path.sep), true);
    assert.equal(resolveUploadTarget('/uploads/../package.json'), null);
    assert.equal(resolveUploadTarget('/uploads/staff-settings/../../outside.txt'), null);
    assert.equal(resolveUploadTarget('/uploads-evil/note.txt'), null);
    assert.equal(resolveUploadTarget('/uploads/'), null);
  });

  it('lets a full admin manage mail and oauth secrets without returning them', async () => {
    const denied = await fetch(`${base}/api/v2/app-settings/mail-settings`, {
      method: 'PUT',
      headers: auth('official-none'),
      body: JSON.stringify({ smtpHost: 'smtp.example.test', smtpPass: MAIL_SECRET, fromEmail: 'a@example.test' }),
    });
    assert.equal(denied.status, 403);

    const saved = await fetch(`${base}/api/v2/app-settings/mail-settings`, {
      method: 'PUT',
      headers: auth('full-admin'),
      body: JSON.stringify({
        enabled: false,
        smtpHost: 'smtp.example.test',
        smtpPort: 587,
        secure: false,
        smtpUser: 'mailer',
        smtpPass: MAIL_SECRET,
        fromName: 'BattleAsia',
        fromEmail: 'noreply@example.test',
      }),
    });
    assert.equal(saved.status, 200);
    const savedBody = (await saved.json()) as { data?: { smtpPass?: string } };
    assert.equal(savedBody.data?.smtpPass, '********');
    assert.equal(JSON.stringify(savedBody).includes(MAIL_SECRET), false);

    const loaded = await fetch(`${base}/api/v2/app-settings/mail-settings`, { headers: auth('full-admin') });
    assert.equal(loaded.status, 200);
    const loadedBody = await loaded.json();
    assert.equal(JSON.stringify(loadedBody).includes(MAIL_SECRET), false);

    const playerMail = await fetch(`${base}/api/v2/app-settings/mail-settings`, { headers: auth('plain-player') });
    assert.equal(playerMail.status, 403);

    const oauthDenied = await fetch(`${base}/api/v2/app-settings/oauth-settings`, {
      method: 'PUT',
      headers: auth('official-support'),
      body: JSON.stringify({ googleClientSecret: OAUTH_SECRET }),
    });
    assert.equal(oauthDenied.status, 403);

    const oauthSaved = await fetch(`${base}/api/v2/app-settings/oauth-settings`, {
      method: 'PUT',
      headers: auth('full-admin'),
      body: JSON.stringify({
        redirectBase: 'https://battleasia.gg',
        googleEnabled: false,
        googleClientId: 'google-client',
        googleClientSecret: OAUTH_SECRET,
        discordEnabled: false,
      }),
    });
    assert.equal(oauthSaved.status, 200);
    const oauthBody = await oauthSaved.json();
    assert.equal(JSON.stringify(oauthBody).includes(OAUTH_SECRET), false);

    const oauthPublic = await fetch(`${base}/api/v2/app-settings/oauth-public`);
    assert.equal(oauthPublic.status, 200);
    const publicBody = await oauthPublic.json();
    assert.equal(JSON.stringify(publicBody).includes(OAUTH_SECRET), false);
    assert.equal(JSON.stringify(publicBody).includes('clientSecret'), false);
  });

  it('keeps apk changes for full admins and flag edits for engagement staff', async () => {
    const publicDownload = await fetch(`${base}/api/v2/app-settings/app-download`);
    assert.equal(publicDownload.status, 200);

    const officialDownload = await fetch(`${base}/api/v2/app-settings/app-download`, {
      method: 'PUT',
      headers: auth('official-none'),
      body: JSON.stringify({ enabled: false, version: '9.9.9' }),
    });
    assert.equal(officialDownload.status, 403);

    const adminDownload = await fetch(`${base}/api/v2/app-settings/app-download`, {
      method: 'PUT',
      headers: auth('full-admin'),
      body: JSON.stringify({ enabled: true, version: '1.2.3' }),
    });
    assert.equal(adminDownload.status, 200);

    const playerFlags = await fetch(`${base}/api/v2/app-settings/p1`, { headers: auth('plain-player') });
    assert.equal(playerFlags.status, 200);
    const playerWrite = await fetch(`${base}/api/v2/app-settings/p1`, {
      method: 'PUT',
      headers: auth('plain-player'),
      body: JSON.stringify({ playerTip: true }),
    });
    assert.equal(playerWrite.status, 403);

    const flags = await fetch(`${base}/api/v2/app-settings/velocity`, {
      method: 'PUT',
      headers: auth('official-flags'),
      body: JSON.stringify({ enabled: false, windowMinutes: 15, maxWithdrawals: 5, maxTransfers: 8, maxJoins: 30 }),
    });
    assert.equal(flags.status, 200);
    const flagsDenied = await fetch(`${base}/api/v2/app-settings/velocity`, {
      method: 'PUT',
      headers: auth('official-none'),
      body: JSON.stringify({ enabled: true }),
    });
    assert.equal(flagsDenied.status, 403);
  });

  it('limits audit reads, live chat edits, and support message deletion', async () => {
    const auditDenied = await fetch(`${base}/api/v3/integrity/audit`, { headers: auth('official-support') });
    assert.equal(auditDenied.status, 403);
    const auditPlayer = await fetch(`${base}/api/v3/integrity/audit`, { headers: auth('plain-player') });
    assert.equal(auditPlayer.status, 403);
    const audit = await fetch(`${base}/api/v3/integrity/audit`, { headers: auth('full-admin') });
    assert.equal(audit.status, 200);

    const livePublic = await fetch(`${base}/api/v2/customer-support/live-chat-settings`);
    assert.equal(livePublic.status, 200);
    const liveDenied = await fetch(`${base}/api/v2/customer-support/live-chat-settings`, {
      method: 'PUT',
      headers: auth('official-none'),
      body: JSON.stringify({ enabled: false }),
    });
    assert.equal(liveDenied.status, 403);
    const live = await fetch(`${base}/api/v2/customer-support/live-chat-settings`, {
      method: 'PUT',
      headers: auth('official-support'),
      body: JSON.stringify({ enabled: true }),
    });
    assert.equal(live.status, 200);

    const wipe = await fetch(`${base}/api/v2/customer-support/conversation/${tokens.conversationId}/close`, {
      method: 'PATCH',
      headers: auth('plain-player'),
      body: JSON.stringify({ deleteMessages: true }),
    });
    assert.equal(wipe.status, 403);
    assert.equal(await SupportMessage.countDocuments({ conversationId: tokens.conversationId }), 1);

    const closed = await fetch(`${base}/api/v2/customer-support/conversation/${tokens.conversationId}/close`, {
      method: 'PATCH',
      headers: auth('official-support'),
      body: JSON.stringify({ deleteMessages: true }),
    });
    assert.equal(closed.status, 200);
    assert.equal(await SupportMessage.countDocuments({ conversationId: tokens.conversationId }), 0);
  });

  it('rejects staff file deletion and paths outside uploads', async () => {
    const url = `/uploads/staff-settings/${path.basename(insideFile)}`;
    const official = await fetch(`${base}/api/v1/files`, {
      method: 'DELETE',
      headers: auth('official-none'),
      body: JSON.stringify({ url }),
    });
    assert.equal(official.status, 403);
    assert.equal(fs.existsSync(insideFile), true);

    const traversal = await fetch(`${base}/api/v1/files`, {
      method: 'DELETE',
      headers: auth('full-admin'),
      body: JSON.stringify({ url: `/uploads/../${path.basename(outsideFile)}` }),
    });
    assert.equal(traversal.status, 400);
    assert.equal(fs.existsSync(outsideFile), true);

    const removed = await fetch(`${base}/api/v1/files`, {
      method: 'DELETE',
      headers: auth('full-admin'),
      body: JSON.stringify({ url }),
    });
    assert.equal(removed.status, 200);
    assert.equal(fs.existsSync(insideFile), false);
  });
});
