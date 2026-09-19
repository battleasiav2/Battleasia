import { execFileSync } from 'node:child_process';
import { createDecipheriv, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') });
const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/battleasia';
const artifact = process.argv[2];
if (!artifact) {
  console.error('Usage: node scripts/restore-mongo.mjs <mongo-YYYY-MM-DD.tgz[.enc]>');
  process.exit(1);
}
const abs = path.resolve(artifact);
if (!existsSync(abs)) {
  console.error(`Missing file: ${abs}`);
  process.exit(1);
}

const work = mkdtempSync(path.join(tmpdir(), 'ba-restore-'));
let tgz = abs;
if (abs.endsWith('.enc')) {
  const passphrase = process.env.BACKUP_ENCRYPT_PASSPHRASE || '';
  if (!passphrase) {
    console.error('BACKUP_ENCRYPT_PASSPHRASE required for .enc dumps');
    process.exit(1);
  }
  const buf = readFileSync(abs);
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const key = scryptSync(passphrase, 'battleasia-backup', 32);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  tgz = path.join(work, 'dump.tgz');
  writeFileSync(tgz, Buffer.concat([decipher.update(data), decipher.final()]));
}

const extract = path.join(work, 'mongo');
mkdirSync(extract, { recursive: true });
execFileSync('tar', ['-xzf', tgz, '-C', extract], { stdio: 'inherit' });
execFileSync('mongorestore', [`--uri=${uri}`, '--drop', extract], { stdio: 'inherit' });
rmSync(work, { recursive: true, force: true });
console.log('restore complete');
