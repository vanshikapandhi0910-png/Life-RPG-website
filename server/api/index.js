const app = require('../index');
const connectDB = require('../config/db');

let databaseReady;

function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = connectDB();
  }

  return databaseReady;
}

module.exports = async (req, res) => {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  await ensureDatabase();
  return app(req, res);
};
