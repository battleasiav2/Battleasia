import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS || '';
  const defaults = [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://battleasia.local:8080',
    'http://shop.battleasia.local:8080',
    'http://admin.battleasia.local:8080',
    'http://battleasia.local:8088',
    'http://shop.battleasia.local:8088',
    'http://admin.battleasia.local:8088',
  ];
  const fromEnv = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : defaults;
}

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

if (isProduction) {
  if (!process.env.JWT_SECRET || jwtSecret === 'dev-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a strong random value in production');
  }
  if (!process.env.ADMIN_PASSWORD || adminPassword === 'Admin@123456') {
    throw new Error('ADMIN_PASSWORD must be changed from the default in production');
  }
}

export const env = {
  isProduction,
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/battleasia',
  jwtSecret,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@battleasia.local',
  adminPassword,
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  corsOrigins: parseCorsOrigins(),
  syncAdminPassword: process.env.SYNC_ADMIN_PASSWORD === 'true',
  coingoMock: process.env.COINGO_MOCK === 'true' && !isProduction,
  logAuthCodes: process.env.LOG_AUTH_CODES === 'true',
  appUrl: process.env.APP_URL || '',
  cdnUrl: process.env.CDN_URL || '',
};
