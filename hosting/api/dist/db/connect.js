import mongoose from 'mongoose';
import { env } from '../config/env.js';
export async function connectDb() {
    mongoose.set('strictQuery', true);
    const options = {
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 20,
    };
    if (env.mongoUri.startsWith('mongodb+srv://')) {
        options.tls = true;
    }
    await mongoose.connect(env.mongoUri, options);
    const host = env.mongoUri.includes('@')
        ? env.mongoUri.split('@')[1]?.split('/')[0]
        : 'local';
    console.log(`MongoDB connected: ${host}`);
}
