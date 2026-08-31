export type RegisterData = {
    email: string;
    password: string;
    username: string;
    countryCode: string;
    mobileNo: string;
    pubgId: string;
    gameServer: string;
    referredBy?: string;
}

export type LoginData = {
    email: string;
    password: string;
}

export type UpdateProfileData = {
    username: string;
    email: string;
    countryCode?: string;
    mobileNo?: string;
    pubgId?: string;
    gameServer?: string;
    referralCode?: string;
    twitterLink?: string;
    facebookLink?: string;
    instagramLink?: string;
    avatar?: string;
}

export type IFeedsParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    sortBy?: 'latest' | 'oldest' | 'popular';
    feedMode?: 'all' | 'following' | 'trending' | 'latest' | 'recommended' | 'explore';
}

export type ApiContextType = {
    initialize: () => Promise<any>;
    registerApi: (data: RegisterData) => Promise<any>;
    loginApi: (data: LoginData) => Promise<any>;
    
    // Email verification
    sendVerificationEmailApi: () => Promise<any>;
    resendVerificationCodeApi: (email: string) => Promise<any>;
    verifyEmailApi: (code: string) => Promise<any>;
    verifyEmailSignupApi: (email: string, code: string) => Promise<any>;
    forgotPasswordApi: (email: string) => Promise<any>;
    verifyResetCodeApi: (email: string, code: string) => Promise<any>;
    resetPasswordApi: (email: string, code: string, newPassword: string) => Promise<any>;
    
    getGamesApi: () => Promise<any>;
    getMatchesApi: (gameId?: string) => Promise<any>;
    getMatchDetailApi: (id: string) => Promise<any>;
    getMatchResultApi: (id: string) => Promise<any>;
    joinMatchApi: (matchId: string) => Promise<any>;
    checkMatchJoinApi: (matchId: string) => Promise<any>;
    getMatchHistoryApi: () => Promise<any>;
    getUserMatchHistoryApi: (userId: string) => Promise<any>;

    updateProfileApi: (data: UpdateProfileData) => Promise<any>;
    getBalanceHistoryApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    getReferralsApi: () => Promise<any>;
    getReferralCommissionsApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    getReferralSettingsApi: () => Promise<any>;
    getReferralStatsApi: () => Promise<any>;
    getNotificationsApi: () => Promise<any>;
    markNotificationReadApi: (id: string) => Promise<any>;
    markAllNotificationsReadApi: () => Promise<any>;
    getLeaderboardApi: (params?: { period?: 'all' | 'weekly' | 'monthly' }) => Promise<any>;
    getFeedsApi: (params?: IFeedsParams) => Promise<any>;
    getCategoriesApi: (params?: { page?: number; limit?: number; search?: string }) => Promise<any>;
    getFeedByIdApi: (id: string) => Promise<any>;
    incrementFeedViewsApi: (id: string) => Promise<any>;
    toggleFeedLikeApi: (id: string) => Promise<any>;
    getFeedCommentsApi: (id: string, params?: { page?: number; limit?: number }) => Promise<any>;
    addFeedCommentApi: (id: string, content: string, parentId?: string) => Promise<any>;
    getUserByIdApi: (id: string) => Promise<any>;
    getUserFeedsApi: (id: string, params?: { page?: number; limit?: number }) => Promise<any>;
    followUserApi: (id: string) => Promise<any>;
    unfollowUserApi: (id: string) => Promise<any>;

    activatePremiumApi: () => Promise<any>;
    getPremiumDetailsApi: () => Promise<any>;
    
    getFollowersApi: (id?: string) => Promise<any>;
    getFollowingApi: (id?: string) => Promise<any>;
    getSuggestedFollowsApi: (contextUserId?: string) => Promise<any>;
    getMutualFollowersApi: (id: string) => Promise<any>;
    getRecentFollowsApi: (id: string) => Promise<any>;
    getProfileSocialSettingsApi: () => Promise<any>;
    getOrCreateConversationApi: () => Promise<any>;
    getMyTicketsApi: (params?: { page?: number; limit?: number; status?: string }) => Promise<any>;
    createTicketApi: (data: {
      subject: string;
      category: string;
      body: string;
      attachments?: string[];
    }) => Promise<any>;
    getMessagesApi: (conversationId: string, params?: { page?: number; limit?: number }) => Promise<any>;
    sendMessageApi: (data: { body: string; conversationId?: string; attachments?: string[] }) => Promise<any>;
    closeConversationApi: (conversationId: string) => Promise<any>;
    getAllConversationsApi: (params?: { page?: number; limit?: number; status?: string }) => Promise<any>;
    // shop
    listShopItemsApi: (params?: { page?: number; limit?: number; search?: string; category?: string; type?: string }) => Promise<any>;
    getShopItemApi: (id: string) => Promise<any>;
    checkoutShopApi: (data: { items: { itemId: string; quantity: number }[]; shippingAddress?: any }) => Promise<any>;
    listMyOrdersApi: (params?: { page?: number; limit?: number; status?: string }) => Promise<any>;
    getCurrencyRatesApi: () => Promise<any>;
    uploadFileApi: (file: File, options?: { folder?: string; onProgress?: (progress: number) => void }) => Promise<any>;
    uploadFilesApi: (files: File[], options?: { folder?: string; onProgress?: (progress: number) => void }) => Promise<any>;
    deleteFileApi: (fileUrl: string) => Promise<any>;
    getPublicDashboardStatsApi: () => Promise<any>;
    getAppDownloadSettingsApi: () => Promise<any>;

    // Coingo payout
    createCoingoPayoutApi: (data: { amount: number; walletNumber: string; walletType: string; description?: string }) => Promise<any>;
    getCoingoPayoutStatusApi: (merchantSerialNo: string) => Promise<any>;
    // Withdrawal
    submitWithdrawalApi: (data: {
        user_email: string;
        username: string;
        coin_amount: number;
        wallet_type: string;
        wallet_address: string;
        currency_type: string;
        currency_amount: number;
        description?: string;
    }) => Promise<any>;
    getWithdrawableAmountApi: () => Promise<any>;
    getTransferSettingsApi: () => Promise<any>;
    submitCoinTransferApi: (data: {
        recipientUsername: string;
        amount: number;
        note?: string;
    }) => Promise<any>;
    getTransferHistoryApi: (params?: { page?: number; limit?: number }) => Promise<any>;

    getEngagementHomeApi: () => Promise<any>;
    getEngagementAlertsApi: () => Promise<any>;
    claimEngagementRewardApi: (progressId: string) => Promise<any>;
    claimEngagementStreakApi: () => Promise<any>;
    claimWelcomeBonusApi: (key: string) => Promise<any>;
    claimReferralMilestoneApi: (key: string) => Promise<any>;
    claimWeeklyArenaApi: () => Promise<any>;
    createEngagementSquadApi: (name: string) => Promise<any>;
    joinEngagementSquadApi: (inviteCode: string) => Promise<any>;
    leaveEngagementSquadApi: () => Promise<any>;
    claimSquadChallengeApi: () => Promise<any>;
    claimSeasonPassRewardApi: (level: number, track: 'free' | 'plus') => Promise<any>;
    getShareStatusApi: (matchId: string) => Promise<any>;
    claimShareRewardApi: (matchId: string, platform?: string) => Promise<any>;
    getLuckySpinStatusApi: () => Promise<any>;
    spinLuckySpinApi: () => Promise<any>;
    getEngagementBadgesApi: () => Promise<any>;
    getUserEngagementBadgesApi: (userId: string) => Promise<any>;

    getStoriesApi: () => Promise<any>;
    createStoryApi: (data: { mediaUrl: string; mediaType?: string; caption?: string }) => Promise<any>;
    viewStoryApi: (id: string) => Promise<any>;
    getReelsApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    createReelApi: (data: { videoUrl: string; caption?: string; musicTitle?: string }) => Promise<any>;
    viewReelApi: (id: string) => Promise<any>;
    getConversationsApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    createConversationApi: (participantId: string) => Promise<any>;
    getDirectMessagesApi: (conversationId: string, params?: { page?: number; limit?: number }) => Promise<any>;
    sendDirectMessageApi: (conversationId: string, data: { body: string; attachments?: string[] }) => Promise<any>;
    globalSearchApi: (q: string) => Promise<any>;
    getMessagingSettingsApi: () => Promise<any>;
    getExploreApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    createFeedPostApi: (data: { title?: string; description: string; coverUrl?: string; mediaUrls?: string[]; postType?: string; visibility?: string }) => Promise<any>;
    toggleSaveFeedApi: (id: string, collectionName?: string) => Promise<any>;
    getSavedFeedsApi: (params?: { page?: number; limit?: number }) => Promise<any>;
    blockUserApi: (id: string) => Promise<any>;
    unblockUserApi: (id: string) => Promise<any>;
    submitSocialReportApi: (data: {
      targetType: 'user' | 'feed' | 'reel';
      targetId: string;
      reason: string;
      details?: string;
    }) => Promise<any>;
};

