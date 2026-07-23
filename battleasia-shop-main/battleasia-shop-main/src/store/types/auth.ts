export type UserProfile = {
  _id: string;
  email: string;
  username: string;
  isPremium?: boolean;
  premiumSince?: string;
  premiumExpiresAt?: string;
  countryCode?: string;
  mobileNo?: string;
  pubgId?: string;
  gameServer?: string;
  referralCode?: string;
  status?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional optional fields
  role?: string;
  accessToken?: string;
  [key: string]: any;
};

export interface InitialLoginContextProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  token?: string;
  user: UserProfile;
  balance?: number;
  code?: string;
}

