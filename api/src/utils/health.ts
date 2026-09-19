import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { getHighValueThreshold } from './high-value.js';

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export type HealthStatus = {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  uptimeSec: number;
  timestamp: string;
  checks: {
    database: 'ok' | 'down';
    replica: 'ok' | 'standalone' | 'unknown';
  };
};

export type LastBackupStamp = {
  at: string;
  file: string;
  encrypted: boolean;
  uploaded: boolean;
};

export type OpsStatus = {
  health: 'ok' | 'degraded' | 'down';
  replica: boolean;
  replicaSet: string | null;
  fcmConfigured: boolean;
  sentryConfigured: boolean;
  backupEncryptConfigured: boolean;
  backupOffsiteConfigured: boolean;
  lastBackup: LastBackupStamp | null;
  highValueWithdrawBac: number;
};

function readLastBackup(): LastBackupStamp | null {
  const stampPath = path.join(API_ROOT, 'backups', '.last.json');
  if (!existsSync(stampPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(stampPath, 'utf8')) as LastBackupStamp;
    if (!parsed?.at || !parsed?.file) return null;
    return {
      at: String(parsed.at),
      file: String(parsed.file),
      encrypted: Boolean(parsed.encrypted),
      uploaded: Boolean(parsed.uploaded),
    };
  } catch {
    return null;
  }
}

async function inspectDatabase(): Promise<{
  database: HealthStatus['checks']['database'];
  replica: HealthStatus['checks']['replica'];
  replicaSet: string | null;
}> {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return { database: 'down', replica: 'unknown', replicaSet: null };
    }
    await mongoose.connection.db.admin().ping();
    const hello = (await mongoose.connection.db.admin().command({ hello: 1 })) as { setName?: string };
    const replicaSet = typeof hello.setName === 'string' && hello.setName ? hello.setName : null;
    return { database: 'ok', replica: replicaSet ? 'ok' : 'standalone', replicaSet };
  } catch {
    return { database: 'down', replica: 'unknown', replicaSet: null };
  }
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const { database, replica } = await inspectDatabase();
  return {
    status: database === 'ok' ? 'ok' : 'down',
    service: 'battleasia-api',
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: { database, replica },
  };
}

export async function getOpsStatus(): Promise<OpsStatus> {
  const inspect = await inspectDatabase();
  let highValueWithdrawBac = 1000;
  try {
    highValueWithdrawBac = await getHighValueThreshold();
  } catch {
    /* keep default */
  }
  return {
    health: inspect.database === 'ok' ? 'ok' : 'down',
    replica: inspect.replica === 'ok',
    replicaSet: inspect.replicaSet,
    fcmConfigured: Boolean(process.env.FCM_SERVER_KEY),
    sentryConfigured: Boolean(process.env.SENTRY_DSN),
    backupEncryptConfigured: Boolean(process.env.BACKUP_ENCRYPT_PASSPHRASE),
    backupOffsiteConfigured: Boolean(process.env.BACKUP_S3_ACCESS_KEY || process.env.BACKUP_OFFSITE_CMD),
    lastBackup: readLastBackup(),
    highValueWithdrawBac,
  };
}
