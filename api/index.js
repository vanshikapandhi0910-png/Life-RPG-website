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

  await ensureDatabase();
  return app(req, res);
};
