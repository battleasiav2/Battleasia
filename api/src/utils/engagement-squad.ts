import type { Types } from 'mongoose';
import { User } from '../models/User.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { EngagementSquad } from '../models/EngagementSquad.js';
import { UserEngagementSquad } from '../models/UserEngagementSquad.js';
import { EngagementSquadWeekly } from '../models/EngagementSquadWeekly.js';
import { EngagementSquadWeeklyClaim } from '../models/EngagementSquadWeeklyClaim.js';
import {
  getAppSettings,
  normalizeEngagementSettings,
  type SquadChallengeSettings,
} from '../models/AppSettings.js';
import { getEngagementPeriodKey } from './engagement-period.js';
import { recordBalanceHistory } from './balance-history.js';
import { notifyBalanceChange } from './balance-notify.js';
import { notifyClaimReady } from './engagement-notifications.js';

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizeTeamType(value?: string | null) {
  const raw = String(value || 'solo').trim().toLowerCase();
  if (raw === 'duo' || raw === 'squad') return raw;
  return 'solo';
}

function teamTypeMatches(configTeamType: string, matchTeamType?: string | null) {
  if (configTeamType === 'any') return true;
  return normalizeTeamType(matchTeamType) === configTeamType;
}

async function generateUniqueInviteCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)];
    }
    const existing = await EngagementSquad.findOne({ inviteCode: code }).select('_id').lean();
    if (!existing) return code;
  }
  throw new Error('Failed to generate squad invite code');
}

async function getUserMembership(userId: Types.ObjectId | string) {
  return UserEngagementSquad.findOne({ userId }).lean();
}

async function getSquadMembers(squadId: Types.ObjectId | string) {
  const squad = await EngagementSquad.findById(squadId).lean();
  if (!squad) return null;

  const users = await User.find({ _id: { $in: squad.memberIds } })
    .select('username avatar')
    .lean();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return {
    squad,
    members: squad.memberIds.map((memberId) => {
      const user = userMap.get(memberId.toString());
      return {
        userId: memberId.toString(),
        username: user?.username || 'Player',
        avatar: user?.avatar || '',
      };
    }),
  };
}

async function ensureSquadWeeklyDoc(squadId: Types.ObjectId | string, periodKey: string) {
  let doc = await EngagementSquadWeekly.findOne({ squadId, periodKey });
  if (!doc) {
    doc = await EngagementSquadWeekly.create({
      squadId,
      periodKey,
      winCount: 0,
      status: 'active',
      creditedMatchIds: [],
    });
  }
  return doc;
}

async function getSquadLeaderboard(
  periodKey: string,
  limit: number,
  viewerSquadId?: string | null
) {
  const rows = await EngagementSquadWeekly.find({ periodKey, winCount: { $gt: 0 } })
    .sort({ winCount: -1, updatedAt: 1 })
    .limit(limit)
    .lean();

  const squadIds = rows.map((row) => row.squadId);
  const squads = await EngagementSquad.find({ _id: { $in: squadIds } }).select('name memberIds').lean();
  const squadMap = new Map(squads.map((squad) => [squad._id.toString(), squad]));

  const leaderboard = rows.map((row, index) => {
    const squad = squadMap.get(row.squadId.toString());
    return {
      rank: index + 1,
      squadId: row.squadId.toString(),
      name: squad?.name || 'Squad',
      memberCount: squad?.memberIds?.length ?? 0,
      winCount: row.winCount,
      isViewer: viewerSquadId ? row.squadId.toString() === viewerSquadId : false,
    };
  });

  const viewerRank =
    viewerSquadId && rows.some((row) => row.squadId.toString() === viewerSquadId)
      ? leaderboard.find((entry) => entry.squadId === viewerSquadId)?.rank ?? null
      : null;

  return { leaderboard, viewerRank };
}

function serializeSquadChallengeState(
  config: SquadChallengeSettings,
  periodKey: string,
  squadData: Awaited<ReturnType<typeof getSquadMembers>> | null,
  weeklyDoc: InstanceType<typeof EngagementSquadWeekly> | null,
  claimDoc: InstanceType<typeof EngagementSquadWeeklyClaim> | null,
  leaderboardData: Awaited<ReturnType<typeof getSquadLeaderboard>>,
  viewerId: string
) {
  const winCount = weeklyDoc?.winCount ?? 0;
  const targetWins = config.targetWins;
  const teamCompleted = weeklyDoc?.status === 'completed';
  const claimed = Boolean(claimDoc);
  const hasSquad = Boolean(squadData?.squad);

  return {
    enabled: true,
    periodKey,
    title: config.title,
    description: config.description,
    icon: config.icon,
    teamType: config.teamType,
    targetWins,
    bacAmount: config.bacAmount,
    minMembersInMatch: config.minMembersInMatch,
    maxTeamSize: config.maxTeamSize,
    winCount,
    progress: Math.min(winCount, targetWins),
    teamStatus: weeklyDoc?.status ?? 'active',
    status: claimed ? 'claimed' : teamCompleted ? 'completed' : 'active',
    canClaim: hasSquad && teamCompleted && !claimed,
    claimedAt: claimDoc?.claimedAt ?? null,
    squad: hasSquad
      ? {
          id: squadData!.squad._id.toString(),
          name: squadData!.squad.name,
          inviteCode: squadData!.squad.inviteCode,
          ownerId: squadData!.squad.ownerId.toString(),
          isOwner: squadData!.squad.ownerId.toString() === viewerId,
          members: squadData!.members,
        }
      : null,
    leaderboard: leaderboardData.leaderboard,
    viewerRank: leaderboardData.viewerRank,
  };
}

async function notifySquadMembersClaimReady(
  squadId: Types.ObjectId | string,
  config: SquadChallengeSettings,
  periodKey: string
) {
  const squad = await EngagementSquad.findById(squadId).select('memberIds').lean();
  if (!squad) return;

  await Promise.all(
    squad.memberIds.map((memberId) =>
      notifyClaimReady({
        userId: memberId,
        kind: 'squad',
        title: config.title,
        rewardAmount: config.bacAmount,
        entityId: periodKey,
      }).catch((error) => {
        console.error('engagement squad notification failed:', error);
      })
    )
  );
}

export async function createEngagementSquad(userId: Types.ObjectId | string, name: string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.squadChallenge;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Squad challenge is disabled' };
  }

  const trimmedName = String(name || '').trim().slice(0, 32);
  if (!trimmedName) {
    return { ok: false as const, message: 'Squad name is required' };
  }

  const existing = await getUserMembership(userId);
  if (existing) {
    return { ok: false as const, message: 'You are already in a squad' };
  }

  const inviteCode = await generateUniqueInviteCode();
  const squad = await EngagementSquad.create({
    name: trimmedName,
    inviteCode,
    ownerId: userId,
    memberIds: [userId],
  });

  await UserEngagementSquad.create({ userId, squadId: squad._id });

  const squadChallenge = await syncUserSquadChallenge(userId);

  return {
    ok: true as const,
    data: { squadChallenge },
  };
}

export async function joinEngagementSquad(userId: Types.ObjectId | string, inviteCode: string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.squadChallenge;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Squad challenge is disabled' };
  }

  const code = String(inviteCode || '').trim().toUpperCase();
  if (!code) {
    return { ok: false as const, message: 'Invite code is required' };
  }

  const existing = await getUserMembership(userId);
  if (existing) {
    return { ok: false as const, message: 'Leave your current squad before joining another' };
  }

  const squad = await EngagementSquad.findOne({ inviteCode: code });
  if (!squad) {
    return { ok: false as const, message: 'Invalid invite code' };
  }

  if (squad.memberIds.some((memberId) => memberId.toString() === String(userId))) {
    return { ok: false as const, message: 'You are already in this squad' };
  }

  if (squad.memberIds.length >= config.maxTeamSize) {
    return { ok: false as const, message: 'This squad is full' };
  }

  squad.memberIds.push(userId as Types.ObjectId);
  await squad.save();
  await UserEngagementSquad.create({ userId, squadId: squad._id });

  const squadChallenge = await syncUserSquadChallenge(userId);

  return {
    ok: true as const,
    data: { squadChallenge },
  };
}

export async function leaveEngagementSquad(userId: Types.ObjectId | string) {
  const membership = await UserEngagementSquad.findOne({ userId });
  if (!membership) {
    return { ok: false as const, message: 'You are not in a squad' };
  }

  const squad = await EngagementSquad.findById(membership.squadId);
  if (!squad) {
    await membership.deleteOne();
    const squadChallenge = await syncUserSquadChallenge(userId);
    return { ok: true as const, data: { squadChallenge } };
  }

  squad.memberIds = squad.memberIds.filter((memberId) => memberId.toString() !== String(userId));

  if (squad.memberIds.length === 0) {
    await squad.deleteOne();
  } else {
    if (squad.ownerId.toString() === String(userId)) {
      squad.ownerId = squad.memberIds[0];
    }
    await squad.save();
  }

  await membership.deleteOne();

  const squadChallenge = await syncUserSquadChallenge(userId);

  return {
    ok: true as const,
    data: { squadChallenge },
  };
}

export async function bumpSquadChallengeWin(
  userId: Types.ObjectId | string,
  payload: { won?: boolean; teamType?: string | null; matchId?: string | null }
) {
  if (!payload.won || !payload.matchId) return;

  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.squadChallenge;

  if (!settings.enabled || !config.enabled) return;
  if (!teamTypeMatches(config.teamType, payload.teamType)) return;

  const membership = await getUserMembership(userId);
  if (!membership) return;

  const squad = await EngagementSquad.findById(membership.squadId).lean();
  if (!squad) return;

  const participants = await MatchParticipant.find({ matchId: payload.matchId }).select('userId').lean();
  const participantIds = new Set(participants.map((row) => row.userId.toString()));
  const squadMemberIds = squad.memberIds.map((id) => id.toString());
  const membersInMatch = squadMemberIds.filter((id) => participantIds.has(id)).length;

  if (membersInMatch < config.minMembersInMatch) return;

  const periodKey = getEngagementPeriodKey('weekly');
  const weeklyDoc = await ensureSquadWeeklyDoc(membership.squadId, periodKey);

  if (weeklyDoc.status === 'completed') return;

  const alreadyCredited = weeklyDoc.creditedMatchIds.some((id) => id.toString() === payload.matchId);
  if (alreadyCredited) return;

  weeklyDoc.creditedMatchIds.push(payload.matchId as unknown as Types.ObjectId);
  weeklyDoc.winCount += 1;

  if (weeklyDoc.winCount >= config.targetWins) {
    weeklyDoc.status = 'completed';
    weeklyDoc.completedAt = new Date();
    await weeklyDoc.save();
    await notifySquadMembersClaimReady(membership.squadId, config, periodKey);
    return;
  }

  await weeklyDoc.save();
}

export async function syncUserSquadChallenge(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.squadChallenge;
  const periodKey = getEngagementPeriodKey('weekly');

  if (!settings.enabled || !config.enabled) {
    return {
      enabled: false,
      periodKey,
      leaderboard: [],
      viewerRank: null,
      squad: null,
    };
  }

  const membership = await getUserMembership(userId);
  let squadData: Awaited<ReturnType<typeof getSquadMembers>> | null = null;
  let weeklyDoc: InstanceType<typeof EngagementSquadWeekly> | null = null;

  if (membership) {
    squadData = await getSquadMembers(membership.squadId);
    weeklyDoc = await ensureSquadWeeklyDoc(membership.squadId, periodKey);

    if (weeklyDoc.status === 'active' && weeklyDoc.winCount >= config.targetWins) {
      weeklyDoc.status = 'completed';
      weeklyDoc.completedAt = weeklyDoc.completedAt ?? new Date();
      await weeklyDoc.save();
      await notifySquadMembersClaimReady(membership.squadId, config, periodKey);
    }
  }

  const claimDoc = membership
    ? await EngagementSquadWeeklyClaim.findOne({ userId, periodKey })
    : null;

  const leaderboardData = await getSquadLeaderboard(
    periodKey,
    config.leaderboardLimit,
    membership?.squadId?.toString() ?? null
  );

  return serializeSquadChallengeState(
    config,
    periodKey,
    squadData,
    weeklyDoc,
    claimDoc,
    leaderboardData,
    String(userId)
  );
}

export async function claimSquadChallengeReward(userId: Types.ObjectId | string) {
  const settingsDoc = await getAppSettings();
  const settings = normalizeEngagementSettings(settingsDoc.engagement);
  const config = settings.squadChallenge;

  if (!settings.enabled || !config.enabled) {
    return { ok: false as const, message: 'Squad challenge is disabled' };
  }

  const rewardAmount = Math.max(Number(config.bacAmount) || 0, 0);
  if (rewardAmount <= 0) {
    return { ok: false as const, message: 'No reward configured' };
  }

  const membership = await getUserMembership(userId);
  if (!membership) {
    return { ok: false as const, message: 'Join a squad to claim this reward' };
  }

  await syncUserSquadChallenge(userId);
  const periodKey = getEngagementPeriodKey('weekly');
  const weeklyDoc = await EngagementSquadWeekly.findOne({ squadId: membership.squadId, periodKey });

  if (!weeklyDoc || weeklyDoc.status !== 'completed') {
    return { ok: false as const, message: 'Squad challenge is not complete yet' };
  }

  const existingClaim = await EngagementSquadWeeklyClaim.findOne({ userId, periodKey });
  if (existingClaim) {
    return { ok: false as const, message: 'Already claimed this week' };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { ok: false as const, message: 'User not found' };
  }

  const balanceBefore = user.balance ?? 0;
  const balanceAfter = balanceBefore + rewardAmount;
  user.balance = balanceAfter;
  await user.save();

  await recordBalanceHistory({
    user,
    amount: rewardAmount,
    type: 'deposit',
    balanceBefore,
    balanceAfter,
    detail: {
      reason: 'engagement_squad_reward',
      squadPeriodKey: periodKey,
      squadTitle: config.title,
      squadWinCount: weeklyDoc.winCount,
      squadId: membership.squadId.toString(),
    },
  });

  await EngagementSquadWeeklyClaim.create({
    userId,
    squadId: membership.squadId,
    periodKey,
    claimedAt: new Date(),
  });

  notifyBalanceChange(user._id.toString(), balanceAfter, balanceBefore);

  const squadChallenge = await syncUserSquadChallenge(userId);

  return {
    ok: true as const,
    data: {
      rewardAmount,
      balanceAfter,
      squadChallenge,
    },
  };
}
