import { Router } from 'express';
import {
  getAppSettings,
  normalizeTransferSettings,
  type TransferSettings,
} from '../../../models/AppSettings.js';
import { AuditLog, writeAudit } from '../../../models/AuditLog.js';
import { User } from '../../../models/User.js';
import type { AuthedRequest } from '../../../middleware/auth.js';

async function lastSettingsAudit(action: string) {
  const row = await AuditLog.findOne({ action }).sort({ createdAt: -1 });
  if (!row) return null;
  return {
    actorName: row.actorName || row.actorEmail || '',
    createdAt: row.createdAt,
    detail: row.detail || '',
  };
}

const router = Router();

router.get('/details', async (_req, res) => {
  try {
    const settings = await getAppSettings();
    const transferSettings = normalizeTransferSettings(settings.transferSettings);
    return res.json({
      transferSettings,
      updatedAt: (settings as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? null,
      lastAudit: await lastSettingsAudit('settings.transfer'),
    });
  } catch (error) {
    console.error('transfer settings error:', error);
    return res.status(500).json({ message: 'Failed to fetch transfer settings' });
  }
});

router.put('/update', async (req: AuthedRequest, res) => {
  try {
    const body = req.body as Partial<TransferSettings>;
    const settings = await getAppSettings();

    settings.transferSettings = normalizeTransferSettings({
      ...normalizeTransferSettings(settings.transferSettings),
      ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      ...(typeof body.feePercent === 'number' ? { feePercent: body.feePercent } : {}),
      ...(typeof body.minAmount === 'number' ? { minAmount: body.minAmount } : {}),
      ...(typeof body.maxAmount === 'number' ? { maxAmount: body.maxAmount } : {}),
    });

    await settings.save();
    const actor = req.userId ? await User.findById(req.userId).select('username email') : null;
    const next = normalizeTransferSettings(settings.transferSettings);
    await writeAudit({
      actorId: req.userId,
      actorEmail: actor?.email,
      actorName: actor?.username,
      action: 'settings.transfer',
      detail: `fee=${next.feePercent}% min=${next.minAmount} max=${next.maxAmount}`,
    });

    return res.json({
      transferSettings: next,
      updatedAt: (settings as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? null,
      lastAudit: await lastSettingsAudit('settings.transfer'),
    });
  } catch (error) {
    console.error('transfer settings update error:', error);
    return res.status(500).json({ message: 'Failed to update transfer settings' });
  }
});

export default router;
