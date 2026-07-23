import { connectDb } from './db/connect.js';
import { seedDemoUser } from './seed-demo-user.js';
await connectDb();
await seedDemoUser();
process.exit(0);
