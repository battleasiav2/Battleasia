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
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'battleasia',
      },
    });

    const memoryUri = mongodInstance.getUri();
    console.log(`[DB] Embedded MongoDB started at ${memoryUri}`);

    await mongoose.connect(memoryUri, { maxPoolSize: 20 });
    console.log(`[DB] Connected to embedded MongoDB successfully.`);

    // Check if db needs restoring
    const collections = await mongoose.connection.db?.listCollections().toArray();
    if (!collections || collections.length === 0) {
      console.log(`[DB] Database is empty. Restoring dump from db/mongo/battleasia...`);
      await restoreDump('c:/Users/Acer/Desktop/Battleasia/db/mongo/battleasia');
    }
  }
}
