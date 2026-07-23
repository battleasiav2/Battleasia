import mongoose from 'mongoose';
export async function getHealthStatus() {
    let database = 'down';
    try {
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
            database = 'ok';
        }
    }
    catch {
        database = 'down';
    }
    const status = database === 'ok' ? 'ok' : 'down';
    return {
        status,
        service: 'battleasia-api',
        uptimeSec: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: { database },
    };
}
