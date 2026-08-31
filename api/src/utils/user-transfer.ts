import mongoose from 'mongoose';
import { User, type IUser } from '../models/User.js';
import {
  UserTransferHistory,
  serializeUserTransferHistory,
} from '../models/UserTransferHistory.js';
import {
  getAppSettings,
  normalizeTransferSettings,
  type TransferSettings,
} from '../models/AppSettings.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateTransferFee(amount: number, settings: TransferSettings) {
  const normalizedAmount = roundMoney(amount);
  const feeAmount = roundMoney((normalizedAmount * settings.feePercent) / 100);
  const totalDebited = roundMoney(normalizedAmount + feeAmount);
  return { amount: normalizedAmount, feeAmount, totalDebited };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getTransferSettingsForClient() {
  const settings = await getAppSettings();
  const transfer = normalizeTransferSettings(settings.transferSettings);
  return {
    enabled: transfer.enabled,
    feePercent: transfer.feePercent,
    minAmount: transfer.minAmount,
    maxAmount: transfer.maxAmount,
  };
}

export async function executeUserTransfer(input: {
  senderId: string;
  recipientUsername: string;
  amount: number;
  note?: string;
}) {
  const appSettings = await getAppSettings();
  const transferSettings = normalizeTransferSettings(appSettings.transferSettings);

  if (!transferSettings.enabled) {
    throw new Error('Coin transfers are currently disabled');
  }

  const recipientUsername = String(input.recipientUsername || '').trim();
  if (!recipientUsername) {
    throw new Error('Recipient username is required');
  }

  const rawAmount = Number(input.amount);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new Error('Enter a valid transfer amount');
  }

  const { amount, feeAmount, totalDebited } = calculateTransferFee(rawAmount, transferSettings);

  if (amount < transferSettings.minAmount) {
    throw new Error(`Minimum transfer amount is ${transferSettings.minAmount} BAC`);
  }
  if (amount > transferSettings.maxAmount) {
    throw new Error(`Maximum transfer amount is ${transferSettings.maxAmount} BAC`);
  }

  const sender = await User.findById(input.senderId);
  if (!sender || !sender.status) {
    throw new Error('Unauthorized');
  }

  const recipient = await User.findOne({
    username: { $regex: new RegExp(`^${escapeRegex(recipientUsername)}$`, 'i') },
    status: true,
  });

  if (!recipient) {
    throw new Error('Recipient not found');
  }

  if (recipient._id.toString() === sender._id.toString()) {
    throw new Error('You cannot transfer coins to yourself');
  }

  const senderBalanceBefore = sender.balance ?? 0;
  if (senderBalanceBefore < totalDebited) {
    throw new Error('Insufficient balance');
  }

  const senderUpdated = await User.findOneAndUpdate(
    { _id: sender._id, balance: { $gte: totalDebited } },
    { $inc: { balance: -totalDebited } },
    { new: true }
  );

  if (!senderUpdated) {
    throw new Error('Insufficient balance');
  }

  const recipientBalanceBefore = recipient.balance ?? 0;
  const recipientUpdated = await User.findOneAndUpdate(
    { _id: recipient._id },
    { $inc: { balance: amount } },
    { new: true }
  );

  if (!recipientUpdated) {
    await User.findByIdAndUpdate(sender._id, { $inc: { balance: totalDebited } });
    throw new Error('Transfer failed — please try again');
  }

  const note = String(input.note || '').trim().slice(0, 200);
  const transferId = new mongoose.Types.ObjectId();

  const transfer = await UserTransferHistory.create({
    _id: transferId,
    senderId: sender._id,
    senderUsername: sender.username,
    recipientId: recipient._id,
    recipientUsername: recipient.username,
    amount,
    feeAmount,
    feePercent: transferSettings.feePercent,
    totalDebited,
    note,
    status: 'completed',
  });

  await recordBalanceHistory({
    user: senderUpdated as IUser,
    amount: totalDebited,
    type: 'withdraw',
    balanceBefore: senderBalanceBefore,
    balanceAfter: senderUpdated.balance ?? 0,
    detail: {
      reason: 'user_transfer_sent',
      transferId: transfer._id.toString(),
      recipientId: recipient._id.toString(),
      recipientUsername: recipient.username,
      netAmount: amount,
      feeAmount,
      feePercent: transferSettings.feePercent,
      note,
    },
  });

  await recordBalanceHistory({
    user: recipientUpdated as IUser,
    amount,
    type: 'deposit',
    balanceBefore: recipientBalanceBefore,
    balanceAfter: recipientUpdated.balance ?? 0,
    detail: {
      reason: 'user_transfer_received',
      transferId: transfer._id.toString(),
      senderId: sender._id.toString(),
      senderUsername: sender.username,
      note,
    },
  });

  await notifyBalanceChange(sender._id.toString(), senderUpdated.balance ?? 0, senderBalanceBefore);
  await notifyBalanceChange(
    recipient._id.toString(),
    recipientUpdated.balance ?? 0,
    recipientBalanceBefore
  );

  return serializeUserTransferHistory(transfer, sender._id.toString());
}
