const Storage = require('../config/storageEngine');
const { computeQuestRewards, applyLevelUp, evaluateStreak } = require('../utils/rpgEngine');

exports.getQuests = async (req, res) => {
  try {
    const quests = Storage.getQuestsByUser(req.userId);
    return res.json({ quests });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving quests.' });
  }
};

exports.createQuest = async (req, res) => {
  try {
    const { title, notes, type, difficulty, attribute, priority, dueDate, subtasks, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Quest title is required.' });
    }

    const quest = Storage.createQuest({
      userId: req.userId,
      title: title.trim(),
      notes: notes || '',
      type: ['daily', 'habit', 'todo', 'epic'].includes(type) ? type : 'todo',
      difficulty: ['TRIVIAL', 'EASY', 'MEDIUM', 'HARD', 'LEGENDARY'].includes(difficulty?.toUpperCase())
        ? difficulty.toUpperCase()
        : 'MEDIUM',
      attribute: ['STR', 'INT', 'AGI', 'VIT', 'CHA', 'SPI'].includes(attribute?.toUpperCase())
        ? attribute.toUpperCase()
        : 'STR',
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority?.toUpperCase())
        ? priority.toUpperCase()
        : 'MEDIUM',
      dueDate: dueDate || null,
      subtasks: Array.isArray(subtasks) ? subtasks.map((s, idx) => ({ id: `sub_${idx}_${Date.now()}`, text: s.text || s, completed: !!s.completed })) : [],
      tags: Array.isArray(tags) ? tags : []
    });

    Storage.logActivity(req.userId, 'QUEST_CREATED', `New Quest charted: "${quest.title}" [${quest.difficulty} ${quest.attribute}]`);

    return res.status(201).json({ message: 'Quest created!', quest });
  } catch (error) {
    console.error('Create quest error:', error);
    return res.status(500).json({ message: 'Failed to create quest.' });
  }
};

exports.updateQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes, type, difficulty, attribute, priority, dueDate, subtasks, tags } = req.body;

    const existing = Storage.findQuestById(id, req.userId);
    if (!existing) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    const updates = {};
    if (title && title.trim()) updates.title = title.trim();
    if (notes !== undefined) updates.notes = notes;
    if (type) updates.type = type;
    if (difficulty) updates.difficulty = difficulty.toUpperCase();
    if (attribute) updates.attribute = attribute.toUpperCase();
    if (priority) updates.priority = priority.toUpperCase();
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (subtasks !== undefined) updates.subtasks = subtasks;
    if (tags !== undefined) updates.tags = tags;

    const updatedQuest = Storage.updateQuest(id, req.userId, updates);
    return res.json({ message: 'Quest updated!', quest: updatedQuest });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update quest.' });
  }
};

exports.deleteQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const success = Storage.deleteQuest(id, req.userId);
    if (!success) {
      return res.status(404).json({ message: 'Quest not found or already deleted.' });
    }
    return res.json({ message: 'Quest abandoned/removed from ledger.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete quest.' });
  }
};

exports.completeQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const quest = Storage.findQuestById(id, req.userId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found.' });
    }

    if (quest.completed && quest.type !== 'habit') {
      return res.status(400).json({ message: 'Quest is already completed.' });
    }

    const user = Storage.findUserById(req.userId);
    const allItems = Storage.getAllItems();
    
    // Evaluate rewards
    let rewards = computeQuestRewards(user, quest, allItems);

    // Check for active Buffs (e.g. Double XP)
    let activeBuffs = [...(user.activeBuffs || [])];
    const doubleXpIndex = activeBuffs.findIndex(b => b.type === 'DOUBLE_XP' && b.remainingQuests > 0);
    if (doubleXpIndex !== -1) {
      rewards.xpGained *= 2;
      activeBuffs[doubleXpIndex].remainingQuests -= 1;
      if (activeBuffs[doubleXpIndex].remainingQuests <= 0) {
        activeBuffs.splice(doubleXpIndex, 1);
      }
    }

    // Apply Level Up & Progression
    const levelUpData = applyLevelUp(user, rewards.xpGained);

    // Update Attributes
    const currentAttr = user.attributes || { STR: 10, INT: 10, AGI: 10, VIT: 10, CHA: 10, SPI: 10 };
    const newAttrValue = Number(((currentAttr[rewards.attribute] || 10) + rewards.statGain).toFixed(1));
    const updatedAttributes = {
      ...currentAttr,
      [rewards.attribute]: newAttrValue
    };

    // Update Streak
    const updatedStreak = evaluateStreak(user.lastActiveDate, user.streak || 0);

    // Mana and HP capping
    const newMana = Math.min(levelUpData.maxMana, (user.mana || 50) + rewards.manaGained);
    const newHp = Math.min(levelUpData.maxHp, (user.hp || 100));

    // Update User
    const updatedUser = Storage.updateUser(user._id, {
      level: levelUpData.level,
      xp: levelUpData.xp,
      maxXp: levelUpData.maxXp,
      title: levelUpData.title,
      maxHp: levelUpData.maxHp,
      hp: newHp,
      maxMana: levelUpData.maxMana,
      mana: newMana,
      gold: (user.gold || 0) + rewards.goldGained,
      gems: (user.gems || 0) + rewards.gemsGained,
      streak: updatedStreak,
      lastActiveDate: new Date().toISOString(),
      attributes: updatedAttributes,
      activeBuffs,
      completedQuestsCount: (user.completedQuestsCount || 0) + 1
    });

    // Mark Quest Completed
    let updatedQuest;
    if (quest.type === 'habit') {
      updatedQuest = Storage.updateQuest(id, req.userId, {
        habitCounter: (quest.habitCounter || 0) + 1,
        completedAt: new Date().toISOString()
      });
    } else {
      updatedQuest = Storage.updateQuest(id, req.userId, {
        completed: true,
        completedAt: new Date().toISOString(),
        streak: (quest.streak || 0) + 1
      });
    }

    // Deal damage to Active World Boss
    let bossDamageReport = null;
    const activeBoss = Storage.getActiveBoss();
    if (activeBoss && activeBoss.currentHp > 0) {
      let damageDealt = rewards.bossDamage;
      if (activeBoss.weakness === quest.attribute) {
        damageDealt = Math.round(damageDealt * 1.5); // 50% Weakness crit!
      }
      const newBossHp = Math.max(0, activeBoss.currentHp - damageDealt);
      const isDefeated = newBossHp === 0;

      Storage.updateBoss(activeBoss._id, {
        currentHp: newBossHp,
        active: !isDefeated
      });

      bossDamageReport = {
        bossName: activeBoss.name,
        damageDealt,
        isCrit: activeBoss.weakness === quest.attribute,
        remainingHp: newBossHp,
        totalHp: activeBoss.totalHp,
        isDefeated
      };

      if (isDefeated) {
        // Grant bonus boss defeat loot to user
        Storage.updateUser(user._id, {
          gold: (updatedUser.gold || 0) + activeBoss.rewardGold,
          gems: (updatedUser.gems || 0) + activeBoss.rewardGems
        });
        Storage.logActivity(user._id, 'BOSS_DEFEATED', `Vanquished Boss: ${activeBoss.name}! Earned +${activeBoss.rewardGold} Gold & +${activeBoss.rewardGems} Gems!`);
      }
    }

    Storage.logActivity(
      req.userId,
      'QUEST_COMPLETED',
      `Completed "${quest.title}" (+${rewards.xpGained} XP, +${rewards.goldGained} Gold, +${rewards.statGain} ${rewards.attribute})`
    );

    const { passwordHash, ...safeUser } = updatedUser;

    return res.json({
      message: 'Quest Completed! Victory!',
      rewards,
      levelUp: levelUpData.didLevelUp ? {
        newLevel: levelUpData.level,
        levelsGained: levelUpData.levelsGained,
        newTitle: levelUpData.title
      } : null,
      bossReport: bossDamageReport,
      user: safeUser,
      quest: updatedQuest
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    return res.status(500).json({ message: 'Error processing quest completion.' });
  }
};

exports.revertQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const quest = Storage.findQuestById(id, req.userId);
    if (!quest) return res.status(404).json({ message: 'Quest not found.' });

    const updatedQuest = Storage.updateQuest(id, req.userId, {
      completed: false,
      completedAt: null
    });

    return res.json({ message: 'Quest returned to active ledger.', quest: updatedQuest });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revert quest.' });
  }
};

exports.habitAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body; // 'positive' or 'negative'

    const quest = Storage.findQuestById(id, req.userId);
    if (!quest || quest.type !== 'habit') {
      return res.status(400).json({ message: 'Habit not found.' });
    }

    if (direction === 'positive') {
      return exports.completeQuest(req, res);
    } else {
      // Negative habit penalty
      const user = Storage.findUserById(req.userId);
      const damagePenalty = 10;
      const newHp = Math.max(1, (user.hp || 100) - damagePenalty);
      
      const updatedUser = Storage.updateUser(user._id, { hp: newHp });
      const updatedQuest = Storage.updateQuest(id, req.userId, {
        habitCounter: (quest.habitCounter || 0) - 1
      });

      Storage.logActivity(req.userId, 'HABIT_PENALTY', `Negative impulse recorded for "${quest.title}" (-${damagePenalty} HP)`);

      const { passwordHash, ...safeUser } = updatedUser;
      return res.json({
        message: `Habit negative trigger. Lost ${damagePenalty} HP!`,
        damage: damagePenalty,
        user: safeUser,
        quest: updatedQuest
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error executing habit action.' });
  }
};
