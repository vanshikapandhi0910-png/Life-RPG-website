const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const questController = require('../controllers/questController');
const shopController = require('../controllers/shopController');
const bossController = require('../controllers/bossController');
const statsController = require('../controllers/statsController');

// --- AUTH & PROFILE ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.patch('/auth/profile', authMiddleware, authController.updateProfile);
router.post('/auth/cast-spell', authMiddleware, authController.castSpell);

// --- QUESTS CRUD & PROGRESSION ---
router.get('/quests', authMiddleware, questController.getQuests);
router.post('/quests', authMiddleware, questController.createQuest);
router.put('/quests/:id', authMiddleware, questController.updateQuest);
router.delete('/quests/:id', authMiddleware, questController.deleteQuest);
router.post('/quests/:id/complete', authMiddleware, questController.completeQuest);
router.post('/quests/:id/revert', authMiddleware, questController.revertQuest);
router.post('/quests/:id/habit-action', authMiddleware, questController.habitAction);

// --- SHOP & INVENTORY ---
router.get('/shop', authMiddleware, shopController.getShopCatalog);
router.post('/shop/buy', authMiddleware, shopController.buyItem);
router.post('/shop/equip', authMiddleware, shopController.equipItem);
router.post('/shop/unequip', authMiddleware, shopController.unequipItem);
router.post('/shop/use-potion', authMiddleware, shopController.usePotion);

// --- WORLD BOSS RAIDS ---
router.get('/boss/active', authMiddleware, bossController.getActiveBoss);
router.get('/boss/leaderboard', authMiddleware, bossController.getBossLeaderboard);

// --- ANALYTICS & STATS ---
router.get('/stats/overview', authMiddleware, statsController.getPlayerOverview);

module.exports = router;
