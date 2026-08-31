import type { Types } from 'mongoose';
import { UserEngagementStreak } from '../models/UserEngagementStreak.js';
import { User } from '../models/User.js';
import { getAppSettings, normalizeEngagementSettings, type EngagementSettings } from '../models/AppSettings.js';
import { getBdDateKey, getBdRecentDateKeys, getBdYesterdayKey } from './engagement-period.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';

const MAX_HISTORY_DAYS = 35;

function trimDateHistory(dates: string[]) {
  const unique = Array.from(new Set(dates.filter(Boolean)));
  return unique.slice(-MAX_HISTORY_DAYS);
}

export function calculateStreakReward(settings: EngagementSettings, currentStreak: number) {
  const base = Math.max(settings.dailyLoginReward, 0);
  const bonusSteps = Math.max(currentStreak - 1, 0);
  const streakBonus = Math.min(
    bonusSteps * Math.max(settings.streakBonusPerDay, 0),
    Math.max(settings.maxStreakBonus, 0)
  );
  return {
    baseReward: base,
    streakBonus,
    totalReward: base + streakBonus,
  };
}

export function serializeStreakState(
  streak: InstanceType<typeof UserEngagementStreak> | null,
  settings: EngagementSettings,
  todayKey = getBdDateKey(new Date(), settings.dailyMissionsResetHour)
) {
  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const checkedInToday = streak?.lastCheckInDate === todayKey;
  const claimedToday = streak?.lastClaimDate === todayKey;
  const rewards = calculateStreakReward(settings, Math.max(currentStreak, 1));

  const calendarKeys = getBdRecentDateKeys(7, new Date(), settings.dailyMissionsResetHour);
  const checkInSet = new Set(streak?.checkInDates ?? []);
  const claimSet = new Set(streak?.claimDates ?? []);

  return {
    enabled: settings.streakEnabled !== false,
    currentStreak,
    longestStreak,
    checkedInToday,
    claimedToday,
    canClaim: settings.streakEnabled !== false && checkedInToday && !claimedToday,
    todayReward: rewards.totalReward,
    baseReward: rewards.baseReward,
    streakBonus: rewards.streakBonus,
    calendar: calendarKeys.map((dateKey) => ({
      date: dateKey,
      checkedIn: checkInSet.has(dateKey),
      claimed: claimSet.has(dateKey),
      isToday: dateKey === todayKey,
    })),
  };
}

export async function syncDailyStreak(userId: Types.ObjectId | string, now = new Date()) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.streakEnabled) {
    return serializeStreakState(null, settings, getBdDateKey(now, settings.dailyMissionsResetHour));
  }

  const resetHour = settings.dailyMissionsResetHour;
  const todayKey = getBdDateKey(now, resetHour);
  const yesterdayKey = getBdYesterdayKey(now, resetHour);

  let streak = await UserEngagementStreak.findOne({ userId });
  if (!streak) {
    streak = await UserEngagementStreak.create({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      lastClaimDate: null,
      checkInDates: [],
      claimDates: [],
    });
  }

  if (streak.lastCheckInDate !== todayKey) {
    if (!streak.lastCheckInDate) {
      streak.currentStreak = 1;
    } else if (streak.lastCheckInDate === yesterdayKey) {
      streak.currentStreak = Math.max(streak.currentStreak, 0) + 1;
    } else {
      streak.currentStreak = 1;
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastCheckInDate = todayKey;
    streak.checkInDates = trimDateHistory([...(streak.checkInDates || []), todayKey]);
    await streak.save();
  }

  return serializeStreakState(streak, settings, todayKey);
}

export async function claimDailyStreakReward(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);

  if (!settings.enabled || !settings.streakEnabled) {
    return { ok: false as const, message: 'Daily streak is disabled' };
  }

  const todayKey = getBdDateKey(new Date(), settings.dailyMissionsResetHour);
  const streak = await UserEngagementStreak.findOne({ userId });
  if (!streak || streak.lastCheckInDate !== todayKey) {
    return { ok: false as const, message: 'Check in today before claiming' };
  }

  if (streak.lastClaimDate === todayKey) {
    return { ok: false as const, message: 'Already claimed today' };
  }

  const { totalReward } = calculateStreakReward(settings, streak.currentStreak);
  if (totalReward <= 0) {
    return { ok: false as const, message: 'No streak reward configured' };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { ok: false as const, message: 'User not found' };
  }

  const balanceBefore = user.balance ?? 0;
  const balanceAfter = balanceBefore + totalReward;
  user.balance = balanceAfter;
  await user.save();

  await recordBalanceHistory({
    user,
    amount: totalReward,
    type: 'deposit',
    balanceBefore,
    balanceAfter,
    detail: {
      reason: 'engagement_streak_reward',
      streakDay: streak.currentStreak,
      dateKey: todayKey,
    },
  });

  streak.lastClaimDate = todayKey;
  streak.claimDates = trimDateHistory([...(streak.claimDates || []), todayKey]);
  await streak.save();

  notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);

  return {
    ok: true as const,
    data: {
      rewardAmount: totalReward,
      balanceAfter,
      streak: serializeStreakState(streak, settings, todayKey),
    },
  };
}
