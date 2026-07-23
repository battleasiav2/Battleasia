import bcrypt from 'bcryptjs';
import { connectDb } from './db/connect.js';
import { User } from './models/User.js';
import { Role } from './models/Role.js';
import { env } from './config/env.js';
import { ALL_PERMISSIONS } from './constants/permissions.js';

await connectDb();

const email = env.adminEmail.toLowerCase();
const adminRole =
  (await Role.findOne({ type: 'admin' })) ||
  (await Role.create({
    name: 'Admin',
    description: 'Full system administrator',
    type: 'admin',
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    level: 0,
  }));

const passwordHash = await bcrypt.hash(env.adminPassword, 10);
const allPermissionKeys = ALL_PERMISSIONS.map((p) => p.key);

let admin = await User.findOne({ email });
if (!admin) {
  admin = await User.create({
    email,
    username: env.adminUsername,
    password: passwordHash,
    status: true,
    emailVerified: true,
    balance: 0,
    roleRef: adminRole._id,
    role: {
      type: 'admin',
      name: 'Admin',
      permissions: allPermissionKeys,
    },
  });
  console.log('Created admin user.');
} else {
  admin.password = passwordHash;
  admin.status = true;
  admin.emailVerified = true;
  admin.username = env.adminUsername;
  admin.roleRef = adminRole._id;
  admin.role = {
    type: 'admin',
    name: 'Admin',
    permissions: allPermissionKeys,
  };
  await admin.save();
  console.log('Reset admin user password and role.');
}

console.log('');
console.log('Admin login:');
console.log(`  URL:      http://localhost:3000`);
console.log(`  Email:    ${env.adminEmail}`);
console.log(`  Password: ${env.adminPassword}`);
process.exit(0);
