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
  // Opt-in: e-mail delivery has to be configured before a second factor can be
  // required, otherwise admins get locked out of the panel.
  adminLoginOtp: process.env.ADMIN_LOGIN_OTP === 'true',
  appUrl: process.env.APP_URL || '',
  cdnUrl: process.env.CDN_URL || '',
  // Fallback SMTP — used when mail settings are not filled in from the admin panel.
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'BattleAsia',
    fromEmail: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  },
};
