const STORAGE_KEY = 'realmquest_local_state';
const TOKEN_KEY = 'realmquest_token';

const DEFAULT_ITEMS = [
  { _id: 'ember-blade', name: 'Ember Blade', type: 'weapon', slot: 'weapon', price: 80, currency: 'gold', bonus: { STR: 3 } },
  { _id: 'aether-helm', name: 'Aether Helm', type: 'armor', slot: 'armor', price: 100, currency: 'gold', bonus: { VIT: 3 } },
  { _id: 'focus-crystal', name: 'Focus Crystal', type: 'accessory', slot: 'accessory', price: 5, currency: 'gems', bonus: { INT: 4 } },
  { _id: 'healing-potion', name: 'Healing Potion', type: 'potion', price: 25, currency: 'gold', effect: { type: 'HEAL_HP', amount: 50 } },
  { _id: 'mana-potion', name: 'Mana Potion', type: 'potion', price: 25, currency: 'gold', effect: { type: 'RESTORE_MANA', amount: 40 } }
];

const DEFAULT_QUESTS = [
  ['Awaken Your Inner Hero', 'Explore your character HUD and learn about attributes and stats.', 'todo', 'EASY', 'SPI', 'HIGH'],
  ['Conquer the First Trial: Drink 2L Water', 'Stay hydrated to boost vitality and endurance.', 'daily', 'EASY', 'VIT', 'MEDIUM'],
  ['Deep Focus Session (25 min)', 'Complete a focused work or study sprint with zero distractions.', 'daily', 'MEDIUM', 'INT', 'HIGH'],
  ['Combat Training: Pushups / Stretch', 'Physical activity to bolster physical strength.', 'habit', 'EASY', 'STR', 'MEDIUM']
];

const DEFAULT_BOSS = { _id: 'aether-wyrm', name: 'Aether Wyrm', active: true, currentHp: 1000, totalHp: 1000, weakness: 'INT', rewardGold: 100, rewardGems: 3 };

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { users: [], quests: [], logs: [], items: DEFAULT_ITEMS, boss: DEFAULT_BOSS };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function currentUser(state) {
  const token = localStorage.getItem(TOKEN_KEY);
  return state.users.find(user => user._id === token) || null;
}

function safeUser(user) {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
}

function requireUser(state) {
  const user = currentUser(state);
  if (!user) throw new Error('Your local session has expired. Please play the demo again.');
  return user;
}

function makeUser(payload) {
  const timestamp = new Date().toISOString();
  return {
    _id: id('hero'), username: payload.username.trim(), email: payload.email.trim().toLowerCase(), password: payload.password,
    createdAt: timestamp, updatedAt: timestamp, level: 1, xp: 0, maxXp: 120, gold: 50, gems: 5,
    hp: 100, maxHp: 100, mana: 50, maxMana: 50, streak: 0, lastActiveDate: timestamp,
    characterClass: payload.characterClass || 'WARRIOR', title: 'Novice Adventurer',
    attributes: { STR: 10, INT: 10, AGI: 10, VIT: 10, CHA: 10, SPI: 10 },
    equipped: { weapon: null, armor: null, accessory: null, pet: null }, inventory: [],
    unlockedThemes: ['cyberpunk', 'retro-dungeon', 'dark-fantasy', 'celestial', 'cozy-tavern'],
    activeTheme: 'cyberpunk', activeBuffs: [], completedQuestsCount: 0
  };
}

function createIntroQuests(userId) {
  return DEFAULT_QUESTS.map(([title, notes, type, difficulty, attribute, priority]) => ({
    _id: id('quest'), userId, title, notes, type, difficulty, attribute, priority,
    completed: false, completedAt: null, streak: 0, habitCounter: 0, subtasks: [], tags: []
  }));
}

function updateUser(state, userId, updates) {
  const index = state.users.findIndex(user => user._id === userId);
  state.users[index] = { ...state.users[index], ...updates, updatedAt: new Date().toISOString() };
  return state.users[index];
}

function addLog(state, userId, action, details) {
  state.logs.unshift({ _id: id('log'), userId, action, details, timestamp: new Date().toISOString() });
}

function rewardFor(quest, user) {
  const xpGained = { TRIVIAL: 10, EASY: 20, MEDIUM: 35, HARD: 60, LEGENDARY: 100 }[quest.difficulty] || 20;
  return { xpGained, goldGained: xpGained, gemsGained: quest.difficulty === 'LEGENDARY' ? 2 : 0, statGain: 0.2, attribute: quest.attribute, manaGained: 5, bossDamage: xpGained };
}

export const api = {
  register: async (payload) => {
    const state = loadState();
    if (state.users.some(user => user.email === payload.email.trim().toLowerCase() || user.username.toLowerCase() === payload.username.trim().toLowerCase())) throw new Error('User with this email or username already exists.');
    const user = makeUser(payload);
    state.users.push(user); state.quests.push(...createIntroQuests(user._id)); addLog(state, user._id, 'ACCOUNT_CREATED', `Hero ${user.username} entered the realm!`); saveState(state);
    localStorage.setItem(TOKEN_KEY, user._id);
    return { message: 'Hero created successfully!', token: user._id, user: safeUser(user) };
  },
  login: async ({ emailOrUsername, password }) => {
    const state = loadState();
    const user = state.users.find(candidate => (candidate.email === emailOrUsername.toLowerCase() || candidate.username.toLowerCase() === emailOrUsername.toLowerCase()) && candidate.password === password);
    if (!user) throw new Error('Invalid credentials. No hero found with those details.');
    localStorage.setItem(TOKEN_KEY, user._id); return { message: 'Welcome back, Hero!', token: user._id, user: safeUser(user) };
  },
  getMe: async () => ({ user: safeUser(requireUser(loadState())) }),
  updateProfile: async (updates) => { const state = loadState(); const user = updateUser(state, requireUser(state)._id, updates); saveState(state); return { user: safeUser(user) }; },
  castSpell: async (spellType) => { const state = loadState(); const user = requireUser(state); const costs = { CLARITY_BURST: 20, FOCUSED_RUSH: 30, ASTRAL_SHIELD: 40 }; const cost = costs[spellType]; if (!cost || user.mana < cost) throw new Error('Insufficient Mana.'); const updates = { mana: user.mana - cost }; if (spellType === 'CLARITY_BURST') updates.hp = Math.min(user.maxHp, user.hp + 35); if (spellType === 'FOCUSED_RUSH') updates.activeBuffs = [...user.activeBuffs, { type: 'DOUBLE_XP', remainingQuests: 2 }]; const updated = updateUser(state, user._id, updates); saveState(state); return { message: 'Spell cast!', user: safeUser(updated) }; },
  getQuests: async () => { const state = loadState(); const user = requireUser(state); return { quests: state.quests.filter(quest => quest.userId === user._id) }; },
  createQuest: async (payload) => { const state = loadState(); const user = requireUser(state); const quest = { _id: id('quest'), userId: user._id, title: payload.title.trim(), notes: payload.notes || '', type: payload.type || 'todo', difficulty: payload.difficulty || 'MEDIUM', attribute: payload.attribute || 'STR', priority: payload.priority || 'MEDIUM', completed: false, completedAt: null, streak: 0, habitCounter: 0, subtasks: payload.subtasks || [], tags: payload.tags || [] }; state.quests.unshift(quest); saveState(state); return { quest }; },
  updateQuest: async (questId, updates) => { const state = loadState(); const user = requireUser(state); const quest = state.quests.find(item => item._id === questId && item.userId === user._id); Object.assign(quest, updates); saveState(state); return { quest }; },
  deleteQuest: async (questId) => { const state = loadState(); const user = requireUser(state); state.quests = state.quests.filter(quest => !(quest._id === questId && quest.userId === user._id)); saveState(state); return { message: 'Quest removed.' }; },
  completeQuest: async (questId) => { const state = loadState(); const user = requireUser(state); const quest = state.quests.find(item => item._id === questId && item.userId === user._id); const rewards = rewardFor(quest, user); const xp = user.xp + rewards.xpGained; const level = xp >= user.maxXp ? user.level + 1 : user.level; const updated = updateUser(state, user._id, { xp: level > user.level ? xp - user.maxXp : xp, level, gold: user.gold + rewards.goldGained, gems: user.gems + rewards.gemsGained, mana: Math.min(user.maxMana, user.mana + rewards.manaGained), completedQuestsCount: user.completedQuestsCount + 1 }); Object.assign(quest, { completed: quest.type !== 'habit', completedAt: new Date().toISOString(), habitCounter: quest.type === 'habit' ? quest.habitCounter + 1 : quest.habitCounter }); saveState(state); return { rewards, user: safeUser(updated), quest, levelUp: level > user.level ? { newLevel: level, levelsGained: 1, newTitle: updated.title } : null }; },
  revertQuest: async (questId) => { const state = loadState(); const user = requireUser(state); const quest = state.quests.find(item => item._id === questId && item.userId === user._id); Object.assign(quest, { completed: false, completedAt: null }); saveState(state); return { quest }; },
  habitAction: async (questId, direction) => direction === 'positive' ? api.completeQuest(questId) : api.updateQuest(questId, { habitCounter: 0 }),
  getShop: async () => ({ items: loadState().items }),
  buyItem: async (itemId) => { const state = loadState(); const user = requireUser(state); const item = state.items.find(entry => entry._id === itemId); const cost = item.currency === 'gems' ? 'gems' : 'gold'; if (user[cost] < item.price) throw new Error(`Insufficient ${cost}.`); const inventory = [...user.inventory, { itemId: item._id, name: item.name, type: item.type, quantity: 1, itemData: item }]; const updated = updateUser(state, user._id, { [cost]: user[cost] - item.price, inventory }); saveState(state); return { user: safeUser(updated), boughtItem: item }; },
  equipItem: async (itemId, slot) => { const state = loadState(); const user = requireUser(state); const updated = updateUser(state, user._id, { equipped: { ...user.equipped, [slot]: itemId } }); saveState(state); return { user: safeUser(updated) }; },
  unequipItem: async (slot) => { const state = loadState(); const user = requireUser(state); const equipped = { ...user.equipped, [slot]: null }; const updated = updateUser(state, user._id, { equipped }); saveState(state); return { user: safeUser(updated) }; },
  usePotion: async (itemId) => { const state = loadState(); const user = requireUser(state); const item = state.items.find(entry => entry._id === itemId); const updates = {}; if (item.effect?.type === 'HEAL_HP') updates.hp = Math.min(user.maxHp, user.hp + item.effect.amount); if (item.effect?.type === 'RESTORE_MANA') updates.mana = Math.min(user.maxMana, user.mana + item.effect.amount); const updated = updateUser(state, user._id, updates); saveState(state); return { user: safeUser(updated), message: `Consumed ${item.name}!` }; },
  getActiveBoss: async () => ({ boss: loadState().boss }),
  getBossLeaderboard: async () => ({ leaderboard: loadState().users.map(user => ({ username: user.username, level: user.level, characterClass: user.characterClass, completedQuestsCount: user.completedQuestsCount || 0, title: user.title })).sort((a, b) => b.level - a.level).slice(0, 10) }),
  getPlayerOverview: async () => { const state = loadState(); const user = requireUser(state); const quests = state.quests.filter(quest => quest.userId === user._id); return { overview: { totalQuests: quests.length, completedQuests: quests.filter(quest => quest.completed).length, completionRate: quests.length ? Math.round(quests.filter(quest => quest.completed).length / quests.length * 100) : 0, streak: user.streak, level: user.level, xp: user.xp, maxXp: user.maxXp, gold: user.gold, gems: user.gems, characterClass: user.characterClass, title: user.title, baseAttributes: user.attributes, effectiveAttributes: user.attributes, equipBonus: {}, categoryStats: {}, recentLogs: state.logs.filter(log => log.userId === user._id).slice(0, 15) } } }
};
