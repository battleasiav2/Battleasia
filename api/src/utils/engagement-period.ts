import type { EngagementMissionType } from '../models/EngagementMission.js';

const BD_OFFSET_MS = 6 * 60 * 60 * 1000;

function getBdWeekKey(date = new Date()) {
  const shifted = new Date(date.getTime() + BD_OFFSET_MS);
  const startOfYear = Date.UTC(shifted.getUTCFullYear(), 0, 1);
  const week = Math.floor((shifted.getTime() - startOfYear) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${shifted.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getEngagementPeriodKey(
  type: EngagementMissionType,
  date = new Date(),
  resetHour = 0
): string {
  if (type === 'one_time') return 'once';
  if (type === 'event') return 'event';

  if (type === 'weekly') return getBdWeekKey(date);

  const { year, month, day } = getBdDateParts(date, resetHour);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getBdDateParts(date = new Date(), resetHour = 0) {
  const shifted = new Date(date.getTime() + BD_OFFSET_MS);
  let year = shifted.getUTCFullYear();
  let month = shifted.getUTCMonth();
  let day = shifted.getUTCDate();
  const hour = shifted.getUTCHours();

  if (hour < resetHour) {
    const previous = new Date(Date.UTC(year, month, day) - 24 * 60 * 60 * 1000);
    year = previous.getUTCFullYear();
    month = previous.getUTCMonth();
    day = previous.getUTCDate();
  }

  return {
    year,
    month: month + 1,
    day,
  };
}

export function getBdDateKey(date = new Date(), resetHour = 0): string {
  return getEngagementPeriodKey('daily', date, resetHour);
}

export function getBdYesterdayKey(date = new Date(), resetHour = 0): string {
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return getBdDateKey(yesterday, resetHour);
}

export function getBdRecentDateKeys(days: number, date = new Date(), resetHour = 0): string[] {
  const safeDays = Math.min(Math.max(days, 1), 35);
  const keys: string[] = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const d = new Date(date.getTime() - i * 24 * 60 * 60 * 1000);
    keys.push(getBdDateKey(d, resetHour));
  }
  return keys;
}

export function getHoursUntilBdReset(now = new Date(), resetHour = 0): number {
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
  const shifted = new Date(now.getTime() + BD_OFFSET_MS);
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  const second = shifted.getUTCSeconds();
  const ms = shifted.getUTCMilliseconds();

  let hoursLeft = resetHour - hour;
  if (hoursLeft <= 0) hoursLeft += 24;

  const fraction = (minute * 60 + second + ms / 1000) / 3600;
  return Math.max(hoursLeft - fraction, 0);
}

export function isMissionInSchedule(
  startsAt?: Date | null,
  endsAt?: Date | null,
  now = new Date()
): boolean {
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}
