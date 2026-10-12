import { Router } from 'express';
import { getAppSettings } from '../../../models/AppSettings.js';
import { AuditLog, writeAudit } from '../../../models/AuditLog.js';
import { requireAuth, type AuthedRequest } from '../../../middleware/auth.js';
import { User } from '../../../models/User.js';

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

router.get('/details', requireAuth, async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      referralSettings: {
        commissionRate: settings.commissionRate,
      },
      updatedAt: (settings as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? null,
      lastAudit: await lastSettingsAudit('settings.referral'),
    });
  } catch (error) {
    console.error('referral settings error:', error);
    return res.status(500).json({ message: 'Failed to fetch referral settings' });
  }
});

router.put('/update', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { commissionRate } = req.body;
    const settings = await getAppSettings();
    if (typeof commissionRate === 'number') {
      settings.commissionRate = Math.min(100, Math.max(0, commissionRate));
    }
    await settings.save();
    const actor = req.userId ? await User.findById(req.userId).select('username email') : null;
    await writeAudit({
      actorId: req.userId,
      actorEmail: actor?.email,
      actorName: actor?.username,
      action: 'settings.referral',
      detail: `commissionRate=${settings.commissionRate}`,
    });
    return res.json({
      referralSettings: {
        commissionRate: settings.commissionRate,
      },
      updatedAt: (settings as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? null,
      lastAudit: await lastSettingsAudit('settings.referral'),
    });
  } catch (error) {
    console.error('referral update error:', error);
    return res.status(500).json({ message: 'Failed to update referral settings' });
  }
});

export default router;
