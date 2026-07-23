import { connectDb } from './db/connect.js';
import { seedFeedPosts } from './seed-feed-posts.js';

await connectDb();
await seedFeedPosts();
process.exit(0);
