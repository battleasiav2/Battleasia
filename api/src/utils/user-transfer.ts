import {
  getAppSettings,
  normalizeTransferSettings,
  type TransferSettings,
} from '../models/AppSettings.js';
import { notifyBalanceChange } from './balance-notify.js';
import { normalizeP1Flags } from './p1-flags.js';

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateTransferFee(amount: number, settings: TransferSettings) {
  const normalizedAmount = roundMoney(amount);
  const feeAmount = roundMoney((normalizedAmount * settings.feePercent) / 100);
  const totalDebited = roundMoney(normalizedAmount + feeAmount);
  return { amount: normalizedAmount, feeAmount, totalDebited };
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
  idempotencyKey?: string;
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

  const { assertClearOfVelocity } = await import('./velocity.js');
  await assertClearOfVelocity(input.senderId, 'transfer');

  const { transferMoney, MoneyError } = await import('./money.js');
  try {
    const result = await transferMoney({
      senderId: input.senderId,
      recipientUsername,
      amount,
      feeAmount,
      totalDebited,
      feePercent: transferSettings.feePercent,
      note: input.note,
      idempotencyKey: input.idempotencyKey,
    });
    if (!result.replayed) {
      await notifyBalanceChange(input.senderId, result.senderBalance ?? 0, result.senderBefore ?? 0);
      const recId = result.transfer.recipientId;
      await notifyBalanceChange(recId, result.recipientBalance ?? 0, result.recipientBefore ?? 0);
    }
    return result.transfer;
  } catch (error) {
    if (error instanceof MoneyError) throw error;
    throw error;
  }
}

export async function executePlayerTip(input: {
  senderId: string;
  recipientUsername: string;
  amount: number;
  idempotencyKey?: string;
}) {
  const appSettings = await getAppSettings();
  const flags = normalizeP1Flags(appSettings.p1);
  if (!flags.playerTip) {
    throw new Error('Player tips are off');
  }
  const rawAmount = Number(input.amount);
  if (!Number.isFinite(rawAmount) || rawAmount < 1) {
    throw new Error('Tip at least 1 BAC');
  }
  if (rawAmount > 500) {
    throw new Error('Tip maximum is 500 BAC');
  }
  const amount = roundMoney(rawAmount);
  const { assertClearOfVelocity } = await import('./velocity.js');
  await assertClearOfVelocity(input.senderId, 'transfer');
  const { transferMoney, MoneyError } = await import('./money.js');
  try {
    const result = await transferMoney({
      senderId: input.senderId,
      recipientUsername: String(input.recipientUsername || '').trim(),
      amount,
      feeAmount: 0,
      totalDebited: amount,
      feePercent: 0,
      note: 'Tip',
      idempotencyKey: input.idempotencyKey,
    });
    if (!result.replayed) {
      await notifyBalanceChange(input.senderId, result.senderBalance ?? 0, result.senderBefore ?? 0);
      await notifyBalanceChange(result.transfer.recipientId, result.recipientBalance ?? 0, result.recipientBefore ?? 0);
    }
    return result.transfer;
  } catch (error) {
    if (error instanceof MoneyError) throw error;
    throw error;
  }
}
