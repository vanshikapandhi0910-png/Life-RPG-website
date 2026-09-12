const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'realmquest_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialData = {
  users: [],
  quests: [],
  items: [],
  bosses: [],
  activityLogs: []
};

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return { ...initialData };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading storage engine:', err);
    return { ...initialData };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving storage engine:', err);
  }
}

const Storage = {
  generateId: () => crypto.randomBytes(12).toString('hex'),

  // USERS
  findUserById: (id) => {
    const db = readDB();
    return db.users.find(u => u._id === id || u.id === id) || null;
  },

  findUserByEmail: (email) => {
    const db = readDB();
    return db.users.find(u => u.email?.toLowerCase() === email?.toLowerCase()) || null;
  },

  findUserByUsername: (username) => {
    const db = readDB();
    return db.users.find(u => u.username?.toLowerCase() === username?.toLowerCase()) || null;
  },

  createUser: (userData) => {
    const db = readDB();
    const newUser = {
      _id: Storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      level: 1,
      xp: 0,
      maxXp: 120,
      gold: 50,
      gems: 5,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      streak: 0,
      lastActiveDate: new Date().toISOString(),
      characterClass: userData.characterClass || 'WARRIOR',
      title: 'Novice Adventurer',
      attributes: {
        STR: 10,
        INT: 10,
        AGI: 10,
        VIT: 10,
        CHA: 10,
        SPI: 10,
        ...(userData.attributes || {})
      },
      equipped: {
        weapon: null,
        armor: null,
        accessory: null,
        pet: null
      },
      inventory: [],
      unlockedThemes: ['cyberpunk', 'retro-dungeon', 'dark-fantasy', 'celestial', 'cozy-tavern'],
      activeTheme: 'cyberpunk',
      activeBuffs: [],
      statsHistory: [],
      ...userData
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  },

  updateUser: (id, updates) => {
    const db = readDB();
    const index = db.users.findIndex(u => u._id === id || u.id === id);
    if (index === -1) return null;
    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeDB(db);
    return db.users[index];
  },

  // QUESTS
  getQuestsByUser: (userId) => {
    const db = readDB();
    return db.quests.filter(q => q.userId === userId);
  },

  findQuestById: (questId, userId) => {
    const db = readDB();
    return db.quests.find(q => (q._id === questId || q.id === questId) && q.userId === userId) || null;
  },

  createQuest: (questData) => {
    const db = readDB();
    const newQuest = {
      _id: Storage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      streak: 0,
      habitCounter: 0,
      subtasks: [],
      tags: [],
      priority: 'MEDIUM',
      difficulty: 'MEDIUM',
      attribute: 'STR',
      type: 'daily', // 'daily', 'todo', 'habit', 'epic'
      ...questData
    };
    db.quests.push(newQuest);
    writeDB(db);
    return newQuest;
  },

  updateQuest: (questId, userId, updates) => {
    const db = readDB();
    const index = db.quests.findIndex(q => (q._id === questId || q.id === questId) && q.userId === userId);
    if (index === -1) return null;
    db.quests[index] = {
      ...db.quests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeDB(db);
    return db.quests[index];
  },

  deleteQuest: (questId, userId) => {
    const db = readDB();
    const initialLen = db.quests.length;
    db.quests = db.quests.filter(q => !((q._id === questId || q.id === questId) && q.userId === userId));
    writeDB(db);
    return db.quests.length < initialLen;
  },

  // ITEMS
  getAllItems: () => {
    const db = readDB();
    return db.items;
  },

  findItemById: (itemId) => {
    const db = readDB();
    return db.items.find(i => i._id === itemId || i.id === itemId) || null;
  },

  seedItems: (defaultItems) => {
    const db = readDB();
    if (!db.items || db.items.length === 0) {
      db.items = defaultItems.map(item => ({
        _id: item._id || Storage.generateId(),
        ...item
      }));
      writeDB(db);
    }
  },

  // BOSSES
  getActiveBoss: () => {
    const db = readDB();
    return db.bosses.find(b => b.active) || null;
  },

  updateBoss: (bossId, updates) => {
    const db = readDB();
    const index = db.bosses.findIndex(b => b._id === bossId || b.id === bossId);
    if (index === -1) return null;
    db.bosses[index] = {
      ...db.bosses[index],
      ...updates
    };
    writeDB(db);
    return db.bosses[index];
  },

  seedBosses: (defaultBosses) => {
    const db = readDB();
    if (!db.bosses || db.bosses.length === 0) {
      db.bosses = defaultBosses.map(boss => ({
        _id: boss._id || Storage.generateId(),
        ...boss
      }));
      writeDB(db);
    }
  },

  // ACTIVITY LOGS
  logActivity: (userId, action, details) => {
    const db = readDB();
    const log = {
      _id: Storage.generateId(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.activityLogs.push(log);
    // Keep last 1000 logs
    if (db.activityLogs.length > 1000) {
      db.activityLogs = db.activityLogs.slice(-1000);
    }
    writeDB(db);
    return log;
  },

  getUserLogs: (userId, limit = 20) => {
    const db = readDB();
    return db.activityLogs
      .filter(l => l.userId === userId)
      .slice(-limit)
      .reverse();
  }
};

module.exports = Storage;
