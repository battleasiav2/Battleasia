import type { IEngagementMission } from '../models/EngagementMission.js';
import type { EngagementSettings } from '../models/AppSettings.js';
import { getEngagementPeriodKey } from './engagement-period.js';

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function isDailyPoolMission(mission: Pick<IEngagementMission, 'type' | 'action' | 'inDailyPool'>) {
  if (mission.type !== 'daily') return false;
  if (mission.action === 'daily_login') return false;
  return mission.inDailyPool !== false;
}

export function selectDailyPoolMissionIds(
  missions: IEngagementMission[],
  dateKey: string,
  count: number
): Set<string> {
  const pool = missions
    .filter((mission) => mission.active !== false && isDailyPoolMission(mission))
    .sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a.key.localeCompare(b.key);
    });

  if (pool.length <= count) {
    return new Set(pool.map((mission) => mission._id.toString()));
  }

  const ranked = pool
    .map((mission) => ({
      id: mission._id.toString(),
      score: hashString(`${dateKey}:${mission.key}`),
    }))
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));

  return new Set(ranked.slice(0, count).map((item) => item.id));
}

export function getDailyPoolMissionIds(
  missions: IEngagementMission[],
  settings: EngagementSettings,
  date = new Date()
) {
  if (!settings.dailyMissionsEnabled) {
    return new Set(
      missions
        .filter((mission) => mission.active !== false && mission.type === 'daily' && mission.action !== 'daily_login')
        .map((mission) => mission._id.toString())
    );
  }

  const dateKey = getEngagementPeriodKey('daily', date, settings.dailyMissionsResetHour);
  const count = Math.min(Math.max(settings.dailyMissionsCount || 3, 1), 5);
  return selectDailyPoolMissionIds(missions, dateKey, count);
}

export function getVisibleMissionIds(
  missions: IEngagementMission[],
  settings: EngagementSettings,
  date = new Date()
) {
  const dailyPoolIds = getDailyPoolMissionIds(missions, settings, date);
  const visible = new Set<string>();

  for (const mission of missions) {
    if (mission.active === false) continue;
    if (mission.type === 'one_time' || mission.type === 'weekly' || mission.type === 'event') {
      visible.add(mission._id.toString());
      continue;
    }
    if (mission.type === 'daily') {
      if (mission.action === 'daily_login') continue;
      if (dailyPoolIds.has(mission._id.toString())) {
        visible.add(mission._id.toString());
      }
    }
  }

  return visible;
}
