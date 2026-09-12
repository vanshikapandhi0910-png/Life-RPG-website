const jwt = require('jsonwebtoken');
const Storage = require('../config/storageEngine');

const JWT_SECRET = process.env.JWT_SECRET || 'realmquest_super_secure_jwt_secret_key_2026_rpg';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await Storage.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User session expired or not found.' });
    }

    // Exclude passwordHash from user object
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

module.exports = {
  authMiddleware,
  JWT_SECRET
};
