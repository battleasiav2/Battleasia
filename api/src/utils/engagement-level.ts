import type { Types } from 'mongoose';
import { UserEngagementLevel } from '../models/UserEngagementLevel.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type LevelSystemSettings,
  type LevelTitleConfig,
} from '../models/AppSettings.js';

const MAX_LEVEL = 100;

export function xpRequiredForLevel(level: number, config: LevelSystemSettings) {
  const safeLevel = Math.max(level, 1);
  return Math.max(config.xpBasePerLevel, 0) + Math.max(safeLevel - 1, 0) * Math.max(config.xpGrowthPerLevel, 0);
}

export function resolveLevelFromXp(xp: number, config: LevelSystemSettings) {
  let level = 1;
  let remaining = Math.max(Number(xp) || 0, 0);
  let xpToNext = xpRequiredForLevel(1, config);

  while (level < MAX_LEVEL) {
    const need = xpRequiredForLevel(level, config);
    if (need <= 0) break;
    if (remaining < need) {
      xpToNext = need;
      break;
    }
    remaining -= need;
    level += 1;
    xpToNext = xpRequiredForLevel(level, config);
  }

  if (level >= MAX_LEVEL) {
    remaining = 0;
    xpToNext = 0;
  }

  const title = resolveTitleForLevel(level, config.titles);

  return {
    level,
    xpIntoLevel: remaining,
    xpToNext,
    progressPct: xpToNext > 0 ? Math.min(Math.round((remaining / xpToNext) * 100), 100) : 100,
    title,
  };
}

export function resolveTitleForLevel(level: number, titles: LevelTitleConfig[]) {
  const sorted = [...titles].sort((a, b) => a.level - b.level);
  let current = sorted[0] || { level: 1, title: 'Rookie', icon: 'solar:user-bold' };
  for (const entry of sorted) {
    if (entry.level <= level) current = entry;
    else break;
  }
  return current;
}

export function serializeLevelState(
  doc: InstanceType<typeof UserEngagementLevel> | null,
  config: LevelSystemSettings
) {
  if (!config.enabled) {
    return {
      enabled: false,
      xp: 0,
      level: 1,
      xpIntoLevel: 0,
      xpToNext: 0,
      progressPct: 0,
      title: { level: 1, title: '', icon: '' },
      nextTitle: null as LevelTitleConfig | null,
    };
  }

  const xp = doc?.xp ?? 0;
  const resolved = resolveLevelFromXp(xp, config);
  const nextTitle =
    config.titles
      .filter((entry) => entry.level > resolved.level)
      .sort((a, b) => a.level - b.level)[0] || null;

  return {
    enabled: true,
    xp,
    level: resolved.level,
    xpIntoLevel: resolved.xpIntoLevel,
    xpToNext: resolved.xpToNext,
    progressPct: resolved.progressPct,
    title: resolved.title,
    nextTitle,
    lastXpAt: doc?.lastXpAt ?? null,
    lastXpReason: doc?.lastXpReason || '',
  };
}

async function ensureLevelDoc(userId: Types.ObjectId | string) {
  let doc = await UserEngagementLevel.findOne({ userId });
  if (!doc) {
    doc = await UserEngagementLevel.create({
      userId,
      xp: 0,
      level: 1,
      lastXpAt: null,
      lastXpReason: '',
    });
  }
  return doc;
}

export async function syncUserLevel(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.levelSystem;

  if (!settings.enabled || !config.enabled) {
    return serializeLevelState(null, { ...config, enabled: false });
  }

  const doc = await ensureLevelDoc(userId);
  const resolved = resolveLevelFromXp(doc.xp, config);
  if (doc.level !== resolved.level) {
    doc.level = resolved.level;
    await doc.save();
  }

  return serializeLevelState(doc, config);
}

export async function awardXp(
  userId: Types.ObjectId | string,
  amount: number,
  reason: string
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.levelSystem;

  if (!settings.enabled || !config.enabled) return null;

  const xpGain = Math.max(Math.floor(Number(amount) || 0), 0);
  if (xpGain <= 0) return null;

  const doc = await ensureLevelDoc(userId);
  const previousLevel = doc.level;
  doc.xp += xpGain;
  const resolved = resolveLevelFromXp(doc.xp, config);
  doc.level = resolved.level;
  doc.lastXpAt = new Date();
  doc.lastXpReason = String(reason || '').slice(0, 80);
  await doc.save();

  return {
    ...serializeLevelState(doc, config),
    xpGained: xpGain,
    leveledUp: resolved.level > previousLevel,
  };
}

export async function awardMatchXp(
  userId: Types.ObjectId | string,
  payload: { kills?: number; won?: boolean; joined?: boolean }
) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.levelSystem;

  if (!settings.enabled || !config.enabled) return null;

  let total = 0;
  const reasons: string[] = [];

  if (payload.joined) {
    total += Math.max(config.xpPerJoinMatch, 0);
    reasons.push('join');
  }
  if (payload.won) {
    total += Math.max(config.xpPerWin, 0);
    reasons.push('win');
  }
  if (payload.kills && payload.kills > 0) {
    total += Math.max(config.xpPerKill, 0) * payload.kills;
    reasons.push('kills');
  }

  if (total <= 0) return null;
  return awardXp(userId, total, reasons.join('+'));
}

export async function awardMissionClaimXp(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.levelSystem;

  if (!settings.enabled || !config.enabled) return null;
  return awardXp(userId, config.xpPerMissionClaim, 'mission_claim');
}
