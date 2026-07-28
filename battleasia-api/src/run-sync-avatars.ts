import { connectDb } from './db/connect.js';
import { ensurePlayerProfileAvatars } from './seed-dashboard-data.js';

await connectDb();
console.log('Syncing bot/demo profile avatars...');
await ensurePlayerProfileAvatars();
process.exit(0);
