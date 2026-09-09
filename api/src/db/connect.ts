import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { restoreDump } from '../restore-dump.js';

let mongodInstance: any = null;

export async function connectDb() {
  mongoose.set('strictQuery', true);

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 8_000,
    maxPoolSize: 20,
  };

  if (env.mongoUri.startsWith('mongodb+srv://')) {
    options.tls = true;
  }

  try {
    console.log(`[DB] Attempting connection to ${env.mongoUri}...`);
    await mongoose.connect(env.mongoUri, options);
    console.log(`MongoDB connected: ${env.mongoUri}`);
  } catch (error: any) {
    console.warn(`[DB Warning] Failed to connect to ${env.mongoUri}: ${error.message}`);
    console.log(`[DB] Starting embedded MongoDB server via MongoMemoryServer...`);

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    // Windows ARM has no official mongod aarch64 build; use x64 under emulation.
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'battleasia',
      },
      binary: {
        version: '7.0.14',
        arch: 'x64',
      },
    });

    const memoryUri = mongodInstance.getUri();
    console.log(`[DB] Embedded MongoDB started at ${memoryUri}`);

    await mongoose.connect(memoryUri, { maxPoolSize: 20 });
    console.log(`[DB] Connected to embedded MongoDB successfully.`);

    // Check if db needs restoring from a local mongodump (optional).
    const collections = await mongoose.connection.db?.listCollections().toArray();
    if (!collections || collections.length === 0) {
      const dumpCandidates = [
        process.env.MONGO_DUMP_PATH,
        new URL('../../db/mongo/battleasia', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
        `${process.cwd()}/backups/battleasia-all-seed-20260906-145755/mongo/battleasia`,
        `${process.cwd()}/backups/battleasia-demo-20260906-144120/mongo/battleasia`,
      ].filter(Boolean) as string[];

      const { existsSync } = await import('node:fs');
      const dumpPath = dumpCandidates.find((p) => existsSync(p));
      if (dumpPath) {
        console.log(`[DB] Database is empty. Restoring dump from ${dumpPath}...`);
        await restoreDump(dumpPath);
      } else {
        console.log('[DB] Database is empty and no local mongodump was found; continuing with empty DB.');
      }
    }
  }
}
