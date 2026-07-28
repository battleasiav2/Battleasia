import { connectDb } from './db/connect.js';
import { seedDashboardData } from './seed-dashboard-data.js';

await connectDb();
await seedDashboardData();
process.exit(0);
