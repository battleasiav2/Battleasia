import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type ReferralItem = {
  id: string;
  date: string;
  playerName: string;
  status: 'active' | 'inactive';
  earnings?: number;
};

export type ApiReferralItem = {
  _id?: string;
  id?: string;
  userId?: string;
  user?: {
    id?: string;
    _id?: string;
    username?: string;
    email?: string;
    isActive?: boolean;
    status?: string;
  };
  username?: string;
  email?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  joinedAt?: string;
  earnings?: number;
  totalEarnings?: number;
};

export const mapApiReferralToItem = (item: ApiReferralItem): ReferralItem => {
  const referralId = item.id || item._id || item.userId || item.user?.id || item.user?._id || '';
  const user = item.user || item;
  const playerName = user.username || item.username || user.email || item.email || 'Unknown Player';
  const createdAt = item.createdAt || item.joinedAt || '';
  const isActive = user.isActive ?? item.isActive ?? true;
  const status = item.status || user.status;

  let referralStatus: 'active' | 'inactive' = 'active';
  if (status === 'inactive' || status === 'deactive' || status === 'banned') {
    referralStatus = 'inactive';
  } else if (!isActive) {
    referralStatus = 'inactive';
  }

  return {
    id: referralId,
    date: createdAt,
    playerName,
    status: referralStatus,
    earnings: item.earnings ?? item.totalEarnings,
  };
};

export const sortReferralsByDate = (items: ReferralItem[]) =>
  [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

export const formatReferralDate = (date: string) =>
  date ? fDateTime(date, 'DD/MM/YYYY hh:mm a') : 'N/A';
