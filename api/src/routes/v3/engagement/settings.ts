import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
} from '../../../models/AppSettings.js';
import { serializeEngagementSettings } from '../../../utils/engagement-serialize.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  try {
    const settings = await getAppSettings();
    return res.json({
      status: true,
      data: serializeEngagementSettings(normalizeEngagementSettings(settings.engagement)),
    });
  } catch (error) {
    console.error('engagement settings get error:', error);
    return res.status(500).json({ status: false, message: 'Failed to fetch engagement settings' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const settings = await getAppSettings();
    const current = normalizeEngagementSettings(settings.engagement);
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    settings.engagement = normalizeEngagementSettings({
      ...current,
      ...body,
      welcomeBonuses: body.welcomeBonuses
        ? {
            ...current.welcomeBonuses,
            ...body.welcomeBonuses,
            milestones: {
              ...current.welcomeBonuses.milestones,
              ...(body.welcomeBonuses.milestones || {}),
            },
          }
        : current.welcomeBonuses,
      referralMilestones: body.referralMilestones
        ? {
            ...current.referralMilestones,
            ...body.referralMilestones,
            tiers: {
              ...current.referralMilestones.tiers,
              ...(body.referralMilestones.tiers || {}),
            },
          }
        : current.referralMilestones,
      weeklyArenaChallenge: body.weeklyArenaChallenge
        ? { ...current.weeklyArenaChallenge, ...body.weeklyArenaChallenge }
        : current.weeklyArenaChallenge,
      squadChallenge: body.squadChallenge
        ? { ...current.squadChallenge, ...body.squadChallenge }
        : current.squadChallenge,
      levelSystem: body.levelSystem
        ? {
            ...current.levelSystem,
            ...body.levelSystem,
            titles: Array.isArray(body.levelSystem.titles)
              ? body.levelSystem.titles
              : current.levelSystem.titles,
          }
        : current.levelSystem,
      shareToEarn: body.shareToEarn
        ? { ...current.shareToEarn, ...body.shareToEarn }
        : current.shareToEarn,
      depositBonusDays: body.depositBonusDays
        ? { ...current.depositBonusDays, ...body.depositBonusDays }
        : current.depositBonusDays,
      luckySpin: body.luckySpin
        ? {
            ...current.luckySpin,
            ...body.luckySpin,
            prizes: Array.isArray(body.luckySpin.prizes)
              ? body.luckySpin.prizes
              : current.luckySpin.prizes,
          }
        : current.luckySpin,
      seasonPass: body.seasonPass
        ? {
            ...current.seasonPass,
            ...body.seasonPass,
            tiers: Array.isArray(body.seasonPass.tiers)
              ? body.seasonPass.tiers
              : current.seasonPass.tiers,
          }
        : current.seasonPass,
    });
    await settings.save();

    return res.json({
      status: true,
      data: serializeEngagementSettings(settings.engagement),
    });
  } catch (error) {
    console.error('engagement settings update error:', error);
    return res.status(500).json({ status: false, message: 'Failed to update engagement settings' });
  }
});

export default router;
