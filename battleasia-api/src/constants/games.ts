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
    image: '/assets/images/games/art/pubg-mobile.png',
    logo: '/assets/images/games/art/pubg-mobile.png',
    rules: 'Standard PUBG Mobile tournament rules apply.',
  },
  {
    name: 'Free Fire',
    packageName: 'com.dts.freefireth',
    idPrefix: 'FF',
    image: '/assets/images/games/art/free-fire.png',
    logo: '/assets/images/games/art/free-fire.png',
    rules: 'Free Fire tournament rules — same match flow as PUBG (room ID, entry fee, results).',
  },
  {
    name: 'Call of Duty Mobile',
    packageName: 'com.activision.callofduty.shooter',
    idPrefix: 'COD',
    image: '/assets/images/games/art/cod-mobile.png',
    logo: '/assets/images/games/art/cod-mobile.png',
    rules: 'COD Mobile tournament rules — same match create / join system as PUBG.',
  },
  {
    name: 'Valorant Mobile',
    packageName: 'com.riotgames.valorant',
    idPrefix: 'VAL',
    image: '/assets/images/games/art/valorant.png',
    logo: '/assets/images/games/art/valorant.png',
    rules: 'Valorant tournament rules — same match create / join system as PUBG.',
  },
  {
    name: 'Mobile Legends',
    packageName: 'com.mobilelegends',
    idPrefix: 'ML',
    image: '/assets/images/games/art/mobile-legends.png',
    logo: '/assets/images/games/art/mobile-legends.png',
    rules: 'Mobile Legends tournament rules — same match create / join system as PUBG.',
  },
];
