import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  currencyIcon: string;
  auth: {
    method: 'jwt' | 'amplify' | 'firebase' | 'supabase' | 'auth0';
    skip: boolean;
    redirectPath: string;
  };
};

// ----------------------------------------------------------------------

// In dev, use same-origin `/api` proxy so mobile/LAN testing works on any host.
function resolveServerUrl() {
  if (import.meta.env.DEV) {
    return '';
  }
  return import.meta.env.VITE_SERVER_URL ?? '';
}

function resolveAssetsDir() {
  const cdn = import.meta.env.VITE_CDN_URL ?? '';
  const assets = import.meta.env.VITE_ASSETS_DIR ?? '';
  if (cdn) return cdn.replace(/\/$/, '');
  return assets;
}

export const CONFIG: ConfigValue = {
  appName: 'BattleAsia',
  appVersion: packageJson.version,
  serverUrl: resolveServerUrl(),
  assetsDir: resolveAssetsDir(),
  currencyIcon: "/assets/images/currency.webp",
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
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