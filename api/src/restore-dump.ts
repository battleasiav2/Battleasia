import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { BSON } from 'mongodb';
import { env } from './config/env.js';

export async function restoreDump(dumpDir: string, shouldDisconnect = false) {
  let isStandalone = false;
  if (mongoose.connection.readyState !== 1) {
    console.log(`[Import] Connecting to ${env.mongoUri}...`);
    await mongoose.connect(env.mongoUri);
    isStandalone = true;
  }

  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection failed');

  const files = fs.readdirSync(dumpDir).filter((f) => f.endsWith('.bson'));
  console.log(`[Import] Found ${files.length} collection BSON files in ${dumpDir}`);

  for (const file of files) {
    const colName = file.replace('.bson', '');
    const filePath = path.join(dumpDir, file);
    const buf = fs.readFileSync(filePath);
    if (buf.length === 0) continue;

    const docs: any[] = [];
    let offset = 0;
    while (offset < buf.length) {
      const size = buf.readInt32LE(offset);
      if (size <= 0 || offset + size > buf.length) break;
      const docBuf = buf.subarray(offset, offset + size);
      docs.push(BSON.deserialize(docBuf));
      offset += size;
    }

    if (docs.length > 0) {
      const col = db.collection(colName);
      await col.deleteMany({});
      await col.insertMany(docs);
      console.log(`[Import] Restored ${docs.length} documents into '${colName}'`);
    }
  }

  console.log('[Import] MongoDB database restore complete!');
  if (isStandalone || shouldDisconnect) {
    await mongoose.disconnect();
  }
}

if (process.argv[1]?.endsWith('restore-dump.ts') || process.argv[1]?.endsWith('restore-dump.js')) {
  const targetDir = process.argv[2] || 'c:/Users/Acer/Desktop/Battleasia/db/mongo/battleasia';
  restoreDump(targetDir, true).catch((err) => {
    console.error('[Import Error]', err);
    process.exit(1);
  });
}
