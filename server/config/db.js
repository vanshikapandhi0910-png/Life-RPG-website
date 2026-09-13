const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return true;
  if (connectionPromise) return connectionPromise;

  const isVercel = process.env.VERCEL === '1';
  const uri = process.env.MONGODB_URI || (isVercel ? null : 'mongodb://127.0.0.1:27017/realmquest');

  if (!uri) {
    throw new Error('MONGODB_URI is required when running on Vercel. Configure a persistent MongoDB Atlas database.');
  }

  connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    }).then(conn => {
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return true;
    }).catch(async error => {
      connectionPromise = null;
    if (isVercel) {
      throw new Error(`Unable to connect to MongoDB on Vercel: ${error.message}`);
    }

    console.warn(`[Database] Direct MongoDB connection failed (${error.message}). Attempting memory database initialization...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Embedded MongoDB Memory Server Started: ${memUri}`);
      return true;
    } catch (memErr) {
      console.error(`[Database] Error starting database engine:`, memErr.message);
      // We will also provide a robust local JSON fallback store if native mongod isn't installed
      return false;
    }
    });

  return connectionPromise;
};

module.exports = connectDB;
