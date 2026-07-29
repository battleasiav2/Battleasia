import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type ReferralNetworkItem = {
  id: string;
  playerName: string;
  email: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  totalEarnings: number;
  totalDeposits: number;
  depositCount: number;
  lastCommissionAt: string | null;
};

export type ReferralCommissionItem = {
  id: string;
  playerName: string;
  depositAmount: number;
  commissionRate: number;
  commissionAmount: number;
  depositSource: string;
  createdAt: string;
};

export type ReferralStats = {
  totalReferrals: number;
  activeReferrals: number;
  inactiveReferrals: number;
  totalEarnings: number;
  paidEarnings: number;
  totalDepositsFromReferrals: number;
  totalCommissionEvents: number;
  commissionRate: number;
};

export type ApiReferralNetworkItem = {
  _id?: string;
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  status?: string;
  joinedAt?: string;
  createdAt?: string;
  totalEarnings?: number;
  earnings?: number;
  totalDeposits?: number;
  depositCount?: number;
  lastCommissionAt?: string | null;
  user?: {
    username?: string;
    email?: string;
    status?: string;
  };
};

export type ApiReferralCommissionItem = {
  _id?: string;
  id?: string;
  referredUsername?: string;
  referredEmail?: string;
  depositAmount?: number;
  commissionRate?: number;
  commissionAmount?: number;
  depositSource?: string;
  createdAt?: string;
};

export const mapApiNetworkItem = (item: ApiReferralNetworkItem): ReferralNetworkItem => {
  const id = item.id || item._id || item.userId || '';
  const user = item.user || item;
  const playerName = user.username || item.username || user.email || item.email || 'Unknown Player';
  const statusRaw = item.status || user.status;
  const status: 'active' | 'inactive' =
    statusRaw === 'inactive' || statusRaw === 'deactive' || statusRaw === 'banned' ? 'inactive' : 'active';

  return {
    id,
    playerName,
    email: item.email || user.email || '',
    status,
    joinedAt: item.joinedAt || item.createdAt || '',
    totalEarnings: item.totalEarnings ?? item.earnings ?? 0,
    totalDeposits: item.totalDeposits ?? 0,
    depositCount: item.depositCount ?? 0,
    lastCommissionAt: item.lastCommissionAt ?? null,
  };
};

export const mapApiCommissionItem = (item: ApiReferralCommissionItem): ReferralCommissionItem => ({
  id: item.id || item._id || '',
  playerName: item.referredUsername || item.referredEmail || 'Unknown Player',
  depositAmount: item.depositAmount ?? 0,
  commissionRate: item.commissionRate ?? 0,
  commissionAmount: item.commissionAmount ?? 0,
  depositSource: item.depositSource || 'manual',
  createdAt: item.createdAt || '',
});

export const formatReferralDate = (date: string) =>
  date ? fDateTime(date, 'DD/MM/YYYY hh:mm a') : 'N/A';

export const getDepositSourceLabel = (source: string) => {
  if (source === 'admin') return 'Admin';
  if (source === 'coingo') return 'Auto';
  return 'Manual';
};
