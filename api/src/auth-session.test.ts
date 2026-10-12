import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { env } from './config/env.js';
import { requireAdmin } from './middleware/admin.js';
import { User } from './models/User.js';
import { VerificationCode } from './models/VerificationCode.js';
import authRoutes from './routes/v3/auth.js';
import usersListRoutes from './routes/v3/users/list.js';
import usersRoutes from './routes/v2/users.js';
import { findOrCreateSocialUser, providerEmailIsVerified, publicOrigin } from './utils/social-login.js';
import { issuePair } from './utils/token-session.js';
import { storeVerificationCode } from './utils/verification-code.js';
import type { OAuthSettings } from './models/AppSettings.js';
import type { Request } from 'express';

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

async function createUser(input: {
  email: string;
  username: string;
  status?: boolean;
  emailVerified?: boolean;
  role?: 'player' | 'official' | 'admin';
  password?: string;
}) {
  const role = input.role || 'player';
  return User.create({
    email: input.email,
    username: input.username,
    password: await bcrypt.hash(input.password || 'password-1', 4),
    status: input.status ?? true,
    emailVerified: input.emailVerified ?? true,
    role: { type: role, name: role, permissions: [] },
  });
}

const oauthSettings: OAuthSettings = {
  redirectBase: 'https://battleasia.gg',
  googleEnabled: false,
  googleClientId: '',
  googleClientSecret: '',
  discordEnabled: false,
  discordClientId: '',
  discordClientSecret: '',
};

function fakeRequest(host: string, forwardedHost = host) {
  return {
    protocol: 'https',
    hostname: host,
    headers: { 'x-forwarded-host': forwardedHost, host },
    get(name: string) {
      return name === 'host' ? host : undefined;
    },
  } as unknown as Request;
}

describe('authentication session security', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping auth session tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-auth-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.use('/api/v2/users', usersRoutes);
    app.use('/api/v3/users/auth', authRoutes);
    app.use('/api/v3/users/list', requireAdmin, usersListRoutes);
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

  it('logout bumps only that user token version', async () => {
    const player = await createUser({ email: 'logout@example.com', username: 'logoutuser' });
    const other = await createUser({ email: 'other@example.com', username: 'otheruser' });
    const pair = issuePair(player._id.toString(), 0);
    const otherPair = issuePair(other._id.toString(), 0);

    const loggedOut = await fetch(`${base}/api/v2/users/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pair.accessToken}` },
    });
    assert.equal(loggedOut.status, 200);

    const me = await fetch(`${base}/api/v2/users/me/presence`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pair.accessToken}` },
    });
    assert.equal(me.status, 401);

    const refresh = await fetch(`${base}/api/v2/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: pair.refreshToken }),
    });
    assert.equal(refresh.status, 401);

    const otherMe = await fetch(`${base}/api/v2/users/me/presence`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${otherPair.accessToken}` },
    });
    assert.equal(otherMe.status, 200);

    const reloaded = await User.findById(player._id);
    const otherReloaded = await User.findById(other._id);
    assert.equal(reloaded?.tokenVersion, 1);
    assert.equal(otherReloaded?.tokenVersion || 0, 0);
  });

  it('rejects an expired access token and still renews a live refresh token', async () => {
    const player = await createUser({ email: 'refresh@example.com', username: 'refreshuser' });
    const pair = issuePair(player._id.toString(), 0);
    const expiredAccess = jwt.sign(
      { userId: player._id.toString(), typ: 'access', ver: 0, exp: Math.floor(Date.now() / 1000) - 30 },
      env.jwtSecret,
    );

    const rejected = await fetch(`${base}/api/v2/users/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${expiredAccess}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(rejected.status, 401);

    const renewed = await fetch(`${base}/api/v2/users/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${expiredAccess}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: pair.refreshToken }),
    });
    assert.equal(renewed.status, 200);
    const body = (await renewed.json()) as { refreshToken?: string };
    assert.ok(body.refreshToken);
  });

  it('disabling an account invalidates that account only', async () => {
    const admin = await createUser({ email: 'admin-auth@example.com', username: 'authadmin', role: 'admin' });
    const player = await createUser({ email: 'disabled@example.com', username: 'disableduser' });
    const other = await createUser({ email: 'still-active@example.com', username: 'stillactive' });
    const adminToken = issuePair(admin._id.toString(), 0).accessToken;
    const pair = issuePair(player._id.toString(), 0);
    const otherPair = issuePair(other._id.toString(), 0);

    const disabled = await fetch(`${base}/api/v3/users/list/${player._id.toString()}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: false, reason: 'security test' }),
    });
    assert.equal(disabled.status, 200);

    const me = await fetch(`${base}/api/v2/users/me/presence`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pair.accessToken}` },
    });
    assert.equal(me.status, 401);

    const refresh = await fetch(`${base}/api/v2/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: pair.refreshToken }),
    });
    assert.equal(refresh.status, 401);

    const otherMe = await fetch(`${base}/api/v2/users/me/presence`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${otherPair.accessToken}` },
    });
    assert.equal(otherMe.status, 200);
    const reloaded = await User.findById(player._id);
    const otherReloaded = await User.findById(other._id);
    assert.equal(reloaded?.status, false);
    assert.equal(reloaded?.tokenVersion, 1);
    assert.equal(otherReloaded?.tokenVersion || 0, 0);
  });

  it('rejects a disabled staff account at admin OTP verification', async () => {
    const staff = await createUser({
      email: 'staff-otp@example.com',
      username: 'staffotp',
      role: 'official',
      status: false,
      password: 'staff-password',
    });
    await VerificationCode.create({
      email: staff.email,
      code: '112233',
      type: 'admin_login',
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const response = await fetch(`${base}/api/v3/users/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: staff.email, password: 'staff-password', code: '112233' }),
    });
    assert.equal(response.status, 403);
    const body = (await response.json()) as { token?: string; message?: string };
    assert.equal(body.token, undefined);
    assert.match(body.message || '', /disabled/i);
    const remaining = await VerificationCode.findOne({ email: staff.email, type: 'admin_login' });
    assert.ok(remaining);
  });

  it('limits signup and reset code attempts and keeps legacy plaintext codes usable', async () => {
    const signup = await createUser({
      email: 'otp-limit@example.com',
      username: 'otplimit',
      emailVerified: false,
      status: false,
    });
    await VerificationCode.create({
      email: signup.email,
      code: '123456',
      type: 'signup',
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const wrong = await fetch(`${base}/api/v2/users/verify-email-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signup.email, code: '000000' }),
      });
      assert.ok(wrong.status === 400 || wrong.status === 429);
    }
    const locked = await fetch(`${base}/api/v2/users/verify-email-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signup.email, code: '123456' }),
    });
    assert.ok(locked.status === 400 || locked.status === 429);
    assert.equal(await VerificationCode.countDocuments({ email: signup.email, type: 'signup' }), 0);

    const hashedUser = await createUser({
      email: 'otp-hash@example.com',
      username: 'otphash',
      emailVerified: false,
      status: false,
    });
    await storeVerificationCode(hashedUser.email, 'signup', '654321', new Date(Date.now() + 10 * 60 * 1000));
    const stored = await VerificationCode.findOne({ email: hashedUser.email, type: 'signup' });
    assert.ok(stored?.code.startsWith('$2'));
    const verified = await fetch(`${base}/api/v2/users/verify-email-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: hashedUser.email, code: '654321' }),
    });
    assert.equal(verified.status, 200);

    const resetUser = await createUser({ email: 'reset-legacy@example.com', username: 'resetlegacy' });
    await VerificationCode.create({
      email: resetUser.email,
      code: '445566',
      type: 'reset',
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    const checked = await fetch(`${base}/api/v2/users/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetUser.email, code: '445566' }),
    });
    assert.equal(checked.status, 200);
    const reset = await fetch(`${base}/api/v2/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetUser.email, code: '445566', newPassword: 'new-password-1' }),
    });
    assert.equal(reset.status, 200);
    const resetReloaded = await User.findById(resetUser._id);
    assert.equal(resetReloaded?.tokenVersion, 1);

    const hidden = await fetch(`${base}/api/v2/users/resend-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'missing-person@example.com' }),
    });
    assert.equal(hidden.status, 200);
    assert.equal(await VerificationCode.countDocuments({ email: 'missing-person@example.com' }), 0);
  });

  it('rejects unverified provider emails and untrusted callback hosts', async () => {
    assert.equal(providerEmailIsVerified(true), true);
    assert.equal(providerEmailIsVerified(false), false);
    assert.equal(providerEmailIsVerified(undefined), false);

    const hostile = publicOrigin(fakeRequest('evil.example', 'evil.example'), oauthSettings);
    assert.equal(hostile, 'https://battleasia.gg');
    const allowed = publicOrigin(fakeRequest('battleasia.gg'), oauthSettings);
    assert.equal(allowed, 'https://battleasia.gg');

    const existing = await createUser({ email: 'oauth-link@example.com', username: 'oauthlink' });
    await assert.rejects(
      () =>
        findOrCreateSocialUser('google', {
          id: 'google-unverified',
          email: existing.email,
          name: 'OAuth',
          avatar: '',
          emailVerified: false,
        }),
      /email/,
    );
    const untouched = await User.findById(existing._id);
    assert.equal(untouched?.googleId, undefined);

    const linked = await findOrCreateSocialUser('discord', {
      id: 'discord-verified',
      email: existing.email,
      name: 'OAuth',
      avatar: '',
      emailVerified: true,
    });
    assert.equal(linked.discordId, 'discord-verified');
  });
});
