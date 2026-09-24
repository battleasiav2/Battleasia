import mongoose from 'mongoose';
import { User, type IUser } from '../models/User.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { BalanceHistory } from '../models/BalanceHistory.js';
import { Match } from '../models/Match.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { DepositHistory } from '../models/DepositHistory.js';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';
import { UserTransferHistory, serializeUserTransferHistory } from '../models/UserTransferHistory.js';

export class MoneyError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function walletAccount(userId: string) {
  return `user:${userId}:wallet`;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export async function runMoney<T>(fn: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function postPair(
  session: mongoose.ClientSession,
  input: {
    debitAccount: string;
    creditAccount: string;
    amount: number;
    userId?: mongoose.Types.ObjectId;
    refType: string;
    refId: string;
    idempotencyKey?: string;
    reversalOf?: mongoose.Types.ObjectId;
  },
) {
  const amount = roundMoney(input.amount);
  if (amount < 0) throw new MoneyError('Ledger amount cannot be negative');
  if (input.idempotencyKey) {
    const existing = await LedgerEntry.findOne({ idempotencyKey: input.idempotencyKey }).session(session);
    if (existing) return existing;
  }
  const rows = await LedgerEntry.create(
    [
      {
        debitAccount: input.debitAccount,
        creditAccount: input.creditAccount,
        amount,
        userId: input.userId,
        refType: input.refType,
        refId: input.refId,
        idempotencyKey: input.idempotencyKey || undefined,
        reversalOf: input.reversalOf || undefined,
      },
    ],
    { session },
  );
  return rows[0];
}

async function writeHistory(
  session: mongoose.ClientSession,
  user: IUser,
  amount: number,
  type: 'deposit' | 'withdraw',
  balanceBefore: number,
  balanceAfter: number,
  detail: Record<string, unknown>,
) {
  await BalanceHistory.create(
    [
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        amount,
        type,
        balanceBefore,
        balanceAfter,
        detail,
      },
    ],
    { session },
  );
}

export async function reverseEntry(
  session: mongoose.ClientSession,
  originalId: mongoose.Types.ObjectId,
  idempotencyKey?: string,
) {
  const original = await LedgerEntry.findById(originalId).session(session);
  if (!original) throw new MoneyError('Original ledger entry not found', 404);
  return postPair(session, {
    debitAccount: original.creditAccount,
    creditAccount: original.debitAccount,
    amount: original.amount,
    userId: original.userId,
    refType: `${original.refType}_reversal`,
    refId: original.refId,
    idempotencyKey,
    reversalOf: original._id,
  });
}

export async function joinPaidMatch(input: {
  userId: string;
  matchId: string;
  idempotencyKey?: string;
}) {
  const { assertClearOfVelocity } = await import('./velocity.js');
  await assertClearOfVelocity(input.userId, 'join');
  return runMoney(async (session) => {
    if (input.idempotencyKey) {
      const replay = await LedgerEntry.findOne({ idempotencyKey: input.idempotencyKey }).session(session);
      if (replay) {
        const user = await User.findById(input.userId).session(session);
        const part = await MatchParticipant.findOne({ matchId: input.matchId, userId: input.userId }).session(session);
        return { balance: user?.balance ?? 0, participantId: part?._id.toString() || '', replayed: true };
      }
    }

    const match = await Match.findById(input.matchId).session(session);
    if (!match) throw new MoneyError('Match not found', 404);
    if (match.status !== 'active' && match.status !== 'start') throw new MoneyError('Match is not joinable');

    const user = await User.findById(input.userId).session(session);
    if (!user) throw new MoneyError('Unauthorized', 401);

    const existing = await MatchParticipant.findOne({ matchId: match._id, userId: user._id }).session(session);
    if (existing) throw new MoneyError('Already joined this match');

    // One live match at a time — block joining another while still in active/start.
    const otherParts = await MatchParticipant.find({ userId: user._id }).session(session).select('matchId');
    if (otherParts.length) {
      const otherIds = otherParts.map((p) => p.matchId);
      const blocking = await Match.findOne({
        _id: { $in: otherIds },
        status: { $in: ['active', 'start'] },
      })
        .session(session)
        .select('matchName status');
      if (blocking) {
        throw new MoneyError(
          `You can only join one live match at a time. Leave or finish “${blocking.matchName}” first.`
        );
      }
    }

    const participantCount = await MatchParticipant.countDocuments({ matchId: match._id }).session(session);
    if (participantCount >= match.totalPlayer) throw new MoneyError('Match is full');

    const entryFee = match.matchType === 'free' ? 0 : roundMoney(match.entryFee);
    const balanceBefore = user.balance ?? 0;
    if (entryFee > balanceBefore) throw new MoneyError('Insufficient balance');

    if (entryFee > 0) {
      const updated = await User.findOneAndUpdate(
        { _id: user._id, balance: { $gte: entryFee } },
        { $inc: { balance: -entryFee } },
        { new: true, session },
      );
      if (!updated) throw new MoneyError('Insufficient balance');
      user.balance = updated.balance;
      await postPair(session, {
        debitAccount: walletAccount(user._id.toString()),
        creditAccount: `match:${match._id}:pool`,
        amount: entryFee,
        userId: user._id,
        refType: 'match_join',
        refId: match._id.toString(),
        idempotencyKey: input.idempotencyKey,
      });
      await writeHistory(session, user, entryFee, 'withdraw', balanceBefore, updated.balance ?? 0, {
        reason: 'match_entry_fee',
        matchId: match._id.toString(),
        matchName: match.matchName,
      });
    }

    const participant = await MatchParticipant.create(
      [
        {
          matchId: match._id,
          userId: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || '',
          pubgId: user.pubgId,
          entryFee,
          joinedAt: new Date(),
          ready: false,
        },
      ],
      { session },
    );

    return { balance: user.balance ?? 0, participantId: participant[0]._id.toString(), replayed: false };
  });
}

export async function leavePaidMatch(input: { userId: string; matchId: string; idempotencyKey?: string }) {
  return runMoney(async (session) => {
    const match = await Match.findById(input.matchId).session(session);
    if (!match) throw new MoneyError('Match not found', 404);
    if (match.status !== 'active') throw new MoneyError('Cannot leave after the match has started', 403);

    const user = await User.findById(input.userId).session(session);
    if (!user) throw new MoneyError('Unauthorized', 401);

    const part = await MatchParticipant.findOne({ matchId: match._id, userId: user._id }).session(session);
    if (!part) throw new MoneyError('Not in this match', 404);

    const fee = roundMoney(part.entryFee || 0);
    await MatchParticipant.deleteOne({ _id: part._id }).session(session);

    if (fee > 0) {
      const original = await LedgerEntry.findOne({
        refType: 'match_join',
        refId: match._id.toString(),
        userId: user._id,
        reversalOf: null,
      }).session(session);
      const balanceBefore = user.balance ?? 0;
      const updated = await User.findByIdAndUpdate(user._id, { $inc: { balance: fee } }, { new: true, session });
      user.balance = updated?.balance ?? balanceBefore + fee;
      if (original) {
        await reverseEntry(session, original._id, input.idempotencyKey);
      } else {
        await postPair(session, {
          debitAccount: `match:${match._id}:pool`,
          creditAccount: walletAccount(user._id.toString()),
          amount: fee,
          userId: user._id,
          refType: 'match_join_reversal',
          refId: match._id.toString(),
          idempotencyKey: input.idempotencyKey,
        });
      }
      await writeHistory(session, user, fee, 'deposit', balanceBefore, user.balance ?? 0, {
        reason: 'match_leave_refund',
        matchId: match._id.toString(),
      });
    }

    return { refunded: fee, balance: user.balance ?? 0 };
  });
}

export async function approveDepositMoney(input: { depositId: string; adminId?: string; idempotencyKey?: string }) {
  return runMoney(async (session) => {
    const deposit = await DepositHistory.findById(input.depositId).session(session);
    if (!deposit) throw new MoneyError('Deposit not found', 404);
    if (deposit.status !== 'pending') throw new MoneyError('Deposit is not pending');
    const user = await User.findById(deposit.userId).session(session);
    if (!user) throw new MoneyError('User not found', 404);
    const amount = roundMoney(deposit.coin_amount);
    const balanceBefore = user.balance ?? 0;
    const updated = await User.findByIdAndUpdate(user._id, { $inc: { balance: amount } }, { new: true, session });
    user.balance = updated?.balance ?? balanceBefore + amount;
    deposit.status = 'completed';
    deposit.processed_at = new Date();
    await deposit.save({ session });
    await postPair(session, {
      debitAccount: 'platform:reserve',
      creditAccount: walletAccount(user._id.toString()),
      amount,
      userId: user._id,
      refType: 'deposit_approve',
      refId: deposit._id.toString(),
      idempotencyKey: input.idempotencyKey,
    });
    await writeHistory(session, user, amount, 'deposit', balanceBefore, user.balance ?? 0, {
      reason: 'deposit_approved',
      deposit_id: deposit._id.toString(),
    });
    return { balance: user.balance ?? 0 };
  });
}

export async function rejectDepositMoney(depositId: string) {
  const deposit = await DepositHistory.findById(depositId);
  if (!deposit) throw new MoneyError('Deposit not found', 404);
  if (deposit.status !== 'pending') throw new MoneyError('Deposit is not pending');
  deposit.status = 'rejected';
  deposit.processed_at = new Date();
  await deposit.save();
  return { status: deposit.status };
}

export async function approveWithdrawMoney(input: { withdrawalId: string; idempotencyKey?: string }) {
  return runMoney(async (session) => {
    const withdrawal = await WithdrawalHistory.findById(input.withdrawalId).session(session);
    if (!withdrawal) throw new MoneyError('Withdrawal not found', 404);
    if (withdrawal.status !== 'pending') throw new MoneyError('Withdrawal is not pending');
    const user = await User.findById(withdrawal.userId).session(session);
    if (!user) throw new MoneyError('User not found', 404);
    const amount = roundMoney(withdrawal.coin_amount);
    const balanceBefore = user.balance ?? 0;
    if (balanceBefore < amount) throw new MoneyError('Insufficient user balance');
    const updated = await User.findOneAndUpdate(
      { _id: user._id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true, session },
    );
    if (!updated) throw new MoneyError('Insufficient user balance');
    user.balance = updated.balance;
    withdrawal.status = 'processing';
    withdrawal.processed_at = new Date();
    await withdrawal.save({ session });
    await postPair(session, {
      debitAccount: walletAccount(user._id.toString()),
      creditAccount: 'reserve:pending-withdraw',
      amount,
      userId: user._id,
      refType: 'withdraw_approve',
      refId: withdrawal._id.toString(),
      idempotencyKey: input.idempotencyKey,
    });
    await writeHistory(session, user, amount, 'withdraw', balanceBefore, updated.balance ?? 0, {
      reason: 'withdrawal_approved',
      withdrawal_id: withdrawal._id.toString(),
    });
    return { balance: updated.balance ?? 0 };
  });
}

export async function refundWithdrawMoney(input: { withdrawalId: string; idempotencyKey?: string }) {
  return runMoney(async (session) => {
    const withdrawal = await WithdrawalHistory.findById(input.withdrawalId).session(session);
    if (!withdrawal) throw new MoneyError('Withdrawal not found', 404);
    const user = await User.findById(withdrawal.userId).session(session);
    if (!user) throw new MoneyError('User not found', 404);
    const amount = roundMoney(withdrawal.coin_amount);
    if (withdrawal.status === 'processing') {
      const original = await LedgerEntry.findOne({
        refType: 'withdraw_approve',
        refId: withdrawal._id.toString(),
      }).session(session);
      const balanceBefore = user.balance ?? 0;
      const updated = await User.findByIdAndUpdate(user._id, { $inc: { balance: amount } }, { new: true, session });
      user.balance = updated?.balance ?? balanceBefore + amount;
      if (original) await reverseEntry(session, original._id, input.idempotencyKey);
      await writeHistory(session, user, amount, 'deposit', balanceBefore, user.balance ?? 0, {
        reason: 'withdrawal_rejected_refund',
        withdrawal_id: withdrawal._id.toString(),
      });
    }
    withdrawal.status = 'rejected';
    withdrawal.processed_at = new Date();
    await withdrawal.save({ session });
    return { balance: user.balance ?? 0 };
  });
}

export async function completeWithdrawMoney(input: { withdrawalId: string; transactionHash?: string; idempotencyKey?: string }) {
  return runMoney(async (session) => {
    const withdrawal = await WithdrawalHistory.findById(input.withdrawalId).session(session);
    if (!withdrawal) throw new MoneyError('Withdrawal not found', 404);
    if (withdrawal.status !== 'processing') throw new MoneyError('Withdrawal is not processing');
    const amount = roundMoney(withdrawal.coin_amount);
    await postPair(session, {
      debitAccount: 'reserve:pending-withdraw',
      creditAccount: 'platform:payout',
      amount,
      userId: withdrawal.userId,
      refType: 'withdraw_complete',
      refId: withdrawal._id.toString(),
      idempotencyKey: input.idempotencyKey,
    });
    withdrawal.status = 'completed';
    withdrawal.transaction_hash = input.transactionHash || withdrawal.transaction_hash || '';
    withdrawal.processed_at = new Date();
    await withdrawal.save({ session });
    const user = await User.findById(withdrawal.userId).session(session);
    return { balance: user?.balance ?? 0 };
  });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function transferMoney(input: {
  senderId: string;
  recipientUsername: string;
  amount: number;
  feeAmount: number;
  totalDebited: number;
  feePercent: number;
  note?: string;
  idempotencyKey?: string;
}) {
  return runMoney(async (session) => {
    if (input.idempotencyKey) {
      const replay = await LedgerEntry.findOne({ idempotencyKey: input.idempotencyKey }).session(session);
      if (replay) {
        const existing = await UserTransferHistory.findById(replay.refId).session(session);
        if (existing) {
          const sender = await User.findById(input.senderId).session(session);
          const recipient = await User.findById(existing.recipientId).session(session);
          return {
            transfer: serializeUserTransferHistory(existing, input.senderId),
            replayed: true,
            senderBalance: sender?.balance ?? 0,
            senderBefore: sender?.balance ?? 0,
            recipientBalance: recipient?.balance ?? 0,
            recipientBefore: recipient?.balance ?? 0,
          };
        }
      }
    }

    const sender = await User.findById(input.senderId).session(session);
    if (!sender || !sender.status) throw new MoneyError('Unauthorized', 401);

    const recipient = await User.findOne({
      username: { $regex: new RegExp(`^${escapeRegex(input.recipientUsername)}$`, 'i') },
      status: true,
    }).session(session);
    if (!recipient) throw new MoneyError('Recipient not found');
    if (recipient._id.toString() === sender._id.toString()) throw new MoneyError('You cannot transfer coins to yourself');

    const amount = roundMoney(input.amount);
    const feeAmount = roundMoney(input.feeAmount);
    const totalDebited = roundMoney(input.totalDebited);
    const senderBefore = sender.balance ?? 0;
    if (senderBefore < totalDebited) throw new MoneyError('Insufficient balance');

    const senderUpdated = await User.findOneAndUpdate(
      { _id: sender._id, balance: { $gte: totalDebited } },
      { $inc: { balance: -totalDebited } },
      { new: true, session },
    );
    if (!senderUpdated) throw new MoneyError('Insufficient balance');

    const recipientBefore = recipient.balance ?? 0;
    const recipientUpdated = await User.findByIdAndUpdate(
      recipient._id,
      { $inc: { balance: amount } },
      { new: true, session },
    );
    if (!recipientUpdated) throw new MoneyError('Transfer failed — please try again');

    const transferId = new mongoose.Types.ObjectId();
    const note = String(input.note || '').trim().slice(0, 200);
    const rows = await UserTransferHistory.create(
      [
        {
          _id: transferId,
          senderId: sender._id,
          senderUsername: sender.username,
          recipientId: recipient._id,
          recipientUsername: recipient.username,
          amount,
          feeAmount,
          feePercent: input.feePercent,
          totalDebited,
          note,
          status: 'completed',
        },
      ],
      { session },
    );

    await postPair(session, {
      debitAccount: walletAccount(sender._id.toString()),
      creditAccount: walletAccount(recipient._id.toString()),
      amount,
      userId: sender._id,
      refType: 'p2p_transfer',
      refId: transferId.toString(),
      idempotencyKey: input.idempotencyKey,
    });
    if (feeAmount > 0) {
      await postPair(session, {
        debitAccount: walletAccount(sender._id.toString()),
        creditAccount: 'platform:fee',
        amount: feeAmount,
        userId: sender._id,
        refType: 'p2p_transfer_fee',
        refId: transferId.toString(),
        idempotencyKey: input.idempotencyKey ? `${input.idempotencyKey}:fee` : undefined,
      });
    }

    sender.balance = senderUpdated.balance;
    recipient.balance = recipientUpdated.balance;
    await writeHistory(session, sender, totalDebited, 'withdraw', senderBefore, senderUpdated.balance ?? 0, {
      reason: 'user_transfer_sent',
      transferId: transferId.toString(),
      recipientId: recipient._id.toString(),
      recipientUsername: recipient.username,
      netAmount: amount,
      feeAmount,
    });
    await writeHistory(session, recipient, amount, 'deposit', recipientBefore, recipientUpdated.balance ?? 0, {
      reason: 'user_transfer_received',
      transferId: transferId.toString(),
      senderId: sender._id.toString(),
      senderUsername: sender.username,
    });

    return {
      transfer: serializeUserTransferHistory(rows[0], input.senderId),
      replayed: false,
      senderBalance: senderUpdated.balance ?? 0,
      senderBefore,
      recipientBalance: recipientUpdated.balance ?? 0,
      recipientBefore,
    };
  });
}

export async function distributeMatchWinnings(matchId: string) {
  return runMoney(async (session) => {
    const match = await Match.findById(matchId).session(session);
    if (!match) throw new MoneyError('Match not found', 404);
    if (match.winningsDistributed) throw new MoneyError('Winnings already distributed');

    const payouts: Array<{ userId: string; amount: number; balance: number; before: number }> = [];
    for (const entry of match.results || []) {
      const totalWin = roundMoney(
        (Number(entry.winPrize) || 0) + (Number(entry.bonus) || 0) + (Number(entry.placePoint) || 0),
      );
      if (totalWin <= 0) continue;
      const participant = await MatchParticipant.findById(entry.participantId).session(session);
      if (!participant) continue;
      const user = await User.findById(participant.userId).session(session);
      if (!user) continue;
      const before = user.balance ?? 0;
      const updated = await User.findByIdAndUpdate(user._id, { $inc: { balance: totalWin } }, { new: true, session });
      user.balance = updated?.balance ?? before + totalWin;
      await postPair(session, {
        debitAccount: `match:${match._id}:pool`,
        creditAccount: walletAccount(user._id.toString()),
        amount: totalWin,
        userId: user._id,
        refType: 'match_winnings',
        refId: match._id.toString(),
      });
      await writeHistory(session, user, totalWin, 'deposit', before, user.balance ?? 0, {
        reason: 'match_winnings',
        matchId: match._id.toString(),
        matchName: match.matchName,
      });
      payouts.push({ userId: user._id.toString(), amount: totalWin, balance: user.balance ?? 0, before });
    }

    match.winningsDistributed = true;
    match.status = 'complete';
    await match.save({ session });
    return { payouts };
  });
}

export async function refundMatchEntries(matchId: string) {
  return runMoney(async (session) => {
    const match = await Match.findById(matchId).session(session);
    if (!match) throw new MoneyError('Match not found', 404);
    if (match.entriesRefunded) throw new MoneyError('Entries already refunded');
    if (match.winningsDistributed) throw new MoneyError('Cannot refund after winnings were distributed');

    const refunds: Array<{ userId: string; amount: number; balance: number; before: number }> = [];
    const participants = await MatchParticipant.find({ matchId: match._id }).session(session);
    for (const participant of participants) {
      const fee = roundMoney(participant.entryFee || 0);
      if (fee <= 0) continue;
      const user = await User.findById(participant.userId).session(session);
      if (!user) continue;
      const original = await LedgerEntry.findOne({
        refType: 'match_join',
        refId: match._id.toString(),
        userId: user._id,
        reversalOf: null,
      }).session(session);
      const before = user.balance ?? 0;
      const updated = await User.findByIdAndUpdate(user._id, { $inc: { balance: fee } }, { new: true, session });
      user.balance = updated?.balance ?? before + fee;
      if (original) await reverseEntry(session, original._id);
      else {
        await postPair(session, {
          debitAccount: `match:${match._id}:pool`,
          creditAccount: walletAccount(user._id.toString()),
          amount: fee,
          userId: user._id,
          refType: 'match_join_reversal',
          refId: match._id.toString(),
        });
      }
      await writeHistory(session, user, fee, 'deposit', before, user.balance ?? 0, {
        reason: 'match_entry_refund',
        matchId: match._id.toString(),
        matchName: match.matchName,
      });
      refunds.push({ userId: user._id.toString(), amount: fee, balance: user.balance ?? 0, before });
    }

    match.entriesRefunded = true;
    match.status = 'cancel';
    await match.save({ session });
    return { refunds };
  });
}

export async function moveWallet(input: {
  userId: string;
  amount: number;
  direction: 'credit' | 'debit';
  otherAccount: string;
  refType: string;
  refId: string;
  reason: string;
  idempotencyKey?: string;
}) {
  return runMoney(async (session) => {
    const amount = roundMoney(input.amount);
    if (amount <= 0) throw new MoneyError('Amount must be greater than zero');
    if (input.idempotencyKey) {
      const replay = await LedgerEntry.findOne({ idempotencyKey: input.idempotencyKey }).session(session);
      if (replay) {
        const user = await User.findById(input.userId).session(session);
        return { balance: user?.balance ?? 0, replayed: true };
      }
    }
    const user = await User.findById(input.userId).session(session);
    if (!user) throw new MoneyError('Unauthorized', 401);
    const before = user.balance ?? 0;
    if (input.direction === 'debit') {
      if (before < amount) throw new MoneyError('Insufficient balance');
      const updated = await User.findOneAndUpdate(
        { _id: user._id, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true, session },
      );
      if (!updated) throw new MoneyError('Insufficient balance');
      user.balance = updated.balance;
      await postPair(session, {
        debitAccount: walletAccount(user._id.toString()),
        creditAccount: input.otherAccount,
        amount,
        userId: user._id,
        refType: input.refType,
        refId: input.refId,
        idempotencyKey: input.idempotencyKey,
      });
      await writeHistory(session, user, amount, 'withdraw', before, updated.balance ?? 0, { reason: input.reason });
      return { balance: updated.balance ?? 0, replayed: false };
    }
    const updated = await User.findByIdAndUpdate(user._id, { $inc: { balance: amount } }, { new: true, session });
    user.balance = updated?.balance ?? before + amount;
    await postPair(session, {
      debitAccount: input.otherAccount,
      creditAccount: walletAccount(user._id.toString()),
      amount,
      userId: user._id,
      refType: input.refType,
      refId: input.refId,
      idempotencyKey: input.idempotencyKey,
    });
    await writeHistory(session, user, amount, 'deposit', before, user.balance ?? 0, { reason: input.reason });
    return { balance: user.balance ?? 0, replayed: false };
  });
}

export { postPair };
