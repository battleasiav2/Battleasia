import mongoose, { Schema, type Document } from 'mongoose';

export interface IUserRole {
  type: 'admin' | 'official' | 'agent' | 'player';
  name: string;
  permissions: string[];
}

export interface IUserPrivacy {
  profile: 'public' | 'private' | 'friends';
  hideActivity: boolean;
  hideOnline: boolean;
  hideStats: boolean;
  hideStories: boolean;
  hideFollowers: boolean;
}

export interface IUser extends Document {
  email: string;
  username: string;
  displayName?: string;
  password: string;
  status: boolean;
  avatar: string;
  coverUrl?: string;
  bio?: string;
  website?: string;
  balance: number;
  role: IUserRole;
  roleRef?: mongoose.Types.ObjectId;
  pubgId?: string;
  gameServer?: string;
  countryCode?: string;
  mobileNo?: string;
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  twitterLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  privacy?: IUserPrivacy;
    emailVerified: boolean;
    isPremium?: boolean;
    premiumSince?: Date;
    premiumExpiresAt?: Date;
    createdAt: Date;
  updatedAt: Date;
}

const userRoleSchema = new Schema<IUserRole>(
  {
    type: { type: String, enum: ['admin', 'official', 'agent', 'player'], default: 'player' },
    name: { type: String, default: 'Player' },
    permissions: { type: [String], default: [] },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    displayName: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    website: { type: String, default: '' },
    twitterLink: { type: String, default: '' },
    facebookLink: { type: String, default: '' },
    instagramLink: { type: String, default: '' },
    privacy: {
      type: new Schema(
        {
          profile: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
          hideActivity: { type: Boolean, default: false },
          hideOnline: { type: Boolean, default: false },
          hideStats: { type: Boolean, default: false },
          hideStories: { type: Boolean, default: false },
          hideFollowers: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: () => ({
        profile: 'public',
        hideActivity: false,
        hideOnline: false,
        hideStats: false,
        hideStories: false,
        hideFollowers: false,
      }),
    },
    balance: { type: Number, default: 0 },
    role: { type: userRoleSchema, default: () => ({ type: 'player', name: 'Player', permissions: [] }) },
    pubgId: { type: String, default: '' },
    gameServer: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    mobileNo: { type: String, default: '' },
    referralCode: { type: String, default: '' },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    emailVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    premiumSince: { type: Date },
    premiumExpiresAt: { type: Date },
    roleRef: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
