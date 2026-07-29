import { Game } from '../models/Game.js';
import { PLATFORM_GAMES } from '../constants/games.js';

/** Upsert all platform games — playable, match-create enabled (admin uses same form as PUBG). */
export async function ensurePlatformGames() {
  const games = [];

  for (const seed of PLATFORM_GAMES) {
    const game = await Game.findOneAndUpdate(
      { packageName: seed.packageName },
      {
        $set: {
          name: seed.name,
          packageName: seed.packageName,
          idPrefix: seed.idPrefix,
          image: seed.image,
          logo: seed.logo,
          rules: seed.rules,
          status: true,
          comingSoon: false,
          canCreateChallenge: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    games.push(game);
    console.log(`  Game ready: ${seed.name} (${seed.idPrefix})`);
  }

  return games;
}
