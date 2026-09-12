const Storage = require('../config/storageEngine');

exports.getShopCatalog = async (req, res) => {
  try {
    const items = Storage.getAllItems();
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: 'Error loading shop items.' });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = Storage.findUserById(req.userId);
    const item = Storage.findItemById(itemId);

    if (!user || !item) {
      return res.status(404).json({ message: 'Item or User not found.' });
    }

    // Check inventory duplicate for non-consumable
    const userInventory = user.inventory || [];
    const isConsumable = item.type === 'potion' || item.type === 'consumable';
    const alreadyOwns = userInventory.some(i => i.itemId === item._id || i.itemId === item.id);

    if (!isConsumable && alreadyOwns) {
      return res.status(400).json({ message: 'You already own this unique relic!' });
    }

    // Check currency
    if (item.currency === 'gems' || item.gems) {
      const requiredGems = item.gems || item.price;
      if ((user.gems || 0) < requiredGems) {
        return res.status(400).json({ message: `Insufficient Gems! Need ${requiredGems} Gems.` });
      }
    } else {
      if ((user.gold || 0) < item.price) {
        return res.status(400).json({ message: `Insufficient Gold! Need ${item.price} Gold.` });
      }
    }

    // Deduct cost
    let newGold = user.gold || 0;
    let newGems = user.gems || 0;

    if (item.gems) {
      newGems -= item.gems;
    }
    if (item.price && item.currency !== 'gems') {
      newGold -= item.price;
    }

    let updatedInventory = [...userInventory];
    if (isConsumable) {
      const existingStack = updatedInventory.find(i => i.itemId === item._id);
      if (existingStack) {
        existingStack.quantity = (existingStack.quantity || 1) + 1;
      } else {
        updatedInventory.push({ itemId: item._id, name: item.name, type: item.type, quantity: 1, itemData: item });
      }
    } else {
      updatedInventory.push({ itemId: item._id, name: item.name, type: item.type, quantity: 1, itemData: item });
    }

    const updatedUser = Storage.updateUser(user._id, {
      gold: newGold,
      gems: newGems,
      inventory: updatedInventory
    });

    Storage.logActivity(req.userId, 'ITEM_BOUGHT', `Purchased "${item.name}" for ${item.price} ${item.currency || 'Gold'}`);

    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({
      message: `Acquired ${item.name}! Added to your armory.`,
      user: safeUser,
      boughtItem: item
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error purchasing item.' });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const { itemId, slot } = req.body; // slot: 'weapon', 'armor', 'accessory', 'pet'
    const user = Storage.findUserById(req.userId);
    const item = Storage.findItemById(itemId);

    if (!user || !item) {
      return res.status(404).json({ message: 'Item or User not found.' });
    }

    const validSlots = ['weapon', 'armor', 'accessory', 'pet'];
    const targetSlot = slot || item.type;

    if (!validSlots.includes(targetSlot)) {
      return res.status(400).json({ message: 'Invalid equipment slot.' });
    }

    // Verify ownership
    const ownsItem = (user.inventory || []).some(i => i.itemId === item._id || i.itemId === item.id);
    if (!ownsItem) {
      return res.status(400).json({ message: 'You do not own this item.' });
    }

    const equipped = {
      ...(user.equipped || {}),
      [targetSlot]: item._id
    };

    const updatedUser = Storage.updateUser(user._id, { equipped });
    Storage.logActivity(req.userId, 'ITEM_EQUIPPED', `Equipped ${item.name} into ${targetSlot} slot.`);

    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({
      message: `Equipped ${item.name}!`,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error equipping item.' });
  }
};

exports.unequipItem = async (req, res) => {
  try {
    const { slot } = req.body;
    const user = Storage.findUserById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const equipped = { ...(user.equipped || {}) };
    delete equipped[slot];

    const updatedUser = Storage.updateUser(user._id, { equipped });
    const { passwordHash, ...safeUser } = updatedUser;

    return res.json({ message: `Unequipped slot: ${slot}`, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error unequipping item.' });
  }
};

exports.usePotion = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = Storage.findUserById(req.userId);
    const item = Storage.findItemById(itemId);

    if (!user || !item) return res.status(404).json({ message: 'Item not found.' });

    const inventory = [...(user.inventory || [])];
    const invIndex = inventory.findIndex(i => i.itemId === item._id || i.itemId === item.id);

    if (invIndex === -1 || (inventory[invIndex].quantity || 0) <= 0) {
      return res.status(400).json({ message: 'You do not have any charges of this potion!' });
    }

    // Consume 1 charge
    inventory[invIndex].quantity -= 1;
    if (inventory[invIndex].quantity <= 0) {
      inventory.splice(invIndex, 1);
    }

    let updates = { inventory };
    let msg = `Consumed ${item.name}!`;

    if (item.effect?.type === 'HEAL_HP') {
      const maxHp = user.maxHp || 100;
      updates.hp = Math.min(maxHp, (user.hp || 100) + (item.effect.amount || 50));
      msg += ` Restored ${item.effect.amount || 50} HP!`;
    } else if (item.effect?.type === 'RESTORE_MANA') {
      const maxMana = user.maxMana || 50;
      updates.mana = Math.min(maxMana, (user.mana || 50) + (item.effect.amount || 40));
      msg += ` Restored ${item.effect.amount || 40} Mana!`;
    } else if (item.effect?.type === 'STREAK_FREEZE') {
      updates.activeBuffs = [...(user.activeBuffs || []), { type: 'STREAK_SHIELD', charges: 1 }];
      msg += ' Streak freeze charge added!';
    }

    const updatedUser = Storage.updateUser(user._id, updates);
    Storage.logActivity(req.userId, 'POTION_USED', msg);

    const { passwordHash, ...safeUser } = updatedUser;
    return res.json({ message: msg, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error using potion.' });
  }
};
