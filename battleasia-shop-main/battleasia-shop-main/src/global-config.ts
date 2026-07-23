import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  currencyIcon: string;
  headerCurrencyIcon: string;
  auth: {
    method: 'jwt' | 'amplify' | 'firebase' | 'supabase' | 'auth0';
    skip: boolean;
    redirectPath: string;
  };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'BattleAsia',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
  assetsDir: (import.meta.env.VITE_CDN_URL || import.meta.env.VITE_ASSETS_DIR || '').replace(/\/$/, ''),
  currencyIcon: '/assets/images/currency.webp',
  headerCurrencyIcon: '/assets/images/currency.webp',
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.user.shop,
  },

};

// ----------------------------------------------------------------------

export const GAME_SERVERS = [
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'south-america', label: 'South America' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'krjp', label: 'KRJP' },
];

export const PAYMENT_OPTIONS = ['bkash', 'nagad', 'crypto'] as const;
export const PAYMENT_META: Record<
    (typeof PAYMENT_OPTIONS)[number],
    { label: string; imgurl: string; helper?: string; color?: string }
> = {
    bkash: { label: 'BKash', imgurl: '/assets/images/bkash.png', color: '#e2116e' },
    nagad: { label: 'Nagad', imgurl: '/assets/images/nagad.png', color: '#f6921e' },
    crypto: { label: 'Crypto (USDT)', imgurl: '/assets/images/usdt.png', color: '#50af95' },
};
// -