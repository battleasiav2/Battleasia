import { connectDb } from './db/connect.js';
import { ensurePlatformGames } from './utils/ensure-games.js';
import { seedPerGameDemoMatches } from './seed-demo-user.js';

await connectDb();
console.log('Upserting platform games...');
const games = await ensurePlatformGames();
console.log('Seeding one demo match per game...');
await seedPerGameDemoMatches(games);
console.log('Done — 5 games ready with demo matches.');
process.exit(0);
