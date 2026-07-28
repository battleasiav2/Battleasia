import { connectDb } from './db/connect.js';
import { seedSocialContent } from './seed-social-content.js';

await connectDb();
await seedSocialContent();
process.exit(0);
