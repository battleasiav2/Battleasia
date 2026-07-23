import type { IUser } from '../models/User.js';
import type { IRole } from '../models/Role.js';
import type { IGame } from '../models/Game.js';
import type { IMatch } from '../models/Match.js';

export function isUserPremium(user: IUser): boolean {
  const now = Date.now();
  const premiumExpiresAt = user.premiumExpiresAt;
  return Boolean(user.isPremium) && (!premiumExpiresAt || premiumExpiresAt.getTime() > now);
}

export function serializeUser(user: IUser, roleDoc?: IRole | null) {
  const roleRef = roleDoc || (user.roleRef as unknown as IRole | undefined);
  const isPremiumActive = isUserPremium(user);

  return {
    _id: user._id.toString(),
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    status: user.status,
    avatar: user.avatar || '',
    balance: user.balance ?? 0,
    pubgId: user.pubgId || '',
    gameServer: user.gameServer || '',
    countryCode: user.countryCode || '',
    mobileNo: user.mobileNo || '',
    referralCode: user.referralCode || '',
    bio: user.bio || '',
    coverUrl: user.coverUrl || '',
    website: user.website || '',
    twitterLink: user.twitterLink || '',
    facebookLink: user.facebookLink || '',
    instagramLink: user.instagramLink || '',
    emailVerified: user.emailVerified,
    isPremium: isPremiumActive,
    premiumSince: user.premiumSince || null,
    premiumExpiresAt: user.premiumExpiresAt || null,
    roleName: user.role?.name || 'Player',
    role: {
      id: roleRef?._id?.toString() || user.roleRef?.toString() || null,
      _id: roleRef?._id?.toString() || user.roleRef?.toString() || null,
      type: user.role?.type || 'player',
      name: user.role?.name || 'Player',
      permissions: user.role?.permissions || [],
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function serializeRole(role: IRole, parent?: IRole | null) {
  return {
    _id: role._id.toString(),
    id: role._id.toString(),
    name: role.name,
    description: role.description || '',
    type: role.type,
    permissions: role.permissions || [],
    level: role.level ?? 0,
    parent: parent
      ? { id: parent._id.toString(), name: parent.name, level: parent.level ?? 0 }
      : null,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export function serializeGame(game: IGame) {
  return {
    _id: game._id.toString(),
    id: game._id.toString(),
    name: game.name,
    packageName: game.packageName,
    image: game.image || '',
    logo: game.logo || '',
    canCreateChallenge: game.canCreateChallenge ?? true,
    status: game.status,
    comingSoon: game.comingSoon ?? false,
    idPrefix: game.idPrefix,
    rules: game.rules || '',
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}

export function serializeMatch(match: IMatch, gameName?: string) {
  return {
    _id: match._id.toString(),
    id: match._id.toString(),
    gameId: match.gameId.toString(),
    gameName: gameName || '',
    gameMode: match.gameMode,
    roomId: match.roomId,
    password: match.password,
    matchName: match.matchName,
    matchUrl: match.matchUrl,
    matchSchedule: match.matchSchedule,
    killRateType: match.killRateType,
    entryFee: match.entryFee,
    totalPlayer: match.totalPlayer,
    teamType: match.teamType,
    perKill: match.perKill,
    matchType: match.matchType,
    map: match.map,
    totalKills: match.totalKills,
    banner: match.banner || '',
    prizeDescription: match.prizeDescription || '',
    matchSponsor: match.matchSponsor || '',
    matchDescription: match.matchDescription || '',
    matchPrivateDescription: match.matchPrivateDescription || '',
    resultDescription: match.resultDescription || '',
    resultScreenshots: match.resultScreenshots || [],
    premiumOnly: match.premiumOnly ?? false,
    platformFeePercent: match.platformFeePercent ?? 5,
    status: match.status,
    results: match.results || [],
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
  };
}

export function generateReferralCode(username: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const prefix = username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'BA';
  return `${prefix}${suffix}`;
}
