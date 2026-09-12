const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Storage = require('../config/storageEngine');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { evaluateStreak } = require('../utils/rpgEngine');

exports.register = async (req, res) => {
  try {
    const { username, email, password, characterClass, avatar } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check existing
    const existingUser = Storage.findUserByEmail(email) || Storage.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const validClass = ['WARRIOR', 'MAGE', 'ROGUE', 'PALADIN', 'ALCHEMIST', 'BARD'].includes(characterClass?.toUpperCase())
      ? characterClass.toUpperCase()
      : 'WARRIOR';

    const newUser = Storage.createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      characterClass: validClass,
      avatar: avatar || 'warrior_default'
    });

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '14d' });

    // Seed introductory quests for immediate dopamine loop!
    const introQuests = [
      {
        userId: newUser._id,
        title: 'Awaken Your Inner Hero',
        notes: 'Explore your character HUD and learn about attributes and stats.',
        type: 'todo',
        difficulty: 'EASY',
        attribute: 'SPI',
        priority: 'HIGH'
      },
      {
        userId: newUser._id,
        title: 'Conquer the First Trial: Drink 2L Water',
        notes: 'Stay hydrated to boost vitality and endurance.',
        type: 'daily',
        difficulty: 'EASY',
        attribute: 'VIT',
        priority: 'MEDIUM'
      },
      {
        userId: newUser._id,
        title: 'Deep Focus Session (25 min)',
        notes: 'Complete a focused work or study sprint with zero distractions.',
        type: 'daily',
        difficulty: 'MEDIUM',
        attribute: 'INT',
        priority: 'HIGH'
      },
      {
        userId: newUser._id,
        title: 'Combat Training: Pushups / Stretch',
        notes: 'Physical activity to bolster physical strength.',
        type: 'habit',
        difficulty: 'EASY',
        attribute: 'STR',
        priority: 'MEDIUM'
      }
    ];

    introQuests.forEach(q => Storage.createQuest(q));

    Storage.logActivity(newUser._id, 'ACCOUNT_CREATED', `Hero ${newUser.username} of class ${validClass} has entered the realm!`);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Hero created successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    const user = Storage.findUserByEmail(emailOrUsername) || Storage.findUserByUsername(emailOrUsername);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. No hero found with that name.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Evaluate streak on login
    const updatedStreak = evaluateStreak(user.lastActiveDate, user.streak || 0);
    const updatedUser = Storage.updateUser(user._id, {
      streak: updatedStreak,
      lastActiveDate: new Date().toISOString()
    });

    const token = jwt.sign({ userId: updatedUser._id }, JWT_SECRET, { expiresIn: '14d' });
    const { passwordHash, ...safeUser } = updatedUser;

    return res.json({
      message: 'Welcome back, Hero!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = Storage.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ensure streak is up-to-date
    const updatedStreak = evaluateStreak(user.lastActiveDate, user.streak || 0);
    const updatedUser = Storage.updateUser(user._id, {
      streak: updatedStreak,
      lastActiveDate: new Date().toISOString()
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({ user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { characterClass, activeTheme, title, avatar } = req.body;
    const updates = {};

    if (characterClass && ['WARRIOR', 'MAGE', 'ROGUE', 'PALADIN', 'ALCHEMIST', 'BARD'].includes(characterClass.toUpperCase())) {
      updates.characterClass = characterClass.toUpperCase();
    }
    if (activeTheme) updates.activeTheme = activeTheme;
    if (title) updates.title = title;
    if (avatar) updates.avatar = avatar;

    const updatedUser = Storage.updateUser(req.userId, updates);
    const { passwordHash, ...safeUser } = updatedUser;

    return res.json({ message: 'Profile updated!', user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile.' });
  }
};

exports.castSpell = async (req, res) => {
  try {
    const { spellType } = req.body;
    const user = Storage.findUserById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const SPELLS = {
      CLARITY_BURST: { cost: 20, name: 'Clarity Burst', effect: 'Heals 35 HP instantly' },
      FOCUSED_RUSH: { cost: 30, name: 'Focused Rush', effect: 'Doubles XP for next completed quest' },
      ASTRAL_SHIELD: { cost: 40, name: 'Astral Shield', effect: 'Protects streak from resetting' }
    };

    const spell = SPELLS[spellType];
    if (!spell) return res.status(400).json({ message: 'Unknown spell formula.' });

    if ((user.mana || 0) < spell.cost) {
      return res.status(400).json({ message: `Insufficient Mana! Needs ${spell.cost} MP.` });
    }

    let updates = {
      mana: Math.max(0, (user.mana || 0) - spell.cost)
    };

    let resultMsg = `Cast ${spell.name}!`;

    if (spellType === 'CLARITY_BURST') {
      const maxHp = user.maxHp || 100;
      updates.hp = Math.min(maxHp, (user.hp || 100) + 35);
      resultMsg += ' Restored 35 HP!';
    } else if (spellType === 'FOCUSED_RUSH') {
      updates.activeBuffs = [...(user.activeBuffs || []), { type: 'DOUBLE_XP', remainingQuests: 2 }];
      resultMsg += ' +100% XP bonus active for your next 2 quests!';
    } else if (spellType === 'ASTRAL_SHIELD') {
      updates.activeBuffs = [...(user.activeBuffs || []), { type: 'STREAK_SHIELD', charges: 1 }];
      resultMsg += ' Streak Shield activated!';
    }

    const updated = Storage.updateUser(req.userId, updates);
    Storage.logActivity(req.userId, 'SPELL_CAST', resultMsg);

    const { passwordHash, ...safeUser } = updated;
    return res.json({ message: resultMsg, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cast spell.' });
  }
};
