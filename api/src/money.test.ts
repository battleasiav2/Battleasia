import assert from 'node:assert/strict';
import { mkdirSync, statfsSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from './models/User.js';
import { Match } from './models/Match.js';
import { MatchParticipant } from './models/MatchParticipant.js';
import { DepositHistory } from './models/DepositHistory.js';
import { WithdrawalHistory } from './models/WithdrawalHistory.js';
import { LedgerEntry } from './models/LedgerEntry.js';
import {
  MoneyError,
  approveDepositMoney,
  approveWithdrawMoney,
  completeWithdrawMoney,
  distributeMatchWinnings,
  joinPaidMatch,
  leavePaidMatch,
  refundMatchEntries,
  rejectDepositMoney,
  refundWithdrawMoney,
  transferMoney,
} from './utils/money.js';
import { assertClearOfVelocity } from './utils/velocity.js';

let replset: MongoMemoryReplSet | undefined;

async function makeUser(n: number, balance: number) {
  return User.create({
    email: `p${n}@test.local`,
    username: `player${n}`,
    password: 'hashed',
    pubgId: `pubg${n}`,
    balance,
  });
}

async function makeMatch(opts: { entryFee: number; totalPlayer: number; status?: string; matchType?: 'free' | 'paid' }) {
  return Match.create({
    gameId: new mongoose.Types.ObjectId(),
    roomId: `room-${Date.now()}-${Math.random()}`,
    matchName: 'Paid lobby',
    matchSchedule: new Date().toISOString(),
    entryFee: opts.entryFee,
    totalPlayer: opts.totalPlayer,
    matchType: opts.matchType ?? 'paid',
    status: opts.status ?? 'active',
    map: 'Erangel',
    teamType: 'solo',
  });
}

describe('§2.9 money engine', () => {
  before(async () => {
    const liveUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (liveUri && /replicaSet|mongodb\+srv/i.test(liveUri)) {
      await mongoose.connect(liveUri);
      return;
    }
    try {
      const disk = statfsSync(process.cwd());
      const free = Number(disk.bavail) * Number(disk.bsize);
      if (free < 900 * 1024 * 1024) {
        console.warn('Skipping MongoMemoryReplSet: need ~900MB free disk (set MONGODB_URI replica to run)');
        process.exit(0);
      }
    } catch {
      /* statfs missing on some Node builds */
    }
    const dbPath = path.join(process.cwd(), '.mongo-mem');
    mkdirSync(dbPath, { recursive: true });
    try {
      replset = await MongoMemoryReplSet.create({
        binary: { version: '7.0.14', arch: 'x64' },
        instanceOpts: [{ dbPath, args: ['--wiredTigerCacheSizeGB', '0.25'] }],
        replSet: { count: 1, storageEngine: 'wiredTiger' },
      });
      await mongoose.connect(replset.getUri());
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (/ENOSPC|No space/i.test(msg)) {
        console.warn('Skipping money tests: disk full');
        process.exit(0);
      }
      throw error;
    }
  });

  after(async () => {
    await mongoose.disconnect();
    if (replset) await replset.stop();
  });

  it('approves a deposit and credits the wallet once', async () => {
    const user = await makeUser(1, 10);
    const deposit = await DepositHistory.create({
      userId: user._id,
      user_email: user.email,
      username: user.username,
      transaction_id: `dep-${Date.now()}`,
      coin_amount: 50,
      payment_channel: new mongoose.Types.ObjectId(),
      status: 'pending',
    });
    const first = await approveDepositMoney({ depositId: String(deposit._id), idempotencyKey: 'dep-1' });
    assert.equal(first.balance, 60);
    await assert.rejects(() => approveDepositMoney({ depositId: String(deposit._id), idempotencyKey: 'dep-2' }), MoneyError);
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 60);
    const ledgers = await LedgerEntry.find({ refType: 'deposit_approve', refId: String(deposit._id) });
    assert.equal(ledgers.length, 1);
  });

  it('rejects a pending deposit without changing balance', async () => {
    const user = await makeUser(2, 7);
    const deposit = await DepositHistory.create({
      userId: user._id,
      transaction_id: `dep-r-${Date.now()}`,
      coin_amount: 20,
      payment_channel: new mongoose.Types.ObjectId(),
      status: 'pending',
    });
    await rejectDepositMoney(String(deposit._id));
    const fresh = await User.findById(user._id);
    assert.equal(fresh?.balance, 7);
    const saved = await DepositHistory.findById(deposit._id);
    assert.equal(saved?.status, 'rejected');
  });

  it('debits on join, blocks insufficient funds, double join, and a full lobby', async () => {
    const rich = await makeUser(3, 100);
    const poor = await makeUser(4, 5);
    const other = await makeUser(5, 100);
    const match = await makeMatch({ entryFee: 25, totalPlayer: 1 });

    await assert.rejects(() => joinPaidMatch({ userId: String(poor._id), matchId: String(match._id) }), (err: unknown) => {
      assert.ok(err instanceof MoneyError);
      assert.match(err.message, /Insufficient/);
      return true;
    });

    const joined = await joinPaidMatch({ userId: String(rich._id), matchId: String(match._id), idempotencyKey: 'join-a' });
    assert.equal(joined.balance, 75);
    assert.equal(joined.replayed, false);

    const replay = await joinPaidMatch({ userId: String(rich._id), matchId: String(match._id), idempotencyKey: 'join-a' });
    assert.equal(replay.replayed, true);
    assert.equal(replay.balance, 75);

    await assert.rejects(() => joinPaidMatch({ userId: String(rich._id), matchId: String(match._id), idempotencyKey: 'join-b' }), MoneyError);
    await assert.rejects(() => joinPaidMatch({ userId: String(other._id), matchId: String(match._id) }), (err: unknown) => {
      assert.ok(err instanceof MoneyError);
      assert.match(err.message, /full/i);
      return true;
    });

    const count = await LedgerEntry.countDocuments({ refType: 'match_join', refId: String(match._id) });
    assert.equal(count, 1);
  });

  it('refunds leave before start and refuses leave after start', async () => {
    const user = await makeUser(6, 40);
    const match = await makeMatch({ entryFee: 10, totalPlayer: 4 });
    await joinPaidMatch({ userId: String(user._id), matchId: String(match._id) });
    const left = await leavePaidMatch({ userId: String(user._id), matchId: String(match._id) });
    assert.equal(left.refunded, 10);
    assert.equal(left.balance, 40);
    const part = await MatchParticipant.findOne({ matchId: match._id, userId: user._id });
    assert.equal(part, null);
    const joinRow = await LedgerEntry.findOne({ refType: 'match_join', refId: String(match._id) });
    const rev = await LedgerEntry.findOne({ reversalOf: joinRow?._id });
    assert.ok(joinRow);
    assert.ok(rev);
    const stillThere = await LedgerEntry.findById(joinRow!._id);
    assert.ok(stillThere, 'original ledger must not be deleted');

    const match2 = await makeMatch({ entryFee: 10, totalPlayer: 4, status: 'start' });
    const user2 = await makeUser(7, 40);
    match2.status = 'active';
    await match2.save();
    await joinPaidMatch({ userId: String(user2._id), matchId: String(match2._id) });
    match2.status = 'start';
    await match2.save();
    await assert.rejects(() => leavePaidMatch({ userId: String(user2._id), matchId: String(match2._id) }), (err: unknown) => {
      assert.ok(err instanceof MoneyError);
      assert.equal(err.status, 403);
      return true;
    });
    const stillIn = await MatchParticipant.findOne({ matchId: match2._id, userId: user2._id });
    assert.ok(stillIn);
  });

  it('ready is lobby-only and does not move BAC', async () => {
    const user = await makeUser(8, 30);
    const match = await makeMatch({ entryFee: 10, totalPlayer: 4 });
    await joinPaidMatch({ userId: String(user._id), matchId: String(match._id) });
    const part = await MatchParticipant.findOne({ matchId: match._id, userId: user._id });
    assert.equal(part?.ready, false);
    part!.ready = true;
    await part!.save();
    const after = await User.findById(user._id);
    assert.equal(after?.balance, 20);
    const extra = await LedgerEntry.countDocuments({ userId: user._id, refType: { $nin: ['match_join'] } });
    assert.equal(extra, 0);
  });

  it('withdraw approve, complete, and reject-refund reverse without deleting the original', async () => {
    const user = await makeUser(9, 80);
    const wd = await WithdrawalHistory.create({
      userId: user._id,
      user_email: user.email,
      username: user.username,
      coin_amount: 30,
      wallet_address: 'Txxxxxxxx',
      status: 'pending',
    });
    const approved = await approveWithdrawMoney({ withdrawalId: String(wd._id), idempotencyKey: 'wd-a' });
    assert.equal(approved.balance, 50);
    const afterApprove = await User.findById(user._id);
    assert.equal(afterApprove?.balance, 50);

    const completed = await completeWithdrawMoney({
      withdrawalId: String(wd._id),
      transactionHash: '0xabc',
      idempotencyKey: 'wd-c',
    });
    assert.equal(completed.balance, 50);
    const done = await WithdrawalHistory.findById(wd._id);
    assert.equal(done?.status, 'completed');

    const userB = await makeUser(10, 80);
    const wd2 = await WithdrawalHistory.create({
      userId: userB._id,
      coin_amount: 20,
      wallet_address: 'Tyyyy',
      status: 'pending',
    });
    await approveWithdrawMoney({ withdrawalId: String(wd2._id) });
    const original = await LedgerEntry.findOne({ refType: 'withdraw_approve', refId: String(wd2._id) });
    const refunded = await refundWithdrawMoney({ withdrawalId: String(wd2._id), idempotencyKey: 'wd-r' });
    assert.equal(refunded.balance, 80);
    const stillOriginal = await LedgerEntry.findById(original!._id);
    assert.ok(stillOriginal);
    const reversal = await LedgerEntry.findOne({ reversalOf: original!._id });
    assert.ok(reversal);
    const rejected = await WithdrawalHistory.findById(wd2._id);
    assert.equal(rejected?.status, 'rejected');
  });

  it('transfers BAC with a fee pair and replays the same idempotency key', async () => {
    const sender = await makeUser(12, 200);
    const recipient = await makeUser(13, 10);
    const sent = await transferMoney({
      senderId: String(sender._id),
      recipientUsername: recipient.username,
      amount: 50,
      feeAmount: 1,
      totalDebited: 51,
      feePercent: 2,
      idempotencyKey: 'p2p-1',
    });
    assert.equal(sent.replayed, false);
    assert.equal(sent.senderBalance, 149);
    assert.equal(sent.recipientBalance, 60);
    const replay = await transferMoney({
      senderId: String(sender._id),
      recipientUsername: recipient.username,
      amount: 50,
      feeAmount: 1,
      totalDebited: 51,
      feePercent: 2,
      idempotencyKey: 'p2p-1',
    });
    assert.equal(replay.replayed, true);
    const again = await User.findById(sender._id);
    assert.equal(again?.balance, 149);
    const feeRow = await LedgerEntry.findOne({ refType: 'p2p_transfer_fee', refId: sent.transfer.id });
    assert.ok(feeRow);
  });

  it('distributes winnings once and refunds unpaid entries with a reversal', async () => {
    const winner = await makeUser(14, 20);
    const loser = await makeUser(15, 20);
    const match = await makeMatch({ entryFee: 10, totalPlayer: 4 });
    await joinPaidMatch({ userId: String(winner._id), matchId: String(match._id) });
    await joinPaidMatch({ userId: String(loser._id), matchId: String(match._id) });
    const parts = await MatchParticipant.find({ matchId: match._id });
    match.results = [
      { participantId: parts[0]._id, status: 'winner', winPrize: 18, bonus: 0, placePoint: 0, kills: 2, points: 0 },
      { participantId: parts[1]._id, status: 'lose', winPrize: 0, bonus: 0, placePoint: 0, kills: 0, points: 0 },
    ];
    await match.save();
    const paid = await distributeMatchWinnings(String(match._id));
    assert.equal(paid.payouts.length, 1);
    await assert.rejects(() => distributeMatchWinnings(String(match._id)), MoneyError);

    const match2 = await makeMatch({ entryFee: 8, totalPlayer: 4 });
    const a = await makeUser(16, 30);
    await joinPaidMatch({ userId: String(a._id), matchId: String(match2._id) });
    const refunded = await refundMatchEntries(String(match2._id));
    assert.equal(refunded.refunds[0]?.amount, 8);
    const after = await User.findById(a._id);
    assert.equal(after?.balance, 30);
    const joinRow = await LedgerEntry.findOne({ refType: 'match_join', refId: String(match2._id) });
    assert.ok(await LedgerEntry.findById(joinRow!._id));
    assert.ok(await LedgerEntry.findOne({ reversalOf: joinRow!._id }));
    await assert.rejects(() => refundMatchEntries(String(match2._id)), MoneyError);
  });

  it('opens a velocity hold when the window is exceeded', async () => {
    const { AppSettings } = await import('./models/AppSettings.js');
    await AppSettings.deleteMany({});
    await AppSettings.create({
      key: 'global',
      velocitySettings: { enabled: true, windowMinutes: 15, maxWithdrawals: 5, maxTransfers: 1, maxJoins: 30 },
    });
    const sender = await makeUser(17, 500);
    const recipient = await makeUser(18, 0);
    await transferMoney({
      senderId: String(sender._id),
      recipientUsername: recipient.username,
      amount: 10,
      feeAmount: 0,
      totalDebited: 10,
      feePercent: 0,
    });
    await assert.rejects(() => assertClearOfVelocity(String(sender._id), 'transfer'), MoneyError);
    await AppSettings.deleteMany({});
  });
});
