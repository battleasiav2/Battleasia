export type IShopItemRow = {
  id: string;
  _id: string;
  amount: number;
  badge: 'Popular' | 'New' | 'Hot' | 'Best' | 'None';
  price: number;
  originalPrice: number;
  discountPercent: number;
  symbol: string;
  paymentOptions: ('bkash' | 'nagad' | 'crypto')[];
  image: string;
  isActive?: boolean;
  status?: 'available' | 'soldout';
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ICoinRate = {
  id: string;
  _id: string;
  region: 'global' | 'bangladesh' | 'india' | 'pakistan';
  currency: string;
  rate: number;
  isActive?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};
