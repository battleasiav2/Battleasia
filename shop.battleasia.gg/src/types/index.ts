export type IMatchHistory = {
    joinedAt: string;
    entryFee: number;
    id: string;
    roomId: string;
    password: string;
    gameId: string;
    gameName: string;
    matchName: string;
    matchUrl: string;
    matchSchedule: string;
    killRateType: string;
    totalPlayer: number;
    teamType: string;
    perKill: number;
    matchType: string;
    map: string;
    banner: string;
    prizeDescription: string;
    matchSponsor: string;
    matchDescription: string;
    matchPrivateDescription: string;
    resultDescription: string;
    resultScreenshots: string[];
    status: string;
    createdAt: string;
}

export type ILeaderboardEntry = {
    id: string;
    rank: number;
    username: string;
    avatar?: string | null;
    totalScore: number;
    gamesPlayed: number;
    averageScore: number;
    badge: string;
    level: number;
    lastPlayed?: string | null;
    totalKills?: number;
};

export type IUserRole = {
    id: string;
    name: string;
    permissions: any[];
    level: number;
};

export type IPublicUser = {
    _id: string;
    email: string;
    username: string;
    referralCode: string;
    avatar: string;
    createdAt: string;
    pubgId?: string;
    gameServer?: string;
    twitterLink?: string;
    facebookLink?: string;
    instagramLink?: string;
    status: boolean;
    followers: number;
    following: number;
    role: IUserRole;
    isFollowing?: boolean;
    isOwnProfile?: boolean;
};

export type IMostPlayedInfo = {
    title: string;
    record: IMatchHistory;
    count: number;
};

export type IActivityCard = {
    title: string;
    subtitle: string;
    image?: string;
    icon?: string;
};

export type IFeedItem = {
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    status?: 'published' | 'draft';
    createdAt: Date | string;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares?: number;
    author?: {
        id: string;
        name: string;
        avatarUrl: string;
    };
};