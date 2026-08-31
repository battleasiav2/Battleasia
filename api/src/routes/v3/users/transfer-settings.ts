import { Router } from 'express';
import {
  getAppSettings,
  normalizeTransferSettings,
  type TransferSettings,
} from '../../../models/AppSettings.js';

const router = Router();

router.get('/details', async (_req, res) => {
  try {
    const settings = await getAppSettings();
    const transferSettings = normalizeTransferSettings(settings.transferSettings);
    return res.json({ transferSettings });
  } catch (error) {
    console.error('transfer settings error:', error);
    return res.status(500).json({ message: 'Failed to fetch transfer settings' });
  }
});

router.put('/update', async (req, res) => {
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

    return res.json({
      transferSettings: normalizeTransferSettings(settings.transferSettings),
    });
  } catch (error) {
    console.error('transfer settings update error:', error);
    return res.status(500).json({ message: 'Failed to update transfer settings' });
  }
});

export default router;
