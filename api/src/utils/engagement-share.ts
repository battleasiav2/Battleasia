import type { Types } from 'mongoose';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Match } from '../models/Match.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { UserEngagementShare } from '../models/UserEngagementShare.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type ShareToEarnSettings,
} from '../models/AppSettings.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

export function serializeShareToEarnState(
  config: ShareToEarnSettings,
  extras?: { claimedForMatch?: boolean; claimedCount?: number }
) {
  if (!config.enabled) {
    return {
      enabled: false,
      bacAmount: 0,
      title: '',
      description: '',
      icon: '',
      cooldownHours: 0,
      claimedForMatch: false,
      claimedCount: 0,
    };
  }

  return {
    enabled: true,
    bacAmount: config.bacAmount,
    title: config.title,
    description: config.description,
    icon: config.icon,
    cooldownHours: config.cooldownHours,
    claimedForMatch: extras?.claimedForMatch ?? false,
    claimedCount: extras?.claimedCount ?? 0,
  };
}

export async function syncUserShareToEarn(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.shareToEarn;

  if (!settings.enabled || !config.enabled) {
    return serializeShareToEarnState({ ...config, enabled: false });
  }

  const claimedCount = await UserEngagementShare.countDocuments({ userId });
  return serializeShareToEarnState(config, { claimedCount });
}

export async function getShareStatusForMatch(
  userId: Types.ObjectId | string,
  matchId: string
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.shareToEarn;

  if (!settings.enabled || !config.enabled) {
    return {
      ok: true as const,
      data: serializeShareToEarnState({ ...config, enabled: false }),
    };
  }

  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    return { ok: false as const, message: 'Invalid match id' };
  }

  const existing = await UserEngagementShare.findOne({ userId, matchId });
  return {
    ok: true as const,
    data: serializeShareToEarnState(config, {
      claimedForMatch: Boolean(existing),
      claimedCount: await UserEngagementShare.countDocuments({ userId }),
    }),
  };
}

export async function claimShareReward(
  userId: Types.ObjectId | string,
  matchId: string,
  platform = 'native'
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.shareToEarn;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Share-to-earn is disabled' };
  }

  if (!mongoose.Types.ObjectId.isValid(matchId)) {
    return { ok: false as const, message: 'Invalid match id' };
  }

  const match = await Match.findById(matchId).select('status matchName');
  if (!match) {
    return { ok: false as const, message: 'Match not found' };
  }

  if (match.status !== 'complete') {
    return { ok: false as const, message: 'Share rewards are only available for completed matches' };
  }

  const participant = await MatchParticipant.findOne({ matchId, userId }).select('_id');
  if (!participant) {
    return { ok: false as const, message: 'You must have joined this match to share & earn' };
  }

  const existing = await UserEngagementShare.findOne({ userId, matchId });
  if (existing) {
    return { ok: false as const, message: 'Already claimed share reward for this match' };
  }

  if (config.cooldownHours > 0) {
    const since = new Date(Date.now() - config.cooldownHours * 60 * 60 * 1000);
    const recent = await UserEngagementShare.findOne({
      userId,
      claimedAt: { $gte: since },
    }).select('_id');
    if (recent) {
      return {
        ok: false as const,
        message: `Share reward cooldown active. Try again after ${config.cooldownHours}h.`,
      };
    }
  }

  const rewardAmount = Math.max(Number(config.bacAmount) || 0, 0);
  const now = new Date();
  const safePlatform = String(platform || 'native').trim().slice(0, 40) || 'native';

  const shareDoc = await UserEngagementShare.create({
    userId,
    matchId,
    status: 'claimed',
    platform: safePlatform,
    bacAmount: rewardAmount,
    sharedAt: now,
    claimedAt: now,
  });

  let balanceAfter: number | undefined;

  if (rewardAmount > 0) {
    const user = await User.findById(userId);
    if (!user) {
      await UserEngagementShare.deleteOne({ _id: shareDoc._id });
      return { ok: false as const, message: 'User not found' };
    }

    const balanceBefore = user.balance ?? 0;
    balanceAfter = balanceBefore + rewardAmount;
    user.balance = balanceAfter;
    await user.save();

    await recordBalanceHistory({
      user,
      amount: rewardAmount,
      type: 'deposit',
      balanceBefore,
      balanceAfter,
      detail: {
        reason: 'engagement_share_reward',
        matchId: String(matchId),
        matchName: match.matchName,
        shareTitle: config.title,
        platform: safePlatform,
      },
    });

    notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);
  }

  const state = await syncUserShareToEarn(userId);

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter,
      alreadyClaimed: false,
      shareToEarn: {
        ...state,
        claimedForMatch: true,
      },
    },
  };
}
