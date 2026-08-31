import type { Types } from 'mongoose';
import mongoose from 'mongoose';
import { EngagementBadge, type IEngagementBadge } from '../models/EngagementBadge.js';
import { UserEngagementBadge } from '../models/UserEngagementBadge.js';
import { getAppSettings, normalizeEngagementSettings } from '../models/AppSettings.js';
import { getUserGamingStats } from './social-serialize.js';
import { serializeEngagementBadge } from './engagement-serialize.js';
import { notifyBadgeUnlocked } from './engagement-notifications.js';

function criteriaValue(criteria: string, stats: { totalKills: number; totalWins: number }) {
  return criteria === 'total_wins' ? stats.totalWins : stats.totalKills;
}

export async function ensureDefaultEngagementBadges() {
  const defaults = [
    {
      key: 'first-blood',
      title: 'First Blood',
      description: 'Score your first kill in tournament matches.',
      icon: 'solar:target-bold',
      criteria: 'total_kills' as const,
      threshold: 1,
      tier: 1,
      sortOrder: 10,
    },
    {
      key: 'killer-10',
      title: 'Rising Slayer',
      description: 'Reach 10 total kills across completed matches.',
      icon: 'solar:target-bold',
      criteria: 'total_kills' as const,
      threshold: 10,
      tier: 2,
      sortOrder: 11,
    },
    {
      key: 'killer-50',
      title: 'Arena Hunter',
      description: 'Reach 50 total kills across completed matches.',
      icon: 'solar:shield-star-bold',
      criteria: 'total_kills' as const,
      threshold: 50,
      tier: 3,
      sortOrder: 12,
    },
    {
      key: 'killer-100',
      title: 'Elimination Expert',
      description: 'Reach 100 total kills across completed matches.',
      icon: 'solar:medal-ribbons-star-bold',
      criteria: 'total_kills' as const,
      threshold: 100,
      tier: 4,
      sortOrder: 13,
    },
    {
      key: 'killer-500',
      title: 'Legendary Slayer',
      description: 'Reach 500 total kills across completed matches.',
      icon: 'solar:crown-star-bold',
      criteria: 'total_kills' as const,
      threshold: 500,
      tier: 5,
      sortOrder: 14,
    },
    {
      key: 'first-win',
      title: 'First Victory',
      description: 'Win your first tournament match.',
      icon: 'solar:cup-star-bold',
      criteria: 'total_wins' as const,
      threshold: 1,
      tier: 1,
      sortOrder: 20,
    },
    {
      key: 'winner-5',
      title: 'Contender',
      description: 'Win 5 tournament matches.',
      icon: 'solar:cup-star-bold',
      criteria: 'total_wins' as const,
      threshold: 5,
      tier: 2,
      sortOrder: 21,
    },
    {
      key: 'winner-25',
      title: 'Champion',
      description: 'Win 25 tournament matches.',
      icon: 'solar:medal-star-bold',
      criteria: 'total_wins' as const,
      threshold: 25,
      tier: 3,
      sortOrder: 22,
    },
    {
      key: 'winner-100',
      title: 'Arena Legend',
      description: 'Win 100 tournament matches.',
      icon: 'solar:crown-star-bold',
      criteria: 'total_wins' as const,
      threshold: 100,
      tier: 4,
      sortOrder: 23,
    },
  ];

  for (const item of defaults) {
    const existing = await EngagementBadge.findOne({ key: item.key });
    if (!existing) {
      await EngagementBadge.create(item);
    }
  }
}

export async function checkAndUnlockBadges(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  if (!settings.enabled || !settings.badgesEnabled) return [];

  await ensureDefaultEngagementBadges();

  const stats = await getUserGamingStats(String(userId));
  const badges = await EngagementBadge.find({ active: true }).sort({ sortOrder: 1, threshold: 1 });
  const existingRows = await UserEngagementBadge.find({ userId }).select('badgeId');
  const existingIds = new Set(existingRows.map((row) => row.badgeId.toString()));

  const newlyUnlocked: IEngagementBadge[] = [];
  const now = new Date();

  for (const badge of badges) {
    if (existingIds.has(badge._id.toString())) continue;
    const value = criteriaValue(badge.criteria, stats);
    if (value < badge.threshold) continue;

    await UserEngagementBadge.create({
      userId,
      badgeId: badge._id,
      badgeKey: badge.key,
      unlockedAt: now,
    });
    newlyUnlocked.push(badge);
    existingIds.add(badge._id.toString());

    notifyBadgeUnlocked({
      userId,
      badgeTitle: badge.title,
      badgeKey: badge.key,
    }).catch((error) => {
      console.error('engagement badge notification failed:', error);
    });
  }

  return newlyUnlocked;
}

export async function getUserBadgeShowcase(userId: string, options?: { includeLocked?: boolean }) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.badgesEnabled) {
    return {
      enabled: false,
      stats: { totalKills: 0, totalWins: 0 },
      badges: [] as ReturnType<typeof serializeEngagementBadge>[],
      unlockedCount: 0,
      totalCount: 0,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      enabled: true,
      stats: { totalKills: 0, totalWins: 0 },
      badges: [],
      unlockedCount: 0,
      totalCount: 0,
    };
  }

  await ensureDefaultEngagementBadges();

  const [stats, definitions, unlockedRows] = await Promise.all([
    getUserGamingStats(userId),
    EngagementBadge.find({ active: true }).sort({ sortOrder: 1, threshold: 1 }),
    UserEngagementBadge.find({ userId }).sort({ unlockedAt: -1 }),
  ]);

  const unlockedMap = new Map(unlockedRows.map((row) => [row.badgeId.toString(), row]));
  const includeLocked = options?.includeLocked !== false;

  const badges = definitions
    .map((definition) => {
      const unlockedRow = unlockedMap.get(definition._id.toString());
      const current = criteriaValue(definition.criteria, stats);
      const unlocked = Boolean(unlockedRow);

      if (!includeLocked && !unlocked) return null;

      return {
        ...serializeEngagementBadge(definition),
        unlocked,
        unlockedAt: unlockedRow?.unlockedAt ?? null,
        progress: Math.min(current, definition.threshold),
        target: definition.threshold,
        current,
      };
    })
    .filter(Boolean);

  return {
    enabled: true,
    stats: {
      totalKills: stats.totalKills,
      totalWins: stats.totalWins,
    },
    badges,
    unlockedCount: unlockedRows.length,
    totalCount: definitions.length,
  };
}
