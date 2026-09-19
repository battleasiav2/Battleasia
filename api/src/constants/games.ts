export type PlatformGameSeed = {
  name: string;
  packageName: string;
  idPrefix: string;
  image: string;
  logo: string;
  rules: string;
};

/** Same 5 titles as home / play UI */
export const PLATFORM_GAMES: PlatformGameSeed[] = [
  {
    name: 'PUBG Mobile',
    packageName: 'com.tencent.ig',
    idPrefix: 'PUBG',
    image: '/covers/pubg.webp',
    logo: '/covers/pubg.webp',
    rules: 'Standard PUBG Mobile tournament rules apply.',
  },
  {
    name: 'Free Fire',
    packageName: 'com.dts.freefireth',
    idPrefix: 'FF',
    image: '/covers/freefire.webp',
    logo: '/covers/freefire.webp',
    rules: 'Free Fire tournament rules — same match flow as PUBG (room ID, entry fee, results).',
  },
  {
    name: 'Call of Duty Mobile',
    packageName: 'com.activision.callofduty.shooter',
    idPrefix: 'COD',
    image: '/covers/cod.webp',
    logo: '/covers/cod.webp',
    rules: 'COD Mobile tournament rules — same match create / join system as PUBG.',
  },
  {
    name: 'Valorant Mobile',
    packageName: 'com.riotgames.valorant',
    idPrefix: 'VAL',
    image: '/covers/valorant.webp',
    logo: '/covers/valorant.webp',
    rules: 'Valorant tournament rules — same match create / join system as PUBG.',
  },
  {
    name: 'Mobile Legends',
    packageName: 'com.mobilelegends',
    idPrefix: 'ML',
    image: '/covers/mlbb.webp',
    logo: '/covers/mlbb.webp',
    rules: 'Mobile Legends tournament rules — same match create / join system as PUBG.',
  },
];
