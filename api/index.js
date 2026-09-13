const app = require('../server');
const connectDB = require('../server/config/db');

let databaseReady;

function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = connectDB();
  }

  return databaseReady;
}

module.exports = async (req, res) => {
  // Vercel may remove the /api prefix before invoking the function.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  try {
    await ensureDatabase();
    await app.initializeAssets();
  } catch (error) {
    console.error('[Database] Vercel database initialization failed:', error.message);
    const missingDatabaseUrl = error.message.includes('MONGODB_URI is required');
    return res.status(503).json({
      message: missingDatabaseUrl
        ? 'The API database is not configured. Set MONGODB_URI in the Vercel Production environment variables, then redeploy.'
        : 'The API could not connect to MongoDB. Check MONGODB_URI, Atlas Network Access, and database credentials.'
    });
  }

  return app(req, res);
};
