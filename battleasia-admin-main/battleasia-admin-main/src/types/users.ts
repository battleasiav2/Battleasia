export type IDateRangeValue = [Date | null, Date | null];

export type IUserRow = {
    id: string;
    _id: string;
    username: string;
    email: string;
    roleName?: string;
    countryCode?: string;
    mobileNo?: string;
    pubgId?: string;
    gameServer?: string;
    referralCode?: string;
    status: boolean;
    avatar?: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
};