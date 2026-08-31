import { IMatchStatus } from "src/types";
import { IFeedData, ICategoryData } from "./api/feed";
import { IConversation, IMessage } from "./api/customer-support";

export type ICreatePlayerData = {
    countryCode: string;
    mobileNo: string;
    pubgId?: string;
    gameServer?: string;
    referralCode?: string;
    avatar?: string;
    username: string;
    email: string;
    status: boolean;
    password: string;
    role?: string | null;
};

export type UploadFileOptions = {
    endpoint?: string;
    fieldName?: string;
    folder?: string;
    onProgress?: (progress: number) => void;
    multiEndpoint?: string;
    multiFieldName?: string;
};

export type IRoleData = {
    name: string;
    description?: string;
    parent?: string | null;
    permissions?: string[];
};

export type IGameData = {
    name: string;
    packageName: string;
    image?: string;
    logo?: string;
    canCreateChallenge?: boolean;
    status?: boolean;
    comingSoon?: boolean;
    idPrefix: string;
    rules?: string;
};

export type IMatchData = {
    gameId: string;
    roomId: string;
    password: string;
    matchName: string;
    matchUrl: string;
    matchSchedule: string;
    killRateType: 'automatic' | 'manual';
    entryFee: number;
    totalPlayer: number;
    teamType: string;
    perKill?: number;
    matchType: 'free' | 'paid';
    map: string;
    banner?: string;
    bannerId?: string;
    prizeDescription?: string;
    matchSponsor?: string;
    matchDescription?: string;
    matchPrivateDescription?: string;
    premiumOnly?: boolean;
    platformFeePercent?: number;
    status?: IMatchStatus;
};

export type IMatchResultData = {
    resultDescription?: string;
    screenshots?: string[];
    results?: any[];
};

export type IMatchResultEntryData = {
    participantId: string;
    status?: 'winner' | 'lose';
    placement: number | null;
    kills: number;
    points: number;
    placePoint?: number;
    winPrize?: number;
    bonus?: number;
    refund?: number;
};

export type IBalanceAdjustmentData = {
    amount: number;
    type: 'deposit' | 'withdraw';
    detail?: Record<string, any> | string;
};

export type INotificationPayload = {
    title: string;
    message: string;
    category?: string;
    type?: string;
    avatarUrl?: string;
    target: 'all' | 'selected';
    userIds?: string[];
};

export type ApiContextType = {
    initialize: () => Promise<any>;
    loginApi: (email: string, password: string) => Promise<any>;
    verifyOtpApi: (email: string, password: string, code: string) => Promise<any>;
    logoutApi: () => Promise<any>;
    updateProfileApi: (data: { currentPassword?: string; newPassword?: string; avatar?: string }) => Promise<any>;

    getUsersApi: (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) => Promise<any>;
    getRolesApi: (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string; tree?: boolean }) => Promise<any>;
    getUserByIdApi: (id: string) => Promise<any>;
    createPlayerApi: (data: ICreatePlayerData) => Promise<any>;
    updatePlayerApi: (id: string, data: Partial<ICreatePlayerData>) => Promise<any>;
    updatePlayerStatusApi: (id: string, status: boolean) => Promise<any>;
    updatePlayerBalanceApi: (id: string, data: IBalanceAdjustmentData) => Promise<any>;
    deletePlayerApi: (id: string) => Promise<any>;
    deleteAllPlayersApi: () => Promise<any>;

    createRoleApi: (data: IRoleData) => Promise<any>;
    updateRoleApi: (id: string, data: Partial<IRoleData>) => Promise<any>;
    deleteRoleApi: (id: string) => Promise<any>;
    getAvailableParentRolesApi: (excludeId?: string) => Promise<any>;
    getChildRolesApi: () => Promise<any>;
    getPermissionsApi: (category?: string) => Promise<any>;

    getLoginHistoriesApi: (params?: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) => Promise<any>;
    getOnlineUsersApi: () => Promise<any>;
    logoutAllSessionsApi: () => Promise<any>;
    logoutUserSessionsApi: (userId: string) => Promise<any>;

    // files
    uploadFileApi: (file: File, options?: UploadFileOptions) => Promise<any>;
    uploadFilesApi: (files: File[], options?: UploadFileOptions) => Promise<any>;
    deleteFileApi: (fileUrl: string) => Promise<any>;

    // games
    getGamesApi: (params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    getGameByIdApi: (id: string) => Promise<any>;
    createGameApi: (data: IGameData) => Promise<any>;
    updateGameApi: (id: string, data: Partial<IGameData>) => Promise<any>;
    deleteGameApi: (id: string) => Promise<any>;

    // matches
    getMatchesApi: (params?: { page?: number; limit?: number; search?: string; gameId?: string }) => Promise<any>;
    createMatchApi: (data: IMatchData) => Promise<any>;
    updateMatchApi: (id: string, data: Partial<IMatchData>) => Promise<any>;
    deleteMatchApi: (id: string) => Promise<any>;
    updateMatchResultApi: (id: string, data: IMatchResultData) => Promise<any>;
    updateMatchEntriesApi: (id: string, data: IMatchResultEntryData[]) => Promise<any>;
    getMatchByIdApi: (id: string) => Promise<any>;
    getMatchParticipantsApi: (id: string, params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    getParticipantsHistoryApi: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<any>;
    distributeMatchWinningsApi: (matchId: string) => Promise<any>;
    refundMatchEntriesApi: (matchId: string) => Promise<any>;

    // payments
    getBalanceHistoriesApi: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<any>;
    // payment channels
    getPaymentChannelsApi: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => Promise<any>;
    getPaymentChannelByIdApi: (id: string) => Promise<any>;
    createPaymentChannelApi: (data: {
        channel_name: string;
        description?: string;
        icon?: string;
    }) => Promise<any>;
    updatePaymentChannelApi: (id: string, data: {
        channel_name?: string;
        description?: string;
        icon?: string;
        enabled?: boolean;
    }) => Promise<any>;
    deletePaymentChannelApi: (id: string) => Promise<any>;
    togglePaymentChannelApi: (id: string) => Promise<any>;
    // business wallets
    getBusinessWalletsApi: (params?: {
        page?: number;
        limit?: number;
        channelId?: string;
        currencyType?: string;
    }) => Promise<any>;
    getBusinessWalletByIdApi: (id: string) => Promise<any>;
    createBusinessWalletApi: (data: {
        channel_id: string;
        wallet_address: string;
        currency_type: string;
    }) => Promise<any>;
    updateBusinessWalletApi: (id: string, data: {
        channel_id?: string;
        wallet_address?: string;
        currency_type?: string;
        enabled?: boolean;
    }) => Promise<any>;
    deleteBusinessWalletApi: (id: string) => Promise<any>;
    toggleBusinessWalletApi: (id: string) => Promise<any>;

    // notifications
    getAdminNotificationsApi: (params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    createNotificationAdminApi: (data: INotificationPayload) => Promise<any>;

    // feed
    getFeedsApi: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'published' | 'draft';
        sortBy?: 'latest' | 'oldest' | 'popular';
    }) => Promise<any>;
    getFeedByIdApi: (id: string) => Promise<any>;
    createFeedApi: (data: IFeedData) => Promise<any>;
    updateFeedApi: (id: string, data: Partial<IFeedData>) => Promise<any>;
    deleteFeedApi: (id: string) => Promise<any>;
    incrementFeedViewsApi: (id: string) => Promise<any>;
    // feed categories
    getCategoriesApi: (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) => Promise<any>;
    getCategoryByIdApi: (id: string) => Promise<any>;
    createCategoryApi: (data: ICategoryData) => Promise<any>;
    updateCategoryApi: (id: string, data: Partial<ICategoryData>) => Promise<any>;
    deleteCategoryApi: (id: string) => Promise<any>;
    
    // customer support
    getAllConversationsApi: (params?: {
        page?: number;
        limit?: number;
        status?: 'open' | 'closed' | 'pending';
    }) => Promise<any>;

    // shop
    listShopItemsApi: (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => Promise<any>;
    getShopItemApi: (id: string) => Promise<any>;
    createShopItemApi: (data: any) => Promise<any>;
    updateShopItemApi: (id: string, data: any) => Promise<any>;
    deleteShopItemApi: (id: string) => Promise<any>;
    listOrdersApi: (params?: { page?: number; limit?: number; status?: string }) => Promise<any>;
    getConversationMessagesApi: (conversationId: string, params?: {
        page?: number;
        limit?: number;
    }) => Promise<any>;
    sendMessageApi: (data: {
        body: string;
        conversationId: string;
        attachments?: string[];
    }) => Promise<any>;
    closeConversationApi: (conversationId: string) => Promise<any>;

    // premium
    getPremiumDetailsApi: () => Promise<any>;
    updatePremiumDetailsApi: (premiumDuration: number, premiumPrice: number) => Promise<any>;

    // referral settings
    getReferralSettingsApi: () => Promise<any>;
    updateReferralSettingsApi: (commissionRate: number) => Promise<any>;
    getTransferSettingsApi: () => Promise<any>;
    updateTransferSettingsApi: (data: {
        enabled: boolean;
        feePercent: number;
        minAmount: number;
        maxAmount: number;
    }) => Promise<any>;

    // live chat widget settings
    getLiveChatSettingsApi: () => Promise<any>;
    updateLiveChatSettingsApi: (data: any) => Promise<any>;

    // messaging provider settings
    getMessagingSettingsApi: () => Promise<any>;
    updateMessagingSettingsApi: (data: any) => Promise<any>;

    // profile social settings
    getProfileSocialSettingsApi: () => Promise<any>;
    updateProfileSocialSettingsApi: (data: any) => Promise<any>;

    getSocialReportsApi: (params?: { page?: number; limit?: number; status?: string }) => Promise<any>;
    updateSocialReportApi: (id: string, data: { status?: string; adminNote?: string }) => Promise<any>;
    getAdminReelsApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    deleteReelApi: (id: string) => Promise<any>;

    // referral history
    getReferralHistoriesApi: (params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    getReferralStatsOverviewApi: () => Promise<any>;

    // dashboard
    getAdminDashboardStatsApi: () => Promise<any>;

    // mail settings
    getMailSettingsApi: () => Promise<any>;
    updateMailSettingsApi: (data: any) => Promise<any>;
    sendTestMailApi: (to: string) => Promise<any>;

    // app download settings
    getAppDownloadSettingsApi: () => Promise<any>;
    updateAppDownloadSettingsApi: (data: any) => Promise<any>;
    uploadAppApkApi: (file: File, version?: string) => Promise<any>;

    // engagement
    getEngagementMissionsApi: (params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    getEngagementMissionByIdApi: (id: string) => Promise<any>;
    createEngagementMissionApi: (data: any) => Promise<any>;
    updateEngagementMissionApi: (id: string, data: any) => Promise<any>;
    deleteEngagementMissionApi: (id: string) => Promise<any>;
    getEngagementSettingsApi: () => Promise<any>;
    updateEngagementSettingsApi: (data: any) => Promise<any>;
    getEngagementBadgesApi: (params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    getEngagementBadgeByIdApi: (id: string) => Promise<any>;
    createEngagementBadgeApi: (data: any) => Promise<any>;
    updateEngagementBadgeApi: (id: string, data: any) => Promise<any>;
    deleteEngagementBadgeApi: (id: string) => Promise<any>;
};
