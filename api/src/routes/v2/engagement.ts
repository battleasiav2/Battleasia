import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';
import { syncUserEngagement, claimEngagementReward } from '../../utils/engagement-service.js';
import { claimDailyStreakReward } from '../../utils/engagement-streak.js';
import { claimWelcomeBonus } from '../../utils/engagement-welcome.js';
import { getUserBadgeShowcase, checkAndUnlockBadges } from '../../utils/engagement-badges.js';
import { claimReferralMilestone } from '../../utils/engagement-referral.js';
import { claimWeeklyArenaReward } from '../../utils/engagement-weekly.js';
import { scanEngagementAlerts } from '../../utils/engagement-notifications.js';
import { claimShareReward, getShareStatusForMatch } from '../../utils/engagement-share.js';
import { performLuckySpin, syncUserLuckySpin } from '../../utils/engagement-spin.js';
import {
  claimSquadChallengeReward,
  createEngagementSquad,
  joinEngagementSquad,
  leaveEngagementSquad,
} from '../../utils/engagement-squad.js';
import { claimSeasonPassReward } from '../../utils/engagement-season-pass.js';

const router = Router();

router.get('/badges/user/:userId', async (req, res) => {
  try {
    const data = await getUserBadgeShowcase(String(req.params.userId), { includeLocked: false });
    return res.json({ status: true, data });
  } catch (error) {
    console.error('engagement public badges error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load badges' });
  }
});

router.get('/badges', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    await checkAndUnlockBadges(userId);
    const data = await getUserBadgeShowcase(userId, { includeLocked: true });
    return res.json({ status: true, data });
  } catch (error) {
    console.error('engagement badges error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load badges' });
  }
});

router.get('/alerts', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const data = await scanEngagementAlerts(userId);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('engagement alerts error:', error);
    return res.status(500).json({ status: false, message: 'Failed to scan engagement alerts' });
  }
});

router.get('/home', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const data = await syncUserEngagement(userId);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('engagement home error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load engagement data' });
  }
});

router.post('/claim/:progressId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await claimEngagementReward(userId, String(req.params.progressId));
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim reward' });
  }
});

router.post('/streak/claim', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await claimDailyStreakReward(userId);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement streak claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim streak reward' });
  }
});

router.post('/welcome/claim/:key', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await claimWelcomeBonus(userId, String(req.params.key));
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement welcome claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim welcome bonus' });
  }
});

router.post('/referral/claim/:key', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await claimReferralMilestone(userId, String(req.params.key));
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement referral claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim referral milestone' });
  }
});

router.post('/weekly/claim', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await claimWeeklyArenaReward(userId);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement weekly claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim weekly arena reward' });
  }
});

router.post('/squad/create', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const name = String(req.body?.name || '').trim();
    const result = await createEngagementSquad(userId, name);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement squad create error:', error);
    return res.status(500).json({ status: false, message: 'Failed to create squad' });
  }
});

router.post('/squad/join', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const inviteCode = String(req.body?.inviteCode || '').trim();
    const result = await joinEngagementSquad(userId, inviteCode);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement squad join error:', error);
    return res.status(500).json({ status: false, message: 'Failed to join squad' });
  }
});

router.post('/squad/leave', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await leaveEngagementSquad(userId);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement squad leave error:', error);
    return res.status(500).json({ status: false, message: 'Failed to leave squad' });
  }
});

router.post('/squad/claim', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await claimSquadChallengeReward(userId);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement squad claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim squad reward' });
  }
});

router.get('/share/:matchId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await getShareStatusForMatch(userId, String(req.params.matchId));
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement share status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load share status' });
  }
});

router.post('/share/claim', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const matchId = String(req.body?.matchId || '').trim();
    const platform = String(req.body?.platform || 'native').trim();
    if (!matchId) {
      return res.status(400).json({ status: false, message: 'matchId is required' });
    }

    const result = await claimShareReward(userId, matchId, platform);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement share claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim share reward' });
  }
});

router.get('/spin', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const data = await syncUserLuckySpin(userId);
    return res.json({ status: true, data });
  } catch (error) {
    console.error('engagement spin status error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load lucky spin status' });
  }
});

router.post('/spin', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const result = await performLuckySpin(userId);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement spin error:', error);
    return res.status(500).json({ status: false, message: 'Failed to spin' });
  }
});

router.post('/season/claim', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const level = Number(req.body?.level);
    const track = String(req.body?.track || 'free').trim().toLowerCase() === 'plus' ? 'plus' : 'free';

    if (!Number.isFinite(level) || level < 1) {
      return res.status(400).json({ status: false, message: 'Valid tier level is required' });
    }

    const result = await claimSeasonPassReward(userId, level, track);
    if (!result.ok) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.json({ status: true, data: result.data });
  } catch (error) {
    console.error('engagement season claim error:', error);
    return res.status(500).json({ status: false, message: 'Failed to claim season pass reward' });
  }
});

export default router;
