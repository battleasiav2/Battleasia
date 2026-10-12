import assert from 'node:assert/strict';
import { mkdirSync, statfsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Game } from './models/Game.js';
import { Match } from './models/Match.js';
import { MatchParticipant } from './models/MatchParticipant.js';
import { User } from './models/User.js';
import gamesRoutes from './routes/v2/games.js';
import usersRoutes from './routes/v2/users.js';
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

function hasKey(value: unknown, key: string): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((item) => hasKey(item, key));
  return Object.keys(value).includes(key) || Object.values(value).some((item) => hasKey(item, key));
}

describe('match result privacy', () => {
  let replset: MongoMemoryReplSet | undefined;
  let server: http.Server;
  let base = '';
  let viewerToken = '';
  let spectatorToken = '';
  let matchId = '';
  let openMatchId = '';

  before(async () => {
    try {
      const disk = statfsSync(os.tmpdir());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        throw new Error('Skipping result privacy tests: need about 900MB free disk');
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Skipping')) throw error;
    }

    const dbPath = path.join(os.tmpdir(), `battleasia-result-${process.pid}`);
    mkdirSync(dbPath, { recursive: true });
    replset = await MongoMemoryReplSet.create({
      binary: { version: '7.0.14', arch: 'x64' },
      instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    await mongoose.connect(replset.getUri());

    const viewer = await User.create({
      email: 'viewer-secret@test.local',
      username: 'viewername',
      password: 'hashed',
      avatar: 'https://cdn.example/viewer.webp',
      status: true,
      emailVerified: true,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const rival = await User.create({
      email: 'rival-secret@test.local',
      username: 'rivalname',
      password: 'hashed',
      avatar: 'https://cdn.example/rival.webp',
      status: true,
      emailVerified: true,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    const spectator = await User.create({
      email: 'spectator-secret@test.local',
      username: 'spectatorname',
      password: 'hashed',
      status: true,
      emailVerified: true,
      role: { type: 'player', name: 'Player', permissions: [] },
    });
    viewerToken = signAccessToken(viewer._id.toString(), 0);
    spectatorToken = signAccessToken(spectator._id.toString(), 0);

    const game = await Game.create({ name: 'PUBG Mobile', packageName: 'com.pubg', idPrefix: 'BA' });
    const match = await Match.create({
      gameId: game._id,
      roomId: 'secret-room',
      password: 'room-secret',
      matchName: 'Privacy Final',
      matchSchedule: new Date().toISOString(),
      entryFee: 10,
      totalPlayer: 8,
      matchType: 'paid',
      status: 'complete',
      map: 'Erangel',
      teamType: 'solo',
    });
    const viewerPart = await MatchParticipant.create({
      matchId: match._id,
      userId: viewer._id,
      username: 'viewername',
      email: viewer.email,
      avatar: viewer.avatar,
      pubgId: 'viewer-pubg',
      entryFee: 10,
      placement: 2,
      kills: 3,
      points: 4,
    });
    const rivalPart = await MatchParticipant.create({
      matchId: match._id,
      userId: rival._id,
      username: 'rivalname',
      email: rival.email,
      avatar: rival.avatar,
      pubgId: 'rival-pubg',
      entryFee: 10,
      placement: 1,
      kills: 7,
      points: 9,
    });
    match.results = [
      {
        participantId: rivalPart._id,
        playerName: 'rivalname',
        avatar: 'https://cdn.example/rival.webp',
        pubgId: 'rival-pubg',
        status: 'winner',
        placement: 1,
        kills: 7,
        points: 9,
        placePoint: 1,
        winPrize: 20,
        bonus: 2,
        refund: 0,
      },
      {
        participantId: viewerPart._id,
        playerName: 'viewername',
        avatar: 'https://cdn.example/viewer.webp',
        pubgId: 'viewer-pubg',
        status: 'lose',
        placement: 2,
        kills: 3,
        points: 4,
        placePoint: 0,
        winPrize: 0,
        bonus: 0,
        refund: 0,
      },
    ];
    await match.save();
    matchId = match._id.toString();

    const open = await Match.create({
      gameId: game._id,
      roomId: 'open-room',
      password: 'open-secret',
      matchName: 'Privacy Open',
      matchSchedule: new Date().toISOString(),
      entryFee: 0,
      totalPlayer: 8,
      matchType: 'free',
      status: 'complete',
      map: 'Miramar',
      teamType: 'solo',
      results: [],
    });
    await MatchParticipant.create({
      matchId: open._id,
      userId: rival._id,
      username: 'rivalname',
      email: rival.email,
      avatar: rival.avatar,
      pubgId: 'rival-pubg',
      entryFee: 0,
      placement: 1,
      kills: 1,
      points: 1,
    });
    openMatchId = open._id.toString();

    const app = express();
    app.use(express.json());
    app.use('/api/v2/games', gamesRoutes);
    app.use('/api/v2/users', usersRoutes);
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

  it('lets a logged-in player read a result without other players emails', async () => {
    const denied = await fetch(`${base}/api/v2/games/matches/${matchId}/result`);
    assert.equal(denied.status, 401);

    const response = await fetch(`${base}/api/v2/games/matches/${matchId}/result`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      data: { participants: Array<Record<string, unknown>> };
    };
    const raw = JSON.stringify(body);
    assert.equal(raw.includes('rival-secret@test.local'), false);
    assert.equal(raw.includes('viewer-secret@test.local'), false);
    assert.equal(raw.includes('room-secret'), false);
    assert.equal(hasKey(body, 'email'), false);
    assert.equal(hasKey(body, 'password'), false);
    assert.equal(hasKey(body, 'balance'), false);

    const rival = body.data.participants.find((row) => row.username === 'rivalname');
    assert.ok(rival);
    assert.equal(rival.avatar, 'https://cdn.example/rival.webp');
    assert.equal(rival.placement, 1);
    assert.equal(rival.kills, 7);
    assert.equal(rival.winPrize, 20);
    assert.equal(rival.pubgId, 'rival-pubg');

    const spectator = await fetch(`${base}/api/v2/games/matches/${matchId}/result`, {
      headers: { Authorization: `Bearer ${spectatorToken}` },
    });
    assert.equal(spectator.status, 200);
  });

  it('omits email when a result has not been posted yet', async () => {
    const response = await fetch(`${base}/api/v2/games/matches/${openMatchId}/result`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as { data: { participants: Array<Record<string, unknown>> } };
    assert.equal(JSON.stringify(body).includes('rival-secret@test.local'), false);
    assert.equal(body.data.participants[0]?.username, 'rivalname');
    assert.equal(body.data.participants[0]?.avatar, 'https://cdn.example/rival.webp');
  });

  it('keeps match history and leaderboard free of participant emails', async () => {
    const historyRes = await fetch(`${base}/api/v2/games/matches/history/me`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert.equal(historyRes.status, 200);
    const history = (await historyRes.json()) as {
      data: Array<{ matchName: string; kills: number; rank: number; amountWon: number }>;
    };
    const row = history.data.find((item) => item.matchName === 'Privacy Final');
    assert.ok(row);
    assert.equal(row.kills, 3);
    assert.equal(row.rank, 2);
    assert.equal(row.amountWon, 0);
    assert.equal(hasKey(history, 'email'), false);
    assert.equal(JSON.stringify(history).includes('rival-secret@test.local'), false);

    const boardRes = await fetch(`${base}/api/v2/users/leaderboard`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert.equal(boardRes.status, 200);
    const board = (await boardRes.json()) as {
      data: Array<{ username: string; avatar: string; rank: number; totalScore: number }>;
    };
    const rival = board.data.find((item) => item.username === 'rivalname');
    assert.ok(rival);
    assert.equal(rival.avatar, 'https://cdn.example/rival.webp');
    assert.equal(typeof rival.rank, 'number');
    assert.equal(typeof rival.totalScore, 'number');
    assert.equal(hasKey(board, 'email'), false);
    assert.equal(JSON.stringify(board).includes('rival-secret@test.local'), false);

    const boardDenied = await fetch(`${base}/api/v2/users/leaderboard`);
    assert.equal(boardDenied.status, 401);
    const historyDenied = await fetch(`${base}/api/v2/games/matches/history/me`);
    assert.equal(historyDenied.status, 401);
  });
});
