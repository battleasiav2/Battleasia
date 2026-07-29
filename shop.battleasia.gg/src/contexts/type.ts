export type RegisterData = {
  email: string;
  password: string;
  username: string;
  countryCode: string;
  mobileNo: string;
  pubgId: string;
  gameServer: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type ApiContextType = {
  // auth
  initialize: () => Promise<any>;
  registerApi: (data: RegisterData) => Promise<any>;
  loginApi: (data: LoginData) => Promise<any>;
  // shop
  listShopItemsApi: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    type?: string;
  }) => Promise<any>;
  getShopItemApi: (id: string) => Promise<any>;
  getCurrencyRatesApi: () => Promise<any>;
  // coingo collection
  startCoingoCollectionApi: (data: { email: string; amount: number; walletNumber: string; walletType: string }) => Promise<any>;
  getCoingoCollectionStatusApi: (merchantSerialNo: string) => Promise<any>;
  // coingo payout
  createCoingoPayoutApi: (data: {
    amount: number;
    walletNumber: string;
    walletType: string;
    description?: string;
    email?: string;
    username?: string;
    currency_type?: string;
    currency_amount?: number;
  }) => Promise<any>;
  getCoingoPayoutStatusApi: (merchantSerialNo: string) => Promise<any>;
  // balance history
  getBalanceHistoryApi: (params?: { page?: number; limit?: number }) => Promise<any>;
  // payment channels
  getPaymentChannelsApi: (params?: { page?: number; limit?: number }) => Promise<any>;
  // business wallets
  getBusinessWalletsApi: (params?: { page?: number; limit?: number; channel?: string; currency?: string }) => Promise<any>;
  // deposit history
  submitDepositApi: (data: {
    user_email: string;
    username: string;
    transaction_id: string;
    coin_amount: number;
    payment_currency: string;
    payment_amount: number;
    from_address: string;
    payment_channel: string;
    to_wallet_address: string;
  }) => Promise<any>;
  // withdrawal history
  submitWithdrawalApi: (data: {
    user_email: string;
    username: string;
    coin_amount: number;
    wallet_type: string;
    wallet_address: string;
    currency_type: string;
    currency_amount: number;
    description?: string;
    notes?: string;
  }) => Promise<any>;
  getWithdrawableAmountApi: () => Promise<any>;
  // Get withdrawal/deposit details by ID
  getWithdrawalByIdApi: (id: string) => Promise<any>;
  getDepositByIdApi: (id: string) => Promise<any>;
};

