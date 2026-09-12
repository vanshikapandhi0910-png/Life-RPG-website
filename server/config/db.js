const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/realmquest';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
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
  }
};

module.exports = connectDB;
