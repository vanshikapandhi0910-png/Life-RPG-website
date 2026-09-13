require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Storage = require('./config/storageEngine');
const { DEFAULT_ITEMS, DEFAULT_BOSSES } = require('./config/seedData');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    realm: 'Aetheria: RealmQuest',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    message: 'An unexpected catastrophe occurred in the realm.',
    error: err.message
  });
});

async function initializeAssets() {
  await Storage.seedItems(DEFAULT_ITEMS);
  await Storage.seedBosses(DEFAULT_BOSSES);
}

// Boot server
async function startServer() {
  await connectDB();
  await initializeAssets();
  app.listen(PORT, () => {
    console.log(`⚔️  RealmQuest Life RPG API Server running on port ${PORT}`);
    console.log(`🏰  API Base URL: http://localhost:${PORT}/api`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.initializeAssets = initializeAssets;
