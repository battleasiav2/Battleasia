import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCipheriv, randomBytes, scryptSync } from 'node:crypto';
import dotenv from 'dotenv';
import { putBackupObject } from './s3-put.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env') });
const OUT_ROOT = path.join(ROOT, 'backups');
const KEEP_LOCAL = 7;
const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/battleasia';
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dumpDir = path.join(OUT_ROOT, `mongo-${stamp}`);
const tarName = path.join(OUT_ROOT, `mongo-${stamp}.tgz`);

mkdirSync(OUT_ROOT, { recursive: true });
execFileSync('mongodump', [`--uri=${uri}`, `--out=${dumpDir}`], { stdio: 'inherit' });
execFileSync('tar', ['-czf', tarName, '-C', dumpDir, '.'], { stdio: 'inherit' });

const passphrase = process.env.BACKUP_ENCRYPT_PASSPHRASE || '';
let artifact = tarName;
if (passphrase) {
  const iv = randomBytes(12);
  const key = scryptSync(passphrase, 'battleasia-backup', 32);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plain = readFileSync(tarName);
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  const encPath = `${tarName}.enc`;
  writeFileSync(encPath, Buffer.concat([iv, tag, enc]));
  rmSync(tarName, { force: true });
  artifact = encPath;
}

let uploaded = false;
try {
  uploaded = Boolean(await putBackupObject(artifact, path.basename(artifact)));
  if (uploaded) console.log('off-site S3/R2 upload ok');
} catch (error) {
  console.warn('[backup] S3 upload skipped/failed:', error instanceof Error ? error.message : error);
}

const offsite = process.env.BACKUP_OFFSITE_CMD;
if (offsite) {
  execFileSync(process.env.ComSpec || 'cmd', ['/c', offsite.split('{file}').join(artifact)], { stdio: 'inherit' });
  uploaded = true;
}

const dumps = readdirSync(OUT_ROOT)
  .filter((name) => name.startsWith('mongo-') && (name.endsWith('.tgz') || name.endsWith('.enc')))
  .map((name) => ({ name, time: statSync(path.join(OUT_ROOT, name)).mtimeMs }))
  .sort((a, b) => b.time - a.time);
for (const extra of dumps.slice(KEEP_LOCAL)) {
  rmSync(path.join(OUT_ROOT, extra.name), { force: true });
}

if (existsSync(dumpDir)) rmSync(dumpDir, { recursive: true, force: true });
writeFileSync(
  path.join(OUT_ROOT, '.last.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      file: path.basename(artifact),
      encrypted: artifact.endsWith('.enc'),
      uploaded,
    },
    null,
    2
  )
);
console.log(`backup ready: ${artifact}`);
