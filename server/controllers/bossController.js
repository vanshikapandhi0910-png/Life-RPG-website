const Storage = require('../config/storageEngine');

exports.getActiveBoss = async (req, res) => {
  try {
    let boss = Storage.getActiveBoss();
    if (!boss) {
      // Re-activate first boss if defeated
      const bosses = Storage.readDB ? Storage.readDB().bosses : [];
      if (bosses.length > 0) {
        boss = Storage.updateBoss(bosses[0]._id, { active: true, currentHp: bosses[0].totalHp });
      }
    }
    return res.json({ boss });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving world raid boss.' });
  }
};

exports.getBossLeaderboard = async (req, res) => {
  try {
    const db = Storage.readDB ? Storage.readDB() : { users: [] };
    const leaderboard = (db.users || [])
      .map(u => ({
        username: u.username,
        level: u.level,
        characterClass: u.characterClass,
        completedQuestsCount: u.completedQuestsCount || 0,
        title: u.title
      }))
      .sort((a, b) => b.level - a.level || b.completedQuestsCount - a.completedQuestsCount)
      .slice(0, 10);

    return res.json({ leaderboard });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving leaderboard.' });
  }
};
