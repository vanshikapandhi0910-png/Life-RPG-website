const Storage = require('../config/storageEngine');
const { getEquippedBonuses } = require('../utils/rpgEngine');

exports.getPlayerOverview = async (req, res) => {
  try {
    const user = Storage.findUserById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const quests = Storage.getQuestsByUser(req.userId);
    const logs = Storage.getUserLogs(req.userId, 15);
    const allItems = Storage.getAllItems();
    const equipBonus = getEquippedBonuses(user, allItems);

    const totalQuests = quests.length;
    const completedQuests = quests.filter(q => q.completed).length;
    const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

    // Attribute Breakdown
    const baseAttrs = user.attributes || { STR: 10, INT: 10, AGI: 10, VIT: 10, CHA: 10, SPI: 10 };
    const effectiveAttrs = {
      STR: Number((baseAttrs.STR + equipBonus.STR).toFixed(1)),
      INT: Number((baseAttrs.INT + equipBonus.INT).toFixed(1)),
      AGI: Number((baseAttrs.AGI + equipBonus.AGI).toFixed(1)),
      VIT: Number((baseAttrs.VIT + equipBonus.VIT).toFixed(1)),
      CHA: Number((baseAttrs.CHA + equipBonus.CHA).toFixed(1)),
      SPI: Number((baseAttrs.SPI + equipBonus.SPI).toFixed(1))
    };

    // Category distribution from quests
    const categoryStats = {
      daily: quests.filter(q => q.type === 'daily').length,
      habit: quests.filter(q => q.type === 'habit').length,
      todo: quests.filter(q => q.type === 'todo').length,
      epic: quests.filter(q => q.type === 'epic').length
    };

    return res.json({
      overview: {
        totalQuests,
        completedQuests,
        completionRate,
        streak: user.streak || 0,
        level: user.level || 1,
        xp: user.xp || 0,
        maxXp: user.maxXp || 120,
        gold: user.gold || 0,
        gems: user.gems || 0,
        characterClass: user.characterClass,
        title: user.title,
        baseAttributes: baseAttrs,
        effectiveAttributes: effectiveAttrs,
        equipBonus,
        categoryStats,
        recentLogs: logs
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error loading player overview stats.' });
  }
};
