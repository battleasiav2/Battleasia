export interface UserRole {
    id: string;
    name: string;
    type: 'admin' | 'official' | 'agent' | 'player';
    permissions: string[];
    level: number;
}

export interface UserProfile {
    _id: string;
    email: string;
    username: string;
    status: boolean;
    avatar: string;
    balance: number;
    emailVerified?: boolean;
    createdAt: Date;
    role?: UserRole | null;
};

export interface InitialAuthContextProps {
    isLoggedIn: boolean;
    isInitialized?: boolean;
    token?: string | undefined;
    user: UserProfile;
    balance: number;
}
