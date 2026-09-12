// RPG Progression Engine & Math Utilities

const DIFFICULTY_CONFIG = {
  TRIVIAL: { xp: 15, gold: 5, stat: 0.5, bossDamage: 15 },
  EASY: { xp: 30, gold: 12, stat: 1, bossDamage: 30 },
  MEDIUM: { xp: 65, gold: 25, stat: 2, bossDamage: 65 },
  HARD: { xp: 140, gold: 55, stat: 4, bossDamage: 150 },
  LEGENDARY: { xp: 300, gold: 130, stat: 8, bossDamage: 350, gems: 2 }
};

const CLASS_BONUSES = {
  WARRIOR: { primaryStat: 'STR', desc: 'Berserker Force: +20% Boss Damage & +10% STR gain', bossDmgMult: 1.2, statBonus: 'STR' },
  MAGE: { primaryStat: 'INT', desc: 'Arcane Surge: +15% XP & +10% INT gain', xpMult: 1.15, statBonus: 'INT' },
  ROGUE: { primaryStat: 'AGI', desc: 'Fortune Shadow: +25% Gold Loot & +10% AGI gain', goldMult: 1.25, statBonus: 'AGI' },
  PALADIN: { primaryStat: 'VIT', desc: 'Aegis Guardian: +25 Max HP & +10% VIT gain', hpBonus: 25, statBonus: 'VIT' },
  ALCHEMIST: { primaryStat: 'SPI', desc: 'Philosopher Catalyst: Bonus Gem Drop chance & +10% SPI gain', gemChance: 0.25, statBonus: 'SPI' },
  BARD: { primaryStat: 'CHA', desc: 'Inspiring Ballad: +10% All Rewards & +10% CHA gain', allMult: 1.1, statBonus: 'CHA' }
};

// Calculate required XP for a given level using non-linear curve
function getMaxXpForLevel(level) {
  return Math.floor(120 * Math.pow(level, 1.6));
}

// Calculate title based on level
function getTitleForLevel(level, charClass) {
  const titles = [
    { level: 1, title: 'Novice Adventurer' },
    { level: 5, title: 'Apprentice Seeker' },
    { level: 10, title: 'Seasoned Wanderer' },
    { level: 15, title: 'Guild Champion' },
    { level: 20, title: 'Hero of the Realm' },
    { level: 30, title: 'Mythic Vanguard' },
    { level: 40, title: 'Aether Ascendant' },
    { level: 50, title: 'Immortal Legend' }
  ];
  const found = [...titles].reverse().find(t => level >= t.level);
  return found ? found.title : 'Legendary Sovereign';
}

// Check streak continuity
function evaluateStreak(lastActiveDate, currentStreak) {
  if (!lastActiveDate) return 1;
  const now = new Date();
  const last = new Date(lastActiveDate);

  // Set to midnight UTC
  const nowDateOnly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const lastDateOnly = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));

  const diffDays = Math.round((nowDateOnly - lastDateOnly) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today, streak remains same or minimum 1
    return Math.max(1, currentStreak);
  } else if (diffDays === 1) {
    // Active yesterday, consecutive day!
    return currentStreak + 1;
  } else {
    // Streak broken, restart at 1
    return 1;
  }
}

// Calculate equipment stat bonuses
function getEquippedBonuses(user, allItems = []) {
  const bonus = { STR: 0, INT: 0, AGI: 0, VIT: 0, CHA: 0, SPI: 0, xpMult: 1, goldMult: 1, dmgBonus: 0 };
  if (!user.equipped) return bonus;

  Object.values(user.equipped).forEach(itemId => {
    if (!itemId) return;
    const item = allItems.find(i => i._id === itemId || i.id === itemId);
    if (item && item.stats) {
      if (item.stats.STR) bonus.STR += item.stats.STR;
      if (item.stats.INT) bonus.INT += item.stats.INT;
      if (item.stats.AGI) bonus.AGI += item.stats.AGI;
      if (item.stats.VIT) bonus.VIT += item.stats.VIT;
      if (item.stats.CHA) bonus.CHA += item.stats.CHA;
      if (item.stats.SPI) bonus.SPI += item.stats.SPI;
      if (item.stats.xpBonus) bonus.xpMult += item.stats.xpBonus / 100;
      if (item.stats.goldBonus) bonus.goldMult += item.stats.goldBonus / 100;
      if (item.stats.damage) bonus.dmgBonus += item.stats.damage;
    }
  });

  return bonus;
}

// Process Quest Completion Calculation
function computeQuestRewards(user, quest, allItems = []) {
  const diffKey = (quest.difficulty || 'MEDIUM').toUpperCase();
  const base = DIFFICULTY_CONFIG[diffKey] || DIFFICULTY_CONFIG.MEDIUM;
  const userClass = CLASS_BONUSES[user.characterClass] || CLASS_BONUSES.WARRIOR;
  const equipBonus = getEquippedBonuses(user, allItems);

  // Streak Multiplier: +5% per streak day up to +50%
  const streakMultiplier = 1 + Math.min(0.5, (user.streak || 0) * 0.05);

  // Class Multipliers
  const classXpMult = userClass.xpMult || 1;
  const classGoldMult = userClass.goldMult || 1;
  const classAllMult = userClass.allMult || 1;
  const classDmgMult = userClass.bossDmgMult || 1;

  // Calculate final XP
  const xpGained = Math.round(base.xp * streakMultiplier * classXpMult * classAllMult * equipBonus.xpMult);
  
  // Calculate final Gold
  const goldGained = Math.round(base.gold * streakMultiplier * classGoldMult * classAllMult * equipBonus.goldMult);

  // Stat point growth
  const attrKey = quest.attribute || 'STR';
  let statGain = base.stat;
  if (userClass.statBonus === attrKey) {
    statGain *= 1.2; // 20% class affinity bonus
  }

  // Boss damage dealt
  let bossDamage = Math.round((base.bossDamage + equipBonus.dmgBonus + (user.attributes?.STR || 10) * 0.5) * classDmgMult);

  // Mana restored
  const manaGained = Math.min(15, Math.round(10 + (user.attributes?.SPI || 10) * 0.2));

  // Gem drops
  let gemsGained = base.gems || 0;
  if (userClass.gemChance && Math.random() < userClass.gemChance) {
    gemsGained += 1;
  }

  return {
    xpGained,
    goldGained,
    gemsGained,
    statGain: Number(statGain.toFixed(1)),
    attribute: attrKey,
    bossDamage,
    manaGained
  };
}

// Apply level-up checks and updates
function applyLevelUp(user, addedXp) {
  let currentLevel = user.level || 1;
  let currentXp = (user.xp || 0) + addedXp;
  let maxXp = user.maxXp || getMaxXpForLevel(currentLevel);
  let levelsGained = 0;

  while (currentXp >= maxXp) {
    currentXp -= maxXp;
    currentLevel += 1;
    levelsGained += 1;
    maxXp = getMaxXpForLevel(currentLevel);
  }

  const updatedTitle = getTitleForLevel(currentLevel, user.characterClass);
  const maxHp = 100 + (currentLevel - 1) * 15 + ((user.attributes?.VIT || 10) * 3);
  const maxMana = 50 + (currentLevel - 1) * 8 + ((user.attributes?.INT || 10) * 2);

  return {
    level: currentLevel,
    xp: currentXp,
    maxXp,
    levelsGained,
    title: updatedTitle,
    maxHp,
    maxMana,
    didLevelUp: levelsGained > 0
  };
}

module.exports = {
  DIFFICULTY_CONFIG,
  CLASS_BONUSES,
  getMaxXpForLevel,
  getTitleForLevel,
  evaluateStreak,
  getEquippedBonuses,
  computeQuestRewards,
  applyLevelUp
};
