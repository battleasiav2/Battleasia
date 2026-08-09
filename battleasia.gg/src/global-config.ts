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
  /** Home "About" headline figures — overridable via env, no code change needed. */
  homeStats: {
    activePlayers: string;
    prizeMoney: string;
    gamesSupported: string;
    tournaments: string;
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

// Headline About figures. Set VITE_STAT_* in env to override without a rebuild
// of the code; sensible marketing defaults keep the section looking strong.
function resolveHomeStats(): ConfigValue['homeStats'] {
  const env = import.meta.env;
  return {
    activePlayers: env.VITE_STAT_ACTIVE_PLAYERS ?? '500K+',
    prizeMoney: env.VITE_STAT_PRIZE_MONEY ?? '$2M+',
    gamesSupported: env.VITE_STAT_GAMES_SUPPORTED ?? '15+',
    tournaments: env.VITE_STAT_TOURNAMENTS ?? '24/7',
  };
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
  homeStats: resolveHomeStats(),

};

// ----------------------------------------------------------------------

export const GAME_SERVERS = [
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'south-america', label: 'South America' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'krjp', label: 'KRJP' },
];