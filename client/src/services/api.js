const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getAuthHeader() {
  const token = localStorage.getItem('realmquest_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error(`Unable to reach the RealmQuest API at ${API_BASE}. Check VITE_API_URL, server availability, and CORS settings.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  castSpell: (spellType) => request('/auth/cast-spell', { method: 'POST', body: JSON.stringify({ spellType }) }),

  // Quests
  getQuests: () => request('/quests'),
  createQuest: (payload) => request('/quests', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuest: (id, payload) => request(`/quests/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteQuest: (id) => request(`/quests/${id}`, { method: 'DELETE' }),
  completeQuest: (id) => request(`/quests/${id}/complete`, { method: 'POST' }),
  revertQuest: (id) => request(`/quests/${id}/revert`, { method: 'POST' }),
  habitAction: (id, direction) => request(`/quests/${id}/habit-action`, { method: 'POST', body: JSON.stringify({ direction }) }),

  // Shop & Inventory
  getShop: () => request('/shop'),
  buyItem: (itemId) => request('/shop/buy', { method: 'POST', body: JSON.stringify({ itemId }) }),
  equipItem: (itemId, slot) => request('/shop/equip', { method: 'POST', body: JSON.stringify({ itemId, slot }) }),
  unequipItem: (slot) => request('/shop/unequip', { method: 'POST', body: JSON.stringify({ slot }) }),
  usePotion: (itemId) => request('/shop/use-potion', { method: 'POST', body: JSON.stringify({ itemId }) }),

  // Boss Raids
  getActiveBoss: () => request('/boss/active'),
  getBossLeaderboard: () => request('/boss/leaderboard'),

  // Stats & Analytics
  getPlayerOverview: () => request('/stats/overview')
};
