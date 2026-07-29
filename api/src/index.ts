import { env } from './config/env.js';
import { connectDb } from './db/connect.js';
import { createApp, createSocketServer } from './app.js';
import { User } from './models/User.js';
import { setSocketServer } from './utils/socket.js';
import bcrypt from 'bcryptjs';

async function ensureAdminUser() {
  const email = env.adminEmail.toLowerCase();
  let admin =
    (await User.findOne({ email })) ||
    (await User.findOne({ username: env.adminUsername }));
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);

  if (!admin) {
    await User.create({
      email,
      username: env.adminUsername,
      password: passwordHash,
      status: true,
      emailVerified: true,
      balance: 0,
      role: { type: 'admin', name: 'Admin', permissions: [] },
    });
    console.log(`Seeded admin user: ${env.adminEmail}`);
    return;
  }

  admin.email = email;
  admin.username = env.adminUsername;
  admin.status = true;
  admin.emailVerified = true;
  if (admin.role?.type !== 'admin') {
    admin.role = { type: 'admin', name: 'Admin', permissions: admin.role?.permissions || [] };
  }
  if (env.syncAdminPassword) {
    admin.password = passwordHash;
    console.log('Admin password synced from env (SYNC_ADMIN_PASSWORD=true)');
  }
  await admin.save();
}

async function main() {
  await connectDb();
  await ensureAdminUser();

  const app = createApp();
  const { httpServer, io } = createSocketServer(app);
  setSocketServer(io);

  httpServer.listen(env.port, () => {
    console.log(`BattleAsia API running on http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
